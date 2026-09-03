"use client";

import { useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import { formatDateTime } from "@/lib/datetime";
import {
  CLAIM_REASONS,
  CLAIM_STATUS_LABEL,
  CLAIM_TYPE_LABEL,
  type ClaimType,
  type ClaimView,
  type OrderStatus,
} from "@/types/order";

/**
 * 주문 상세의 취소·반품·교환 신청 영역.
 *
 * 주문 상태에 따라 신청 가능한 종류가 다르다.
 *   결제완료·준비중 → 취소 / 배송중·배송완료 → 반품·교환
 * 서버가 최종 판단하지만, 화면에서도 맞는 선택지만 보여준다.
 */
export function ClaimSection({ orderNo, status }: { orderNo: string; status: OrderStatus }) {
  const [claims, setClaims] = useState<ClaimView[]>([]);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ClaimType | "">("");
  const [reasonCode, setReasonCode] = useState("");
  const [reasonText, setReasonText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCancel = status === "PENDING" || status === "PAID" || status === "PREPARING";
  const canReturn = status === "SHIPPED" || status === "DELIVERED";
  const available: ClaimType[] = canCancel ? ["CANCEL"] : canReturn ? ["RETURN", "EXCHANGE"] : [];

  useEffect(() => {
    api.get<ClaimView[]>(`/api/orders/${orderNo}/claims`).then(setClaims).catch(() => {});
  }, [orderNo]);

  async function submit() {
    setError(null);
    if (!type || !reasonCode) {
      setError("종류와 사유를 선택해 주세요.");
      return;
    }
    setBusy(true);
    try {
      const created = await api.post<ClaimView>(`/api/orders/${orderNo}/claims`, {
        type,
        reasonCode,
        reasonText,
      });
      setClaims((list) => [created, ...list]);
      setOpen(false);
      setType("");
      setReasonCode("");
      setReasonText("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "신청에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 rounded-[4px] border border-line bg-paper p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-kr text-sm font-bold text-ink">취소 · 반품 · 교환</h2>
        {available.length > 0 && !open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-[2px] border border-line px-3 py-1.5 font-kr text-xs text-ink transition hover:bg-ink hover:text-cream-warm"
          >
            신청하기
          </button>
        )}
      </div>

      {available.length === 0 && claims.length === 0 && (
        <p className="mt-2 font-kr text-xs text-ink-faint">
          현재 상태에서는 신청할 수 없습니다. 문의가 필요하면 고객센터로 연락해 주세요.
        </p>
      )}

      {/* 신청 폼 */}
      {open && (
        <div className="mt-4 flex flex-col gap-3 rounded-[3px] bg-cream-warm/50 p-4">
          <label className="block">
            <span className="mb-1 block font-kr text-xs font-medium text-ink-soft">종류</span>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as ClaimType);
                setReasonCode("");
              }}
              className="h-[42px] w-full rounded-[3px] border border-line bg-paper px-3 font-kr text-sm text-ink outline-none focus:border-clay-deep"
            >
              <option value="">선택</option>
              {available.map((t) => (
                <option key={t} value={t}>
                  {CLAIM_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </label>

          {type && (
            <label className="block">
              <span className="mb-1 block font-kr text-xs font-medium text-ink-soft">사유</span>
              <select
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value)}
                className="h-[42px] w-full rounded-[3px] border border-line bg-paper px-3 font-kr text-sm text-ink outline-none focus:border-clay-deep"
              >
                <option value="">선택</option>
                {CLAIM_REASONS[type].map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block">
            <span className="mb-1 block font-kr text-xs font-medium text-ink-soft">상세 내용 (선택)</span>
            <textarea
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full rounded-[3px] border border-line bg-paper px-3 py-2 font-kr text-sm text-ink outline-none focus:border-clay-deep"
            />
          </label>

          <p className="font-kr text-xs text-ink-faint">
            식품 특성상 단순 변심 반품은 개봉·훼손 시 제한될 수 있습니다.{" "}
            <a href="/policy/shipping" className="text-clay-deep underline underline-offset-2">
              정책 보기
            </a>
          </p>

          {error && <p className="font-kr text-xs text-clay-deep">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="rounded-[2px] bg-ink px-4 py-2 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-50"
            >
              {busy ? "접수 중…" : "신청 접수"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-[2px] border border-line px-4 py-2 font-kr text-sm text-ink"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 신청 내역 */}
      {claims.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {claims.map((c) => (
            <li key={c.id} className="rounded-[3px] border border-line px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="font-kr text-sm font-medium text-ink">
                  {CLAIM_TYPE_LABEL[c.type]}
                </span>
                <span className="rounded-full bg-cream-warm px-2 py-0.5 font-kr text-[11px] text-clay-deep">
                  {CLAIM_STATUS_LABEL[c.status]}
                </span>
              </div>
              <p className="mt-1 font-kr text-xs text-ink-faint">
                {formatDateTime(c.requestedAt)} 접수
                {c.processedAt ? ` · ${formatDateTime(c.processedAt)} 처리` : ""}
              </p>
              {c.adminMemo && <p className="mt-1 font-kr text-xs text-ink-soft">{c.adminMemo}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
