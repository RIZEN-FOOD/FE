import Link from "next/link";
import { WishlistButton } from "@/components/store/WishlistButton";
import type { ProductListItem } from "@/types/product";

/**
 * 상품 카드. 목록·관련상품·메인 그리드에서 공용으로 쓴다.
 */
export function ProductCard({ product }: { product: ProductListItem }) {
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-[4px] border border-line bg-paper transition hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(90,60,40,0.09)]"
    >
      <div className="relative aspect-square overflow-hidden rounded-t-[4px] bg-clay-soft/40">
        {product.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnailUrl}
            alt={product.nameKo}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-en text-sm text-ink-faint">
            준비 중
          </div>
        )}
        {product.soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 font-kr text-xs text-cream-warm">
            품절
          </span>
        )}
        <div className="absolute right-2.5 top-2.5">
          <WishlistButton productId={product.id} />
        </div>
      </div>

      <div className="px-4 py-4">
        <h3 className="truncate font-kr text-sm font-medium text-ink">{product.nameKo}</h3>
        {product.subtitle && (
          <p className="mt-0.5 truncate font-kr text-xs text-ink-faint">{product.subtitle}</p>
        )}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-numeric text-base font-bold text-ink">
            {product.effectivePrice.toLocaleString("ko-KR")}
            <span className="ml-0.5 font-kr text-xs font-medium">원</span>
          </span>
          {hasDiscount && (
            <span className="font-numeric text-xs text-ink-faint line-through">
              {product.price.toLocaleString("ko-KR")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
