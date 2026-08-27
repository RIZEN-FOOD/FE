import Link from "next/link";
import { Button } from "@/components/ui";

type StickyBuyBarProps = {
  productName: string;
  /** 원 단위 정수. 서버에서 내려온 값을 그대로 받는다. */
  price: number;
  href: string;
};

/**
 * 화면 하단에 항상 떠 있는 구매 바.
 *
 * 시네마틱 히어로의 최대 위험은 이미 사려고 온 사람을 붙잡아두는 것이다.
 * 스크롤 위치와 무관하게 언제나 구매로 빠져나갈 수 있어야 한다.
 * 그래서 이 바는 조건부로 숨기지 않는다.
 */
export function StickyBuyBar({ productName, price, href }: StickyBuyBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/92 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-wrap items-center justify-between gap-4 px-5 py-3">
        <div className="min-w-0">
          <p className="truncate font-kr text-sm font-medium text-ink">{productName}</p>
          <p className="font-numeric text-lg font-bold leading-tight text-ink">
            {price.toLocaleString("ko-KR")}
            <span className="ml-0.5 font-kr text-sm font-medium">원</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/products"
            className="hidden font-kr text-sm text-ink-soft underline-offset-4 hover:underline sm:block"
          >
            전체 상품
          </Link>
          <Button href={href} variant="dark" size="sm">
            구매하기
          </Button>
        </div>
      </div>
    </div>
  );
}
