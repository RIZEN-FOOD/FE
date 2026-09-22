import type { Metadata } from "next";

import { Container } from "@/components/ui";
import { GuestOrderLookup } from "@/components/order/GuestOrderLookup";

export const metadata: Metadata = {
  title: "주문 조회",
  description: "주문번호와 받는 분 연락처로 주문 내역을 확인하실 수 있습니다.",
  robots: { index: false, follow: false },
};

/**
 * 비회원 주문 조회.
 *
 * 비회원은 결제 후 받은 링크를 잃으면 주문을 볼 방법이 없었다. 여기서 직접 찾는다.
 * 검색엔진에는 올리지 않는다 — 주문 조회 화면이 검색에 잡힐 이유가 없다.
 */
export default function OrderLookupPage() {
  return (
    <Container className="py-12 md:py-16">
      <h1 className="font-display text-title font-bold tracking-[-0.01em] text-ink">
        주문 조회
      </h1>
      <GuestOrderLookup />
    </Container>
  );
}
