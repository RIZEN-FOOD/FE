"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { storeNav } from "./storeNav";
import { MemberNavLink } from "./MemberNavLink";
import { MobileNav } from "./MobileNav";
import { CartBadge } from "@/components/store/CartBadge";

/**
 * 메인 히어로용 헤더. 풀블리드 히어로 위에 얹힌다.
 *
 * 히어로(어두운 사진) 위에서는 투명 배경 + 밝은 로고/메뉴,
 * 스크롤해 히어로를 지나면 크림 배경 + 어두운 로고/메뉴로 바뀐다.
 * 그래야 어느 구간에서도 헤더가 읽힌다.
 */
export function SiteHeader() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // 히어로(대략 한 화면)를 거의 지났을 때 크림 배경으로 전환한다.
      setSolid(window.scrollY > window.innerHeight * 0.8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const light = !solid; // 히어로 위 = 밝은 텍스트

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "border-b border-line bg-cream-warm/95 backdrop-blur" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-wrap items-center justify-between px-7 py-5">
        <Link href="/" aria-label="라이즌푸드 홈">
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
          <CartBadge className={light ? "!text-cream-warm" : ""} />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
