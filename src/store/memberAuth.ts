"use client";

import { create } from "zustand";
import { api, ApiError } from "@/lib/api/client";
import type { MemberMe, SignupPayload } from "@/types/member";

/**
 * 회원 인증 상태.
 *
 * 관리자 스토어와 같은 원칙 — 토큰은 HttpOnly 쿠키에 있어 JS 가 볼 수 없다.
 * "로그인됐는지"는 토큰을 읽어서가 아니라 /me 응답으로 판단한다.
 *
 * access 토큰은 30분이라 만료가 흔하다. 401 을 받으면 한 번 refresh 를
 * 시도하고, 그래도 안 되면 로그아웃 상태로 본다.
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

export const useMemberAuth = create<MemberAuthState>((set) => ({
  me: null,
  ready: false,

  async checkAuth() {
    try {
      const me = await api.get<MemberMe>("/api/auth/me");
      set({ me, ready: true });
      return;
    } catch (e) {
      // access 가 만료됐을 수 있다. refresh 로 한 번 되살려본다.
      if (e instanceof ApiError && e.status === 401) {
        try {
          await api.post("/api/auth/refresh");
          const me = await api.get<MemberMe>("/api/auth/me");
          set({ me, ready: true });
          return;
        } catch {
          // refresh 도 실패 — 정말 로그아웃 상태다.
        }
      }
      set({ me: null, ready: true });
    }
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
