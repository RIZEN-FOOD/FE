"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { api, ApiError } from "@/lib/api/client";
import { fromDateTimeLocal, toDateTimeLocal } from "@/lib/datetime";
import { isAllowedPopupLink, type PopupAdminItem, type PopupSaveRequest } from "@/types/popup";
import { ImageUploader } from "./ImageUploader";
import { PopupCard } from "@/components/store/MainPopup";

/**
 * 팝업 등록·수정 폼.
 *
 * 기본 설정(사용 여부 · 오늘 하루 보지 않기) → 팝업 내용(제목 · 이미지) → 이동 및 노출(이동 버튼 · 주소 · 기간)
 * 오른쪽(모바일은 아래)에 실제로 뜨는 모양 그대로 미리보기를 보여 준다.
 */
type ImgSlot = { key: string; url: string };

export function PopupForm({
  mode,
  popupId,
  initial,
}: {
  mode: "create" | "edit";
  popupId?: number;
  initial?: PopupAdminItem;
}) {
  const router = useRouter();
  const [visible, setVisible] = useState(initial?.visible ?? true);
  const [showHideToday, setShowHideToday] = useState(initial?.showHideToday ?? true);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [image, setImage] = useState<ImgSlot | null>(
    initial ? { key: initial.imageKey, url: initial.imageUrl ?? "" } : null,
  );
  const [showLinkButton, setShowLinkButton] = useState(initial?.showLinkButton ?? false);
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl ?? "");
  const [alwaysOn, setAlwaysOn] = useState(initial?.alwaysOn ?? true);
  const [startAt, setStartAt] = useState(toDateTimeLocal(initial?.startAt ?? null));
  const [endAt, setEndAt] = useState(toDateTimeLocal(initial?.endAt ?? null));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setErrors({});
    setNotice(null);
    const link = linkUrl.trim();

    const local: Record<string, string> = {};
    if (!title.trim()) local.title = "제목을 입력해 주세요.";
    if (!image) local.imageKey = "팝업 이미지를 올려 주세요.";
    if (!isAllowedPopupLink(link)) local.linkUrl = "https:// 로 시작하는 주소나 / 로 시작하는 사이트 안 주소만 넣을 수 있습니다.";
    if (showLinkButton && !link) local.linkUrl = "이동 버튼을 보이려면 주소를 입력해 주세요.";
    if (!alwaysOn && (!startAt || !endAt)) local.period = "시작과 종료 일시를 모두 입력해 주세요.";
    if (Object.keys(local).length) {
      setErrors(local);
      setNotice("입력 내용을 확인해 주세요.");
      return;
    }

    setSaving(true);
    try {
      const body: PopupSaveRequest = {
        title: title.trim(),
        imageKey: image!.key,
        showHideToday,
        showLinkButton,
        linkUrl: link,
        alwaysOn,
        startAt: alwaysOn ? null : fromDateTimeLocal(startAt),
        endAt: alwaysOn ? null : fromDateTimeLocal(endAt),
        visible,
      };
      if (mode === "create") {
        const res = await api.post<{ id: number }>("/api/admin/popups", body);
        router.replace(`/admin/popups/${res.id}`);
        return;
      }
      await api.put(`/api/admin/popups/${popupId}`, body);
      setNotice("저장되었습니다.");
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.fields) setErrors(e.fields);
        setNotice(e.message);
      } else {
        setNotice("저장 중 문제가 발생했습니다.");
      }
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-[3px] border border-line bg-cream-warm px-3 py-2 font-kr text-sm outline-none focus:border-clay-deep";

  return (
    <div>
      <div className="flex items-center justify-between border-b border-line pb-4">
        <h1 className="font-kr text-2xl font-bold text-ink">{mode === "create" ? "팝업 등록" : "팝업 수정"}</h1>
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

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-5">
          <Section title="기본 설정">
            <div className="grid gap-5 sm:grid-cols-2">
              <RadioRow
                label="사용 여부"
                required
                value={visible}
                onChange={setVisible}
                options={[[true, "노출"], [false, "숨김"]]}
              />
              <RadioRow
                label="오늘 하루 보지 않기 표시"
                required
                value={showHideToday}
                onChange={setShowHideToday}
                options={[[true, "노출"], [false, "숨김"]]}
              />
            </div>
          </Section>

          <Section title="팝업 내용">
            <label className="block">
              <FieldLabel required>제목</FieldLabel>
              <span className="ml-2 font-kr text-xs text-ink-faint">관리용이며, 이미지 설명(대체 텍스트)으로도 읽힙니다.</span>
              <input
                value={title}
                maxLength={200}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 가을 한정 할인 안내"
                className={`mt-1.5 ${inputCls}`}
              />
              {errors.title && <p className="mt-1 font-kr text-xs text-clay-deep">{errors.title}</p>}
            </label>

            <div>
              <ImageUploader
                label="이미지 *"
                hint="권장 800×1000 (세로 4:5) · 1장만 등록할 수 있습니다"
                category="popups"
                previewUrl={image?.url ?? null}
                onChange={(key, url) => setImage({ key, url })}
                onClear={() => setImage(null)}
              />
              {errors.imageKey && <p className="mt-1 font-kr text-xs text-clay-deep">{errors.imageKey}</p>}
            </div>
          </Section>

          <Section title="이동 및 노출 기간">
            <RadioRow
              label="이동 버튼 노출 여부"
              required
              value={showLinkButton}
              onChange={setShowLinkButton}
              options={[[true, "노출"], [false, "숨김"]]}
            />
            <label className="block">
              <FieldLabel>랜딩 URL</FieldLabel>
              <span className="ml-2 font-kr text-xs text-ink-faint">
                이미지나 이동 버튼을 누르면 갈 주소. 사이트 안은 /products 처럼, 바깥은 https:// 로
              </span>
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com 또는 /products/cream-of-rice"
                className={`mt-1.5 ${inputCls}`}
              />
              {errors.linkUrl && <p className="mt-1 font-kr text-xs text-clay-deep">{errors.linkUrl}</p>}
            </label>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={alwaysOn}
                  onChange={(e) => setAlwaysOn(e.target.checked)}
                  className="h-4 w-4 accent-ink"
                />
                <span className="font-kr text-sm text-ink">기간 없이 계속 노출</span>
              </label>
              {!alwaysOn && (
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-kr text-xs text-ink-soft">시작</span>
                    <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className={`mt-1 ${inputCls}`} />
                  </label>
                  <label className="block">
                    <span className="font-kr text-xs text-ink-soft">종료</span>
                    <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className={`mt-1 ${inputCls}`} />
                  </label>
                  <p className="font-kr text-xs text-ink-faint sm:col-span-2">종료 시각이 지나면 팝업이 자동으로 내려갑니다.</p>
                </div>
              )}
              {errors.period && <p className="mt-1 font-kr text-xs text-clay-deep">{errors.period}</p>}
            </div>

            <p className="font-kr text-xs text-ink-faint">노출 위치: 메인 화면 (쇼핑몰에 처음 들어왔을 때)</p>
          </Section>
        </div>

        {/* 미리보기 — 실제로 뜨는 모양 그대로 */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <p className="font-kr text-sm font-medium text-ink">미리보기</p>
          <div className="mt-2 rounded-[4px] bg-ink/70 p-5">
            {image ? (
              <PopupCard
                title={title || "팝업"}
                imageUrl={image.url}
                showHideToday={showHideToday}
                showLinkButton={showLinkButton && Boolean(linkUrl.trim())}
                linkUrl={linkUrl.trim() || null}
                preview
                onClose={() => undefined}
                onHideToday={() => undefined}
              />
            ) : (
              <p className="py-16 text-center font-kr text-sm text-cream-warm/80">이미지를 올리면 여기에 보입니다.</p>
            )}
          </div>
          {!visible && <p className="mt-2 font-kr text-xs text-clay-deep">사용 여부가 &lsquo;숨김&rsquo;이라 사이트에는 뜨지 않습니다.</p>}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[4px] border border-line bg-paper px-5 py-5">
      <h2 className="font-kr text-base font-bold text-ink">{title}</h2>
      <div className="mt-4 flex flex-col gap-5">{children}</div>
    </section>
  );
}

function FieldLabel({ children, required = false }: { children: ReactNode; required?: boolean }) {
  return (
    <span className="font-kr text-sm font-medium text-ink">
      {children}
      {required && <span className="ml-0.5 text-clay-deep">*</span>}
    </span>
  );
}

function RadioRow({
  label,
  required = false,
  value,
  onChange,
  options,
}: {
  label: string;
  required?: boolean;
  value: boolean;
  onChange: (v: boolean) => void;
  options: [boolean, string][];
}) {
  return (
    <fieldset>
      <legend>
        <FieldLabel required={required}>{label}</FieldLabel>
      </legend>
      <div className="mt-2 flex gap-5">
        {options.map(([v, text]) => (
          <label key={text} className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              checked={value === v}
              onChange={() => onChange(v)}
              className="h-4 w-4 accent-ink"
            />
            <span className="font-kr text-sm text-ink">{text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
