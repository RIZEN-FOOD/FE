"use client";

import { useState } from "react";

import { api, ApiError } from "@/lib/api/client";

/**
 * 결제 화면의 할인코드 칸.
 *
 * ★ 할인 금액을 화면에서 만들지 않는다. 코드만 서버로 보내고 서버가 장바구니를
 *   다시 읽어 계산한 값을 그대로 받아 쓴다. 주문을 만들 때 한 번 더 검증된다.
 * ★ 못 쓰는 코드일 때 서버가 이유를 문장으로 내려준다("기간이 끝난…", "3만원 이상…").
 *   그대로 보여준다 — 여기서 고쳐 쓰면 실제 사유와 어긋난다.
 */
export type AppliedCoupon = {
  code: string;
  name: string;
  discountAmount: number;
  /**
   * 할인을 뺀 금액으로 다시 계산한 배송비 (도서산간 추가분 제외).
   * 무료배송 기준 위였던 주문이 할인 뒤에 기준 아래로 내려가면 여기에 배송비가 잡힌다.
   * 화면이 스스로 계산하지 않고 서버가 준 값을 그대로 쓴다.
   */
  shippingFee: number;
};

export function CouponField({
  ordererPhone,
  applied,
  onApply,
  onClear,
}: {
  /** 비회원의 "1인 n회"를 결제 전에 알려주려고 함께 보낸다. 없으면 서버가 그 검사만 건너뛴다. */
  ordererPhone?: string;
  applied: AppliedCoupon | null;
  onApply: (c: AppliedCoupon) => void;
  onClear: () => void;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apply() {
    const trimmed = code.trim();
    if (!trimmed) {
      setError("할인코드를 입력해 주세요.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await api.post<{
        code: string;
        name: string;
        discountAmount: number;
        shippingFee: number;
      }>("/api/orders/coupon-preview", { code: trimmed, ordererPhone: ordererPhone || undefined });
      onApply({
        code: res.code,
        name: res.name,
        discountAmount: res.discountAmount,
        shippingFee: res.shippingFee,
      });
      setCode("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "확인하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  if (applied) {
    return (
      <div className="mt-5 rounded-[6px] border border-clay-deep/40 bg-cream-warm px-3 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-kr text-sm font-medium text-ink">
              할인코드 <span className="font-numeric">{applied.code}</span>
            </p>
            <p className="mt-0.5 truncate font-kr text-caption text-ink-soft">{applied.name}</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 font-kr text-caption text-ink-soft underline-offset-4 hover:text-ink hover:underline"
          >
            해제
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <label htmlFor="coupon-code" className="font-kr text-sm font-medium text-ink">
        할인코드
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="coupon-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            // 결제 화면 전체가 form 이라 Enter 가 주문 제출로 가지 않게 막는다.
            if (e.key === "Enter") {
              e.preventDefault();
              void apply();
            }
          }}
          placeholder="코드를 입력하세요"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={60}
          className="h-11 min-w-0 flex-1 rounded-[6px] border border-line bg-paper px-3 font-numeric text-sm tracking-[0.04em] text-ink outline-none transition placeholder:font-kr placeholder:tracking-normal placeholder:text-ink-faint focus:border-clay-deep"
        />
        <button
          type="button"
          onClick={apply}
          disabled={busy}
          className="h-11 shrink-0 rounded-[6px] border border-ink/25 px-4 font-kr text-sm font-medium text-ink transition hover:bg-ink hover:text-cream-warm disabled:opacity-50"
        >
          {busy ? "확인 중…" : "적용"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 font-kr text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
