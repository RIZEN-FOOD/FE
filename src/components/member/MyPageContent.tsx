"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Container, SectionTag } from "@/components/ui";
import { api, ApiError } from "@/lib/api/client";
import { useMemberAuth } from "@/store/memberAuth";
import { formatDateTime } from "@/lib/datetime";
import { INQUIRY_STATUS_LABEL, type InquiryPage, type ReviewPage } from "@/types/member";
import { cn } from "@/lib/cn";

type Tab = "reviews" | "inquiries" | "account";

/**
 * 마이페이지. 내 후기 · 문의 내역 · 회원정보.
 *
 * 로그인이 필요하다. 확인 전에는 아무것도 그리지 않고, 로그인 안 돼 있으면
 * 로그인 페이지로 보내되 next 파라미터로 돌아올 곳을 알려준다.
 */
export function MyPageContent() {
  const router = useRouter();
  const { me, ready, checkAuth, logout } = useMemberAuth();
  const [tab, setTab] = useState<Tab>("reviews");

  useEffect(() => {
    if (!ready) checkAuth();
  }, [ready, checkAuth]);

  useEffect(() => {
    if (ready && !me) router.replace("/auth/login?next=/mypage");
  }, [ready, me, router]);

  if (!ready || !me) {
    return (
      <div className="flex min-h-[50svh] items-center justify-center">
        <p className="font-kr text-sm text-ink-faint">불러오는 중…</p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "reviews", label: "내 후기" },
    { key: "inquiries", label: "문의 내역" },
    { key: "account", label: "회원정보" },
  ];

  return (
    <Container as="main" className="py-14">
      <SectionTag>My Page</SectionTag>
        <h1 className="font-kr text-3xl font-bold tracking-tight text-ink">마이페이지</h1>
        <p className="mt-2 font-kr text-sm text-ink-soft">{me.name} 님, 안녕하세요.</p>

        {/* 탭 */}
        <div className="mt-8 flex gap-2 border-b border-line">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "-mb-px border-b-2 px-4 py-2.5 font-kr text-sm font-medium transition",
                tab === t.key
                  ? "border-ink text-ink"
                  : "border-transparent text-ink-faint hover:text-ink-soft",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "reviews" && <MyReviews />}
          {tab === "inquiries" && <MyInquiries />}
          {tab === "account" && <MyAccount onLogout={async () => { await logout(); router.replace("/"); }} />}
        </div>
    </Container>
  );
}

/* ── 내 후기 ── */
function MyReviews() {
  const [data, setData] = useState<ReviewPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await api.get<ReviewPage>("/api/member/reviews"));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "후기를 불러오지 못했습니다.");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function remove(id: number) {
    if (!window.confirm("이 후기를 삭제할까요? 되돌릴 수 없습니다.")) return;
    try {
      await api.delete(`/api/member/reviews/${id}`);
      load();
    } catch (e) {
      window.alert(e instanceof ApiError ? e.message : "삭제에 실패했습니다.");
    }
  }

  if (error) return <p className="font-kr text-sm text-clay-deep">{error}</p>;
  if (!data) return <p className="font-kr text-sm text-ink-faint">불러오는 중…</p>;

  if (data.items.length === 0) {
    return (
      <EmptyState
        message="아직 작성한 후기가 없습니다."
        actionLabel="상품 보러 가기"
        actionHref="/products"
      />
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {data.items.map((r) => (
        <li key={r.id} className="rounded-[4px] border border-line bg-paper p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Link
                href={`/products/${r.productSlug}`}
                className="font-kr text-sm font-medium text-ink underline-offset-4 hover:underline"
              >
                {r.productName}
              </Link>
              <p className="mt-1 font-numeric text-xs text-clay-deep">
                {"★".repeat(r.rating)}
                <span className="text-line">{"★".repeat(5 - r.rating)}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(r.id)}
              className="shrink-0 font-kr text-xs text-ink-faint transition hover:text-clay-deep"
            >
              삭제
            </button>
          </div>

          <p className="mt-3 whitespace-pre-line font-kr text-sm leading-relaxed text-ink-soft">
            {r.content}
          </p>

          {r.imageUrls.length > 0 && (
            <div className="mt-3 flex gap-2">
              {r.imageUrls.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt="" className="h-16 w-16 rounded-[3px] object-cover" />
              ))}
            </div>
          )}

          <p className="mt-3 font-kr text-xs text-ink-faint">{formatDateTime(r.createdAt)}</p>
        </li>
      ))}
    </ul>
  );
}

/* ── 문의 내역 ── */
function MyInquiries() {
  const [data, setData] = useState<InquiryPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<InquiryPage>("/api/member/inquiries")
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "문의를 불러오지 못했습니다."));
  }, []);

  if (error) return <p className="font-kr text-sm text-clay-deep">{error}</p>;
  if (!data) return <p className="font-kr text-sm text-ink-faint">불러오는 중…</p>;

  if (data.items.length === 0) {
    return (
      <EmptyState message="문의 내역이 없습니다." actionLabel="문의하기" actionHref="/inquiry" />
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {data.items.map((q) => (
        <li key={q.id} className="rounded-[4px] border border-line bg-paper p-5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 font-kr text-[11px] font-medium",
                q.status === "ANSWERED" ? "bg-ink text-cream-warm" : "bg-cream-warm text-ink-soft",
              )}
            >
              {INQUIRY_STATUS_LABEL[q.status] ?? q.status}
            </span>
            <span className="font-kr text-xs text-ink-faint">{formatDateTime(q.createdAt)}</span>
          </div>

          <p className="mt-3 whitespace-pre-line font-kr text-sm leading-relaxed text-ink">
            {q.message}
          </p>

          {q.answer && (
            <div className="mt-4 rounded-[3px] bg-cream-warm px-4 py-3">
              <p className="font-kr text-xs font-semibold text-clay-deep">답변</p>
              <p className="mt-1 whitespace-pre-line font-kr text-sm leading-relaxed text-ink-soft">
                {q.answer}
              </p>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

/* ── 회원정보 ── */
function MyAccount({ onLogout }: { onLogout: () => void }) {
  const { me } = useMemberAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function withdraw() {
    // 되돌릴 수 없는 작업이라 두 번 확인한다.
    if (!window.confirm("정말 탈퇴하시겠어요?\n작성한 후기와 문의 내역은 남지만 계정은 삭제됩니다.")) return;
    if (!window.confirm("탈퇴하면 되돌릴 수 없습니다. 계속할까요?")) return;

    setBusy(true);
    try {
      await api.delete("/api/auth/me");
      window.alert("탈퇴가 완료되었습니다.");
      router.replace("/");
    } catch (e) {
      window.alert(e instanceof ApiError ? e.message : "탈퇴에 실패했습니다.");
      setBusy(false);
    }
  }

  if (!me) return null;

  return (
    <div className="max-w-md">
      <dl className="rounded-[4px] border border-line bg-paper px-5 py-1">
        {[
          { k: "이름", v: me.name },
          { k: "이메일", v: me.email },
          { k: "가입 방식", v: me.provider === "LOCAL" ? "이메일" : me.provider },
        ].map((row) => (
          <div key={row.k} className="flex gap-4 border-b border-line py-3 last:border-0">
            <dt className="w-24 shrink-0 font-kr text-sm text-ink-faint">{row.k}</dt>
            <dd className="font-kr text-sm text-ink">{row.v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onLogout}
          className="rounded-[2px] border border-line px-4 py-2 font-kr text-sm text-ink transition hover:bg-clay-soft/40"
        >
          로그아웃
        </button>
        <button
          type="button"
          onClick={withdraw}
          disabled={busy}
          className="rounded-[2px] px-4 py-2 font-kr text-sm text-ink-faint transition hover:text-clay-deep disabled:opacity-50"
        >
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}

function EmptyState({
  message,
  actionLabel,
  actionHref,
}: {
  message: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="rounded-[4px] border border-dashed border-line px-6 py-16 text-center">
      <p className="font-kr text-sm text-ink-soft">{message}</p>
      <Link
        href={actionHref}
        className="mt-3 inline-block font-kr text-sm font-medium text-clay-deep underline underline-offset-4"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
