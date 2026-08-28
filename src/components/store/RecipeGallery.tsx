import { Container, SectionTag } from "@/components/ui";
import { BowlPlaceholder } from "@/components/hero/layers/BowlPlaceholder";

/**
 * "이렇게 즐겨보세요" 갤러리.
 *
 * 제품은 하나지만, 곁들이는 방법은 계속 늘어난다.
 * 큰 사진 + 굵은 타이포 카드가 좌우로 번갈아 이어지는 리듬으로,
 * 한 제품을 여러 번 다른 느낌으로 보여준다.
 *
 * ★ 지금은 실제 요리 사진이 없다. 그릇 도형 위에 재료 누끼를 얹어
 *   자리를 채워뒀다. 실제 조리 사진이 오면 idea.imageSrc 에 경로만
 *   넣으면 그 사진으로 바로 바뀐다 (아래 renderVisual 참조).
 *
 * ★ 카피는 조리·계량·질감만 말한다. 효능·효과를 암시하지 않는다
 *   (식품표시광고법, CLAUDE.md 규칙 1).
 *
 * 지금은 로컬 배열이다. 레시피가 많아지고 관리자가 직접 올리고 싶어지면
 * 그때 DB 테이블로 옮긴다 (스키마 변경은 승인 후 진행).
 */
type ServingIdea = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  toppings: string[]; // ingredients.ts 의 sprite 파일명 (확장자 제외)
  imageSrc?: string; // 실제 사진이 오면 여기에 경로. 있으면 도형 대신 이 사진을 쓴다.
};

const ideas: ServingIdea[] = [
  {
    id: "classic",
    eyebrow: "The Classic",
    title: "기본으로,\n깔끔하게",
    body: "물이나 우유에 풀어 그대로 드세요. 가장 빠르고 담백한 방법입니다.",
    toppings: [],
  },
  {
    id: "blueberry",
    eyebrow: "Add Fruit",
    title: "블루베리를\n더해서",
    body: "새콤한 블루베리 한 줌을 올리면 산뜻한 맛이 더해집니다.",
    toppings: ["blueberry"],
  },
  {
    id: "nuts",
    eyebrow: "Add Crunch",
    title: "견과류와\n함께",
    body: "아몬드와 호두를 곁들이면 씹는 식감이 더해집니다.",
    toppings: ["almond", "walnut"],
  },
  {
    id: "banana",
    eyebrow: "Add Fruit",
    title: "바나나를\n슬라이스해서",
    body: "바나나 슬라이스를 올려 부드러운 단맛을 더할 수 있습니다.",
    toppings: ["banana"],
  },
];

export function RecipeGallery() {
  return (
    <section className="bg-cream-warm py-24 md:py-32" aria-labelledby="recipe-heading">
      <Container>
        <SectionTag>Ways to Enjoy</SectionTag>
        <h2 id="recipe-heading" className="font-kr text-3xl font-bold tracking-tight text-ink md:text-4xl">
          이렇게 즐겨보세요
        </h2>
        <p className="mt-2 max-w-md font-kr text-sm text-ink-soft">
          곁들이는 재료에 따라 매번 다른 한 그릇이 됩니다.
        </p>
      </Container>

      <div className="mt-14 flex flex-col gap-20 md:gap-28">
        {ideas.map((idea, i) => (
          <RecipeRow key={idea.id} idea={idea} reversed={i % 2 === 1} />
        ))}
      </div>
    </section>
  );
}

function RecipeRow({ idea, reversed }: { idea: ServingIdea; reversed: boolean }) {
  return (
    <Container>
      <div
        className={`grid items-center gap-8 md:grid-cols-2 md:gap-16 ${
          reversed ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <RecipeVisual idea={idea} />

        <div className={reversed ? "md:text-right" : ""}>
          <p className="font-en text-[11px] font-extrabold uppercase tracking-[0.24em] text-clay-deep">
            {idea.eyebrow}
          </p>
          <p className="mt-3 whitespace-pre-line font-kr text-[clamp(1.8rem,3.6vw,2.8rem)] font-bold leading-[1.15] tracking-[-0.02em] text-ink">
            {idea.title}
          </p>
          <p className="mt-4 max-w-sm font-kr text-sm leading-relaxed text-ink-soft md:ml-auto md:text-right">
            {idea.body}
          </p>
        </div>
      </div>
    </Container>
  );
}

/**
 * 카드 비주얼. 실사진이 있으면 그 사진을, 없으면 그릇 도형 위에
 * 토핑 누끼를 얹어 자리를 채운다.
 */
function RecipeVisual({ idea }: { idea: ServingIdea }) {
  if (idea.imageSrc) {
    return (
      <div className="overflow-hidden rounded-[4px] bg-clay-soft/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={idea.imageSrc} alt={idea.title.replace("\n", " ")} className="aspect-[4/5] w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] bg-clay-soft/30">
      <div className="absolute inset-0 flex items-center justify-center p-10">
        <BowlPlaceholder className="h-auto w-full max-w-[280px] drop-shadow-[0_20px_34px_rgba(90,60,40,0.22)]" />
      </div>

      {idea.toppings.map((kind, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={kind}
          src={`/assets/ingredients/${kind}.png`}
          alt=""
          aria-hidden="true"
          className="absolute drop-shadow-[0_4px_8px_rgba(40,30,20,0.3)]"
          style={{
            width: "22%",
            left: `${42 + i * 16}%`,
            top: `${46 + (i % 2) * 8}%`,
            transform: `translate(-50%, -50%) rotate(${i % 2 === 0 ? -10 : 12}deg)`,
          }}
        />
      ))}
    </div>
  );
}
