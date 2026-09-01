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
