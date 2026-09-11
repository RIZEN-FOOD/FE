"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { HeroSlide } from "@/types/product";

/**
 * 메인 히어로 — 제품 전환 캐러셀.
 *
 * 레퍼런스 모션: 문구·가격은 제자리에 두고 가운데 "제품"만 바뀐다.
 * 현재 제품은 우하단 코너로 작아지며 빠지고, 다음 제품이 코너에서 커지며 중앙으로 온다.
 * 배경색은 그 제품 색으로 천천히(그라데이션) 크로스페이드된다. 자동으로 넘어가고,
 * 화살표·도트·스와이프로도 넘길 수 있다. 상호작용/호버 중에는 자동 전환을 멈춘다.
 *
 * ★ 제품·색·이미지·장식은 전부 DB(/api/products/hero)에서 온다. 하드코딩하지 않는다.
 * ★ 문구는 제품 이름·한줄설명(DB)만 쓴다. 효능·효과 표현을 넣지 않는다.
 */
const DEFAULT_COLOR = "#C98A63";
const AUTO_MS = 5000; // 자동 전환 간격
const SWIPE_THRESHOLD = 60;

function isLight(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})/i.exec(hex);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.62;
}

/** hex 를 amt(-1~1)만큼 밝게(+)/어둡게(-) 섞는다. */
function shade(hex: string, amt: number): string {
  const m = /^#?([0-9a-f]{6})/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const mix = (c: number) => Math.round(c + (t - c) * p);
  return `rgb(${mix((n >> 16) & 255)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`;
}

function heroGradient(hex: string): string {
  return `radial-gradient(120% 90% at 50% 22%, ${shade(hex, 0.16)} 0%, ${hex} 45%, ${shade(hex, -0.24)} 100%)`;
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const count = slides.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);

  const nextIdx = (i: number) => (i + 1) % count;
  const prevIdx = (i: number) => (i - 1 + count) % count;

  // 자동 전환 (호버·드래그 중엔 멈춤, 모션 최소화 설정이면 아예 끔)
  useEffect(() => {
    if (count <= 1 || paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setActive((i) => nextIdx(i)), AUTO_MS);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, paused]);

  useEffect(() => {
    if (count <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setActive(prevIdx);
      if (e.key === "ArrowRight") setActive(nextIdx);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  function onPointerDown(e: React.PointerEvent) {
    if (count <= 1) return;
    dragging.current = true;
    startX.current = e.clientX;
    setPaused(true);
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!dragging.current) return;
    dragging.current = false;
    const dx = e.clientX - startX.current;
    if (dx <= -SWIPE_THRESHOLD) setActive(nextIdx);
    else if (dx >= SWIPE_THRESHOLD) setActive(prevIdx);
  }

  if (count === 0) return null;

  const current = slides[active];
  const bg = current.heroColor || DEFAULT_COLOR;
  const light = isLight(bg);
  const ink = light ? "#221E1C" : "#FAF7F1";
  const subInk = light ? "rgba(34,30,28,0.72)" : "rgba(250,247,241,0.82)";

  // 각 제품 이미지의 상태(중앙/코너/숨김)를 active 기준으로 정한다.
  function stageStyle(i: number): React.CSSProperties {
    if (i === active) {
      return { transform: "translate(0,0) scale(1)", opacity: 1, zIndex: 20 };
    }
    if (i === nextIdx(active)) {
      // 다음 제품 — 우하단 코너에 미리보기로 대기
      return { transform: "translate(34%, 32%) scale(0.34)", opacity: 0.72, zIndex: 10 };
    }
    // 그 외(방금 빠진 것 포함) — 코너에서 사라진다
    return { transform: "translate(34%, 32%) scale(0.34)", opacity: 0, zIndex: 5 };
  }

  return (
    <section
      className="relative min-h-svh w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label="대표 상품"
      style={{ backgroundColor: shade(bg, -0.1) }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (dragging.current = false)}
    >
      {/* 배경 색 그라데이션 — 활성 제품 색이 천천히 배어 나오듯 크로스페이드 */}
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
      {/* 상단 살짝 어둡게 — 투명 헤더 가독성 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-28"
        style={{ background: `linear-gradient(to bottom, ${light ? "rgba(0,0,0,0.10)" : "rgba(0,0,0,0.22)"}, transparent)` }}
      />

      {/* 떠다니는 재료 장식 — 현재 제품 것만, 넘어갈 때 함께 크로스페이드 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes rz-float-a{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-14px) rotate(-4deg)}}
@keyframes rz-float-b{0%,100%{transform:translateY(0) rotate(6deg)}50%{transform:translateY(16px) rotate(6deg)}}
@keyframes rz-textin{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@media (prefers-reduced-motion: no-preference){
  .rz-accent-a{animation:rz-float-a 6s ease-in-out infinite}
  .rz-accent-b{animation:rz-float-b 7s ease-in-out infinite}
}`,
        }}
      />
      {(current.accentImageUrls ?? []).slice(0, 2).map((url, ai) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${active}-${ai}`}
          src={url}
          alt=""
          aria-hidden="true"
          draggable={false}
          className={`pointer-events-none absolute z-[8] hidden select-none object-contain drop-shadow-[0_16px_30px_rgba(0,0,0,0.22)] md:block ${
            ai === 0 ? "right-[12%] top-[15%] w-[12%] rz-accent-a" : "bottom-[16%] left-[13%] w-[14%] rz-accent-b"
          }`}
        />
      ))}

      {/* 콘텐츠: 문구(좌) · 제품 스테이지(중앙) · 가격(우) — 레이아웃 고정 */}
      <div className="relative z-10 mx-auto grid min-h-svh w-full max-w-wrap items-center gap-6 px-6 py-24 md:grid-cols-[1fr_minmax(0,42%)_1fr] md:px-12 md:py-0">
        {/* 문구 (내용만 크로스페이드) */}
        <div key={`t-${active}`} className="order-2 text-center md:order-1 md:text-left" style={{ animation: "rz-textin 600ms ease both" }}>
          <p className="font-en text-[12px] font-semibold uppercase tracking-[0.24em]" style={{ color: subInk }}>
            Cream of Rice
          </p>
          <h2 className="mt-3 font-display text-[clamp(2.2rem,6vw,3.6rem)] font-semibold leading-[1.08] tracking-[-0.02em] [word-break:keep-all]" style={{ color: ink }}>
            {current.nameKo}
          </h2>
          {current.subtitle && (
            <p className="mx-auto mt-4 max-w-xs font-kr text-[15px] leading-[1.7] [word-break:keep-all] md:mx-0" style={{ color: subInk }}>
              {current.subtitle}
            </p>
          )}
        </div>

        {/* 제품 스테이지 — 모든 제품을 겹쳐두고 중앙/코너로 이동 */}
        <div className="relative order-1 h-[42svh] md:order-2 md:h-[64svh]">
          {slides.map((s, i) => {
            const isPeek = i === nextIdx(active) && count > 1;
            const img = s.heroImageUrl;
            return (
              <button
                key={s.id}
                type="button"
                aria-label={isPeek ? `다음 상품: ${s.nameKo}` : s.nameKo}
                tabIndex={isPeek ? 0 : -1}
                onClick={() => isPeek && setActive(i)}
                className="absolute inset-0 flex items-end justify-center focus:outline-none"
                style={{
                  ...stageStyle(i),
                  transformOrigin: "bottom right",
                  transition: "transform 850ms cubic-bezier(0.22,1,0.36,1), opacity 800ms ease",
                  cursor: isPeek ? "pointer" : "default",
                  pointerEvents: i === active || isPeek ? "auto" : "none",
                }}
              >
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={s.nameKo}
                    draggable={false}
                    className="max-h-full w-auto select-none object-contain drop-shadow-[0_34px_54px_rgba(0,0,0,0.32)]"
                    fetchPriority={i === 0 ? "high" : undefined}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* 가격 + CTA (내용만 크로스페이드) */}
        <div key={`p-${active}`} className="order-3 flex flex-col items-center gap-4 md:items-end" style={{ animation: "rz-textin 600ms ease both" }}>
          <div className="text-center md:text-right">
            <p className="font-numeric text-[clamp(1.8rem,4vw,2.4rem)] font-bold" style={{ color: ink }}>
              {current.effectivePrice.toLocaleString("ko-KR")}
              <span className="ml-1 font-kr text-base font-medium">원</span>
            </p>
            {current.soldOut && (
              <p className="mt-1 font-kr text-sm font-medium" style={{ color: subInk }}>
                곧 만나요
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/products/${current.slug}`}
              className="rounded-[3px] px-7 py-3.5 font-kr text-sm font-bold transition hover:opacity-90"
              style={{ backgroundColor: ink, color: bg }}
            >
              {current.soldOut ? "제품 보기" : "구매하기"}
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

      {/* 화살표 */}
      {count > 1 && (
        <>
          <button type="button" aria-label="이전 상품" onClick={() => setActive(prevIdx)}
            className="absolute left-4 top-1/2 z-30 hidden -translate-y-1/2 rounded-full p-2 transition hover:bg-black/10 md:block" style={{ color: ink }}>
            <Arrow dir="left" />
          </button>
          <button type="button" aria-label="다음 상품" onClick={() => setActive(nextIdx)}
            className="absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 rounded-full p-2 transition hover:bg-black/10 md:block" style={{ color: ink }}>
            <Arrow dir="right" />
          </button>
        </>
      )}

      {/* 도트 */}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center gap-2.5">
          {slides.map((s, i) => (
            <button key={s.id} type="button" aria-label={`${i + 1}번째 상품으로`} aria-current={i === active}
              onClick={() => setActive(i)} className="h-2 rounded-full transition-all"
              style={{ width: i === active ? 24 : 8, backgroundColor: i === active ? ink : light ? "rgba(34,30,28,0.35)" : "rgba(250,247,241,0.45)" }} />
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
