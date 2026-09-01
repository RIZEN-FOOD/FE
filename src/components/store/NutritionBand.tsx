import { Container, SectionTag } from "@/components/ui";
import type { Nutrition } from "@/types/product";

/**
 * 영양성분 다크 밴드.
 *
 * 큰 숫자 몇 개로 제품의 성격을 한눈에 보여준다.
 * 법정 표시사항(영양성분)을 텍스트로 노출하는 자리이기도 하다 (CLAUDE.md 규칙 2).
 *
 * ★ 수치는 DB(nutrition 테이블)에서 온다. 코드에 박지 않는다.
 *   값이 없으면 섹션 자체를 그리지 않는다 — 숫자를 지어내지 않는다.
 *
 * ★ 카피는 성분·수치만 말한다. 효능·효과를 암시하지 않는다 (규칙 1).
 */
export function NutritionBand({
  nutrition,
  productName,
}: {
  nutrition: Nutrition | null;
  productName: string;
}) {
  if (!nutrition) return null;

  const serving = nutrition.servingSizeG;

  const stats: { value: number | null; unit: string; label: string }[] = [
    { value: nutrition.kcal, unit: "kcal", label: "열량" },
    { value: nutrition.carbG, unit: "g", label: "탄수화물" },
    { value: nutrition.proteinG, unit: "g", label: "단백질" },
    { value: nutrition.fatG, unit: "g", label: "지방" },
  ].filter((s) => s.value != null);

  // 보여줄 수치가 하나도 없으면 섹션을 띄우지 않는다.
  if (stats.length === 0) return null;

  return (
    <section className="bg-slate-deep py-20 md:py-24" aria-labelledby="nutrition-band-heading">
      <Container>
        <SectionTag tone="onDark">Nutrition</SectionTag>
        <h2
          id="nutrition-band-heading"
          className="font-kr text-2xl font-bold tracking-tight text-cream-warm md:text-3xl"
        >
          {productName}의 영양성분
        </h2>
        {serving != null && (
          <p className="mt-2 font-kr text-sm text-cream-warm/60">1회 제공량 {serving}g 기준</p>
        )}

        <dl className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dd className="font-numeric text-[40px] font-bold leading-none text-cream-warm">
                {s.value!.toLocaleString("ko-KR")}
                <span className="ml-0.5 text-xl font-medium text-cream-warm/70">{s.unit}</span>
              </dd>
              <dt className="mt-2 font-kr text-sm text-cream-warm/60">{s.label}</dt>
            </div>
          ))}
        </dl>

        {nutrition.sugarG != null || nutrition.sodiumMg != null ? (
          <p className="mt-8 font-kr text-xs text-cream-warm/50">
            {nutrition.sugarG != null && `당류 ${nutrition.sugarG}g`}
            {nutrition.sugarG != null && nutrition.sodiumMg != null && " · "}
            {nutrition.sodiumMg != null && `나트륨 ${nutrition.sodiumMg}mg`}
          </p>
        ) : null}
      </Container>
    </section>
  );
}
