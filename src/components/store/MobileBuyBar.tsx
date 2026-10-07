"use client";

import { useEffect, useState } from "react";

import { AddToCart } from "@/components/store/AddToCart";
import { WishlistButton } from "@/components/store/WishlistButton";
import type { ProductDetail } from "@/types/product";
import type { ShippingPolicy } from "@/types/shipping";

/**
 * 상품 상세 — 휴대폰 하단 고정 구매 막대 (2026-10-07).
 *
 * 상세 사진을 내려 보는 중에도 화면 맨 아래에 [찜] [장바구니] [구매하기] 가 붙어 있다
 * (네이버 스마트스토어 모바일과 같은 자리). 1024px 이상(PC)에서는 그리지 않는다 — PC 는 오른쪽 구매 상자가 따라온다.
 *
 * [장바구니]·[구매하기] 를 누르면 아래에서 구매 시트가 올라온다. 시트 안은 위쪽 구매 패널과 같은 AddToCart 라
 * 옵션·수량을 고른 뒤 담거나 바로 구매한다 — 담기·바로구매 규칙이 한 곳에만 있게.
 */
export function MobileBuyBar({
  product,
  shipping,
}: {
  product: ProductDetail;
  shipping?: ShippingPolicy | null;
}) {
  const [open, setOpen] = useState(false);

  // 시트가 열려 있으면 Esc 로 닫고, 뒤 화면이 같이 스크롤되지 않게 한다.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      {/* 하단 고정 막대. 아이폰 홈 표시줄만큼 아래 여백을 더 준다. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
        {product.soldOut ? (
          <div className="flex items-center gap-2">
            <WishlistButton productId={product.id} variant="inline" />
            <div className="flex h-12 flex-1 items-center justify-center bg-line font-kr text-sm font-medium text-ink-soft">
              품절되었습니다
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <WishlistButton productId={product.id} variant="inline" />
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="h-12 flex-1 rounded-[6px] border border-ink font-kr text-sm font-bold text-ink transition active:scale-[0.98]"
            >
              장바구니
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="h-12 flex-[1.4] rounded-[6px] bg-ink font-kr text-sm font-bold text-cream-warm transition active:scale-[0.98]"
            >
              구매하기
            </button>
          </div>
        )}
      </div>

      {/* 구매 시트 — 옵션·수량을 고르고 담거나 바로 구매한다.
          쿠키 안내(z-60)·퀵메뉴(z-50)보다 위에 띄운다 — 가리면 [바로 구매하기]를 못 누른다. */}
      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="구매하기">
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full bg-ink/40"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto border-t border-line bg-paper px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="font-kr text-sm font-bold leading-snug text-ink">{product.nameKo}</p>
                <p className="mt-1 font-numeric text-lg font-bold text-ink">
                  {product.effectivePrice.toLocaleString("ko-KR")}
                  <span className="ml-0.5 font-kr text-sm font-medium">원</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 px-2 py-1 font-kr text-sm text-ink-soft"
              >
                닫기
              </button>
            </div>
            <AddToCart product={product} shipping={shipping} />
          </div>
        </div>
      )}
    </div>
  );
}
