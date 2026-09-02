import { AddToCart } from "@/components/store/AddToCart";
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
 * ★ 자사몰이 주 채널이다 (2026-08-27 확정). 장바구니·바로구매를 1급으로 두고,
 *   외부 판매 채널(네이버·쿠팡)은 그 아래 보조로 안내한다.
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

      {/* 자사몰 구매 — 장바구니/바로구매 */}
      <div className="mt-7">
        <AddToCart product={product} />
      </div>

      {/* 외부 판매 채널 — 보조 안내 */}
      {links.length > 0 && (
        <div className="mt-6 border-t border-line pt-5">
          <p className="mb-2 font-kr text-xs font-medium text-ink-faint">다른 곳에서 구매</p>
          <div className="flex flex-wrap gap-2">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[2px] border border-line px-3 py-1.5 font-kr text-xs text-ink-soft transition hover:border-ink hover:text-ink"
              >
                {link.label || CHANNEL_LABEL[link.channel] || "구매처"}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
