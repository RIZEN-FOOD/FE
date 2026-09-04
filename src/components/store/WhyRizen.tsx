import { Container } from "@/components/ui";

/**
 * "크림오브라이스가 다른 이유" — 제품 특징 3가지.
 *
 * ★ 카피 규제 검토 완료 (식품표시광고법 §9, CLAUDE.md 규칙 1).
 *   여기 문구는 전부 가공 방식·원재료 구성·조리 편의만 말한다.
 *   소화 기능을 언급하는 순간 §9 가 금지하는 표현이 되므로 형태·질감으로 바꿔 말한다.
 *
 * 레이아웃: 좌측 리드 + 우측 편집형 목록(큰 세리프 숫자 + 하이라인).
 * 똑같은 3열 카드 대신 잡지처럼 읽히게 한다.
 */
const reasons: { no: string; title: string; body: string }[] = [
  {
    no: "01",
    title: "곱게 도정한 입자",
    body: "입자를 곱게 도정해 물이나 우유에 덩어리 없이 풀립니다. 따로 체에 거를 필요가 없습니다.",
  },
  {
    no: "02",
    title: "쌀 100%, 그 외에 없음",
    body: "인공 감미료와 색소를 넣지 않았습니다. 원재료 표기가 단순해 무엇을 먹는지 그대로 보입니다.",
  },
  {
    no: "03",
    title: "그램 단위 계량",
    body: "가루 형태라 저울로 정확히 덜어낼 수 있습니다. 식단을 숫자로 관리하는 분들에게 맞습니다.",
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
            같은 쌀이라도,
            <br />
            <span className="italic text-clay-deep">결과는 다릅니다</span>
          </h2>
          <p className="mt-5 max-w-sm font-kr text-[15px] leading-relaxed text-ink-soft">
            입자 크기와 배합이 다르면 풀리는 정도도, 질감도 달라집니다. 조리 편의와 담백함을
            기준으로 배합을 설계했습니다.
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
