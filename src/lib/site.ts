/**
 * 사이트 공개 주소(도메인).
 *
 * sitemap·robots·메타데이터의 절대 URL 기준이다.
 * 실제 도메인은 배포 시 NEXT_PUBLIC_SITE_URL 로 넣는다. (미설정이면 로컬 개발 주소)
 * 도메인 확정은 배포 단계의 일이라, 여기서 값을 하드코딩하지 않는다.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

/**
 * 공유 미리보기(OG)·구조화 데이터에 넣을 절대 주소.
 *
 * 업로드 사진은 도메인 없이 "/uploads/..." 로 저장된다 — 개발·운영에서 주소가 달라지지
 * 않게 하려는 것이다. 다만 카카오톡·검색엔진에 보내는 주소는 절대 주소여야 한다.
 */
export function absoluteUrl(path: string | null | undefined): string {
  if (!path) {
    return "";
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return SITE_URL + (path.startsWith("/") ? path : "/" + path);
}
