"use client";

import { useCallback, useState } from "react";

/**
 * 우편번호(주소) 검색 버튼 — Daum 우편번호 서비스.
 *
 * 누르면 검색 팝업이 뜨고, 고른 주소의 우편번호·기본주소를 onComplete 로 돌려준다.
 * 상세주소(동·호수)는 사용자가 직접 입력한다.
 *
 * ★ 무료 공개 위젯이라 키·계약이 필요 없다. 스크립트는 처음 누를 때 한 번만 로드한다.
 *   (서버 렌더에는 영향이 없도록 클라이언트에서만 동작한다.)
 */

const SCRIPT_SRC = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

declare global {
  interface Window {
    // Daum 우편번호 위젯이 전역에 심는 객체.
    daum?: { Postcode: new (opts: DaumPostcodeOptions) => { open: () => void } };
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

  const open = useCallback(async () => {
    setLoading(true);
    try {
      await loadScript();
      if (!window.daum?.Postcode) throw new Error("unavailable");
      new window.daum.Postcode({
        oncomplete: (data) => {
          const address = data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
          onComplete({ zonecode: data.zonecode, address });
        },
      }).open();
    } catch {
      alert("우편번호 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }, [onComplete]);

  return (
    <button type="button" onClick={open} disabled={loading} className={className}>
      {children ?? (loading ? "여는 중…" : "주소 검색")}
    </button>
  );
}
