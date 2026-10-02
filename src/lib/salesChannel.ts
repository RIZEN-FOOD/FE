/**
 * 주문이 들어온 판매 경로 (2026-10-02).
 *
 * 자사몰(MALL) 주문은 표시하지 않는다 — 거의 모든 주문이 자사몰이라 붙이면 소음이 된다.
 * 네이버페이 주문형·카카오 톡체크아웃처럼 바깥에서 들어온 주문만 표시해, 관리자가 송장·취소·반품을
 * 그 서비스 규칙대로 처리해야 한다는 걸 바로 알게 한다.
 */
export type SalesChannel = "MALL" | "NAVERPAY" | "KAKAO_CHECKOUT";

const LABELS: Record<Exclude<SalesChannel, "MALL">, string> = {
  NAVERPAY: "네이버페이",
  KAKAO_CHECKOUT: "톡체크아웃",
};

/** 표시할 이름. 자사몰이거나 모르는 값이면 null. */
export function salesChannelLabel(channel: string | null | undefined): string | null {
  if (!channel || channel === "MALL") return null;
  return LABELS[channel as keyof typeof LABELS] ?? null;
}
