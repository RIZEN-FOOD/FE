import { existsSync } from "node:fs";
import { join } from "node:path";

import { FeatureScroller, type FeatureItem } from "@/components/store/FeatureScroller";
import type { Nutrition } from "@/types/product";

/**
 * "RIZEN 쌀가루는 뭐가 다른가요?" — 특징 4가지. (기존 "이렇게 즐겨보세요" 자리)
 *
 * 서버에서 문구·사진 경로를 정리하고, 화면과 스크롤 모션은 FeatureScroller(클라이언트)가 그린다.
 *
 * ★ 카피 규제 검토 완료 (식품표시광고법, CLAUDE.md 규칙 1). 2026-09-14 승인.
 *   스마트스토어 FEATURES 원문의 '무첨가·자연 그대로·소화·흡수·에너지 충전' 표현은
 *   전부 원재료·맛·탄수화물 보충 사실로 바꿨다.
 *
 * ★ 3번 수치는 대표 상품의 DB 영양성분에서 온다 (코드에 박지 않는다).
 *   값이 없으면 수치 문장을 빼고 보여준다 — 숫자를 지어내지 않는다.
 *
 * 사진: public/assets/features/feature-{1..4}.jpg 를 넣으면 그 사진이 나온다.
 *   없으면 기존 조리·히어로 사진으로 대신한다 (빈 칸끼리 전환되면 모션이 밋밋해진다).
 */
function fmt(v: number) {
  return v.toLocaleString("ko-KR");
}

/** 탄수화물 보충 문장. 필요한 값이 하나라도 없으면 수치 없이 쓴다. */
function carbBody(n: Nutrition | null): string {
  const tail = "운동 전후 탄수화물 보충용으로 드시기 좋습니다.";
  if (!n || n.servingSizeG == null || n.carbG == null || n.kcal == null) return tail;
  return `1회 제공량 ${fmt(n.servingSizeG)}g에 탄수화물 ${fmt(n.carbG)}g, ${fmt(n.kcal)}kcal가 들어 있습니다. ${tail}`;
}

/** 후보 경로 중 실제로 있는 첫 파일. 하나도 없으면 null (빈 칸으로 그린다). */
function firstExisting(candidates: string[]): string | null {
  return candidates.find((src) => existsSync(join(process.cwd(), "public", src))) ?? null;
}

export function FeatureCards({ nutrition }: { nutrition: Nutrition | null }) {
  const items: FeatureItem[] = [
    {
      no: "01",
      title: "국산 멥쌀 한 가지",
      body: "국산 멥쌀만으로 만들었습니다. 원재료명에 멥쌀 한 줄뿐입니다.",
      imageSrc: firstExisting(["/assets/features/feature-1.jpg", "/assets/recipes/recipe-2.jpg"]),
      alt: "국산 멥쌀로 만든 크림오브라이스 한 그릇",
    },
    {
      no: "02",
      title: "자극이 적은 담백한 맛",
      body: "고운 입자로 갈아, 조리하면 죽처럼 부드럽고 담백한 맛이 납니다.",
      imageSrc: firstExisting(["/assets/features/feature-2.jpg", "/assets/recipes/recipe-3.jpg"]),
      alt: "부드럽게 조리한 크림오브라이스",
    },
    {
      no: "03",
      title: "운동 전후 탄수화물 보충",
      body: carbBody(nutrition),
      imageSrc: firstExisting(["/assets/features/feature-3.jpg", "/assets/hero/hero-a.jpg"]),
      alt: "크림오브라이스 한 그릇과 제품 패키지",
    },
    {
      no: "04",
      title: "다양한 맞춤 레시피",
      body: "프로틴 파우더, 견과류, 과일 등을 조합해 기호에 맞춰 손쉽게 완성할 수 있습니다.",
      imageSrc: firstExisting(["/assets/features/feature-4.jpg", "/assets/recipes/recipe-1.jpg"]),
      alt: "과일과 견과를 올린 크림오브라이스",
    },
  ];

  return <FeatureScroller items={items} />;
}
