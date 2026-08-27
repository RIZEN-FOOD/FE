/**
 * 공개 헤더의 네비게이션 항목. 두 헤더(히어로·공개페이지)가 공유한다.
 */
export const storeNav: { href: string; label: string }[] = [
  { href: "/products", label: "상품" },
  { href: "/notice", label: "공지사항" },
  { href: "/auth/login", label: "로그인" },
  { href: "/mypage", label: "마이페이지" },
];
