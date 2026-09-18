"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthVisual } from "./AuthVisual";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useMemberAuth } from "@/store/memberAuth";
import { api, ApiError } from "@/lib/api/client";

type Mode = "login" | "signup";

const PROVIDER_LABEL: Record<string, string> = { kakao: "카카오", naver: "네이버", local: "이메일" };

/**
 * 간편 로그인에서 돌아왔을 때의 안내 문장. 서버가 ?social_error= 로 사유를 준다.
 * 같은 이메일 계정이 있으면 자동으로 합치지 않고, 원래 가입한 방식으로 로그인하도록 안내한다.
 */
function socialErrorMessage(code: string | null, existing: string | null): string | null {
  switch (code) {
    case null:
      return null;
    case "cancelled":
      return "간편 로그인을 취소했습니다.";
    case "expired":
      return "로그인 시간이 지났습니다. 다시 시도해 주세요.";
    case "unavailable":
      return "이용할 수 없는 계정입니다. 고객센터로 문의해 주세요.";
    case "unavailable_provider":
      return "지금은 이 간편 로그인을 쓸 수 없습니다. 이메일로 로그인해 주세요.";
    case "email_exists": {
      if (existing === "local") {
        return "이미 같은 이메일로 가입된 계정이 있습니다. 이메일과 비밀번호로 로그인해 주세요.";
      }
      const label = PROVIDER_LABEL[existing ?? ""];
      return label
        ? `이미 ${label}(으)로 가입된 계정이 있습니다. ${label}(으)로 로그인해 주세요.`
        : "이미 같은 이메일로 가입된 계정이 있습니다. 원래 가입한 방법으로 로그인해 주세요.";
    }
    default:
      return "간편 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }
}

/** 관리자가 사진을 안 넣었을 때 쓰는 기본 배경 (저장소 번들). */
const DEFAULT_LOGIN_IMAGE = "/assets/auth/login.webp";
const DEFAULT_SIGNUP_IMAGE = "/assets/auth/signup.webp";

/**
 * 회원 로그인·회원가입 화면.
 *
 * 좌측 이미지 패널 + 우측 폼 스플릿(50:50). 모바일은 배경 위에 폼 카드.
 * 로그인/회원가입 토글 시 좌측 비주얼이 크로스페이드로 전환된다.
 *
 * 인증은 HttpOnly 쿠키로 오간다 — 이 컴포넌트는 토큰을 만지지 않는다.
 * 성공하면 스토어가 /me 로 확인한 회원 정보만 들고 있는다.
 */
export function AuthScreen({
  initialMode = "login",
  loginImage = DEFAULT_LOGIN_IMAGE,
  signupImage = DEFAULT_SIGNUP_IMAGE,
}: {
  initialMode?: Mode;
  loginImage?: string;
  signupImage?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { me, ready, checkAuth, login, signup } = useMemberAuth();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [error, setError] = useState<string | null>(() =>
    socialErrorMessage(searchParams.get("social_error"), searchParams.get("existing")),
  );
  /** 키가 설정돼 켜진 간편 로그인만 버튼으로 보여준다. */
  const [providers, setProviders] = useState<("kakao" | "naver")[]>([]);
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
  /**
   * 로그인 후 돌아갈 곳. 없으면 마이페이지.
   * ★ 오픈 리다이렉트 방지 — 같은 사이트의 상대경로("/…")만 허용한다.
   *   "//evil.com"·"https://evil.com" 같은 외부 주소는 무시하고 마이페이지로.
   */
  const nextParam = searchParams.get("next");
  const redirectTo =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/";

  useEffect(() => {
    if (!ready) checkAuth();
  }, [ready, checkAuth]);

  useEffect(() => {
    api
      .get<Record<string, boolean>>("/api/auth/oauth/providers")
      .then((res) => setProviders((["kakao", "naver"] as const).filter((p) => res[p])))
      .catch(() => setProviders([]));
  }, []);

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
    <>
      {/* 현행 로고 + 네비게이션(모바일 사이드바 포함) — 다른 화면과 동일하게 */}
      <SiteHeader forceSolid />

      <main className="relative min-h-svh w-full overflow-hidden bg-cream md:grid md:grid-cols-2">
      {/* ── 좌측 이미지 패널 (모바일에선 전체 배경) ── */}
      <div className="absolute inset-0 md:relative md:inset-auto md:h-svh">
        <AuthVisual mode={mode} loginImage={loginImage} signupImage={signupImage} />
        {/* 모바일에서 폼 카드가 읽히도록 어둡게 덮는다 */}
        <div className="absolute inset-0 bg-ink/35 md:hidden" />
      </div>

      {/* ── 우측 폼 패널 ── */}
      <div className="relative z-10 flex min-h-svh items-center justify-center px-6 pb-16 pt-28 md:pt-24">
        <div className="w-full max-w-[382px] rounded-2xl bg-paper/95 p-8 shadow-[0_24px_70px_rgba(34,30,28,0.2)] backdrop-blur md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
          {/* 컴포넌트 상단 브랜드 로고 */}
          <div className="mb-7 flex justify-center md:justify-start">
            <BrandLogo className="h-8" />
          </div>

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
              <p role="alert" className="rounded-xl bg-danger/10 px-3.5 py-2.5 font-kr text-xs font-medium text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 h-[50px] w-full rounded-full bg-ink font-kr text-sm font-bold text-cream-warm shadow-[0_8px_20px_rgba(34,30,28,0.22)] transition hover:-translate-y-0.5 hover:bg-slate-deep disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {submitting ? "처리 중…" : isLogin ? "로그인" : "가입하기"}
            </button>
          </form>

          {/* 간편 로그인 — 키가 설정된 제공자만 보인다 (누르면 실패하는 버튼을 두지 않는다) */}
          {providers.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-line" />
                <span className="font-kr text-xs text-ink-faint">또는 간편하게</span>
                <span className="h-px flex-1 bg-line" />
              </div>
              <div className="mt-4 flex flex-col gap-2.5">
                {providers.map((p) => (
                  <SocialButton key={p} provider={p} next={redirectTo} />
                ))}
              </div>
              <p className="mt-2.5 text-center font-kr text-[11px] leading-relaxed text-ink-faint">
                처음이시면 약관 동의 후 바로 가입됩니다.
              </p>
            </div>
          )}

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
      </main>
    </>
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
 * 간편 로그인 버튼. 서버의 시작 주소로 이동한다(화면 전체 이동).
 * 서버가 카카오·네이버 로그인 화면으로 보내고, 끝나면 원래 가려던 화면(next)으로 돌려보낸다.
 */
function SocialButton({ provider, next }: { provider: "kakao" | "naver"; next: string }) {
  const meta = {
    kakao: { label: "카카오로 시작하기", bg: "bg-[#FEE500]", text: "text-[#191600]" },
    naver: { label: "네이버로 시작하기", bg: "bg-[#03C75A]", text: "text-white" },
  }[provider];

  return (
    <a
      href={`/api/auth/oauth/${provider}/start?next=${encodeURIComponent(next)}`}
      className={`flex h-[50px] w-full items-center justify-center rounded-full font-kr text-sm font-semibold shadow-[0_6px_16px_rgba(34,30,28,0.14)] transition hover:-translate-y-0.5 hover:opacity-90 ${meta.bg} ${meta.text}`}
    >
      {meta.label}
    </a>
  );
}
