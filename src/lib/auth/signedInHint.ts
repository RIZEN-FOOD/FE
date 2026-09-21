/**
 * 로그인 표식 쿠키.
 *
 * 서버가 로그인할 때 심고 로그아웃할 때 지운다. 토큰이 아니라 **물어볼 가치가 있는지**만
 * 알려주는 표식이라 자바스크립트가 읽을 수 있다.
 *
 * 이게 없으면 손님이 사이트를 열 때마다 /api/auth/me 와 /api/auth/refresh 가 401 로 떨어져
 * 콘솔이 빨갛게 찬다. 진짜 오류가 그 사이에 묻힌다.
 *
 * ★ 이 값으로 무엇도 허용하지 않는다. 화면을 그릴지 말지는 서버가 준 /me 응답으로 정한다.
 *   손으로 이 쿠키를 만들어도 /me 는 그대로 401 이다.
 */
const HINT = "rizen_member_signed_in";

export function hasSignedInHint(): boolean {
  if (typeof document === "undefined") {
    return false; // 서버 렌더링 중에는 판단하지 않는다
  }
  return document.cookie.split("; ").some((c) => c.startsWith(`${HINT}=1`));
}
