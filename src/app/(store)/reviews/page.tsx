import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionTag } from "@/components/ui";
import { ReviewCard } from "@/components/store/ReviewCard";
import { serverApi } from "@/lib/server/api";
import type { ReviewPage } from "@/types/member";

export const metadata: Metadata = {
  title: "후기",
  description: "크림오브라이스를 드셔본 분들의 후기.",
};

/**
 * 후기 모아보기. 서버에서 가져와 SSR 한다 (SEO).
 *
 * ★ 관리자가 승인한 후기만 나온다 (기획서 §9).
 *   효능을 단정하는 표현은 노출 전에 걸러진다.
 *   체험단·협찬 후기는 광고 표시(sponsored)가 필수다.
 */
export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(0, Number(sp.page ?? "0") || 0);

  const data = await serverApi.getJson<ReviewPage>(`/api/reviews?page=${page}&size=12`);
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <Container as="main" className="py-14">
      <SectionTag>Reviews</SectionTag>
      <h1 className="font-display text-[2rem] font-semibold tracking-[-0.01em] text-ink">후기</h1>
      <p className="mt-2 font-kr text-sm text-ink-soft">
        크림오브라이스를 드셔본 분들의 이야기입니다.
      </p>

      {items.length === 0 ? (
        <div className="mt-12 rounded-[4px] border border-dashed border-line px-6 py-20 text-center">
          <p className="font-kr text-sm text-ink-soft">첫 후기를 기다리고 있습니다.</p>
          <p className="mt-1 font-kr text-xs text-ink-faint">
            로그인 후 상품 페이지에서 후기를 남길 수 있습니다.
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-10 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((r) => (
              <li key={r.id}>
                <ReviewCard review={r} />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav className="mt-12 flex justify-center gap-1" aria-label="페이지">
              {Array.from({ length: totalPages }, (_, i) => (
                <Link
                  key={i}
                  href={`/reviews?page=${i}`}
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
