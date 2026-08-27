/**
 * 관리자 사이드바 메뉴.
 *
 * ready=false 인 항목은 아직 백엔드가 없어 화면만 자리를 잡아둔 것이다.
 * 없는 척 숨기기보다 "준비 중"으로 보여줘야 대표가 전체 그림을 안다.
 */
export type NavItem = {
  href: string;
  label: string;
  ready: boolean;
};

export const adminNav: NavItem[] = [
  { href: "/admin", label: "대시보드", ready: true },
  { href: "/admin/products", label: "상품 관리", ready: true },
  { href: "/admin/banners", label: "배너 관리", ready: false },
  { href: "/admin/notice", label: "공지사항", ready: false },
  { href: "/admin/members", label: "회원 관리", ready: false },
  { href: "/admin/inquiries", label: "문의함", ready: false },
  { href: "/admin/settings", label: "사이트 설정", ready: false },
];
