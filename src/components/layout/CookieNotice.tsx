"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * 쿠키 사용 안내 (2026-09-29).
 *
 * 처음 온 방문자에게 한 번만 하단에 띄우고, «확인»을 누르면 다시 띄우지 않는다.
 *
 * ★ 동의를 «받는» 창이 아니라 «알리는» 창이다. 이 사이트가 심는 쿠키는 장바구니(rizen_cart)와
 *   로그인 유지(rizen_member_*, rizen_admin_token)뿐이고 전부 서비스에 꼭 필요한 것이다.
 *   분석·광고 쿠키가 없으니 거부 버튼을 두면 거짓말이 된다(거부해도 끌 쿠키가 없다).
 *   나중에 방문 분석이나 광고 픽셀을 붙이면 그때는 이 창을 «동의/거부»로 바꾸고,
 *   동의 전에는 그 스크립트를 싣지 않아야 한다.
 * ★ 문구는 개인정보처리방침의 «자동 수집: 쿠키» 항목과 같은 이야기를 한다. 한쪽을 고치면 둘 다 고친다.
 * ★ 주문서·장바구니·관리자에서는 띄우지 않는다. 결제 버튼 위를 가리면 안 된다.
 */

const STORAGE_KEY = "rizen_cookie_notice_v1";
const HIDDEN_PREFIXES = ["/checkout", "/cart", "/admin"];

export function CookieNotice() {
  // 서버 렌더에서는 항상 안 보인다. 브라우저에서 저장 여부를 확인한 뒤에만 띄운다 —
  // 이미 확인한 사람에게 한 번 번쩍였다 사라지는 일이 없게.
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== "1") setOpen(true);
    } catch {
      // 사생활 보호 모드 등으로 저장소를 못 쓰면 매번 뜨는 것보다 안 뜨는 편이 낫다.
    }
  }, []);

  const hidden = HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!open || hidden) return null;

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // 저장에 실패해도 이번 방문에서는 닫는다.
    }
    setOpen(false);
  }

  return (
    <div
      role="region"
      aria-label="쿠키 사용 안내"
      className="fixed inset-x-0 bottom-0 z-[60] animate-[rz-cookie-in_var(--dur-slow)_var(--ease-out)_both] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:inset-x-auto md:bottom-6 md:left-6 md:max-w-[420px] md:px-0 md:pb-0"
    >
      <div className="flex items-center gap-4 rounded-none bg-ink px-5 py-4 text-cream-warm shadow-[0_10px_28px_rgba(34,30,28,0.28)]">
        <p className="min-w-0 flex-1 font-kr text-caption leading-relaxed text-cream-warm/85">
          로그인 유지와 장바구니에 꼭 필요한 쿠키만 사용합니다.{" "}
          <Link
            href="/policy/privacy"
            className="font-medium text-cream-warm underline underline-offset-4 hover:text-white"
          >
            개인정보처리방침
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-[6px] bg-cream-warm px-4 py-2 font-kr text-sm font-bold text-ink transition active:scale-[0.98] hover:bg-white"
        >
          확인
        </button>
      </div>
    </div>
  );
}
