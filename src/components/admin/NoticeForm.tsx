"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api/client";
import { RichTextEditor } from "./RichTextEditor";
import { toDateTimeLocal, fromDateTimeLocal } from "@/lib/datetime";
import { NOTICE_CATEGORIES, type NoticeAdminItem, type NoticeSaveRequest } from "@/types/content";

/**
 * 공지 작성·수정 폼.
 *
 * 발행 방식을 세 가지로 명확히 나눈다.
 *  - 지금 공개: 발행일을 지금으로 두고 저장
 *  - 예약: 발행일을 미래로 두면 그때 자동 공개
 *  - 임시저장: 발행일을 비워두면 공개되지 않는다
 *
 * 본문은 저장 시 서버가 살균한다.
 */
export function NoticeForm({
  mode,
  noticeId,
  initial,
}: {
  mode: "create" | "edit";
  noticeId?: number;
  initial?: NoticeAdminItem;
}) {
  const router = useRouter();
  const [category, setCategory] = useState(initial?.category ?? "NOTICE");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [bodyHtml, setBodyHtml] = useState(initial?.bodyHtml ?? "");
  const [pinned, setPinned] = useState(initial?.pinned ?? false);
  // 발행 방식: now(지금) | schedule(예약) | draft(임시저장)
  const initialMode = initial ? (initial.publishedAt ? "schedule" : "draft") : "now";
  const [publishMode, setPublishMode] = useState<"now" | "schedule" | "draft">(initialMode);
  const [scheduledAt, setScheduledAt] = useState(toDateTimeLocal(initial?.publishedAt ?? null));
  const [visible, setVisible] = useState(initial?.visible ?? true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function resolvePublishedAt(): string | null {
    if (publishMode === "draft") return null;
    if (publishMode === "now") return new Date().toISOString();
    return fromDateTimeLocal(scheduledAt);
  }

  async function save() {
    setErrors({});
    setBanner(null);

    if (publishMode === "schedule" && !scheduledAt) {
      setBanner("예약하려면 발행 일시를 입력해 주세요.");
      return;
    }

    setSaving(true);
    try {
      const body: NoticeSaveRequest = {
        category,
        title: title.trim(),
        bodyHtml,
        pinned,
        publishedAt: resolvePublishedAt(),
        visible,
      };
      if (mode === "create") {
        const res = await api.post<{ id: number }>("/api/admin/notices", body);
        router.replace(`/admin/notice/${res.id}`);
      } else {
        await api.put(`/api/admin/notices/${noticeId}`, body);
        setBanner("저장되었습니다.");
      }
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.fields) setErrors(e.fields);
        setBanner(e.message);
      } else {
        setBanner("저장 중 문제가 발생했습니다.");
      }
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-[3px] border border-line bg-cream-warm px-3 py-2 font-kr text-sm outline-none focus:border-clay-deep";

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-kr text-2xl font-bold text-ink">{mode === "create" ? "새 공지 작성" : "공지 수정"}</h1>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-[2px] bg-ink px-5 py-2 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-50"
        >
          {saving ? "저장 중…" : "저장"}
        </button>
      </div>

      {banner && (
        <p className="mt-4 rounded-[3px] bg-clay-soft/40 px-3 py-2 font-kr text-sm text-clay-deep">{banner}</p>
      )}

      <div className="mt-6 flex flex-col gap-5 rounded-[4px] border border-line bg-paper px-5 py-5">
        <div className="grid grid-cols-[140px_1fr] gap-4">
          <label className="block">
            <span className="font-kr text-sm font-medium text-ink">구분</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={`mt-1.5 ${inputCls}`}>
              {NOTICE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="font-kr text-sm font-medium text-ink">제목 <span className="text-clay-deep">*</span></span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={`mt-1.5 ${inputCls}`} />
            {errors.title && <p className="mt-1 font-kr text-xs text-clay-deep">{errors.title}</p>}
          </label>
        </div>

        <div>
          <span className="font-kr text-sm font-medium text-ink">내용 <span className="text-clay-deep">*</span></span>
          <div className="mt-1.5">
            <RichTextEditor value={bodyHtml} onChange={setBodyHtml} />
          </div>
          {errors.bodyHtml && <p className="mt-1 font-kr text-xs text-clay-deep">{errors.bodyHtml}</p>}
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="h-4 w-4 accent-ink" />
          <span className="font-kr text-sm text-ink">목록 맨 위에 고정</span>
        </label>

        {/* 발행 방식 */}
        <div className="border-t border-line pt-4">
          <p className="font-kr text-sm font-medium text-ink">발행</p>
          <div className="mt-2 flex flex-col gap-2">
            {[
              { v: "now", label: "지금 공개" },
              { v: "schedule", label: "예약 발행 (정한 시각에 자동 공개)" },
              { v: "draft", label: "임시저장 (공개하지 않음)" },
            ].map((opt) => (
              <label key={opt.v} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="publishMode"
                  checked={publishMode === opt.v}
                  onChange={() => setPublishMode(opt.v as typeof publishMode)}
                  className="h-4 w-4 accent-ink"
                />
                <span className="font-kr text-sm text-ink">{opt.label}</span>
              </label>
            ))}
          </div>
          {publishMode === "schedule" && (
            <label className="mt-3 block">
              <span className="font-kr text-xs text-ink-soft">발행 일시</span>
              <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className={`mt-1 ${inputCls}`} />
            </label>
          )}
        </div>

        <label className="flex items-center gap-2 border-t border-line pt-4">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="h-4 w-4 accent-ink" />
          <span className="font-kr text-sm text-ink">노출 허용</span>
          <span className="font-kr text-xs text-ink-faint">(끄면 발행일과 무관하게 숨겨집니다)</span>
        </label>
      </div>
    </div>
  );
}
