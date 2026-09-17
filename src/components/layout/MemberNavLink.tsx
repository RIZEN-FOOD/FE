"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCart } from "@/store/cart";
import { useMemberAuth } from "@/store/memberAuth";

/**
 * 헤더의 회원 메뉴.
 *
 *   로그인 전: 로그인
 *   로그인 후: 마이페이지 · 로그아웃
 *
 * 헤더 전체를 클라이언트로 만들지 않기 위해 이 조각만 분리했다.
 * 확인 전에는 "로그인"을 보여준다 — 서버 렌더 결과와 같아서 깜빡이지 않는다.
 *
 * 로그아웃하면 서버가 로그인 토큰을 모두 끊는다(/api/auth/logout).
 * 장바구니는 회원 것에서 비회원 것으로 바뀌므로 다시 불러오고,
 * 로그인해야 볼 수 있는 화면(마이페이지)에 있었다면 메인으로 보낸다.
 */
const MEMBER_ONLY_PATHS = ["/mypage"];

export function MemberNavLink({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const router = useRouter();
  const pathname = usePathname();
  const { me, ready, checkAuth, logout } = useMemberAuth();
  const refreshCart = useCart((s) => s.refresh);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!ready) checkAuth();
  }, [ready, checkAuth]);

  const loggedIn = Boolean(ready && me);

  async function handleLogout() {
    setLeaving(true);
    try {
      await logout();
      await refreshCart().catch(() => undefined);
      if (MEMBER_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
        router.replace("/");
      } else {
        router.refresh();
      }
    } finally {
      setLeaving(false);
    }
  }

  const linkClass =
    variant === "mobile"
      ? "block rounded-[3px] px-4 py-3 font-kr text-base font-medium text-ink transition hover:bg-cream"
      : "underline-offset-4 hover:underline";

  if (!loggedIn) {
    return (
      <Link href="/auth/login" className={linkClass}>
        로그인
      </Link>
    );
  }

  const logoutButton = (
    <button
      type="button"
      onClick={handleLogout}
      disabled={leaving}
      className={
        variant === "mobile"
          ? "block w-full rounded-[3px] px-4 py-3 text-left font-kr text-base font-medium text-ink-soft transition hover:bg-cream disabled:opacity-50"
          : "underline-offset-4 opacity-80 hover:underline hover:opacity-100 disabled:opacity-50"
      }
    >
      {leaving ? "로그아웃 중…" : "로그아웃"}
    </button>
  );

  if (variant === "mobile") {
    return (
      <>
        <Link href="/mypage" className={linkClass}>
          마이페이지
        </Link>
        {logoutButton}
      </>
    );
  }

  return (
    <span className="flex items-center gap-6">
      <Link href="/mypage" className={linkClass}>
        마이페이지
      </Link>
      {logoutButton}
    </span>
  );
}
