"use client";

import { useCallback, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import { formatDateTime } from "@/lib/datetime";
import { cn } from "@/lib/cn";
import { INQUIRY_STATUS_LABEL, INQUIRY_TYPES } from "@/types/member";

type AdminInquiry = {
  id: number;
  type: string;
  name: string;
  email: string;
  message: string;
  answer: string | null;
  answeredAt: string | null;
  status: string;
  createdAt: string;
};
type InquiryPage = { items: AdminInquiry[]; totalCount: number };

const typeLabel = (v: string) => INQUIRY_TYPES.find((t) => t.value === v)?.label ?? v;

/**
 * 문의함. 고객 문의에 답변하고 종료한다.
 */
export default function AdminInquiriesPage() {
  const [data, setData] = useState<InquiryPage | null>(null);
  const [status, setStatus] = useState<string>("PENDING");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = status ? `&status=${status}` : "";
      setData(await api.get<InquiryPage>(`/api/admin/inquiries?page=0&size=100${q}`));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  function flash(t: string) {
    setMessage(t);
    window.setTimeout(() => setMessage(null), 2800);
  }

  async function answer(id: number) {
    const text = (drafts[id] ?? "").trim();
    if (!text) {
      flash("답변 내용을 입력해 주세요.");
      return;
    }
    setBusyId(id);
    try {
      await api.patch(`/api/admin/inquiries/${id}/answer`, { answer: text });
      await load();
      flash("답변이 등록되었습니다.");
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "등록에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  }

  async function close(id: number) {
    setBusyId(id);
    try {
      await api.patch(`/api/admin/inquiries/${id}/close`);
      await load();
      flash("종료되었습니다.");
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "처리에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  }

  const FILTERS = [
    { value: "PENDING", label: "답변 대기" },
    { value: "ANSWERED", label: "답변 완료" },
    { value: "CLOSED", label: "종료" },
    { value: "", label: "전체" },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="font-kr text-2xl font-bold text-ink">문의함</h1>
      <p className="mt-1 font-kr text-sm text-ink-soft">고객 문의에 답변합니다. 답변하면 문의자가 마이페이지에서 확인합니다.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatus(f.value)}
            className={cn("rounded-full border px-3.5 py-1.5 font-kr text-xs transition",
              status === f.value ? "border-ink bg-ink text-cream-warm" : "border-line text-ink-soft hover:border-ink")}
          >
            {f.label}
          </button>
        ))}
      </div>

      {message && (
        <p className="mt-4 rounded-[3px] bg-clay-soft/40 px-3 py-2 font-kr text-sm text-clay-deep">{message}</p>
      )}

      {loading ? (
        <p className="mt-10 font-kr text-sm text-ink-faint">불러오는 중…</p>
      ) : !data || data.items.length === 0 ? (
        <p className="mt-10 font-kr text-sm text-ink-faint">해당하는 문의가 없습니다.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {data.items.map((q) => (
            <li key={q.id} className="rounded-[4px] border border-line bg-paper p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-cream-warm px-2.5 py-0.5 font-kr text-[11px] text-clay-deep">
                    {typeLabel(q.type)}
                  </span>
                  <span className="font-kr text-sm text-ink">{q.name}</span>
                  <span className="font-kr text-xs text-ink-faint">{q.email}</span>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 font-kr text-[11px]",
                  q.status === "ANSWERED" ? "bg-ink text-cream-warm" : q.status === "CLOSED" ? "bg-line text-ink-soft" : "bg-clay-soft/50 text-clay-deep")}>
                  {INQUIRY_STATUS_LABEL[q.status] ?? q.status}
                </span>
              </div>

              <p className="mt-1 font-kr text-xs text-ink-faint">{formatDateTime(q.createdAt)}</p>
              <p className="mt-2 whitespace-pre-line font-kr text-sm leading-relaxed text-ink">{q.message}</p>

              {q.answer ? (
                <div className="mt-3 rounded-[3px] bg-cream-warm px-4 py-3">
                  <p className="font-kr text-xs font-semibold text-clay-deep">답변 · {formatDateTime(q.answeredAt)}</p>
                  <p className="mt-1 whitespace-pre-line font-kr text-sm leading-relaxed text-ink-soft">{q.answer}</p>
                  {q.status !== "CLOSED" && (
                    <button
                      type="button"
                      disabled={busyId === q.id}
                      onClick={() => close(q.id)}
                      className="mt-2 font-kr text-xs text-ink-faint underline-offset-2 hover:text-ink hover:underline"
                    >
                      문의 종료
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-3">
                  <textarea
                    value={drafts[q.id] ?? ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                    rows={3}
                    maxLength={2000}
                    placeholder="답변을 입력하세요"
                    className="w-full rounded-[3px] border border-line bg-cream-warm/40 px-3 py-2 font-kr text-sm text-ink outline-none focus:border-clay-deep"
                  />
                  <button
                    type="button"
                    disabled={busyId === q.id}
                    onClick={() => answer(q.id)}
                    className="mt-2 rounded-[2px] bg-ink px-4 py-2 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-50"
                  >
                    답변 등록
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
