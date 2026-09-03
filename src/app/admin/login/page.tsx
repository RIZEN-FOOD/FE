"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/ui";
import { useAdminAuth } from "@/store/adminAuth";

/**
 * 관리자 로그인.
 *
 * 이미 로그인돼 있으면 대시보드로 보낸다.
 * 실패 메시지는 서버가 준 문장을 그대로 보여준다(남은 시도 횟수·잠금 안내 포함).
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const { me, ready, checkAuth, login } = useAdminAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ready) checkAuth();
  }, [ready, checkAuth]);

  useEffect(() => {
    if (ready && me) router.replace("/admin");
  }, [ready, me, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandLogo className="h-9" />
          <p className="mt-2 font-kr text-sm text-ink-soft">관리자</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-[4px] border border-line bg-paper px-7 py-8"
          noValidate
        >
          <label className="block">
            <span className="font-kr text-sm font-medium text-ink">아이디</span>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 w-full rounded-[3px] border border-line bg-cream-warm px-3 py-2.5 font-kr text-sm outline-none focus:border-clay-deep"
              required
            />
          </label>

          <label className="mt-4 block">
            <span className="font-kr text-sm font-medium text-ink">비밀번호</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-[3px] border border-line bg-cream-warm px-3 py-2.5 font-kr text-sm outline-none focus:border-clay-deep"
              required
            />
          </label>

          {error && (
            <p role="alert" className="mt-4 rounded-[3px] bg-clay-soft/40 px-3 py-2 font-kr text-sm text-clay-deep">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-[2px] bg-ink py-3 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-50"
          >
            {submitting ? "확인 중…" : "로그인"}
          </button>
        </form>
      </div>
    </main>
  );
}
