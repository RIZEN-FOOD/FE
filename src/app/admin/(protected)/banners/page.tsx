"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api/client";
import { formatDateTime } from "@/lib/datetime";
import { BANNER_POSITIONS, type BannerAdminItem } from "@/types/content";
import { cn } from "@/lib/cn";

/**
 * 배너 관리 목록. 위치별로 묶어 보여준다.
 * 노출 기간이 지난 배너는 "기간 종료"로 표시된다 — 자동으로 내려간 상태다.
 */
export default function AdminBannersPage() {
  const [items, setItems] = useState<BannerAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api.get<BannerAdminItem[]>("/api/admin/banners"));
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
    setItems((list) => list.map((b) => (b.id === id ? { ...b, visible: next } : b)));
    try {
      await api.patch(`/api/admin/banners/${id}/visibility`, { visible: next });
    } catch (e) {
      setItems(prev);
      flash(e instanceof ApiError ? e.message : "변경에 실패했습니다.");
    }
  }

  async function remove(id: number, title: string) {
    if (!window.confirm(`"${title}" 배너를 삭제합니다.\n되돌릴 수 없습니다. 계속할까요?`)) return;
    if (!window.confirm("정말 삭제하시겠어요?")) return;
    try {
      await api.delete(`/api/admin/banners/${id}`);
      setItems((list) => list.filter((b) => b.id !== id));
      flash("삭제되었습니다.");
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "삭제에 실패했습니다.");
    }
  }

  const byPosition = BANNER_POSITIONS.map((pos) => ({
    ...pos,
    banners: items.filter((b) => b.position === pos.value),
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-kr text-2xl font-bold text-ink">배너 관리</h1>
          <p className="mt-1 font-kr text-sm text-ink-soft">
            PC·모바일 이미지를 각각 올립니다. 노출 기간이 지나면 자동으로 내려갑니다.
          </p>
        </div>
        <Link
          href="/admin/banners/new"
          className="rounded-[2px] bg-ink px-4 py-2.5 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep"
        >
          + 새 배너 등록
        </Link>
      </div>

      {message && (
        <p className="mt-4 rounded-[3px] bg-clay-soft/40 px-3 py-2 font-kr text-sm text-clay-deep">{message}</p>
      )}

      {loading ? (
        <p className="mt-10 font-kr text-sm text-ink-faint">불러오는 중…</p>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-[4px] border border-dashed border-line px-6 py-12 text-center">
          <p className="font-kr text-sm text-ink-soft">아직 등록된 배너가 없습니다.</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {byPosition.map((group) => (
            <section key={group.value}>
              <h2 className="font-kr text-sm font-semibold text-ink-soft">{group.label}</h2>
              {group.banners.length === 0 ? (
                <p className="mt-2 font-kr text-xs text-ink-faint">이 위치에 등록된 배너가 없습니다.</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-2">
                  {group.banners.map((b) => (
                    <li key={b.id} className="flex items-center gap-3 rounded-[4px] border border-line bg-paper px-3 py-3">
                      <div className="h-14 w-24 shrink-0 overflow-hidden rounded-[3px] border border-line bg-cream-warm">
                        {b.imagePcUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.imagePcUrl} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-kr text-sm font-medium text-ink">{b.title}</p>
                        <p className="font-kr text-xs text-ink-soft">
                          {b.alwaysOn ? "상시 노출" : `${formatDateTime(b.startAt)} ~ ${formatDateTime(b.endAt)}`}
                        </p>
                      </div>

                      {/* 활성 여부 (기간·노출 종합) */}
                      {!b.visible ? (
                        <span className="rounded-full bg-line px-2.5 py-1 font-kr text-xs text-ink-soft">숨김</span>
                      ) : b.activeNow ? (
                        <span className="rounded-full bg-ink px-2.5 py-1 font-kr text-xs text-cream-warm">노출 중</span>
                      ) : (
                        <span className="rounded-full bg-clay-soft/60 px-2.5 py-1 font-kr text-xs text-clay-deep">기간 종료</span>
                      )}

                      <button
                        type="button"
                        onClick={() => toggle(b.id, !b.visible)}
                        className={cn(
                          "rounded-[2px] px-2.5 py-1.5 font-kr text-xs transition",
                          b.visible ? "text-ink-soft hover:bg-clay-soft/40" : "text-clay-deep hover:bg-clay-soft/40",
                        )}
                      >
                        {b.visible ? "숨기기" : "노출"}
                      </button>
                      <Link
                        href={`/admin/banners/${b.id}`}
                        className="rounded-[2px] border border-line px-3 py-1.5 font-kr text-xs text-ink transition hover:bg-clay-soft/40"
                      >
                        수정
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(b.id, b.title)}
                        className="rounded-[2px] px-2 py-1.5 font-kr text-xs text-ink-faint transition hover:text-clay-deep"
                      >
                        삭제
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
