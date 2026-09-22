/** 할인코드. 관리자 화면과 결제 화면이 함께 쓴다. */

export type DiscountType = "PERCENT" | "AMOUNT";

export type CouponAdminItem = {
  id: number;
  name: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount: number | null;
  minOrderAmount: number;
  totalQuantity: number | null;
  usedCount: number;
  perMemberLimit: number;
  startAt: string;
  endAt: string;
  visible: boolean;
  /** 서버가 계산해 주는 상태 한마디: 사용 중 · 시작 전 · 끝남 · 소진 · 꺼짐 */
  state: string;
  /** 이 코드로 만들어진 주문 수 (취소·환불 제외) */
  orderCount: number;
  /** 그 주문들의 결제 금액 합 */
  salesAmount: number;
  /** 그 주문들에서 깎아준 금액 합 */
  discountTotal: number;
};

export type CouponSaveRequest = {
  name: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount: number | null;
  minOrderAmount: number;
  totalQuantity: number | null;
  perMemberLimit: number;
  startAt: string;
  endAt: string;
  visible: boolean;
};
