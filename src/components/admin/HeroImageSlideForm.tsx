"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import type { HeroImageSlideAdmin } from "@/types/product";
import { ImageUploader } from "./ImageUploader";

type ImgSlot = { key: string; url: string };

/** 사이트 안 주소(/…) 또는 http(s) 주소. 서버와 같은 규칙 (// · /\ 는 다른 사이트로 읽혀 막는다). */
const LINK_OK = /^(\/(?![/\\]).*|https?:\/\/.+)$/i;

/**
 * 메인 배너 — 이미지 한 장으로 등록·수정 (V41, 2026-10-13).
 *
 * 사진 한 장이 메인 히어로 화면 전체를 덮는다. PC 는 가로(16:9), 휴대폰은 세로(9:16)로 따로 받는다.
 * 버튼은 문구와 이동 주소가 둘 다 있을 때만 화면 아래 가운데에 나온다.
 * ★ 저장 전 미리보기를 둔다 (CLAUDE.md 규칙 4). 삭제는 두 번 확인한다.
 */
export function HeroImageSlideForm({
  mode,
  initial,
  defaultSort = 0,
}: {
  mode: "create" | "edit";
  initial?: HeroImageSlideAdmin;
  defaultSort?: number;
}) {
  const router = useRouter();
  const [pcImage, setPcImage] = useState<ImgSlot | null>(
    initial?.imagePcKey ? { key: initial.imagePcKey, url: initial.imagePcUrl ?? "" } : null,
  );
  const [mobileImage, setMobileImage] = useState<ImgSlot | null>(
    initial?.imageMobileKey ? { key: initial.imageMobileKey, url: initial.imageMobileUrl ?? "" } : null,
  );
  const [altText, setAltText] = useState(initial?.altText ?? "");
  const [buttonLabel, setButtonLabel] = useState(initial?.buttonLabel ?? "");
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl ?? "");
  const [openNewTab, setOpenNewTab] = useState(initial?.openNewTab ?? false);
  const [sortOrder, setSortOrder] = useState<number>(initial?.sortOrder ?? defaultSort);
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const link = linkUrl.trim();
  const label = buttonLabel.trim();
  const showButton = !!label && !!link;

  async function save() {
    setErrors({});
    setNotice(null);
    if (link && !LINK_OK.test(link)) {
      setErrors({ linkUrl: "/로 시작하는 사이트 주소(예: /products/cream-of-rice)나 https:// 주소만 넣을 수 있습니다." });
      setNotice("이동할 주소 형식을 확인해 주세요.");
      return;
    }
    setSaving(true);
    try {
      const body = {
        imagePcKey: pcImage?.key ?? "",
        imageMobileKey: mobileImage?.key ?? null,
        altText: altText.trim(),
        buttonLabel: label || null,
        linkUrl: link,
        openNewTab,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        enabled,
      };
      if (mode === "create") {
        await api.post<{ id: number }>("/api/admin/hero-image-slides", body);
        router.replace("/admin/hero-banners");
      } else {
        await api.put(`/api/admin/hero-image-slides/${initial!.id}`, body);
        setNotice("저장되었습니다.");
        setSaving(false);
      }
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.fields) setErrors(e.fields);
        setNotice(e.message);
      } else {
        setNotice("저장 중 문제가 발생했습니다.");
      }
      setSaving(false);
    }
  }

  async function remove() {
    if (!initial) return;
    if (!window.confirm("이 배너를 삭제할까요?")) return;
    if (!window.confirm("삭제하면 되돌릴 수 없습니다. 정말 삭제할까요?")) return;
    try {
      await api.delete(`/api/admin/hero-image-slides/${initial.id}`);
      router.replace("/admin/hero-banners");
    } catch (e) {
      setNotice(e instanceof ApiError ? e.message : "삭제하지 못했습니다.");
    }
  }

  const inputCls =
    "w-full rounded-[3px] border border-line bg-cream-warm px-3 py-2 font-kr text-sm outline-none focus:border-clay-deep";

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-end gap-3">
        {mode === "edit" && (
          <button
            type="button"
            onClick={remove}
            className="rounded-[2px] border border-line px-4 py-2 font-kr text-sm text-ink-soft transition hover:border-clay-deep hover:text-clay-deep"
          >
            삭제
          </button>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-[2px] bg-ink px-5 py-2 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-50"
        >
          {saving ? "저장 중…" : "저장"}
        </button>
      </div>

      {notice && (
        <p className="mt-4 rounded-[3px] bg-clay-soft/40 px-3 py-2 font-kr text-sm text-clay-deep">{notice}</p>
      )}

      <div className="mt-6 flex flex-col gap-5 rounded-[4px] border border-line bg-paper px-5 py-5">
        <ImageUploader
          label="PC 이미지 *"
          hint="권장 1920×1080 (가로 16:9). 화면 전체를 덮어서, 화면 비율에 따라 가장자리가 조금 잘릴 수 있습니다. 중요한 글자·제품은 가운데에 두세요."
          category="banners"
          previewUrl={pcImage?.url ?? null}
          onChange={(key, url) => setPcImage({ key, url })}
          onClear={() => setPcImage(null)}
        />
        {errors.imagePcKey && <p className="-mt-2 font-kr text-xs text-clay-deep">{errors.imagePcKey}</p>}

        <ImageUploader
          label="모바일 이미지 (권장)"
          hint="권장 1080×1920 (세로 9:16). 비워 두면 휴대폰에서도 PC 이미지를 쓰는데, 휴대폰은 세로라 양옆이 많이 잘립니다."
          category="banners"
          previewUrl={mobileImage?.url ?? null}
          onChange={(key, url) => setMobileImage({ key, url })}
          onClear={() => setMobileImage(null)}
        />

        <label className="block">
          <span className="font-kr text-sm font-medium text-ink">이미지 설명 <span className="text-clay-deep">*</span></span>
          <span className="ml-2 font-kr text-xs text-ink-faint">화면에는 안 보이고, 검색과 화면을 못 보는 분께 읽힙니다.</span>
          <input value={altText} onChange={(e) => setAltText(e.target.value)} maxLength={300}
            placeholder="예: 가을 한정 크림오브라이스 기획전" className={`mt-1.5 ${inputCls}`} />
          {errors.altText && <p className="mt-1 font-kr text-xs text-clay-deep">{errors.altText}</p>}
        </label>

        <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
          <label className="block">
            <span className="font-kr text-sm font-medium text-ink">버튼 문구</span>
            <input value={buttonLabel} onChange={(e) => setButtonLabel(e.target.value)} maxLength={40}
              placeholder="예: 자세히 보기" className={`mt-1.5 ${inputCls}`} />
            {errors.buttonLabel && <p className="mt-1 font-kr text-xs text-clay-deep">{errors.buttonLabel}</p>}
          </label>
          <label className="block">
            <span className="font-kr text-sm font-medium text-ink">버튼을 누르면 이동할 주소</span>
            <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="/products/cream-of-rice 또는 https://..." className={`mt-1.5 ${inputCls}`} />
            {errors.linkUrl && <p className="mt-1 font-kr text-xs text-clay-deep">{errors.linkUrl}</p>}
          </label>
        </div>
        <p className="-mt-2 font-kr text-xs text-ink-faint">
          우리 사이트 페이지는 주소창의 <b className="font-medium text-ink-soft">rizenfoods.com 뒤 부분</b>만 넣으세요
          (예: 상품 상세 <code>/products/cream-of-rice</code>, 공지 <code>/notice/3</code>). 문구와 주소가 둘 다 있어야 버튼이 나옵니다.
        </p>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={openNewTab} onChange={(e) => setOpenNewTab(e.target.checked)} className="h-4 w-4 accent-ink" />
            <span className="font-kr text-sm text-ink">새 창으로 열기</span>
          </label>
          <label className="flex items-center gap-2">
            <span className="font-kr text-sm text-ink">표시 순서</span>
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value || "0", 10))}
              className="w-20 rounded-[3px] border border-line bg-cream-warm px-2 py-1.5 font-numeric text-sm outline-none focus:border-clay-deep" />
            <span className="font-kr text-xs text-ink-faint">숫자가 작을수록 먼저 나옵니다 (누끼 배너와 함께 셉니다)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4 accent-ink" />
            <span className="font-kr text-sm text-ink">메인에 노출</span>
          </label>
        </div>
      </div>

      {/* 저장 전 미리보기 — 실제 메인처럼 사진이 칸 전체를 덮는다 */}
      <div className="mt-6 rounded-[4px] border border-line bg-paper px-5 py-5">
        <p className="font-kr text-sm font-medium text-ink">미리보기</p>
        {!pcImage ? (
          <p className="mt-2 font-kr text-sm text-ink-faint">PC 이미지를 올리면 실제 메인 화면처럼 여기에 보입니다.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex-1">
              <p className="font-kr text-xs text-ink-faint">PC (가로 화면)</p>
              <PreviewFrame src={pcImage.url} alt={altText} label={showButton ? label : null} className="mt-1.5 aspect-[16/9] w-full" />
            </div>
            <div className="shrink-0">
              <p className="font-kr text-xs text-ink-faint">휴대폰 (세로 화면){!mobileImage && " — PC 이미지를 잘라 씀"}</p>
              <PreviewFrame src={(mobileImage ?? pcImage).url} alt={altText} label={showButton ? label : null} className="mt-1.5 aspect-[9/16] w-[200px]" />
            </div>
          </div>
        )}
        <p className="mt-3 font-kr text-xs text-ink-faint">
          {showButton ? (
            <>버튼 &lsquo;{label}&rsquo; → <span className="text-ink-soft">{link}</span>{openNewTab ? " (새 창)" : ""}</>
          ) : (
            "버튼 없음 — 문구와 주소를 모두 넣으면 화면 아래 가운데에 버튼이 나옵니다."
          )}
        </p>
      </div>
    </div>
  );
}

function PreviewFrame({ src, alt, label, className }: { src: string; alt: string; label: string | null; className: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[3px] border border-line bg-ink ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt || "배너 미리보기"} className="absolute inset-0 h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black/45 to-transparent" />
      {label && (
        <span className="absolute inset-x-0 bottom-[14%] mx-auto w-max max-w-[90%] truncate rounded-[4px] bg-[#FAF7F1] px-3 py-1.5 font-kr text-[11px] font-bold text-[#221E1C] shadow">
          {label}
        </span>
      )}
    </div>
  );
}
