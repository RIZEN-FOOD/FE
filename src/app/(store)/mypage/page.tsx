import type { Metadata } from "next";
import { MyPageContent } from "@/components/member/MyPageContent";

export const metadata: Metadata = {
  title: "마이페이지",
  robots: { index: false, follow: false },
};

/**
 * 마이페이지. 헤더·푸터·퀵메뉴는 (store) 템플릿(layout.tsx)이 그린다.
 * 로그인 가드와 실제 내용은 클라이언트 컴포넌트가 맡는다.
 */
export default function MyPage() {
  return <MyPageContent />;
}
