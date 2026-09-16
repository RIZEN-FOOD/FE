import { HeroSplit, type HeroPhoto } from "@/components/hero/HeroSplit";
import { HeroCarousel } from "@/components/hero/HeroCarousel";
import { StickyBuyBar } from "@/components/layout/StickyBuyBar";
import { FeaturedProducts } from "@/components/store/FeaturedProducts";
import { WhyRizen } from "@/components/store/WhyRizen";
import { NutritionBand } from "@/components/store/NutritionBand";
import { HowToCook } from "@/components/store/HowToCook";
import { FeatureCards } from "@/components/store/FeatureCards";
import { BrandFaq } from "@/components/store/BrandFaq";
import { ReviewPreview } from "@/components/store/ReviewPreview";
import { NoticePreview } from "@/components/store/NoticePreview";
import { hasPublicAsset } from "@/lib/publicAssets";

import { serverApi } from "@/lib/server/api";
import type { ProductDetail, ProductListItem, HeroSlide } from "@/types/product";
import type { NoticePublicPage } from "@/types/content";
import type { ReviewPage } from "@/types/member";

/**
 * 메인 페이지. 서버에서 실데이터를 가져와 SSR 한다.
 *
 * 헤더·푸터·퀵메뉴는 (main) 템플릿(layout.tsx)이 그린다. 이 페이지는 내용만 그린다.
 *
 * 구성
 *   히어로 → 대표 제품 → 왜 다른가 → 영양성분(다크) → 조리법 → 특징 카드 → 후기 → Q&A → 공지
 *
 * 데이터가 없는 섹션은 각 컴포넌트가 알아서 그리지 않는다.
 */
export default async function Home() {
  const [featured, heroData, noticeData, reviewData, settings] = await Promise.all([
    serverApi.getJson<ProductListItem[]>("/api/products/featured"),
    // 메인 히어로 배너 — 사진·색·문구·가격·순서·노출 모두 관리자(상품 히어로 필드)에서 온다.
    serverApi.getJson<HeroSlide[]>("/api/products/hero"),
    serverApi.getJson<NoticePublicPage>("/api/notices?page=0&size=3"),
    serverApi.getJson<ReviewPage>("/api/reviews?page=0&size=3"),
    serverApi.getJson<Record<string, string>>("/api/settings"),
  ]);

  // 노출(hero_enabled) 슬라이드가 표시 순서대로 이미 정렬돼 온다.
  const heroSlides: HeroSlide[] = heroData ?? [];

  // 히어로 사진(폴백용). 관리자가 site_setting 의 main.hero_images 로 바꾼다.
  const heroPhotos: HeroPhoto[] = (settings?.["main.hero_images"] ?? "")
    .split(",")
    .map((src) => src.trim())
    .filter(Boolean)
    .map((src) => ({ src, alt: "크림오브라이스 제품 사진" }));

  if (heroPhotos.length === 0) {
    const defaults: HeroPhoto[] = [
      { src: "/assets/hero/hero-a.jpg", alt: "크림오브라이스로 차린 한 그릇과 바나나·견과, 제품 패키지" },
      { src: "/assets/hero/hero-b.jpg", alt: "딸기·블루베리를 곁들인 크림오브라이스 한 그릇과 제품 패키지" },
    ];
    heroPhotos.push(
      ...defaults.filter((p) => hasPublicAsset(p.src)),
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
      {heroSlides && heroSlides.length > 0 ? (
        <HeroCarousel slides={heroSlides} />
      ) : (
        <HeroSplit
          photos={heroPhotos}
          primaryHref={primary ? `/products/${primary.slug}` : undefined}
        />
      )}
      <FeaturedProducts products={products} />
      <WhyRizen />
      <NutritionBand
        nutrition={primaryDetail?.nutrition ?? null}
        productName={primaryDetail?.nameKo ?? "크림오브라이스"}
      />
      <HowToCook />
      <FeatureCards nutrition={primaryDetail?.nutrition ?? null} />
      <ReviewPreview reviews={reviews} />
      <BrandFaq />
      {/* 구매 안내(BuyChannels) 섹션은 우선 숨김 — 필요 시 다시 넣는다. */}
      <NoticePreview notices={notices} />

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
