import { create } from "zustand";

import { api } from "@/lib/api/client";
import type { CartView } from "@/types/cart";

/**
 * 장바구니 전역 상태.
 *
 * 모든 장바구니 API 는 최신 CartView 를 그대로 돌려준다. 그래서 담기·수정·삭제
 * 후 응답을 그대로 상태에 넣으면 화면·헤더 배지가 한 번에 최신화된다.
 *
 * 인증은 HttpOnly 쿠키(회원 토큰 또는 게스트 장바구니 토큰)로 오간다.
 * 이 스토어는 토큰을 만지지 않는다 — api 클라이언트가 credentials 로 쿠키를 싣는다.
 *
 * add/updateQty/remove 는 실패 시 ApiError 를 그대로 던진다.
 * 재고 부족·품절 같은 사유 문구를 화면이 받아서 보여줄 수 있게 하기 위해서다.
 */
type CartState = {
  cart: CartView | null;
  /** 최초 1회 서버와 동기화했는지. 배지가 깜빡이지 않게 하는 데 쓴다. */
  loaded: boolean;
  refresh: () => Promise<void>;
  add: (productId: number, quantity: number, optionId?: number | null) => Promise<void>;
  updateQty: (itemId: number, quantity: number) => Promise<void>;
  remove: (itemId: number) => Promise<void>;
  clear: () => Promise<void>;
};

export const useCart = create<CartState>((set) => ({
  cart: null,
  loaded: false,

  async refresh() {
    try {
      const cart = await api.get<CartView>("/api/cart");
      set({ cart, loaded: true });
    } catch {
      // 조회 실패(네트워크 등)는 조용히 넘긴다. 배지가 없을 뿐이다.
      set({ loaded: true });
    }
  },

  async add(productId, quantity, optionId) {
    const cart = await api.post<CartView>("/api/cart/items", {
      productId,
      optionId: optionId ?? null,
      quantity,
    });
    set({ cart, loaded: true });
  },

  async updateQty(itemId, quantity) {
    const cart = await api.patch<CartView>(`/api/cart/items/${itemId}`, { quantity });
    set({ cart, loaded: true });
  },

  async remove(itemId) {
    const cart = await api.delete<CartView>(`/api/cart/items/${itemId}`);
    set({ cart, loaded: true });
  },

  async clear() {
    const cart = await api.delete<CartView>("/api/cart");
    set({ cart, loaded: true });
  },
}));
