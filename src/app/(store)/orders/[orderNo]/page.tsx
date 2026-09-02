import type { Metadata } from "next";
import { Suspense } from "react";

import { Container } from "@/components/ui";
import { OrderDetail } from "@/components/order/OrderDetail";

export const metadata: Metadata = {
  title: "주문 내역",
  robots: { index: false, follow: false },
};

/**
 * 주문 상세 / 완료 화면.
 *
 * 주문번호로 조회한다. 회원 주문은 소유자만, 비회원 주문은 추측 불가능한
 * 주문번호를 아는 사람만 볼 수 있다(서버가 소유권을 검사한다).
 * 내용은 클라이언트가 API 로 받아 그린다.
 */
export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderNo: string }>;
}) {
  const { orderNo } = await params;
  return (
    <Container className="py-12 md:py-16">
      <Suspense fallback={<p className="font-kr text-sm text-ink-soft">불러오는 중…</p>}>
        <OrderDetail orderNo={orderNo} />
      </Suspense>
    </Container>
  );
}
