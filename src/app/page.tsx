import { HeroSection } from "@/components/hero/HeroSection";
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
  const [featured, noticeData, reviewData] = await Promise.all([
    serverApi.getJson<ProductListItem[]>("/api/products/featured"),
    serverApi.getJson<NoticePublicPage>("/api/notices?page=0&size=3"),
    serverApi.getJson<ReviewPage>("/api/reviews?page=0&size=3"),
  ]);

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
        <HeroSection />
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
