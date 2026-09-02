"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui";
import { api, ApiError } from "@/lib/api/client";
import { formatDateTime } from "@/lib/datetime";
import { ORDER_STATUS_LABEL, type OrderView } from "@/types/order";

/**
 * 주문 상세. 결제 직후에는 완료 안내를 함께 보여준다(?done=1).
 */
export function OrderDetail({ orderNo }: { orderNo: string }) {
  const params = useSearchParams();
  const justDone = params.get("done") === "1";

  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .get<OrderView>(`/api/orders/${orderNo}`)
      .then((o) => alive && setOrder(o))
      .catch((e) =>
        alive && setError(e instanceof ApiError ? e.message : "주문을 불러오지 못했습니다."),
      );
    return () => {
      alive = false;
    };
  }, [orderNo]);

  const won = (n: number) => n.toLocaleString("ko-KR");

  if (error) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <p className="font-kr text-lg font-medium text-ink">{error}</p>
        <Button href="/" variant="line" className="mt-6">홈으로</Button>
      </div>
    );
  }
  if (!order) {
    return <p className="font-kr text-sm text-ink-soft">불러오는 중…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      {justDone && (
        <div className="mb-8 rounded-[6px] border border-line bg-paper px-6 py-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FAF7F1"
              strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1 className="mt-4 font-kr text-xl font-bold text-ink">주문이 완료되었습니다</h1>
          <p className="mt-2 font-kr text-sm text-ink-soft">
            주문해 주셔서 감사합니다. 주문 내역을 아래에서 확인하실 수 있습니다.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="font-numeric text-sm text-ink-soft">주문번호 {order.orderNo}</p>
          <p className="mt-1 font-kr text-xs text-ink-faint">{formatDateTime(order.orderedAt)}</p>
        </div>
        <span className="rounded-full bg-cream-warm px-3 py-1 font-kr text-sm font-medium text-clay-deep">
          {ORDER_STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

      {/* 상품 */}
      <ul className="mt-6 flex flex-col divide-y divide-line border-y border-line">
        {order.items.map((it, i) => (
          <li key={i} className="flex items-center gap-3 py-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[3px] border border-line bg-cream-warm">
              {it.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.thumbnailUrl} alt={it.name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-kr text-sm text-ink">{it.name}</p>
              {it.optionName && <p className="font-kr text-xs text-ink-soft">{it.optionName}</p>}
              <p className="font-numeric text-xs text-ink-faint">
                {won(it.unitPrice)}원 · 수량 {it.quantity}
              </p>
            </div>
            <p className="font-numeric text-sm font-bold text-ink">{won(it.lineAmount)}원</p>
          </li>
        ))}
      </ul>

      {/* 금액 */}
      <dl className="mt-5 flex flex-col gap-2 font-kr text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-soft">상품 금액</dt>
          <dd className="font-numeric text-ink">{won(order.itemsAmount)}원</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-soft">배송비</dt>
          <dd className="font-numeric text-ink">
            {order.shippingFee === 0 ? "무료" : `${won(order.shippingFee)}원`}
          </dd>
        </div>
        <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3">
          <dt className="font-kr text-sm font-medium text-ink">결제 금액</dt>
          <dd className="font-numeric text-xl font-bold text-ink">{won(order.totalAmount)}원</dd>
        </div>
      </dl>

      {/* 배송지 */}
      <div className="mt-8 rounded-[4px] border border-line bg-paper p-5">
        <h2 className="font-kr text-sm font-bold text-ink">배송지</h2>
        <div className="mt-3 flex flex-col gap-1 font-kr text-sm text-ink-soft">
          <p>{order.receiverName} · {order.receiverPhoneMasked}</p>
          <p>[{order.zipcode}] {order.addr1} {order.addr2 ?? ""}</p>
          {order.deliveryMemo && <p className="text-ink-faint">메모: {order.deliveryMemo}</p>}
        </div>
      </div>

      <div className="mt-8 flex gap-2">
        <Button href="/products" variant="line" className="flex-1">쇼핑 계속하기</Button>
        <Button href="/mypage" variant="dark" className="flex-1">주문 내역 보기</Button>
      </div>
    </div>
  );
}
