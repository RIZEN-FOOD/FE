"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api/client";
import { ImageUploader } from "./ImageUploader";
import { toDateTimeLocal, fromDateTimeLocal } from "@/lib/datetime";
import { BANNER_POSITIONS, type BannerAdminItem, type BannerSaveRequest } from "@/types/content";

/**
 * 배너 등록·수정 폼.
 *
 * ★ PC·모바일 이미지를 각각 받는다. 하나로 쓰면 어느 한쪽이 깨진다.
 * ★ 대체 텍스트는 접근성 필수라 비워둘 수 없다.
 */
type ImgSlot = { key: string; url: string };

export function BannerForm({
  mode,
  bannerId,
  initial,
}: {
  mode: "create" | "edit";
  bannerId?: number;
  initial?: BannerAdminItem;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [pcImage, setPcImage] = useState<ImgSlot | null>(
    initial ? { key: initial.imagePcKey, url: initial.imagePcUrl ?? "" } : null,
  );
  const [mobileImage, setMobileImage] = useState<ImgSlot | null>(
    initial ? { key: initial.imageMobileKey, url: initial.imageMobileUrl ?? "" } : null,
  );
  const [altText, setAltText] = useState(initial?.altText ?? "");
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl ?? "");
  const [position, setPosition] = useState(initial?.position ?? "MAIN_TOP");
  const [openNewTab, setOpenNewTab] = useState(initial?.openNewTab ?? false);
  const [alwaysOn, setAlwaysOn] = useState(initial?.alwaysOn ?? true);
  const [startAt, setStartAt] = useState(toDateTimeLocal(initial?.startAt ?? null));
  const [endAt, setEndAt] = useState(toDateTimeLocal(initial?.endAt ?? null));
  const [visible, setVisible] = useState(initial?.visible ?? true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setErrors({});
    setBanner(null);
    setSaving(true);
    try {
      const body: BannerSaveRequest = {
        title: title.trim(),
        imagePcKey: pcImage?.key ?? "",
        imageMobileKey: mobileImage?.key ?? "",
        altText: altText.trim(),
        linkUrl: linkUrl.trim(),
        position,
        openNewTab,
        alwaysOn,
        startAt: alwaysOn ? null : fromDateTimeLocal(startAt),
        endAt: alwaysOn ? null : fromDateTimeLocal(endAt),
        visible,
      };
      if (mode === "create") {
        const res = await api.post<{ id: number }>("/api/admin/banners", body);
        router.replace(`/admin/banners/${res.id}`);
      } else {
        await api.put(`/api/admin/banners/${bannerId}`, body);
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
        <h1 className="font-kr text-2xl font-bold text-ink">{mode === "create" ? "새 배너 등록" : "배너 수정"}</h1>
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
        <label className="block">
          <span className="font-kr text-sm font-medium text-ink">배너 제목 <span className="text-clay-deep">*</span></span>
          <span className="ml-2 font-kr text-xs text-ink-faint">관리용입니다. 화면에는 안 보입니다.</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={`mt-1.5 ${inputCls}`} />
          {errors.title && <p className="mt-1 font-kr text-xs text-clay-deep">{errors.title}</p>}
        </label>

        <ImageUploader
          label="PC 이미지 *"
          hint="권장 1920×600 (가로로 넓게)"
          category="banners"
          previewUrl={pcImage?.url ?? null}
          onChange={(key, url) => setPcImage({ key, url })}
          onClear={() => setPcImage(null)}
        />
        {errors.imagePcKey && <p className="-mt-2 font-kr text-xs text-clay-deep">{errors.imagePcKey}</p>}

        <ImageUploader
          label="모바일 이미지 *"
          hint="권장 750×750 (정사각형에 가깝게)"
          category="banners"
          previewUrl={mobileImage?.url ?? null}
          onChange={(key, url) => setMobileImage({ key, url })}
          onClear={() => setMobileImage(null)}
        />
        {errors.imageMobileKey && <p className="-mt-2 font-kr text-xs text-clay-deep">{errors.imageMobileKey}</p>}

        <label className="block">
          <span className="font-kr text-sm font-medium text-ink">대체 텍스트 <span className="text-clay-deep">*</span></span>
          <span className="ml-2 font-kr text-xs text-ink-faint">화면을 못 보는 분에게 읽어줄 설명입니다.</span>
          <input value={altText} onChange={(e) => setAltText(e.target.value)} className={`mt-1.5 ${inputCls}`} />
          {errors.altText && <p className="mt-1 font-kr text-xs text-clay-deep">{errors.altText}</p>}
        </label>

        <label className="block">
          <span className="font-kr text-sm font-medium text-ink">연결 링크</span>
          <span className="ml-2 font-kr text-xs text-ink-faint">배너를 누르면 이동할 주소 (없으면 비워둠)</span>
          <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." className={`mt-1.5 ${inputCls}`} />
          {errors.linkUrl && <p className="mt-1 font-kr text-xs text-clay-deep">{errors.linkUrl}</p>}
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="font-kr text-sm font-medium text-ink">노출 위치</span>
            <select value={position} onChange={(e) => setPosition(e.target.value)} className={`mt-1.5 ${inputCls}`}>
              {BANNER_POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </label>
          <label className="flex items-end gap-2 pb-2">
            <input type="checkbox" checked={openNewTab} onChange={(e) => setOpenNewTab(e.target.checked)} className="h-4 w-4 accent-ink" />
            <span className="font-kr text-sm text-ink">새 창으로 열기</span>
          </label>
        </div>

        {/* 노출 기간 */}
        <div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={alwaysOn} onChange={(e) => setAlwaysOn(e.target.checked)} className="h-4 w-4 accent-ink" />
            <span className="font-kr text-sm text-ink">상시 노출</span>
          </label>
          {!alwaysOn && (
            <div className="mt-3 grid grid-cols-2 gap-4">
              <label className="block">
                <span className="font-kr text-xs text-ink-soft">시작</span>
                <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className={`mt-1 ${inputCls}`} />
              </label>
              <label className="block">
                <span className="font-kr text-xs text-ink-soft">종료</span>
                <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className={`mt-1 ${inputCls}`} />
              </label>
              <p className="col-span-2 font-kr text-xs text-ink-faint">종료 시각이 지나면 배너가 자동으로 내려갑니다.</p>
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 border-t border-line pt-4">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="h-4 w-4 accent-ink" />
          <span className="font-kr text-sm text-ink">사이트에 노출</span>
        </label>
      </div>
    </div>
  );
}
