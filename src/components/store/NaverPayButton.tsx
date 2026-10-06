"use client";

import { useEffect, useId, useRef, useState } from "react";

import { api, ApiError } from "@/lib/api/client";

/**
 * 네이버페이 [구매하기] 버튼 (2026-10-06).
 *
 * 네이버페이 주문형(직가맹) 구매 버튼 SDK v2 를 쓴다(가맹점 연동 가이드 2.1, 2026-02-04).
 * 누르면 우리 서버가 주문 정보를 네이버에 등록하고 받은 인증키·가맹점번호를 SDK 에 돌려준다.
 * SDK 가 그 값으로 네이버페이 주문서를 연다 — 손님은 네이버에 저장된 배송지·결제수단으로 결제한다.
 *
 * ★ 서버 설정이 꺼져 있거나 키가 비면 아무것도 그리지 않는다(지금 운영 상태). 가맹 승인 뒤 켠다.
 * ★ 화면은 «무엇을 몇 개»만 보낸다. 가격은 서버가 DB 에서 다시 읽는다 (CLAUDE.md 규칙 5).
 * ★ 옵션 상품·품절 상품에는 띄우지 않는다(eligible=false). 가이드도 품절이면 버튼을 넣지 않길 권장한다.
 * ★ 찜·톡톡은 연동하지 않아 꺼 둔다. 버튼 영역은 가이드대로 너비 200px 이상, 높이 150px.
 */

type NaverPayConfig = {
  enabled: boolean;
  buttonKey?: string | null;
  scriptUrl?: string | null;
};

type NpaySdk = { order: { create: (options: Record<string, unknown>) => unknown } };

declare global {
  interface Window {
    Npay?: NpaySdk;
  }
}

let configPromise: Promise<NaverPayConfig> | null = null;

/** 설정은 페이지당 한 번만 묻는다. 실패하면 꺼진 것으로 본다. */
function loadConfig(): Promise<NaverPayConfig> {
  if (!configPromise) {
    configPromise = api.get<NaverPayConfig>("/api/naverpay/config").catch(() => ({ enabled: false }));
  }
  return configPromise;
}

const scriptPromises = new Map<string, Promise<void>>();

function loadScript(src: string): Promise<void> {
  const existing = scriptPromises.get(src);
  if (existing) return existing;
  const p = new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => {
      scriptPromises.delete(src); // 다음에 다시 시도할 수 있게
      reject(new Error("네이버페이 버튼을 불러오지 못했습니다."));
    };
    document.head.appendChild(el);
  });
  scriptPromises.set(src, p);
  return p;
}

export function NaverPayButton({
  productId,
  eligible,
  getQuantity,
}: {
  productId: number;
  /** 옵션 없는 단일 상품이고 품절이 아닐 때만 true */
  eligible: boolean;
  /** 버튼을 누르는 순간의 수량. 수량을 바꿔도 다시 그리지 않도록 함수로 받는다. */
  getQuantity: () => number;
}) {
  const [config, setConfig] = useState<NaverPayConfig | null>(null);
  const containerId = `npay-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const created = useRef(false);
  const quantityRef = useRef(getQuantity);
  quantityRef.current = getQuantity;

  useEffect(() => {
    if (!eligible) return;
    let alive = true;
    void loadConfig().then((c) => {
      if (alive) setConfig(c);
    });
    return () => {
      alive = false;
    };
  }, [eligible]);

  useEffect(() => {
    if (!eligible || !config?.enabled || !config.buttonKey || !config.scriptUrl || created.current) return;
    let cancelled = false;
    loadScript(config.scriptUrl)
      .then(() => {
        if (cancelled || created.current || !window.Npay) return;
        created.current = true;
        // SDK 초기화가 실패하면(키 오류·네이버 장애) SDK 가 거절된 약속을 그대로 던진다.
        // 받아 두지 않으면 처리되지 않은 오류로 콘솔에 남는다. 버튼 자리만 비고 사이트 결제는 그대로다.
        void Promise.resolve(window.Npay.order.create({
          buttonKey: config.buttonKey,
          containerId,
          orderRegistrationVersion: "2.1",
          type: "template",
          colorTheme: "green",
          enable: true,
          components: { wishlist: false, talkTalk: false, benefitMessage: true, benefitCoachMark: true },
          onBuyClick: async () => {
            try {
              const r = await api.post<{ key: string; merchantNo: string }>("/api/naverpay/orders", {
                productId,
                quantity: quantityRef.current(),
              });
              return { key: r.key, merchantNo: r.merchantNo };
            } catch (e) {
              // 네이버 가이드는 구매 불가 사유를 경고창으로 알리도록 한다(표 2-5).
              window.alert(
                e instanceof ApiError ? e.message : "네이버페이 주문을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.",
              );
              return null;
            }
          },
        })).catch(() => undefined);
      })
      .catch(() => {
        // SDK 를 못 불러오면 버튼 자리를 비워 둔다. 사이트 자체 결제는 그대로 쓸 수 있다.
      });
    return () => {
      cancelled = true;
    };
  }, [eligible, config, containerId, productId]);

  if (!eligible || !config?.enabled) return null;

  return <div id={containerId} className="mt-3 h-[150px] w-full min-w-[200px]" />;
}
