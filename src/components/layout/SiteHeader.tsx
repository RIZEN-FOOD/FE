import Link from "next/link";
import { storeNav } from "./storeNav";
import { MemberNavLink } from "./MemberNavLink";
import { CartBadge } from "@/components/store/CartBadge";

/**
 * 상단 헤더 (메인 히어로용).
 * 히어로가 화면을 가득 채우므로 배경 없이 얹힌다.
 *
 * 로고는 왼쪽, 네비게이션은 화면 정중앙에 둔다.
 * 3열 그리드(1fr · auto · 1fr)로 좌우를 대칭시켜 가운데 열이 진짜 중앙에 오게 한다.
 */
export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto grid w-full max-w-wrap grid-cols-[1fr_auto_1fr] items-center px-7 py-5">
        {/* 로고 SVG 를 받으면 이 텍스트를 교체한다 */}
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
            <li>
              <MemberNavLink />
            </li>
          </ul>
        </nav>

        {/* 우측: 장바구니. 좌측 로고와 대칭을 이뤄 네비를 중앙에 고정한다 */}
        <div className="flex items-center justify-self-end">
          <CartBadge />
        </div>
      </div>
    </header>
  );
}
