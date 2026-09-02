/**
 * 장바구니 타입. 백엔드 CartDtos 와 1:1 로 맞춘다.
 *
 * 금액·재고는 전부 서버가 계산해 내려준다. 프론트는 그대로 보여주기만 한다
 * (프론트에서 금액을 다시 계산하지 않는다 — 서버 값이 진실이다).
 */

export type CartItemView = {
  id: number;
  productId: number;
  slug: string;
  name: string;
  optionId: number | null;
  optionName: string | null;
  thumbnailUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineAmount: number;
  /** 결제 대상 여부. false 면 품절·판매중지 등으로 합계에서 빠진다. */
  available: boolean;
  availableStock: number;
  /** available 이 false 일 때 사유 문구. */
  reason: string | null;
};

export type CartView = {
  items: CartItemView[];
  totalQuantity: number;
  itemsAmount: number;
  shippingFee: number;
  /** 무료배송 임계액. null 이면 무료배송 정책 없음. */
  freeShippingThreshold: number | null;
  /** 무료배송까지 남은 금액. 0 이면 이미 무료이거나 임계액 없음. */
  freeShippingRemaining: number;
  totalAmount: number;
  hasUnavailable: boolean;
};
