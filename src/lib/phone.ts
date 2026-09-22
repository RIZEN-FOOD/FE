/**
 * 전화번호 표기.
 *
 * 손님이 숫자만 눌러도 화면에서 하이픈이 알아서 끼워진다. 띄어쓰기나 점을 섞어 넣어도
 * 숫자만 남기므로 "형식이 올바르지 않습니다"로 거부당하는 일이 줄어든다.
 *
 * 서버 규칙은 `^01[016789]-?\d{3,4}-?\d{4}$` 라 하이픈이 있어도 없어도 통과하지만,
 * 화면에서 모양을 맞춰 두면 손님이 잘못 넣었는지 바로 눈으로 안다.
 */

/** 휴대폰 번호 자리수 상한. 010-1234-5678 = 11자리. */
const MOBILE_MAX = 11;

/**
 * 입력하는 동안 부르는 함수. 지우는 중에도 자연스럽게 동작하도록,
 * 하이픈은 "뒷자리가 실제로 있을 때만" 붙인다.
 *
 *   0101234      → 010-1234
 *   01012345678  → 010-1234-5678
 *   010 1234 567 → 010-1234-567
 */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, MOBILE_MAX);

  // 서울 지역번호(02)는 앞자리가 2개다. 고객센터 번호를 넣는 화면에서도 쓰려고 함께 다룬다.
  if (digits.startsWith("02")) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/** 숫자만. 서버로 보내거나 대조할 때 쓴다. */
export function phoneDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}
