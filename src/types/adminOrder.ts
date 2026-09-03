import type { OrderItemView, OrderStatus } from "@/types/order";

export const ADMIN_ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "결제 대기" },
  { value: "PAID", label: "결제 완료" },
  { value: "PREPARING", label: "상품 준비중" },
  { value: "SHIPPED", label: "배송중" },
  { value: "DELIVERED", label: "배송 완료" },
  { value: "CANCELLED", label: "취소됨" },
  { value: "REFUNDED", label: "환불됨" },
];

export type AdminOrderSummary = {
  orderNo: string;
  status: OrderStatus;
  ordererName: string;
  itemCount: number;
  title: string;
  totalAmount: number;
  paymentStatus: string | null;
  orderedAt: string;
  paidAt: string | null;
};

export type AdminOrderPage = {
  items: AdminOrderSummary[];
  page: number;
  totalPages: number;
  totalCount: number;
};

export type AdminOrderDetail = {
  orderNo: string;
  status: OrderStatus;
  ordererName: string;
  ordererPhone: string | null;
  ordererEmail: string | null;
  receiverName: string;
  receiverPhone: string | null;
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
  payment: {
    status: string;
    provider: string;
    method: string | null;
    amount: number;
    approvedAt: string | null;
  } | null;
  delivery: {
    status: string;
    carrier: string | null;
    trackingNo: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
  } | null;
};
