import Link from "next/link";
import { Container } from "@/components/ui";

/**
 * 공개 페이지(상품·공지 등) 공용 헤더.
 *
 * 히어로용 SiteHeader 와 달리 배경이 있다. 히어로가 아닌 페이지에서는
 * 투명 헤더가 본문과 겹쳐 안 보이기 때문이다.
 */
export function StoreHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream-warm/95 backdrop-blur">
      <Container className="flex items-center justify-between py-4">
        <Link href="/" className="font-en text-xl font-extrabold tracking-tight text-berry">
          RiZen
        </Link>
        <nav aria-label="주요 메뉴">
          <ul className="flex items-center gap-6 font-kr text-sm font-medium text-ink">
            <li><Link href="/products" className="underline-offset-4 hover:underline">상품</Link></li>
            <li><Link href="/notice" className="underline-offset-4 hover:underline">공지사항</Link></li>
            <li><Link href="/admin/login" className="underline-offset-4 hover:underline">로그인</Link></li>
          </ul>
        </nav>
      </Container>
    </header>
  );
}
