"use client";

import { create } from "zustand";
import { api, ApiError } from "@/lib/api/client";
import { hasSignedInHint } from "@/lib/auth/signedInHint";
import type { MemberMe, SignupPayload } from "@/types/member";

/**
 * 회원 인증 상태.
 *
 * 관리자 스토어와 같은 원칙 — 토큰은 HttpOnly 쿠키에 있어 JS 가 볼 수 없다.
 * "로그인됐는지"는 토큰을 읽어서가 아니라 /me 응답으로 판단한다.
 *
 * access 토큰은 30분이라 만료가 흔하다. 401 을 받으면 한 번 refresh 를
 * 시도하고, 그래도 안 되면 로그아웃 상태로 본다.
 *
 * ★ checkAuth 는 같은 순간에 여러 번 불린다 — 헤더가 PC용·모바일용 요소를 함께 그리고,
 *   개발 모드(React Strict Mode)에서는 효과가 두 번 실행된다. 진행 중인 요청을 공유해
 *   한 번만 나가게 한다.
 * ★ 로그인한 적 없는 손님은 아예 묻지 않는다(표식 쿠키). 401 두 번이 콘솔에 남지 않는다.
 */
type MemberAuthState = {
  me: MemberMe | null;
  /** 첫 인증 확인이 끝났는지. 확인 전에는 화면을 그리지 않는다. */
  ready: boolean;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
};

/** 진행 중인 확인 요청. 같은 순간에 여러 번 불려도 한 번만 나가게 공유한다. */
let inFlight: Promise<void> | null = null;

export const useMemberAuth = create<MemberAuthState>((set) => ({
  me: null,
  ready: false,

  checkAuth() {
    if (inFlight) {
      return inFlight;
    }
    inFlight = runCheck(set).finally(() => {
      inFlight = null;
    });
    return inFlight;
  },

  async login(email, password) {
    try {
      const me = await api.post<MemberMe>("/api/auth/login", { email, password });
      set({ me });
    } catch (e) {
      // 서버 메시지를 그대로 쓴다 (잠금 안내·남은 시도 횟수 등).
      throw new Error(e instanceof ApiError ? e.message : "로그인 중 문제가 발생했습니다.");
    }
  },

  async signup(payload) {
    try {
      const me = await api.post<MemberMe>("/api/auth/signup", payload);
      set({ me });
    } catch (e) {
      if (e instanceof ApiError) {
        // 검증 실패면 첫 필드 메시지가 e.message 에 들어 있다.
        throw new Error(e.message);
      }
      throw new Error("가입 중 문제가 발생했습니다.");
    }
  },

  async logout() {
    try {
      await api.post("/api/auth/logout");
    } finally {
      set({ me: null });
    }
  },
}));

/**
 * 실제 확인 절차.
 *
 * 로그인한 적 없는 브라우저는 표식 쿠키가 없으니 요청을 한 번도 보내지 않는다.
 * 표식이 있는데 access 가 만료됐으면 refresh 로 한 번 되살려 본다.
 */
async function runCheck(set: (partial: Partial<MemberAuthState>) => void): Promise<void> {
  if (!hasSignedInHint()) {
    set({ me: null, ready: true });
    return;
  }
  try {
    set({ me: await api.get<MemberMe>("/api/auth/me"), ready: true });
    return;
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      try {
        await api.post("/api/auth/refresh");
        set({ me: await api.get<MemberMe>("/api/auth/me"), ready: true });
        return;
      } catch {
        // refresh 도 실패 — 정말 로그아웃 상태다.
      }
    }
    set({ me: null, ready: true });
  }
}
