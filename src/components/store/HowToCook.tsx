import { Container, SectionTag } from "@/components/ui";

/**
 * "간단한 조리법" — 전자레인지 조리 4단계.
 *
 * ★ 카피는 조리 방법(분량·시간·순서)만 말한다. 효능·효과를 암시하지 않는다
 *   (식품표시광고법, CLAUDE.md 규칙 1). 2026-09-14 승인.
 *   문구는 스마트스토어 상세의 조리법을 옮긴 것이다.
 *
 * 레이아웃: 모바일 1열 → 태블릿 2열 → 데스크톱 4열. 단계 번호가 순서를 이끈다.
 */
type Step = { no: string; title: string; body: string; icon: React.ReactNode };

const iconProps = {
  width: 36,
  height: 36,
  viewBox: "0 0 36 36",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const steps: Step[] = [
  {
    no: "01",
    title: "재료 준비",
    body: "쌀가루 1스푼 분량(약 40g)을 전자레인지 전용 용기에 담고, 물 100ml를 부어 잘 저어줍니다.",
    icon: (
      // 계량 스푼 + 가루
      <svg {...iconProps}>
        <ellipse cx="13" cy="20" rx="8" ry="4.5" />
        <path d="M5 20c0 5 3.6 8 8 8s8-3 8-8" />
        <path d="M20.5 18.5 31 9" />
        <path d="M10 15.5c1-1.6 5-1.6 6 0" />
      </svg>
    ),
  },
  {
    no: "02",
    title: "전자레인지 사용",
    body: "전자레인지에 용기를 넣고, 30초씩 조리하면서 중간중간 꺼내어 골고루 저어줍니다.",
    icon: (
      // 전자레인지
      <svg {...iconProps}>
        <rect x="4" y="8" width="28" height="20" rx="2" />
        <rect x="8" y="12" width="15" height="12" rx="1" />
        <path d="M27 13v0M27 17v0M27 22v2" />
        <path d="M13 16c1 1 0 2 1 3M17 16c1 1 0 2 1 3" />
      </svg>
    ),
  },
  {
    no: "03",
    title: "농도 조절",
    body: "반복하여 조리하며 죽 같은 질감이 될 때까지 익혀줍니다.",
    icon: (
      // 저어 주는 숟가락
      <svg {...iconProps}>
        <circle cx="16" cy="19" r="10" />
        <path d="M11 19a5 5 0 0 1 9-3" />
        <path d="M22 13 31 5" />
      </svg>
    ),
  },
  {
    no: "04",
    title: "마무리",
    body: "기호에 따라 프로틴 파우더, 블루베리, 견과류 등을 곁들여 나만의 한 끼 완성!",
    icon: (
      // 토핑 올린 그릇
      <svg {...iconProps}>
        <path d="M4 18h28c0 6.5-6 11-14 11S4 24.5 4 18Z" />
        <circle cx="12" cy="14" r="2.2" />
        <circle cx="18" cy="12.5" r="2.2" />
        <path d="M23 15c1-3 4-4 6-3-1 2-3 3.5-6 3Z" />
      </svg>
    ),
  },
];

export function HowToCook() {
  return (
    <section className="bg-paper py-24 md:py-32" aria-labelledby="howto-heading">
      <Container>
        <SectionTag>How to Cook</SectionTag>
        <h2
          id="howto-heading"
          className="font-display text-[2rem] font-semibold tracking-[-0.01em] text-ink md:text-4xl"
        >
          전자레인지로 끝나는 간단한 조리법
        </h2>
        <p className="mt-2 max-w-md font-kr text-sm text-ink-soft">
          불 앞에 서 있을 필요 없이, 용기 하나로 준비합니다.
        </p>

        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li
              key={s.no}
              className="relative flex flex-col rounded-[4px] border border-line bg-cream-warm p-6 md:p-7"
            >
              <span className="font-display text-3xl font-normal italic leading-none text-clay/80">
                {s.no}
              </span>
              <span className="mt-6 text-clay-deep">{s.icon}</span>
              <h3 className="mt-4 font-kr text-lg font-bold text-ink">{s.title}</h3>
              <p className="mt-2 font-kr text-sm leading-relaxed text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
