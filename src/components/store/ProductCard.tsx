import Link from "next/link";
import { WishlistButton } from "@/components/store/WishlistButton";
import type { ProductListItem } from "@/types/product";

/**
 * 상품 카드. 목록·관련상품·메인 그리드에서 공용으로 쓴다.
 *
 * 2026-09-23. 테두리·흰 배경을 걷어냈다. 사진이 곧 카드다.
 *   크림 지면 위에 크림 상자를 또 얹으면 «박스 4개»로 읽히고, 그게 기성품 티의 정체였다.
 *   사진(12px 모서리)이 지면에 바로 놓이고 이름·가격은 그 아래 글자로만 선다.
 *   hover 는 사진만 살짝 커진다. 카드가 떠오르지 않는다 — 떠 있을 이유가 없다.
 */
export function ProductCard({ product }: { product: ProductListItem }) {
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-[12px] bg-clay-soft/40">
        {product.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnailUrl}
            alt={product.nameKo}
            className="h-full w-full object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-en text-sm text-ink-faint">
            준비 중
          </div>
        )}
        {product.soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 font-kr text-caption text-cream-warm">
            품절
          </span>
        )}
        <div className="absolute right-2.5 top-2.5">
          <WishlistButton productId={product.id} />
        </div>
      </div>

      <div className="pt-3.5">
        <h3 className="truncate font-kr text-base font-semibold text-ink transition-colors duration-[var(--dur-base)] group-hover:text-clay-deep">
          {product.nameKo}
        </h3>
        {product.subtitle && (
          <p className="mt-0.5 truncate font-kr text-caption text-ink-faint">{product.subtitle}</p>
        )}
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-numeric text-lg font-bold text-ink">
            {product.effectivePrice.toLocaleString("ko-KR")}
            <span className="ml-0.5 font-kr text-caption font-medium">원</span>
          </span>
          {hasDiscount && (
            <span className="font-numeric text-caption text-ink-faint line-through">
              {product.price.toLocaleString("ko-KR")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
