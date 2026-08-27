import Link from "next/link";
import { Container, SectionTag } from "@/components/ui";
import { ProductCard } from "./ProductCard";
import type { ProductListItem } from "@/types/product";

/**
 * 메인의 상품 그리드. isFeatured 인 상품만 나온다 (기획서 §3 S6).
 * 노출할 상품이 없으면 섹션 자체를 그리지 않는다.
 */
export function FeaturedProducts({ products }: { products: ProductListItem[] }) {
  if (products.length === 0) return null;

  return (
    <section className="bg-cream py-24" aria-labelledby="featured-heading">
      <Container>
        <SectionTag>Product</SectionTag>
        <div className="flex items-end justify-between">
          <h2 id="featured-heading" className="font-kr text-3xl font-bold tracking-tight text-ink">
            상품
          </h2>
          <Link href="/products" className="font-kr text-sm text-ink-soft underline-offset-4 hover:underline">
            전체 보기
          </Link>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
