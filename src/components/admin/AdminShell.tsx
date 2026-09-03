"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { BrandLogo } from "@/components/ui";
import { useAdminAuth } from "@/store/adminAuth";
import { adminNav } from "./nav";

/**
 * 관리자 공통 껍데기. 인증 가드 + 사이드바 + 상단바.
 *
 * 첫 렌더에서 /me 로 로그인 여부를 확인한다.
 * 확인 전에는 아무것도 그리지 않아 로그인 화면이 깜빡이지 않게 한다.
 * 로그인 안 돼 있으면 로그인 페이지로 보낸다.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { me, ready, checkAuth, logout } = useAdminAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!ready) checkAuth();
  }, [ready, checkAuth]);

  useEffect(() => {
    if (ready && !me) router.replace("/admin/login");
  }, [ready, me, router]);

  // 라우트가 바뀌면 모바일 메뉴를 닫는다.
  useEffect(() => setMenuOpen(false), [pathname]);

  if (!ready || !me) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-cream">
        <p className="font-kr text-sm text-ink-faint">불러오는 중…</p>
      </div>
    );
  }

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="관리자 메뉴">
      {adminNav.map((item) => {
        const active = item.href === "/admin"
          ? pathname === "/admin"
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.ready ? item.href : "#"}
            aria-disabled={!item.ready}
            onClick={(e) => !item.ready && e.preventDefault()}
            className={cn(
              "flex items-center justify-between rounded-[3px] px-3 py-2 font-kr text-sm transition",
              item.ready
                ? active
                  ? "bg-ink text-cream-warm"
                  : "text-ink hover:bg-clay-soft/40"
                : "cursor-default text-ink-faint",
            )}
          >
            {item.label}
            {!item.ready && (
              <span className="rounded-full bg-line px-1.5 py-0.5 font-en text-[9px] font-bold uppercase tracking-wide text-ink-faint">
                준비 중
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-svh bg-cream">
      {/* 상단바 */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/95 px-4 py-3 backdrop-blur md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-[3px] p-1.5 text-ink hover:bg-clay-soft/40 md:hidden"
            aria-label="메뉴 열기"
          >
            <span className="block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
          </button>
          <Link href="/admin" className="flex items-center gap-2" aria-label="라이즌푸드 관리자">
            <BrandLogo className="h-6" />
            <span className="font-kr text-sm font-medium text-ink-soft">관리자</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden font-kr text-sm text-ink-soft sm:inline">{me.displayName} 님</span>
          <button
            type="button"
            onClick={async () => { await logout(); router.replace("/admin/login"); }}
            className="rounded-[2px] border border-line px-3 py-1.5 font-kr text-xs text-ink transition hover:bg-clay-soft/40"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px]">
        {/* 데스크톱 사이드바 */}
        <aside className="hidden w-56 shrink-0 border-r border-line p-4 md:block">
          {nav}
        </aside>

        {/* 모바일 사이드바 (오버레이) */}
        {menuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-ink/30" onClick={() => setMenuOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-64 border-r border-line bg-paper p-4">
              {nav}
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
