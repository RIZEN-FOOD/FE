import type { Metadata } from "next";

import { SocialSignupScreen } from "@/components/auth/SocialSignupScreen";

export const metadata: Metadata = {
  title: "간편 가입",
  robots: { index: false, follow: false },
};

/** 간편 로그인으로 처음 온 사람의 약관 동의 화면. */
export default function SocialSignupPage() {
  return <SocialSignupScreen />;
}
