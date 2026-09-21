"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import { useCart } from "@/store/cart";
import type { OrderView } from "@/types/order";

/**
 * 결제 확인(모바일 리다이렉트 복귀 지점).
 *
 * 모바일에서는 포트원 결제창이 페이지 이동으로 열리고, 끝나면 이 주소로 돌아온다.
 * 쿼리: paymentId(=주문번호), 실패 시 code·message.
 *   - 성공: 서버에 결제 확정을 요청한다. 확정은 서버가 포트원에 직접 조회해 검증한다.
 *   - 실패·취소: 잡아둔 재고를 풀고 장바구니는 그대로 둔다.
 */
export function CheckoutComplete() {
  const router = useRouter();
  const params = useSearchParams();
  const refresh = useCart((s) => s.refresh);
  const [failure, setFailure] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    // 개발 모드(StrictMode)의 이중 실행으로 결제 확정이 두 번 나가지 않게 한다.
    if (ran.current) return;
    ran.current = true;

    const orderNo = params.get("paymentId") ?? params.get("orderNo");
    const code = params.get("code");
    // 나이스페이는 서버가 승인·확정까지 마친 뒤 되돌려 보낸다.
    //   paid=1  확정 완료 — 확정 요청을 다시 보내지 않는다
    //   fail=…  인증 실패·창 닫기 — 잡아둔 재고를 풀어야 한다
    const nicePaid = params.get("paid") === "1";
    const niceFail = params.get("fail");
    if (!orderNo) {
      setFailure("주문 정보를 찾을 수 없습니다.");
      return;
    }
    const path = `/api/orders/${encodeURIComponent(orderNo)}`;
    const goDone = async () => {
      await refresh();
      router.replace(`/orders/${encodeURIComponent(orderNo)}?done=1`);
    };

    void (async () => {
      if (nicePaid) {
        await goDone();
        return;
      }
      if (niceFail) {
        await api.post(`${path}/cancel-pending`).catch(() => undefined);
        setFailure(niceFail);
        return;
      }
      if (code) {
        await api.post(`${path}/cancel-pending`).catch(() => undefined);
        setFailure(params.get("message") || "결제가 취소되었습니다.");
        return;
      }
      try {
        await api.post<OrderView>(`${path}/pay`, {});
        await goDone();
      } catch (e) {
        // 확정 요청 실패 — 서버가 포트원 상태를 다시 확인해, 실제로 결제됐으면 확정하고 아니면 정리한다.
        const view = await api.post<OrderView>(`${path}/cancel-pending`).catch(() => null);
        if (view?.status === "PAID") {
          await goDone();
          return;
        }
        setFailure(e instanceof ApiError ? e.message : "결제를 확인하지 못했습니다.");
      }
    })();
  }, [params, refresh, router]);

  if (!failure) {
    return (
      <p className="py-24 text-center font-kr text-sm text-ink-soft" role="status">
        결제를 확인하는 중입니다…
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <p className="font-kr text-lg font-bold text-ink">결제가 완료되지 않았습니다</p>
      <p className="mt-2 font-kr text-sm font-medium text-danger" role="alert">
        {failure}
      </p>
      <p className="mt-1 font-kr text-xs text-ink-soft">장바구니는 그대로 남아 있어요. 다시 시도해 주세요.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/checkout"
          className="rounded-full bg-ink px-6 py-3 font-kr text-sm font-bold text-cream-warm shadow-[0_8px_20px_rgba(34,30,28,0.22)] transition hover:-translate-y-0.5"
        >
          다시 결제하기
        </Link>
        <Link
          href="/cart"
          className="rounded-full border border-ink/40 px-6 py-3 font-kr text-sm font-medium text-ink transition hover:-translate-y-0.5"
        >
          장바구니
        </Link>
      </div>
    </div>
  );
}
