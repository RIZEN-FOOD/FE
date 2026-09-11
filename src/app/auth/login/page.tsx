import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { serverApi } from "@/lib/server/api";

export const metadata: Metadata = {
  title: "로그인",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  // 좌측 배경 사진은 관리자 설정에서 온다. 비어 있으면 컴포넌트가 기본 사진을 쓴다.
  const settings = await serverApi.getJson<Record<string, string>>("/api/settings");
  const loginImage = settings?.["auth.login_image"]?.trim() || undefined;
  const signupImage = settings?.["auth.signup_image"]?.trim() || undefined;

  // useSearchParams 를 쓰는 클라이언트 컴포넌트라 Suspense 로 감싼다.
  return (
    <Suspense fallback={<div className="min-h-svh bg-cream" />}>
      <AuthScreen initialMode="login" loginImage={loginImage} signupImage={signupImage} />
    </Suspense>
  );
}
