import type { Metadata } from "next";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { MyPageContent } from "@/components/member/MyPageContent";

export const metadata: Metadata = {
  title: "마이페이지",
  robots: { index: false, follow: false },
};

/**
 * 마이페이지 껍데기.
 *
 * 헤더·푸터는 서버 컴포넌트다 (푸터가 사이트 설정을 서버에서 읽는다).
 * 로그인 가드와 실제 내용은 클라이언트 컴포넌트가 맡는다.
 */
export default function MyPage() {
  return (
    <div className="flex min-h-svh flex-col bg-cream">
      <StoreHeader />
      <div className="flex-1">
        <MyPageContent />
      </div>
      <StoreFooter />
    </div>
  );
}
