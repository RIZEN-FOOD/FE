"use client";

import { useEffect, useRef } from "react";
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
 * 데스크톱 — 왼쪽 사진이 sticky 로 고정되고, 오른쪽 문구가 스크롤되며
 *   지나갈 때마다 왼쪽 사진이 크로스페이드로 바뀐다. (예전 "이렇게 즐겨보세요" 모션)
 * 모바일 — 고정 연출 대신 네모 카드 4장(글 + 정사각형 사진) (스크러빙 금지 원칙, 기획서 §3.1).
 * 모션 최소화 — 애니메이션 없이 즉시 전환된다.
 */
export function FeatureScroller({ items }: { items: FeatureItem[] }) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // 데스크톱에서만 sticky 크로스페이드를 켠다. 모바일은 정적 카드로 충분하다.
      mm.add("(min-width: 768px)", () => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const blocks = gsap.utils.toArray<HTMLElement>("[data-feature-block]", root);
        const layers = gsap.utils.toArray<HTMLElement>("[data-feature-layer]", root);

        const triggers = blocks.map((block, i) =>
          ScrollTrigger.create({
            trigger: block,
            start: "top 60%",
            end: "bottom 40%",
            onToggle: (self) => {
              if (!self.isActive) return;
              blocks.forEach((b) => b.classList.toggle("is-active", b === block));
              layers.forEach((layer, li) => {
                const target = li === i ? 1 : 0;
                // 모션 최소화 설정이면 애니메이션 없이 바로 전환한다.
                if (reduced) {
                  gsap.set(layer, { opacity: target });
                } else {
                  gsap.to(layer, { opacity: target, duration: 0.5, ease: "power2.out" });
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
    <section ref={rootRef} className="bg-cream-warm py-24 md:py-32" aria-labelledby="features-heading">
      <Container>
        <SectionTag>Features</SectionTag>
        <h2
          id="features-heading"
          className="font-display text-[2rem] font-semibold tracking-[-0.01em] text-ink md:text-4xl"
        >
          RIZEN 쌀가루는 뭐가 다른가요?
        </h2>

        {/* ── 모바일: 네모 카드 4장 (글 + 정사각형 사진) ── */}
        <ul className="mt-10 flex flex-col gap-4 md:hidden">
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
              <Photo item={f} className="aspect-square w-full" sizes="144px" />
            </li>
          ))}
        </ul>

        {/* ── 데스크톱: 고정된 사진 + 스크롤 따라 전환 ── */}
        <div className="mt-16 hidden md:grid md:grid-cols-2 md:gap-16">
          <div className="sticky top-24 flex h-[70svh] items-center justify-center">
            <div className="relative aspect-[4/5] w-full max-w-md">
              {items.map((f, i) => (
                <div
                  key={f.no}
                  data-feature-layer
                  className="absolute inset-0"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <Photo item={f} className="h-full w-full" />
                </div>
              ))}
            </div>
          </div>

          <ol className="flex flex-col">
            {items.map((f) => (
              <li key={f.no} data-feature-block className="flex min-h-[70svh] flex-col justify-center">
                <Heading item={f} />
                <p className="mt-4 max-w-sm font-kr text-[15px] leading-relaxed text-ink-soft">{f.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

/** 데스크톱 문구 블록의 번호 배지 + 큰 제목 */
function Heading({ item }: { item: FeatureItem }) {
  return (
    <div>
      <span className="inline-grid h-8 min-w-8 place-items-center rounded-[3px] bg-ink px-1.5 font-numeric text-sm font-medium text-cream-warm">
        {item.no}
      </span>
      <h3 className="mt-4 font-kr text-[clamp(1.8rem,3.2vw,2.6rem)] font-bold leading-[1.15] tracking-[-0.02em] text-ink">
        {item.title}
      </h3>
    </div>
  );
}

/** 사진 한 장. 배경 톤을 통일해(clay-soft/30) 사진이 바뀌어도 한 자리를 계속 보는 느낌을 준다. */
function Photo({
  item,
  className,
  sizes = "(min-width: 768px) 40vw, 100vw",
}: {
  item: FeatureItem;
  className?: string;
  sizes?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[4px] bg-clay-soft/30 ${className ?? ""}`}>
      {item.imageSrc && (
        <Image
          src={item.imageSrc}
          alt={item.alt}
          fill
          sizes={sizes}
          className="object-cover"
        />
      )}
    </div>
  );
}
