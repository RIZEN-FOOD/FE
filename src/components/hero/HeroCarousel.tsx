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

// 구성 장식 위치 — accentImageUrls 순서 [0:우상단, 1:우하단, 2:좌하단]
// 우상단은 높게, 하단 둘은 낮게 둬서 양옆 미리보기·구매 버튼과 겹치지 않게 한다.
const ACCENT_POS = [
  "right-[5%] top-[4%] w-[29%] md:right-[15%] md:top-[19%] md:w-[19%] rz-accent-a",
  "right-[4%] top-[46%] w-[27%] md:right-[15%] md:top-auto md:bottom-[13%] md:w-[17%] rz-accent-b",
  "left-[4%] top-[46%] w-[29%] md:left-[16%] md:top-auto md:bottom-[13%] md:w-[20%] rz-accent-a",
];

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

/** 기둥 사진의 위·아래 끝(각 12%)을 투명하게 녹이는 마스크 — 더 넓히면 제품 위아래로 보이는 기둥이 사라진다 */
const BACKDROP_FADE =
  "linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%)";

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const count = slides.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);

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
    startY.current = e.clientY;
    setPaused(true);
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!dragging.current) return;
    dragging.current = false;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    // 세로 우세 제스처(스크롤 의도)는 무시하고, 가로 스와이프만 전환으로 본다.
    if (Math.abs(dx) < Math.abs(dy)) { setPaused(false); return; }
    if (dx <= -SWIPE_THRESHOLD) setActive(nextIdx);
    else if (dx >= SWIPE_THRESHOLD) setActive(prevIdx);
    // 터치엔 mouseleave 가 없으니 스와이프 후 자동 전환을 다시 켠다.
    setPaused(false);
  }

  if (count === 0) return null;

  const current = slides[active];
  const bg = current.heroColor || DEFAULT_COLOR;
  const light = isLight(bg);
  const ink = light ? "#221E1C" : "#FAF7F1";
  const subInk = light ? "rgba(34,30,28,0.72)" : "rgba(250,247,241,0.82)";

  // active 기준 상대 위치(-…0…+, 순환)를 구한다.
  function offsetOf(i: number): number {
    let d = ((i - active) % count + count) % count;
    if (d > count / 2) d -= count;
    return d;
  }

  // 제품을 가로로 나열한다. 중앙이 활성, 다음/이전은 양옆에 살짝 걸친다.
  // 넘어가면 좌우로 슬라이드된다.
  function stageStyle(i: number): React.CSSProperties {
    const d = offsetOf(i);
    if (d === 0) return { transform: "translate(0,0) scale(1)", opacity: 1, zIndex: 20 };
    if (d === 1) return { transform: "translate(42%, 4%) scale(0.4)", opacity: 0.4, zIndex: 6 };
    if (d === -1) return { transform: "translate(-42%, 4%) scale(0.4)", opacity: 0.4, zIndex: 6 };
    // 더 먼 것들은 바깥에서 대기(숨김)
    return { transform: `translate(${d > 0 ? 70 : -70}%, 4%) scale(0.34)`, opacity: 0, zIndex: 4 };
  }

  return (
    <section
      className="relative min-h-svh w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label="대표 상품"
      style={{ backgroundColor: shade(bg, -0.1), touchAction: "pan-y" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        dragging.current = false;
        setPaused(false);
      }}
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
      {/* 구성 장식 — 고정 순서 [우상단, 우하단, 좌하단]. 없는 자리는 건너뛴다. */}
      {(current.accentImageUrls ?? []).map((url, ai) =>
        url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${active}-${ai}`}
            src={url}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={`pointer-events-none absolute z-[25] block select-none object-contain drop-shadow-[0_16px_30px_rgba(0,0,0,0.22)] ${ACCENT_POS[ai] ?? ""}`}
          />
        ) : null,
      )}

      {/* 콘텐츠: 문구(좌) · 제품 스테이지(중앙) · 가격(우) — 레이아웃 고정 */}
      <div className="relative z-10 mx-auto grid min-h-svh w-full max-w-wrap items-center gap-6 px-6 py-24 md:grid-cols-[1fr_minmax(0,42%)_1fr] md:px-12 md:py-0">
        {/* 문구 (내용만 크로스페이드) */}
        <div key={`t-${active}`} className="relative z-10 order-2 mt-8 text-center md:order-1 md:mt-0 md:text-left" style={{ animation: "rz-textin 600ms ease both" }}>
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

          {/* 모바일: 부제 아래 가운데에 맛별 문양 내비 (데스크톱은 CTA 아래에 따로 렌더) */}
          <FlavorNav
            slides={slides}
            active={active}
            onSelect={setActive}
            ink={ink}
            bg={bg}
            subInk={subInk}
            light={light}
            className="mt-6 flex justify-center md:hidden"
          />
        </div>

        {/* 제품 스테이지 — 제품들을 대각선으로 나열하고, 넘어가면 대각선을 따라 이동 */}
        <div className="relative z-0 order-1 h-[46svh] md:order-2 md:h-[70svh]">
          {/* 중앙 제품 뒤 세로 배경(스플래시)
              사진의 위·아래 끝이 직선으로 잘려 보이지 않게, 끝부분을 배경 속으로 서서히 사라지게 한다. */}
          {current.heroBackdropUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`bd-${active}`}
              src={current.heroBackdropUrl}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="pointer-events-none absolute left-1/2 top-1/2 z-[2] h-[120%] w-auto -translate-x-1/2 -translate-y-1/2 select-none object-contain opacity-80 md:h-[98%]"
              style={{
                animation: "rz-textin 800ms ease both",
                maskImage: BACKDROP_FADE,
                WebkitMaskImage: BACKDROP_FADE,
              }}
            />
          )}
          {slides.map((s, i) => {
            const d = offsetOf(i);
            const isPreview = d !== 0 && count > 1;
            const img = s.heroImageUrl;
            return (
              <button
                key={s.id}
                type="button"
                aria-label={isPreview ? `${s.nameKo} 보기` : s.nameKo}
                tabIndex={isPreview ? 0 : -1}
                onClick={() => isPreview && setActive(i)}
                className="absolute inset-0 flex items-center justify-center focus:outline-none"
                style={{
                  ...stageStyle(i),
                  transformOrigin: "center center",
                  transition: "transform 850ms cubic-bezier(0.22,1,0.36,1), opacity 800ms ease",
                  cursor: isPreview ? "pointer" : "default",
                  pointerEvents: d === 0 || isPreview ? "auto" : "none",
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
        <div key={`p-${active}`} className="relative z-10 order-3 flex flex-col items-center gap-4 md:items-end" style={{ animation: "rz-textin 600ms ease both" }}>
          <div className="text-center md:text-right">
            {current.soldOut ? (
              // 품절: 재고 0 또는 관리자가 품절 처리한 경우
              <>
                <span
                  className="inline-block rounded-full px-4 py-1.5 font-kr text-lg font-bold"
                  style={{ backgroundColor: ink, color: bg }}
                >
                  품절
                </span>
                {current.effectivePrice > 0 && (
                  <p className="mt-2 font-numeric text-lg font-semibold line-through" style={{ color: subInk }}>
                    {current.effectivePrice.toLocaleString("ko-KR")}원
                  </p>
                )}
              </>
            ) : current.effectivePrice > 0 ? (
              <p className="font-numeric text-[clamp(1.8rem,4vw,2.4rem)] font-bold" style={{ color: ink }}>
                {current.effectivePrice.toLocaleString("ko-KR")}
                <span className="ml-1 font-kr text-base font-medium">원</span>
              </p>
            ) : (
              // 가격을 아직 못 읽었거나(백엔드 미연결) 예정 제품
              <p className="font-kr text-lg font-semibold" style={{ color: ink }}>
                출시 예정
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {current.linkable ? (
              <Link
                href={`/products/${current.slug}`}
                className="rounded-full px-7 py-3.5 font-kr text-sm font-bold shadow-[0_8px_20px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:opacity-95"
                style={{ backgroundColor: ink, color: bg }}
              >
                {current.soldOut ? "제품 보기" : "구매하기"}
              </Link>
            ) : (
              // 출시 예정(비공개) 상품 — 상세가 없으므로 링크하지 않는다.
              <span
                aria-disabled="true"
                className="cursor-default rounded-full px-7 py-3.5 font-kr text-sm font-bold opacity-80"
                style={{ backgroundColor: ink, color: bg }}
              >
                출시 예정
              </span>
            )}
            <Link
              href="/products"
              className="rounded-full border px-7 py-3.5 font-kr text-sm font-medium shadow-[0_6px_16px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 hover:opacity-90"
              style={{ borderColor: light ? "rgba(34,30,28,0.4)" : "rgba(250,247,241,0.5)", color: ink }}
            >
              전체 상품
            </Link>
          </div>

          {/* 데스크톱: CTA 아래 우측에 맛별 문양 내비 */}
          <FlavorNav
            slides={slides}
            active={active}
            onSelect={setActive}
            ink={ink}
            bg={bg}
            subInk={subInk}
            light={light}
            className="mt-3 hidden md:flex"
          />
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

/** 맛별 문양 내비 — 클릭하면 해당 제품 슬라이드로 넘어간다. */
function FlavorNav({
  slides,
  active,
  onSelect,
  ink,
  bg,
  subInk,
  light,
  className,
}: {
  slides: HeroSlide[];
  active: number;
  onSelect: (i: number) => void;
  ink: string;
  bg: string;
  subInk: string;
  light: boolean;
  className?: string;
}) {
  if (slides.length <= 1) return null;
  return (
    <div className={`items-end gap-3 md:gap-4 ${className ?? "flex"}`}>
      {slides.map((s, i) => {
        const on = i === active;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`${s.nameKo} 보기`}
            aria-current={on}
            className="group flex flex-col items-center gap-1.5"
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 group-hover:-translate-y-0.5"
              style={{
                borderColor: on ? "transparent" : light ? "rgba(34,30,28,0.28)" : "rgba(250,247,241,0.4)",
                backgroundColor: on ? ink : "transparent",
                color: on ? bg : ink,
                boxShadow: on ? "0 8px 18px rgba(0,0,0,0.22)" : "none",
              }}
            >
              <FlavorIcon slug={s.slug} />
            </span>
            <span
              className="font-kr text-[11px] font-medium transition"
              style={{ color: on ? ink : subInk, opacity: on ? 1 : 0.75 }}
            >
              {shortFlavorName(s.nameKo)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** 슬러그로 맛 종류를 가려 짧은 이름을 만든다. "크림오브라이스" 접두는 뗀다. */
function shortFlavorName(nameKo: string): string {
  const s = nameKo.replace("크림오브라이스", "").trim();
  return s.length > 0 ? s : "플레인";
}

/** 맛별 문양 아이콘 — 쌀 / 초콜릿 / 땅콩. 슬러그로 고른다. */
function FlavorIcon({ slug }: { slug: string }) {
  if (slug.includes("choco")) {
    // 초콜릿 바
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
        <rect x="5" y="4.5" width="14" height="15" rx="1.8" />
        <line x1="12" y1="4.5" x2="12" y2="19.5" />
        <line x1="5" y1="9.5" x2="19" y2="9.5" />
        <line x1="5" y1="14.5" x2="19" y2="14.5" />
      </svg>
    );
  }
  if (slug.includes("peanut")) {
    // 땅콩(껍질) 실루엣
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M7.6 4.6C5.2 4.6 3.3 6.6 3.3 9c0 1.6.8 2.7 1.6 3.5-.8.8-1.6 2-1.6 3.6 0 2.4 1.9 4.4 4.3 4.4 1.9 0 3.5-1.2 4.1-3 .6 1.8 2.2 3 4.1 3 2.4 0 4.3-2 4.3-4.4 0-1.6-.8-2.8-1.6-3.6.8-.8 1.6-1.9 1.6-3.5 0-2.4-1.9-4.4-4.3-4.4-1.9 0-3.5 1.2-4.1 3-.6-1.8-2.2-3-4.1-3Z" />
      </svg>
    );
  }
  // 쌀 알갱이 3개
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <ellipse cx="8.5" cy="9" rx="1.9" ry="3.3" transform="rotate(-25 8.5 9)" />
      <ellipse cx="15" cy="8.6" rx="1.9" ry="3.3" transform="rotate(22 15 8.6)" />
      <ellipse cx="11.7" cy="15" rx="1.9" ry="3.3" transform="rotate(-6 11.7 15)" />
    </svg>
  );
}
