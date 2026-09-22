"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { storeNav } from "./storeNav";
import { MemberNavLink } from "./MemberNavLink";

/**
 * 모바일 헤더 드롭다운.
 *
 * 2026-09-22. 그 전에는 오른쪽에서 밀려 나오는 사이드 드로어였다. 드로어는
 * body 로 포탈 + 화면 전체 오버레이 + 스크롤 잠금 세 가지가 맞물려 있어서,
 * 닫는 전환이 중간에 끊기면 투명한 오버레이가 남아 화면 전체가 안 눌렸다
 * (2026-09-17 모바일 버그). 항목이 평면 예닐곱 개뿐이라 드로어를 쓸 이유도 없었다.
 *
 * 그래서 헤더 바로 아래로 펼쳐지는 드롭다운으로 바꿨다.
 *   - 포탈·오버레이·스크롤 잠금이 전부 없다. 남을 것이 없으니 그 버그가 다시 안 난다
 *   - 헤더가 계속 보인다. 닫기 버튼을 못 찾는 일이 없다
 *   - 높이는 grid-rows 0fr → 1fr 로 늘린다. max-height 에 숫자를 박지 않아
 *     항목이 늘어도 애니메이션이 어긋나지 않는다
 *
 * 고객센터만 아코디언이다. 문의·공지·정책 세 갈래는 원래 푸터에만 있어
 * 모바일에서 찾기 어려웠다. 나머지는 접을 것이 없으므로 평면으로 둔다.
 * (주문 조회는 비회원일 때 MemberNavLink 가 이미 내놓으므로 여기 넣지 않는다.)
 */
const SUPPORT_LINKS: { href: string; label: string }[] = [
  { href: "/inquiry", label: "문의하기" },
  { href: "/notice", label: "공지사항" },
  { href: "/policy/shipping", label: "배송 · 교환 · 환불" },
  { href: "/policy/privacy", label: "개인정보처리방침" },
  { href: "/policy/terms", label: "이용약관" },
];

const ITEM = "block rounded-[6px] px-4 py-3 font-kr text-base font-medium text-ink transition hover:bg-cream";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setSupportOpen(false);
  }, []);

  // 화면을 옮기면 닫는다
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Escape 로 닫기 + 메뉴 바깥을 누르면 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open, close]);

  return (
    <div ref={rootRef} className="md:hidden">
      <button
        type="button"
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        onClick={() => setOpen((v) => !v)}
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
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {/* 헤더 바로 아래로 펼쳐지는 판.
          ★ 여닫히는 값(max-height·opacity)만 인라인 style 로 둔다. 상태에 따라
            바뀌는 값이라 한자리에 모아두는 편이 쫓아가기 쉽다. 나머지 모양은 클래스다.
          ★ grid-rows 0fr→1fr 방식은 쓰지 않는다. 판 안에 세로 스크롤이 있으면
            그 내용의 최소 높이가 0 이라 1fr 트랙이 0 으로 접힌다. */}
      <div
        id="mobile-menu-panel"
        style={{ maxHeight: open ? "75svh" : 0, opacity: open ? 1 : 0 }}
        className={`absolute inset-x-0 top-full overflow-y-auto overscroll-contain bg-cream-warm transition-[max-height,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open
            ? "border-b border-line shadow-[0_18px_40px_rgba(90,60,40,0.14)]"
            : "pointer-events-none"
        }`}
      >
        <div>
          <nav aria-label="사이트 메뉴" className="flex flex-col px-4 py-4">
            {storeNav.map((item) => (
              <Link key={item.href} href={item.href} onClick={close} className={ITEM}>
                {item.label}
              </Link>
            ))}

            {/* 고객센터 — 아코디언 */}
            <button
              type="button"
              aria-expanded={supportOpen}
              aria-controls="mobile-menu-support"
              onClick={() => setSupportOpen((v) => !v)}
              className="flex items-center justify-between rounded-[6px] px-4 py-3 text-left font-kr text-base font-medium text-ink transition hover:bg-cream"
            >
              고객센터
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`transition-transform duration-300 ${supportOpen ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div
              id="mobile-menu-support"
              style={{ maxHeight: supportOpen ? "360px" : 0 }}
              className="overflow-hidden transition-[max-height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              <div>
                <div className="ml-3 border-l border-line pl-2">
                  {SUPPORT_LINKS.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      onClick={close}
                      tabIndex={supportOpen ? undefined : -1}
                      aria-hidden={supportOpen ? undefined : true}
                      className="block rounded-[6px] px-4 py-2.5 font-kr text-base text-ink-soft transition hover:bg-cream hover:text-ink"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="my-2 border-t border-line" />

            <MemberNavLink variant="mobile" onNavigate={close} />

            <Link href="/cart" onClick={close} className={ITEM}>
              장바구니
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
