/**
 * 낙하 재료 정의.
 *
 * ★ 실사진이 오면 여기에 sprite 경로만 채우면 된다.
 *   그리기 로직은 sprite 가 있으면 이미지를, 없으면 아래 도형을 쓴다.
 *   즉 재료 낙하 연출에 영상은 필요 없다. 재료별 누끼 정지컷 1~3장이면 된다.
 *
 *   액체(물 붓기, 젓기, 크림이 흐르는 질감)만 영상이 필요하다.
 *   정지컷으로는 흉내가 안 난다.
 */
export type IngredientKind = "blueberry" | "almond" | "walnut" | "banana" | "rice" | "powder";

export type Ingredient = {
  kind: IngredientKind;
  /** 동시에 떠 있는 개수 (데스크톱 기준. 모바일은 절반으로 줄인다) */
  count: number;
  /** 기본 반지름(px). 실제 크기는 여기에 깊이 계수가 곱해진다 */
  radius: number;
  /** 낙하 속도 계수 */
  speed: number;
  /**
   * 누끼 이미지 경로. 채우면 도형 대신 이 이미지를 그린다.
   * 예: "/assets/ingredients/blueberry-01.png"
   */
  sprite?: string;
};

export const ingredients: Ingredient[] = [
  { kind: "blueberry", count: 7, radius: 15, speed: 1.0, sprite: "/assets/ingredients/blueberry.png" },
  { kind: "almond", count: 5, radius: 13, speed: 0.9, sprite: "/assets/ingredients/almond.png" },
  { kind: "walnut", count: 3, radius: 16, speed: 0.85, sprite: "/assets/ingredients/walnut.png" },
  { kind: "banana", count: 4, radius: 17, speed: 0.8, sprite: "/assets/ingredients/banana.png" },
  // 또렷한 쌀알. 누끼 이미지로 떨어진다. 제품의 정체(쌀)를 보여주는 핵심 재료라 개수를 넉넉히 둔다.
  { kind: "rice", count: 12, radius: 8, speed: 1.05, sprite: "/assets/ingredients/rice.png" },
  // 미세 가루는 이미지 없이 도형으로 흩날린다 (작고 많아 이미지가 오히려 무겁다)
  { kind: "powder", count: 22, radius: 4, speed: 1.25 },
];
