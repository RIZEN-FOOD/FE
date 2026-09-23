"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { storeNav } from "./storeNav";
import { MemberNavLink } from "./MemberNavLink";
import { MobileMenu } from "./MobileMenu";
import { CartBadge } from "@/components/store/CartBadge";

/**
 * 메인 히어로용 헤더. 풀블리드 히어로 위에 얹힌다.
 *
 * 히어로(어두운 사진) 위에서는 투명 배경 + 밝은 로고/메뉴,
 * 스크롤해 히어로를 지나면 크림 배경 + 어두운 로고/메뉴로 바뀐다.
 * 그래야 어느 구간에서도 헤더가 읽힌다.
 *
 * 모바일도 데스크톱과 같게 움직인다 — 히어로 위에서는 투명, 지나면 크림이다
 * (2026-09-17 에 모바일만 항상 크림으로 뒀다가 2026-09-22 되돌렸다).
 * 로고와 아이콘 색은 배경에 맞춰 같이 뒤집는다.
 */
export function SiteHeader({ forceSolid = false }: { forceSolid?: boolean }) {
  const [solid, setSolid] = useState(forceSolid);

  useEffect(() => {
    // 히어로가 없는 화면(예: 로그인)에서는 항상 크림 배경으로 고정한다.
    if (forceSolid) {
      setSolid(true);
      return;
    }
    // 히어로(data-hero)가 헤더 아래로 완전히 지나가는 순간에 바뀐다 (2026-09-23).
    // 전에는 스크롤 이벤트마다 «화면 높이의 0.8배»를 재봤다 — 매 프레임 계산인 데다
    // 히어로 높이와 무관한 어림이었다. IntersectionObserver 는 교차가 바뀔 때만 한 번 부른다.
    // rootMargin 위쪽을 헤더 높이만큼 당겨, 히어로 바닥이 헤더 밑을 지날 때 정확히 전환한다.
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    if (!hero || typeof IntersectionObserver === "undefined") {
      setSolid(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setSolid(!entry.isIntersecting),
      { rootMargin: "-72px 0px 0px 0px", threshold: 0 },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [forceSolid]);

  const light = !solid; // 히어로 위 = 밝은 텍스트

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid
          ? "border-b border-line bg-cream-warm/95 backdrop-blur"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-wrap items-center justify-between px-7 py-5">
        <Link href="/" aria-label="라이즌푸드 홈">
          {/* 히어로 위(투명)에서는 밝은 로고, 지나면 어두운 로고.
              화면 폭과 상관없이 같은 규칙이다 — 모바일도 히어로 위에서는 투명이다. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={light ? "/assets/brand/logo-white.png" : "/assets/brand/logo.png"}
            alt="RiZen"
            className="h-7 w-auto select-none"
            draggable={false}
          />
        </Link>

        {/* 데스크톱: 오른쪽 정렬 */}
        <nav aria-label="주요 메뉴" className="hidden md:block">
          <ul
            className={`flex items-center gap-6 font-kr text-sm font-medium transition-colors duration-300 ${
              light ? "text-cream-warm" : "text-ink"
            }`}
          >
            {storeNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="underline-offset-4 hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <MemberNavLink />
            </li>
            <li>
              <CartBadge className={light ? "!text-cream-warm hover:!text-cream-warm/70" : ""} />
            </li>
          </ul>
        </nav>

        {/* 모바일: 장바구니 + 햄버거 */}
        <div className={`flex items-center gap-4 md:hidden ${light ? "text-cream-warm" : "text-ink"}`}>
          {/* CartBadge 는 제 색(text-ink)을 직접 들고 있어 부모 색이 먹지 않는다.
              히어로 위에서는 데스크톱과 같은 방식으로 덮어쓴다. */}
          <CartBadge className={light ? "!text-cream-warm hover:!text-cream-warm/70" : ""} />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
