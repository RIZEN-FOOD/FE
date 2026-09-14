import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";

import { Container, SectionTag } from "@/components/ui";
import type { Nutrition } from "@/types/product";

/**
 * "RIZEN 쌀가루는 뭐가 다른가요?" — 특징 카드 4장. (기존 "이렇게 즐겨보세요" 자리)
 *
 * ★ 카피 규제 검토 완료 (식품표시광고법, CLAUDE.md 규칙 1). 2026-09-14 승인.
 *   스마트스토어 FEATURES 원문의 '무첨가·자연 그대로·소화·흡수·에너지 충전' 표현은
 *   전부 원재료·맛·탄수화물 보충 사실로 바꿨다.
 *
 * ★ 3번 카드의 수치는 대표 상품의 DB 영양성분에서 온다 (코드에 박지 않는다).
 *   값이 없으면 수치 문장을 빼고 보여준다 — 숫자를 지어내지 않는다.
 *
 * 사진: public/assets/features/feature-{1..4}.jpg 에 넣으면 바로 나온다.
 *   파일이 없으면 같은 톤의 빈 칸으로 둔다 (4번은 기존 조리 사진을 쓴다).
 */
type Feature = { no: string; title: string; body: string; images: string[]; alt: string };

function fmt(v: number) {
  return v.toLocaleString("ko-KR");
}

/** 탄수화물 보충 문장. 필요한 값이 하나라도 없으면 수치 없이 쓴다. */
function carbBody(n: Nutrition | null): string {
  const tail = "운동 전후 탄수화물 보충용으로 드시기 좋습니다.";
  if (!n || n.servingSizeG == null || n.carbG == null || n.kcal == null) return tail;
  return `1회 제공량 ${fmt(n.servingSizeG)}g에 탄수화물 ${fmt(n.carbG)}g, ${fmt(n.kcal)}kcal가 들어 있습니다. ${tail}`;
}

/** 후보 경로 중 실제로 있는 첫 파일. 없으면 null (빈 칸으로 그린다). */
function firstExisting(candidates: string[]): string | null {
  return candidates.find((src) => existsSync(join(process.cwd(), "public", src))) ?? null;
}

export function FeatureCards({ nutrition }: { nutrition: Nutrition | null }) {
  const features: Feature[] = [
    {
      no: "01",
      title: "국산 멥쌀 한 가지",
      body: "국산 멥쌀만으로 만들었습니다. 원재료명에 멥쌀 한 줄뿐입니다.",
      images: ["/assets/features/feature-1.jpg"],
      alt: "국산 멥쌀",
    },
    {
      no: "02",
      title: "자극이 적은 담백한 맛",
      body: "고운 입자로 갈아, 조리하면 죽처럼 부드럽고 담백한 맛이 납니다.",
      images: ["/assets/features/feature-2.jpg"],
      alt: "곱게 간 쌀가루",
    },
    {
      no: "03",
      title: "운동 전후 탄수화물 보충",
      body: carbBody(nutrition),
      images: ["/assets/features/feature-3.jpg"],
      alt: "크림오브라이스 한 그릇",
    },
    {
      no: "04",
      title: "다양한 맞춤 레시피",
      body: "프로틴 파우더, 견과류, 과일 등을 조합해 기호에 맞춰 손쉽게 완성할 수 있습니다.",
      images: ["/assets/features/feature-4.jpg", "/assets/recipes/recipe-1.jpg"],
      alt: "과일과 견과를 올린 크림오브라이스",
    },
  ];

  return (
    <section className="bg-cream-warm py-24 md:py-32" aria-labelledby="features-heading">
      <Container>
        <div className="flex flex-col items-center text-center">
          <SectionTag>Features</SectionTag>
          <h2
            id="features-heading"
            className="font-display text-[2rem] font-semibold tracking-[-0.01em] text-ink md:text-4xl"
          >
            RIZEN 쌀가루는 뭐가 다른가요?
          </h2>
        </div>

        <ul className="mx-auto mt-14 grid max-w-5xl gap-5 lg:grid-cols-2">
          {features.map((f) => {
            const src = firstExisting(f.images);
            return (
              <li
                key={f.no}
                className="grid grid-cols-[1fr_7.5rem] items-center gap-5 rounded-[4px] border border-line bg-paper p-6 shadow-[0_6px_24px_-12px_rgba(34,30,28,0.18)] sm:grid-cols-[1fr_10rem] md:p-7"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 min-w-8 place-items-center rounded-[3px] bg-ink px-1.5 font-numeric text-sm font-medium text-cream-warm">
                      {f.no}
                    </span>
                    <h3 className="font-kr text-lg font-bold text-ink md:text-xl">{f.title}</h3>
                  </div>
                  <p className="mt-3 font-kr text-sm leading-relaxed text-ink-soft md:text-[15px]">{f.body}</p>
                </div>

                <div className="relative aspect-square w-full overflow-hidden rounded-[4px] bg-clay-soft/30">
                  {src && (
                    <Image src={src} alt={f.alt} fill sizes="160px" className="object-cover" />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
