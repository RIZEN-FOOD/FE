import Link from "next/link";
import { Container, SectionTag } from "@/components/ui";
import { formatDateTime } from "@/lib/datetime";
import { NOTICE_CATEGORIES, type NoticePublicItem } from "@/types/content";

const categoryLabel = (v: string) => NOTICE_CATEGORIES.find((c) => c.value === v)?.label ?? v;

/**
 * 메인의 공지 미리보기. 최신 3건 (기획서 §3 S9).
 * 공지가 없으면 섹션을 그리지 않는다.
 */
export function NoticePreview({ notices }: { notices: NoticePublicItem[] }) {
  if (notices.length === 0) return null;

  return (
    <section className="bg-cream-warm py-20" aria-labelledby="notice-heading">
      <Container>
        <SectionTag>Notice</SectionTag>
        <div className="flex items-end justify-between">
          <h2 id="notice-heading" className="font-kr text-2xl font-bold tracking-tight text-ink">
            공지사항
          </h2>
          <Link href="/notice" className="font-kr text-sm text-ink-soft underline-offset-4 hover:underline">
            전체 보기
          </Link>
        </div>

        <ul className="mt-6 flex flex-col">
          {notices.map((n) => (
            <li key={n.id} className="border-b border-line">
              <Link href={`/notice/${n.id}`} className="flex items-center gap-3 py-3.5 transition hover:opacity-70">
                <span className="shrink-0 rounded-[2px] bg-paper px-1.5 py-0.5 font-kr text-[10px] text-ink-soft">
                  {n.pinned ? "공지" : categoryLabel(n.category)}
                </span>
                <span className="min-w-0 flex-1 truncate font-kr text-sm text-ink">{n.title}</span>
                <span className="hidden shrink-0 font-kr text-xs text-ink-faint sm:inline">
                  {formatDateTime(n.publishedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
