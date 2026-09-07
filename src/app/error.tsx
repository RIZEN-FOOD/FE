"use client";

import Link from "next/link";
import { useEffect } from "react";

import { BrandLogo, Button } from "@/components/ui";

/**
 * 라우트 에러 경계.
 *
 * 렌더 중 예외가 나면 앱이 하얗게 죽는 대신 이 화면을 보여준다.
 * 사용자에게는 원인을 노출하지 않고(내부는 콘솔로), 다시 시도할 길을 준다.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 내부 확인용. 사용자 화면에는 상세를 드러내지 않는다.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-cream px-6 text-center">
      <Link href="/" aria-label="라이즌푸드 홈">
        <BrandLogo className="h-7" />
      </Link>
      <div>
        <h1 className="font-kr text-lg font-bold text-ink">일시적인 문제가 발생했습니다</h1>
        <p className="mt-2 font-kr text-sm text-ink-soft">
          잠시 후 다시 시도해 주세요. 문제가 계속되면 고객센터로 문의해 주세요.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset} variant="dark">
          다시 시도
        </Button>
        <Button href="/" variant="line">
          홈으로
        </Button>
      </div>
    </main>
  );
}
