"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import { formatDateTime } from "@/lib/datetime";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { ADMIN_ORDER_STATUSES, type AdminOrderDetail } from "@/types/adminOrder";

/**
 * 주문 상세(관리자). 배송 처리를 위해 연락처·주소를 그대로 보여준다.
 * 상태 변경과 운송장 등록을 여기서 한다.
 */
export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNo: string }>;
}) {
  const { orderNo } = use(params);
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [carrier, setCarrier] = useState("");
  const [trackingNo, setTrackingNo] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const o = await api.get<AdminOrderDetail>(`/api/admin/orders/${orderNo}`);
    setOrder(o);
    setCarrier(o.delivery?.carrier ?? "");
    setTrackingNo(o.delivery?.trackingNo ?? "");
  }, [orderNo]);

  useEffect(() => {
    load();
  }, [load]);

  function flash(t: string) {
    setMessage(t);
    window.setTimeout(() => setMessage(null), 2800);
  }

  async function changeStatus(status: string) {
    setBusy(true);
    try {
      await api.patch(`/api/admin/orders/${orderNo}/status`, { status });
      await load();
      flash("상태를 변경했습니다.");
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "변경에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function registerTracking() {
    setBusy(true);
    try {
      await api.put(`/api/admin/orders/${orderNo}/delivery`, { carrier, trackingNo });
      await load();
      flash("운송장을 등록했습니다. 주문이 배송중으로 바뀌었습니다.");
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "등록에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  if (!order) return <p className="font-kr text-sm text-ink-faint">불러오는 중…</p>;

  const won = (n: number) => n.toLocaleString("ko-KR");

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="font-kr text-sm text-ink-soft underline-offset-4 hover:underline">
        ← 주문 목록
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-numeric text-xl font-bold text-ink">{order.orderNo}</h1>
          <p className="mt-1 font-kr text-xs text-ink-faint">{formatDateTime(order.orderedAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {message && (
        <p className="mt-4 rounded-[3px] bg-clay-soft/40 px-3 py-2 font-kr text-sm text-clay-deep">{message}</p>
      )}

      {/* 상태 변경 */}
      <section className="mt-6 rounded-[4px] border border-line bg-paper p-5">
        <h2 className="font-kr text-sm font-bold text-ink">상태 변경</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {ADMIN_ORDER_STATUSES.filter((s) => s.value !== "PENDING").map((s) => (
            <button
              key={s.value}
              type="button"
              disabled={busy || order.status === s.value}
              onClick={() => changeStatus(s.value)}
              className="rounded-[2px] border border-line px-3 py-1.5 font-kr text-xs text-ink transition hover:bg-ink hover:text-cream-warm disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink"
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {/* 운송장 */}
      <section className="mt-5 rounded-[4px] border border-line bg-paper p-5">
        <h2 className="font-kr text-sm font-bold text-ink">운송장 등록</h2>
        <p className="mt-1 font-kr text-xs text-ink-soft">등록하면 주문이 자동으로 &lsquo;배송중&rsquo;으로 바뀝니다.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1.5fr_auto]">
          <input
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            placeholder="택배사 (예: CJ대한통운)"
            className="h-[42px] rounded-[3px] border border-line bg-cream-warm/40 px-3 font-kr text-sm text-ink outline-none focus:border-clay-deep"
          />
          <input
            value={trackingNo}
            onChange={(e) => setTrackingNo(e.target.value)}
            placeholder="송장번호"
            className="h-[42px] rounded-[3px] border border-line bg-cream-warm/40 px-3 font-numeric text-sm text-ink outline-none focus:border-clay-deep"
          />
          <button
            type="button"
            disabled={busy || !carrier || !trackingNo}
            onClick={registerTracking}
            className="h-[42px] rounded-[2px] bg-ink px-4 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-40"
          >
            등록
          </button>
        </div>
        {order.delivery?.trackingNo && (
          <p className="mt-2 font-kr text-xs text-ink-soft">
            현재: {order.delivery.carrier} {order.delivery.trackingNo}
            {order.delivery.shippedAt ? ` · ${formatDateTime(order.delivery.shippedAt)} 발송` : ""}
          </p>
        )}
      </section>

      {/* 상품 */}
      <section className="mt-5 rounded-[4px] border border-line bg-paper p-5">
        <h2 className="font-kr text-sm font-bold text-ink">주문 상품</h2>
        <ul className="mt-3 divide-y divide-line">
          {order.items.map((it, i) => (
            <li key={i} className="flex justify-between py-2.5 font-kr text-sm">
              <span className="text-ink">
                {it.name}
                {it.optionName ? ` (${it.optionName})` : ""} × {it.quantity}
              </span>
              <span className="font-numeric text-ink">{won(it.lineAmount)}원</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 flex flex-col gap-1 border-t border-line pt-3 font-kr text-sm">
          <Row k="상품 금액" v={`${won(order.itemsAmount)}원`} />
          <Row k="배송비" v={order.shippingFee === 0 ? "무료" : `${won(order.shippingFee)}원`} />
          <Row k="결제 금액" v={`${won(order.totalAmount)}원`} bold />
        </dl>
        {order.payment && (
          <p className="mt-2 font-kr text-xs text-ink-faint">
            결제: {order.payment.provider} · {order.payment.method ?? "-"} · {order.payment.status}
            {order.payment.approvedAt ? ` · ${formatDateTime(order.payment.approvedAt)}` : ""}
          </p>
        )}
      </section>

      {/* 배송지 · 주문자 (PII) */}
      <section className="mt-5 rounded-[4px] border border-line bg-paper p-5">
        <h2 className="font-kr text-sm font-bold text-ink">배송지 · 주문자</h2>
        <div className="mt-3 grid gap-1 font-kr text-sm text-ink-soft">
          <p>받는 분: {order.receiverName} · {order.receiverPhone}</p>
          <p>[{order.zipcode}] {order.addr1} {order.addr2 ?? ""}</p>
          {order.deliveryMemo && <p className="text-ink-faint">메모: {order.deliveryMemo}</p>}
          <p className="mt-2 text-ink-faint">
            주문자: {order.ordererName} · {order.ordererPhone}
            {order.ordererEmail ? ` · ${order.ordererEmail}` : ""}
          </p>
        </div>
      </section>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-soft">{k}</dt>
      <dd className={bold ? "font-numeric font-bold text-ink" : "font-numeric text-ink"}>{v}</dd>
    </div>
  );
}
