import type { Metadata } from "next";
import { Suspense } from "react";

import { Container } from "@/components/ui";
import { CheckoutComplete } from "@/components/checkout/CheckoutComplete";

export const metadata: Metadata = {
  title: "결제 확인",
  robots: { index: false, follow: false },
};

/** 결제 확인(모바일 결제창 복귀 지점). 헤더·푸터는 (store) 템플릿이 그린다. */
export default function CheckoutCompletePage() {
  return (
    <Container>
      <Suspense
        fallback={
          <p className="py-24 text-center font-kr text-sm text-ink-soft">결제를 확인하는 중입니다…</p>
        }
      >
        <CheckoutComplete />
      </Suspense>
    </Container>
  );
}
