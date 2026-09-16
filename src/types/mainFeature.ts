/** 메인 FEATURES(메인 화면 특징 칸) 타입. 서버 응답 그대로다. */

export type MainFeaturePublic = {
  id: number;
  title: string;
  body: string;
  /** 관리자가 올린 사진. 없으면 null — 코드에 박힌 기본 사진은 쓰지 않는다. */
  imageUrl: string | null;
  altText: string;
  /** 본문이 비어 있을 때 영양성분 수치로 문장을 만들지 여부 */
  useNutritionBody: boolean;
};

export type MainFeatureAdmin = {
  id: number;
  title: string;
  body: string;
  imageKey: string | null;
  imageUrl: string | null;
  altText: string | null;
  autoNutritionBody: boolean;
  sortOrder: number;
  visible: boolean;
};
