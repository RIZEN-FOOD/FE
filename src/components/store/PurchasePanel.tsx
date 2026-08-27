import { Button } from "@/components/ui";
import type { ProductDetail } from "@/types/product";

const CHANNEL_LABEL: Record<string, string> = {
  NAVER: "네이버 스토어",
  COUPANG: "쿠팡",
  OWN: "자사몰",
  OTHER: "구매하기",
};

/**
 * 구매 패널.
 *
 * 지금은 외부 판매 채널 링크로 연결한다. 자사몰 장바구니는 아직 없다
 * (다음 단계). 링크가 여러 개면 채널별로 버튼을 준다.
 */
export function PurchasePanel({ product }: { product: ProductDetail }) {
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const links = product.purchaseLinks;

  return (
    <div>
      {product.nameEn && (
        <p className="font-en text-xs font-semibold uppercase tracking-widest text-clay-deep">
          {product.nameEn}
        </p>
      )}
      <h1 className="mt-1 font-kr text-3xl font-bold tracking-tight text-ink">{product.nameKo}</h1>
      {product.subtitle && <p className="mt-2 font-kr text-ink-soft">{product.subtitle}</p>}

      <div className="mt-5 flex items-baseline gap-3">
        <span className="font-numeric text-3xl font-bold text-ink">
          {product.effectivePrice.toLocaleString("ko-KR")}
          <span className="ml-1 font-kr text-lg font-medium">원</span>
        </span>
        {hasDiscount && (
          <span className="font-numeric text-lg text-ink-faint line-through">
            {product.price.toLocaleString("ko-KR")}
          </span>
        )}
      </div>

      {(product.weightG || product.servings) && (
        <p className="mt-2 font-kr text-sm text-ink-soft">
          {product.weightG && `${product.weightG}g`}
          {product.weightG && product.servings && " · "}
          {product.servings && `약 ${product.servings}회 제공`}
        </p>
      )}

      <div className="mt-7 flex flex-col gap-2">
        {product.soldOut ? (
          <div className="rounded-[2px] bg-line py-3 text-center font-kr text-sm font-medium text-ink-soft">
            품절되었습니다
          </div>
        ) : links.length > 0 ? (
          links.map((link, i) => (
            <Button key={i} href={link.url} variant={i === 0 ? "dark" : "line"} className="w-full">
              {link.label || CHANNEL_LABEL[link.channel] || "구매하기"}
            </Button>
          ))
        ) : (
          <div className="rounded-[2px] border border-line py-3 text-center font-kr text-sm text-ink-soft">
            판매 채널 준비 중입니다
          </div>
        )}
      </div>
    </div>
  );
}
