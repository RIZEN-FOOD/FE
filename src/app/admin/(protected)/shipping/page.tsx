"use client";

import { useCallback, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api/client";

/**
 * 배송비 정책.
 *
 * ★ 배송비·무료배송 임계액은 코드가 아니라 여기서 정한다 (CLAUDE.md 규칙 5).
 *   여기서 바꾼 값이 결제 금액과 배송·교환·환불 안내에 그대로 반영된다.
 *
 * 비개발자(대표)가 쓰는 화면이라 전문용어를 피하고, 지금 규칙을 한 줄로 미리 보여준다.
 */
type Policy = {
  id: number;
  name: string;
  baseFee: number;
  freeThreshold: number | null;
  islandExtraFee: number;
};

export default function AdminShippingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [baseFee, setBaseFee] = useState("");
  const [freeThreshold, setFreeThreshold] = useState("");
  const [islandExtraFee, setIslandExtraFee] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await api.get<Policy>("/api/admin/shipping-policy");
      setBaseFee(String(p.baseFee));
      setFreeThreshold(p.freeThreshold == null ? "" : String(p.freeThreshold));
      setIslandExtraFee(String(p.islandExtraFee));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "배송비 정책을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function flash(t: string) {
    setMessage(t);
    window.setTimeout(() => setMessage(null), 2800);
  }

  const won = (s: string) => {
    const n = Number(s);
    return Number.isFinite(n) ? n.toLocaleString("ko-KR") : "0";
  };

  async function save() {
    setMessage(null);
    const base = Number(baseFee || 0);
    const free = freeThreshold.trim() === "" ? null : Number(freeThreshold);
    const island = Number(islandExtraFee || 0);
    if ([base, island].some((v) => !Number.isFinite(v) || v < 0) || (free != null && (!Number.isFinite(free) || free < 0))) {
      flash("금액은 0원 이상 숫자로 입력해 주세요.");
      return;
    }
    setSaving(true);
    try {
      await api.put("/api/admin/shipping-policy", {
        baseFee: base,
        freeThreshold: free,
        islandExtraFee: island,
      });
      flash("저장되었습니다.");
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="font-kr text-sm text-ink-faint">불러오는 중…</p>;
  }
  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="font-kr text-sm text-clay-deep">{error}</p>
        <button
          type="button"
          onClick={load}
          className="mt-3 rounded-[3px] border border-line px-4 py-2 font-kr text-sm text-ink hover:bg-clay-soft/40"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-kr text-2xl font-bold text-ink">배송비 정책</h1>
          <p className="mt-1 font-kr text-sm text-ink-soft">
            여기서 정한 배송비가 결제 금액과 배송·교환·환불 안내에 바로 반영됩니다.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-[2px] bg-ink px-4 py-2.5 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-50"
        >
          {saving ? "저장 중…" : "저장하기"}
        </button>
      </div>

      {message && (
        <p className="mt-4 rounded-[3px] bg-clay-soft/40 px-3 py-2 font-kr text-sm text-clay-deep">{message}</p>
      )}

      {/* 지금 규칙 미리보기 */}
      <div className="mt-6 rounded-[4px] border border-line bg-cream-warm px-5 py-4">
        <p className="font-kr text-sm text-ink">
          지금 규칙:{" "}
          <b className="font-numeric">{won(baseFee)}원</b> 배송비
          {freeThreshold.trim() !== "" ? (
            <>
              , <b className="font-numeric">{won(freeThreshold)}원</b> 이상 구매 시 <b>무료</b>
            </>
          ) : (
            <>, 무료배송 없음</>
          )}
          {Number(islandExtraFee) > 0 && (
            <>
              {" "}
              (도서산간 <b className="font-numeric">{won(islandExtraFee)}원</b> 추가)
            </>
          )}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-5 rounded-[4px] border border-line bg-paper px-5 py-5">
        <NumberField
          label="기본 배송비 (원)"
          hint="한 번 주문할 때 붙는 배송비입니다."
          value={baseFee}
          onChange={setBaseFee}
        />
        <NumberField
          label="무료배송 기준 금액 (원)"
          hint="상품 금액이 이 금액 이상이면 배송비를 받지 않습니다. 비워두면 무료배송이 없습니다."
          value={freeThreshold}
          onChange={setFreeThreshold}
          placeholder="예: 50000"
        />
        <NumberField
          label="도서산간 추가 배송비 (원)"
          hint="제주·도서 지역에 더 받는 금액입니다. 없으면 0."
          value={islandExtraFee}
          onChange={setIslandExtraFee}
        />
      </div>
    </div>
  );
}

function NumberField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block font-kr text-sm font-medium text-ink">{label}</span>
      <span className="mb-1.5 mt-0.5 block font-kr text-xs leading-relaxed text-ink-faint">{hint}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
        inputMode="numeric"
        placeholder={placeholder}
        className="h-[46px] w-full max-w-xs rounded-[3px] border border-line bg-cream-warm/40 px-3 font-kr text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-clay-deep"
      />
    </label>
  );
}
