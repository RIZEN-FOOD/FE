import type { HeroNutritionData } from "@/types/product";

/**
 * 히어로 문구 아래 영양성분 원형 그래프.
 *
 * 값은 관리자(상품 관리 → 영양성분)에서 입력한 그대로다. 코드에 숫자를 박지 않는다.
 * 가운데에 열량, 링은 탄수화물·단백질·지방의 무게 비율이다.
 *
 * ★ 법정 표시사항은 텍스트로도 나가야 한다 (CLAUDE.md 규칙 2).
 *   그래서 원 옆에 수치를 글자로 함께 적고, 그래프 자체는 aria-hidden 으로 둔다.
 * ★ 효능·효과를 말하지 않는다. 있는 수치만 보여 준다.
 *
 * 1회 제공량과 열량, 탄수화물이 모두 없으면 아무것도 그리지 않는다.
 */
const RADIUS = 34;
const CIRC = 2 * Math.PI * RADIUS;

export function HeroNutrition({
  nutrition,
  ink,
  subInk,
  className = "",
}: {
  nutrition: HeroNutritionData | null | undefined;
  /** 슬라이드 배경색에 맞춘 글자색 */
  ink: string;
  subInk: string;
  className?: string;
}) {
  if (!nutrition) return null;

  const serving = num(nutrition.servingSizeG);
  const kcal = num(nutrition.kcal);
  const carb = num(nutrition.carbG);
  const protein = num(nutrition.proteinG);
  const fat = num(nutrition.fatG);

  const macros = [
    { key: "탄수화물", value: carb },
    { key: "단백질", value: protein },
    { key: "지방", value: fat },
  ].filter((m) => m.value != null && m.value > 0) as { key: string; value: number }[];

  const total = macros.reduce((sum, m) => sum + m.value, 0);
  if (kcal == null && total === 0) return null;

  // 링 조각: 진한 색 → 옅은 색 순서로 무게 비율만큼
  const opacities = [1, 0.55, 0.3];
  let offset = 0;
  const arcs = macros.map((m, i) => {
    const length = total > 0 ? (m.value / total) * CIRC : 0;
    const arc = { key: m.key, length, offset, opacity: opacities[i] ?? 0.3 };
    offset += length;
    return arc;
  });

  return (
    <div className={`flex items-center gap-5 ${className}`}>
      <svg viewBox="0 0 88 88" className="h-[86px] w-[86px] shrink-0 md:h-[96px] md:w-[96px]" aria-hidden="true">
        <circle cx="44" cy="44" r={RADIUS} fill="none" stroke={subInk} strokeOpacity="0.18" strokeWidth="9" />
        {arcs.map((a) => (
          <circle
            key={a.key}
            cx="44"
            cy="44"
            r={RADIUS}
            fill="none"
            stroke={ink}
            strokeOpacity={a.opacity}
            strokeWidth="9"
            strokeDasharray={`${a.length} ${CIRC - a.length}`}
            strokeDashoffset={-a.offset}
            transform="rotate(-90 44 44)"
            strokeLinecap="butt"
          />
        ))}
        {kcal != null && (
          <>
            <text
              x="44"
              y="42"
              textAnchor="middle"
              className="font-numeric"
              fontSize="19"
              fontWeight="700"
              fill={ink}
            >
              {fmt(kcal)}
            </text>
            <text x="44" y="56" textAnchor="middle" fontSize="10" fill={subInk}>
              kcal
            </text>
          </>
        )}
      </svg>

      <dl className="font-kr text-[13px] leading-[1.5]">
        {serving != null && (
          <div className="mb-1.5 font-medium" style={{ color: subInk }}>
            1회 제공량 {fmt(serving)}g 기준
          </div>
        )}
        {macros.map((m, i) => (
          <div key={m.key} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: ink, opacity: opacities[i] ?? 0.3 }}
            />
            <dt style={{ color: subInk }}>{m.key}</dt>
            <dd className="font-numeric font-semibold" style={{ color: ink }}>
              {fmt(m.value)}g
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function num(v: number | string | null | undefined): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

/** 소수점이 있으면 그대로, 정수면 정수로 (34.0 → 34) */
function fmt(n: number): string {
  return Number.isInteger(n) ? n.toLocaleString("ko-KR") : String(n);
}
