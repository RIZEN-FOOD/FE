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

async function loadProduct(slug: string): Promise<ProductDetail | null> {
  return serverApi.getJson<ProductDetail>(`/api/products/${encodeURIComponent(slug)}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: "상품을 찾을 수 없습니다" };

  const description = product.subtitle ?? "곱게 도정한 쌀로 만든 탄수화물 보충 식품.";
  return {
    title: product.nameKo,
    description,
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
  const product = await loadProduct(slug);
  if (!product) notFound();

  // 검색엔진용 구조화 데이터. 화면에는 안 보이고 크롤러만 읽는다.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameKo,
    description: product.subtitle ?? undefined,
    image: product.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "KRW",
      price: product.effectivePrice,
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
        <PurchasePanel product={product} />
      </div>

      {/* 상세 설명 */}
      {product.descriptionHtml && (
        <section className="mt-24 border-t border-line pt-14" aria-labelledby="desc-heading">
          <h2 id="desc-heading" className="font-display text-section font-semibold text-ink">상세 정보</h2>
          <div
            className="mt-6 max-w-[68ch] font-kr text-base leading-[1.8] text-ink [&_h3]:mb-2 [&_h3]:mt-8 [&_h3]:text-sub [&_h3]:font-bold [&_img]:my-3 [&_img]:max-w-full [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-clay-deep [&_a]:underline"
            // 서버에서 이미 살균된 HTML 이다 (BE HtmlSanitizer). 여기서 또 만들지 않는다.
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        </section>
      )}

      {/* 사진형 상세페이지 — 관리자가 쌓은 사진·영상·글이 틈 없이 이어진다 */}
      <ProductDetailSections sections={product.detailSections ?? []} />

      {/* 영양성분 · 원재료 — 텍스트 */}
      <div className="mt-24 grid gap-14 border-t border-line pt-14 md:grid-cols-2 md:gap-16">
        {product.nutrition && <NutritionFacts nutrition={product.nutrition} />}
        {(product.ingredients.length > 0 || product.label) && (
          <IngredientList ingredients={product.ingredients} label={product.label} weightG={product.weightG} />
        )}
      </div>
    </Container>
  );
}
