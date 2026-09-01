import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionTag } from "@/components/ui";
import { serverApi } from "@/lib/server/api";
import { formatDateTime } from "@/lib/datetime";
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
      <h1 className="font-kr text-3xl font-bold tracking-tight text-ink">후기</h1>
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
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((r) => (
              <li key={r.id} className="flex flex-col rounded-[4px] border border-line bg-paper p-5">
                <div className="flex items-center gap-2">
                  <span className="font-numeric text-sm text-clay-deep">
                    {"★".repeat(r.rating)}
                    <span className="text-line">{"★".repeat(5 - r.rating)}</span>
                  </span>
                  {r.verifiedPurchase && (
                    <span className="rounded-full bg-cream-warm px-2 py-0.5 font-kr text-[10px] text-ink-soft">
                      구매 확인
                    </span>
                  )}
                  {/* 협찬 후기는 광고 표시가 법적 의무다 */}
                  {r.sponsored && (
                    <span className="rounded-full bg-clay-soft px-2 py-0.5 font-kr text-[10px] text-clay-deep">
                      광고
                    </span>
                  )}
                </div>

                <p className="mt-3 line-clamp-4 flex-1 whitespace-pre-line font-kr text-sm leading-relaxed text-ink">
                  {r.content}
                </p>

                {r.imageUrls.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {r.imageUrls.slice(0, 3).map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={url} alt="" className="h-16 w-16 rounded-[3px] object-cover" />
                    ))}
                  </div>
                )}

                <div className="mt-4 border-t border-line pt-3">
                  <Link
                    href={`/products/${r.productSlug}`}
                    className="font-kr text-xs font-medium text-ink-soft underline-offset-4 hover:underline"
                  >
                    {r.productName}
                  </Link>
                  <p className="mt-1 font-kr text-xs text-ink-faint">
                    {r.authorName} · {formatDateTime(r.createdAt)}
                  </p>
                </div>
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
