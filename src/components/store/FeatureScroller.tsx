"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Container, SectionTag } from "@/components/ui";

gsap.registerPlugin(ScrollTrigger);

export type FeatureItem = {
  no: string;
  title: string;
  body: string;
  /** 없으면 같은 톤의 빈 칸으로 그린다 */
  imageSrc: string | null;
  alt: string;
};

/**
 * 특징 4가지 — 스크롤 연출. (문구·사진은 FeatureCards 가 서버에서 정해 넘긴다)
 *
 * 데스크톱 — 관리자가 등록한 사진이 화면 전체 배경으로 깔린 채 고정되고,
 *   스크롤이 내려갈 때마다 배경 사진이 크로스페이드되며 문구가 바뀐다 (2026-09-18 요청).
 *   지나간 문구는 위에 옅게 남아 몇 번째를 보고 있는지 알 수 있다.
 * 모바일 — 고정 연출 대신 네모 카드 4장(글 + 정사각형 사진). 스크롤을 붙잡지 않는다 (기획서 §3.1).
 * 모션 최소화 — 크로스페이드 없이 즉시 전환된다. 스크롤은 브라우저 기본 동작 그대로다.
 *
 * ★ 사진 위에 흰 글씨를 얹으므로 어두운 그라데이션을 깔아 대비를 확보한다(WCAG AA).
 */
export function FeatureScroller({ items }: { items: FeatureItem[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // 데스크톱에서만 배경 고정 전환을 켠다. 모바일은 정적 카드로 충분하다.
      mm.add("(min-width: 768px)", () => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const blocks = gsap.utils.toArray<HTMLElement>("[data-feature-block]", root);
        const layers = gsap.utils.toArray<HTMLElement>("[data-feature-layer]", root);

        const triggers = blocks.map((block, i) =>
          ScrollTrigger.create({
            trigger: block,
            start: "top 50%",
            end: "bottom 50%",
            onToggle: (self) => {
              if (!self.isActive) return;
              setActive(i);
              layers.forEach((layer, li) => {
                const target = li === i ? 1 : 0;
                if (reduced) {
                  gsap.set(layer, { opacity: target });
                } else {
                  gsap.to(layer, { opacity: target, duration: 0.6, ease: "power2.out" });
                }
              });
            },
          }),
        );

        return () => triggers.forEach((t) => t.kill());
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} aria-labelledby="features-heading" className="bg-cream-warm">
      {/* ── 모바일: 네모 카드 4장 (글 + 정사각형 사진) ── */}
      <div className="py-24 md:hidden">
        <Container>
          <SectionTag>Features</SectionTag>
          <h2 id="features-heading" className="font-display text-[2rem] font-semibold tracking-[-0.01em] text-ink">
            RIZEN 쌀가루는 뭐가 다른가요?
          </h2>

          <ul className="mt-10 flex flex-col gap-4">
            {items.map((f) => (
              <li
                key={f.no}
                className="grid grid-cols-[1fr_7rem] items-center gap-4 rounded-[4px] border border-line bg-paper p-5 shadow-[0_6px_24px_-12px_rgba(34,30,28,0.18)] sm:grid-cols-[1fr_9rem]"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-7 min-w-7 place-items-center rounded-[3px] bg-ink px-1.5 font-numeric text-xs font-medium text-cream-warm">
                      {f.no}
                    </span>
                    <h3 className="font-kr text-base font-bold text-ink">{f.title}</h3>
                  </div>
                  <p className="mt-2.5 font-kr text-[13px] leading-relaxed text-ink-soft">{f.body}</p>
                </div>
                <Photo item={f} className="aspect-square w-full rounded-[4px]" sizes="144px" />
              </li>
            ))}
          </ul>
        </Container>
      </div>

      {/* ── 데스크톱: 배경 사진 고정 + 스크롤 따라 전환 ── */}
      <div className="relative hidden md:block">
        {/* 고정되는 화면 */}
        <div className="sticky top-0 h-svh overflow-hidden bg-ink">
          {/* 배경 사진들 — 활성 한 장만 보인다 */}
          {items.map((f, i) => (
            <div key={f.no} data-feature-layer className="absolute inset-0" style={{ opacity: i === 0 ? 1 : 0 }}>
              <Photo item={f} className="h-full w-full" sizes="100vw" priority={i === 0} />
            </div>
          ))}

          {/* 글씨 대비용 그라데이션 (왼쪽·아래를 어둡게) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-ink/10"
          />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/70 to-transparent" />

          {/* 문구 */}
          <Container className="relative flex h-full flex-col justify-center">
            <div className="max-w-xl">
              <SectionTag tone="onDark">Features</SectionTag>
              <h2
                id="features-heading"
                className="font-display text-[clamp(1.9rem,3vw,2.75rem)] font-semibold tracking-[-0.01em] text-cream-warm"
              >
                RIZEN 쌀가루는 뭐가 다른가요?
              </h2>

              <ol className="mt-10 flex flex-col">
                {items.map((f, i) => {
                  const isActive = i === active;
                  return (
                    <li
                      key={f.no}
                      className={`border-t border-cream-warm/20 py-5 transition-opacity duration-500 last:border-b ${
                        isActive ? "opacity-100" : "opacity-45"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`grid h-7 min-w-7 place-items-center rounded-[3px] px-1.5 font-numeric text-xs font-medium transition-colors duration-500 ${
                            isActive ? "bg-cream-warm text-ink" : "bg-cream-warm/25 text-cream-warm"
                          }`}
                        >
                          {f.no}
                        </span>
                        <h3
                          className={`font-kr font-bold leading-tight tracking-[-0.02em] text-cream-warm transition-all duration-500 ${
                            isActive ? "text-[clamp(1.5rem,2.4vw,2rem)]" : "text-[clamp(1.1rem,1.6vw,1.35rem)]"
                          }`}
                        >
                          {f.title}
                        </h3>
                      </div>
                      {/* 활성 항목만 본문을 편다. 높이 전환이라 레이아웃이 튀지 않는다. */}
                      <div
                        className={`grid transition-all duration-500 ${
                          isActive ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <p className="overflow-hidden font-kr text-[15px] leading-relaxed text-cream-warm/85">
                          {f.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </Container>
        </div>

        {/* 스크롤 구간 — 고정 화면 위에 겹쳐 두고, 각 칸이 지나갈 때 위 문구·배경이 바뀐다 */}
        <div className="relative -mt-[100svh]" aria-hidden="true">
          {items.map((f) => (
            <div key={f.no} data-feature-block className="h-svh" />
          ))}
        </div>
      </div>
    </section>
  );
}

/** 사진 한 장. 배경 톤을 통일해(clay-soft/30) 사진이 바뀌어도 한 자리를 계속 보는 느낌을 준다. */
function Photo({
  item,
  className,
  sizes = "(min-width: 768px) 40vw, 100vw",
  priority = false,
}: {
  item: FeatureItem;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden bg-clay-soft/30 ${className ?? ""}`}>
      {item.imageSrc && (
        <Image
          src={item.imageSrc}
          alt={item.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      )}
    </div>
  );
}
