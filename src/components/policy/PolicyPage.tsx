import Link from "next/link";
import { Container } from "@/components/ui";

/**
 * 정책 문서 공통 레이아웃.
 *
 * 이용약관·개인정보처리방침·배송/교환/환불 안내가 같은 조판을 쓴다.
 * 본문은 시맨틱 태그(h2/h3/p/ul/table)로 넣으면 여기 정의된 스타일이 입혀진다.
 *
 * ★ 이 문서들은 법적 효력이 있는 문서다. 여기 담긴 문안은 표준 양식 초안이며,
 *   실제 게시 전 사업자정보 입력과 법률 검토가 필요하다(요약에서 안내).
 */
export function PolicyPage({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}) {
  const tabs = [
    { href: "/policy/terms", label: "이용약관" },
    { href: "/policy/privacy", label: "개인정보처리방침" },
    { href: "/policy/shipping", label: "배송·교환·환불" },
  ];

  return (
    <Container className="py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-kr text-2xl font-bold tracking-tight text-ink md:text-3xl">{title}</h1>
        <p className="mt-2 font-kr text-xs text-ink-faint">시행일 {effectiveDate}</p>

        {/* 정책 문서 간 이동 */}
        <nav className="mt-6 flex flex-wrap gap-2" aria-label="정책 문서">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`rounded-full border px-3.5 py-1.5 font-kr text-xs transition ${
                t.label === title || title.startsWith(t.label)
                  ? "border-ink bg-ink text-cream-warm"
                  : "border-line text-ink-soft hover:border-ink hover:text-ink"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <div
          className="mt-8 font-kr text-sm leading-relaxed text-ink-soft
            [&_h2]:mb-2 [&_h2]:mt-10 [&_h2]:font-kr [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-ink
            [&_h3]:mb-1 [&_h3]:mt-5 [&_h3]:font-medium [&_h3]:text-ink
            [&_p]:mt-2
            [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5
            [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5
            [&_a]:text-clay-deep [&_a]:underline [&_a]:underline-offset-2
            [&_table]:mt-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
            [&_th]:border [&_th]:border-line [&_th]:bg-cream-warm [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_th]:text-ink
            [&_td]:border [&_td]:border-line [&_td]:px-3 [&_td]:py-2 [&_td]:align-top"
        >
          {children}
        </div>
      </div>
    </Container>
  );
}

/**
 * 아직 확정되지 않은 항목을 본문에 표시한다.
 * 값을 지어내지 않고, 관리자에서 채워질 자리임을 분명히 한다.
 */
export function Pending({ children }: { children?: React.ReactNode }) {
  return (
    <span className="rounded-[2px] bg-cream-warm px-1.5 py-0.5 font-kr text-xs text-clay-deep">
      {children ?? "확인 후 표기"}
    </span>
  );
}
