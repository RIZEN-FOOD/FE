import Link from "next/link";
import { BrandLogo, Container } from "@/components/ui";
import { serverApi } from "@/lib/server/api";

/**
 * 공개 페이지 공용 푸터.
 *
 * ★ 전자상거래법상 사업자정보와 통신판매업 신고번호를 게시해야 한다 (CLAUDE.md §7).
 *   값은 site_setting 에서 읽는다 — 코드에 박지 않는다. 대표가 관리자 화면에서 채운다.
 *   아직 입력되지 않은 항목은 "확인 후 표기"로 보여준다 — 값을 지어내지 않는다.
 *
 * 서버 컴포넌트라 SSR 로 값이 담겨 나간다. API 가 응답하지 않아도
 * 푸터 자체는 뜬다(serverApi 가 null 을 돌려주고 기본 문구로 대체).
 */
export async function StoreFooter() {
  const settings = (await serverApi.getJson<Record<string, string>>("/api/settings")) ?? {};

  /** 값이 비었으면 아직 안 채운 것으로 본다. */
  const v = (key: string) => {
    const value = settings[key];
    return value && value.trim() ? value : "확인 후 표기";
  };

  const info: { label: string; value: string }[] = [
    { label: "상호", value: v("company.name") },
    { label: "대표자", value: v("company.ceo") },
    { label: "사업자등록번호", value: v("company.biz_no") },
    { label: "통신판매업 신고번호", value: v("company.mail_order_no") },
    { label: "주소", value: v("company.address") },
    { label: "고객센터", value: v("company.tel") },
  ];

  const sns: { label: string; key: string }[] = [
    { label: "Instagram", key: "sns.instagram" },
    { label: "YouTube", key: "sns.youtube" },
    { label: "Blog", key: "sns.blog" },
  ];

  const activeSns = sns.filter((s) => settings[s.key] && settings[s.key].trim());

  return (
    <footer className="mt-24 border-t border-line bg-cream-warm">
      <Container className="py-12">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <BrandLogo className="h-7 opacity-90" />

          {activeSns.length > 0 && (
            <nav className="flex gap-4" aria-label="소셜 미디어">
              {activeSns.map((s) => (
                <a
                  key={s.key}
                  href={settings[s.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-en text-xs font-medium text-ink-soft underline-offset-4 hover:underline"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          )}
        </div>

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
          <Link href="/policy/privacy" className="font-medium underline-offset-4 hover:underline">
            개인정보처리방침
          </Link>
          <Link href="/policy/shipping" className="underline-offset-4 hover:underline">
            배송·교환·환불 안내
          </Link>
          <Link href="/inquiry" className="underline-offset-4 hover:underline">문의하기</Link>
        </nav>

        <p className="mt-6 font-kr text-xs text-ink-faint">
          © {new Date().getFullYear()} RIZEN FOOD. 크림오브라이스는 일반 식품입니다.
        </p>
      </Container>
    </footer>
  );
}
