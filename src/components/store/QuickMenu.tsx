"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * 문의 퀵메뉴. 화면 우하단에 떠 있는 플로팅 버튼.
 *
 * 누르면 위로 메뉴가 펼쳐진다 — 문의하기, 자주 묻는 질문, 맨 위로.
 *
 * ★ revealAfterHero: 메인처럼 첫 화면이 히어로일 때, 히어로를 지나야 나타난다.
 *   (히어로 위에 버튼이 겹치지 않게)
 * ★ 주문서·결제 화면에서는 숨긴다. 좁은 화면에서 버튼이 주소 입력칸을 가렸고
 *   (모바일 390px 에서 82px 겹침), 결제 중에 다른 곳으로 새게 할 이유도 없다.
 */

/** 이 화면들에서는 띄우지 않는다. 주문을 끝내는 흐름이라 방해가 된다. */
const HIDDEN_PATHS = ["/checkout", "/cart"];
export function QuickMenu({ revealAfterHero = false }: { revealAfterHero?: boolean }) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(!revealAfterHero);
  const pathname = usePathname();

  // 다른 화면으로 이동하면 펼친 메뉴를 접는다
  useEffect(() => setOpen(false), [pathname]);

  // 히어로(data-hero)가 화면에서 완전히 나가면 나타난다. 헤더와 같은 방식 (2026-09-23).
  // 스크롤 이벤트마다 재는 대신 교차가 바뀔 때만 한 번 부른다. 히어로가 없으면 그냥 보인다.
  useEffect(() => {
    if (!revealAfterHero) return;
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    if (!hero || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setShown(!entry.isIntersecting), {
      rootMargin: "-72px 0px 0px 0px",
      threshold: 0,
    });
    io.observe(hero);
    return () => io.disconnect();
  }, [revealAfterHero]);

  const items: { label: string; href?: string; onClick?: () => void }[] = [
    { label: "문의하기", href: "/inquiry" },
    {
      label: "맨 위로",
      onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
  ];

  const hidden = HIDDEN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (!shown || hidden) return null;

  return (
    // ★ 바깥 상자는 터치를 받지 않는다(pointer-events-none). 접힌 메뉴도 자리는 그대로 차지해서,
    //   상자가 터치를 받으면 그 아래 깔린 푸터 링크가 눌리지 않는다(실제로 '문의하기'가 막혔다).
    //   실제로 눌려야 하는 버튼에만 pointer-events-auto 를 준다.
    <div className="pointer-events-none fixed bottom-24 right-5 z-50 flex flex-col items-end gap-2 md:bottom-8">
      {/* 펼쳐지는 메뉴 */}
      <div
        className={`flex flex-col items-end gap-2 transition-all duration-300 ${
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {items.map((item) =>
          item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className="inline-flex min-h-10 items-center rounded-[6px] border border-line bg-paper px-4 py-2 font-kr text-sm text-ink shadow-[0_6px_20px_rgba(90,60,40,0.14)] transition hover:bg-clay-soft/40"
            >
              {item.label}
            </Link>
          ) : (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className="inline-flex min-h-10 items-center rounded-[6px] border border-line bg-paper px-4 py-2 font-kr text-sm text-ink shadow-[0_6px_20px_rgba(90,60,40,0.14)] transition hover:bg-clay-soft/40"
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
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-cream-warm shadow-[0_10px_28px_rgba(34,30,28,0.28)] transition hover:bg-slate-deep"
      >
        {/* 닫힘: 로고의 R 한 글자 (2026-09-23, 물음표 대신). 열림: + 를 45도 돌린 닫기 표시.
            둘 다 같은 자리에서 페이드로 바뀐다. 이미지는 로고 원본에서 R 만 따서 크림색으로 만든 것. */}
        <span className="relative block h-7 w-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/brand/logo-r-white.png"
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 m-auto h-[26px] w-auto select-none transition-[opacity,transform] duration-[var(--dur-base)] ease-[var(--ease-out)] ${
              open ? "scale-75 opacity-0" : "scale-100 opacity-100"
            }`}
            draggable={false}
          />
          <span
            aria-hidden="true"
            className={`absolute inset-0 flex items-center justify-center text-2xl leading-none transition-[opacity,transform] duration-[var(--dur-base)] ease-[var(--ease-out)] ${
              open ? "rotate-45 opacity-100" : "rotate-0 opacity-0"
            }`}
          >
            +
          </span>
        </span>
      </button>
    </div>
  );
}
