/**
 * 공개 헤더의 네비게이션 항목. 두 헤더(히어로·공개페이지)가 공유한다.
 *
 * 로그인/마이페이지는 로그인 상태에 따라 하나만 보여야 하므로
 * 여기 두지 않고 MemberNavLink 가 맡는다.
 */
export const storeNav: { href: string; label: string }[] = [
  { href: "/products", label: "상품" },
  { href: "/reviews", label: "후기" },
  { href: "/notice", label: "공지사항" },
];
