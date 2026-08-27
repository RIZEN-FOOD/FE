import type { Nutrition, Ingredient, ProductLabel } from "@/types/product";

/**
 * 영양성분·원재료·표시사항을 텍스트로 렌더한다.
 *
 * ★ 법정 표시사항은 이미지가 아니라 텍스트로 넣는다 (CLAUDE.md 규칙 2).
 *   이미지 안의 글자는 검색에 안 잡히고, 스크린리더가 못 읽는다.
 *
 * 값이 없는 항목은 지어내지 않는다. 확보되지 않았으면 표시하지 않는다.
 */

function Row({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  if (value == null) return null;
  return (
    <div className="flex justify-between border-b border-line py-2 last:border-0">
      <dt className="font-kr text-sm text-ink-soft">{label}</dt>
      <dd className="font-numeric text-sm font-medium text-ink">
        {value.toLocaleString("ko-KR")} {unit}
      </dd>
    </div>
  );
}

export function NutritionFacts({ nutrition }: { nutrition: Nutrition }) {
  return (
    <section aria-labelledby="nutrition-heading">
      <h2 id="nutrition-heading" className="font-kr text-lg font-bold text-ink">영양성분</h2>
      {nutrition.servingSizeG != null && (
        <p className="mt-1 font-kr text-xs text-ink-faint">
          1회 제공량 {nutrition.servingSizeG}g 기준
        </p>
      )}
      <dl className="mt-3 rounded-[4px] border border-line bg-paper px-4 py-1">
        <Row label="열량" value={nutrition.kcal} unit="kcal" />
        <Row label="탄수화물" value={nutrition.carbG} unit="g" />
        <Row label="단백질" value={nutrition.proteinG} unit="g" />
        <Row label="지방" value={nutrition.fatG} unit="g" />
        <Row label="당류" value={nutrition.sugarG} unit="g" />
        <Row label="나트륨" value={nutrition.sodiumMg} unit="mg" />
      </dl>
    </section>
  );
}

export function IngredientList({ ingredients, label }: { ingredients: Ingredient[]; label: ProductLabel | null }) {
  const labelRows: { k: string; v: string | null }[] = label
    ? [
        { k: "식품유형", v: label.foodType },
        { k: "내용량", v: null },
        { k: "소비기한", v: label.shelfLife },
        { k: "보관방법", v: label.storageMethod },
        { k: "제조원", v: label.manufacturer },
        { k: "판매원", v: label.seller },
        { k: "소비자상담실", v: label.customerService },
      ].filter((r) => r.v)
    : [];

  return (
    <section aria-labelledby="ingredient-heading">
      <h2 id="ingredient-heading" className="font-kr text-lg font-bold text-ink">원재료 · 표시사항</h2>

      {ingredients.length > 0 && (
        <div className="mt-3">
          <p className="font-kr text-sm font-medium text-ink">원재료명 및 함량</p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {ingredients.map((ing, i) => (
              <li key={i} className="font-kr text-sm text-ink-soft">
                {ing.name}
                {ing.percentage != null && <span className="text-ink-faint"> {ing.percentage}%</span>}
                {ing.origin && <span className="text-ink-faint"> ({ing.origin})</span>}
                {ing.allergen && <span className="text-clay-deep"> · 알레르기: {ing.allergen}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {labelRows.length > 0 && (
        <dl className="mt-4 rounded-[4px] border border-line bg-paper px-4 py-1">
          {labelRows.map((r) => (
            <div key={r.k} className="flex gap-4 border-b border-line py-2 last:border-0">
              <dt className="w-28 shrink-0 font-kr text-sm text-ink-faint">{r.k}</dt>
              <dd className="font-kr text-sm text-ink-soft">{r.v}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
