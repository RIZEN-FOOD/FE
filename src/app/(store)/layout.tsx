import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";

/**
 * 공개 페이지(상품·공지 등) 공용 레이아웃.
 * 메인 히어로(/)는 이 레이아웃을 쓰지 않는다 — 자체 헤더/구매바를 갖는다.
 */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-cream">
      <StoreHeader />
      <div className="flex-1">{children}</div>
      <StoreFooter />
    </div>
  );
}
