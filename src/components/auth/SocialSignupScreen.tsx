"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { api, ApiError } from "@/lib/api/client";
import { useMemberAuth } from "@/store/memberAuth";

type Pending = { provider: "kakao" | "naver"; name: string | null; email: string | null };

const PROVIDER_LABEL = { kakao: "카카오", naver: "네이버" } as const;

/**
 * 간편 로그인으로 처음 온 사람의 가입 마무리 화면.
 *
 * ★ 동의 없이 계정을 만들지 않는다. 카카오·네이버에서 받은 정보만으로는 약관·개인정보 동의와
 *   만 14세 확인이 되지 않기 때문이다(개인정보 보호법·정보통신망법). 여기서 받고 가입시킨다.
 *
 * 제공자 정보는 서버가 서명한 10분짜리 쿠키에 있다. 화면은 그것을 보여주기만 하고,
 * 가입할 때도 서버가 그 쿠키를 다시 확인한다 — 화면에서 보낸 이름·이메일을 믿지 않는다.
 */
export function SocialSignupScreen() {
  const router = useRouter();
  const { checkAuth } = useMemberAuth();

  const [pending, setPending] = useState<Pending | null>(null);
  const [expired, setExpired] = useState(false);
  const [agreeRequired, setAgreeRequired] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get<Pending>("/api/auth/oauth/pending")
      .then(setPending)
      .catch(() => setExpired(true));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agreeRequired) {
      setError("필수 항목에 동의해 주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post<{ next: string }>("/api/auth/oauth/complete", {
        agreeRequired,
        ageOver14: agreeRequired, // 필수 동의 문구에 만 14세 확인이 포함돼 있다
        agreeMarketing,
      });
      await checkAuth();
      router.replace(res.next || "/");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setExpired(true);
      } else {
        setError(err instanceof Error ? err.message : "가입에 실패했습니다.");
      }
      setSubmitting(false);
    }
  }

  const label = pending ? PROVIDER_LABEL[pending.provider] : "";

  return (
    <>
      <SiteHeader forceSolid />
      <main className="flex min-h-svh items-center justify-center bg-cream px-6 pb-16 pt-28">
        <div className="w-full max-w-[400px] rounded-[12px] bg-paper p-8 shadow-[0_24px_70px_rgba(34,30,28,0.12)]">
          <div className="mb-6 flex justify-center">
            <BrandLogo className="h-8" />
          </div>

          {expired ? (
            <div className="text-center">
              <h1 className="font-kr text-xl font-bold text-ink">가입 시간이 지났습니다</h1>
              <p className="mt-2 font-kr text-sm text-ink-soft">
                안전을 위해 10분이 지나면 다시 로그인해야 합니다.
              </p>
              <Link
                href="/auth/login"
                className="mt-6 inline-flex h-[46px] items-center justify-center rounded-full bg-ink px-6 font-kr text-sm font-bold text-cream-warm"
              >
                로그인 화면으로
              </Link>
            </div>
          ) : !pending ? (
            <p className="text-center font-kr text-sm text-ink-faint">불러오는 중…</p>
          ) : (
            <form onSubmit={submit} noValidate>
              <h1 className="font-kr text-xl font-bold text-ink">{label}로 가입하기</h1>
              <p className="mt-1.5 font-kr text-sm text-ink-soft">
                처음 오셨네요. 아래 내용을 확인하고 동의하면 바로 시작합니다.
              </p>

              <dl className="mt-6 flex flex-col gap-2 rounded-[12px] bg-cream-warm px-4 py-3.5 font-kr text-sm">
                <div className="flex gap-3">
                  <dt className="w-12 shrink-0 text-ink-faint">이름</dt>
                  <dd className="text-ink">{pending.name ?? "회원"}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-12 shrink-0 text-ink-faint">이메일</dt>
                  <dd className="text-ink">
                    {pending.email ?? (
                      <span className="text-ink-faint">받지 않음 (주문할 때 입력하시면 됩니다)</span>
                    )}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-col gap-2.5">
                <label className="flex items-start gap-2 font-kr text-caption text-ink-soft">
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
                <label className="flex items-start gap-2 font-kr text-caption text-ink-soft">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-3.5 w-3.5 rounded accent-ink"
                    checked={agreeMarketing}
                    onChange={(e) => setAgreeMarketing(e.target.checked)}
                  />
                  <span>(선택) 혜택·소식 안내를 받겠습니다.</span>
                </label>
              </div>

              {error && (
                <p role="alert" className="mt-4 rounded-[12px] bg-danger/10 px-3.5 py-2.5 font-kr text-caption font-medium text-danger">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 h-[50px] w-full rounded-full bg-ink font-kr text-sm font-bold text-cream-warm shadow-[0_8px_20px_rgba(34,30,28,0.22)] transition hover:-translate-y-0.5 hover:bg-slate-deep disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {submitting ? "가입 중…" : "동의하고 시작하기"}
              </button>
              <p className="mt-3 text-center font-kr text-caption text-ink-faint">
                <Link href="/auth/login" className="underline underline-offset-2">
                  다른 방법으로 로그인
                </Link>
              </p>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
