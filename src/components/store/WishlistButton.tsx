"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api/client";
import { useMemberAuth } from "@/store/memberAuth";
import { useWishlist } from "@/store/wishlist";

/**
 * 찜(하트) 토글 버튼. 회원 전용.
 *
 * 비로그인 상태에서 누르면 로그인 페이지로 보낸다.
 * variant "overlay" 는 상품 카드 위에 올리는 둥근 버튼, "inline" 은 상세용.
 */
export function WishlistButton({
  productId,
  variant = "overlay",
  className,
}: {
  productId: number;
  variant?: "overlay" | "inline";
  className?: string;
}) {
  const router = useRouter();
  const { me, ready, checkAuth } = useMemberAuth();
  const on = useWishlist((s) => s.ids.has(productId));
  const loaded = useWishlist((s) => s.loaded);
  const refresh = useWishlist((s) => s.refresh);
  const toggle = useWishlist((s) => s.toggle);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready) checkAuth();
  }, [ready, checkAuth]);

  useEffect(() => {
    if (ready && me && !loaded) void refresh();
  }, [ready, me, loaded, refresh]);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!me) {
      router.push("/auth/login?next=/products");
      return;
    }
    setBusy(true);
    try {
      await toggle(productId);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/auth/login?next=/products");
      }
    } finally {
      setBusy(false);
    }
  }

  const heart = (
    <svg
      width={variant === "inline" ? 20 : 18}
      height={variant === "inline" ? 20 : 18}
      viewBox="0 0 24 24"
      fill={on ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-pressed={on}
        aria-label={on ? "찜 해제" : "찜하기"}
        className={`inline-flex items-center gap-1.5 rounded-[2px] border px-4 py-2.5 font-kr text-sm transition ${
          on ? "border-clay-deep text-clay-deep" : "border-line text-ink hover:border-ink"
        } ${className ?? ""}`}
      >
        {heart}
        {on ? "찜함" : "찜하기"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={on}
      aria-label={on ? "찜 해제" : "찜하기"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 shadow-sm backdrop-blur transition hover:bg-paper ${
        on ? "text-clay-deep" : "text-ink-soft"
      } ${className ?? ""}`}
    >
      {heart}
    </button>
  );
}
