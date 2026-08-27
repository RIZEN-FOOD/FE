"use client";

import { useEffect, useRef } from "react";

/**
 * 부유하는 쌀 입자. canvas 로 절차적으로 그리므로 이미지 자산이 필요 없다.
 *
 * 깊이감의 핵심은 입자마다 다른 z(깊이) 값이다.
 * 가까운 입자는 크고 빠르게, 먼 입자는 작고 느리게 움직여서 시차를 만든다.
 *
 * 성능을 위해:
 *  - 화면 밖에서는 애니메이션을 멈춘다 (IntersectionObserver)
 *  - 모션 최소화 설정이면 아예 그리지 않는다
 *  - 모바일은 입자 수를 줄인다
 */
export function RiceParticles({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 26 : 64;
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

    type Grain = {
      x: number;
      y: number;
      z: number;
      vy: number;
      angle: number;
      spin: number;
    };

    const grains: Grain[] = Array.from({ length: count }, () => {
      const z = 0.25 + Math.random() * 0.75;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        // 가까운 입자일수록 빠르게 떨어진다
        vy: (0.08 + Math.random() * 0.22) * z,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.008,
      };
    });

    let raf = 0;
    let running = true;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const g of grains) {
        g.y += g.vy;
        g.angle += g.spin;
        // 좌우로 아주 살짝 흔들린다
        g.x += Math.sin(g.y * 0.01) * 0.15 * g.z;

        if (g.y > height + 12) {
          g.y = -12;
          g.x = Math.random() * width;
        }

        const len = 5 * g.z;
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(g.angle);
        ctx.globalAlpha = 0.15 + g.z * 0.35;
        ctx.fillStyle = "#FFFDF9";
        ctx.beginPath();
        ctx.ellipse(0, 0, len, len * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (running) raf = requestAnimationFrame(draw);
    };

    draw();

    // 화면 밖으로 나가면 멈춘다. 안 그러면 계속 CPU 를 쓴다.
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

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
