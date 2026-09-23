/**
 * 배송비 정책 (공개값). `/api/shipping-policy` 가 내려준다.
 *
 * ★ 이 숫자들을 화면에 적어두지 마라. 대표가 관리자에서 바꾸는 값이다
 *   (CLAUDE.md 규칙 5 — 배송비 임계액은 shipping_policy 에서 읽는다).
 */
export type ShippingPolicy = {
  /** 기본 배송비 */
  baseFee?: number;
  /** 이 금액 이상이면 무료. 없으면(null) 항상 기본 배송비 */
  freeThreshold?: number | null;
  /** 제주·도서산간 추가분. 무료배송 금액을 넘어도 따로 받는다 */
  islandExtraFee?: number;
};
