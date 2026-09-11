"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * 문의 퀵메뉴. 화면 우하단에 떠 있는 플로팅 버튼.
 *
 * 누르면 위로 메뉴가 펼쳐진다 — 문의하기, 자주 묻는 질문, 맨 위로.
 *
 * ★ revealAfterHero: 메인처럼 첫 화면이 히어로일 때, 히어로를 지나야 나타난다.
 *   (히어로 위에 버튼이 겹치지 않게)
 */
export function QuickMenu({ revealAfterHero = false }: { revealAfterHero?: boolean }) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(!revealAfterHero);

  useEffect(() => {
    if (!revealAfterHero) return;
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [revealAfterHero]);

  const items: { label: string; href?: string; onClick?: () => void }[] = [
    { label: "문의하기", href: "/inquiry" },
    { label: "자주 묻는 질문", href: "/faq" },
    {
      label: "맨 위로",
      onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
  ];

  if (!shown) return null;

  return (
    <div className="fixed bottom-24 right-5 z-50 flex flex-col items-end gap-2 md:bottom-8">
      {/* 펼쳐지는 메뉴 */}
      <div
        className={`flex flex-col items-end gap-2 transition-all duration-300 ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {items.map((item) =>
          item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-full border border-line bg-paper px-4 py-2 font-kr text-sm text-ink shadow-[0_6px_20px_rgba(90,60,40,0.14)] transition hover:bg-clay-soft/40"
            >
              {item.label}
            </Link>
          ) : (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className="rounded-full border border-line bg-paper px-4 py-2 font-kr text-sm text-ink shadow-[0_6px_20px_rgba(90,60,40,0.14)] transition hover:bg-clay-soft/40"
            >
              {item.label}
            </button>
          ),
        )}
      </div>

      {/* 토글 버튼 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="문의 메뉴"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-cream-warm shadow-[0_10px_28px_rgba(34,30,28,0.28)] transition hover:bg-slate-deep"
      >
        <span className={`text-xl transition-transform duration-300 ${open ? "rotate-45" : ""}`}>
          {open ? "+" : "?"}
        </span>
      </button>
    </div>
  );
}
