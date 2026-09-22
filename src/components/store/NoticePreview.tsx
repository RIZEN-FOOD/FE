import Link from "next/link";
import { Container, SectionTag } from "@/components/ui";
import { formatDateTime } from "@/lib/datetime";
import { NOTICE_CATEGORIES, type NoticePublicDetail } from "@/types/content";

const categoryLabel = (v: string) => NOTICE_CATEGORIES.find((c) => c.value === v)?.label ?? v;

/**
 * 메인의 공지 — 최신 3건을 아코디언으로 펼쳐 본다 (2026-09-17 요청).
 *
 * 네이티브 <details> 라 스크립트 없이 키보드·스크린리더로 열고 닫힌다.
 * 본문은 서버가 저장할 때 허용 목록으로 살균한 HTML 이다 (공지 상세 화면과 같은 값).
 * 펼쳐 보는 것은 조회수에 넣지 않는다. 전체 글은 "자세히 보기"로 상세에 간다.
 * 공지가 없으면 섹션을 그리지 않는다.
 */
export function NoticePreview({ notices }: { notices: NoticePublicDetail[] }) {
  if (notices.length === 0) return null;

  return (
    <section className="bg-cream-warm py-20" aria-labelledby="notice-heading">
      <Container>
        <SectionTag>Notice</SectionTag>
        <div className="flex items-end justify-between">
          <h2 id="notice-heading" className="font-display text-section font-semibold tracking-[-0.01em] text-ink">
            공지사항
          </h2>
          <Link href="/notice" className="font-kr text-sm text-ink-soft underline-offset-4 hover:underline">
            전체 보기
          </Link>
        </div>

        <div className="mt-6 border-t border-line">
          {notices.map((n) => (
            <details key={n.id} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center gap-3 py-4 [&::-webkit-details-marker]:hidden">
                <span className="shrink-0 rounded-[2px] bg-paper px-1.5 py-0.5 font-kr text-[10px] text-ink-soft">
                  {categoryLabel(n.category)}
                </span>
                <span className="min-w-0 flex-1 truncate font-kr text-sm font-medium text-ink group-open:whitespace-normal">
                  {n.title}
                </span>
                <span className="hidden shrink-0 font-kr text-xs text-ink-faint sm:inline">
                  {formatDateTime(n.publishedAt)}
                </span>
                <span
                  aria-hidden="true"
                  className="relative h-3 w-3 shrink-0 before:absolute before:left-0 before:top-1/2 before:h-px before:w-full before:bg-ink before:content-[''] after:absolute after:left-1/2 after:top-0 after:h-full after:w-px after:bg-ink after:transition-transform after:content-[''] group-open:after:scale-y-0"
                />
              </summary>
              <div className="pb-6 sm:pl-12">
                <p className="font-kr text-xs text-ink-faint sm:hidden">{formatDateTime(n.publishedAt)}</p>
                <div
                  className="mt-2 max-h-[420px] overflow-y-auto font-kr text-sm leading-relaxed text-ink-soft [&_a]:text-clay-deep [&_a]:underline [&_h3]:mb-1 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-ink [&_img]:my-3 [&_img]:max-w-full [&_ul]:list-disc [&_ul]:pl-5"
                  data-lenis-prevent
                  dangerouslySetInnerHTML={{ __html: n.bodyHtml }}
                />
                <Link
                  href={`/notice/${n.id}`}
                  className="mt-4 inline-block font-kr text-xs font-medium text-ink underline-offset-4 hover:underline"
                >
                  자세히 보기 →
                </Link>
              </div>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
