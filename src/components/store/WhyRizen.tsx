import { Container, SectionTag } from "@/components/ui";

/**
 * "크림오브라이스가 다른 이유" — 제품 특징 3가지.
 *
 * ★ 카피 규제 검토 완료 (식품표시광고법 §9, CLAUDE.md 규칙 1).
 *   여기 문구는 전부 가공 방식·원재료 구성·조리 편의만 말한다.
 *
 *   레퍼런스에 있던 "소화 부담이 적은", "속이 편한" 같은 표현은 쓰지 않았다.
 *   소화 기능을 언급하는 순간 §9 가 금지하는 "소화가 잘 됩니다"와 같은 계열이 된다.
 *   대신 같은 사실을 형태·질감으로 바꿔 말한다.
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
    <section className="bg-cream py-24 md:py-28" aria-labelledby="why-heading">
      <Container>
        <SectionTag>Why RiZen</SectionTag>
        <h2
          id="why-heading"
          className="font-kr text-3xl font-bold tracking-tight text-ink md:text-[30px]"
        >
          크림오브라이스가 다른 이유
        </h2>
        <p className="mt-3 max-w-xl font-kr text-sm leading-relaxed text-ink-soft">
          같은 쌀 베이스라도 입자 크기와 배합이 다르면 결과가 달라집니다.
          조리 편의와 질감을 기준으로 배합을 설계했습니다.
        </p>

        <ul className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
          {reasons.map((r) => (
            <li key={r.no}>
              <p className="font-en text-xs font-extrabold tracking-[0.2em] text-clay-deep">{r.no}</p>
              <h3 className="mt-3 font-kr text-lg font-bold text-ink">{r.title}</h3>
              <p className="mt-2 font-kr text-sm leading-relaxed text-ink-soft">{r.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
