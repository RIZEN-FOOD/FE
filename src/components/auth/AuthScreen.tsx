"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthVisual } from "./AuthVisual";
import { useMemberAuth } from "@/store/memberAuth";
import { api, ApiError } from "@/lib/api/client";

type Mode = "login" | "signup";

/**
 * 회원 로그인·회원가입 화면.
 *
 * 좌측 이미지 패널 + 우측 폼 스플릿(50:50). 모바일은 배경 위에 폼 카드.
 * 로그인/회원가입 토글 시 좌측 비주얼이 크로스페이드로 전환된다.
 *
 * 인증은 HttpOnly 쿠키로 오간다 — 이 컴포넌트는 토큰을 만지지 않는다.
 * 성공하면 스토어가 /me 로 확인한 회원 정보만 들고 있는다.
 */
export function AuthScreen({ initialMode = "login" }: { initialMode?: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { me, ready, checkAuth, login, signup } = useMemberAuth();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agreeRequired, setAgreeRequired] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  /** 이메일 중복확인 결과. null 이면 아직 확인 안 함. */
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

  const isLogin = mode === "login";
  /** 로그인 후 돌아갈 곳. 없으면 마이페이지. */
  const redirectTo = searchParams.get("next") ?? "/mypage";

  useEffect(() => {
    if (!ready) checkAuth();
  }, [ready, checkAuth]);

  // 이미 로그인돼 있으면 원래 가려던 곳으로 보낸다.
  useEffect(() => {
    if (ready && me) router.replace(redirectTo);
  }, [ready, me, router, redirectTo]);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setEmailAvailable(null);
  }

  /** 회원가입 이메일 중복확인 */
  async function checkEmail() {
    if (!email.trim()) return;
    try {
      const res = await api.post<{ available: boolean }>("/api/auth/check-email", { email });
      setEmailAvailable(res.available);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "이메일 확인에 실패했습니다.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup({
          email,
          password,
          name,
          phone: phone || undefined,
          agreeRequired,
          ageOver14: agreeRequired, // 약관 동의에 만 14세 확인이 포함돼 있다
          agreeMarketing,
        });
      }
      router.replace(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "처리 중 문제가 발생했습니다.");
      setSubmitting(false);
    }
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
                onClick={() => switchMode(m)}
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
                <Field
                  label="이름"
                  type="text"
                  placeholder="홍길동"
                  autoComplete="name"
                  value={name}
                  onChange={(v) => setName(v)}
                />
              </div>
            </div>

            <div>
              <Field
                label="이메일"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                value={email}
                onChange={(v) => { setEmail(v); setEmailAvailable(null); }}
                onBlur={isLogin ? undefined : checkEmail}
              />
              {!isLogin && emailAvailable !== null && (
                <p className={`mt-1 font-kr text-xs ${emailAvailable ? "text-ink-soft" : "text-clay-deep"}`}>
                  {emailAvailable ? "사용할 수 있는 이메일입니다." : "이미 가입된 이메일입니다."}
                </p>
              )}
            </div>

            <Field
              label="비밀번호"
              type="password"
              placeholder={isLogin ? "비밀번호를 입력하세요" : "8자 이상, 영문+숫자"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={(v) => setPassword(v)}
            />

            {/* 회원가입일 때만 휴대폰 (선택) */}
            <div
              className={`grid transition-all duration-500 ${
                isLogin ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
              }`}
            >
              <div className="overflow-hidden">
                <Field
                  label="휴대폰 (선택)"
                  type="tel"
                  placeholder="010-0000-0000"
                  autoComplete="tel"
                  value={phone}
                  onChange={(v) => setPhone(v)}
                />
              </div>
            </div>

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
              <div className="flex flex-col gap-2 pt-0.5">
                <label className="flex items-start gap-2 font-kr text-xs text-ink-soft">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-3.5 w-3.5 rounded accent-ink"
                    checked={agreeRequired}
                    onChange={(e) => setAgreeRequired(e.target.checked)}
                  />
                  <span>
                    <b className="font-semibold text-ink">(필수)</b> 만 14세 이상이며{" "}
                    <Link href="/policy/terms" className="underline">이용약관</Link>과{" "}
                    <Link href="/policy/privacy" className="underline">개인정보처리방침</Link>에 동의합니다.
                  </span>
                </label>
                <label className="flex items-start gap-2 font-kr text-xs text-ink-soft">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-3.5 w-3.5 rounded accent-ink"
                    checked={agreeMarketing}
                    onChange={(e) => setAgreeMarketing(e.target.checked)}
                  />
                  <span>(선택) 혜택·소식 안내를 받겠습니다.</span>
                </label>
              </div>
            )}

            {error && (
              <p role="alert" className="rounded-xl bg-clay-soft/40 px-3.5 py-2.5 font-kr text-xs text-clay-deep">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 h-[50px] w-full rounded-2xl bg-ink font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-50"
            >
              {submitting ? "처리 중…" : isLogin ? "로그인" : "가입하기"}
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
              onClick={() => switchMode(isLogin ? "signup" : "login")}
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

/** 레퍼런스 스펙: 회색 배경, 테두리 없음, radius 16px, 높이 50px */
function Field({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="mb-1 block font-kr text-xs font-medium text-ink-soft">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[50px] w-full rounded-2xl border border-transparent bg-cream-warm px-4 font-kr text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-clay-deep focus:bg-paper"
      />
    </label>
  );
}

/**
 * 소셜 로그인 버튼.
 * OAuth 연동은 카카오·네이버 앱 등록이 선행돼야 한다. 지금은 안내만 한다.
 */
function SocialButton({ provider }: { provider: "kakao" | "naver" }) {
  const meta = {
    kakao: { label: "카카오로 시작하기", bg: "bg-[#FEE500]", text: "text-[#191600]" },
    naver: { label: "네이버로 시작하기", bg: "bg-[#03C75A]", text: "text-white" },
  }[provider];

  return (
    <button
      type="button"
      onClick={() => window.alert("간편 로그인은 준비 중입니다.")}
      className={`h-[50px] w-full rounded-2xl font-kr text-sm font-semibold transition hover:opacity-90 ${meta.bg} ${meta.text}`}
    >
      {meta.label}
    </button>
  );
}
