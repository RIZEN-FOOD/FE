"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
 * ★ 오버레이(배경+패널)는 createPortal 로 document.body 에 그린다.
 *   헤더에 backdrop-blur(=backdrop-filter)가 걸려 있으면 그 헤더가 하위
 *   position:fixed 요소의 "컨테이닝 블록"이 된다. 그러면 inset-y-0/right-0 이
 *   뷰포트가 아니라 헤더 박스(높이 ~60px)를 기준으로 잡혀 패널이 헤더 높이만큼
 *   잘린다. body 로 포탈해 헤더 밖으로 빼내면 항상 뷰포트 전체를 덮는다.
 *
 * 접근성
 *   - 햄버거에 aria-expanded / aria-controls
 *   - 패널은 role="dialog" aria-modal, Escape 로 닫힘
 *   - 열려 있는 동안 본문 스크롤을 잠근다
 *   - 패널 안의 링크를 누르면(이동하면) 자동으로 닫힌다 (이벤트 위임)
 *
 * ★ 닫힌 뒤 투명한 배경이 남아 화면 전체 터치를 막으면 안 된다 (2026-09-17 모바일 버그).
 *   닫는 전환의 transitionend 는 페이지 이동·탭 전환 중에 오지 않을 수 있다. 그래서
 *   - 닫히는 중인 배경은 pointer-events 를 끈다
 *   - DOM 에서 내리는 것은 transitionend 가 아니라 타이머로 확실히 한다
 *   - 주소가 바뀌면 즉시 내리고 스크롤 잠금도 푼다
 */
const CLOSE_MS = 320;

export function MobileNav() {
  const [mounted, setMounted] = useState(false); // DOM 에 존재하는가
  const [shown, setShown] = useState(false); // 전환이 들어온 상태(패널이 화면 안)
  const unmountTimer = useRef<number | null>(null);
  const pathname = usePathname();

  const clearTimer = () => {
    if (unmountTimer.current !== null) {
      window.clearTimeout(unmountTimer.current);
      unmountTimer.current = null;
    }
  };

  const open = useCallback(() => {
    clearTimer();
    setMounted(true);
    // 다음 프레임에 전환을 켜서 translate-x-full → 0 슬라이드가 보이게 한다.
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  }, []);

  const close = useCallback(() => {
    setShown(false);
    clearTimer();
    unmountTimer.current = window.setTimeout(() => {
      unmountTimer.current = null;
      setMounted(false);
    }, CLOSE_MS);
  }, []);

  // 다른 화면으로 이동했으면 전환을 기다리지 않고 바로 내린다
  useEffect(() => {
    clearTimer();
    setShown(false);
    setMounted(false);
  }, [pathname]);

  useEffect(() => clearTimer, []);

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

      {mounted &&
        createPortal(
          <>
          {/* 배경 */}
          <div
            aria-hidden="true"
            onClick={close}
            className={`fixed inset-0 z-50 bg-ink/40 transition-opacity duration-300 ${
              shown ? "opacity-100" : "pointer-events-none opacity-0"
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
            className={`fixed inset-y-0 right-0 z-50 flex w-[78%] max-w-[320px] flex-col bg-cream-warm shadow-[-12px_0_40px_rgba(90,60,40,0.18)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              shown ? "translate-x-0" : "pointer-events-none translate-x-full"
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
              <MemberNavLink variant="mobile" />
              <Link
                href="/cart"
                className="rounded-[3px] px-4 py-3 font-kr text-base font-medium text-ink transition hover:bg-cream"
              >
                장바구니
              </Link>
            </nav>
          </div>
        </>,
          document.body,
        )}
    </>
  );
}
