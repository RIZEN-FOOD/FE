"use client";

import Link from "next/link";
import { useEffect } from "react";

import { useCart } from "@/store/cart";

/**
 * 헤더의 장바구니 아이콘 + 수량 배지.
 *
 * 마운트 시 서버와 한 번 동기화한다. 회원·게스트 모두 쿠키로 식별되므로
 * 로그인 여부와 무관하게 담긴 수량을 보여줄 수 있다.
 *
 * 담기/수정/삭제는 useCart 를 거치므로, 어느 화면에서 바뀌어도 이 배지가 함께 갱신된다.
 */
export function CartBadge({ className }: { className?: string }) {
  const count = useCart((s) => s.cart?.totalQuantity ?? 0);
  const loaded = useCart((s) => s.loaded);
  const refresh = useCart((s) => s.refresh);

  useEffect(() => {
    if (!loaded) {
      void refresh();
    }
  }, [loaded, refresh]);

  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `장바구니, 상품 ${count}개` : "장바구니"}
      className={`relative inline-flex items-center justify-center text-ink transition hover:text-clay-deep ${className ?? ""}`}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex min-w-[18px] items-center justify-center rounded-full bg-clay-deep px-1 font-numeric text-[11px] font-bold leading-[18px] text-paper">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
