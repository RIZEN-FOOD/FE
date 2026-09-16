import { NextResponse, type NextRequest } from "next/server";

/**
 * 관리자 화면 1차 관문.
 *
 * 로그인 쿠키가 아예 없으면 관리자 화면을 내려주지 않고 로그인으로 보낸다.
 * 쿠키가 있다고 로그인된 것은 아니다 — 진짜 검사는 서버(API)가 한다.
 * 이건 로그인하지 않은 사람에게 관리자 화면 구성과 주소가 통째로 노출되지 않게 하는 방어선이다.
 *
 * ★ 화면단 검사만으로는 보호가 되지 않는다(끄면 그만이다). 관리 API 는 전부 서버에서
 *   @PreAuthorize 로 다시 막는다. 여기는 그 앞단일 뿐이다.
 */
const ADMIN_COOKIE = "rizen_admin_token";

export function middleware(request: NextRequest) {
  const hasAdminCookie = Boolean(request.cookies.get(ADMIN_COOKIE)?.value);
  if (hasAdminCookie) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // /admin 아래 전부. 로그인 화면과 Next 내부 경로는 뺀다.
  matcher: ["/admin/((?!login).*)", "/admin"],
};
