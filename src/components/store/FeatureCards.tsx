import { FeatureScroller, type FeatureItem } from "@/components/store/FeatureScroller";
import { serverApi } from "@/lib/server/api";
import type { MainFeaturePublic } from "@/types/mainFeature";
import type { Nutrition } from "@/types/product";

/**
 * "RIZEN 쌀가루는 뭐가 다른가요?" — 특징 칸.
 *
 * ★ 문구·사진·순서는 전부 DB(main_feature)에서 온다. 코드에 박지 않는다 (CLAUDE.md 규칙 3).
 *   사진도 관리자가 올린 파일(업로드 경로)만 쓴다 — 번들에 넣어둔 이미지를 끌어다 쓰지 않는다.
 *
 * ★ 카피 규제 검토 기준은 그대로다 (식품표시광고법, CLAUDE.md 규칙 1).
 *   관리자 화면에 금지 표현 안내를 띄워 대표가 새로 쓸 때도 같은 기준이 지켜지게 했다.
 *
 * ★ 수치는 대표 상품의 DB 영양성분에서 온다. useNutritionBody 가 켜진 칸의 본문이 비어 있으면
 *   1회 제공량·탄수화물·열량으로 문장을 만든다. 값이 없으면 수치 없이 쓴다 — 숫자를 지어내지 않는다.
 */
function fmt(v: number) {
  return v.toLocaleString("ko-KR");
}

/**
 * 탄수화물 보충 문장. DB 에 있는 값만 쓴다 — 없는 수치는 지어내지 않는다.
 * 열량(kcal)이 비어 있으면 그 부분만 빼고 쓴다.
 */
function carbBody(n: Nutrition | null): string {
  const tail = "운동 전후 탄수화물 보충용으로 드시기 좋습니다.";
  if (!n || n.servingSizeG == null || n.carbG == null) return tail;
  const kcal = n.kcal != null ? `, ${fmt(n.kcal)}kcal` : "";
  return `1회 제공량 ${fmt(n.servingSizeG)}g에 탄수화물 ${fmt(n.carbG)}g${kcal}가 들어 있습니다. ${tail}`;
}

export async function FeatureCards({ nutrition }: { nutrition: Nutrition | null }) {
  const features = (await serverApi.getJson<MainFeaturePublic[]>("/api/main-features")) ?? [];
  if (features.length === 0) {
    return null; // 관리자가 칸을 다 지웠으면 섹션째 보여주지 않는다
  }

  const items: FeatureItem[] = features.map((f, index) => ({
    no: String(index + 1).padStart(2, "0"),
    title: f.title,
    body: f.body?.trim() ? f.body : f.useNutritionBody ? carbBody(nutrition) : "",
    imageSrc: f.imageUrl,
    imageMobileSrc: f.imageMobileUrl,
    alt: f.altText?.trim() ? f.altText : f.title,
  }));

  return <FeatureScroller items={items} />;
}
