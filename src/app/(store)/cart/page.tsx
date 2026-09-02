import type { Metadata } from "next";

import { Container } from "@/components/ui";
import { CartContent } from "@/components/cart/CartContent";

export const metadata: Metadata = {
  title: "장바구니",
  // 개인 장바구니는 검색에 노출하지 않는다.
  robots: { index: false, follow: false },
};

/**
 * 장바구니 페이지.
 *
 * 장바구니는 사람마다 다르고 쿠키로 식별되므로 서버에서 미리 그릴 수 없다.
 * 껍데기만 서버가 내고, 실제 내용은 클라이언트가 API 로 받아 그린다.
 * 헤더·푸터는 (store) 레이아웃이 제공한다.
 */
export default function CartPage() {
  return (
    <Container className="py-12 md:py-16">
      <h1 className="font-kr text-2xl font-bold tracking-tight text-ink md:text-3xl">장바구니</h1>
      <CartContent />
    </Container>
  );
}
