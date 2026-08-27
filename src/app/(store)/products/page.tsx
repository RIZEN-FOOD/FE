import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionTag } from "@/components/ui";
import { ProductCard } from "@/components/store/ProductCard";
import { serverApi } from "@/lib/server/api";
import type { ProductListItem } from "@/types/product";

export const metadata: Metadata = {
  title: "상품",
  description: "라이즌푸드 크림오브라이스 — 곱게 도정한 쌀로 만든 탄수화물 보충 식품.",
};

type ProductListResponse = {
  items: ProductListItem[];
  page: number;
  totalPages: number;
  totalCount: number;
};

const SORTS = [
  { value: "new", label: "신상품순" },
  { value: "price-asc", label: "낮은 가격순" },
  { value: "price-desc", label: "높은 가격순" },
];

/**
 * 상품 목록. 서버에서 데이터를 가져와 SSR 한다 (SEO).
 * 정렬·페이지는 URL 쿼리로 관리해 링크로 공유·북마크가 가능하게 한다.
 */
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(0, Number(sp.page ?? "0") || 0);
  const sort = SORTS.some((s) => s.value === sp.sort) ? sp.sort! : "new";

  const data = await serverApi.getJson<ProductListResponse>(
    `/api/products?page=${page}&size=12&sort=${sort}`,
  );

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <Container as="main" className="py-14">
      <SectionTag>Products</SectionTag>
      <h1 className="font-kr text-3xl font-bold tracking-tight text-ink">상품</h1>

      {/* 정렬 — 상품이 늘면 필터를 추가한다. 지금은 정렬만 (기획서 §4.1) */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-line pb-4">
        {SORTS.map((s) => (
          <Link
            key={s.value}
            href={`/products?sort=${s.value}`}
            className={`rounded-full px-3.5 py-1.5 font-kr text-sm transition ${
              sort === s.value ? "bg-ink text-cream-warm" : "text-ink-soft hover:bg-clay-soft/40"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-16 rounded-[4px] border border-dashed border-line px-6 py-16 text-center">
          <p className="font-kr text-sm text-ink-soft">등록된 상품이 아직 없습니다.</p>
        </div>
      ) : (
        <>
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-6">
            {items.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav className="mt-12 flex justify-center gap-1" aria-label="페이지">
              {Array.from({ length: totalPages }, (_, i) => (
                <Link
                  key={i}
                  href={`/products?sort=${sort}&page=${i}`}
                  aria-current={i === page ? "page" : undefined}
                  className={`h-9 w-9 rounded-[3px] text-center font-numeric text-sm leading-9 transition ${
                    i === page ? "bg-ink text-cream-warm" : "text-ink-soft hover:bg-clay-soft/40"
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
            </nav>
          )}
        </>
      )}
    </Container>
  );
}
