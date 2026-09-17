/**
 * 화면에 링크·이미지로 내보낼 주소를 거른다.
 *
 * 관리자가 넣은 값(SNS 링크, 외부 판매 채널, 배경 사진 주소)이 그대로 href·src 가 된다.
 * 여기서 걸러내지 않으면 "javascript:..." 같은 값이 링크로 걸려, 그 페이지를 보는
 * 손님의 로그인 상태로 무엇이든 실행할 수 있다.
 *
 * 서버에서도 저장할 때 같은 기준으로 막지만(SiteSettingService), 이미 들어와 있는 값과
 * 다른 경로로 들어온 값까지 화면에서 한 번 더 막는다.
 *
 * @returns 쓸 수 있는 주소, 아니면 undefined (호출한 쪽이 렌더를 건너뛴다)
 */
export function safeUrl(value: string | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const url = value.trim();
  if (!url) {
    return undefined;
  }
  // 우리 서버 안의 경로. "//evil.com" 과 "/\evil.com"(브라우저가 // 로 읽는다)은 바깥 주소라 막는다.
  if (url.startsWith("/")) {
    return /^\/[/\\]/.test(url) ? undefined : url;
  }
  return /^https?:\/\//i.test(url) ? url : undefined;
}
