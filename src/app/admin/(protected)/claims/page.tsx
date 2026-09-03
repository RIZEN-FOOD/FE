"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import { formatDateTime } from "@/lib/datetime";
import { cn } from "@/lib/cn";
import { CLAIM_STATUS_LABEL, CLAIM_TYPE_LABEL, type ClaimStatus, type ClaimType } from "@/types/order";

type AdminClaim = {
  id: number;
  orderNo: string;
  ordererName: string;
  type: ClaimType;
  reasonCode: string;
  status: ClaimStatus;
  orderTotal: number;
  requestedAt: string;
  processedAt: string | null;
};
type ClaimPage = { items: AdminClaim[]; totalCount: number };

/**
 * 취소·반품·교환 처리. 접수된 요청을 승인/반려/완료 처리한다.
 * 취소·반품을 완료하면 재고가 자동으로 원복되고 주문·결제가 정리된다.
 */
export default function AdminClaimsPage() {
  const [data, setData] = useState<ClaimPage | null>(null);
  const [status, setStatus] = useState<string>("REQUESTED");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = status ? `&status=${status}` : "";
      setData(await api.get<ClaimPage>(`/api/admin/claims?page=0&size=100${q}`));
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

  async function process(id: number, next: ClaimStatus, verb: string) {
    let memo = "";
    if (next === "REJECTED") {
      memo = window.prompt("반려 사유를 입력하세요 (고객에게 표시됩니다).") ?? "";
      if (!memo.trim()) return;
    } else if (!window.confirm(`이 요청을 '${verb}' 처리할까요?`)) {
      return;
    }
    setBusyId(id);
    try {
      await api.patch(`/api/admin/claims/${id}`, { status: next, adminMemo: memo || undefined });
      await load();
      flash(`${verb} 처리되었습니다.`);
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "처리에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  }

  const FILTERS = [
    { value: "REQUESTED", label: "접수됨" },
    { value: "APPROVED", label: "승인" },
    { value: "COMPLETED", label: "완료" },
    { value: "REJECTED", label: "반려" },
    { value: "", label: "전체" },
  ];

  return (
    <div>
      <h1 className="font-kr text-2xl font-bold text-ink">취소·반품·교환</h1>
      <p className="mt-1 font-kr text-sm text-ink-soft">
        취소·반품을 완료하면 재고가 자동으로 복원되고 주문·결제가 정리됩니다.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatus(f.value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 font-kr text-xs transition",
              status === f.value
                ? "border-ink bg-ink text-cream-warm"
                : "border-line text-ink-soft hover:border-ink hover:text-ink",
            )}
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
        <p className="mt-10 font-kr text-sm text-ink-faint">해당하는 요청이 없습니다.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {data.items.map((c) => (
            <li key={c.id} className="rounded-[4px] border border-line bg-paper p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-cream-warm px-2.5 py-0.5 font-kr text-[11px] font-medium text-clay-deep">
                    {CLAIM_TYPE_LABEL[c.type]}
                  </span>
                  <Link
                    href={`/admin/orders/${c.orderNo}`}
                    className="font-numeric text-xs text-berry underline-offset-2 hover:underline"
                  >
                    {c.orderNo}
                  </Link>
                  <span className="font-kr text-sm text-ink">{c.ordererName}</span>
                </div>
                <span className="font-kr text-xs text-ink-faint">{CLAIM_STATUS_LABEL[c.status]}</span>
              </div>

              <p className="mt-2 font-kr text-xs text-ink-soft">
                사유: {c.reasonCode} · 주문금액 {c.orderTotal.toLocaleString("ko-KR")}원 ·{" "}
                {formatDateTime(c.requestedAt)} 접수
                {c.processedAt ? ` · ${formatDateTime(c.processedAt)} 처리` : ""}
              </p>

              {c.status === "REQUESTED" && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={busyId === c.id}
                    onClick={() => process(c.id, "COMPLETED", "완료")}
                    className="rounded-[2px] bg-ink px-3 py-1.5 font-kr text-xs font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-50"
                  >
                    승인·완료
                  </button>
                  <button
                    type="button"
                    disabled={busyId === c.id}
                    onClick={() => process(c.id, "REJECTED", "반려")}
                    className="rounded-[2px] border border-line px-3 py-1.5 font-kr text-xs text-ink transition hover:bg-clay-soft/40 disabled:opacity-50"
                  >
                    반려
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
