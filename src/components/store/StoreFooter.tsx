import Link from "next/link";
import { Container } from "@/components/ui";

/**
 * 공개 페이지 공용 푸터.
 *
 * ★ 전자상거래법상 사업자정보와 통신판매업 신고번호를 게시해야 한다 (CLAUDE.md §7).
 *   실제 값은 site_setting 에서 온다. 아직 대표가 입력하지 않았으므로
 *   자리만 잡아두고 "확인 후 표기"로 둔다 — 값을 지어내지 않는다.
 *
 * 개인정보처리방침·이용약관 링크도 법적 의무다. 페이지는 Phase 5 에서 만든다.
 */
export function StoreFooter() {
  const info: { label: string; value: string }[] = [
    { label: "상호", value: "라이즌푸드" },
    { label: "대표자", value: "확인 후 표기" },
    { label: "사업자등록번호", value: "확인 후 표기" },
    { label: "통신판매업 신고번호", value: "확인 후 표기" },
    { label: "주소", value: "확인 후 표기" },
    { label: "고객센터", value: "확인 후 표기" },
  ];

  return (
    <footer className="mt-24 border-t border-line bg-cream-warm">
      <Container className="py-12">
        <p className="font-en text-lg font-extrabold tracking-tight text-berry">RiZen</p>

        <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {info.map((it) => (
            <div key={it.label} className="flex gap-2 font-kr text-xs">
              <dt className="shrink-0 text-ink-faint">{it.label}</dt>
              <dd className="text-ink-soft">{it.value}</dd>
            </div>
          ))}
        </dl>

        <nav className="mt-6 flex flex-wrap gap-4 font-kr text-xs text-ink-soft" aria-label="정책">
          <Link href="/policy/terms" className="underline-offset-4 hover:underline">이용약관</Link>
          <Link href="/policy/privacy" className="font-medium underline-offset-4 hover:underline">개인정보처리방침</Link>
          <Link href="/policy/shipping" className="underline-offset-4 hover:underline">배송·교환·환불 안내</Link>
        </nav>

        <p className="mt-6 font-kr text-xs text-ink-faint">
          © {new Date().getFullYear()} RIZEN FOOD. 크림오브라이스는 일반 식품입니다.
        </p>
      </Container>
    </footer>
  );
}
