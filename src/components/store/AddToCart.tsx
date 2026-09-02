"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { useCart } from "@/store/cart";
import type { ProductDetail, ProductOption } from "@/types/product";

/**
 * 상품 상세의 구매 액션.
 *
 * 옵션이 있으면 옵션을 먼저 고르게 한다. 수량은 1 이상.
 * "장바구니 담기" 는 담고 안내를 띄우고, "바로 구매" 는 담은 뒤 장바구니로 보낸다.
 *
 * ★ 금액·재고는 서버가 판단한다. 여기서는 담기 요청만 보내고, 재고 부족·품절 같은
 *   사유는 서버가 준 메시지를 그대로 보여준다 (직접 재고를 계산하지 않는다).
 */
export function AddToCart({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const add = useCart((s) => s.add);

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

  async function onBuyNow() {
    const ok = await doAdd();
    if (ok) {
      router.push("/cart");
    }
  }

  if (product.soldOut) {
    return (
      <div className="rounded-[2px] bg-line py-3 text-center font-kr text-sm font-medium text-ink-soft">
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
            className="w-full rounded-[2px] border border-line bg-paper px-3 py-2.5 font-kr text-sm text-ink focus:border-clay-deep focus:outline-none"
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
        <div className="flex items-center rounded-[2px] border border-line">
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

      {/* 합계(참고). 확정 금액은 장바구니·주문에서 서버가 다시 계산한다. */}
      <div className="mb-4 flex items-baseline justify-between border-t border-line pt-4">
        <span className="font-kr text-sm text-ink-soft">합계 (배송비 별도)</span>
        <span className="font-numeric text-xl font-bold text-ink">
          {((selectedOption?.price ?? product.effectivePrice) * quantity).toLocaleString("ko-KR")}
          <span className="ml-1 font-kr text-sm font-medium">원</span>
        </span>
      </div>

      {error && (
        <p role="alert" className="mb-3 rounded-[2px] bg-clay-soft/50 px-3 py-2 font-kr text-sm text-clay-deep">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Button onClick={onBuyNow} variant="dark" className="w-full" disabled={busy}>
          바로 구매하기
        </Button>
        <Button onClick={doAdd} variant="line" className="w-full" disabled={busy}>
          {busy ? "담는 중…" : "장바구니 담기"}
        </Button>
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
