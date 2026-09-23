"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * 화면에 들어올 때 한 번 떠오르는 등장 효과.
 *
 * ★ 스크롤 이벤트를 듣지 않는다. IntersectionObserver 라 스크롤마다 다시 그리지 않는다.
 * ★ 움직이는 값은 transform 과 opacity 뿐이다. 레이아웃을 건드리지 않는다.
 * ★ 모션 최소화 설정이면 애니메이션 없이 바로 보인다(globals.css 가 duration 을 0 으로 만든다).
 * ★ 한 번 보이면 끝. 다시 숨기지 않는다 — 스크롤을 올렸다 내릴 때 깜빡이는 것을 막는다.
 * ★ 서버 HTML 에서는 «보이는 상태»로 나간다 (2026-09-23). 전에는 opacity 0 으로 내려가서
 *   JS 가 못 뜨면 영양성분 같은 법정 표시까지 안 보였다. 지금은 브라우저가 마운트한 뒤,
 *   그 순간 화면 밖에 있는 요소만 숨겼다가 들어올 때 띄운다. 첫 화면에 이미 보이는 것은
 *   건드리지 않는다 — 보이는 걸 숨겼다 다시 보여줄 이유가 없다.
 *
 * 쓰는 곳: 섹션 머리와 카드 묶음처럼 "여기서 새 이야기가 시작된다"는 신호가 필요한 자리.
 * 모든 요소에 걸지 마라. 움직임은 위계를 만들 때만 의미가 있다.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** 줄지어 나타날 때 순서를 주는 지연(ms). 60~90ms 간격이 자연스럽다. */
  delay?: number;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  // 서버와 첫 그리기에서는 보인다. 숨기는 건 브라우저가 판단한 뒤다.
  const [shown, setShown] = useState(true);

  // 첫 페인트 전에 결정해야 «보였다 사라졌다 다시 뜨는» 깜빡임이 없다 → useLayoutEffect.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // 오래된 브라우저면 그냥 보이는 채로 둔다.
    if (typeof IntersectionObserver === "undefined") return;
    // 이미 화면 안에 있으면(첫 화면) 손대지 않는다. 관찰할 것도 없다.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.88 && r.bottom > 0) return;

    setShown(false);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(20px)",
        transition: `opacity var(--dur-slow) var(--ease-out) ${delay}ms, transform var(--dur-slow) var(--ease-out) ${delay}ms`,
        willChange: shown ? "auto" : "transform, opacity",
      }}
    >
      {children}
    </Tag>
  );
}
