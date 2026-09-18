/**
 * 백엔드 응답 형태 (BE ProductDtos 와 대응).
 * 서버 계약이 바뀌면 여기와 함께 고친다.
 */

export type ProductListItem = {
  id: number;
  slug: string;
  nameKo: string;
  nameEn: string | null;
  subtitle: string | null;
  price: number;
  discountPrice: number | null;
  effectivePrice: number;
  weightG: number | null;
  soldOut: boolean;
  featured: boolean;
  thumbnailUrl: string | null;
};

export type ProductImage = {
  url: string;
  baseKey: string;
  altText: string | null;
  type: string;
};

export type ProductOption = {
  id: number;
  name: string;
  price: number;
  stock: number;
  soldOut: boolean;
};

export type Nutrition = {
  servingSizeG: number | null;
  kcal: number | null;
  carbG: number | null;
  proteinG: number | null;
  fatG: number | null;
  sugarG: number | null;
  sodiumMg: number | null;
};

export type Ingredient = {
  name: string;
  percentage: number | null;
  origin: string | null;
  allergen: string | null;
};

export type ProductLabel = {
  foodType: string | null;
  shelfLife: string | null;
  storageMethod: string | null;
  manufacturer: string | null;
  manufacturerAddr: string | null;
  seller: string | null;
  sellerAddr: string | null;
  customerService: string | null;
  packageMaterial: string | null;
  extraNotice: string | null;
  // 상품정보 고시 (V21)
  brand?: string | null;
  origin?: string | null;
  grainType?: string | null;
  calorieInfo?: string | null;
};

export type PurchaseLink = {
  channel: string;
  url: string;
  label: string | null;
};

export type ProductDetail = {
  id: number;
  slug: string;
  nameKo: string;
  nameEn: string | null;
  subtitle: string | null;
  descriptionHtml: string | null;
  thumbnailKey: string | null;
  heroColor: string | null;
  heroImageKey: string | null;
  heroImageUrl: string | null;
  heroAccent1Key: string | null;
  heroAccent1Url: string | null;
  heroAccent2Key: string | null;
  heroAccent2Url: string | null;
  heroBackdropKey: string | null;
  heroBackdropUrl: string | null;
  price: number;
  discountPrice: number | null;
  effectivePrice: number;
  weightG: number | null;
  servings: number | null;
  stock: number;
  soldOut: boolean;
  /** 관리자 수동 품절 플래그(재고와 무관). 폼 토글용. */
  soldOutManual: boolean;
  featured: boolean;
  visible: boolean;
  images: ProductImage[];
  options: ProductOption[];
  nutrition: Nutrition | null;
  ingredients: Ingredient[];
  label: ProductLabel | null;
  purchaseLinks: PurchaseLink[];
};

/** 관리자 목록 한 줄. 공개 목록과 달리 재고·노출 여부를 담는다. */
export type AdminProductListItem = {
  id: number;
  slug: string;
  nameKo: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  soldOut: boolean;
  featured: boolean;
  visible: boolean;
  sortOrder: number;
  thumbnailUrl: string | null;
};

export type AdminProductPage = {
  items: AdminProductListItem[];
  page: number;
  totalPages: number;
  totalCount: number;
};

/** 폼이 서버로 보내는 형태 (BE SaveRequest 와 대응) */
export type ProductSaveRequest = {
  slug: string;
  nameKo: string;
  nameEn?: string | null;
  subtitle?: string | null;
  descriptionHtml?: string | null;
  price: number;
  discountPrice?: number | null;
  weightG?: number | null;
  servings?: number | null;
  stock?: number | null;
  thumbnailKey?: string | null;
  heroColor?: string | null;
  heroImageKey?: string | null;
  heroAccent1Key?: string | null;
  heroAccent2Key?: string | null;
  heroBackdropKey?: string | null;
  soldOut: boolean;
  featured: boolean;
  visible: boolean;
  images?: { imageKey: string; altText?: string | null; type: string; sortOrder: number }[];
  ingredients?: { name: string; percentage?: number | null; origin?: string | null; allergen?: string | null; sortOrder: number }[];
  nutrition?: Nutrition & { servingSizeG: number } | null;
  label?: ProductLabel | null;
  purchaseLinks?: { channel: string; url: string; label?: string | null; sortOrder: number; visible: boolean }[];
};

// ── 관리자: 메인 히어로 배너 관리 ──────────────────────
export type HeroBannerRow = {
  id: number;
  slug: string;
  productName: string;
  headline: string;
  heroImageUrl: string | null;
  heroColor: string | null;
  heroSort: number;
  heroEnabled: boolean;
  soldOut: boolean;
};

export type HeroBannerDetail = {
  id: number;
  slug: string;
  productName: string;
  heroHeadline: string | null;
  heroSubcopy: string | null;
  defaultHeadline: string;
  defaultSubcopy: string | null;
  heroColor: string | null;
  heroImageKey: string | null;    heroImageUrl: string | null;    // 메인 이미지
  heroBackdropKey: string | null; heroBackdropUrl: string | null; // 구성1 — 기둥
  heroAccent1Key: string | null;  heroAccent1Url: string | null;  // 구성2 — 우상단
  heroAccent3Key: string | null;  heroAccent3Url: string | null;  // 구성3 — 우하단
  heroAccent2Key: string | null;  heroAccent2Url: string | null;  // 구성4 — 좌하단
  heroSort: number;
  heroEnabled: boolean;
};

export type HeroBannerSaveRequest = {
  heroHeadline?: string | null;
  heroSubcopy?: string | null;
  heroColor?: string | null;
  heroImageKey?: string | null;
  heroBackdropKey?: string | null;
  heroAccent1Key?: string | null;
  heroAccent3Key?: string | null;
  heroAccent2Key?: string | null;
  heroSort: number;
  heroEnabled: boolean;
};

// ── 메인 히어로 캐러셀 슬라이드 ──────────────────────
/** 히어로 영양성분 — 관리자 상품 화면에서 입력한 값 (서버는 소수를 문자열로 줄 수 있다) */
export type HeroNutritionData = {
  servingSizeG: number | string | null;
  kcal: number | string | null;
  carbG: number | string | null;
  proteinG: number | string | null;
  fatG: number | string | null;
  sugarG: number | string | null;
  sodiumMg: number | string | null;
};

export type HeroSlide = {
  id: number;
  slug: string;
  nameKo: string;
  subtitle: string | null;
  effectivePrice: number;
  soldOut: boolean;
  heroColor: string | null;   // #RRGGBB, 없으면 프론트 기본색
  heroImageUrl: string | null; // 메인 이미지(제품 봉투). 없으면 대표 이미지 폴백
  heroBackdropUrl: string | null; // 구성1 — 기둥(제품 뒤 스플래시)
  // 구성 장식. 고정 순서 [우상단, 우하단, 좌하단]. 없는 자리는 null.
  accentImageUrls: (string | null)[];
  /** 상세 페이지로 보낼 수 있는지(상품 공개 여부). 출시 예정처럼 비공개면 false. */
  linkable: boolean;
  /** 배너 아래 영양성분 그래프용. 입력이 없으면 null. */
  nutrition: HeroNutritionData | null;
};
