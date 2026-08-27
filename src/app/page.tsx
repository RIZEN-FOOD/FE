import { HeroSection } from "@/components/hero/HeroSection";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyBuyBar } from "@/components/layout/StickyBuyBar";
import { StoreFooter } from "@/components/store/StoreFooter";
import { FeaturedProducts } from "@/components/store/FeaturedProducts";
import { NoticePreview } from "@/components/store/NoticePreview";
import { serverApi } from "@/lib/server/api";
import type { ProductListItem } from "@/types/product";
import type { NoticePublicPage } from "@/types/content";

/**
 * 메인 페이지. 서버에서 실데이터를 가져와 SSR 한다.
 *
 * 히어로 → 상품 그리드(featured) → 공지 → 푸터.
 * 하단 고정 구매 바는 첫 featured 상품으로 연결한다. 상품이 없으면 숨긴다.
 */
export default async function Home() {
  const [featured, noticeData] = await Promise.all([
    serverApi.getJson<ProductListItem[]>("/api/products/featured"),
    serverApi.getJson<NoticePublicPage>("/api/notices?page=0&size=3"),
  ]);

  const products = featured ?? [];
  const notices = noticeData?.items ?? [];
  const primary = products.find((p) => !p.soldOut) ?? products[0];

  return (
    <>
      <SiteHeader />

      <main>
        <HeroSection />
        <FeaturedProducts products={products} />
        <NoticePreview notices={notices} />
      </main>

      <StoreFooter />

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
