import Link from "next/link";
import { Container } from "@/components/ui";
import { storeNav } from "@/components/layout/storeNav";
import { MemberNavLink } from "@/components/layout/MemberNavLink";
import { MobileNav } from "@/components/layout/MobileNav";
import { CartBadge } from "@/components/store/CartBadge";

/**
 * 공개 페이지(상품·공지 등) 공용 헤더.
 *
 * 로고는 왼쪽, 메뉴는 오른쪽으로 몰아 정렬한다.
 * 데스크톱은 항목을 펼치고, 모바일(md 미만)은 장바구니 + 햄버거(사이드 메뉴)만 둔다.
 */
export function StoreHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream-warm/95 backdrop-blur">
      <Container className="flex items-center justify-between py-4">
        <Link href="/" className="font-en text-xl font-extrabold tracking-tight text-berry">
          RiZen
        </Link>

        {/* 데스크톱: 오른쪽 정렬 */}
        <nav aria-label="주요 메뉴" className="hidden md:block">
          <ul className="flex items-center gap-6 font-kr text-sm font-medium text-ink">
            {storeNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="underline-offset-4 hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <MemberNavLink />
            </li>
            <li>
              <CartBadge />
            </li>
          </ul>
        </nav>

        {/* 모바일: 장바구니 + 햄버거 */}
        <div className="flex items-center gap-4 md:hidden">
          <CartBadge />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
