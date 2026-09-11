/**
 * 메인 히어로 배너 — 하드코딩 데이터.
 *
 * ★ 배너의 사진·색·문구·장식은 여기(코드+번들 이미지)에 고정한다.
 *   관리자에서 편집하지 않는다. 대신 슬라이드별 노출 여부만 관리자 설정
 *   (hero.show_* 토글)으로 켜고 끈다. 그래서 배포/다른 환경 어디서나 동일하게 보인다.
 *
 * ★ 가격만은 하드코딩하지 않는다(CLAUDE.md: 가격은 서버에서). 페이지가
 *   /api/products/hero 로 slug 별 실시간 가격·품절을 읽어 이 데이터에 얹는다.
 *
 * 이미지는 FE/public/assets/hero-banner/ 에 함께 커밋된 누끼 WebP 다.
 */
export type HeroBannerSlide = {
  slug: string;
  nameKo: string;
  subtitle: string | null;
  heroColor: string; // #RRGGBB
  heroImageUrl: string; // 제품 봉투(누끼)
  heroBackdropUrl: string | null; // 제품 뒤 세로 기둥(스플래시)
  accentImageUrls: string[]; // [오른쪽 상단, 왼쪽 하단]
  /** 이 슬라이드 노출 여부를 켜고 끄는 관리자 설정 키 */
  visibilityKey: string;
  /** 설정이 아직 없을 때의 기본 노출 여부 */
  defaultVisible: boolean;
};

const B = "/assets/hero-banner";

export const HERO_BANNER: HeroBannerSlide[] = [
  {
    slug: "cream-of-rice",
    nameKo: "크림오브라이스",
    subtitle: "곱게 도정한 쌀 100%",
    heroColor: "#C98A63",
    heroImageUrl: `${B}/rice-bag.webp`,
    heroBackdropUrl: `${B}/rice-backdrop.webp`,
    accentImageUrls: [`${B}/rice-accent-a.webp`, `${B}/rice-accent-b.webp`],
    visibilityKey: "hero.show_rice",
    defaultVisible: true, // 현재 판매 제품 — 기본 노출
  },
  {
    slug: "cream-of-rice-choco",
    nameKo: "크림오브라이스 브라우니",
    subtitle: "브라우니맛 · 곧 출시",
    heroColor: "#4E3229",
    heroImageUrl: `${B}/brownie-bag.webp`,
    heroBackdropUrl: `${B}/brownie-backdrop.webp`,
    accentImageUrls: [`${B}/brownie-accent-a.webp`, `${B}/brownie-accent-b.webp`],
    visibilityKey: "hero.show_brownie",
    defaultVisible: false, // 예정 — 오픈 시 관리자에서 켠다
  },
  {
    slug: "cream-of-rice-peanut",
    nameKo: "크림오브라이스 피넛버터맛",
    subtitle: "고소한 피넛버터 · 곧 출시",
    heroColor: "#BE8A4F",
    heroImageUrl: `${B}/peanut-bag.webp`,
    heroBackdropUrl: `${B}/peanut-backdrop.webp`,
    accentImageUrls: [`${B}/peanut-accent-a.webp`, `${B}/peanut-accent-b.webp`],
    visibilityKey: "hero.show_peanut",
    defaultVisible: false, // 예정 — 오픈 시 관리자에서 켠다
  },
];
