import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { PageHero } from "@/components/store/PageHero";
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
    <>
      <PageHero
        eyebrow="Reviews"
        title="후기"
        description="크림오브라이스를 드셔본 분들의 이야기입니다."
        settingKey="main.page_hero_reviews"
        fallbackImage="/assets/hero/hero-b.jpg"
      />
      <Container className="py-14">

      {items.length === 0 ? (
        <div className="mt-12 rounded-[12px] border border-dashed border-line px-6 py-20 text-center">
          <p className="font-kr text-sm text-ink-soft">첫 후기를 기다리고 있습니다.</p>
          <p className="mt-1 font-kr text-caption text-ink-faint">
            로그인 후 상품 페이지에서 후기를 남길 수 있습니다.
          </p>
        </div>
      ) : (
        <>
          {/* 카드 없이 두 단으로. 항목 사이는 hairline 하나 (2026-09-23). */}
          <ul className="mt-10 grid sm:grid-cols-2 sm:gap-x-14 lg:gap-x-20">
            {items.map((r) => (
              <li key={r.id} className="border-t border-line py-8 md:py-10">
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
                  className={`h-9 w-9 rounded-[6px] text-center font-numeric text-sm leading-9 transition ${
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
    </>
  );
}
