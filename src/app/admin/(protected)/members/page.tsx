"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api/client";
import { formatDate, formatDateTime } from "@/lib/datetime";
import { cn } from "@/lib/cn";
import {
  type AdminMemberPage,
  MEMBER_PROVIDER_LABEL,
  MEMBER_STATUS_LABEL,
} from "@/types/member";

/**
 * 회원 관리 — 목록.
 *
 * ★ 개인정보 최소 노출 (CLAUDE.md 규칙 6). 목록에는 휴대폰을 마스킹으로만 보여준다.
 *   전체 번호·조치는 상세에서만 한다.
 *
 * 이름·이메일로 검색하고 상태로 거른다. 행을 누르면 상세로 간다.
 */
const STATUS_TABS = [
  { key: "", label: "전체" },
  { key: "ACTIVE", label: "활성" },
  { key: "SUSPENDED", label: "정지" },
  { key: "WITHDRAWN", label: "탈퇴" },
];

export default function AdminMembersPage() {
  const [data, setData] = useState<AdminMemberPage | null>(null);
  const [q, setQ] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), size: "20" });
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      setData(await api.get<AdminMemberPage>(`/api/admin/members?${params.toString()}`));
    } catch {
      setError("회원 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [q, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    setQ(queryInput.trim());
  }

  return (
    <div>
      <h1 className="font-kr text-2xl font-bold text-ink">회원 관리</h1>
      <p className="mt-1 font-kr text-sm text-ink-soft">
        가입한 회원을 조회하고, 잠긴 계정을 풀거나 이용을 정지·해제합니다.
      </p>

      {/* 검색 + 상태 필터 */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setPage(0);
                setStatus(t.key);
              }}
              className={cn(
                "rounded-full px-3.5 py-1.5 font-kr text-sm transition",
                status === t.key
                  ? "bg-ink text-cream-warm"
                  : "text-ink-soft hover:bg-clay-soft/40",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={submitSearch} className="flex gap-2">
          <input
            type="search"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="이름 또는 이메일 검색"
            className="w-56 rounded-[3px] border border-line bg-paper px-3 py-2 font-kr text-sm text-ink outline-none focus:border-clay-deep"
          />
          <button
            type="submit"
            className="rounded-[3px] bg-ink px-4 py-2 font-kr text-sm font-medium text-cream-warm transition hover:bg-slate-deep"
          >
            검색
          </button>
        </form>
      </div>

      {/* 목록 */}
      <div className="mt-5 overflow-hidden rounded-[4px] border border-line bg-paper">
        {loading ? (
          <p className="px-4 py-16 text-center font-kr text-sm text-ink-faint">불러오는 중…</p>
        ) : error ? (
          <div className="px-4 py-16 text-center">
            <p className="font-kr text-sm text-clay-deep">{error}</p>
            <button
              type="button"
              onClick={load}
              className="mt-3 rounded-[3px] border border-line px-4 py-2 font-kr text-sm text-ink hover:bg-clay-soft/40"
            >
              다시 시도
            </button>
          </div>
        ) : !data || data.items.length === 0 ? (
          <p className="px-4 py-16 text-center font-kr text-sm text-ink-faint">
            {q || status ? "조건에 맞는 회원이 없습니다." : "아직 가입한 회원이 없습니다."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line font-kr text-xs text-ink-faint">
                  <th className="px-4 py-3 font-medium">이름</th>
                  <th className="px-4 py-3 font-medium">이메일</th>
                  <th className="px-4 py-3 font-medium">가입경로</th>
                  <th className="px-4 py-3 font-medium">상태</th>
                  <th className="px-4 py-3 font-medium">휴대폰</th>
                  <th className="px-4 py-3 font-medium">최근 로그인</th>
                  <th className="px-4 py-3 font-medium">가입일</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-line/60 font-kr text-sm text-ink transition last:border-0 hover:bg-cream"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/admin/members/${m.id}`} className="font-medium hover:underline">
                        {m.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{m.email}</td>
                    <td className="px-4 py-3 text-ink-soft">
                      {MEMBER_PROVIDER_LABEL[m.provider] ?? m.provider}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={m.status} locked={m.locked} />
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{m.phoneMasked ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-soft">
                      {m.lastLoginAt ? formatDateTime(m.lastLoginAt) : "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{formatDate(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 페이지 */}
      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-[3px] border border-line px-3 py-1.5 font-kr text-sm text-ink disabled:opacity-40"
          >
            이전
          </button>
          <span className="font-kr text-sm text-ink-soft">
            {page + 1} / {data.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= data.totalPages - 1}
            onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
            className="rounded-[3px] border border-line px-3 py-1.5 font-kr text-sm text-ink disabled:opacity-40"
          >
            다음
          </button>
        </div>
      )}

      {data && (
        <p className="mt-3 text-center font-kr text-xs text-ink-faint">
          전체 {data.totalCount.toLocaleString("ko-KR")}명
        </p>
      )}
    </div>
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
      <span className={cn("rounded-full px-2 py-0.5 font-kr text-xs font-medium", tone)}>
        {label}
      </span>
      {locked && (
        <span className="rounded-full bg-clay-deep/15 px-2 py-0.5 font-kr text-xs font-medium text-clay-deep">
          잠김
        </span>
      )}
    </span>
  );
}
