"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui";
import { api, ApiError } from "@/lib/api/client";
import { useCart } from "@/store/cart";
import type { CreateOrderRequest, OrderView } from "@/types/order";

/**
 * 주문서. 배송 정보를 입력하고 결제(모의)까지 진행한다.
 *
 * ★ 금액·상품은 서버가 장바구니에서 다시 읽어 계산한다. 이 폼은 배송 정보만 보낸다.
 *   화면에 보이는 금액은 참고용(서버가 준 장바구니 값)이며, 확정 금액은 주문 응답이 진실이다.
 *
 * 결제 PG 는 미확정이라 지금은 서버의 모의 결제로 흐름만 끝까지 잇는다.
 */
export function CheckoutForm() {
  const router = useRouter();
  const cart = useCart((s) => s.cart);
  const loaded = useCart((s) => s.loaded);
  const refresh = useCart((s) => s.refresh);

  const [form, setForm] = useState<CreateOrderRequest>({
    ordererName: "",
    ordererPhone: "",
    ordererEmail: "",
    receiverName: "",
    receiverPhone: "",
    zipcode: "",
    addr1: "",
    addr2: "",
    deliveryMemo: "",
  });
  const [sameAsOrderer, setSameAsOrderer] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const set = (k: keyof CreateOrderRequest) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));
  const won = (n: number) => n.toLocaleString("ko-KR");

  async function submit() {
    setError(null);
    setFieldErrors({});

    // 받는 분이 주문자와 같으면 주문자 값으로 채운다.
    const payload: CreateOrderRequest = sameAsOrderer
      ? { ...form, receiverName: form.ordererName, receiverPhone: form.ordererPhone }
      : form;

    setBusy(true);
    try {
      // 1) 주문 생성 — 서버가 장바구니를 읽어 금액·재고를 확정한다.
      const order = await api.post<OrderView>("/api/orders", payload);
      // 2) 결제(모의) — 실제 PG 확정 시 이 단계만 교체된다.
      await api.post<OrderView>(`/api/orders/${order.orderNo}/pay`, { method: "card" });
      // 3) 주문 완료 페이지로. 장바구니는 서버에서 이미 비워졌으니 동기화.
      await refresh();
      router.push(`/orders/${order.orderNo}?done=1`);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
        if (e.fields) setFieldErrors(e.fields);
      } else {
        setError("주문을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
      setBusy(false);
    }
  }

  if (!loaded && !cart) {
    return <p className="mt-10 font-kr text-sm text-ink-soft">불러오는 중…</p>;
  }

  const orderable = cart?.items.filter((i) => i.available) ?? [];
  if (!cart || orderable.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center py-16 text-center">
        <p className="font-kr text-lg font-medium text-ink">주문할 상품이 없습니다.</p>
        <p className="mt-2 font-kr text-sm text-ink-soft">장바구니에 상품을 담아 주세요.</p>
        <Button href="/products" variant="dark" className="mt-6">
          상품 보러 가기
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
      {/* 배송 정보 입력 */}
      <div className="flex flex-col gap-8">
        <section>
          <h2 className="font-kr text-lg font-bold text-ink">주문자 정보</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="이름" value={form.ordererName} onChange={set("ordererName")}
              error={fieldErrors.ordererName} required />
            <Field label="연락처" value={form.ordererPhone} onChange={set("ordererPhone")}
              placeholder="010-1234-5678" error={fieldErrors.ordererPhone} required />
            <div className="sm:col-span-2">
              <Field label="이메일 (선택)" type="email" value={form.ordererEmail ?? ""}
                onChange={set("ordererEmail")} error={fieldErrors.ordererEmail}
                placeholder="주문 내역을 받을 이메일" />
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-kr text-lg font-bold text-ink">배송지</h2>
            <label className="flex items-center gap-2 font-kr text-sm text-ink-soft">
              <input type="checkbox" checked={sameAsOrderer}
                onChange={(e) => setSameAsOrderer(e.target.checked)} />
              주문자와 동일
            </label>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {!sameAsOrderer && (
              <>
                <Field label="받는 분" value={form.receiverName} onChange={set("receiverName")}
                  error={fieldErrors.receiverName} required />
                <Field label="받는 분 연락처" value={form.receiverPhone} onChange={set("receiverPhone")}
                  placeholder="010-1234-5678" error={fieldErrors.receiverPhone} required />
              </>
            )}
            <Field label="우편번호" value={form.zipcode} onChange={set("zipcode")}
              error={fieldErrors.zipcode} required />
            <div className="sm:col-span-2">
              <Field label="주소" value={form.addr1} onChange={set("addr1")}
                error={fieldErrors.addr1} required />
            </div>
            <div className="sm:col-span-2">
              <Field label="상세 주소 (선택)" value={form.addr2 ?? ""} onChange={set("addr2")} />
            </div>
            <div className="sm:col-span-2">
              <Field label="배송 메모 (선택)" value={form.deliveryMemo ?? ""}
                onChange={set("deliveryMemo")} placeholder="부재 시 경비실에 맡겨주세요" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-kr text-lg font-bold text-ink">주문 상품</h2>
          <ul className="mt-4 flex flex-col divide-y divide-line border-y border-line">
            {orderable.map((it) => (
              <li key={it.id} className="flex items-center gap-3 py-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[3px] border border-line bg-cream-warm">
                  {it.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.thumbnailUrl} alt={it.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-kr text-sm text-ink">{it.name}</p>
                  {it.optionName && <p className="font-kr text-xs text-ink-soft">{it.optionName}</p>}
                  <p className="font-numeric text-xs text-ink-faint">수량 {it.quantity}</p>
                </div>
                <p className="font-numeric text-sm font-medium text-ink">{won(it.lineAmount)}원</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 결제 요약 */}
      <aside className="rounded-[4px] border border-line bg-paper p-6 lg:sticky lg:top-24">
        <h2 className="font-kr text-lg font-bold text-ink">결제 금액</h2>
        <dl className="mt-5 flex flex-col gap-3 font-kr text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-soft">상품 금액</dt>
            <dd className="font-numeric text-ink">{won(cart.itemsAmount)}원</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-soft">배송비</dt>
            <dd className="font-numeric text-ink">
              {cart.shippingFee === 0 ? "무료" : `${won(cart.shippingFee)}원`}
            </dd>
          </div>
        </dl>
        <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
          <span className="font-kr text-sm font-medium text-ink">최종 결제금액</span>
          <span className="font-numeric text-2xl font-bold text-ink">
            {won(cart.totalAmount)}
            <span className="ml-1 font-kr text-base font-medium">원</span>
          </span>
        </div>

        <p className="mt-4 rounded-[2px] bg-cream-warm px-3 py-2 font-kr text-xs text-ink-soft">
          결제 수단은 실제 PG 연동 후 제공됩니다. 지금은 테스트 결제로 주문 흐름을 확인합니다.
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-[2px] bg-clay-soft/50 px-3 py-2 font-kr text-sm text-clay-deep">
            {error}
          </p>
        )}

        <Button onClick={submit} variant="dark" className="mt-5 w-full" disabled={busy}>
          {busy ? "처리 중…" : `${won(cart.totalAmount)}원 결제하기`}
        </Button>
        <Link
          href="/cart"
          className="mt-3 block text-center font-kr text-sm text-ink-soft underline-offset-4 hover:underline"
        >
          장바구니로 돌아가기
        </Link>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="mb-1 block font-kr text-xs font-medium text-ink-soft">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-[50px] w-full rounded-[3px] border bg-paper px-3 font-kr text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-clay-deep ${
          error ? "border-clay-deep" : "border-line"
        }`}
      />
      {error && <span className="mt-1 block font-kr text-xs text-clay-deep">{error}</span>}
    </label>
  );
}
