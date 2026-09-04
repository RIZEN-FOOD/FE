/** 백엔드 MemberDtos·ReviewDtos·InquiryDtos 와 대응. 서버 계약이 바뀌면 함께 고친다. */

export type MemberMe = {
  id: number;
  email: string;
  name: string;
  provider: string;
};

export type SignupPayload = {
  email: string;
  password: string;
  name: string;
  phone?: string;
  agreeRequired: boolean;
  ageOver14: boolean;
  agreeMarketing: boolean;
};

export type ReviewItem = {
  id: number;
  authorName: string;
  rating: number;
  content: string;
  verifiedPurchase: boolean;
  sponsored: boolean;
  imageUrls: string[];
  createdAt: string;
  productSlug: string;
  productName: string;
  productThumbnailUrl: string | null;
};

export type ReviewPage = {
  items: ReviewItem[];
  page: number;
  totalPages: number;
  totalCount: number;
};

export type ReviewStats = {
  average: number;
  count: number;
};

export type InquiryItem = {
  id: number;
  type: string;
  name: string;
  message: string;
  answer: string | null;
  answeredAt: string | null;
  status: string;
  createdAt: string;
};

export type InquiryPage = {
  items: InquiryItem[];
  page: number;
  totalPages: number;
  totalCount: number;
};

export const INQUIRY_TYPES: { value: string; label: string }[] = [
  { value: "GENERAL", label: "일반 문의" },
  { value: "WHOLESALE", label: "대량 구매" },
  { value: "PARTNERSHIP", label: "제휴 제안" },
  { value: "ORDER", label: "주문 관련" },
];

export const INQUIRY_STATUS_LABEL: Record<string, string> = {
  PENDING: "답변 대기",
  ANSWERED: "답변 완료",
  CLOSED: "종료",
};

// ── 관리자: 회원 관리 ──────────────────────────────

export type AdminMemberListItem = {
  id: number;
  email: string;
  name: string;
  provider: string; // LOCAL | kakao | naver
  status: string; // ACTIVE | SUSPENDED | WITHDRAWN
  locked: boolean;
  phoneMasked: string | null;
  lastLoginAt: string | null;
  createdAt: string;
};

export type AdminMemberPage = {
  items: AdminMemberListItem[];
  page: number;
  totalPages: number;
  totalCount: number;
};

export type AdminMemberRecentOrder = {
  orderNo: string;
  status: string;
  totalAmount: number;
  orderedAt: string;
};

export type AdminMemberOrderSummary = {
  count: number;
  recent: AdminMemberRecentOrder | null;
};

export type AdminMemberDetail = {
  id: number;
  email: string;
  name: string;
  provider: string;
  status: string;
  locked: boolean;
  lockedUntil: string | null;
  failedCount: number;
  phoneMasked: string | null;
  hasPhone: boolean;
  termsAgreedAt: string | null;
  privacyAgreedAt: string | null;
  marketingAgreedAt: string | null;
  ageVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  withdrawnAt: string | null;
  orders: AdminMemberOrderSummary;
};

export const MEMBER_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "활성",
  SUSPENDED: "정지",
  WITHDRAWN: "탈퇴",
};

export const MEMBER_PROVIDER_LABEL: Record<string, string> = {
  LOCAL: "이메일",
  kakao: "카카오",
  naver: "네이버",
};
