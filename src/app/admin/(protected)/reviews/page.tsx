"use client";

import { useCallback, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import { formatDateTime } from "@/lib/datetime";
import { cn } from "@/lib/cn";

type AdminReview = {
  id: number;
  authorName: string;
  rating: number;
  content: string;
  visible: boolean;
  sponsored: boolean;
  hiddenReason: string | null;
  imageUrls: string[];
  createdAt: string;
  productSlug: string;
  productName: string;
};
type ReviewPage = { items: AdminReview[]; totalCount: number };

/**
 * 후기 관리.
 *
 * ★ 후기는 기본 비공개다(광고 규제, 기획서 §9). 관리자가 확인하고 승인해야 노출된다.
 *   효능을 단정하는 표현이 있으면 숨기고 사유를 남긴다.
 */
export default function AdminReviewsPage() {
  const [data, setData] = useState<ReviewPage | null>(null);
  const [pendingOnly, setPendingOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api.get<ReviewPage>(`/api/admin/reviews?pendingOnly=${pendingOnly}&page=0&size=100`));
    } finally {
      setLoading(false);
    }
  }, [pendingOnly]);

  useEffect(() => {
    load();
  }, [load]);

  function flash(t: string) {
    setMessage(t);
    window.setTimeout(() => setMessage(null), 2800);
  }

  async function moderate(id: number, visible: boolean) {
    let reason: string | undefined;
    if (!visible) {
      reason = window.prompt("숨김 사유를 입력하세요 (내부 기록용).") ?? undefined;
      if (reason === undefined) return;
    }
    setBusyId(id);
    try {
      await api.patch(`/api/admin/reviews/${id}/visibility`, { visible, reason });
      await load();
      flash(visible ? "노출 승인했습니다." : "숨김 처리했습니다.");
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "처리에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("이 후기를 삭제합니다. 되돌릴 수 없습니다. 계속할까요?")) return;
    setBusyId(id);
    try {
      await api.delete(`/api/admin/reviews/${id}`);
      await load();
      flash("삭제되었습니다.");
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "삭제에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-kr text-2xl font-bold text-ink">후기 관리</h1>
      <p className="mt-1 font-kr text-sm text-ink-soft">
        후기는 승인해야 사이트에 노출됩니다. 효능·효과를 단정하는 표현은 숨김 처리해 주세요.
      </p>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setPendingOnly(true)}
          className={cn("rounded-full border px-3.5 py-1.5 font-kr text-xs transition",
            pendingOnly ? "border-ink bg-ink text-cream-warm" : "border-line text-ink-soft hover:border-ink")}
        >
          승인 대기
        </button>
        <button
          type="button"
          onClick={() => setPendingOnly(false)}
          className={cn("rounded-full border px-3.5 py-1.5 font-kr text-xs transition",
            !pendingOnly ? "border-ink bg-ink text-cream-warm" : "border-line text-ink-soft hover:border-ink")}
        >
          전체
        </button>
      </div>

      {message && (
        <p className="mt-4 rounded-[3px] bg-clay-soft/40 px-3 py-2 font-kr text-sm text-clay-deep">{message}</p>
      )}

      {loading ? (
        <p className="mt-10 font-kr text-sm text-ink-faint">불러오는 중…</p>
      ) : !data || data.items.length === 0 ? (
        <p className="mt-10 font-kr text-sm text-ink-faint">
          {pendingOnly ? "승인 대기 중인 후기가 없습니다." : "후기가 없습니다."}
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {data.items.map((r) => (
            <li key={r.id} className="rounded-[4px] border border-line bg-paper p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-numeric text-sm text-clay-deep">
                    {"★".repeat(r.rating)}
                    <span className="text-line">{"★".repeat(5 - r.rating)}</span>
                  </span>
                  <span className="font-kr text-sm font-medium text-ink">{r.authorName}</span>
                  {r.sponsored && (
                    <span className="rounded-full bg-clay-soft px-2 py-0.5 font-kr text-[10px] text-clay-deep">광고</span>
                  )}
                  <span className={cn("rounded-full px-2 py-0.5 font-kr text-[10px]",
                    r.visible ? "bg-ink text-cream-warm" : "bg-line text-ink-soft")}>
                    {r.visible ? "노출 중" : "비공개"}
                  </span>
                </div>
                <span className="font-kr text-xs text-ink-faint">{formatDateTime(r.createdAt)}</span>
              </div>

              <p className="mt-1 font-kr text-xs text-ink-faint">{r.productName}</p>
              <p className="mt-2 whitespace-pre-line font-kr text-sm leading-relaxed text-ink">{r.content}</p>

              {r.imageUrls.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {r.imageUrls.map((u, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={u} alt="" className="h-16 w-16 rounded-[3px] object-cover" />
                  ))}
                </div>
              )}
              {r.hiddenReason && (
                <p className="mt-2 font-kr text-xs text-ink-faint">숨김 사유: {r.hiddenReason}</p>
              )}

              <div className="mt-3 flex gap-2">
                {!r.visible ? (
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => moderate(r.id, true)}
                    className="rounded-[2px] bg-ink px-3 py-1.5 font-kr text-xs font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-50"
                  >
                    노출 승인
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => moderate(r.id, false)}
                    className="rounded-[2px] border border-line px-3 py-1.5 font-kr text-xs text-ink transition hover:bg-clay-soft/40 disabled:opacity-50"
                  >
                    숨기기
                  </button>
                )}
                <button
                  type="button"
                  disabled={busyId === r.id}
                  onClick={() => remove(r.id)}
                  className="rounded-[2px] px-3 py-1.5 font-kr text-xs text-ink-faint transition hover:text-clay-deep disabled:opacity-50"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
