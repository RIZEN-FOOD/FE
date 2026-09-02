import { HeroSplit, type HeroPhoto } from "@/components/hero/HeroSplit";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyBuyBar } from "@/components/layout/StickyBuyBar";
import { StoreFooter } from "@/components/store/StoreFooter";
import { FeaturedProducts } from "@/components/store/FeaturedProducts";
import { WhyRizen } from "@/components/store/WhyRizen";
import { NutritionBand } from "@/components/store/NutritionBand";
import { RecipeGallery } from "@/components/store/RecipeGallery";
import { ReviewPreview } from "@/components/store/ReviewPreview";
import { BuyChannels } from "@/components/store/BuyChannels";
import { NoticePreview } from "@/components/store/NoticePreview";
import { QuickMenu } from "@/components/store/QuickMenu";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { serverApi } from "@/lib/server/api";
import type { ProductDetail, ProductListItem } from "@/types/product";
import type { NoticePublicPage } from "@/types/content";
import type { ReviewPage } from "@/types/member";

/**
 * 메인 페이지. 서버에서 실데이터를 가져와 SSR 한다.
 *
 * 구성
 *   히어로 → 대표 제품 → 왜 다른가 → 영양성분(다크) → 활용법
 *   → 후기 → 구매 안내 → 공지 → 푸터
 *
 * 데이터가 없는 섹션은 각 컴포넌트가 알아서 그리지 않는다.
 * 빈 껍데기를 보여주는 대신 섹션 자체를 숨긴다.
 */
export default async function Home() {
  const [featured, noticeData, reviewData, settings] = await Promise.all([
    serverApi.getJson<ProductListItem[]>("/api/products/featured"),
    serverApi.getJson<NoticePublicPage>("/api/notices?page=0&size=3"),
    serverApi.getJson<ReviewPage>("/api/reviews?page=0&size=3"),
    serverApi.getJson<Record<string, string>>("/api/settings"),
  ]);

  // 히어로 사진. 관리자가 site_setting 의 main.hero_images 로 바꾼다.
  // 쉼표로 나눈 목록이고, 비어 있으면 저장소에 넣어둔 기본 사진을 쓴다.
  const heroPhotos: HeroPhoto[] = (settings?.["main.hero_images"] ?? "")
    .split(",")
    .map((src) => src.trim())
    .filter(Boolean)
    .map((src) => ({ src, alt: "크림오브라이스 제품 사진" }));

  // 관리자가 아직 사진을 넣지 않았으면 저장소의 기본 사진을 쓴다.
  // 파일이 실제로 있는 것만 넣는다 — 깨진 이미지 아이콘을 보여주지 않기 위해서다.
  // 하나도 없으면 목록이 비고, 히어로가 제품 도형으로 대체된다.
  if (heroPhotos.length === 0) {
    const defaults: HeroPhoto[] = [
      { src: "/assets/hero/hero-1-package.jpg", alt: "크림오브라이스 1kg 제품 패키지와 계량 스푼" },
      { src: "/assets/hero/hero-2-serving.jpg", alt: "물에 풀어 그릇에 담고 견과와 바나나를 곁들인 크림오브라이스" },
    ];
    heroPhotos.push(
      ...defaults.filter((p) => existsSync(join(process.cwd(), "public", p.src))),
    );
  }

  const products = featured ?? [];
  const notices = noticeData?.items ?? [];
  const reviews = reviewData?.items ?? [];
  const primary = products.find((p) => !p.soldOut) ?? products[0] ?? null;

  // 영양성분은 대표 상품의 실제 값을 쓴다. 없으면 섹션이 안 뜬다.
  const primaryDetail = primary
    ? await serverApi.getJson<ProductDetail>(`/api/products/${primary.slug}`)
    : null;

  return (
    <>
      <SiteHeader />

      <main>
        <HeroSplit photos={heroPhotos} />
        <FeaturedProducts products={products} />
        <WhyRizen />
        <NutritionBand
          nutrition={primaryDetail?.nutrition ?? null}
          productName={primaryDetail?.nameKo ?? "크림오브라이스"}
        />
        <RecipeGallery />
        <ReviewPreview reviews={reviews} />
        <BuyChannels primary={primary} />
        <NoticePreview notices={notices} />
      </main>

      <StoreFooter />
      <QuickMenu />

      {primary && (
        <>
          {/* 하단 고정 바에 가려지지 않도록 여유를 둔다 */}
          <div className="h-20" aria-hidden="true" />
          <StickyBuyBar
            productName={primary.nameKo}
            price={primary.effectivePrice}
            href={`/products/${primary.slug}`}
          />
        </>
      )}
    </>
  );
}
