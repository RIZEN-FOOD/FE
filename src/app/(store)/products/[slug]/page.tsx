import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { ProductGallery } from "@/components/store/ProductGallery";
import { PurchasePanel } from "@/components/store/PurchasePanel";
import { ProductDetailSections } from "@/components/store/ProductDetailSections";
import { NutritionFacts, IngredientList } from "@/components/store/NutritionTable";
import { serverApi } from "@/lib/server/api";
import { absoluteUrl } from "@/lib/site";
import type { ProductDetail } from "@/types/product";
import type { ShippingPolicy } from "@/types/shipping";

async function loadProduct(slug: string): Promise<ProductDetail | null> {
  return serverApi.getJson<ProductDetail>(`/api/products/${encodeURIComponent(slug)}`);
}

/**
 * 배송비 정책. 상품 페이지에서 "얼마 더 담으면 무료배송" 을 보여주는 데 쓴다.
 * ★ 금액을 코드에 적지 않는다 — shipping_policy 에서 읽는다 (CLAUDE.md 규칙 5).
 *   못 읽어도 상품 페이지는 떠야 하므로 null 이면 안내만 빠진다.
 */
async function loadShipping(): Promise<ShippingPolicy | null> {
  return serverApi.getJson<ShippingPolicy>("/api/shipping-policy");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  // ★ 여기서 notFound() 를 불러야 응답이 404 가 된다 (2026-09-28). 본문에서 부르면 loading.tsx 가
  //   먼저 200 으로 흘러나간 뒤라 '없는 상품' 화면이 200 으로 나갔다(검색엔진에 soft-404).
  if (!product) notFound();

  const description = product.subtitle ?? "곱게 도정한 쌀로 만든 탄수화물 보충 식품.";
  return {
    title: product.nameKo,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: product.nameKo,
      description,
      images: product.thumbnailKey ? [absoluteUrl(product.images[0]?.url)] : [],
    },
  };
}

/**
 * 상품 상세. 서버에서 렌더한다 (SEO).
 *
 * ★ 영양성분·원재료는 텍스트로 렌더한다 (CLAUDE.md 규칙 2).
 * ★ 검색 노출을 위해 상품 구조화 데이터(JSON-LD)를 넣는다 (기획서 §11, Phase 6).
 */
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, shipping] = await Promise.all([loadProduct(slug), loadShipping()]);
  if (!product) notFound();

  // 검색엔진용 구조화 데이터. 화면에는 안 보이고 크롤러만 읽는다.
  // ★ 주소는 반드시 절대 주소여야 한다 (2026-09-29). "/uploads/..." 로 내보내던 동안
  //   구글·네이버가 사진을 읽지 못해 상품 리치 결과가 잡히지 않았다.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameKo,
    description: product.subtitle ?? undefined,
    image: product.images.map((i) => absoluteUrl(i.url)),
    sku: product.slug,
    brand: { "@type": "Brand", name: "라이즌푸드" },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/products/${product.slug}`),
      priceCurrency: "KRW",
      price: product.effectivePrice,
      itemCondition: "https://schema.org/NewCondition",
      availability: product.soldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  return (
    <Container className="py-10 pb-32 md:py-14 md:pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 상단: 갤러리 + 구매 패널 */}
      <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-start md:gap-14 lg:gap-20">
        <ProductGallery images={product.images} name={product.nameKo} />
        <PurchasePanel product={product} shipping={shipping} />
      </div>

      {/* 에디터로 쓰던 '상세 설명' 칸은 뺐다 (2026-09-28). 상세는 아래 사진형 블록이 전담한다.
          descriptionHtml 값은 API 에 남아 있지만 화면에는 그리지 않는다. */}

      {/* 사진형 상세페이지 — 관리자가 쌓은 사진·영상·글이 틈 없이 이어진다 */}
      <ProductDetailSections sections={product.detailSections ?? []} />

      {/* 영양성분 · 원재료 · 표시사항 — 텍스트.
          ★ 법정 표시사항은 이미지가 아니라 DOM 텍스트로 둔다 (CLAUDE.md 규칙 2). 상세 이미지에 같은 내용이
            있어도 검색·스크린리더·법적 확인은 이 텍스트가 한다.
          ★ 접어 둔다 (2026-09-28): 상세 이미지와 겹쳐 보여 기본은 닫힘. 네이티브 <details> 라 스크립트 없이
            키보드·스크린리더로 열리고, 닫혀 있어도 텍스트는 DOM 에 그대로 있다. */}
      {(product.nutrition || product.ingredients.length > 0 || product.label) && (
        <details className="group mt-16 border-y border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-kr text-base font-bold text-ink md:text-lg [&::-webkit-details-marker]:hidden">
            <span>
              영양성분 · 상품정보 표시사항
              <span className="ml-3 font-normal text-ink-faint">펼쳐보기</span>
            </span>
            <span
              aria-hidden="true"
              className="relative h-3.5 w-3.5 shrink-0 before:absolute before:left-0 before:top-1/2 before:h-px before:w-full before:bg-ink before:content-[''] after:absolute after:left-1/2 after:top-0 after:h-full after:w-px after:bg-ink after:transition-transform after:content-[''] group-open:after:scale-y-0"
            />
          </summary>
          <div className="grid gap-14 pb-14 pt-4 md:grid-cols-2 md:gap-16">
            {product.nutrition && <NutritionFacts nutrition={product.nutrition} />}
            {(product.ingredients.length > 0 || product.label) && (
              <IngredientList ingredients={product.ingredients} label={product.label} weightG={product.weightG} />
            )}
          </div>
        </details>
      )}
    </Container>
  );
}
