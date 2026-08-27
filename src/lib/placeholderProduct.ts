/**
 * ⚠️ 임시 데이터.
 *
 * 상품은 전부 DB 에서 와야 한다 (CLAUDE.md 규칙 3).
 * 상품 API 가 생기면 이 파일을 지우고 서버에서 받아온 값으로 교체한다.
 * 프로토타입 단계에서 화면을 세우기 위해서만 존재한다.
 */
export const placeholderProduct = {
  slug: "cream-of-rice",
  nameKo: "크림오브라이스",
  /** 원 단위 정수 */
  price: 12900,
} as const;
