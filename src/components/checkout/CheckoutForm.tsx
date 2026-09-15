"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui";
import { PostcodeButton } from "@/components/checkout/PostcodeButton";
import { api, ApiError } from "@/lib/api/client";
import { useCart } from "@/store/cart";
import type { CreateOrderRequest, OrderView } from "@/types/order";

/**
 * 주문서. 배송 정보를 입력하고 결제까지 진행한다.
 *
 * ★ 금액·상품은 서버가 장바구니에서 다시 읽어 계산한다. 이 폼은 배송 정보만 보낸다.
 *   화면에 보이는 금액은 참고용(서버가 준 장바구니 값)이며, 확정 금액은 주문 응답이 진실이다.
 *
 * 결제 흐름: 주문 생성(재고 확보) → 포트원 결제창 → 서버가 포트원에 직접 조회해 검증·확정.
 *   결제 방식은 서버 설정(/api/payment/config)을 따른다 — mock 이면 테스트 결제로 바로 확정.
 *   결제창을 닫거나 실패하면 cancel-pending 으로 재고를 풀고 장바구니는 그대로 둔다.
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
  const [islandFee, setIslandFee] = useState(0);
  /** 화면 표시용 도서산간 추가분. 빈 장바구니면 0 (서버 계산과 같은 규칙). */
  const islandExtra = cart && cart.itemsAmount > 0 ? islandFee : 0;

  // 도서산간 추가 배송비 미리보기. 실제 금액은 주문 생성 때 서버가 우편번호로 다시 계산한다.
  useEffect(() => {
    if (!/^\d{5}$/.test(form.zipcode)) {
      setIslandFee(0);
      return;
    }
    let alive = true;
    api
      .get<{ island: boolean; extraFee: number }>(`/api/shipping-policy/island?zipcode=${form.zipcode}`)
      .then((r) => {
        if (alive) setIslandFee(r.island ? r.extraFee : 0);
      })
      .catch(() => {
        if (alive) setIslandFee(0);
      });
    return () => {
      alive = false;
    };
  }, [form.zipcode]);

  /** 결제 수단. 간편결제는 공급자까지 골라 포트원에 넘긴다. */
  const PAY_METHODS = [
    { key: "CARD", label: "신용·체크카드" },
    { key: "KAKAOPAY", label: "카카오페이" },
    { key: "NAVERPAY", label: "네이버페이" },
    { key: "TOSSPAY", label: "토스페이" },
    { key: "TRANSFER", label: "계좌이체" },
  ] as const;
  type PayMethodKey = (typeof PAY_METHODS)[number]["key"];

  /**
   * 결제 방식 설정(서버가 알려준다). portone 이면 포트원 결제창을 연다.
   * 포트원은 결제사마다 채널이 따로라 결제수단별 채널 키를 받는다. 키가 없는 결제수단은 보이지 않는다.
   */
  type PayConfig = { provider: string; storeId?: string; channels?: Partial<Record<PayMethodKey, string>> };
  const [payConfig, setPayConfig] = useState<PayConfig | null>(null);
  const [payMethod, setPayMethod] = useState<PayMethodKey>("CARD");
  const availableMethods = PAY_METHODS.filter((m) => Boolean(payConfig?.channels?.[m.key]));

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    api
      .get<PayConfig>("/api/payment/config")
      .then((cfg) => {
        setPayConfig(cfg);
        // 쓸 수 있는 첫 결제수단을 기본 선택으로.
        const first = (["CARD", "KAKAOPAY", "NAVERPAY", "TOSSPAY", "TRANSFER"] as const).find(
          (k) => cfg.channels?.[k],
        );
        if (first) setPayMethod(first);
      })
      .catch(() => setPayConfig({ provider: "mock" }));
  }, []);

  const set = (k: keyof CreateOrderRequest) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));
  const won = (n: number) => n.toLocaleString("ko-KR");
  const orderNameOf = (o: OrderView) =>
    o.items.length > 1
      ? `${o.items[0].name} 외 ${o.items.length - 1}건`
      : (o.items[0]?.name ?? "라이즌푸드 주문");

  async function submit() {
    setError(null);
    setFieldErrors({});

    // 받는 분이 주문자와 같으면 주문자 값으로 채운다.
    const payload: CreateOrderRequest = sameAsOrderer
      ? { ...form, receiverName: form.ordererName, receiverPhone: form.ordererPhone }
      : form;

    setBusy(true);
    let orderNo: string | null = null;
    try {
      // 1) 주문 생성 — 서버가 장바구니를 읽어 금액을 확정하고 재고를 잡아둔다.
      const order = await api.post<OrderView>("/api/orders", payload);
      orderNo = order.orderNo;

      // 2) 결제창 — 포트원이면 결제창을 연다. 금액은 서버가 확정한 값을 쓴다.
      if (payConfig?.provider === "portone") {
        const channelKey = payConfig.channels?.[payMethod];
        if (!payConfig.storeId || !channelKey) {
          throw new Error("선택한 결제수단을 지금은 쓸 수 없습니다. 다른 결제수단을 골라 주세요.");
        }
        const easyProvider =
          payMethod === "KAKAOPAY" || payMethod === "NAVERPAY" || payMethod === "TOSSPAY"
            ? payMethod
            : null;
        const PortOne = await import("@portone/browser-sdk/v2");
        const res = await PortOne.requestPayment({
          storeId: payConfig.storeId,
          channelKey, // 결제수단별 채널 (카드·카카오페이·네이버페이·토스페이·계좌이체)
          paymentId: order.orderNo, // 우리 주문번호 = 포트원 결제 ID (서버가 이 값으로 조회·검증)
          orderName: orderNameOf(order),
          totalAmount: order.totalAmount,
          currency: "KRW",
          payMethod: easyProvider ? "EASY_PAY" : payMethod === "TRANSFER" ? "TRANSFER" : "CARD",
          easyPay: easyProvider ? { easyPayProvider: easyProvider } : undefined,
          customer: {
            fullName: payload.ordererName,
            phoneNumber: payload.ordererPhone.replace(/\D/g, ""),
            email: payload.ordererEmail || undefined,
          },
          // 모바일은 결제창이 페이지 이동으로 열리고, 끝나면 여기로 돌아온다.
          redirectUrl: `${window.location.origin}/checkout/complete?orderNo=${encodeURIComponent(order.orderNo)}`,
        });
        if (!res) return; // 리다이렉트 방식 — 결제 확인 페이지가 이어서 처리한다.
        if (res.code != null) {
          // 결제창을 닫았거나 결제 실패 — 잡아둔 재고를 풀고 장바구니는 그대로 둔다.
          await api.post(`/api/orders/${order.orderNo}/cancel-pending`).catch(() => undefined);
          setError(res.message || "결제가 취소되었습니다.");
          setBusy(false);
          return;
        }
      }

      // 3) 결제 확정 — 서버가 PG 에 직접 조회해 상태·금액을 검증한 뒤 확정하고 장바구니를 비운다.
      await api.post<OrderView>(`/api/orders/${order.orderNo}/pay`, { method: payMethod });
      await refresh();
      router.push(`/orders/${order.orderNo}?done=1`);
    } catch (e) {
      // 주문은 만들어졌는데 결제 단계에서 실패 — 재고를 풀어준다.
      // (실제로 결제가 끝난 상태라면 서버가 PG 를 확인해 확정한다)
      if (orderNo) {
        const view = await api
          .post<OrderView>(`/api/orders/${orderNo}/cancel-pending`)
          .catch(() => null);
        if (view?.status === "PAID") {
          await refresh();
          router.push(`/orders/${orderNo}?done=1`);
          return;
        }
      }
      if (e instanceof ApiError) {
        setError(e.message);
        if (e.fields) setFieldErrors(e.fields);
      } else {
        setError(e instanceof Error ? e.message : "주문을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
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
            {/* 우편번호·주소는 검색으로 채운다. 손으로 고치지 않게 읽기전용. */}
            <div className="sm:col-span-2">
              <span className="mb-1 block font-kr text-xs font-medium text-ink-soft">
                우편번호 <span className="text-clay-deep">*</span>
              </span>
              <div className="flex gap-2">
                <input
                  value={form.zipcode}
                  readOnly
                  placeholder="주소 검색을 눌러주세요"
                  className={`h-[50px] w-40 rounded-[3px] border bg-cream-warm/50 px-3 font-kr text-sm text-ink outline-none placeholder:text-ink-faint ${
                    fieldErrors.zipcode ? "border-clay-deep" : "border-line"
                  }`}
                />
                <PostcodeButton
                  onComplete={({ zonecode, address }) =>
                    setForm((f) => ({ ...f, zipcode: zonecode, addr1: address }))
                  }
                  className="h-[50px] shrink-0 rounded-[3px] bg-ink px-5 font-kr text-sm font-medium text-cream-warm transition hover:bg-slate-deep disabled:opacity-50"
                />
              </div>
              {fieldErrors.zipcode && (
                <span className="mt-1 block font-kr text-xs text-clay-deep">{fieldErrors.zipcode}</span>
              )}
            </div>
            <div className="sm:col-span-2">
              <Field label="주소" value={form.addr1} onChange={set("addr1")}
                error={fieldErrors.addr1} placeholder="주소 검색으로 자동 입력됩니다" readOnly required />
            </div>
            <div className="sm:col-span-2">
              <Field label="상세 주소 (선택)" value={form.addr2 ?? ""} onChange={set("addr2")}
                placeholder="동·호수 등 나머지 주소" />
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
            <dd className="text-right font-numeric text-ink">
              {cart.shippingFee + islandExtra === 0 ? "무료" : `${won(cart.shippingFee + islandExtra)}원`}
              {islandExtra > 0 && (
                <span className="mt-0.5 block font-kr text-xs text-ink-faint">
                  도서산간 {won(islandExtra)}원 포함
                </span>
              )}
            </dd>
          </div>
        </dl>
        <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
          <span className="font-kr text-sm font-medium text-ink">최종 결제금액</span>
          <span className="font-numeric text-2xl font-bold text-ink">
            {won(cart.totalAmount + islandExtra)}
            <span className="ml-1 font-kr text-base font-medium">원</span>
          </span>
        </div>

        {payConfig?.provider === "portone" ? (
          <fieldset className="mt-5">
            <legend className="font-kr text-sm font-medium text-ink">결제 수단</legend>
            {availableMethods.length === 0 && (
              <p className="mt-2 rounded-[2px] bg-cream-warm px-3 py-2 font-kr text-xs text-ink-soft">
                지금 쓸 수 있는 결제수단이 없습니다. 잠시 후 다시 시도해 주세요.
              </p>
            )}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {availableMethods.map((m) => (
                <label
                  key={m.key}
                  className={`flex cursor-pointer items-center justify-center rounded-full border px-3 py-2.5 font-kr text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-clay-deep ${
                    payMethod === m.key
                      ? "border-ink bg-ink text-cream-warm"
                      : "border-line text-ink hover:border-ink/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="payMethod"
                    value={m.key}
                    checked={payMethod === m.key}
                    onChange={() => setPayMethod(m.key)}
                    className="sr-only"
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <p className="mt-4 rounded-[2px] bg-cream-warm px-3 py-2 font-kr text-xs text-ink-soft">
            지금은 테스트 결제로 주문 흐름을 확인합니다. 실제 결제는 포트원 키 설정 후 열립니다.
          </p>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-[2px] bg-danger/10 px-3 py-2 font-kr text-sm text-danger">
            {error}
          </p>
        )}

        <Button onClick={submit} variant="dark" className="mt-5 w-full" disabled={busy || !payConfig || (payConfig.provider === "portone" && availableMethods.length === 0)}>
          {busy ? "처리 중…" : `${won(cart.totalAmount + islandExtra)}원 결제하기`}
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
