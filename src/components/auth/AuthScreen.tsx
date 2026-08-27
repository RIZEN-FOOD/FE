"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthVisual } from "./AuthVisual";

type Mode = "login" | "signup";

/**
 * 회원 로그인·회원가입 화면.
 *
 * 좌측 이미지 패널 + 우측 폼 스플릿(50:50). 모바일은 배경 위에 폼 카드.
 * 로그인/회원가입 토글 시 좌측 비주얼이 크로스페이드로 전환된다.
 *
 * ⚠️ 실제 회원 인증(가입·로그인·JWT)은 백엔드가 아직 없다 (Phase 5).
 *   지금은 화면과 인터랙션을 먼저 완성한다. 제출하면 준비 중 안내를 보여준다.
 *   백엔드가 생기면 handleSubmit 만 실제 API 호출로 바꾼다.
 */
export function AuthScreen({ initialMode = "login" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [notice, setNotice] = useState<string | null>(null);
  const isLogin = mode === "login";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: 회원 인증 API 연결 (Phase 5)
    setNotice("회원 기능은 준비 중입니다. 곧 이용하실 수 있습니다.");
  }

  return (
    <main className="relative min-h-svh w-full overflow-hidden bg-cream md:grid md:grid-cols-2">
      {/* ── 좌측 이미지 패널 (모바일에선 전체 배경) ── */}
      <div className="absolute inset-0 md:relative md:inset-auto md:h-svh">
        <AuthVisual mode={mode} />
        {/* 모바일에서 폼 카드가 읽히도록 어둡게 덮는다 */}
        <div className="absolute inset-0 bg-ink/35 md:hidden" />
      </div>

      {/* ── 우측 폼 패널 ── */}
      <div className="relative z-10 flex min-h-svh items-center justify-center px-6 py-16">
        <div className="w-full max-w-[382px] rounded-2xl bg-paper/95 p-8 shadow-[0_24px_70px_rgba(34,30,28,0.2)] backdrop-blur md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
          {/* 토글 */}
          <div className="mb-8 flex gap-1 rounded-2xl bg-cream-warm p-1 md:bg-clay-soft/25">
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setNotice(null); }}
                className={`flex-1 rounded-xl py-2.5 font-kr text-sm font-semibold transition ${
                  mode === m ? "bg-ink text-cream-warm shadow-sm" : "text-ink-faint"
                }`}
              >
                {m === "login" ? "로그인" : "회원가입"}
              </button>
            ))}
          </div>

          {/* 인사 */}
          <h1 className="font-kr text-2xl font-bold text-ink">
            {isLogin ? "다시 오신 것을 환영합니다" : "라이즌푸드 회원가입"}
          </h1>
          <p className="mt-1.5 font-kr text-sm text-ink-soft">
            {isLogin ? "라이즌푸드 계정으로 로그인하세요." : "몇 가지 정보만 입력하면 됩니다."}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-3.5" noValidate>
            {/* 회원가입일 때만 이름 (부드럽게 펼침) */}
            <div
              className={`grid transition-all duration-500 ${
                isLogin ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
              }`}
            >
              <div className="overflow-hidden">
                <Field label="이름" type="text" placeholder="홍길동" autoComplete="name" />
              </div>
            </div>

            <Field label="이메일" type="email" placeholder="your@email.com" autoComplete="email" />
            <Field
              label="비밀번호"
              type="password"
              placeholder={isLogin ? "비밀번호를 입력하세요" : "8자 이상, 영문+숫자"}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />

            {isLogin ? (
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-1.5 font-kr text-xs text-ink-soft">
                  <input type="checkbox" className="h-3.5 w-3.5 rounded accent-ink" />
                  로그인 유지
                </label>
                <Link href="/auth/find" className="font-kr text-xs text-ink-soft underline-offset-2 hover:underline">
                  아이디·비밀번호 찾기
                </Link>
              </div>
            ) : (
              <label className="flex items-start gap-2 pt-0.5 font-kr text-xs text-ink-soft">
                <input type="checkbox" className="mt-0.5 h-3.5 w-3.5 rounded accent-ink" />
                <span>
                  만 14세 이상이며 <Link href="/policy/terms" className="underline">이용약관</Link>과{" "}
                  <Link href="/policy/privacy" className="underline">개인정보처리방침</Link>에 동의합니다.
                </span>
              </label>
            )}

            {notice && (
              <p role="alert" className="rounded-xl bg-clay-soft/40 px-3.5 py-2.5 font-kr text-xs text-clay-deep">
                {notice}
              </p>
            )}

            <button
              type="submit"
              className="mt-1 h-[50px] w-full rounded-2xl bg-ink font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep"
            >
              {isLogin ? "로그인" : "가입하기"}
            </button>
          </form>

          {/* 간편 로그인 */}
          <div className="mt-7">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="font-kr text-xs text-ink-faint">또는 간편 로그인</span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="mt-4 flex flex-col gap-2.5">
              <SocialButton provider="kakao" />
              <SocialButton provider="naver" />
            </div>
          </div>

          {/* 하단 전환 링크 */}
          <p className="mt-7 text-center font-kr text-xs text-ink-soft">
            {isLogin ? "아직 계정이 없으신가요? " : "이미 계정이 있으신가요? "}
            <button
              type="button"
              onClick={() => { setMode(isLogin ? "signup" : "login"); setNotice(null); }}
              className="font-semibold text-ink underline underline-offset-2"
            >
              {isLogin ? "회원가입" : "로그인"}
            </button>
          </p>
        </div>
      </div>

      {/* 홈으로 */}
      <Link
        href="/"
        className="absolute left-7 top-6 z-20 font-en text-lg font-extrabold tracking-tight text-cream-warm md:text-ink"
      >
        RiZen
      </Link>
    </main>
  );
}

/** koala 스펙: 회색 배경, 테두리 없음, radius 16px, 높이 50px */
function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block font-kr text-xs font-medium text-ink-soft">{label}</span>
      <input
        {...rest}
        className="h-[50px] w-full rounded-2xl border border-transparent bg-cream-warm px-4 font-kr text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-clay-deep focus:bg-paper"
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
      className={`h-[50px] w-full rounded-2xl font-kr text-sm font-semibold transition hover:opacity-90 ${meta.bg} ${meta.text}`}
    >
      {meta.label}
    </button>
  );
}
