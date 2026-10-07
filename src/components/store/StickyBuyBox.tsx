import { AddToCart } from "@/components/store/AddToCart";
import type { ProductDetail } from "@/types/product";
import type { ShippingPolicy } from "@/types/shipping";

/**
 * 상세 사진 옆에 따라오는 구매 상자 — PC 전용 (2026-10-07).
 *
 * 상세 사진을 내려 보다가 맨 위로 다시 올라가지 않고 바로 담거나 살 수 있게 한다
 * (네이버 스마트스토어의 오른쪽 구매 상자와 같은 자리). 화면 폭 1024px 이상에서만 보이고,
 * 휴대폰·태블릿은 지금처럼 위쪽 구매 패널만 쓴다.
 *
 * ★ 수량·옵션·버튼은 위쪽 패널과 같은 AddToCart 를 그대로 쓴다 — 담기·바로구매 규칙이 갈라지지 않게.
 *   가격·배송비는 상품·배송비 정책에서 온 값만 보여준다(코드에 적지 않는다).
 */
export function StickyBuyBox({
  product,
  shipping,
}: {
  product: ProductDetail;
  shipping?: ShippingPolicy | null;
}) {
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const won = (n: number) => n.toLocaleString("ko-KR");

  return (
    <div className="border border-line bg-paper p-5">
      <p className="font-kr text-sm font-bold leading-snug text-ink">{product.nameKo}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-numeric text-2xl font-bold text-ink">
          {won(product.effectivePrice)}
          <span className="ml-0.5 font-kr text-sm font-medium">원</span>
        </span>
        {hasDiscount && (
          <span className="font-numeric text-sm text-ink-faint line-through">{won(product.price)}</span>
        )}
      </div>
      <div className="mt-5">
        <AddToCart product={product} shipping={shipping} />
      </div>
    </div>
  );
}
