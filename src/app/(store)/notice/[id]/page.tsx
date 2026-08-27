import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { serverApi } from "@/lib/server/api";
import { formatDateTime } from "@/lib/datetime";
import { NOTICE_CATEGORIES, type NoticePublicDetail } from "@/types/content";

const categoryLabel = (v: string) => NOTICE_CATEGORIES.find((c) => c.value === v)?.label ?? v;

async function loadNotice(id: string): Promise<NoticePublicDetail | null> {
  // 조회수를 올리므로 캐시하지 않는다.
  return serverApi.getJson<NoticePublicDetail>(`/api/notices/${id}`, { revalidate: 0 });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const notice = await loadNotice(id);
  return { title: notice?.title ?? "공지사항" };
}

/**
 * 공지 상세.
 * 본문은 서버에서 이미 살균된 HTML 이다 (BE HtmlSanitizer).
 */
export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const notice = await loadNotice(id);
  if (!notice) notFound();

  return (
    <Container as="main" className="py-14">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-2">
          <span className="rounded-[2px] bg-cream-warm px-2 py-0.5 font-kr text-xs text-ink-soft">
            {categoryLabel(notice.category)}
          </span>
        </div>
        <h1 className="mt-3 font-kr text-2xl font-bold leading-snug text-ink">{notice.title}</h1>
        <p className="mt-2 font-kr text-xs text-ink-faint">
          {formatDateTime(notice.publishedAt)} · 조회 {notice.viewCount}
        </p>

        <div
          className="mt-8 border-t border-line pt-8 font-kr text-sm leading-relaxed text-ink [&_h3]:mb-1 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-bold [&_img]:my-3 [&_img]:max-w-full [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-clay-deep [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: notice.bodyHtml }}
        />

        <div className="mt-12 border-t border-line pt-6">
          <Link href="/notice" className="font-kr text-sm font-medium text-ink-soft hover:text-ink">
            ← 목록으로
          </Link>
        </div>
      </div>
    </Container>
  );
}
