import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthScreen } from "@/components/auth/AuthScreen";

export const metadata: Metadata = {
  title: "로그인",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  // useSearchParams 를 쓰는 클라이언트 컴포넌트라 Suspense 로 감싼다.
  return (
    <Suspense fallback={<div className="min-h-svh bg-cream" />}>
      <AuthScreen initialMode="login" />
    </Suspense>
  );
}
