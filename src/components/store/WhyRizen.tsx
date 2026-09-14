import { Container } from "@/components/ui";

/**
 * "왜 RiZen 인가" — 브랜드 이야기 + 제품 특징 4가지.
 *
 * ★ 카피 규제 검토 완료 (식품표시광고법 §9, CLAUDE.md 규칙 1). 2026-09-14 승인.
 *   원재료·입자·조리 방법·포장만 말한다.
 *   - 소화·흡수·위 부담 등 기능 표현 → 쓰지 않는다 (질감으로 말한다)
 *   - '무첨가'·'자연 그대로' → 쓰지 않는다 (원재료 표기 사실로 말한다)
 *   - 운동 관련은 "운동 전후 탄수화물 보충" 까지만 허용
 *
 * 레이아웃: 좌측 리드 + 우측 편집형 목록(큰 세리프 숫자 + 하이라인).
 * 똑같은 카드 반복 대신 잡지처럼 읽히게 한다.
 */
const reasons: { no: string; title: string; body: string }[] = [
  {
    no: "01",
    title: "국산 멥쌀 100%",
    body: "원재료는 국산 멥쌀 하나입니다. 표기가 단순해 무엇을 먹는지 그대로 보입니다.",
  },
  {
    no: "02",
    title: "곱게 간 입자",
    body: "고운 입자로 갈아, 조리하면 죽처럼 부드러운 질감이 됩니다.",
  },
  {
    no: "03",
    title: "전자레인지로 간편하게",
    body: "한 스푼(약 45g)에 물 100ml를 붓고, 30초씩 저어가며 데우면 완성입니다.",
  },
  {
    no: "04",
    title: "1kg 스탠딩 파우치",
    body: "소포장을 여러 번 살 필요 없는 넉넉한 용량이고, 세워서 보관할 수 있습니다.",
  },
];

export function WhyRizen() {
  return (
    <section className="bg-cream py-24 md:py-32" aria-labelledby="why-heading">
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        {/* 좌 · 리드 */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-en text-[11px] font-medium uppercase tracking-[0.22em] text-clay-deep">
            Why RiZen
          </p>
          <h2
            id="why-heading"
            className="mt-4 font-display text-[2rem] font-semibold leading-[1.2] tracking-[-0.01em] text-ink md:text-[2.4rem]"
          >
            Rice에 Risen을 더해,
            <br />
            <span className="italic text-clay-deep">RiZen</span>
          </h2>
          <p className="mt-5 max-w-sm font-kr text-[15px] leading-relaxed text-ink-soft">
            해외 직구로만 구하던 크림 오브 라이스의 번거로움, 아쉬운 용량, 가격 부담. 이 셋을
            덜어내려고 시작했습니다.
          </p>
          <p className="mt-3 max-w-sm font-kr text-[15px] leading-relaxed text-ink-soft">
            아침 대용으로, 운동 전후 탄수화물 보충으로, 필요한 때에 맞춰 드세요.
          </p>
        </div>

        {/* 우 · 편집형 목록 */}
        <ul className="flex flex-col">
          {reasons.map((r) => (
            <li
              key={r.no}
              className="grid grid-cols-[auto_1fr] gap-x-6 border-t border-line py-8 first:border-t-0 first:pt-0 md:gap-x-10 md:py-10"
            >
              <span className="font-display text-4xl font-normal italic leading-none text-clay/70 md:text-5xl">
                {r.no}
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold text-ink md:text-[1.4rem]">
                  {r.title}
                </h3>
                <p className="mt-2.5 max-w-md font-kr text-[15px] leading-relaxed text-ink-soft">
                  {r.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
