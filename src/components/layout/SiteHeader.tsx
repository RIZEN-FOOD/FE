import Link from "next/link";

/**
 * 상단 헤더.
 * 히어로가 화면을 가득 채우므로 배경 없이 얹히고, 로고와 최소 메뉴만 둔다.
 * 사러 온 사람이 3초 안에 상품으로 갈 수 있는 탈출구다.
 */
export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex w-full max-w-wrap items-center justify-between px-7 py-5">
        {/* 로고 SVG 를 받으면 이 텍스트를 교체한다 */}
        <Link href="/" className="font-en text-xl font-extrabold tracking-tight text-berry">
          RiZen
        </Link>

        <nav aria-label="주요 메뉴">
          <ul className="flex items-center gap-6 font-kr text-sm font-medium text-ink">
            <li>
              <Link href="/products" className="underline-offset-4 hover:underline">
                상품
              </Link>
            </li>
            <li>
              <Link href="/notice" className="underline-offset-4 hover:underline">
                공지사항
              </Link>
            </li>
            <li>
              <Link href="/auth/login" className="underline-offset-4 hover:underline">
                로그인
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
