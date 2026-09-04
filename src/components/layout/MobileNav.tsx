"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { BrandLogo } from "@/components/ui";
import { storeNav } from "./storeNav";
import { MemberNavLink } from "./MemberNavLink";

/**
 * 모바일 사이드 네비게이션.
 *
 * 데스크톱에서는 헤더에 항목이 그대로 펼쳐지므로 이 햄버거는 md 미만에서만 보인다.
 * 열면 오른쪽에서 패널이 밀려 나오고, 배경을 어둡게 덮는다.
 *
 * ★ 패널은 "열려 있을 때만" DOM 에 올린다.
 *   fixed 로 화면 밖(translate-x-full)에 대기시키면 문서 폭이 늘어 모바일에
 *   가로 스크롤이 생긴다. 열 때 마운트하고, 닫는 전환이 끝나면 내린다.
 *
 * 접근성
 *   - 햄버거에 aria-expanded / aria-controls
 *   - 패널은 role="dialog" aria-modal, Escape 로 닫힘
 *   - 열려 있는 동안 본문 스크롤을 잠근다
 *   - 패널 안의 링크를 누르면(이동하면) 자동으로 닫힌다 (이벤트 위임)
 */
export function MobileNav() {
  const [mounted, setMounted] = useState(false); // DOM 에 존재하는가
  const [shown, setShown] = useState(false); // 전환이 들어온 상태(패널이 화면 안)

  const open = useCallback(() => {
    setMounted(true);
    // 다음 프레임에 전환을 켜서 translate-x-full → 0 슬라이드가 보이게 한다.
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  }, []);

  const close = useCallback(() => setShown(false), []);

  // 열려 있는 동안 배경 스크롤 잠금 + Escape 로 닫기
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mounted, close]);

  return (
    <>
      <button
        type="button"
        aria-label="메뉴 열기"
        aria-expanded={mounted && shown}
        aria-controls="mobile-nav-panel"
        onClick={open}
        className="inline-flex items-center justify-center text-current transition hover:opacity-70"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {mounted && (
        <>
          {/* 배경 */}
          <div
            aria-hidden="true"
            onClick={close}
            className={`fixed inset-0 z-50 bg-ink/40 transition-opacity duration-300 ${
              shown ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* 패널 — 전환이 끝나고 닫힌 상태면 DOM 에서 내린다 */}
          <div
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label="사이트 메뉴"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) close();
            }}
            onTransitionEnd={(e) => {
              if (e.propertyName === "transform" && !shown) setMounted(false);
            }}
            className={`fixed inset-y-0 right-0 z-50 flex w-[78%] max-w-[320px] flex-col bg-cream-warm shadow-[-12px_0_40px_rgba(90,60,40,0.18)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              shown ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <BrandLogo className="h-6" />
              <button
                type="button"
                aria-label="메뉴 닫기"
                onClick={close}
                className="inline-flex items-center justify-center text-ink transition hover:text-clay-deep"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <nav aria-label="주요 메뉴" className="flex flex-col px-2 py-4">
              {storeNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[3px] px-4 py-3 font-kr text-base font-medium text-ink transition hover:bg-cream"
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-2 border-t border-line" />
              <div className="px-4 py-3 font-kr text-base font-medium text-ink [&_a]:block">
                <MemberNavLink />
              </div>
              <Link
                href="/cart"
                className="rounded-[3px] px-4 py-3 font-kr text-base font-medium text-ink transition hover:bg-cream"
              >
                장바구니
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
