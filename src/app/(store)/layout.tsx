import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { QuickMenu } from "@/components/store/QuickMenu";
import { serverApi } from "@/lib/server/api";
import { safeUrl } from "@/lib/safeUrl";

/**
 * 공개 페이지(상품·공지 등) 공용 레이아웃.
 * 메인 히어로(/)는 이 레이아웃을 쓰지 않는다 — 자체 헤더/구매바를 갖는다.
 */
export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  // 퀵메뉴의 카카오톡 채널 주소. 푸터와 같은 설정 조회라 Next 가 한 번만 부른다.
  const settings = (await serverApi.getJson<Record<string, string>>("/api/settings")) ?? {};
  return (
    <div className="flex min-h-svh flex-col bg-cream">
      <StoreHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <StoreFooter />
      <QuickMenu kakaoChannelUrl={safeUrl(settings["sns.kakao_channel"])} />
    </div>
  );
}
