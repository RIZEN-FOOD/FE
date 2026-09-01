"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useMemberAuth } from "@/store/memberAuth";

/**
 * 헤더의 로그인/마이페이지 링크.
 *
 * 로그인 상태에 따라 "로그인" ↔ "마이페이지"만 바뀐다.
 * 헤더 전체를 클라이언트로 만들지 않기 위해 이 조각만 분리했다.
 *
 * 확인 전에는 "로그인"을 보여준다 — 서버 렌더 결과와 같아서 깜빡이지 않는다.
 */
export function MemberNavLink() {
  const { me, ready, checkAuth } = useMemberAuth();

  useEffect(() => {
    if (!ready) checkAuth();
  }, [ready, checkAuth]);

  const loggedIn = ready && me;

  return (
    <Link
      href={loggedIn ? "/mypage" : "/auth/login"}
      className="underline-offset-4 hover:underline"
    >
      {loggedIn ? "마이페이지" : "로그인"}
    </Link>
  );
}
