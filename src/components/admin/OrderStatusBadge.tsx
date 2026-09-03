import { cn } from "@/lib/cn";
import { ORDER_STATUS_LABEL } from "@/types/order";

/** 주문 상태 배지. 관리자 목록·상세가 공유한다. */
export function OrderStatusBadge({ status }: { status: string }) {
  const tone =
    status === "PAID" || status === "PREPARING"
      ? "bg-berry/10 text-berry"
      : status === "SHIPPED" || status === "DELIVERED"
        ? "bg-ink text-cream-warm"
        : status === "CANCELLED" || status === "REFUNDED"
          ? "bg-line text-ink-soft"
          : "bg-clay-soft/50 text-clay-deep";
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 font-kr text-[11px] font-medium", tone)}>
      {ORDER_STATUS_LABEL[status as keyof typeof ORDER_STATUS_LABEL] ?? status}
    </span>
  );
}
