"use client";

import { useRef, useState } from "react";

/**
 * 송장 엑셀 일괄 등록.
 *
 * 출고 대행사(3PL)가 '출고용 엑셀' 맨 뒤 두 칸(택배사·송장번호)을 채워 보내면,
 * 그 파일을 그대로 올려 한 번에 반영한다. 주문 하나씩 손으로 넣지 않아도 된다.
 *
 * 잘못된 줄이 섞여 있어도 나머지는 반영되고, 못 넣은 줄만 이유와 함께 표시된다.
 * 같은 파일을 두 번 올려도 이미 들어간 송장은 건너뛴다.
 */
type Failure = { rowNo: number; orderNo: string | null; reason: string };
type Result = { message: string; total: number; applied: number; skipped: number; failures: Failure[] };

export function TrackingUpload({ onApplied }: { onApplied: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/orders/delivery/bulk", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const body = (await res.json().catch(() => ({}))) as Partial<Result> & { message?: string };
      if (!res.ok) {
        throw new Error(body.message ?? "송장을 등록하지 못했습니다.");
      }
      setResult(body as Result);
      if ((body.applied ?? 0) > 0) {
        onApplied();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "송장을 등록하지 못했습니다.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = ""; // 같은 파일을 다시 고를 수 있게
    }
  }

  return (
    <div className="relative flex flex-col items-end gap-1">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="rounded-[3px] border border-ink px-4 py-2.5 font-kr text-sm font-medium text-ink transition hover:bg-clay-soft/40 disabled:opacity-50"
      >
        {busy ? "등록 중…" : "송장 엑셀 등록"}
      </button>
      <p className="font-kr text-xs text-ink-faint">받은 엑셀에 송장번호를 채워 올리세요.</p>

      {error && <p className="font-kr text-xs text-clay-deep">{error}</p>}

      {result && (
        <div className="absolute right-0 top-full z-10 mt-2 w-[26rem] rounded-[4px] border border-line bg-paper px-4 py-3 text-left shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
          <div className="flex items-start justify-between gap-3">
            <p className="font-kr text-sm font-bold text-ink">{result.message}</p>
            <button
              type="button"
              onClick={() => setResult(null)}
              aria-label="결과 닫기"
              className="shrink-0 font-kr text-xs text-ink-faint transition hover:text-ink"
            >
              닫기
            </button>
          </div>
          <p className="mt-1 font-kr text-xs text-ink-soft">
            읽은 줄 {result.total}개 · 반영 {result.applied}건
            {result.skipped > 0 && <> · 이미 등록돼 있어 건너뜀 {result.skipped}건</>}
          </p>

          {result.failures.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1 border-t border-line pt-3">
              {result.failures.map((f) => (
                <li key={`${f.rowNo}-${f.orderNo ?? ""}`} className="font-kr text-xs text-clay-deep">
                  {f.rowNo}번째 줄{f.orderNo ? ` (${f.orderNo})` : ""} — {f.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
