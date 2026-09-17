"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/datetime";
import type { PopupAdminItem } from "@/types/popup";

/**
 * 팝업 관리 목록.
 *
 * 메인 화면에 들어오면 위에서부터 순서대로 하나씩 뜬다. 위/아래로 순서를 바꾸고 저장한다.
 * 노출 기간이 지난 팝업은 "기간 종료"로 표시된다 — 자동으로 내려간 상태다.
 */
export default function AdminPopupsPage() {
  const [items, setItems] = useState<PopupAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api.get<PopupAdminItem[]>("/api/admin/popups"));
      setOrderDirty(false);
    } catch (e) {
      setMessage(e instanceof ApiError ? e.message : "팝업을 불러오지 못했습니다.");
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

  async function toggle(id: number, next: boolean) {
    const prev = items;
    setItems((list) => list.map((p) => (p.id === id ? { ...p, visible: next, activeNow: next && p.activeNow } : p)));
    try {
      await api.patch(`/api/admin/popups/${id}/visibility`, { visible: next });
      await load();
    } catch (e) {
      setItems(prev);
      flash(e instanceof ApiError ? e.message : "변경에 실패했습니다.");
    }
  }

  async function remove(id: number, title: string) {
    if (!window.confirm(`"${title}" 팝업을 삭제합니다.\n되돌릴 수 없습니다. 계속할까요?`)) return;
    if (!window.confirm("정말 삭제하시겠어요?")) return;
    try {
      await api.delete(`/api/admin/popups/${id}`);
      setItems((list) => list.filter((p) => p.id !== id));
      flash("삭제되었습니다.");
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "삭제에 실패했습니다.");
    }
  }

  function move(index: number, dir: -1 | 1) {
    const to = index + dir;
    if (to < 0 || to >= items.length) return;
    setItems((list) => {
      const next = [...list];
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
    setOrderDirty(true);
  }

  async function saveOrder() {
    try {
      await api.put("/api/admin/popups/order", { ids: items.map((p) => p.id) });
      setOrderDirty(false);
      flash("순서가 저장되었습니다.");
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "순서 저장에 실패했습니다.");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-kr text-2xl font-bold text-ink">팝업 관리</h1>
          <p className="mt-1 font-kr text-sm text-ink-soft">
            메인 화면에 들어오면 위에서부터 하나씩 뜹니다. 노출 기간이 지나면 자동으로 내려갑니다.
          </p>
        </div>
        <div className="flex gap-2">
          {orderDirty && (
            <button
              type="button"
              onClick={saveOrder}
              className="rounded-[2px] border border-ink px-4 py-2.5 font-kr text-sm font-bold text-ink transition hover:bg-clay-soft/40"
            >
              순서 저장
            </button>
          )}
          <Link
            href="/admin/popups/new"
            className="rounded-[2px] bg-ink px-4 py-2.5 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep"
          >
            + 팝업 등록
          </Link>
        </div>
      </div>

      {message && (
        <p className="mt-4 rounded-[3px] bg-clay-soft/40 px-3 py-2 font-kr text-sm text-clay-deep">{message}</p>
      )}

      {loading ? (
        <p className="mt-10 font-kr text-sm text-ink-faint">불러오는 중…</p>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-[4px] border border-dashed border-line px-6 py-12 text-center">
          <p className="font-kr text-sm text-ink-soft">아직 등록된 팝업이 없습니다.</p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {items.map((p, i) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-[4px] border border-line bg-paper px-3 py-3">
              <div className="flex flex-col">
                <button
                  type="button"
                  aria-label="위로"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className="px-1.5 text-xs text-ink-soft disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  aria-label="아래로"
                  disabled={i === items.length - 1}
                  onClick={() => move(i, 1)}
                  className="px-1.5 text-xs text-ink-soft disabled:opacity-30"
                >
                  ▼
                </button>
              </div>
              <div className="h-16 w-14 shrink-0 overflow-hidden rounded-[3px] border border-line bg-cream-warm">
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-kr text-sm font-medium text-ink">{p.title}</p>
                <p className="font-kr text-xs text-ink-soft">
                  {p.alwaysOn ? "기간 없이 계속" : `${formatDateTime(p.startAt)} ~ ${formatDateTime(p.endAt)}`}
                  {p.showLinkButton && p.linkUrl ? " · 이동 버튼" : ""}
                  {p.showHideToday ? " · 오늘 하루 보지 않기" : ""}
                </p>
              </div>

              {!p.visible ? (
                <span className="rounded-full bg-line px-2.5 py-1 font-kr text-xs text-ink-soft">숨김</span>
              ) : p.activeNow ? (
                <span className="rounded-full bg-ink px-2.5 py-1 font-kr text-xs text-cream-warm">노출 중</span>
              ) : (
                <span className="rounded-full bg-clay-soft/60 px-2.5 py-1 font-kr text-xs text-clay-deep">기간 밖</span>
              )}

              <button
                type="button"
                onClick={() => toggle(p.id, !p.visible)}
                className={cn(
                  "rounded-[2px] px-2.5 py-1.5 font-kr text-xs transition",
                  p.visible ? "text-ink-soft hover:bg-clay-soft/40" : "text-clay-deep hover:bg-clay-soft/40",
                )}
              >
                {p.visible ? "숨기기" : "노출"}
              </button>
              <Link
                href={`/admin/popups/${p.id}`}
                className="rounded-[2px] border border-line px-3 py-1.5 font-kr text-xs text-ink transition hover:bg-clay-soft/40"
              >
                수정
              </Link>
              <button
                type="button"
                onClick={() => remove(p.id, p.title)}
                className="rounded-[2px] px-2 py-1.5 font-kr text-xs text-ink-faint transition hover:text-clay-deep"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
