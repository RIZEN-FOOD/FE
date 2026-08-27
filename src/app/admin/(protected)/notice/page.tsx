"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api/client";
import { formatDateTime } from "@/lib/datetime";
import { NOTICE_CATEGORIES, type NoticeAdminItem, type NoticeAdminPage } from "@/types/content";
import { cn } from "@/lib/cn";

const categoryLabel = (v: string) => NOTICE_CATEGORIES.find((c) => c.value === v)?.label ?? v;

/**
 * 공지사항 관리 목록.
 * 예약 발행·임시저장·숨김까지 전부 보인다. 상태를 한눈에 구분할 수 있게 한다.
 */
export default function AdminNoticePage() {
  const [items, setItems] = useState<NoticeAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<NoticeAdminPage>("/api/admin/notices?page=0&size=100");
      setItems(res.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2500);
  }

  async function remove(id: number, title: string) {
    if (!window.confirm(`"${title}" 공지를 삭제합니다.\n되돌릴 수 없습니다. 계속할까요?`)) return;
    if (!window.confirm("정말 삭제하시겠어요?")) return;
    try {
      await api.delete(`/api/admin/notices/${id}`);
      setItems((list) => list.filter((n) => n.id !== id));
      flash("삭제되었습니다.");
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "삭제에 실패했습니다.");
    }
  }

  function statusOf(n: NoticeAdminItem): { label: string; tone: "live" | "scheduled" | "draft" | "hidden" } {
    if (!n.visible) return { label: "숨김", tone: "hidden" };
    if (!n.publishedAt) return { label: "임시저장", tone: "draft" };
    if (n.publicNow) return { label: "공개 중", tone: "live" };
    return { label: "예약", tone: "scheduled" };
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-kr text-2xl font-bold text-ink">공지사항</h1>
          <p className="mt-1 font-kr text-sm text-ink-soft">발행일을 미래로 두면 그때 자동으로 공개됩니다.</p>
        </div>
        <Link
          href="/admin/notice/new"
          className="rounded-[2px] bg-ink px-4 py-2.5 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep"
        >
          + 새 공지 작성
        </Link>
      </div>

      {message && (
        <p className="mt-4 rounded-[3px] bg-clay-soft/40 px-3 py-2 font-kr text-sm text-clay-deep">{message}</p>
      )}

      {loading ? (
        <p className="mt-10 font-kr text-sm text-ink-faint">불러오는 중…</p>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-[4px] border border-dashed border-line px-6 py-12 text-center">
          <p className="font-kr text-sm text-ink-soft">아직 작성된 공지가 없습니다.</p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {items.map((n) => {
            const st = statusOf(n);
            return (
              <li key={n.id} className="flex items-center gap-3 rounded-[4px] border border-line bg-paper px-4 py-3">
                {n.pinned && (
                  <span className="rounded-[2px] bg-clay-deep px-1.5 py-0.5 font-kr text-[10px] font-bold text-cream-warm">고정</span>
                )}
                <span className="rounded-[2px] bg-cream-warm px-1.5 py-0.5 font-kr text-[10px] text-ink-soft">
                  {categoryLabel(n.category)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-kr text-sm font-medium text-ink">{n.title}</p>
                  <p className="font-kr text-xs text-ink-faint">
                    {n.publishedAt ? formatDateTime(n.publishedAt) : "발행일 미정"} · 조회 {n.viewCount}
                  </p>
                </div>

                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 font-kr text-xs",
                    st.tone === "live" && "bg-ink text-cream-warm",
                    st.tone === "scheduled" && "bg-clay-soft/60 text-clay-deep",
                    st.tone === "draft" && "bg-cream-warm text-ink-soft",
                    st.tone === "hidden" && "bg-line text-ink-soft",
                  )}
                >
                  {st.label}
                </span>

                <Link
                  href={`/admin/notice/${n.id}`}
                  className="rounded-[2px] border border-line px-3 py-1.5 font-kr text-xs text-ink transition hover:bg-clay-soft/40"
                >
                  수정
                </Link>
                <button
                  type="button"
                  onClick={() => remove(n.id, n.title)}
                  className="rounded-[2px] px-2 py-1.5 font-kr text-xs text-ink-faint transition hover:text-clay-deep"
                >
                  삭제
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
