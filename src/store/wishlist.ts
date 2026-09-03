import { create } from "zustand";

import { api } from "@/lib/api/client";

/**
 * 위시리스트(찜) 전역 상태. 회원 전용.
 *
 * 찜한 상품 id 집합만 들고 있어 상품 카드·상세의 하트 상태를 즉시 반영한다.
 * 비회원이면 서버가 401 을 주므로 조용히 빈 상태로 둔다(하트는 로그인 유도).
 */
type WishlistState = {
  ids: Set<number>;
  loaded: boolean;
  refresh: () => Promise<void>;
  has: (productId: number) => boolean;
  toggle: (productId: number) => Promise<boolean>; // 반환: 담김 여부
};

export const useWishlist = create<WishlistState>((set, get) => ({
  ids: new Set(),
  loaded: false,

  async refresh() {
    try {
      const ids = await api.get<number[]>("/api/member/wishlist/ids");
      set({ ids: new Set(ids), loaded: true });
    } catch {
      set({ loaded: true }); // 비로그인 등 — 빈 상태
    }
  },

  has(productId) {
    return get().ids.has(productId);
  },

  async toggle(productId) {
    const on = get().ids.has(productId);
    if (on) {
      await api.delete(`/api/member/wishlist/${productId}`);
      set((s) => {
        const next = new Set(s.ids);
        next.delete(productId);
        return { ids: next };
      });
      return false;
    }
    await api.post(`/api/member/wishlist/${productId}`);
    set((s) => {
      const next = new Set(s.ids);
      next.add(productId);
      return { ids: next };
    });
    return true;
  },
}));
