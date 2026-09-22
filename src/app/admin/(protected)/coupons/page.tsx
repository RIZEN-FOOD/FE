"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import { formatDateTime } from "@/lib/datetime";
import type { CouponAdminItem } from "@/types/coupon";

/**
 * 할인코드 관리 목록.
 *
 * 코드마다 지금 상태(사용 중·시작 전·끝남·소진·꺼짐)와 성과(사용 건수·매출·깎아준 금액)를
 * 한 줄에 같이 보여준다. 협찬처럼 "누가 데려왔나"를 보려고 만든 기능이라, 목록 자체가
 * 집계 화면 노릇을 한다.
 */
const won = (n: number) => n.toLocaleString("ko-KR");

const STATE_STYLE: Record<string, string> = {
  "사용 중": "bg-ink text-cream-warm",
  "시작 전": "bg-clay-soft/60 text-clay-deep",
  "끝남": "bg-line text-ink-soft",
  "소진": "bg-line text-ink-soft",
  "꺼짐": "bg-line text-ink-soft",
};

export default function AdminCouponsPage() {
  const [items, setItems] = useState<CouponAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api.get<CouponAdminItem[]>("/api/admin/coupons"));
    } catch (e) {
      setMessage(e instanceof ApiError ? e.message : "할인코드를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 3000);
  }

  async function remove(c: CouponAdminItem) {
    if (!window.confirm(`"${c.name}" (${c.code}) 할인코드를 삭제합니다.\n되돌릴 수 없습니다. 계속할까요?`)) return;
    if (!window.confirm("정말 삭제하시겠어요?")) return;
    try {
      await api.delete(`/api/admin/coupons/${c.id}`);
      setItems((list) => list.filter((x) => x.id !== c.id));
      flash("삭제되었습니다.");
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "삭제에 실패했습니다.");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-kr text-2xl font-bold text-ink">할인코드</h1>
          <p className="mt-1 font-kr text-sm text-ink-soft">
            손님이 결제 화면에서 직접 입력하는 코드입니다. 기간이 지나거나 수량이 다 쓰이면 자동으로 닫힙니다.
          </p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="rounded-[2px] bg-ink px-4 py-2.5 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep"
        >
          + 할인코드 등록
        </Link>
      </div>

      {message && (
        <p className="mt-4 rounded-[3px] bg-clay-soft/40 px-3 py-2 font-kr text-sm text-clay-deep">{message}</p>
      )}

      {loading ? (
        <p className="mt-10 font-kr text-sm text-ink-faint">불러오는 중…</p>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-[4px] border border-dashed border-line px-6 py-12 text-center">
          <p className="font-kr text-sm text-ink-soft">아직 만든 할인코드가 없습니다.</p>
          <p className="mt-1 font-kr text-xs text-ink-faint">
            오른쪽 위 &ldquo;할인코드 등록&rdquo;으로 첫 코드를 만들어 보세요.
          </p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {items.map((c) => (
            <li key={c.id} className="rounded-[4px] border border-line bg-paper px-4 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`shrink-0 rounded-full px-2.5 py-1 font-kr text-xs ${STATE_STYLE[c.state] ?? "bg-line text-ink-soft"}`}>
                  {c.state}
                </span>
                <span className="font-numeric text-base font-bold tracking-[0.06em] text-ink">{c.code}</span>
                <span className="min-w-0 flex-1 truncate font-kr text-sm text-ink-soft">{c.name}</span>

                <Link
                  href={`/admin/coupons/${c.id}`}
                  className="rounded-[2px] border border-line px-3 py-1.5 font-kr text-xs text-ink transition hover:bg-clay-soft/40"
                >
                  수정
                </Link>
                <button
                  type="button"
                  onClick={() => remove(c)}
                  className="rounded-[2px] px-2 py-1.5 font-kr text-xs text-ink-faint transition hover:text-clay-deep"
                >
                  삭제
                </button>
              </div>

              <p className="mt-2 font-kr text-xs text-ink-soft">
                {c.discountType === "PERCENT"
                  ? `${c.discountValue}% 할인${c.maxDiscount ? ` (최대 ${won(c.maxDiscount)}원)` : ""}`
                  : `${won(c.discountValue)}원 할인`}
                {c.minOrderAmount > 0 && ` · ${won(c.minOrderAmount)}원 이상`}
                {` · 한 사람당 ${c.perMemberLimit > 0 ? `${c.perMemberLimit}회` : "제한 없음"}`}
                {` · ${formatDateTime(c.startAt)} ~ ${formatDateTime(c.endAt)}`}
              </p>

              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-3 font-kr text-xs">
                <div className="flex gap-1.5">
                  <dt className="text-ink-faint">사용</dt>
                  <dd className="font-numeric text-ink">
                    {won(c.orderCount)}건
                    {c.totalQuantity != null && (
                      <span className="text-ink-faint"> / {won(c.totalQuantity)}</span>
                    )}
                  </dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="text-ink-faint">이 코드로 난 매출</dt>
                  <dd className="font-numeric text-ink">{won(c.salesAmount)}원</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="text-ink-faint">깎아준 금액</dt>
                  <dd className="font-numeric text-clay-deep">{won(c.discountTotal)}원</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
