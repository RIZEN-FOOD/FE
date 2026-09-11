"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import type { HeroSlide } from "@/types/product";

/**
 * 메인 히어로 — 제품 스와이프 캐러셀.
 *
 * 슬라이드마다 제품 누끼 이미지가 배경색 위에 떠 있고, 넘길 때 배경색이 그 제품 색으로
 * 부드럽게 바뀐다. 데스크톱은 화살표+드래그, 모바일은 터치 스와이프. 도트로 위치 표시.
 *
 * ★ 제품·색·이미지는 전부 DB(/api/products/hero)에서 온다. 하드코딩하지 않는다.
 *   신제품이 노출·메인노출로 등록되면 자동으로 이 캐러셀에 편입된다.
 * ★ 문구는 제품 이름·한줄설명(DB)만 쓴다. 효능·효과 표현을 넣지 않는다.
 */
const DEFAULT_COLOR = "#C98A63"; // heroColor 미지정 시 브랜드 클레이 톤
const SWIPE_THRESHOLD = 60; // px. 이보다 많이 끌면 다음/이전으로 넘어간다.

/** 배경색 밝기에 따라 글자색을 정한다(밝은 배경엔 어두운 글자). */
function isLight(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})/i.exec(hex);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  // 상대 휘도 근사
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62;
}

/** hex 를 amt(-1~1)만큼 밝게(+)/어둡게(-) 섞는다. */
function shade(hex: string, amt: number): string {
  const m = /^#?([0-9a-f]{6})/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const mix = (c: number) => {
    const t = amt < 0 ? 0 : 255;
    const p = Math.abs(amt);
    return Math.round(c + (t - c) * p);
  };
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `rgb(${r}, ${g}, ${b})`;
}

/** 제품 색으로 만든 부드러운 배경 그라데이션. */
function heroGradient(hex: string): string {
  return `radial-gradient(120% 90% at 50% 25%, ${shade(hex, 0.16)} 0%, ${hex} 45%, ${shade(hex, -0.22)} 100%)`;
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [dragPx, setDragPx] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const count = slides.length;
  const clamp = useCallback((i: number) => Math.max(0, Math.min(count - 1, i)), [count]);

  const go = useCallback((i: number) => setActive((prev) => clamp(i ?? prev)), [clamp]);

  // 키보드 좌우 화살표
  useEffect(() => {
    if (count <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setActive((i) => clamp(i - 1));
      if (e.key === "ArrowRight") setActive((i) => clamp(i + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, clamp]);

  function onPointerDown(e: React.PointerEvent) {
    if (count <= 1) return;
    dragging.current = true;
    startX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    setDragPx(e.clientX - startX.current);
  }
  function endDrag() {
    if (!dragging.current) return;
    dragging.current = false;
    setDragPx((dx) => {
      if (dx <= -SWIPE_THRESHOLD) setActive((i) => clamp(i + 1));
      else if (dx >= SWIPE_THRESHOLD) setActive((i) => clamp(i - 1));
      return 0;
    });
  }

  if (count === 0) return null;

  const current = slides[active];
  const bg = current.heroColor || DEFAULT_COLOR;
  const light = isLight(bg);
  const ink = light ? "#221E1C" : "#FAF7F1";
  const subInk = light ? "rgba(34,30,28,0.72)" : "rgba(250,247,241,0.82)";

  return (
    <section
      className="relative min-h-svh w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label="대표 상품"
      style={{ backgroundColor: shade(bg, -0.1) }}
    >
      {/* 배경 색 그라데이션 — 슬라이드마다 한 겹씩 깔고, 활성 슬라이드만 서서히 나타난다.
          단순히 색을 바꾸는 게 아니라 다음 색이 천천히 배어 나오듯 크로스페이드된다. */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: heroGradient(s.heroColor || DEFAULT_COLOR),
            opacity: i === active ? 1 : 0,
            transition: "opacity 1100ms ease",
          }}
        />
      ))}

      {/* 장식이 은은하게 떠다니는 애니메이션 (모션 최소화 설정이면 정지) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes rz-float-a { 0%,100%{transform:translateY(0) rotate(-4deg)} 50%{transform:translateY(-14px) rotate(-4deg)} }
@keyframes rz-float-b { 0%,100%{transform:translateY(0) rotate(6deg)} 50%{transform:translateY(16px) rotate(6deg)} }
@media (prefers-reduced-motion: no-preference){
  .rz-accent-a{animation:rz-float-a 6s ease-in-out infinite}
  .rz-accent-b{animation:rz-float-b 7s ease-in-out infinite}
}`,
        }}
      />
      {/* 위·아래 살짝 어둡게 — 투명 헤더와 하단 도트가 배경색과 무관하게 읽힌다 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28"
        style={{ background: `linear-gradient(to bottom, ${light ? "rgba(0,0,0,0.10)" : "rgba(0,0,0,0.22)"}, transparent)` }}
      />

      {/* 트랙 */}
      <div
        ref={trackRef}
        className="flex h-full min-h-svh"
        style={{
          transform: `translateX(calc(${-active * 100}% + ${dragPx}px))`,
          transition: dragging.current ? "none" : "transform 700ms cubic-bezier(0.22,1,0.36,1)",
          touchAction: "pan-y",
          userSelect: dragging.current ? "none" : "auto",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        {slides.map((s) => (
          <div key={s.id} className="relative flex min-h-svh w-full shrink-0 items-center">
            {/* 떠다니는 재료 장식 (데스크톱). 제품 뒤 레이어라 문구를 가리지 않는다. */}
            {(s.accentImageUrls ?? []).slice(0, 2).map((url, ai) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={ai}
                src={url}
                alt=""
                aria-hidden="true"
                draggable={false}
                className={`pointer-events-none absolute z-0 hidden select-none object-contain drop-shadow-[0_16px_30px_rgba(0,0,0,0.22)] md:block ${
                  ai === 0
                    ? "right-[13%] top-[15%] w-[13%] rz-accent-a"
                    : "bottom-[16%] left-[14%] w-[15%] rz-accent-b"
                }`}
              />
            ))}
            <div className="relative z-10 mx-auto grid w-full max-w-wrap items-center gap-6 px-6 py-24 md:grid-cols-[1fr_minmax(0,44%)_1fr] md:px-12 md:py-0">
              {/* 문구 (좌) */}
              <div className="order-2 text-center md:order-1 md:text-left">
                <p className="font-en text-[12px] font-semibold uppercase tracking-[0.24em]" style={{ color: subInk }}>
                  Cream of Rice
                </p>
                <h2
                  className="mt-3 font-display text-[clamp(2.2rem,6vw,3.6rem)] font-semibold leading-[1.08] tracking-[-0.02em] [word-break:keep-all]"
                  style={{ color: ink }}
                >
                  {s.nameKo}
                </h2>
                {s.subtitle && (
                  <p className="mx-auto mt-4 max-w-xs font-kr text-[15px] leading-[1.7] [word-break:keep-all] md:mx-0" style={{ color: subInk }}>
                    {s.subtitle}
                  </p>
                )}
              </div>

              {/* 제품 이미지 (중앙, 누끼) */}
              <div className="order-1 flex justify-center md:order-2">
                {s.heroImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.heroImageUrl}
                    alt={s.nameKo}
                    className="max-h-[38svh] w-auto object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.28)] md:max-h-[62svh]"
                    draggable={false}
                    fetchPriority={active === 0 ? "high" : undefined}
                  />
                ) : (
                  <div className="flex h-[38svh] w-full items-center justify-center rounded-[8px] bg-white/10 font-en text-sm md:h-[62svh]" style={{ color: subInk }}>
                    이미지 준비 중
                  </div>
                )}
              </div>

              {/* 가격 + CTA (우) */}
              <div className="order-3 flex flex-col items-center gap-4 md:items-end">
                <div className="text-center md:text-right">
                  <p className="font-numeric text-[clamp(1.8rem,4vw,2.4rem)] font-bold" style={{ color: ink }}>
                    {s.effectivePrice.toLocaleString("ko-KR")}
                    <span className="ml-1 font-kr text-base font-medium">원</span>
                  </p>
                  {s.soldOut && (
                    <p className="mt-1 font-kr text-sm font-medium" style={{ color: subInk }}>
                      곧 만나요
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={`/products/${s.slug}`}
                    className="rounded-[3px] px-7 py-3.5 font-kr text-sm font-bold transition hover:opacity-90"
                    style={{ backgroundColor: ink, color: bg }}
                  >
                    {s.soldOut ? "제품 보기" : "구매하기"}
                  </Link>
                  <Link
                    href="/products"
                    className="rounded-[3px] border px-7 py-3.5 font-kr text-sm font-medium transition hover:opacity-80"
                    style={{ borderColor: light ? "rgba(34,30,28,0.4)" : "rgba(250,247,241,0.5)", color: ink }}
                  >
                    전체 상품
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 화살표 (데스크톱, 2장 이상) */}
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="이전 상품"
            onClick={() => go(active - 1)}
            disabled={active === 0}
            className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full p-2 transition hover:bg-black/10 disabled:opacity-30 md:block"
            style={{ color: ink }}
          >
            <Arrow dir="left" />
          </button>
          <button
            type="button"
            aria-label="다음 상품"
            onClick={() => go(active + 1)}
            disabled={active === count - 1}
            className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full p-2 transition hover:bg-black/10 disabled:opacity-30 md:block"
            style={{ color: ink }}
          >
            <Arrow dir="right" />
          </button>
        </>
      )}

      {/* 도트 */}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center gap-2.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`${i + 1}번째 상품으로`}
              aria-current={i === active}
              onClick={() => go(i)}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === active ? 24 : 8,
                backgroundColor: i === active ? ink : light ? "rgba(34,30,28,0.35)" : "rgba(250,247,241,0.45)",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  );
}
