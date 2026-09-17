export type AdminMe = {
  /** 로그인 직후 응답에는 없고, /me 에는 있다. */
  id?: number;
  displayName: string;
  role: string;
};

/** 관리자 관리 화면의 계정 한 줄 */
export type AdminAccount = {
  id: number;
  username: string;
  displayName: string;
  role: "ADMIN" | "SUPER_ADMIN";
  enabled: boolean;
  locked: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};
