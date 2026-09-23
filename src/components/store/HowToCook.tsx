import Image from "next/image";

import { Container, Reveal } from "@/components/ui";

/**
 * "간단한 조리법" — 전자레인지 조리 4단계.
 *
 * ★ 카피는 조리 방법(분량·시간·순서)만 말한다. 효능·효과를 암시하지 않는다
 *   (식품표시광고법, CLAUDE.md 규칙 1). 2026-09-14 승인.
 *   문구는 스마트스토어 상세의 조리법을 옮긴 것이다.
 *
 * 레이아웃 (2026-09-23 재구성)
 *   전에는 테두리 상자 넷을 바둑판으로 깔았다. 크림 지면에 크림 상자를 또 얹으니
 *   «박스 4개»로만 읽혔다. 지금은 상자가 없다 — 왼쪽에 제목과 완성된 한 그릇 사진,
 *   오른쪽에 큰 번호와 글이 hairline 하나씩 사이에 두고 내려온다. 손으로 그린 아이콘도 뺐다.
 *   번호와 사진이 구조를 만들고, 글자는 지면 위에 바로 선다. 모바일은 사진 → 단계 순으로 쌓인다.
 */
type Step = { no: string; title: string; body: string };

const steps: Step[] = [
  {
    no: "01",
    title: "재료 준비",
    body: "쌀가루 1스푼 분량(약 40g)을 전자레인지 전용 용기에 담고, 물 100ml를 부어 잘 저어줍니다.",
  },
  {
    no: "02",
    title: "전자레인지 사용",
    body: "전자레인지에 용기를 넣고, 30초씩 조리하면서 중간중간 꺼내어 골고루 저어줍니다.",
  },
  {
    no: "03",
    title: "농도 조절",
    body: "반복하여 조리하며 죽 같은 질감이 될 때까지 익혀줍니다.",
  },
  {
    no: "04",
    title: "마무리",
    body: "기호에 따라 프로틴 파우더, 블루베리, 견과류 등을 곁들여 나만의 한 끼를 완성합니다.",
  },
];

export function HowToCook() {
  return (
    <section className="bg-cream-warm py-24 md:py-32" aria-labelledby="howto-heading">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="howto-heading" className="font-display text-section font-semibold text-ink">
            전자레인지로 끝나는
            <br />
            간단한 조리법
          </h2>
          <p className="mt-5 max-w-sm font-kr text-base leading-relaxed text-ink-soft">
            불 앞에 서 있을 필요 없이 용기 하나로 준비합니다. 한 스푼에 물 100ml, 그리고 전자레인지 30초씩.
          </p>
          {/* 완성된 한 그릇. 사진이 상자 대신 이 섹션의 무게를 잡는다. */}
          <div className="relative mt-8 aspect-[4/5] max-w-md overflow-hidden rounded-[12px] bg-clay-soft/40">
            <Image
              src="/assets/hero/hero-a.jpg"
              alt="크림오브라이스로 차린 한 그릇과 바나나·견과"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <ol className="border-t border-line">
          {steps.map((s, i) => (
            <Reveal
              key={s.no}
              as="li"
              delay={i * 80}
              className="grid grid-cols-[4.5rem_1fr] gap-x-6 border-b border-line py-8 md:grid-cols-[6rem_1fr] md:gap-x-8 md:py-10"
            >
              <span className="font-display text-4xl font-normal italic leading-[1.1] text-clay-deep/80 md:text-5xl">
                {s.no}
              </span>
              <div>
                <h3 className="font-kr text-sub font-bold text-ink">{s.title}</h3>
                <p className="mt-2 max-w-md font-kr text-base leading-relaxed text-ink-soft">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
