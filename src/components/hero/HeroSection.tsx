"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Container } from "@/components/ui";
import { heroChapters, type ChapterSide } from "./heroChapters";
import { Backdrop } from "./layers/Backdrop";
import { BowlPlaceholder } from "./layers/BowlPlaceholder";
import { FinishedBowlPlaceholder } from "./layers/FinishedBowlPlaceholder";
import { PourColumn } from "./layers/PourColumn";
import { ProductPlaceholder } from "./layers/ProductPlaceholder";
import { RiceParticles } from "./layers/RiceParticles";

gsap.registerPlugin(ScrollTrigger);

/**
 * 한 페이지 히어로.
 *
 * 흐름
 *   1 제품 정면          줄기 없음
 *   2 쏟아짐             제품이 기울고 가루가 흐르기 시작한다
 *   3 물                 물줄기가 굵어진다
 *   4 재료               베리·견과가 줄기에 섞인다
 *   5 그릇               줄기가 그릇에서 끊긴다 (담기는 인상)
 *   6 완성               줄기가 멎고 완성컷이 남는다
 *
 * 화면 중앙을 관통하는 낙하 줄기(PourColumn)가 이 여섯 장면을 하나로 꿴다.
 * 줄기가 중앙을 차지하므로 설명은 좌우로 번갈아 놓는다.
 *
 * 고정은 CSS sticky 가 한다. GSAP pin 을 쓰지 않는 이유는
 * JS 가 실패하거나 로드되기 전에도 첫 화면이 정상으로 보이게 하기 위해서다.
 *
 * 분기
 *   데스크톱 — 스크롤 진행률에 줄기와 오브젝트를 연동한다 (scrub)
 *   모바일   — 스크러빙을 쓰지 않는다 (기획서 §3.1 제약).
 *              줄기는 잔잔하게 흐르고 챕터는 페이드로만 넘어간다.
 *   모션 최소화 — 아무것도 움직이지 않고 최종 상태로 즉시 보인다.
 */
const sideClass: Record<ChapterSide, string> = {
  center: "md:mx-auto md:text-center",
  left: "md:mr-auto",
  right: "md:ml-auto",
};

/**
 * 가운데 정렬 챕터는 카피를 화면 아래에 붙인다.
 * 그 장면들(제품 정면 · 완성컷)은 오브젝트가 화면 중앙을 차지하므로
 * 카피까지 세로 가운데에 두면 정면으로 겹친다.
 */
const verticalClass: Record<ChapterSide, string> = {
  center: "md:justify-end md:pb-[9vh]",
  left: "md:justify-center md:pb-0",
  right: "md:justify-center md:pb-0",
};

export function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // matchMedia 에 root 를 넘겨 선택자를 이 섹션 안으로 한정한다.
    const mm = gsap.matchMedia(root);
    const column = root.querySelector<HTMLElement>("[data-hero-column]");

    /** 캔버스는 GSAP 트윈 대상이 아니라서 숫자를 담은 객체를 트윈하고 값만 넘긴다. */
    const flow = { intensity: 0, water: 0, solids: 0, pourY: 0.3, catchY: 1.1 };
    const syncFlow = () => {
      if (!column) return;
      column.dataset.intensity = String(flow.intensity);
      column.dataset.water = String(flow.water);
      column.dataset.solids = String(flow.solids);
      column.dataset.pourY = String(flow.pourY);
      column.dataset.catchY = String(flow.catchY);
    };

    // ── 첫 진입 연출. 스크롤과 무관하게 한 번만 재생한다 ──
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from("[data-hero-product]", {
        opacity: 0,
        scale: 0.92,
        yPercent: 5,
        duration: 1.1,
        ease: "power2.out",
      });
    });

    // ── 챕터 전환. 모든 환경에서 동일하게 동작하는 가벼운 페이드 ──
    const chapterTriggers = gsap.utils
      .toArray<HTMLElement>(root.querySelectorAll("[data-chapter]"))
      .map((chapter) =>
        ScrollTrigger.create({
          trigger: chapter,
          start: "top 65%",
          end: "bottom 35%",
          onToggle: (self) => chapter.classList.toggle("is-active", self.isActive),
        }),
      );

    // ── 데스크톱 전용 스크롤 연동 ──
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 1 },
      });

      // 제품: 기울어 쏟다가, 그릇이 나오면 위로 물러난다
      tl.to("[data-hero-product]", { rotate: -22, yPercent: -6, scale: 0.9, duration: 1, ease: "power2.inOut" }, 1)
        .to("[data-hero-product]", { rotate: -26, scale: 0.78, yPercent: -12, duration: 2, ease: "none" }, 2)
        .to("[data-hero-product]", { opacity: 0, yPercent: -26, scale: 0.6, duration: 0.9, ease: "power2.in" }, 4.4);

      // 줄기: 가루 → 물 → 재료 순으로 두꺼워진다
      tl.to(flow, { intensity: 1, duration: 0.8, ease: "power2.out", onUpdate: syncFlow }, 1)
        .to(flow, { water: 1, duration: 1, ease: "power1.inOut", onUpdate: syncFlow }, 2)
        .to(flow, { solids: 1, duration: 1, ease: "power1.out", onUpdate: syncFlow }, 3)
        // 그릇이 올라오면 줄기가 그 테두리에서 끊긴다. 담기는 인상을 만드는 지점이다.
        .to(flow, { catchY: 0.68, duration: 1, ease: "power2.inOut", onUpdate: syncFlow }, 4)
        .to(flow, { intensity: 0, water: 0, solids: 0, duration: 0.8, ease: "power2.in", onUpdate: syncFlow }, 5);

      // 그릇: 5번째 장면에서 아래에서 올라온다
      tl.fromTo(
        "[data-hero-bowl]",
        { opacity: 0, yPercent: 40, scale: 0.86 },
        { opacity: 1, yPercent: 0, scale: 1, duration: 1, ease: "power2.out" },
        3.9,
      ).to("[data-hero-bowl]", { opacity: 0, yPercent: -14, duration: 0.7, ease: "power2.in" }, 5.1);

      // 완성컷: 마지막에 남는다
      tl.fromTo(
        "[data-hero-finished]",
        { opacity: 0, scale: 0.9, yPercent: 12 },
        { opacity: 1, scale: 1, yPercent: 0, duration: 1, ease: "power2.out" },
        5,
      );

      // 조명이 장면을 따라 내려온다. 광원이 실재하는 인상을 만든다.
      tl.to("[data-hero-glow]", { yPercent: 30, scale: 1.3, duration: 6, ease: "none" }, 0);

      tl.fromTo("[data-hero-progress]", { scaleX: 0 }, { scaleX: 1, duration: 6, ease: "none" }, 0);
    });

    // 모바일은 스크러빙을 쓰지 않으므로 줄기를 고정 세기로 흘린다.
    mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
      flow.intensity = 0.85;
      flow.water = 0.7;
      flow.solids = 0.8;
      flow.pourY = 0.26;
      flow.catchY = 1.1;
      syncFlow();
    });

    // ── 마우스를 따라 제품이 살짝 기운다 (포인터가 있는 데스크톱만) ──
    mm.add(
      "(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        const inner = root.querySelector<HTMLElement>("[data-hero-product-inner]");
        if (!inner) return;
        const xTo = gsap.quickTo(inner, "rotateY", { duration: 0.7, ease: "power3" });
        const yTo = gsap.quickTo(inner, "rotateX", { duration: 0.7, ease: "power3" });
        const onMove = (e: PointerEvent) => {
          xTo((e.clientX / window.innerWidth - 0.5) * 12);
          yTo(-(e.clientY / window.innerHeight - 0.5) * 8);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      },
    );

    return () => {
      chapterTriggers.forEach((t) => t.kill());
      mm.revert();
    };
  }, []);

  return (
    <section ref={rootRef} className="relative" aria-labelledby="hero-heading">
      {/* 스크린리더와 검색엔진을 위한 대표 제목. 화면에는 보이지 않는다. */}
      <h1 id="hero-heading" className="sr-only">
        크림오브라이스 — 곱게 도정한 쌀로 만든 탄수화물 보충 식품
      </h1>

      {/* ── 고정 무대 ── */}
      <div className="sticky top-0 h-svh overflow-hidden">
        <Backdrop />

        {/* 배경에 떠다니는 쌀 입자. 줄기와 별개로 공간의 깊이를 만든다. */}
        <RiceParticles className="absolute inset-0 h-full w-full opacity-50" />

        {/* ★ 화면 중앙을 관통하는 낙하 줄기. 여섯 장면을 꿰는 축이다. */}
        <PourColumn className="absolute inset-0 h-full w-full" />

        {/*
          오브젝트는 정렬용 transform 을 쓰지 않는다.
          GSAP 가 transform 을 소유하면서 CSS translate 를 none 으로 덮어쓰기 때문에,
          정렬을 transform 으로 하면 화면 크기가 바뀌는 순간 풀린다.
          정렬은 flex 래퍼가 맡고 안쪽 요소는 GSAP 에게 통째로 넘긴다.
        */}
        <div className="pointer-events-none absolute inset-x-0 top-[7%] flex justify-center" aria-hidden="true">
          <div
            data-hero-product
            className="h-[34vmin] w-[26vmin] origin-bottom"
            style={{ perspective: "1200px" }}
          >
            <div data-hero-product-inner className="h-full w-full [transform-style:preserve-3d]">
              <ProductPlaceholder className="h-full w-full drop-shadow-[0_22px_38px_rgba(90,60,40,0.34)]" />
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-[10%] flex justify-center" aria-hidden="true">
          <div data-hero-bowl className="h-[20vmin] w-[36vmin] opacity-0">
            <BowlPlaceholder className="h-full w-full" />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <div data-hero-finished className="h-[38vmin] w-[52vmin] opacity-0">
            <FinishedBowlPlaceholder className="h-full w-full drop-shadow-[0_26px_44px_rgba(90,60,40,0.3)]" />
          </div>
        </div>

        {/* 진행 막대 — 얼마나 남았는지 보여준다 */}
        <div className="absolute inset-x-0 bottom-0 hidden h-0.5 bg-ink/10 md:block">
          <div data-hero-progress className="h-full origin-left scale-x-0 bg-ink/45" aria-hidden="true" />
        </div>
      </div>

      {/* ── 챕터 ── 무대 위를 지나간다 ── */}
      <ol className="relative z-10 -mt-[100svh]">
        {heroChapters.map((chapter, index) => (
          <li
            key={chapter.id}
            data-chapter
            className={`hero-chapter flex h-svh flex-col justify-end pb-[12vh] ${verticalClass[chapter.side]}`}
          >
            <Container>
              {/*
                줄기가 화면 중앙을 차지하므로 설명은 좌우로 비켜 놓는다.
                폭을 34% 아래로 묶어 어떤 화면에서도 줄기와 겹치지 않게 한다.
              */}
              <div className={`hero-chapter__box md:max-w-[34%] ${sideClass[chapter.side]}`}>
                <p className="font-en text-[10.5px] font-extrabold uppercase tracking-[0.24em] text-ink/50">
                  {String(index + 1).padStart(2, "0")} — {chapter.eyebrow}
                </p>
                <p className="mt-[1.5vh] font-kr font-bold leading-[1.02] tracking-[-0.03em] text-ink text-[clamp(2.25rem,5.2vw,4.5rem)]">
                  {chapter.title}
                </p>
                <p className="mt-[2vh] font-kr leading-relaxed text-ink/70 text-[clamp(0.95rem,1.15vw,1.1rem)]">
                  {chapter.body}
                </p>
              </div>
            </Container>
          </li>
        ))}
      </ol>
    </section>
  );
}
