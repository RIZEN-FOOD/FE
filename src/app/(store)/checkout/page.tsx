import type { Metadata } from "next";

import { Container } from "@/components/ui";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "주문서",
  robots: { index: false, follow: false },
};

/**
 * 주문서(체크아웃).
 *
 * 장바구니와 마찬가지로 사람마다 다르므로 내용은 클라이언트가 그린다.
 * 금액은 서버가 계산한 장바구니 값을 그대로 보여주고, 주문 확정도 서버가 다시 계산한다.
 */
export default function CheckoutPage() {
  return (
    <Container className="py-12 md:py-16">
      <h1 className="font-kr text-2xl font-bold tracking-tight text-ink md:text-3xl">주문서</h1>
      <CheckoutForm />
    </Container>
  );
}
