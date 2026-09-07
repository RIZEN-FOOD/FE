"use client";

/**
 * 루트 레이아웃 자체가 실패했을 때의 최후 폴백.
 *
 * 이 컴포넌트는 루트 레이아웃을 대체하므로 자체 <html>/<body> 를 렌더해야 하고,
 * globals.css 에 기대지 않고 인라인 스타일만 쓴다.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "24px",
          textAlign: "center",
          background: "#F4EFE6",
          color: "#221E1C",
          fontFamily:
            "'Pretendard Variable', system-ui, -apple-system, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
          문제가 발생했습니다
        </h1>
        <p style={{ fontSize: "14px", color: "#5A524C", margin: 0 }}>
          잠시 후 다시 시도해 주세요.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "8px",
            border: "none",
            borderRadius: "2px",
            background: "#221E1C",
            color: "#FAF7F1",
            padding: "10px 24px",
            fontSize: "13.5px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          다시 시도
        </button>
      </body>
    </html>
  );
}
