import Link from "next/link";
import { Container, Reveal } from "@/components/ui";
import { ProductCard } from "./ProductCard";
import type { ProductListItem } from "@/types/product";

/**
 * 메인의 상품 그리드. isFeatured 인 상품만 나온다 (기획서 §3 S6).
 * 노출할 상품이 없으면 섹션 자체를 그리지 않는다.
 *
 * 등장은 다른 섹션과 같은 Reveal 이다 (2026-09-23 통일). 카드는 60ms 간격으로 줄지어 뜬다 —
 * 순서가 있어야 «여러 개 중 하나»가 아니라 «첫 번째부터» 읽힌다.
 */
export function FeaturedProducts({ products }: { products: ProductListItem[] }) {
  if (products.length === 0) return null;

  return (
    <section className="bg-cream py-24" aria-labelledby="featured-heading">
      <Container>
        <Reveal className="flex items-end justify-between">
          <h2 id="featured-heading" className="font-display text-section font-semibold text-ink">
            상품
          </h2>
          <Link href="/products" className="font-kr text-sm text-ink-soft underline-offset-4 hover:underline">
            전체 보기
          </Link>
        </Reveal>

        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((p, i) => (
            <Reveal key={p.id} as="li" delay={80 + i * 60}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
