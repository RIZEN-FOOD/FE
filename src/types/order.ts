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
