/**
 * 배너·공지 응답 형태 (BE BannerDtos / NoticeDtos 와 대응).
 */

export type BannerAdminItem = {
  id: number;
  title: string;
  imagePcUrl: string | null;
  imageMobileUrl: string | null;
  imagePcKey: string;
  imageMobileKey: string;
  altText: string;
  linkUrl: string | null;
  position: string;
  openNewTab: boolean;
  alwaysOn: boolean;
  startAt: string | null;
  endAt: string | null;
  sortOrder: number;
  visible: boolean;
  activeNow: boolean;
};

export type BannerSaveRequest = {
  title: string;
  imagePcKey: string;
  imageMobileKey: string;
  altText: string;
  linkUrl: string;
  position: string;
  openNewTab: boolean;
  alwaysOn: boolean;
  startAt: string | null;
  endAt: string | null;
  visible: boolean;
};

export type NoticeAdminItem = {
  id: number;
  category: string;
  title: string;
  bodyHtml: string;
  pinned: boolean;
  viewCount: number;
  publishedAt: string | null;
  visible: boolean;
  publicNow: boolean;
  createdAt: string;
};

export type NoticeAdminPage = {
  items: NoticeAdminItem[];
  page: number;
  totalPages: number;
  totalCount: number;
};

export type NoticeSaveRequest = {
  category: string;
  title: string;
  bodyHtml: string;
  pinned: boolean;
  publishedAt: string | null;
  visible: boolean;
};

export const BANNER_POSITIONS: { value: string; label: string }[] = [
  { value: "MAIN_TOP", label: "메인 상단" },
  { value: "MAIN_MID", label: "메인 중단" },
  { value: "PRODUCT_TOP", label: "상품 페이지 상단" },
];

export const NOTICE_CATEGORIES: { value: string; label: string }[] = [
  { value: "NOTICE", label: "공지" },
  { value: "EVENT", label: "이벤트" },
  { value: "INFO", label: "안내" },
];
