import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { PageHero } from "@/components/store/PageHero";
import { serverApi } from "@/lib/server/api";
import { formatDateTime } from "@/lib/datetime";
import { NOTICE_CATEGORIES, type NoticePublicPage } from "@/types/content";

export const metadata: Metadata = {
  title: "공지사항",
  description: "라이즌푸드 공지사항·이벤트·안내.",
};

const categoryLabel = (v: string) => NOTICE_CATEGORIES.find((c) => c.value === v)?.label ?? v;

/**
 * 공지 목록. 발행된 공지만 나온다.
 * 데스크톱은 테이블, 모바일은 카드형으로 보여준다 (기획서 §5.1).
 */
export default async function NoticeListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; keyword?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(0, Number(sp.page ?? "0") || 0);
  const keyword = sp.keyword?.trim() ?? "";

  const query = new URLSearchParams({ page: String(page), size: "10" });
  if (keyword) query.set("keyword", keyword);

  const data = await serverApi.getJson<NoticePublicPage>(`/api/notices?${query.toString()}`);
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <>
      <PageHero
        eyebrow="Notice"
        title="공지사항"
        description="배송·주문과 관련한 안내를 올립니다."
        settingKey="main.page_hero_notice"
        fallbackImage="/assets/sections/nutrition.jpg"
      />
      <Container className="py-14">

      {/* 검색 */}
      <form action="/notice" method="get" className="mt-6 flex gap-2 border-b border-line pb-4">
        <input
          type="text"
          name="keyword"
          defaultValue={keyword}
          placeholder="제목 검색"
          className="w-full max-w-xs rounded-[6px] border border-line bg-paper px-3 py-2 font-kr text-sm outline-none focus:border-clay-deep"
        />
        <button type="submit" className="rounded-[6px] bg-ink px-4 py-2 font-kr text-sm font-medium text-cream-warm">
          검색
        </button>
      </form>

      {items.length === 0 ? (
        <p className="mt-16 text-center font-kr text-sm text-ink-soft">
          {keyword ? "검색 결과가 없습니다." : "등록된 공지사항이 없습니다."}
        </p>
      ) : (
        <ul className="mt-6 flex flex-col">
          {items.map((n) => (
            <li key={n.id} className="border-b border-line">
              <Link href={`/notice/${n.id}`} className="flex items-center gap-3 py-4 transition hover:bg-clay-soft/20">
                {n.pinned ? (
                  <span className="shrink-0 rounded-[6px] bg-clay-deep px-1.5 py-0.5 font-kr text-caption font-bold text-cream-warm">
                    공지
                  </span>
                ) : (
                  <span className="shrink-0 rounded-[6px] bg-cream-warm px-1.5 py-0.5 font-kr text-caption text-ink-soft">
                    {categoryLabel(n.category)}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate font-kr text-sm text-ink">{n.title}</span>
                <span className="hidden shrink-0 font-kr text-caption text-ink-faint sm:inline">
                  {formatDateTime(n.publishedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="mt-10 flex justify-center gap-1" aria-label="페이지">
          {Array.from({ length: totalPages }, (_, i) => (
            <Link
              key={i}
              href={`/notice?page=${i}${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ""}`}
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
      </Container>
    </>
  );
}
