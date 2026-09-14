import { Container, SectionTag } from "@/components/ui";

/**
 * "자주 묻는 질문" — 쌀가루 공통 Q&A 3개.
 *
 * ★ 카피 규제 검토 완료 (식품표시광고법, CLAUDE.md 규칙 1). 2026-09-14 승인.
 *   맛·질감·보관·원료 특성(쌀눈)만 말한다. 문구는 스마트스토어 상세의 Q&A 를 옮긴 것이다.
 *
 * 상품 상세 페이지는 모든 상품(브라우니·피넛 포함)이 함께 쓰는 틀이라, 특정 상품 전용
 * 문구를 거기에 박지 않고 브랜드 공통 내용으로 메인에 둔다 (CLAUDE.md 규칙 3).
 *
 * 네이티브 <details> 아코디언 — 스크립트 없이 키보드·스크린리더로 열고 닫힌다.
 */
const faqs: { q: string; a: string }[] = [
  {
    q: "일반 쌀과 맛이 다른가요?",
    a: "네. 일반 쌀과는 달리 조리 시 식감이 부드럽고 죽과 같은 질감을 가집니다. 고소한 맛과 향이 나는 것이 특징이며, 식단관리 및 운동용으로 많이 활용됩니다.",
  },
  {
    q: "어떻게 보관해야 하나요?",
    a: "직사광선을 피하고 습기가 적은 서늘한 곳에 밀봉하여 보관하시는 것이 좋으며, 개봉 후에는 최대한 빨리 섭취하시길 권장 드립니다.",
  },
  {
    q: "노란색 알갱이는 무엇인가요?",
    a: "간혹 가루에 섞여 보이는 노란색 점은 쌀알의 쌀눈이므로 안심하고 드셔도 됩니다.",
  },
];

export function BrandFaq() {
  return (
    <section className="bg-cream py-24 md:py-28" aria-labelledby="faq-heading">
      <Container className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <SectionTag>Q&amp;A</SectionTag>
          <h2
            id="faq-heading"
            className="font-display text-[2rem] font-semibold leading-[1.2] tracking-[-0.01em] text-ink md:text-4xl"
          >
            궁금한 점만
            <br />
            모았습니다
          </h2>
          <p className="mt-3 max-w-sm font-kr text-sm text-ink-soft">
            알고 먹으면 더 즐거운 쌀가루, 자주 받는 질문입니다.
          </p>
        </div>

        <div className="border-t border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-kr text-base font-bold text-ink md:text-lg [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="mr-2 font-display italic text-clay-deep">Q.</span>
                  {f.q}
                </span>
                <span
                  aria-hidden="true"
                  className="relative h-3.5 w-3.5 shrink-0 before:absolute before:left-0 before:top-1/2 before:h-px before:w-full before:bg-ink before:content-[''] after:absolute after:left-1/2 after:top-0 after:h-full after:w-px after:bg-ink after:transition-transform after:content-[''] group-open:after:scale-y-0"
                />
              </summary>
              <p className="pb-6 pr-10 font-kr text-[15px] leading-relaxed text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
