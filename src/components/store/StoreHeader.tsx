import Link from "next/link";
import { Container } from "@/components/ui";
import { storeNav } from "@/components/layout/storeNav";

/**
 * 공개 페이지(상품·공지 등) 공용 헤더.
 *
 * 히어로용 SiteHeader 와 달리 배경이 있다.
 * 로고는 왼쪽, 네비게이션은 정중앙 (3열 그리드로 좌우 대칭).
 */
export function StoreHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream-warm/95 backdrop-blur">
      <Container className="grid grid-cols-[1fr_auto_1fr] items-center py-4">
        <Link href="/" className="justify-self-start font-en text-xl font-extrabold tracking-tight text-berry">
          RiZen
        </Link>
        <nav aria-label="주요 메뉴" className="justify-self-center">
          <ul className="flex items-center gap-6 font-kr text-sm font-medium text-ink">
            {storeNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="underline-offset-4 hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div aria-hidden="true" />
      </Container>
    </header>
  );
}
