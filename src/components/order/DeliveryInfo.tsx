"use client";

import { useState } from "react";

import { formatDateTime } from "@/lib/datetime";
import type { DeliveryView } from "@/types/order";

/**
 * 운송장 안내. 송장이 등록되기 전에는 아무것도 그리지 않는다.
 *
 * ★ 이게 없으면 손님 화면에 "배송중" 글자만 남아, 자기 택배가 어디 있는지 알 수 없다.
 *   조회 주소는 서버가 설정(shipping.tracking_url)에서 읽어 만들어 준다 — 택배사가 바뀌면
 *   관리자에서 주소만 고치면 된다. 주소가 없으면 송장번호만 보여주고 링크는 내지 않는다.
 * ★ 번호 복사를 같이 둔다. 택배사 조회 화면이 주소에 실린 송장번호를 자동으로 채워 주는지는
 *   택배사마다 다르고 실제 송장 없이는 확인할 수 없다. 안 채워지더라도 손님이 번호를 다시
 *   치지 않게 하려는 것이다.
 */
export function DeliveryInfo({ delivery }: { delivery: DeliveryView | null }) {
  const [copied, setCopied] = useState(false);
  if (!delivery) return null;

  const delivered = delivery.status === "DELIVERED";

  async function copyTrackingNo(trackingNo: string) {
    try {
      await navigator.clipboard.writeText(trackingNo);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드를 막아둔 브라우저. 번호는 화면에 그대로 보이니 그냥 넘어간다.
    }
  }

  return (
    <div className="mt-8 rounded-[12px] border border-line bg-paper p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-kr text-sm font-bold text-ink">배송 정보</h2>
        {delivered ? (
          <span className="font-kr text-caption text-ink-faint">
            배송 완료{delivery.deliveredAt ? ` · ${formatDateTime(delivery.deliveredAt)}` : ""}
          </span>
        ) : delivery.shippedAt ? (
          <span className="font-kr text-caption text-ink-faint">발송 {formatDateTime(delivery.shippedAt)}</span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        {delivery.carrier && <span className="font-kr text-sm text-ink">{delivery.carrier}</span>}
        <span className="font-numeric text-sm tracking-wide text-ink">{delivery.trackingNo}</span>

        <button
          type="button"
          onClick={() => copyTrackingNo(delivery.trackingNo)}
          className="rounded-[6px] border border-line px-3 py-1.5 font-kr text-caption text-ink-soft transition hover:border-ink hover:text-ink"
        >
          {copied ? "복사했습니다" : "번호 복사"}
        </button>

        {delivery.trackingUrl && (
          <a
            href={delivery.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[6px] border border-ink px-3 py-1.5 font-kr text-caption font-medium text-ink transition hover:bg-clay-soft/40"
          >
            배송조회
          </a>
        )}
      </div>

      <p className="mt-3 font-kr text-caption text-ink-faint">
        {delivery.trackingUrl
          ? "택배사 조회 화면이 새 창으로 열립니다. 번호가 자동으로 입력되지 않으면 복사한 번호를 붙여넣어 주세요. 발송 직후에는 조회가 되지 않을 수 있습니다."
          : "복사한 송장번호로 택배사 홈페이지에서 조회하실 수 있습니다."}
      </p>
    </div>
  );
}
