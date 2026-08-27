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
  price: number;
  discountPrice: number | null;
  effectivePrice: number;
  weightG: number | null;
  servings: number | null;
  stock: number;
  soldOut: boolean;
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
  featured: boolean;
  visible: boolean;
  images?: { imageKey: string; altText?: string | null; type: string; sortOrder: number }[];
  ingredients?: { name: string; percentage?: number | null; origin?: string | null; allergen?: string | null; sortOrder: number }[];
  nutrition?: Nutrition & { servingSizeG: number } | null;
  label?: ProductLabel | null;
  purchaseLinks?: { channel: string; url: string; label?: string | null; sortOrder: number; visible: boolean }[];
};
