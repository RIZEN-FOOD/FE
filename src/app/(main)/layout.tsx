import { SiteHeader } from "@/components/layout/SiteHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { QuickMenu } from "@/components/store/QuickMenu";
import { serverApi } from "@/lib/server/api";
import { safeUrl } from "@/lib/safeUrl";

/**
 * 메인(히어로) 템플릿.
 *
 * 홈처럼 상단이 풀블리드 히어로인 화면용. 투명 헤더(SiteHeader)가 히어로 위에 얹히고,
 * 스크롤해 히어로를 지나면 불투명으로 바뀐다. 퀵메뉴는 히어로를 지난 뒤 나타난다.
 *
 * ★ header/footer 같은 필수 요소는 이 템플릿에만 두고, 페이지는 내용만 그린다.
 */
export default async function MainLayout({ children }: { children: React.ReactNode }) {
  // 퀵메뉴의 카카오톡 채널 주소. 푸터와 같은 설정 조회라 Next 가 한 번만 부른다.
  const settings = (await serverApi.getJson<Record<string, string>>("/api/settings")) ?? {};
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <StoreFooter />
      <QuickMenu revealAfterHero kakaoChannelUrl={safeUrl(settings["sns.kakao_channel"])} />
    </>
  );
}
