"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import { formatDate, formatDateTime } from "@/lib/datetime";
import { cn } from "@/lib/cn";
import {
  type AdminMemberDetail,
  MEMBER_PROVIDER_LABEL,
  MEMBER_STATUS_LABEL,
} from "@/types/member";

/**
 * 회원 관리 — 상세.
 *
 * ★ 개인정보 (CLAUDE.md 규칙 6):
 *   - 휴대폰은 기본 마스킹. '전체 보기'를 누를 때만 서버에서 복호화해 오고,
 *     그 열람은 서버가 감사로그에 남긴다. 그래서 안내 문구를 붙인다.
 *   - 조치는 잠금 해제 / 정지·해제 두 가지. 정보 수정·삭제는 없다.
 *
 * ★ 조치 UX (CLAUDE.md 규칙 4):
 *   - 잠금 해제: 위험도가 낮아 바로 실행.
 *   - 정지·해제: 로그인 자체를 막거나 푸는 조치라 이중 확인 + 사유를 받는다.
 */
export default function AdminMemberDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [m, setM] = useState<AdminMemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [fullPhone, setFullPhone] = useState<string | null>(null);
  const [phoneBusy, setPhoneBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setM(await api.get<AdminMemberDetail>(`/api/admin/members/${id}`));
    } catch {
      setError("회원 정보를 불러오지 못했습니다.");
      setM(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function flash(t: string) {
    setMessage(t);
    window.setTimeout(() => setMessage(null), 2800);
  }

  async function revealPhone() {
    setPhoneBusy(true);
    try {
      const res = await api.get<{ phone: string }>(`/api/admin/members/${id}/phone`);
      setFullPhone(res.phone);
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "휴대폰 번호를 불러오지 못했습니다.");
    } finally {
      setPhoneBusy(false);
    }
  }

  async function unlock() {
    setBusy(true);
    try {
      await api.post(`/api/admin/members/${id}/unlock`);
      flash("잠금을 해제했습니다.");
      await load();
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "잠금 해제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(target: "SUSPENDED" | "ACTIVE") {
    const verb = target === "SUSPENDED" ? "정지" : "정지 해제";
    // 이중 확인 — 로그인을 막거나 푸는 조치라 신중히 한다.
    if (!window.confirm(`이 회원을 ${verb}하시겠습니까?`)) return;
    const reason =
      window.prompt(`${verb} 사유를 입력하세요 (내부 기록용).`) ?? undefined;
    if (reason === undefined) return; // 취소
    if (!window.confirm(`정말 ${verb}합니다. 진행할까요?`)) return;

    setBusy(true);
    try {
      await api.patch(`/api/admin/members/${id}/status`, { status: target, reason });
      flash(target === "SUSPENDED" ? "계정을 정지했습니다." : "정지를 해제했습니다.");
      await load();
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "상태 변경에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="py-16 text-center font-kr text-sm text-ink-faint">불러오는 중…</p>;
  }
  if (error || !m) {
    return (
      <div className="py-16 text-center">
        <p className="font-kr text-sm text-clay-deep">{error ?? "회원을 찾을 수 없습니다."}</p>
        <Link
          href="/admin/members"
          className="mt-3 inline-block rounded-[3px] border border-line px-4 py-2 font-kr text-sm text-ink hover:bg-clay-soft/40"
        >
          목록으로
        </Link>
      </div>
    );
  }

  const withdrawn = m.status === "WITHDRAWN";

  return (
    <div className="max-w-3xl">
      <Link href="/admin/members" className="font-kr text-sm text-ink-soft hover:underline">
        ← 회원 목록
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-kr text-2xl font-bold text-ink">{m.name}</h1>
        <StatusBadge status={m.status} locked={m.locked} />
      </div>
      <p className="mt-1 font-kr text-sm text-ink-soft">{m.email}</p>

      {message && (
        <div className="mt-4 rounded-[3px] border border-clay-deep/30 bg-clay-soft/30 px-4 py-2.5 font-kr text-sm text-ink">
          {message}
        </div>
      )}

      {/* 조치 */}
      {!withdrawn && (
        <div className="mt-5 flex flex-wrap gap-2">
          {m.locked && (
            <button
              type="button"
              onClick={unlock}
              disabled={busy}
              className="rounded-[3px] border border-line bg-paper px-4 py-2 font-kr text-sm font-medium text-ink transition hover:bg-clay-soft/40 disabled:opacity-50"
            >
              잠금 해제
            </button>
          )}
          {m.status === "ACTIVE" ? (
            <button
              type="button"
              onClick={() => changeStatus("SUSPENDED")}
              disabled={busy}
              className="rounded-[3px] border border-clay-deep/40 bg-paper px-4 py-2 font-kr text-sm font-medium text-clay-deep transition hover:bg-clay-deep/10 disabled:opacity-50"
            >
              계정 정지
            </button>
          ) : m.status === "SUSPENDED" ? (
            <button
              type="button"
              onClick={() => changeStatus("ACTIVE")}
              disabled={busy}
              className="rounded-[3px] bg-ink px-4 py-2 font-kr text-sm font-medium text-cream-warm transition hover:bg-slate-deep disabled:opacity-50"
            >
              정지 해제
            </button>
          ) : null}
        </div>
      )}

      {/* 기본 정보 */}
      <section className="mt-8">
        <h2 className="font-kr text-sm font-semibold text-ink-soft">기본 정보</h2>
        <dl className="mt-3 divide-y divide-line rounded-[4px] border border-line bg-paper">
          <Row label="가입 경로">{MEMBER_PROVIDER_LABEL[m.provider] ?? m.provider}</Row>
          <Row label="상태">
            {MEMBER_STATUS_LABEL[m.status] ?? m.status}
            {m.locked && (
              <span className="ml-2 text-clay-deep">
                (로그인 실패 {m.failedCount}회로 잠김
                {m.lockedUntil ? ` · ${formatDateTime(m.lockedUntil)}까지` : ""})
              </span>
            )}
          </Row>
          <Row label="휴대폰">
            {!m.hasPhone ? (
              <span className="text-ink-faint">등록 안 됨</span>
            ) : fullPhone ? (
              <span>
                {fullPhone}
                <span className="ml-2 font-kr text-xs text-ink-faint">(열람 기록됨)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                {m.phoneMasked}
                <button
                  type="button"
                  onClick={revealPhone}
                  disabled={phoneBusy}
                  className="rounded-[2px] border border-line px-2 py-0.5 font-kr text-xs text-ink-soft transition hover:bg-clay-soft/40 disabled:opacity-50"
                >
                  {phoneBusy ? "…" : "전체 보기"}
                </button>
              </span>
            )}
          </Row>
          <Row label="최근 로그인">
            {m.lastLoginAt ? formatDateTime(m.lastLoginAt) : "기록 없음"}
          </Row>
          <Row label="가입일">{formatDateTime(m.createdAt)}</Row>
          {m.withdrawnAt && <Row label="탈퇴일">{formatDateTime(m.withdrawnAt)}</Row>}
        </dl>
        {m.hasPhone && !fullPhone && (
          <p className="mt-2 font-kr text-xs text-ink-faint">
            전체 번호는 최소한으로 확인하세요. ‘전체 보기’를 누르면 열람 사실이 기록됩니다.
          </p>
        )}
      </section>

      {/* 동의 이력 */}
      <section className="mt-8">
        <h2 className="font-kr text-sm font-semibold text-ink-soft">동의 이력</h2>
        <dl className="mt-3 divide-y divide-line rounded-[4px] border border-line bg-paper">
          <Row label="이용약관">{consent(m.termsAgreedAt)}</Row>
          <Row label="개인정보 수집·이용">{consent(m.privacyAgreedAt)}</Row>
          <Row label="만 14세 이상">{consent(m.ageVerifiedAt)}</Row>
          <Row label="마케팅 수신(선택)">
            {m.marketingAgreedAt ? consent(m.marketingAgreedAt) : <span className="text-ink-faint">미동의</span>}
          </Row>
        </dl>
      </section>

      {/* 주문 요약 */}
      <section className="mt-8">
        <h2 className="font-kr text-sm font-semibold text-ink-soft">주문</h2>
        <div className="mt-3 rounded-[4px] border border-line bg-paper px-4 py-4">
          <p className="font-kr text-sm text-ink">
            총 <span className="font-numeric font-bold">{m.orders.count.toLocaleString("ko-KR")}</span>건
          </p>
          {m.orders.recent ? (
            <p className="mt-2 font-kr text-sm text-ink-soft">
              최근:{" "}
              <Link
                href={`/admin/orders/${m.orders.recent.orderNo}`}
                className="font-medium text-ink hover:underline"
              >
                {m.orders.recent.orderNo}
              </Link>{" "}
              · {m.orders.recent.totalAmount.toLocaleString("ko-KR")}원 ·{" "}
              {formatDate(m.orders.recent.orderedAt)}
            </p>
          ) : (
            <p className="mt-2 font-kr text-sm text-ink-faint">주문 내역이 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center">
      <dt className="w-40 shrink-0 font-kr text-sm text-ink-faint">{label}</dt>
      <dd className="font-kr text-sm text-ink">{children}</dd>
    </div>
  );
}

function consent(at: string | null) {
  return at ? (
    <span>동의 · {formatDateTime(at)}</span>
  ) : (
    <span className="text-ink-faint">기록 없음</span>
  );
}

function StatusBadge({ status, locked }: { status: string; locked: boolean }) {
  const label = MEMBER_STATUS_LABEL[status] ?? status;
  const tone =
    status === "ACTIVE"
      ? "bg-clay-soft/50 text-ink"
      : status === "SUSPENDED"
        ? "bg-clay-deep/15 text-clay-deep"
        : "bg-line text-ink-faint";
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("rounded-full px-2.5 py-0.5 font-kr text-xs font-medium", tone)}>
        {label}
      </span>
      {locked && (
        <span className="rounded-full bg-clay-deep/15 px-2.5 py-0.5 font-kr text-xs font-medium text-clay-deep">
          잠김
        </span>
      )}
    </span>
  );
}
