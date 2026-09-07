import Link from "next/link";

import { BrandLogo, Button } from "@/components/ui";

/**
 * 404 — 없는 페이지.
 *
 * 기본 Next 화면 대신 브랜드 톤으로 보여주고, 돌아갈 길(홈·상품)을 준다.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-cream px-6 text-center">
      <Link href="/" aria-label="라이즌푸드 홈">
        <BrandLogo className="h-7" />
      </Link>
      <p className="font-display text-[clamp(3rem,10vw,5rem)] font-semibold leading-none text-ink">
        404
      </p>
      <div>
        <h1 className="font-kr text-lg font-bold text-ink">페이지를 찾을 수 없습니다</h1>
        <p className="mt-2 font-kr text-sm text-ink-soft">
          주소가 바뀌었거나 삭제된 페이지일 수 있어요.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button href="/" variant="dark">
          홈으로
        </Button>
        <Button href="/products" variant="line">
          상품 보러 가기
        </Button>
      </div>
    </main>
  );
}
