/** 팝업. 백엔드 PopupDtos 와 맞춘다. */

export type PopupPublic = {
  id: number;
  title: string;
  imageUrl: string | null;
  showHideToday: boolean;
  showLinkButton: boolean;
  linkUrl: string | null;
  /** 내용이 바뀌면 달라진다 — "오늘 하루 보지 않기" 기억에 함께 쓴다 */
  version: number;
};

export type PopupAdminItem = {
  id: number;
  title: string;
  imageUrl: string | null;
  imageKey: string;
  showHideToday: boolean;
  showLinkButton: boolean;
  linkUrl: string | null;
  alwaysOn: boolean;
  startAt: string | null;
  endAt: string | null;
  sortOrder: number;
  visible: boolean;
  activeNow: boolean;
};

export type PopupSaveRequest = {
  title: string;
  imageKey: string;
  showHideToday: boolean;
  showLinkButton: boolean;
  linkUrl: string;
  alwaysOn: boolean;
  startAt: string | null;
  endAt: string | null;
  visible: boolean;
};

/** 사이트 안 주소(/…) 또는 http(s) 주소. 서버 PopupDtos.LINK_PATTERN 과 같다. */
export function isAllowedPopupLink(v: string): boolean {
  if (!v) return true;
  return /^https?:\/\/\S+$/i.test(v) || /^\/(?![/\\])\S*$/.test(v);
}
