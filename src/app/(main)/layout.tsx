import { SiteHeader } from "@/components/layout/SiteHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { QuickMenu } from "@/components/store/QuickMenu";

/**
 * 메인(히어로) 템플릿.
 *
 * 홈처럼 상단이 풀블리드 히어로인 화면용. 투명 헤더(SiteHeader)가 히어로 위에 얹히고,
 * 스크롤해 히어로를 지나면 불투명으로 바뀐다. 퀵메뉴는 히어로를 지난 뒤 나타난다.
 *
 * ★ header/footer 같은 필수 요소는 이 템플릿에만 두고, 페이지는 내용만 그린다.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <StoreFooter />
      <QuickMenu revealAfterHero />
    </>
  );
}
