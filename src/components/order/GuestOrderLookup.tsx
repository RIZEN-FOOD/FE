"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui";
import { api, ApiError } from "@/lib/api/client";
import { formatPhone } from "@/lib/phone";
import type { OrderView } from "@/types/order";

/**
 * 비회원 주문 조회.
 *
 * 결제 후 받은 링크를 잃으면 주문을 볼 방법이 없었다. 여기서 직접 찾을 수 있게 한다.
 *
 * ★ 주문번호만으로는 열어주지 않는다 — <b>받는 분 연락처</b>가 함께 맞아야 한다.
 *   주문번호가 새어나가도 남이 열어볼 수 없게 하려는 것이고, 검사는 서버가 한다.
 * ★ 틀렸을 때 서버가 "그 주문번호는 있다"는 사실도 알려주지 않으므로,
 *   화면도 서버 메시지를 그대로 보여주기만 한다.
 */
export function GuestOrderLookup() {
  const router = useRouter();
  const [orderNo, setOrderNo] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const order = await api.post<OrderView>("/api/orders/lookup", {
        orderNo: orderNo.trim(),
        receiverPhone: phone,
      });
      router.push(`/orders/${encodeURIComponent(order.orderNo)}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "조회하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
      setBusy(false);
    }
  }

  const inputCls =
    "h-[50px] w-full rounded-[6px] border border-line bg-paper px-3 font-kr text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-clay-deep";

  return (
    <div className="mx-auto mt-10 w-full max-w-md">
      <p className="font-kr text-sm leading-relaxed text-ink-soft">
        주문하실 때 받으신 <b>주문번호</b>와 <b>받는 분 연락처</b>를 넣어 주세요.
        주문 완료 화면과 안내 메일에서 주문번호를 확인하실 수 있습니다.
      </p>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <label className="block">
          <span className="mb-1 block font-kr text-caption font-medium text-ink-soft">주문번호</span>
          <input
            value={orderNo}
            onChange={(e) => setOrderNo(e.target.value)}
            placeholder="R20260101-ABCD1234"
            autoComplete="off"
            required
            className={inputCls}
          />
        </label>

        <label className="block">
          <span className="mb-1 block font-kr text-caption font-medium text-ink-soft">받는 분 연락처</span>
          <input
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="010-1234-5678"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={13}
            required
            className={inputCls}
          />
        </label>

        {error && (
          <p role="alert" className="rounded-[6px] bg-danger/10 px-3 py-2 font-kr text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" variant="dark" className="mt-1 w-full" disabled={busy}>
          {busy ? "조회 중…" : "주문 조회"}
        </Button>
      </form>

      <p className="mt-6 font-kr text-caption leading-relaxed text-ink-faint">
        회원으로 주문하셨다면 로그인 후 <b>마이페이지 &gt; 주문 내역</b>에서 보실 수 있습니다.
        주문번호가 기억나지 않으시면 고객센터로 문의해 주세요.
      </p>
    </div>
  );
}
