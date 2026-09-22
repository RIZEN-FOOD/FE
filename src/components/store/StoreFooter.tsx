import Link from "next/link";
import { Container } from "@/components/ui";
import { serverApi } from "@/lib/server/api";
import { safeUrl } from "@/lib/safeUrl";

/**
 * 공개 페이지 공용 푸터.
 *
 * 찢긴 종이 엣지로 이어지는 브랜드 색 밴드 하나다 — 로고·법정정보·정책·저작권.
 * 제품 사진이 그 엣지에 걸쳐 위로 솟는다.
 *
 * 2026-09-22. 그 전에는 위에 "곱게 도정한 쌀 100%" 밝은 배너가 한 칸 더 있었다.
 * 그 배너의 제목이 48px 이라 모든 페이지에서 푸터가 그 페이지 제목보다 커 보였고,
 * 페이지마다 같은 카피가 반복됐다. 배너를 걷어내고 푸터 하나로 합쳤다.
 *
 * ★ 전자상거래법상 사업자정보와 통신판매업 신고번호를 게시해야 한다 (CLAUDE.md §7).
 *   값은 site_setting 에서 읽는다 — 코드에 박지 않는다. 대표가 관리자 화면에서 채운다.
 *   아직 입력되지 않은 항목은 "확인 후 표기"로 보여준다 — 값을 지어내지 않는다.
 *
 * ★ 제품 사진은 관리자(main.footer_image)에서 바꾼다. 비어 있으면 번들 누끼를 쓴다.
 *   장식이므로 alt 를 비운다 — 읽어줄 내용이 따로 없다.
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

  // 관리자가 올린 사진이 있으면 그걸, 없으면 번들 누끼를 쓴다.
  const footerImage =
    safeUrl(settings["main.footer_image"]) ?? "/assets/brand/footer-product.webp";

  return (
    <footer className="mt-28">
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

        {/* 제품 사진 — 찢긴 엣지에 걸쳐 위로 솟는다.
            글을 가리지 않게 오른쪽에 두고, 아래 Container 에 그만큼 여백을 준다.
            좁은 화면에서는 자리가 없어 감춘다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={footerImage}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute -top-20 right-[6%] hidden w-[190px] select-none drop-shadow-[0_24px_40px_rgba(0,0,0,0.35)] md:block lg:-top-24 lg:w-[230px]"
        />

        <Container className="py-14 md:pr-[250px] lg:pr-[300px]">
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
                    className="font-en text-caption font-medium text-cream-warm underline-offset-4 hover:underline"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            )}
          </div>

          <dl className="mt-7 grid grid-cols-1 gap-x-8 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {info.map((it) => (
              <div key={it.label} className="flex gap-2 font-kr text-caption">
                <dt className="shrink-0 text-cream-warm/75">{it.label}</dt>
                <dd className="text-cream-warm">{it.value}</dd>
              </div>
            ))}
          </dl>

          <nav className="mt-7 flex flex-wrap gap-4 font-kr text-caption text-cream-warm" aria-label="정책">
            <Link href="/policy/terms" className="underline-offset-4 hover:underline">이용약관</Link>
            <Link href="/policy/privacy" className="font-medium underline-offset-4 hover:underline">
              개인정보처리방침
            </Link>
            <Link href="/policy/shipping" className="underline-offset-4 hover:underline">
              배송·교환·환불 안내
            </Link>
            <Link href="/inquiry" className="underline-offset-4 hover:underline">문의하기</Link>
            {/* 비회원도 스스로 주문을 찾을 수 있게 — 링크를 잃으면 볼 방법이 없었다 */}
            <Link href="/orders/lookup" className="underline-offset-4 hover:underline">주문 조회</Link>
          </nav>

          {/* 아래 여백은 떠 있는 문의 버튼이 정책 링크를 가리지 않게 하려는 것이다(모바일). */}
          <p className="mt-6 pb-16 font-kr text-caption text-cream-warm/70 md:pb-0">
            © {new Date().getFullYear()} RIZEN FOOD. 크림오브라이스는 일반 식품입니다.
          </p>
        </Container>
      </div>
    </footer>
  );
}
