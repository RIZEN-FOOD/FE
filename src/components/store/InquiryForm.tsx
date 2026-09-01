"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Container, SectionTag } from "@/components/ui";
import { api, ApiError } from "@/lib/api/client";
import { useMemberAuth } from "@/store/memberAuth";
import { INQUIRY_TYPES } from "@/types/member";

/**
 * 문의 폼. 회원·비회원 모두 쓸 수 있다.
 *
 * ★ 개인정보 수집 동의 없이는 접수되지 않는다 (법적 의무).
 *   서버도 같은 검증을 하므로 이 체크는 편의일 뿐 신뢰 경계가 아니다.
 *
 * 로그인돼 있으면 이름·이메일을 미리 채워준다. 다만 값은 그대로 서버로
 * 보낸다 — 서버가 세션에서 조용히 덮어쓰지 않고, 사용자가 다른 연락처를
 * 남기고 싶으면 고칠 수 있다.
 */
export function InquiryForm() {
  const { me, ready, checkAuth } = useMemberAuth();

  const [type, setType] = useState("GENERAL");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [agreeConsent, setAgreeConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!ready) checkAuth();
  }, [ready, checkAuth]);

  // 로그인 상태면 이름·이메일을 미리 채운다.
  useEffect(() => {
    if (me) {
      setName((v) => v || me.name);
      setEmail((v) => v || me.email);
    }
  }, [me]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/api/inquiries", {
        type,
        name,
        email,
        phone: phone || undefined,
        message,
        agreeConsent,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "접수 중 문제가 발생했습니다.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <Container as="main" className="py-20">
        <div className="mx-auto max-w-md rounded-[4px] border border-line bg-paper px-6 py-14 text-center">
          <p className="font-kr text-lg font-bold text-ink">문의가 접수되었습니다</p>
          <p className="mt-2 font-kr text-sm text-ink-soft">
            빠르게 확인하고 남겨주신 이메일로 답변드리겠습니다.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/"
              className="rounded-[2px] bg-ink px-5 py-2.5 font-kr text-sm font-bold text-cream-warm"
            >
              홈으로
            </Link>
            {me && (
              <Link
                href="/mypage"
                className="rounded-[2px] border border-line px-5 py-2.5 font-kr text-sm text-ink"
              >
                문의 내역 보기
              </Link>
            )}
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container as="main" className="py-14">
      <SectionTag>Contact</SectionTag>
      <h1 className="font-kr text-3xl font-bold tracking-tight text-ink">문의하기</h1>
      <p className="mt-2 font-kr text-sm text-ink-soft">
        궁금한 점을 남겨주시면 이메일로 답변드립니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 max-w-lg" noValidate>
        <div className="flex flex-col gap-4">
          <label className="block">
            <span className="mb-1 block font-kr text-xs font-medium text-ink-soft">문의 유형</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-[50px] w-full rounded-[3px] border border-line bg-paper px-3 font-kr text-sm text-ink outline-none focus:border-clay-deep"
            >
              {INQUIRY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <Field label="이름" value={name} onChange={setName} required />
          <Field label="이메일" type="email" value={email} onChange={setEmail} required
                 placeholder="답변받으실 이메일" />
          <Field label="휴대폰 (선택)" type="tel" value={phone} onChange={setPhone}
                 placeholder="010-0000-0000" />

          <label className="block">
            <span className="mb-1 block font-kr text-xs font-medium text-ink-soft">문의 내용</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={7}
              maxLength={2000}
              required
              className="w-full rounded-[3px] border border-line bg-paper px-3 py-3 font-kr text-sm leading-relaxed text-ink outline-none focus:border-clay-deep"
            />
            <span className="mt-1 block text-right font-numeric text-xs text-ink-faint">
              {message.length} / 2000
            </span>
          </label>

          {/* 개인정보 수집 동의 — 법적 의무 */}
          <label className="flex items-start gap-2 rounded-[3px] bg-cream-warm px-4 py-3 font-kr text-xs text-ink-soft">
            <input
              type="checkbox"
              checked={agreeConsent}
              onChange={(e) => setAgreeConsent(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 rounded accent-ink"
            />
            <span>
              <b className="font-semibold text-ink">(필수)</b> 문의 답변을 위해 이름·이메일·휴대폰을
              수집·이용하는 데 동의합니다. 자세한 내용은{" "}
              <Link href="/policy/privacy" className="underline">개인정보처리방침</Link>을 확인해 주세요.
            </span>
          </label>

          {error && (
            <p role="alert" className="rounded-[3px] bg-clay-soft/40 px-3.5 py-2.5 font-kr text-xs text-clay-deep">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="h-[50px] w-full rounded-[2px] bg-ink font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-50"
          >
            {submitting ? "접수 중…" : "문의 접수"}
          </button>
        </div>
      </form>
    </Container>
  );
}

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
        className="h-[50px] w-full rounded-[3px] border border-line bg-paper px-3 font-kr text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-clay-deep"
      />
    </label>
  );
}
