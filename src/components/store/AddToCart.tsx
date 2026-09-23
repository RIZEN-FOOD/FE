"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui";
import { WishlistButton } from "@/components/store/WishlistButton";
import { ApiError } from "@/lib/api/client";
import { useCart } from "@/store/cart";
import type { ProductDetail, ProductOption } from "@/types/product";
import type { ShippingPolicy } from "@/types/shipping";

/**
 * 상품 상세의 구매 액션.
 *
 * 옵션이 있으면 옵션을 먼저 고르게 한다. 수량은 1 이상.
 * "장바구니 담기" 는 담고 안내를 띄우고, "바로 구매" 는 담지 않고 이 상품·수량만 주문서로 보낸다.
 *
 * ★ 금액·재고는 서버가 판단한다. 여기서는 담기 요청만 보내고, 재고 부족·품절 같은
 *   사유는 서버가 준 메시지를 그대로 보여준다 (직접 재고를 계산하지 않는다).
 *
 * 2026-09-23. 합계 위에 무료배송까지 남은 금액을 막대로 보여준다.
 *   기준은 «장바구니에 이미 담긴 금액 + 지금 고른 수량» 이다. 실제 배송비가
 *   그 합으로 정해지기 때문에, 지금 고른 것만 세면 손님이 틀린 숫자를 보게 된다.
 *   여기 숫자는 안내용이고 확정 금액은 주문서에서 서버가 다시 계산한다.
 */
export function AddToCart({
  product,
  shipping,
}: {
  product: ProductDetail;
  shipping?: ShippingPolicy | null;
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const cart = useCart((s) => s.cart);

  const hasOptions = product.options.length > 0;
  const [optionId, setOptionId] = useState<number | null>(
    hasOptions ? null : null,
  );
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const selectedOption: ProductOption | undefined = hasOptions
    ? product.options.find((o) => o.id === optionId)
    : undefined;

  const won = (n: number) => n.toLocaleString("ko-KR");
  const lineAmount = (selectedOption?.price ?? product.effectivePrice) * quantity;
  const cartAmount = cart?.itemsAmount ?? 0;
  /** 무료배송 판정 기준 — 이미 담긴 것 + 지금 고른 것 */
  const basis = cartAmount + lineAmount;
  const threshold =
    typeof shipping?.freeThreshold === "number" && shipping.freeThreshold > 0
      ? shipping.freeThreshold
      : null;
  const remaining = threshold != null ? Math.max(0, threshold - basis) : 0;
  const reachedFree = threshold != null && remaining === 0;
  const progress = threshold != null ? Math.min(100, Math.round((basis / threshold) * 100)) : 0;

  async function doAdd(): Promise<boolean> {
    setError(null);
    if (hasOptions && optionId == null) {
      setError("옵션을 선택해 주세요.");
      return false;
    }
    setBusy(true);
    try {
      await add(product.id, quantity, optionId);
      setAdded(true);
      return true;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "장바구니에 담지 못했습니다.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  /**
   * 바로 구매 — 장바구니를 거치지 않는다 (2026-09-23).
   * 이 상품·이 수량만 주문서로 가져간다. 장바구니에 담긴 것은 그대로 둔다.
   * 가격은 보내지 않는다. 주문서가 서버에 견적을 청하고, 결제 때 서버가 다시 계산한다.
   */
  function onBuyNow() {
    setError(null);
    if (hasOptions && optionId == null) {
      setError("옵션을 선택해 주세요.");
      return;
    }
    const q = new URLSearchParams({ product: String(product.id), qty: String(quantity) });
    if (optionId != null) q.set("option", String(optionId));
    router.push(`/checkout?${q.toString()}`);
  }

  if (product.soldOut) {
    return (
      <div className="rounded-[6px] bg-line py-3 text-center font-kr text-sm font-medium text-ink-soft">
        품절되었습니다
      </div>
    );
  }

  return (
    <div>
      {hasOptions && (
        <label className="mb-4 block">
          <span className="mb-1.5 block font-kr text-sm font-medium text-ink">옵션 선택</span>
          <select
            value={optionId ?? ""}
            onChange={(e) => {
              setOptionId(e.target.value ? Number(e.target.value) : null);
              setAdded(false);
              setError(null);
            }}
            className="w-full rounded-[6px] border border-line bg-paper px-3 py-2.5 font-kr text-sm text-ink focus:border-clay-deep focus:outline-none"
          >
            <option value="">옵션을 선택해 주세요</option>
            {product.options.map((o) => (
              <option key={o.id} value={o.id} disabled={o.soldOut}>
                {o.name}
                {o.soldOut ? " (품절)" : ` · ${o.price.toLocaleString("ko-KR")}원`}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* 수량 */}
      <div className="mb-5 flex items-center justify-between">
        <span className="font-kr text-sm font-medium text-ink">수량</span>
        <div className="flex items-center rounded-[6px] border border-line">
          <button
            type="button"
            aria-label="수량 줄이기"
            onClick={() => {
              setQuantity((q) => Math.max(1, q - 1));
              setAdded(false);
            }}
            disabled={quantity <= 1 || busy}
            className="px-3 py-2 font-numeric text-lg text-ink disabled:opacity-40"
          >
            −
          </button>
          <span className="min-w-[2.5rem] text-center font-numeric text-sm text-ink">{quantity}</span>
          <button
            type="button"
            aria-label="수량 늘리기"
            onClick={() => {
              setQuantity((q) => Math.min(99, q + 1));
              setAdded(false);
            }}
            disabled={quantity >= 99 || busy}
            className="px-3 py-2 font-numeric text-lg text-ink disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      {/* 총 상품금액(참고). 확정 금액은 장바구니·주문에서 서버가 다시 계산한다. */}
      <div className="mb-5 flex items-end justify-between border-t border-line pt-5">
        <div>
          <p className="font-kr text-small font-medium text-ink">총 상품금액</p>
          <p className="mt-0.5 font-kr text-caption text-ink-faint">수량 {quantity}개 · 배송비 별도</p>
        </div>
        <p className="font-numeric text-2xl font-bold leading-none text-ink">
          {won(lineAmount)}
          <span className="ml-1 font-kr text-base font-medium">원</span>
        </p>
      </div>

      {/* 무료배송까지 남은 금액. 정책에 무료 기준이 없으면 그리지 않는다.
          ★ «적용됩니다» 라고 쓰지 않는다 — 확정 배송비는 주문서에서 할인까지 반영해 서버가 정한다.
            여기서는 기준을 넘었는지만 말한다. */}
      {threshold != null && (
        <div className="mb-6 border-t border-line pt-4">
          {/* 글줄 하나 + 막대 하나. 상자·아이콘 없이 패널의 다른 줄(배송비·총 상품금액)과 같은 결로 둔다. */}
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-kr text-small text-ink">
              {reachedFree ? (
                <span className="font-bold text-clay-deep">무료배송 기준을 넘었어요</span>
              ) : (
                <>
                  <span className="font-numeric text-base font-bold text-clay-deep">{won(remaining)}원</span>
                  <span className="font-medium"> 더 담으면 무료배송</span>
                </>
              )}
            </p>
            <span className="shrink-0 font-numeric text-caption text-ink-faint">
              {won(Math.min(basis, threshold))} / {won(threshold)}원
            </span>
          </div>

          {/* 막대. 채워지는 쪽 끝의 점이 «지금 여기» 다. 6px 이라 폭 전환에 레이아웃 비용이 없다. */}
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="무료배송까지 진행률"
            className="mt-2.5 h-1.5 w-full rounded-full bg-line"
          >
            <div
              className="flex h-full items-center justify-end rounded-full bg-clay-deep transition-[width] duration-[var(--dur-slow)] ease-[var(--ease-out)]"
              style={{ width: `${Math.max(progress, 2)}%` }}
            >
              {!reachedFree && (
                <span className="h-3 w-3 shrink-0 translate-x-1/2 rounded-full border-2 border-cream bg-clay-deep" />
              )}
            </div>
          </div>

          {cartAmount > 0 && (
            <p className="mt-2 font-kr text-caption text-ink-faint">
              장바구니에 담긴 {won(cartAmount)}원을 포함해 계산했습니다.
            </p>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mb-3 rounded-[6px] bg-danger/10 px-3 py-2 font-kr text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Button onClick={onBuyNow} variant="dark" className="w-full" disabled={busy}>
          바로 구매하기
        </Button>
        <div className="flex gap-2">
          <Button onClick={doAdd} variant="line" className="flex-1" disabled={busy}>
            {busy ? "담는 중…" : "장바구니 담기"}
          </Button>
          <WishlistButton productId={product.id} variant="inline" />
        </div>
      </div>

      {added && !error && (
        <p className="mt-3 text-center font-kr text-sm text-ink-soft">
          장바구니에 담았습니다.{" "}
          <a href="/cart" className="font-medium text-clay-deep underline underline-offset-2">
            장바구니 보기
          </a>
        </p>
      )}
    </div>
  );
}
