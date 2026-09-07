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
