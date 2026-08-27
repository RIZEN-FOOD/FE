/**
 * 히어로 챕터.
 *
 * 흐름: 제품 → 쏟아짐 → 물 → 재료 → 그릇 → 완성
 * 화면 중앙을 관통하는 낙하 줄기가 이 여섯 장면을 하나로 꿴다.
 * 설명은 줄기를 피해 좌우로 번갈아 놓는다.
 *
 * ★ 식품표시광고법 검토 완료 (기획서 §9 기준)
 *   전부 형태·질감·조리 방법·계량·용도만 말한다.
 *   효능·효과를 암시하는 표현("소화가 잘 되는", "다이어트에 좋은")은 위법이므로
 *   문구를 추가하거나 바꿀 때마다 같은 기준으로 검토해야 한다.
 */
export type ChapterSide = "center" | "left" | "right";

export type HeroChapter = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  /** 데스크톱에서 설명이 놓이는 위치. 줄기가 중앙이므로 좌우로 번갈아 둔다. */
  side: ChapterSide;
};

export const heroChapters: HeroChapter[] = [
  {
    id: "rice",
    eyebrow: "Rice, as it is",
    title: "쌀, 그대로",
    body: "곱게 도정한 쌀 100%. 그 외에 넣은 것이 없습니다.",
    side: "center",
  },
  {
    id: "pour",
    eyebrow: "Measure it out",
    title: "덜어 담습니다",
    body: "그램 단위로 계량할 수 있어 식단을 정확히 맞출 수 있습니다.",
    side: "left",
  },
  {
    id: "water",
    eyebrow: "Add water",
    title: "물을 붓습니다",
    body: "물이나 우유, 어느 쪽이든 됩니다. 따로 준비할 것이 없습니다.",
    side: "right",
  },
  {
    id: "add",
    eyebrow: "Make it yours",
    title: "원하는 것을 더합니다",
    body: "과일이나 견과를 곁들여 드세요. 취향대로 바꿔 드실 수 있습니다.",
    side: "left",
  },
  {
    id: "bowl",
    eyebrow: "In the bowl",
    title: "그릇에 담습니다",
    body: "덩어리 없이 곱게 퍼지는 질감. 곱게 도정한 형태라 가능합니다.",
    side: "right",
  },
  {
    id: "done",
    eyebrow: "Cream of Rice",
    title: "완성",
    body: "운동 후 탄수화물 보충. 자극이 적은 담백한 맛입니다.",
    side: "center",
  },
];
