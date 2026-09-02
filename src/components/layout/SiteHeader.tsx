import Link from "next/link";
import { storeNav } from "./storeNav";
import { MemberNavLink } from "./MemberNavLink";
import { MobileNav } from "./MobileNav";
import { CartBadge } from "@/components/store/CartBadge";

/**
 * 상단 헤더 (메인 히어로용).
 * 히어로가 화면을 가득 채우므로 배경 없이 얹힌다.
 *
 * 로고는 왼쪽, 메뉴는 오른쪽으로 몰아 정렬한다.
 * 데스크톱은 항목을 펼치고, 모바일(md 미만)은 장바구니 + 햄버거(사이드 메뉴)만 둔다.
 */
export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex w-full max-w-wrap items-center justify-between px-7 py-5">
        {/* 로고 SVG 를 받으면 이 텍스트를 교체한다 */}
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
      </div>
    </header>
  );
}
