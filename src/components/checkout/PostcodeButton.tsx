"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * 우편번호(주소) 검색 버튼 — Daum 우편번호 서비스.
 *
 * 누르면 화면 안에 검색창이 뜨고, 고른 주소의 우편번호·기본주소를 onComplete 로 돌려준다.
 * 상세주소(동·호수)는 사용자가 직접 입력한다.
 *
 * ★ 새 창(팝업)이 아니라 화면 안에 띄운다(embed). 팝업 차단을 켜 둔 브라우저에서
 *   아무 반응 없이 주문이 막히는 일을 없애기 위해서다. 휴대폰에서도 창 전환이 없다.
 *
 * ★ 무료 공개 위젯이라 키·계약이 필요 없다. 스크립트는 처음 누를 때 한 번만 로드한다.
 *   (서버 렌더에는 영향이 없도록 클라이언트에서만 동작한다.)
 */

const SCRIPT_SRC = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

declare global {
  interface Window {
    // Daum 우편번호 위젯이 전역에 심는 객체.
    daum?: {
      Postcode: new (opts: DaumPostcodeOptions) => { embed: (el: HTMLElement) => void };
    };
  }
}

type DaumPostcodeData = {
  zonecode: string; // 5자리 우편번호
  roadAddress: string; // 도로명 주소
  jibunAddress: string; // 지번 주소
  userSelectedType: "R" | "J"; // 사용자가 고른 표기(도로명/지번)
};

type DaumPostcodeOptions = {
  oncomplete: (data: DaumPostcodeData) => void;
  onclose?: (state: string) => void;
  width?: string | number;
  height?: string | number;
};

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.daum?.Postcode) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("load failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("load failed"));
    document.body.appendChild(script);
  });
}

export function PostcodeButton({
  onComplete,
  className,
  children,
}: {
  onComplete: (value: { zonecode: string; address: string }) => void;
  className?: string;
  children?: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const start = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await loadScript();
      if (!window.daum?.Postcode) throw new Error("unavailable");
      setOpen(true);
    } catch {
      setError("우편번호 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 창이 열린 뒤에 검색 위젯을 그 안에 그린다(그릴 자리가 있어야 embed 가 된다).
  useEffect(() => {
    if (!open || !boxRef.current || !window.daum?.Postcode) return;
    boxRef.current.innerHTML = "";
    new window.daum.Postcode({
      oncomplete: (data) => {
        const address = data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
        onComplete({ zonecode: data.zonecode, address });
        setOpen(false);
      },
      onclose: () => setOpen(false),
      width: "100%",
      height: "100%",
    }).embed(boxRef.current);
  }, [open, onComplete]);

  // 열려 있는 동안 뒤 배경이 스크롤되지 않게 한다.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={start} disabled={loading} className={className}>
        {children ?? (loading ? "여는 중…" : "주소 검색")}
      </button>

      {error && <p className="mt-1 font-kr text-caption text-clay-deep">{error}</p>}

      {/* body 에 바로 띄운다. 페이지 안쪽에 움직임(transform)이 걸린 요소가 있으면
          fixed 가 화면이 아니라 그 요소 기준으로 잡혀 창이 엉뚱한 곳에 뜬다. */}
      {open && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="주소 검색"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="flex h-[min(560px,calc(100dvh-2rem))] w-full max-w-[500px] flex-col overflow-hidden rounded-[12px] bg-paper shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="font-kr text-sm font-bold text-ink">주소 검색</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="font-kr text-sm text-ink-soft transition hover:text-ink"
              >
                닫기
              </button>
            </div>
            <div ref={boxRef} className="min-h-0 flex-1" />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
