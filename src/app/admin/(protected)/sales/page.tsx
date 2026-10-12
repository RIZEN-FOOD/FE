"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import { formatDateTime } from "@/lib/datetime";
import { cn } from "@/lib/cn";
import { ADMIN_ORDER_STATUSES } from "@/types/adminOrder";

type SalesLine = {
  kind: "PAID" | "REFUND";
  at: string | null;
  orderNo: string;
  orderStatus: string;
  taxFree: number;
  taxableGoods: number | null;
  shippingFee: number | null;
  taxable: number;
  total: number;
};
type SalesTotals = {
  paidCount: number;
  taxFreeSales: number;
  taxableGoodsSales: number;
  shippingFee: number;
  discount: number;
  refundCount: number;
  taxFreeRefund: number;
  taxableRefund: number;
  taxFreeNet: number;
  taxableNet: number;
  taxableSupply: number;
  taxableVat: number;
  totalNet: number;
};
type SalesReport = { from: string; to: string; totals: SalesTotals; lines: SalesLine[]; truncated: boolean };

/** 한국 날짜 yyyy-MM-dd. */
function ymd(d: Date): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(d);
}

/** 기간 바로 고르기. 부가세 신고 단위(1기 1~6월, 2기 7~12월)도 넣는다. */
function presets(): { label: string; from: string; to: string }[] {
  const today = ymd(new Date());
  const [y, m] = today.split("-").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const lastDay = (yy: number, mm: number) => new Date(yy, mm, 0).getDate();
  const pm = m === 1 ? 12 : m - 1;
  const py = m === 1 ? y - 1 : y;
  return [
    { label: "이번 달", from: `${y}-${pad(m)}-01`, to: today },
    { label: "지난 달", from: `${py}-${pad(pm)}-01`, to: `${py}-${pad(pm)}-${lastDay(py, pm)}` },
    { label: `${y}년 1기 (1~6월)`, from: `${y}-01-01`, to: `${y}-06-30` },
    { label: `${y}년 2기 (7~12월)`, from: `${y}-07-01`, to: `${y}-12-31` },
  ];
}

const won = (n: number) => n.toLocaleString("ko-KR");
const statusLabel = (s: string) => ADMIN_ORDER_STATUSES.find((x) => x.value === s)?.label ?? s;

/**
 * 매출 — 과세·면세 구분 (2026-10-12).
 *
 * 부가세 신고 때 면세 매출(예: 플레인)과 과세 매출을 나눠 적어야 해서 만들었다.
 * 결제는 결제일에 매출로 잡고, 취소·반품 환불은 환불한 날에 뺀다.
 * 엑셀은 세무사님께 그대로 보낼 수 있게 결제·환불 한 건씩 한 줄로 담는다.
 */
export default function AdminSalesPage() {
  const initial = presets()[0];
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [data, setData] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await api.get<SalesReport>(`/api/admin/sales?from=${from}&to=${to}`));
    } catch (e) {
      setData(null);
      setError(e instanceof ApiError ? e.message : "매출을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  async function download() {
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sales/export?from=${from}&to=${to}`, { credentials: "include" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message ?? "엑셀 파일을 만들지 못했습니다. 다시 로그인해 주세요.");
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const encoded = /filename\*=UTF-8''([^;]+)/i.exec(disposition)?.[1];
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = encoded ? decodeURIComponent(encoded) : "sales.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "엑셀 파일을 만들지 못했습니다.");
    } finally {
      setDownloading(false);
    }
  }

  const t = data?.totals;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-kr text-2xl font-bold text-ink">매출 (과세·면세)</h1>
          <p className="mt-1 font-kr text-sm text-ink-soft">
            부가세 신고용으로 과세·면세 매출을 나눠 봅니다. 결제는 결제일, 환불은 환불한 날 기준입니다.
          </p>
        </div>
        <button
          type="button"
          onClick={download}
          disabled={downloading || loading || !data}
          className="rounded-[3px] bg-ink px-4 py-2.5 font-kr text-sm font-medium text-cream-warm transition hover:bg-slate-deep disabled:opacity-50"
        >
          {downloading ? "만드는 중…" : "엑셀 받기"}
        </button>
      </div>

      {/* 기간 */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {presets().map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setFrom(p.from);
              setTo(p.to);
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 font-kr text-xs transition",
              from === p.from && to === p.to
                ? "border-ink bg-ink text-cream-warm"
                : "border-line text-ink-soft hover:border-ink hover:text-ink",
            )}
          >
            {p.label}
          </button>
        ))}
        <span className="ml-2 flex items-center gap-1.5 font-kr text-xs text-ink-soft">
          <input type="date" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)}
            className="border border-line bg-white px-2 py-1 font-numeric text-xs text-ink" aria-label="시작 날짜" />
          ~
          <input type="date" value={to} min={from} onChange={(e) => e.target.value && setTo(e.target.value)}
            className="border border-line bg-white px-2 py-1 font-numeric text-xs text-ink" aria-label="끝 날짜" />
        </span>
      </div>

      {error && <p className="mt-4 font-kr text-sm text-clay-deep">{error}</p>}

      {loading ? (
        <p className="mt-10 font-kr text-sm text-ink-faint">불러오는 중…</p>
      ) : t ? (
        <>
          {/* 합계 */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="border border-line bg-white p-5">
              <p className="font-kr text-xs font-medium text-ink-faint">면세 순매출</p>
              <p className="mt-1 font-numeric text-2xl font-bold text-ink">{won(t.taxFreeNet)}원</p>
              <dl className="mt-3 space-y-1 font-kr text-xs text-ink-soft">
                <Row label="면세 상품 매출" value={t.taxFreeSales} />
                <Row label="환불" value={-t.taxFreeRefund} />
              </dl>
            </div>
            <div className="border border-line bg-white p-5">
              <p className="font-kr text-xs font-medium text-ink-faint">과세 순매출 (부가세 포함)</p>
              <p className="mt-1 font-numeric text-2xl font-bold text-ink">{won(t.taxableNet)}원</p>
              <dl className="mt-3 space-y-1 font-kr text-xs text-ink-soft">
                <Row label="과세 상품 매출" value={t.taxableGoodsSales} />
                <Row label="배송비 (과세)" value={t.shippingFee} />
                <Row label="환불" value={-t.taxableRefund} />
                <div className="border-t border-line pt-1" />
                <Row label="공급가액" value={t.taxableSupply} />
                <Row label="부가세" value={t.taxableVat} />
              </dl>
            </div>
          </div>
          <p className="mt-3 font-kr text-xs text-ink-faint">
            합계 {won(t.totalNet)}원 · 결제 {t.paidCount}건 · 환불 {t.refundCount}건
            {t.discount > 0 && ` · 할인코드 ${won(t.discount)}원은 상품 금액 비율로 과세·면세에 나눠 뺐습니다`}
          </p>

          {/* 내역 */}
          {data.lines.length === 0 ? (
            <p className="mt-10 font-kr text-sm text-ink-faint">이 기간에는 결제·환불이 없습니다.</p>
          ) : (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-left font-kr text-xs text-ink-faint">
                    <th className="py-2.5 pr-3 font-medium">일시</th>
                    <th className="py-2.5 pr-3 font-medium">구분</th>
                    <th className="py-2.5 pr-3 font-medium">주문번호</th>
                    <th className="py-2.5 pr-3 text-right font-medium">면세</th>
                    <th className="py-2.5 pr-3 text-right font-medium">과세 상품</th>
                    <th className="py-2.5 pr-3 text-right font-medium">배송비</th>
                    <th className="py-2.5 pr-3 text-right font-medium">합계</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lines.map((l, i) => (
                    <tr key={`${l.orderNo}-${l.kind}-${i}`} className="border-b border-line/60">
                      <td className="py-2.5 pr-3 font-kr text-xs text-ink-soft">{formatDateTime(l.at)}</td>
                      <td className="py-2.5 pr-3 font-kr text-xs">
                        {l.kind === "PAID" ? (
                          <span className="text-ink">결제</span>
                        ) : (
                          <span className="text-clay-deep">환불</span>
                        )}
                        <span className="ml-1.5 text-ink-faint">{statusLabel(l.orderStatus)}</span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <Link href={`/admin/orders/${l.orderNo}`} className="font-numeric text-xs text-berry underline-offset-2 hover:underline">
                          {l.orderNo}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-3 text-right font-numeric text-xs">{won(l.taxFree)}</td>
                      <td className="py-2.5 pr-3 text-right font-numeric text-xs">
                        {l.taxableGoods != null ? won(l.taxableGoods) : won(l.taxable)}
                      </td>
                      <td className="py-2.5 pr-3 text-right font-numeric text-xs">
                        {l.shippingFee != null ? won(l.shippingFee) : "—"}
                      </td>
                      <td className="py-2.5 pr-3 text-right font-numeric text-xs font-medium">{won(l.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.truncated && (
                <p className="mt-3 font-kr text-xs text-ink-faint">내역이 많아 앞부분만 보여 줍니다. 전체는 엑셀로 받아 주세요.</p>
              )}
              <p className="mt-3 font-kr text-xs text-ink-faint">환불 줄의 과세 금액은 상품·배송비를 나누지 않고 &lsquo;과세 상품&rsquo; 칸에 합쳐 보여 줍니다.</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd className="font-numeric">{value.toLocaleString("ko-KR")}원</dd>
    </div>
  );
}
