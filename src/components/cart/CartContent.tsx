"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { useCart } from "@/store/cart";
import type { CartItemView } from "@/types/cart";

/**
 * 장바구니 내용.
 *
 * 금액·배송비·재고는 서버가 계산해 내려준 값을 그대로 쓴다. 프론트에서 다시
 * 더하지 않는다 — 담아둔 사이 가격이 바뀌었을 수 있어 서버 값이 진실이다.
 *
 * 품절·판매중지된 항목은 available=false 로 내려오며 합계에서 빠진다.
 * 사용자가 지우거나 수량을 줄일 수 있게 사유를 함께 보여준다.
 */
export function CartContent() {
  const cart = useCart((s) => s.cart);
  const loaded = useCart((s) => s.loaded);
  const refresh = useCart((s) => s.refresh);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!loaded && !cart) {
    return <p className="mt-10 font-kr text-sm text-ink-soft">불러오는 중…</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center py-16 text-center">
        <p className="font-kr text-lg font-medium text-ink">장바구니가 비어 있습니다.</p>
        <p className="mt-2 font-kr text-sm text-ink-soft">담아둔 상품이 없습니다. 상품을 둘러보세요.</p>
        <Button href="/products" variant="dark" className="mt-6">
          상품 보러 가기
        </Button>
      </div>
    );
  }

  const won = (n: number) => n.toLocaleString("ko-KR");

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
      {/* 항목 목록 */}
      <ul className="flex flex-col divide-y divide-line border-y border-line">
        {cart.items.map((item) => (
          <CartRow key={item.id} item={item} />
        ))}
      </ul>

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

        {cart.freeShippingThreshold != null && cart.freeShippingRemaining > 0 && (
          <p className="mt-3 rounded-[2px] bg-cream-warm px-3 py-2 font-kr text-xs text-clay-deep">
            {won(cart.freeShippingRemaining)}원 더 담으면 무료배송입니다.
          </p>
        )}

        <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
          <span className="font-kr text-sm font-medium text-ink">합계</span>
          <span className="font-numeric text-2xl font-bold text-ink">
            {won(cart.totalAmount)}
            <span className="ml-1 font-kr text-base font-medium">원</span>
          </span>
        </div>

        {cart.hasUnavailable && (
          <p className="mt-4 font-kr text-xs text-ink-faint">
            구매할 수 없는 상품은 결제 금액에서 제외됩니다.
          </p>
        )}

        <Button
          href="/checkout"
          variant="dark"
          className="mt-6 w-full"
          aria-disabled={cart.totalQuantity === 0}
        >
          주문하기
        </Button>
        <Link
          href="/products"
          className="mt-3 block text-center font-kr text-sm text-ink-soft underline-offset-4 hover:underline"
        >
          계속 쇼핑하기
        </Link>
      </aside>
    </div>
  );
}

/** 장바구니 한 줄. 수량 변경·삭제를 자체적으로 처리한다. */
function CartRow({ item }: { item: CartItemView }) {
  const updateQty = useCart((s) => s.updateQty);
  const remove = useCart((s) => s.remove);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const won = (n: number) => n.toLocaleString("ko-KR");

  async function run(fn: () => Promise<void>) {
    setError(null);
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "처리하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className={`flex gap-4 py-5 ${item.available ? "" : "opacity-70"}`}>
      {/* 썸네일 */}
      <Link href={`/products/${item.slug}`} className="shrink-0">
        <div className="h-20 w-20 overflow-hidden rounded-[3px] border border-line bg-cream-warm">
          {item.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.thumbnailUrl} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-en text-[10px] text-ink-faint">
              RiZen
            </div>
          )}
        </div>
      </Link>

      {/* 정보 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={`/products/${item.slug}`} className="font-kr text-sm font-medium text-ink hover:underline">
          {item.name}
        </Link>
        {item.optionName && (
          <p className="mt-0.5 font-kr text-xs text-ink-soft">{item.optionName}</p>
        )}
        <p className="mt-1 font-numeric text-xs text-ink-faint">
          개당 {won(item.unitPrice)}원
        </p>

        {!item.available && item.reason && (
          <span className="mt-2 inline-block w-fit rounded-full bg-clay-soft/60 px-2 py-0.5 font-kr text-[11px] text-clay-deep">
            {item.reason}
          </span>
        )}
        {error && (
          <span role="alert" className="mt-2 font-kr text-[11px] text-clay-deep">
            {error}
          </span>
        )}

        {/* 수량 조절 + 삭제 */}
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center rounded-[2px] border border-line">
            <button
              type="button"
              aria-label="수량 줄이기"
              onClick={() => run(() => updateQty(item.id, item.quantity - 1))}
              disabled={busy || item.quantity <= 1}
              className="px-2.5 py-1 font-numeric text-ink disabled:opacity-40"
            >
              −
            </button>
            <span className="min-w-[2rem] text-center font-numeric text-sm text-ink">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="수량 늘리기"
              onClick={() => run(() => updateQty(item.id, item.quantity + 1))}
              disabled={busy || item.quantity >= 99}
              className="px-2.5 py-1 font-numeric text-ink disabled:opacity-40"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => run(() => remove(item.id))}
            disabled={busy}
            className="font-kr text-xs text-ink-faint underline-offset-2 hover:text-ink hover:underline disabled:opacity-40"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 줄 금액 */}
      <div className="shrink-0 text-right">
        <p className="font-numeric text-sm font-bold text-ink">{won(item.lineAmount)}원</p>
      </div>
    </li>
  );
}
