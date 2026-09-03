"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api/client";
import { formatDateTime } from "@/lib/datetime";
import { cn } from "@/lib/cn";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { ADMIN_ORDER_STATUSES, type AdminOrderPage, type AdminOrderSummary } from "@/types/adminOrder";

/**
 * 주문 관리 목록. 상태로 거르고, 클릭하면 상세로 들어간다.
 */
export default function AdminOrdersPage() {
  const [data, setData] = useState<AdminOrderPage | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = status ? `&status=${status}` : "";
      setData(await api.get<AdminOrderPage>(`/api/admin/orders?page=0&size=100${q}`));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const won = (n: number) => n.toLocaleString("ko-KR");

  return (
    <div>
      <h1 className="font-kr text-2xl font-bold text-ink">주문 관리</h1>
      <p className="mt-1 font-kr text-sm text-ink-soft">주문을 확인하고 상태를 변경하거나 운송장을 등록합니다.</p>

      {/* 상태 필터 */}
      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip label="전체" active={status === ""} onClick={() => setStatus("")} />
        {ADMIN_ORDER_STATUSES.map((s) => (
          <FilterChip
            key={s.value}
            label={s.label}
            active={status === s.value}
            onClick={() => setStatus(s.value)}
          />
        ))}
      </div>

      {loading ? (
        <p className="mt-10 font-kr text-sm text-ink-faint">불러오는 중…</p>
      ) : !data || data.items.length === 0 ? (
        <p className="mt-10 font-kr text-sm text-ink-faint">해당하는 주문이 없습니다.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left font-kr text-xs text-ink-faint">
                <th className="py-2.5 pr-3 font-medium">주문일시</th>
                <th className="py-2.5 pr-3 font-medium">주문번호</th>
                <th className="py-2.5 pr-3 font-medium">주문자</th>
                <th className="py-2.5 pr-3 font-medium">상품</th>
                <th className="py-2.5 pr-3 text-right font-medium">금액</th>
                <th className="py-2.5 pr-3 font-medium">상태</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((o: AdminOrderSummary) => (
                <tr key={o.orderNo} className="border-b border-line/60 hover:bg-clay-soft/20">
                  <td className="py-3 pr-3 font-kr text-xs text-ink-soft">{formatDateTime(o.orderedAt)}</td>
                  <td className="py-3 pr-3">
                    <Link
                      href={`/admin/orders/${o.orderNo}`}
                      className="font-numeric text-xs text-berry underline-offset-2 hover:underline"
                    >
                      {o.orderNo}
                    </Link>
                  </td>
                  <td className="py-3 pr-3 font-kr text-ink">{o.ordererName}</td>
                  <td className="py-3 pr-3 font-kr text-ink-soft">{o.title}</td>
                  <td className="py-3 pr-3 text-right font-numeric text-ink">{won(o.totalAmount)}원</td>
                  <td className="py-3 pr-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 font-kr text-xs transition",
        active ? "border-ink bg-ink text-cream-warm" : "border-line text-ink-soft hover:border-ink hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
