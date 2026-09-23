"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useCart } from "@/store/cart";

/**
 * 헤더의 장바구니 아이콘 + 수량 배지.
 *
 * 마운트 시 서버와 한 번 동기화한다. 회원·게스트 모두 쿠키로 식별되므로
 * 로그인 여부와 무관하게 담긴 수량을 보여줄 수 있다.
 *
 * 담기/수정/삭제는 useCart 를 거치므로, 어느 화면에서 바뀌어도 이 배지가 함께 갱신된다.
 *
 * 수량이 «늘어날 때만» 배지가 한 번 튄다 (2026-09-23). 숫자만 바뀌면 담긴 줄 모르는 분이 있다.
 * 줄어들 때(삭제)는 튀지 않는다 — 그건 손님이 직접 한 일이라 확인이 필요 없다.
 * 첫 동기화(0 → n)도 튀지 않는다. 방금 담은 게 아니라 원래 있던 것이다.
 */
export function CartBadge({ className }: { className?: string }) {
  const count = useCart((s) => s.cart?.totalQuantity ?? 0);
  const loaded = useCart((s) => s.loaded);
  const refresh = useCart((s) => s.refresh);
  const prev = useRef<number | null>(null);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (!loaded) {
      void refresh();
    }
  }, [loaded, refresh]);

  useEffect(() => {
    if (!loaded) return;
    if (prev.current != null && count > prev.current) {
      setBump(true);
      const t = window.setTimeout(() => setBump(false), 360);
      prev.current = count;
      return () => window.clearTimeout(t);
    }
    prev.current = count;
  }, [count, loaded]);

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
        <span
          className={`absolute -right-2 -top-2 flex min-w-[18px] items-center justify-center rounded-full bg-clay-deep px-1 font-numeric text-[12px] font-bold leading-[18px] text-paper ${
            bump ? "animate-badge-bump" : ""
          }`}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
