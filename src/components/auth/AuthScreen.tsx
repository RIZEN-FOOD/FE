"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthVisual } from "./AuthVisual";

type Mode = "login" | "signup";

/**
 * 회원 로그인·회원가입 화면.
 *
 * 좌측(모바일은 상단 배경) 비주얼 + 우측 폼 스플릿.
 * 로그인/회원가입을 토글하면 비주얼이 크로스페이드로 전환되고,
 * 폼도 부드럽게 바뀐다.
 *
 * ⚠️ 실제 회원 인증(가입·로그인·JWT)은 백엔드가 아직 없다 (Phase 5).
 *   지금은 화면과 인터랙션을 먼저 완성한다. 제출하면 준비 중 안내를 보여준다.
 *   백엔드가 생기면 handleSubmit 만 실제 API 호출로 바꾼다.
 */
export function AuthScreen({ initialMode = "login" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [notice, setNotice] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: 회원 인증 API 연결 (Phase 5)
    setNotice("회원 기능은 준비 중입니다. 곧 이용하실 수 있습니다.");
  }

  return (
    <main className="relative min-h-svh w-full overflow-hidden bg-cream md:grid md:grid-cols-2">
      {/* 좌측 비주얼 — 모바일에서는 전체 배경으로 깔린다 */}
      <div className="absolute inset-0 md:relative md:inset-auto">
        <AuthVisual mode={mode} />
        {/* 모바일에서 폼 카드가 읽히도록 어둡게 덮는다 */}
        <div className="absolute inset-0 bg-ink/30 md:hidden" />
      </div>

      {/* 우측(모바일은 위에 뜨는 카드) 폼 */}
      <div className="relative z-10 flex min-h-svh items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm rounded-[6px] bg-paper/95 p-8 shadow-[0_20px_60px_rgba(34,30,28,0.18)] backdrop-blur md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
          {/* 토글 */}
          <div className="mb-8 flex rounded-full bg-cream-warm p-1 md:bg-clay-soft/30">
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setNotice(null); }}
                className={`flex-1 rounded-full py-2 font-kr text-sm font-medium transition ${
                  mode === m ? "bg-ink text-cream-warm" : "text-ink-soft"
                }`}
              >
                {m === "login" ? "로그인" : "회원가입"}
              </button>
            ))}
          </div>

          <h1 className="font-kr text-2xl font-bold text-ink">
            {mode === "login" ? "로그인" : "회원가입"}
          </h1>
          <p className="mt-1 font-kr text-sm text-ink-soft">
            {mode === "login" ? "라이즌푸드에 오신 것을 환영합니다." : "몇 가지 정보만 입력하면 됩니다."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3" noValidate>
            {/* 회원가입일 때만 이름 */}
            <div
              className={`grid transition-all duration-500 ${
                mode === "signup" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <Input label="이름" type="text" autoComplete="name" />
              </div>
            </div>

            <Input label="이메일" type="email" placeholder="your@email.com" autoComplete="email" />
            <Input
              label="비밀번호"
              type="password"
              placeholder={mode === "signup" ? "8자 이상, 영문+숫자" : "비밀번호"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />

            {mode === "login" ? (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 font-kr text-xs text-ink-soft">
                  <input type="checkbox" className="h-3.5 w-3.5 accent-ink" />
                  로그인 유지
                </label>
                <Link href="/auth/find" className="font-kr text-xs text-ink-soft underline-offset-2 hover:underline">
                  아이디·비밀번호 찾기
                </Link>
              </div>
            ) : (
              <label className="flex items-start gap-2 font-kr text-xs text-ink-soft">
                <input type="checkbox" className="mt-0.5 h-3.5 w-3.5 accent-ink" />
                <span>
                  만 14세 이상이며 <Link href="/policy/terms" className="underline">이용약관</Link>과{" "}
                  <Link href="/policy/privacy" className="underline">개인정보처리방침</Link>에 동의합니다.
                </span>
              </label>
            )}

            {notice && (
              <p role="alert" className="rounded-[3px] bg-clay-soft/40 px-3 py-2 font-kr text-xs text-clay-deep">
                {notice}
              </p>
            )}

            <button
              type="submit"
              className="mt-2 w-full rounded-[3px] bg-ink py-3 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep"
            >
              {mode === "login" ? "로그인" : "가입하기"}
            </button>
          </form>

          {/* 소셜 로그인 */}
          <div className="mt-6">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="font-kr text-xs text-ink-faint">간편 로그인</span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <SocialButton provider="kakao" />
              <SocialButton provider="naver" />
            </div>
          </div>
        </div>
      </div>

      {/* 홈으로 */}
      <Link
        href="/"
        className="absolute left-6 top-6 z-20 font-en text-lg font-extrabold tracking-tight text-cream-warm md:text-ink"
      >
        RiZen
      </Link>
    </main>
  );
}

function Input({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="font-kr text-xs font-medium text-ink-soft">{label}</span>
      <input
        {...rest}
        className="mt-1 w-full rounded-[3px] border border-line bg-cream-warm px-3 py-2.5 font-kr text-sm outline-none transition focus:border-clay-deep"
      />
    </label>
  );
}

/**
 * 소셜 로그인 버튼.
 * 실제 OAuth 연결은 Phase 5. 지금은 버튼만 둔다.
 */
function SocialButton({ provider }: { provider: "kakao" | "naver" }) {
  const meta = {
    kakao: { label: "카카오로 시작하기", bg: "bg-[#FEE500]", text: "text-[#191600]" },
    naver: { label: "네이버로 시작하기", bg: "bg-[#03C75A]", text: "text-white" },
  }[provider];

  return (
    <button
      type="button"
      className={`w-full rounded-[3px] py-2.5 font-kr text-sm font-medium transition hover:opacity-90 ${meta.bg} ${meta.text}`}
    >
      {meta.label}
    </button>
  );
}
