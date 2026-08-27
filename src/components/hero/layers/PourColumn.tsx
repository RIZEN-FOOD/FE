"use client";

import { useEffect, useRef } from "react";

import { drawIngredient } from "./drawIngredient";
import { ingredients, type IngredientKind } from "./ingredients";

/**
 * 화면 중앙을 관통하는 낙하 줄기.
 *
 * 이 레이어가 히어로 전체를 꿰는 축이다.
 * 제품에서 쏟아진 가루 · 물줄기 · 재료가 하나의 기둥으로 흘러
 * 아래의 그릇으로 떨어진다.
 *
 * ★ 여기에 영상은 필요 없다.
 *   고체(가루·베리·견과)는 재료별 누끼 정지컷 1~3장이면 코드가 떨어뜨린다.
 *   물줄기만 정지컷으로 흉내가 안 나는데, 그래서 절차적으로 그린다.
 *   실제 촬영 루프가 확보되면 이 물줄기 부분만 영상으로 교체한다.
 *
 * 상태는 전부 data 속성으로 받는다. 캔버스는 GSAP 트윈 대상이 아니라서
 * 타임라인이 숫자를 써넣고 이쪽이 매 프레임 읽는 구조다.
 *
 *   data-intensity  0~1  줄기 전체 세기
 *   data-water      0~1  물줄기 굵기·불투명도
 *   data-solids     0~1  베리·견과가 섞이는 정도
 *   data-pour-y     0~1  줄기가 시작되는 높이 (제품 주둥이 위치)
 *   data-catch-y    0~1  줄기가 끝나는 높이 (1이면 화면 밖까지 떨어진다)
 */
type Grain = {
  kind: IngredientKind;
  /** 기둥 중심에서의 좌우 편차 (-1 ~ 1) */
  offset: number;
  /** 진행도 0~1. pourY 에서 catchY 사이를 흐른다 */
  t: number;
  speed: number;
  radius: number;
  angle: number;
  spin: number;
  /** 깊이. 클수록 앞에 있고 크고 빠르다 */
  z: number;
  solid: boolean;
};

const num = (el: HTMLElement, key: string, fallback: number) => {
  const raw = el.dataset[key];
  const v = raw === undefined ? NaN : Number(raw);
  return Number.isFinite(v) ? v : fallback;
};

export function PourColumn({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // 기둥을 채울 알갱이들. 고체(재료)와 가루를 나눠 담는다.
    const grains: Grain[] = [];
    for (const def of ingredients) {
      const solid = def.kind !== "powder";
      const n = Math.ceil((isMobile ? def.count / 2 : def.count) * (solid ? 1 : 2.4));
      for (let i = 0; i < n; i++) {
        const z = 0.35 + Math.random() * 0.65;
        grains.push({
          kind: def.kind,
          // 가루는 중심에 몰리고 재료는 더 넓게 튄다
          offset: (Math.random() * 2 - 1) * (solid ? 1 : 0.55),
          t: Math.random(),
          speed: (0.16 + Math.random() * 0.16) * def.speed * z,
          radius: def.radius * z * (solid ? 1 : 1.1),
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.05,
          z,
          solid,
        });
      }
    }
    // 멀리 있는 것부터 그려야 가까운 것이 위에 온다
    grains.sort((a, b) => a.z - b.z);

    let raf = 0;
    let running = true;
    let clock = 0;

    /** 기둥의 중심 x. 아래로 갈수록 아주 살짝 흔들려 물줄기처럼 보인다. */
    const columnX = (yNorm: number) =>
      width / 2 + Math.sin(yNorm * 6 + clock * 0.9) * width * 0.006;

    /** 기둥 반폭. 위는 좁고 아래로 갈수록 조금 벌어진다. */
    const columnHalf = (yNorm: number) => {
      const base = Math.min(width, height) * (isMobile ? 0.075 : 0.055);
      return base * (0.55 + yNorm * 0.85);
    };

    const drawWater = (water: number, pourY: number, catchY: number) => {
      if (water <= 0.01) return;
      const top = pourY * height;
      const bottom = catchY * height;
      if (bottom <= top) return;

      const steps = 26;
      const left: [number, number][] = [];
      const right: [number, number][] = [];

      for (let i = 0; i <= steps; i++) {
        const p = i / steps;
        const y = top + (bottom - top) * p;
        const yNorm = y / height;
        const cx = columnX(yNorm);
        // 물줄기는 알갱이 기둥보다 가늘다. 위쪽이 가장 가늘고 아래로 벌어진다.
        const w =
          columnHalf(yNorm) * 0.42 * water * (0.5 + p * 0.7) +
          Math.sin(p * 14 + clock * 2.4) * width * 0.0025;
        left.push([cx - w, y]);
        right.push([cx + w, y]);
      }

      const grad = ctx.createLinearGradient(0, top, 0, bottom);
      grad.addColorStop(0, `rgba(255,255,255,${0.5 * water})`);
      grad.addColorStop(0.45, `rgba(246,241,232,${0.36 * water})`);
      grad.addColorStop(1, `rgba(232,217,196,${0.1 * water})`);

      ctx.beginPath();
      ctx.moveTo(left[0][0], left[0][1]);
      for (const [x, y] of left) ctx.lineTo(x, y);
      for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // 줄기 한가운데의 밝은 심지. 액체의 광택처럼 보인다.
      ctx.beginPath();
      ctx.moveTo(columnX(top / height), top);
      for (let i = 0; i <= steps; i++) {
        const p = i / steps;
        const y = top + (bottom - top) * p;
        ctx.lineTo(columnX(y / height), y);
      }
      ctx.strokeStyle = `rgba(255,255,255,${0.35 * water})`;
      ctx.lineWidth = Math.max(1, width * 0.0022 * water);
      ctx.stroke();
    };

    const draw = () => {
      clock += 0.016;
      ctx.clearRect(0, 0, width, height);

      const el = canvas;
      const intensity = num(el, "intensity", 0);
      const water = num(el, "water", 0) * intensity;
      const solids = num(el, "solids", 0) * intensity;
      const pourY = num(el, "pourY", 0.18);
      const catchY = num(el, "catchY", 1.1);

      if (intensity > 0.01) {
        drawWater(water, pourY, catchY);

        const span = Math.max(0.05, catchY - pourY);

        for (const g of grains) {
          // 고체는 solids 값이 올라와야 등장한다
          const amount = g.solid ? solids : intensity;
          if (amount <= 0.01) continue;

          g.t += (g.speed / span) * 0.016 * 3.2 * intensity;
          if (g.t > 1) g.t -= 1;
          g.angle += g.spin;

          const yNorm = pourY + g.t * span;
          if (yNorm > 1.05) continue;

          const y = yNorm * height;
          const half = columnHalf(yNorm);
          // 아래로 갈수록 옆으로 조금 더 퍼진다
          const x = columnX(yNorm) + g.offset * half * (0.5 + g.t * 0.8);

          // 시작과 끝에서 부드럽게 나타나고 사라진다.
          // 끝에서 사라지는 것이 그릇에 흡수되는 인상을 만든다.
          const fade = Math.min(1, g.t * 6) * Math.min(1, (1 - g.t) * 5);

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(g.angle);
          ctx.globalAlpha = (0.2 + g.z * 0.75) * amount * fade;
          drawIngredient(ctx, g.kind, g.radius);
          ctx.restore();
        }
      }

      if (running) raf = requestAnimationFrame(draw);
    };

    draw();

    // 화면 밖에서는 멈춘다. 안 그러면 계속 CPU 를 쓴다.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          draw();
        } else if (!entry.isIntersecting) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    window.addEventListener("resize", resize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-hero-column
      data-intensity="0"
      data-water="0"
      data-solids="0"
      data-pour-y="0.18"
      data-catch-y="1.1"
      className={className}
      aria-hidden="true"
    />
  );
}
