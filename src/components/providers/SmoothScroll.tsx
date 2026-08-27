"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * 관성 스크롤. 스크롤 자체의 질감이 고급스러움의 절반을 차지한다.
 *
 * Lenis 는 스크롤을 자기가 제어하므로 ScrollTrigger 에게 매 프레임 알려줘야 한다.
 * 안 그러면 스크롤 연동 애니메이션이 한 박자씩 밀린다.
 *
 * 모션 최소화 설정을 켠 사용자에게는 아예 켜지 않는다. 브라우저 기본 스크롤이 그대로 동작한다.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      // 끝으로 갈수록 부드럽게 감속
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // 터치 기기는 브라우저 기본 스크롤이 더 자연스럽다
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      // gsap ticker 는 초 단위, Lenis 는 밀리초 단위를 받는다
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  return null;
}
