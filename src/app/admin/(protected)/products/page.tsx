"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api/client";
import type { AdminProductListItem, AdminProductPage } from "@/types/product";
import { cn } from "@/lib/cn";

/**
 * 상품 관리 목록.  ★ 기획서 §7.2 의 가장 중요한 화면.
 *
 * - 드래그로 순서 변경 (놓으면 바로 저장)
 * - 메인노출(★) / 노출 토글 (누르면 바로 반영)
 * - 재고 표시 (관리자만 본다)
 * - 삭제는 이중 확인
 *
 * 드래그는 라이브러리 없이 HTML5 기본 기능으로 구현한다.
 * 비개발자를 위해 순서 이동 버튼(위/아래)도 함께 둔다 — 드래그가 어려운 사람용.
 */
export default function AdminProductsPage() {
  const [items, setItems] = useState<AdminProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<AdminProductPage>("/api/admin/products?page=0&size=100");
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

  async function toggle(id: number, field: "visible" | "featured", next: boolean) {
    // 낙관적 업데이트 — 먼저 화면을 바꾸고, 실패하면 되돌린다.
    const prev = items;
    setItems((list) => list.map((p) => (p.id === id ? { ...p, [field]: next } : p)));
    try {
      await api.patch(`/api/admin/products/${id}/visibility`, { [field]: next });
    } catch (e) {
      setItems(prev);
      flash(e instanceof ApiError ? e.message : "변경에 실패했습니다.");
    }
  }

  async function persistOrder(ordered: AdminProductListItem[]) {
    const prev = items;
    setItems(ordered);
    try {
      await api.patch("/api/admin/products/order", { orderedIds: ordered.map((p) => p.id) });
      flash("순서가 저장되었습니다.");
    } catch {
      setItems(prev);
      flash("순서 저장에 실패했습니다.");
    }
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    persistOrder(next);
  }

  function onDrop(targetId: number) {
    if (dragId === null || dragId === targetId) return;
    const from = items.findIndex((p) => p.id === dragId);
    const to = items.findIndex((p) => p.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setDragId(null);
    persistOrder(next);
  }

  async function remove(id: number, name: string) {
    // 삭제는 이중 확인 (기획서 §7).
    if (!window.confirm(`"${name}" 상품을 삭제합니다.\n되돌릴 수 없습니다. 계속할까요?`)) return;
    if (!window.confirm("정말 삭제하시겠어요? 이 작업은 취소할 수 없습니다.")) return;
    try {
      await api.delete(`/api/admin/products/${id}`);
      setItems((list) => list.filter((p) => p.id !== id));
      flash("삭제되었습니다.");
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "삭제에 실패했습니다.");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-kr text-2xl font-bold text-ink">상품 관리</h1>
          <p className="mt-1 font-kr text-sm text-ink-soft">
            순서를 끌어서 바꾸고, 별(★)로 메인 노출을 켭니다.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-[2px] bg-ink px-4 py-2.5 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep"
        >
          + 새 상품 등록
        </Link>
      </div>

      {message && (
        <p className="mt-4 rounded-[3px] bg-clay-soft/40 px-3 py-2 font-kr text-sm text-clay-deep">{message}</p>
      )}

      {loading ? (
        <p className="mt-10 font-kr text-sm text-ink-faint">불러오는 중…</p>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-[4px] border border-dashed border-line px-6 py-12 text-center">
          <p className="font-kr text-sm text-ink-soft">아직 등록된 상품이 없습니다.</p>
          <Link
            href="/admin/products/new"
            className="mt-3 inline-block font-kr text-sm font-bold text-clay-deep underline underline-offset-4"
          >
            첫 상품 등록하기
          </Link>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {items.map((p, i) => (
            <li
              key={p.id}
              draggable
              onDragStart={() => setDragId(p.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(p.id)}
              className={cn(
                "flex items-center gap-3 rounded-[4px] border bg-paper px-3 py-3 transition",
                dragId === p.id ? "border-clay-deep opacity-60" : "border-line",
              )}
            >
              {/* 순서 이동 버튼 (드래그 대체) */}
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="px-1 text-ink-faint hover:text-ink disabled:opacity-30"
                  aria-label="위로"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  className="px-1 text-ink-faint hover:text-ink disabled:opacity-30"
                  aria-label="아래로"
                >
                  ▼
                </button>
              </div>

              {/* 썸네일 */}
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[3px] border border-line bg-cream-warm">
                {p.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-en text-[9px] text-ink-faint">
                    no img
                  </div>
                )}
              </div>

              {/* 이름 · 가격 · 재고 */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-kr text-sm font-medium text-ink">{p.nameKo}</p>
                <p className="font-numeric text-xs text-ink-soft">
                  {(p.discountPrice ?? p.price).toLocaleString("ko-KR")}원
                  {p.discountPrice != null && (
                    <span className="ml-1 text-ink-faint line-through">{p.price.toLocaleString("ko-KR")}</span>
                  )}
                  <span className={cn("ml-2", p.stock === 0 ? "text-clay-deep" : "text-ink-faint")}>
                    재고 {p.stock}
                  </span>
                </p>
              </div>

              {/* 메인노출 토글 (별) */}
              <button
                type="button"
                onClick={() => toggle(p.id, "featured", !p.featured)}
                className={cn("px-2 text-lg", p.featured ? "text-clay-deep" : "text-line hover:text-ink-faint")}
                aria-label={p.featured ? "메인 노출 끄기" : "메인 노출 켜기"}
                title="메인 노출"
              >
                {p.featured ? "★" : "☆"}
              </button>

              {/* 노출 토글 */}
              <button
                type="button"
                onClick={() => toggle(p.id, "visible", !p.visible)}
                className={cn(
                  "rounded-full px-2.5 py-1 font-kr text-xs font-medium transition",
                  p.visible ? "bg-ink text-cream-warm" : "bg-line text-ink-soft",
                )}
                title="사이트 노출"
              >
                {p.visible ? "노출 중" : "숨김"}
              </button>

              {/* 수정 · 삭제 */}
              <Link
                href={`/admin/products/${p.id}`}
                className="rounded-[2px] border border-line px-3 py-1.5 font-kr text-xs text-ink transition hover:bg-clay-soft/40"
              >
                수정
              </Link>
              <button
                type="button"
                onClick={() => remove(p.id, p.nameKo)}
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
