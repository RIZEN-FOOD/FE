"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Container, SectionTag } from "@/components/ui";
import { BowlPlaceholder } from "@/components/hero/layers/BowlPlaceholder";

gsap.registerPlugin(ScrollTrigger);

/**
 * "이렇게 즐겨보세요" 갤러리.
 *
 * 그릇 하나가 화면에 고정된 채, 스크롤에 따라 그 위에 올라간 재료 사진만
 * 바뀐다. 배경은 전체가 한 가지 톤으로 통일돼 있다 — 카드가 여러 개
 * 따로 떠 있는 느낌이 아니라, 하나의 그릇을 계속 들여다보는 느낌을 준다.
 *
 * ★ 지금은 실제 요리 사진이 없다. 그릇 도형 위에 재료 누끼를 얹어
 *   자리를 채워뒀다. 실제 조리 사진이 오면 idea.imageSrc 에 경로만
 *   넣으면 그 레이어가 통째로 사진으로 바뀐다.
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
  toppings: string[]; // ingredients.ts 의 sprite 파일명 (확장자 제외)
  /** 조리 시간 안내. 조리 편의를 보여주는 사실 정보다. */
  cookTime: string;
  imageSrc?: string; // 실제 사진이 오면 여기에 경로. 있으면 도형 대신 이 사진을 쓴다.
};

const ideas: ServingIdea[] = [
  {
    id: "classic",
    eyebrow: "The Classic",
    title: "기본으로,\n깔끔하게",
    body: "물이나 우유에 풀어 그대로 드세요. 가장 빠르고 담백한 방법입니다.",
    cookTime: "조리 2분",
    toppings: [],
  },
  {
    id: "blueberry",
    eyebrow: "Add Fruit",
    title: "블루베리를\n더해서",
    body: "새콤한 블루베리 한 줌을 올리면 산뜻한 맛이 더해집니다.",
    cookTime: "조리 3분",
    toppings: ["blueberry"],
  },
  {
    id: "nuts",
    eyebrow: "Add Crunch",
    title: "견과류와\n함께",
    body: "아몬드와 호두를 곁들이면 씹는 식감이 더해집니다.",
    cookTime: "조리 3분",
    toppings: ["almond", "walnut"],
  },
  {
    id: "banana",
    eyebrow: "Add Fruit",
    title: "바나나를\n슬라이스해서",
    body: "바나나 슬라이스를 올려 부드러운 단맛을 더할 수 있습니다.",
    cookTime: "조리 4분",
    toppings: ["banana"],
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
 * 그릇 위에 재료가 담긴 시각 영역.
 * 실사진이 있으면 그 사진을, 없으면 도형 위에 토핑 누끼를 얹어 자리를 채운다.
 * 배경은 항상 같은 톤(clay-soft/30)으로 통일한다 — 어떤 재료로 바뀌어도
 * 카드가 아니라 하나의 그릇을 계속 보는 느낌을 유지하기 위해서다.
 */
function ToppingBowl({ idea, className }: { idea: ServingIdea; className?: string }) {
  if (idea.imageSrc) {
    return (
      <div className={`overflow-hidden rounded-[4px] bg-clay-soft/30 ${className ?? ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={idea.imageSrc} alt={idea.title.replace("\n", " ")} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-[4px] bg-clay-soft/30 ${className ?? ""}`}>
      <div className="absolute inset-0 flex items-center justify-center p-10">
        <BowlPlaceholder className="h-auto w-full max-w-[280px] drop-shadow-[0_20px_34px_rgba(90,60,40,0.22)]" />
      </div>

      {idea.toppings.map((kind, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={kind}
          src={`/assets/ingredients/${kind}.png`}
          alt=""
          aria-hidden="true"
          className="absolute drop-shadow-[0_4px_8px_rgba(40,30,20,0.3)]"
          style={{
            width: "22%",
            left: `${42 + i * 16}%`,
            top: `${46 + (i % 2) * 8}%`,
            transform: `translate(-50%, -50%) rotate(${i % 2 === 0 ? -10 : 12}deg)`,
          }}
        />
      ))}
    </div>
  );
}
