import type { Nutrition, Ingredient, ProductLabel } from "@/types/product";

/**
 * 영양성분·원재료·표시사항을 텍스트로 렌더한다.
 *
 * ★ 법정 표시사항은 이미지가 아니라 텍스트로 넣는다 (CLAUDE.md 규칙 2).
 *   이미지 안의 글자는 검색에 안 잡히고, 스크린리더가 못 읽는다.
 *
 * 값이 없는 항목은 지어내지 않는다. 확보되지 않았으면 표시하지 않는다.
 */

export function NutritionFacts({ nutrition }: { nutrition: Nutrition }) {
  // 손님이 먼저 찾는 세 가지는 큰 숫자로, 나머지는 한 줄로. 열 줄짜리 표에 밑줄을 긋는 대신
  // 무엇이 중요한지 크기로 말한다. 값이 없는 항목은 지어내지 않고 빈칸으로 둔다.
  const featured: { label: string; value: number | null; unit: string }[] = [
    { label: "열량", value: nutrition.kcal, unit: "kcal" },
    { label: "탄수화물", value: nutrition.carbG, unit: "g" },
    { label: "단백질", value: nutrition.proteinG, unit: "g" },
  ].filter((r) => r.value != null);
  const rest: { label: string; value: number | null; unit: string }[] = [
    { label: "지방", value: nutrition.fatG, unit: "g" },
    { label: "당류", value: nutrition.sugarG, unit: "g" },
    { label: "나트륨", value: nutrition.sodiumMg, unit: "mg" },
  ].filter((r) => r.value != null);

  return (
    <section aria-labelledby="nutrition-heading">
      <h2 id="nutrition-heading" className="font-display text-section font-semibold text-ink">영양성분</h2>
      {nutrition.servingSizeG != null && (
        <p className="mt-2 font-kr text-small text-ink-soft">1회 제공량 {nutrition.servingSizeG}g 기준</p>
      )}

      {featured.length > 0 && (
        <dl className="mt-6 grid grid-cols-3 gap-3">
          {featured.map((r, i) => (
            <div
              key={r.label}
              className={`rounded-[12px] border px-4 py-5 md:px-5 md:py-6 ${
                i === 0 ? "border-transparent bg-ink text-cream-warm" : "border-line bg-paper"
              }`}
            >
              <dt className={`font-kr text-small ${i === 0 ? "text-cream-warm/75" : "text-ink-soft"}`}>{r.label}</dt>
              <dd className="mt-2 flex items-baseline gap-1">
                <span className="font-numeric text-3xl font-bold leading-none md:text-4xl">
                  {r.value!.toLocaleString("ko-KR")}
                </span>
                <span className={`font-kr text-small ${i === 0 ? "text-cream-warm/75" : "text-ink-faint"}`}>{r.unit}</span>
              </dd>
            </div>
          ))}
        </dl>
      )}

      {rest.length > 0 && (
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 px-1">
          {rest.map((r) => (
            <div key={r.label} className="flex items-baseline gap-2">
              <dt className="font-kr text-small text-ink-soft">{r.label}</dt>
              <dd className="font-numeric text-base font-semibold text-ink">
                {r.value!.toLocaleString("ko-KR")}
                <span className="ml-0.5 font-kr text-caption font-normal text-ink-faint">{r.unit}</span>
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

/** 중량 표기: 1000g 단위면 kg 로. */
function formatWeight(g: number | null | undefined): string | null {
  if (!g) return null;
  return g >= 1000 && g % 1000 === 0 ? `${g / 1000}kg` : `${g}g`;
}

export function IngredientList({
  ingredients,
  label,
  weightG,
}: {
  ingredients: Ingredient[];
  label: ProductLabel | null;
  weightG?: number | null;
}) {
  // 상품정보 고시 + 법정 표시사항. 값이 있는 항목만 보인다(지어내지 않는다).
  const labelRows: { k: string; v: string | null }[] = label
    ? [
        { k: "브랜드", v: label.brand ?? null },
        { k: "식품유형", v: label.foodType },
        { k: "곡물유형", v: label.grainType ?? null },
        { k: "원산지", v: label.origin ?? null },
        { k: "내용량", v: formatWeight(weightG) },
        { k: "열량", v: label.calorieInfo ?? null },
        { k: "소비기한", v: label.shelfLife },
        { k: "보관방법", v: label.storageMethod },
        { k: "포장재질", v: label.packageMaterial },
        { k: "제조원", v: withAddr(label.manufacturer, label.manufacturerAddr) },
        { k: "판매원", v: withAddr(label.seller, label.sellerAddr) },
        { k: "소비자상담실", v: label.customerService },
      ].filter((r) => r.v)
    : [];

  // 주의사항 — 줄마다 한 항목. 서버에서 살균된 값이지만 HTML 로 넣지 않고 텍스트로 그린다.
  const notices = (label?.extraNotice ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section aria-labelledby="ingredient-heading">
      <h2 id="ingredient-heading" className="font-display text-section font-semibold text-ink">원재료와 표시사항</h2>

      {ingredients.length > 0 && (
        <div className="mt-6">
          <p className="font-kr text-small font-semibold text-ink">원재료명 및 함량</p>
          <ul className="mt-2 flex flex-col gap-1">
            {ingredients.map((ing, i) => (
              <li key={i} className="font-kr text-base text-ink-soft">
                {ing.name}
                {ing.percentage != null && <span className="text-ink-faint"> {ing.percentage}%</span>}
                {ing.origin && <span className="text-ink-faint"> ({ing.origin})</span>}
                {ing.allergen && <span className="text-clay-deep"> · 알레르기: {ing.allergen}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 전자상거래법 상품정보 고시. 항목은 모두 남기되 줄마다 선을 긋지 않고
          항목명/값 두 열로 놓아 표가 아니라 읽는 글처럼 보이게 한다. */}
      {labelRows.length > 0 && (
        <dl className="mt-6 grid grid-cols-[7rem_1fr] gap-x-6 gap-y-3 rounded-[12px] bg-paper px-6 py-6 md:grid-cols-[8rem_1fr]">
          {labelRows.map((r) => (
            <div key={r.k} className="contents">
              <dt className="font-kr text-small text-ink-faint">{r.k}</dt>
              <dd className="font-kr text-small text-ink">{r.v}</dd>
            </div>
          ))}
        </dl>
      )}

      {notices.length > 0 && (
        <ul className="mt-4 flex flex-col gap-1">
          {notices.map((n, i) => (
            <li key={i} className="font-kr text-caption leading-relaxed text-ink-faint">
              ※ {n.replace(/^※\s*/, "")}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** 이름 + 주소를 "이름 / 주소" 로 합친다. 이름이 없으면 줄을 그리지 않는다. */
function withAddr(name: string | null, addr: string | null): string | null {
  if (!name) return null;
  return addr ? `${name} / ${addr}` : name;
}
