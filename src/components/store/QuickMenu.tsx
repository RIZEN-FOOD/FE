"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * 문의 퀵메뉴. 화면 우하단에 항상 떠 있는 플로팅 버튼.
 *
 * 누르면 위로 메뉴가 펼쳐진다 — 문의하기, 자주 묻는 질문, 맨 위로.
 * 어느 페이지에서든 바로 문의로 갈 수 있게 한다.
 *
 * ⚠️ 문의 폼(Phase 5)이 생기기 전까지 "문의하기"는 자리만 잡아둔다.
 */
export function QuickMenu() {
  const [open, setOpen] = useState(false);

  const items: { label: string; href?: string; onClick?: () => void }[] = [
    { label: "문의하기", href: "/inquiry" },
    { label: "자주 묻는 질문", href: "/faq" },
    {
      label: "맨 위로",
      onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
  ];

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
