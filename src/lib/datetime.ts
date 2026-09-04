/**
 * 날짜·시각 변환.
 *
 * 서버는 ISO(UTC)로 주고받는다. 화면의 datetime-local 입력은 로컬 시각을 다룬다.
 * 두 세계를 오갈 때 항상 여기를 거친다. 직접 문자열을 자르지 않는다.
 */

/** ISO(UTC) → datetime-local 입력값 (로컬 시각) */
export function toDateTimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** datetime-local 입력값 → ISO(UTC) */
export function fromDateTimeLocal(local: string): string | null {
  if (!local) return null;
  return new Date(local).toISOString();
}

/** ISO → 사람이 읽는 표기 (예: 2026. 8. 27. 14:00) */
export function formatDateTime(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}. ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ISO → 날짜만 (예: 2026. 8. 27.) */
export function formatDate(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}
