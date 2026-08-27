"use client";

import { create } from "zustand";
import { api, ApiError } from "@/lib/api/client";
import type { AdminMe } from "@/types/auth";

/**
 * 관리자 인증 상태.
 *
 * 토큰은 HttpOnly 쿠키에 있어 자바스크립트가 볼 수 없다.
 * 그래서 "로그인됐는지"는 토큰을 읽어서가 아니라 /me 응답으로 판단한다.
 */
type AdminAuthState = {
  me: AdminMe | null;
  /** 첫 인증 확인이 끝났는지. 확인 전에는 화면을 그리지 않는다. */
  ready: boolean;
  checkAuth: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAdminAuth = create<AdminAuthState>((set) => ({
  me: null,
  ready: false,

  async checkAuth() {
    try {
      const me = await api.get<AdminMe>("/api/admin/auth/me");
      set({ me, ready: true });
    } catch {
      // 401 이면 로그인 안 된 상태. 오류로 다루지 않는다.
      set({ me: null, ready: true });
    }
  },

  async login(username, password) {
    try {
      const me = await api.post<AdminMe>("/api/admin/auth/login", { username, password });
      set({ me });
    } catch (e) {
      // 메시지는 서버가 준 그대로 쓴다 (잠금 안내 등).
      if (e instanceof ApiError) {
        throw new Error(e.message);
      }
      throw new Error("로그인 중 문제가 발생했습니다.");
    }
  },

  async logout() {
    try {
      await api.post("/api/admin/auth/logout");
    } finally {
      set({ me: null });
    }
  },
}));
