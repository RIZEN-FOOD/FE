import type { Metadata } from "next";

import { Container } from "@/components/ui";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import type { DirectItem } from "@/types/order";

export const metadata: Metadata = {
  title: "주문서",
  robots: { index: false, follow: false },
};

/**
 * 주문서(체크아웃).
 *
 * 장바구니와 마찬가지로 사람마다 다르므로 내용은 클라이언트가 그린다.
 * 금액은 서버가 계산한 값을 그대로 보여주고, 주문 확정도 서버가 다시 계산한다.
 *
 * 두 갈래로 들어온다.
 *   /checkout                          장바구니 주문
 *   /checkout?product=1&qty=2[&option] 상품 페이지 «바로 구매» — 그 상품·수량만. 장바구니는 건드리지 않는다
 * 주소의 숫자는 «무엇을 몇 개»뿐이다. 가격은 주소에 없고, 서버가 상품 테이블에서 읽는다.
 */
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const direct = parseDirect(sp);

  return (
    <Container className="py-12 md:py-16">
      <h1 className="font-kr text-title font-bold text-ink">주문서</h1>
      <CheckoutForm direct={direct} />
    </Container>
  );
}

/** 주소의 product·qty·option 을 읽는다. 하나라도 이상하면 장바구니 주문으로 본다. */
function parseDirect(sp: Record<string, string | string[] | undefined>): DirectItem | null {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const productId = Number(one(sp.product));
  const quantity = Number(one(sp.qty) ?? "1");
  const optionRaw = one(sp.option);
  if (!Number.isInteger(productId) || productId <= 0) return null;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return null;
  const optionId = optionRaw ? Number(optionRaw) : null;
  if (optionId != null && (!Number.isInteger(optionId) || optionId <= 0)) return null;
  return { productId, optionId, quantity };
}
