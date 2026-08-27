import { HeroSection } from "@/components/hero/HeroSection";
import { ProductSection } from "@/components/product/ProductSection";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyBuyBar } from "@/components/layout/StickyBuyBar";
import { placeholderProduct } from "@/lib/placeholderProduct";

export default function Home() {
  // TODO: 상품 API 가 생기면 서버에서 받아온다.
  const product = placeholderProduct;

  return (
    <>
      <SiteHeader />

      <main>
        <HeroSection />
        <ProductSection />
      </main>

      {/* 하단 고정 바에 가려지지 않도록 여유를 둔다 */}
      <div className="h-20" aria-hidden="true" />

      <StickyBuyBar
        productName={product.nameKo}
        price={product.price}
        href={`/products/${product.slug}`}
      />
    </>
  );
}
