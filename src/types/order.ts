/** 주문 타입. 백엔드 OrderDtos 와 맞춘다. */

export type OrderItemView = {
  productId: number | null;
  slug: string | null;
  name: string;
  optionName: string | null;
  thumbnailUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineAmount: number;
};

export type OrderStatus =
  | "PENDING" | "PAID" | "PREPARING" | "SHIPPED"
  | "DELIVERED" | "CANCELLED" | "REFUNDED";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "결제 대기",
  PAID: "결제 완료",
  PREPARING: "상품 준비중",
  SHIPPED: "배송중",
  DELIVERED: "배송 완료",
  CANCELLED: "취소됨",
  REFUNDED: "환불됨",
};

export type OrderView = {
  orderNo: string;
  status: OrderStatus;
  ordererName: string;
  ordererPhoneMasked: string | null;
  ordererEmail: string | null;
  receiverName: string;
  receiverPhoneMasked: string | null;
  zipcode: string;
  addr1: string;
  addr2: string | null;
  deliveryMemo: string | null;
  itemsAmount: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  orderedAt: string;
  paidAt: string | null;
  items: OrderItemView[];
};

export type CreateOrderRequest = {
  ordererName: string;
  ordererPhone: string;
  ordererEmail?: string;
  receiverName: string;
  receiverPhone: string;
  zipcode: string;
  addr1: string;
  addr2?: string;
  deliveryMemo?: string;
};

export type OrderSummary = {
  orderNo: string;
  status: OrderStatus;
  title: string;
  itemCount: number;
  totalAmount: number;
  thumbnailUrl: string | null;
  orderedAt: string;
};

export type OrderSummaryPage = {
  items: OrderSummary[];
  page: number;
  totalPages: number;
  totalCount: number;
};

/* ── 취소·반품·교환 ── */
export type ClaimType = "CANCEL" | "RETURN" | "EXCHANGE";
export type ClaimStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED";

export const CLAIM_TYPE_LABEL: Record<ClaimType, string> = {
  CANCEL: "주문 취소",
  RETURN: "반품",
  EXCHANGE: "교환",
};

export const CLAIM_STATUS_LABEL: Record<ClaimStatus, string> = {
  REQUESTED: "접수됨",
  APPROVED: "승인",
  REJECTED: "반려",
  COMPLETED: "처리 완료",
};

/** 사유 코드. 종류별로 고를 수 있는 사유를 나눈다. */
export const CLAIM_REASONS: Record<ClaimType, { code: string; label: string }[]> = {
  CANCEL: [
    { code: "CHANGE_MIND", label: "단순 변심" },
    { code: "WRONG_ORDER", label: "잘못 주문함" },
    { code: "DELIVERY_DELAY", label: "배송이 너무 늦어짐" },
    { code: "ETC", label: "기타" },
  ],
  RETURN: [
    { code: "CHANGE_MIND", label: "단순 변심" },
    { code: "DEFECT", label: "상품 불량·파손" },
    { code: "WRONG_DELIVERY", label: "오배송" },
    { code: "ETC", label: "기타" },
  ],
  EXCHANGE: [
    { code: "DEFECT", label: "상품 불량·파손" },
    { code: "WRONG_DELIVERY", label: "오배송" },
    { code: "ETC", label: "기타" },
  ],
};

export type ClaimView = {
  id: number;
  orderNo: string;
  type: ClaimType;
  reasonCode: string;
  reasonText: string | null;
  status: ClaimStatus;
  refundAmount: number | null;
  adminMemo: string | null;
  requestedAt: string;
  processedAt: string | null;
};
