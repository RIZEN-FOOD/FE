import { AddToCart } from "@/components/store/AddToCart";
import { safeUrl } from "@/lib/safeUrl";
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
    <div className="md:sticky md:top-28">
      {product.nameEn && (
        <p className="font-en text-[12px] font-semibold uppercase tracking-[0.22em] text-clay-deep">
          {product.nameEn}
        </p>
      )}
      <h1 className="mt-2 font-display text-title font-semibold text-ink">{product.nameKo}</h1>
      {product.subtitle && <p className="mt-3 font-kr text-base leading-relaxed text-ink-soft">{product.subtitle}</p>}

      <div className="mt-7 flex items-baseline gap-3">
        <span className="font-numeric text-4xl font-bold text-ink">
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
        <p className="mt-2 font-kr text-small text-ink-soft">
          {product.weightG && `${product.weightG}g`}
          {product.weightG && product.servings && " · "}
          {product.servings && `약 ${product.servings}회 제공`}
        </p>
      )}

      {/* 자사몰 구매 — 장바구니/바로구매 */}
      <div className="mt-8">
        <AddToCart product={product} />
      </div>

      {/* 외부 판매 채널 — 보조 안내 */}
      {links.length > 0 && (
        <div className="mt-8 border-t border-line pt-6">
          <p className="mb-3 font-kr text-small font-medium text-ink-faint">다른 곳에서 구매</p>
          <div className="flex flex-wrap gap-2">
            {links.map((link, i) => (
              <a
                key={i}
                href={safeUrl(link.url) ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[6px] border border-line px-3.5 py-2 font-kr text-small text-ink-soft transition-colors duration-[var(--dur-fast)] hover:border-ink hover:text-ink"
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
