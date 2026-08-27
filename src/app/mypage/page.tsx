import type { Metadata } from "next";
import Link from "next/link";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "마이페이지",
  robots: { index: false, follow: false },
};

/**
 * 마이페이지 — 회원 기능(Phase 5) 준비 중.
 * 로그인·후기·문의 이력이 여기 들어온다.
 */
export default function MyPage() {
  return (
    <div className="flex min-h-svh flex-col bg-cream">
      <StoreHeader />
      <Container as="main" className="flex-1 py-20 text-center">
        <h1 className="font-kr text-2xl font-bold text-ink">마이페이지</h1>
        <p className="mt-3 font-kr text-sm text-ink-soft">회원 기능을 준비하고 있습니다. 곧 만나요.</p>
        <Link href="/" className="mt-6 inline-block font-kr text-sm font-medium text-clay-deep underline underline-offset-4">
          홈으로
        </Link>
      </Container>
      <StoreFooter />
    </div>
  );
}
