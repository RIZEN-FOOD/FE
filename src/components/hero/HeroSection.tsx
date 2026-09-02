"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Container } from "@/components/ui";
import { Backdrop } from "./layers/Backdrop";
import { BowlScene } from "./BowlScene";
import { FinishedBowlPlaceholder } from "./layers/FinishedBowlPlaceholder";

gsap.registerPlugin(ScrollTrigger);

/**
 * 히어로 바로 아래로 이어지는 스크롤 씬.
 *
 *   씬1 — 그릇에 재료가 담긴 정적·입체 장면 (흐르지 않는다)
 *   씬2 — 완성된 한 그릇
 *
 * 제품 배너 구도는 HeroSplit 으로 분리했다 — 레퍼런스와 같은 좌우 2단이다.
 *
 * 계속 흐르는 연출을 쓰지 않는다. 각 씬은 스크롤로 넘어가고,
 * 진입할 때 요소가 한 번 자리잡는 정도의 등장만 준다.
 *
 * 완성컷은 실사진이 오면 교체할 자리다. 재료는 실제 누끼 이미지다.
 *
 * JS 없이도 문구가 DOM 에 존재한다 (SEO). 모션 최소화 설정을 존중한다.
 */
export function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 각 씬의 요소가 스크롤 진입 시 한 번 등장한다.
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 40,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} aria-label="크림오브라이스 활용 장면">
      {/* ── 씬1 — 그릇에 담긴 재료 ── */}
      <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-cream-warm py-24">
        <Container className="relative z-10 text-center">
          <p data-reveal className="font-en text-[11px] font-extrabold uppercase tracking-[0.24em] text-clay-deep">
            Make it yours
          </p>
          <p data-reveal className="mt-3 font-kr text-[clamp(2rem,4.5vw,3.4rem)] font-bold leading-tight tracking-[-0.02em] text-ink">
            원하는 것을 더해
          </p>
          <p data-reveal className="mx-auto mt-4 max-w-md font-kr text-[clamp(0.95rem,1.3vw,1.1rem)] leading-relaxed text-ink/70">
            과일이나 견과를 곁들여 드세요. 취향대로 바꿔 드실 수 있습니다.
          </p>
          <BowlScene className="mt-10" />
        </Container>
      </div>

      {/* ── 씬2 — 완성 ── */}
      <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden py-24">
        <Backdrop />
        <Container className="relative z-10 flex flex-col items-center text-center">
          <div data-reveal className="w-[min(70vmin,520px)]">
            <FinishedBowlPlaceholder className="h-full w-full drop-shadow-[0_26px_44px_rgba(90,60,40,0.3)]" />
          </div>
          <p data-reveal className="mt-8 font-en text-[11px] font-extrabold uppercase tracking-[0.24em] text-clay-deep">
            Cream of Rice
          </p>
          <p data-reveal className="mt-3 font-kr text-[clamp(2.2rem,5vw,3.8rem)] font-bold leading-tight tracking-[-0.02em] text-ink">
            완성
          </p>
          <p data-reveal className="mt-4 max-w-md font-kr text-[clamp(0.95rem,1.3vw,1.1rem)] leading-relaxed text-ink/70">
            자극이 적은 담백한 맛. 90초면 준비됩니다.
          </p>
        </Container>
      </div>
    </section>
  );
}
