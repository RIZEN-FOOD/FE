"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Container, SectionTag } from "@/components/ui";

gsap.registerPlugin(ScrollTrigger);

/**
 * "이렇게 즐겨보세요" 갤러리.
 *
 * 그릇 하나가 화면에 고정된 채, 스크롤에 따라 그 위에 올라간 재료 사진만
 * 바뀐다. 배경은 전체가 한 가지 톤으로 통일돼 있다 — 카드가 여러 개
 * 따로 떠 있는 느낌이 아니라, 하나의 그릇을 계속 들여다보는 느낌을 준다.
 *
 * ★ 실제 조리(서빙) 사진 몇 장을 얹어 "이렇게 즐길 수 있다"를 보여준다.
 *   사진은 public/assets/recipes 에 있고, 관리자가 늘리고 싶어지면 그때 DB 로 옮긴다.
 *
 * ★ 카피는 조리·계량·질감만 말한다. 효능·효과를 암시하지 않는다
 *   (식품표시광고법, CLAUDE.md 규칙 1).
 *
 * 데스크톱 — 왼쪽 시각 영역이 sticky 로 고정되고, 오른쪽 문구가
 *   스크롤되며 지나갈 때마다 왼쪽 사진이 크로스페이드로 바뀐다.
 * 모바일 — 고정 연출 대신 세로로 쌓인 카드 (스크러빙 금지 원칙, 기획서 §3.1).
 * 모션 최소화 — 애니메이션 없이 즉시 전환된다.
 *
 * 지금은 로컬 배열이다. 레시피가 많아지고 관리자가 직접 올리고 싶어지면
 * 그때 DB 테이블로 옮긴다 (스키마 변경은 승인 후 진행).
 */
type ServingIdea = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  /** 조리 시간 안내. 조리 편의를 보여주는 사실 정보다. */
  cookTime: string;
  imageSrc: string; // 서빙(조리) 사진 경로
};

const ideas: ServingIdea[] = [
  {
    id: "fruit",
    eyebrow: "Fruit Bowl",
    title: "과일을\n듬뿍 올려",
    body: "딸기·블루베리·바나나에 땅콩버터 한 스푼. 색도 맛도 다채로운 한 그릇이 됩니다.",
    cookTime: "조리 4분",
    imageSrc: "/assets/recipes/recipe-1.jpg",
  },
  {
    id: "nuts",
    eyebrow: "Nutty",
    title: "견과류와\n함께",
    body: "아몬드와 호두를 곁들이면 고소하고 씹는 식감이 살아납니다.",
    cookTime: "조리 3분",
    imageSrc: "/assets/recipes/recipe-2.jpg",
  },
  {
    id: "dessert",
    eyebrow: "Dessert Style",
    title: "컵에 담아\n디저트처럼",
    body: "작은 컵에 담고 견과를 올리면 가벼운 디저트처럼 즐길 수 있습니다.",
    cookTime: "조리 3분",
    imageSrc: "/assets/recipes/recipe-3.jpg",
  },
];

export function RecipeGallery() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // 데스크톱에서만 sticky 크로스페이드를 켠다. 모바일은 정적 카드로 충분하다.
      mm.add("(min-width: 768px)", () => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const blocks = gsap.utils.toArray<HTMLElement>("[data-recipe-block]", root);
        const layers = gsap.utils.toArray<HTMLElement>("[data-recipe-layer]", root);

        const triggers = blocks.map((block, i) =>
          ScrollTrigger.create({
            trigger: block,
            start: "top 60%",
            end: "bottom 40%",
            onToggle: (self) => {
              if (!self.isActive) return;
              block.classList.add("is-active");
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
            onLeaveBack: () => block.classList.remove("is-active"),
          }),
        );

        return () => triggers.forEach((t) => t.kill());
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="bg-cream-warm py-24 md:py-32" aria-labelledby="recipe-heading">
      <Container>
        <SectionTag>Ways to Enjoy</SectionTag>
        <h2 id="recipe-heading" className="font-display text-[2rem] font-semibold tracking-[-0.01em] text-ink md:text-4xl">
          이렇게 즐겨보세요
        </h2>
        <p className="mt-2 max-w-md font-kr text-sm text-ink-soft">
          곁들이는 재료에 따라 매번 다른 한 그릇이 됩니다.
        </p>

        {/* ── 모바일: 세로로 쌓인 카드 ── */}
        <div className="mt-12 flex flex-col gap-14 md:hidden">
          {ideas.map((idea) => (
            <div key={idea.id}>
              <ToppingBowl idea={idea} className="aspect-[4/5] w-full max-w-sm" />
              <div className="mt-6 flex items-center gap-3">
                <p className="font-en text-[11px] font-extrabold uppercase tracking-[0.24em] text-clay-deep">
                  {idea.eyebrow}
                </p>
                <span className="rounded-full bg-cream px-2.5 py-0.5 font-kr text-[11px] text-ink-soft">
                  {idea.cookTime}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-line font-display text-2xl font-semibold leading-[1.2] tracking-[-0.01em] text-ink">
                {idea.title}
              </p>
              <p className="mt-3 max-w-sm font-kr text-sm leading-relaxed text-ink-soft">{idea.body}</p>
            </div>
          ))}
        </div>

        {/* ── 데스크톱: 고정된 그릇 + 스크롤 따라 재료 전환 ── */}
        <div className="mt-16 hidden md:grid md:grid-cols-2 md:gap-16">
          <div className="sticky top-24 flex h-[70svh] items-center justify-center">
            <div className="relative aspect-[4/5] w-full max-w-md">
              {ideas.map((idea, i) => (
                <div
                  key={idea.id}
                  data-recipe-layer
                  className="absolute inset-0"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <ToppingBowl idea={idea} className="h-full w-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                data-recipe-block
                className="flex min-h-[70svh] flex-col justify-center"
              >
                <div className="flex items-center gap-3">
                  <p className="font-en text-[11px] font-extrabold uppercase tracking-[0.24em] text-clay-deep">
                    {idea.eyebrow}
                  </p>
                  <span className="rounded-full bg-cream px-2.5 py-0.5 font-kr text-[11px] text-ink-soft">
                    {idea.cookTime}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-line font-kr text-[clamp(1.8rem,3.2vw,2.6rem)] font-bold leading-[1.15] tracking-[-0.02em] text-ink">
                  {idea.title}
                </p>
                <p className="mt-4 max-w-sm font-kr text-sm leading-relaxed text-ink-soft">{idea.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * 서빙(조리) 사진 한 장. 배경 톤을 통일해(clay-soft/30) 사진이 바뀌어도
 * 카드가 여러 개 뜬 느낌이 아니라 한 자리를 계속 보는 느낌을 준다.
 */
function ToppingBowl({ idea, className }: { idea: ServingIdea; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[4px] bg-clay-soft/30 ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={idea.imageSrc}
        alt={`크림오브라이스 ${idea.title.replace("\n", " ")}`}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    </div>
  );
}
