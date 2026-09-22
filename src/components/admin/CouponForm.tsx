"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import type { CouponAdminItem, CouponSaveRequest, DiscountType } from "@/types/coupon";

/**
 * 할인코드 등록·수정 폼.
 *
 * 대표가 개발자 없이 쓰는 화면이다 (CLAUDE.md 규칙 4).
 *   - "정률/정액" 같은 말 대신 "비율(%)/금액(원)"
 *   - 칸마다 무엇을 넣는지 한 줄 안내
 *   - 저장 전에 "이렇게 적용됩니다" 문장으로 다시 보여준다
 *
 * 날짜는 <input type="datetime-local"> 로 받는다. 그 값은 브라우저 시간대의
 * "벽시계 시각"이라 그대로 보내면 안 된다. Date 로 만들어 UTC(ISO)로 바꿔 보내고,
 * 받아올 때는 반대로 되돌린다.
 */
function toLocalInput(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIso(local: string): string {
  return local ? new Date(local).toISOString() : "";
}

const LABEL = "block font-kr text-sm font-medium text-ink";
const HINT = "mt-1 font-kr text-xs text-ink-faint";
const INPUT =
  "mt-2 h-11 w-full rounded-[3px] border border-line bg-paper px-3 font-kr text-sm text-ink outline-none transition focus:border-clay-deep";

export function CouponForm({ initial }: { initial?: CouponAdminItem }) {
  const router = useRouter();
  const editing = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [code, setCode] = useState(initial?.code ?? "");
  const [discountType, setDiscountType] = useState<DiscountType>(initial?.discountType ?? "PERCENT");
  const [discountValue, setDiscountValue] = useState(String(initial?.discountValue ?? ""));
  const [maxDiscount, setMaxDiscount] = useState(initial?.maxDiscount != null ? String(initial.maxDiscount) : "");
  const [minOrderAmount, setMinOrderAmount] = useState(String(initial?.minOrderAmount ?? 0));
  const [totalQuantity, setTotalQuantity] = useState(initial?.totalQuantity != null ? String(initial.totalQuantity) : "");
  const [perMemberLimit, setPerMemberLimit] = useState(String(initial?.perMemberLimit ?? 1));
  const [startAt, setStartAt] = useState(toLocalInput(initial?.startAt));
  const [endAt, setEndAt] = useState(toLocalInput(initial?.endAt));
  const [visible, setVisible] = useState(initial?.visible ?? false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const num = (s: string) => (s.trim() === "" ? null : Number(s));
  const won = (n: number) => n.toLocaleString("ko-KR");

  /** 저장 전에 대표가 눈으로 확인할 한 문장. */
  function summary(): string {
    const v = Number(discountValue) || 0;
    if (v <= 0) return "할인 값을 넣어주세요.";
    const head = discountType === "PERCENT" ? `주문 금액의 ${v}%` : `${won(v)}원`;
    const cap = discountType === "PERCENT" && maxDiscount ? `, 최대 ${won(Number(maxDiscount))}원까지` : "";
    const min = Number(minOrderAmount) > 0 ? ` ${won(Number(minOrderAmount))}원 이상 주문에서` : "";
    const qty = totalQuantity ? ` 총 ${won(Number(totalQuantity))}번까지` : " 수량 제한 없이";
    const per = Number(perMemberLimit) > 0 ? `, 한 사람당 ${perMemberLimit}번` : ", 한 사람이 여러 번";
    return `${min} ${head}${cap} 깎아 줍니다.${qty}${per} 쓸 수 있습니다.`.trim();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!startAt || !endAt) {
      setError("사용 기간을 정해 주세요.");
      return;
    }
    if (new Date(endAt) <= new Date(startAt)) {
      setError("종료 일시가 시작 일시보다 뒤여야 합니다.");
      return;
    }

    const payload: CouponSaveRequest = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue) || 0,
      maxDiscount: discountType === "PERCENT" ? num(maxDiscount) : null,
      minOrderAmount: Number(minOrderAmount) || 0,
      totalQuantity: num(totalQuantity),
      perMemberLimit: Number(perMemberLimit) || 0,
      startAt: toIso(startAt),
      endAt: toIso(endAt),
      visible,
    };

    setBusy(true);
    try {
      if (editing && initial) {
        await api.put(`/api/admin/coupons/${initial.id}`, payload);
      } else {
        await api.post("/api/admin/coupons", payload);
      }
      router.push("/admin/coupons");
      router.refresh();
    } catch (e2) {
      setError(e2 instanceof ApiError ? e2.message : "저장하지 못했습니다.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="mt-8 flex max-w-2xl flex-col gap-7">
      <div>
        <label htmlFor="c-name" className={LABEL}>이름</label>
        <p className={HINT}>관리자만 보는 이름입니다. 나중에 무엇이었는지 알아볼 수 있게 적어주세요.</p>
        <input id="c-name" value={name} onChange={(e) => setName(e.target.value)}
               required maxLength={200} placeholder="예) 몬스터하우스 크루 협찬" className={INPUT} />
      </div>

      <div>
        <label htmlFor="c-code" className={LABEL}>코드</label>
        <p className={HINT}>
          손님이 결제 화면에 직접 치는 글자입니다. 영문·숫자·하이픈(-)·밑줄(_)만 쓸 수 있고,
          대문자로 저장됩니다. 손님이 소문자로 쳐도 똑같이 적용됩니다.
        </p>
        <input id="c-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
               required minLength={2} maxLength={60} pattern="[A-Za-z0-9_-]+"
               placeholder="예) MONSTER10"
               className={`${INPUT} font-numeric tracking-[0.06em]`} />
      </div>

      <fieldset>
        <legend className={LABEL}>할인 방식</legend>
        <div className="mt-2 flex gap-2">
          {([["PERCENT", "비율 (%)"], ["AMOUNT", "금액 (원)"]] as const).map(([v, label]) => (
            <label key={v}
                   className={`cursor-pointer rounded-[3px] border px-4 py-2.5 font-kr text-sm transition ${
                     discountType === v ? "border-ink bg-ink text-cream-warm" : "border-line text-ink hover:bg-clay-soft/30"
                   }`}>
              <input type="radio" name="discountType" value={v} checked={discountType === v}
                     onChange={() => setDiscountType(v)} className="sr-only" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="c-value" className={LABEL}>
          {discountType === "PERCENT" ? "몇 퍼센트 깎을까요" : "얼마를 깎을까요"}
        </label>
        <p className={HINT}>
          {discountType === "PERCENT" ? "1~100 사이 숫자입니다." : "원 단위 숫자입니다."}
        </p>
        <input id="c-value" type="number" inputMode="numeric" min={1}
               max={discountType === "PERCENT" ? 100 : undefined}
               value={discountValue} onChange={(e) => setDiscountValue(e.target.value)}
               required className={INPUT} />
      </div>

      {discountType === "PERCENT" && (
        <div>
          <label htmlFor="c-max" className={LABEL}>최대 할인 금액 (선택)</label>
          <p className={HINT}>
            비워두면 상한이 없습니다. 비싼 주문에서 너무 많이 깎이는 것을 막고 싶을 때 넣습니다.
          </p>
          <input id="c-max" type="number" inputMode="numeric" min={1}
                 value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)}
                 placeholder="예) 5000" className={INPUT} />
        </div>
      )}

      <div>
        <label htmlFor="c-min" className={LABEL}>최소 주문금액</label>
        <p className={HINT}>이 금액보다 적게 담으면 코드가 적용되지 않습니다. 제한이 없으면 0.</p>
        <input id="c-min" type="number" inputMode="numeric" min={0}
               value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)}
               required className={INPUT} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-total" className={LABEL}>총 사용 횟수 (선택)</label>
          <p className={HINT}>다 쓰이면 자동으로 닫힙니다. 비워두면 무제한입니다.</p>
          <input id="c-total" type="number" inputMode="numeric" min={1}
                 value={totalQuantity} onChange={(e) => setTotalQuantity(e.target.value)}
                 placeholder="예) 200" className={INPUT} />
        </div>
        <div>
          <label htmlFor="c-per" className={LABEL}>한 사람당 횟수</label>
          <p className={HINT}>0을 넣으면 제한이 없습니다. 비회원은 주문자 연락처로 셉니다.</p>
          <input id="c-per" type="number" inputMode="numeric" min={0} max={100}
                 value={perMemberLimit} onChange={(e) => setPerMemberLimit(e.target.value)}
                 required className={INPUT} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-start" className={LABEL}>시작 일시</label>
          <input id="c-start" type="datetime-local" value={startAt}
                 onChange={(e) => setStartAt(e.target.value)} required className={INPUT} />
        </div>
        <div>
          <label htmlFor="c-end" className={LABEL}>종료 일시</label>
          <p className={HINT}>이 시각이 지나면 따로 끄지 않아도 막힙니다.</p>
          <input id="c-end" type="datetime-local" value={endAt}
                 onChange={(e) => setEndAt(e.target.value)} required className={INPUT} />
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-[3px] border border-line bg-paper px-4 py-3">
        <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)}
               className="h-4 w-4 accent-ink" />
        <span className="font-kr text-sm text-ink">
          지금 켜기
          <span className="ml-2 font-kr text-xs text-ink-faint">
            꺼두면 기간 안이라도 손님이 쓸 수 없습니다.
          </span>
        </span>
      </label>

      {/* 저장 전 확인 (CLAUDE.md 규칙 4 — 저장 전 미리보기) */}
      <div className="rounded-[3px] bg-cream-warm px-4 py-3">
        <p className="font-kr text-xs font-medium text-ink-soft">이렇게 적용됩니다</p>
        <p className="mt-1 font-kr text-sm text-ink">{summary()}</p>
      </div>

      {error && (
        <p role="alert" className="rounded-[3px] bg-danger/10 px-3 py-2 font-kr text-sm text-danger">{error}</p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={busy}
                className="rounded-[2px] bg-ink px-5 py-3 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-50">
          {busy ? "저장 중…" : editing ? "저장" : "등록"}
        </button>
        <button type="button" onClick={() => router.push("/admin/coupons")}
                className="rounded-[2px] border border-line px-5 py-3 font-kr text-sm text-ink transition hover:bg-clay-soft/40">
          취소
        </button>
      </div>
    </form>
  );
}
