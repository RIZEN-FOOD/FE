import Link from "next/link";
import { Container } from "@/components/ui";
import { serverApi } from "@/lib/server/api";
import { safeUrl } from "@/lib/safeUrl";

/**
 * 공개 페이지 공용 푸터.
 *
 * 구성: (1) 밝은 브랜드 배너 — 제품 사진 + 한 줄 카피 + CTA,
 *       (2) 찢긴 종이 엣지로 이어지는 브랜드 색 밴드 — 로고·법정정보·정책·저작권.
 *
 * ★ 전자상거래법상 사업자정보와 통신판매업 신고번호를 게시해야 한다 (CLAUDE.md §7).
 *   값은 site_setting 에서 읽는다 — 코드에 박지 않는다. 대표가 관리자 화면에서 채운다.
 *   아직 입력되지 않은 항목은 "확인 후 표기"로 보여준다 — 값을 지어내지 않는다.
 *
 * ★ 제품 사진은 관리자(main.footer_image)에서 바꾼다. 비어 있으면 번들 누끼를 쓴다.
 *   카피는 일반 식품 표시 규정을 지킨다 — 효능·효과 표현을 넣지 않는다.
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
    { label: "이메일", value: v("company.email") },
    { label: "운영시간", value: v("company.hours") },
  ];

  const sns: { label: string; key: string }[] = [
    { label: "Instagram", key: "sns.instagram" },
    { label: "YouTube", key: "sns.youtube" },
    { label: "Blog", key: "sns.blog" },
  ];
  // 주소 형식이 아닌 값(javascript: 등)은 링크로 걸지 않는다.
  const activeSns = sns
    .map((s) => ({ ...s, href: safeUrl(settings[s.key]) }))
    .filter((s): s is { label: string; key: string; href: string } => Boolean(s.href));

  return (
    <footer className="mt-24">
      {/* (1) 밝은 브랜드 배너 — 제품 사진 + 카피 + CTA */}
      <div className="bg-cream-warm">
        <Container className="grid items-center gap-8 py-14 md:grid-cols-[1.1fr_0.9fr] md:py-20">
          <div className="text-center md:text-left">
            <p className="font-en text-[12px] font-semibold uppercase tracking-[0.24em] text-ink-soft">
              Cream of Rice
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.9rem,4.5vw,3rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-ink [word-break:keep-all]">
              곱게 도정한 쌀 100%,<br className="hidden sm:block" /> 크림오브라이스
            </h2>
            <p className="mx-auto mt-4 max-w-md font-kr text-[15px] leading-[1.7] text-ink-soft [word-break:keep-all] md:mx-0">
              담백한 한 그릇으로, 매일의 루틴을 채우세요.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link
                href="/products"
                className="inline-flex min-h-12 items-center rounded-[6px] bg-ink px-6 py-3 font-kr text-[15px] font-bold text-cream-warm shadow-[0_8px_20px_rgba(34,30,28,0.22)] transition hover:-translate-y-0.5 hover:bg-slate-deep"
              >
                제품 보러가기
              </Link>
              <Link
                href="/inquiry"
                className="inline-flex min-h-12 items-center rounded-[6px] border border-ink/40 px-6 py-3 font-kr text-[15px] font-medium text-ink shadow-[0_6px_16px_rgba(34,30,28,0.12)] transition hover:-translate-y-0.5 hover:bg-ink hover:text-cream-warm"
              >
                문의하기
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center md:justify-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={safeUrl(settings["main.footer_image"]) ?? "/assets/hero-banner/rice-bag.webp"}
              alt="크림오브라이스 제품 패키지"
              className="w-[62%] max-w-[300px] select-none object-contain drop-shadow-[0_26px_44px_rgba(90,60,40,0.28)] md:w-[78%]"
              draggable={false}
            />
          </div>
        </Container>
      </div>

      {/* (2) 찢긴 종이 엣지 + 브랜드 색 밴드 */}
      <div className="relative bg-slate-deep text-cream-warm">
        {/* 위쪽 찢긴 종이 엣지 — 위 밝은 배경(cream-warm)이 찢겨 브랜드 색이 드러나는 느낌 */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1200 36"
          preserveAspectRatio="none"
          className="absolute -top-px left-0 h-5 w-full text-cream-warm md:h-7"
        >
          <path
            fill="currentColor"
            d="M0,0 L1200,0 L1200,10 C1160,22 1120,8 1080,16 C1040,24 1010,10 970,15 C930,20 900,30 860,22 C820,14 790,26 750,20 C710,14 680,4 640,12 C600,20 570,30 530,22 C490,14 460,6 420,14 C380,22 350,30 310,22 C270,14 240,8 200,16 C160,24 120,12 80,18 C50,22 25,14 0,10 Z"
          />
        </svg>

        <Container className="py-14">
          <div className="flex flex-wrap items-start justify-between gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/brand/logo-white.png"
              alt="RiZen"
              className="h-7 w-auto select-none opacity-95"
              draggable={false}
            />

            {activeSns.length > 0 && (
              <nav className="flex gap-4" aria-label="소셜 미디어">
                {activeSns.map((s) => (
                  <a
                    key={s.key}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-en text-xs font-medium text-cream-warm underline-offset-4 hover:underline"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            )}
          </div>

          <dl className="mt-7 grid grid-cols-1 gap-x-8 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {info.map((it) => (
              <div key={it.label} className="flex gap-2 font-kr text-xs">
                <dt className="shrink-0 text-cream-warm/75">{it.label}</dt>
                <dd className="text-cream-warm">{it.value}</dd>
              </div>
            ))}
          </dl>

          <nav className="mt-7 flex flex-wrap gap-4 font-kr text-xs text-cream-warm" aria-label="정책">
            <Link href="/policy/terms" className="underline-offset-4 hover:underline">이용약관</Link>
            <Link href="/policy/privacy" className="font-medium underline-offset-4 hover:underline">
              개인정보처리방침
            </Link>
            <Link href="/policy/shipping" className="underline-offset-4 hover:underline">
              배송·교환·환불 안내
            </Link>
            <Link href="/inquiry" className="underline-offset-4 hover:underline">문의하기</Link>
          </nav>

          {/* 아래 여백은 떠 있는 문의 버튼이 정책 링크를 가리지 않게 하려는 것이다(모바일). */}
          <p className="mt-6 pb-16 font-kr text-xs text-cream-warm/70 md:pb-0">
            © {new Date().getFullYear()} RIZEN FOOD. 크림오브라이스는 일반 식품입니다.
          </p>
        </Container>
      </div>
    </footer>
  );
}
