"use client";

import { useRef, useState } from "react";
import { uploadImage, ApiError } from "@/lib/api/client";

/**
 * 이미지 한 장 업로드.
 *
 * 파일을 고르면 바로 서버로 올린다. 서버가 검증·재인코딩·리사이즈·WebP 변환을 하고
 * 저장 키와 미리보기 URL 을 돌려준다. 폼에는 키만 저장한다.
 *
 * ★ 권장 크기 안내 문구를 반드시 보여준다 (기획서 §7.2, CLAUDE.md 규칙 4).
 *   비개발자가 어떤 크기로 올려야 하는지 알 수 있어야 한다.
 */
export function ImageUploader({
  label,
  hint,
  previewUrl,
  category = "products",
  onChange,
  onClear,
}: {
  label: string;
  hint: string;
  previewUrl: string | null;
  category?: string;
  onChange: (key: string, url: string) => void;
  onClear?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const res = await uploadImage(file, category);
      // medium 을 미리보기로 쓴다. 없으면 thumb.
      const url = res.urls.medium ?? res.urls.thumb ?? Object.values(res.urls)[0];
      onChange(res.key, url);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "업로드에 실패했습니다.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-kr text-sm font-medium text-ink">{label}</span>
        <span className="font-kr text-xs text-ink-faint">{hint}</span>
      </div>

      <div className="mt-1.5 flex items-center gap-3">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-line bg-cream-warm">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="미리보기" className="h-full w-full object-cover" />
          ) : (
            <span className="font-kr text-xs text-ink-faint">없음</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-[2px] border border-ink px-3 py-1.5 font-kr text-xs font-medium text-ink transition hover:bg-ink hover:text-cream-warm disabled:opacity-50"
          >
            {busy ? "올리는 중…" : previewUrl ? "다른 이미지" : "이미지 선택"}
          </button>
          {previewUrl && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="font-kr text-xs text-ink-faint transition hover:text-clay-deep"
            >
              제거
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
        />
      </div>

      {error && <p className="mt-2 font-kr text-xs text-clay-deep">{error}</p>}
    </div>
  );
}
