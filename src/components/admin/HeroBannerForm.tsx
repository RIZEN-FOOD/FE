"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ImageUploader } from "@/components/admin/ImageUploader";
import { api, ApiError } from "@/lib/api/client";
import type { HeroBannerDetail, HeroBannerSaveRequest } from "@/types/product";

type Slot = { key: string; url: string } | null;

const toSlot = (key: string | null, url: string | null): Slot =>
  key ? { key, url: url ?? "" } : null;

/**
 * 메인 히어로 배너 편집.
 *
 * 배너 = 상품 1개의 히어로 구성. 사진·색·문구·구성 이미지 4종·표시 순서·노출만 다룬다.
 * 가격·재고·품절은 상품 관리에서 바꾼다.
 *
 * 배경색 안내: 메인 이미지를 올리면 대표 색을 한 톤 눌러 자동으로 정한다(직접 바꿔도 됨).
 */
export function HeroBannerForm({ detail }: { detail: HeroBannerDetail }) {
  const router = useRouter();

  const [headline, setHeadline] = useState(detail.heroHeadline ?? "");
  const [subcopy, setSubcopy] = useState(detail.heroSubcopy ?? "");
  const [color, setColor] = useState(detail.heroColor ?? "");
  const [mainImg, setMainImg] = useState<Slot>(toSlot(detail.heroImageKey, detail.heroImageUrl));
  const [pillar, setPillar] = useState<Slot>(toSlot(detail.heroBackdropKey, detail.heroBackdropUrl));
  const [topRight, setTopRight] = useState<Slot>(toSlot(detail.heroAccent1Key, detail.heroAccent1Url));
  const [bottomRight, setBottomRight] = useState<Slot>(toSlot(detail.heroAccent3Key, detail.heroAccent3Url));
  const [bottomLeft, setBottomLeft] = useState<Slot>(toSlot(detail.heroAccent2Key, detail.heroAccent2Url));
  const [sort, setSort] = useState(String(detail.heroSort));
  const [enabled, setEnabled] = useState(detail.heroEnabled);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const validColor = /^#[0-9a-fA-F]{6}$/.test(color);
  const bg = validColor ? color : "#3e2259";

  async function save() {
    setBusy(true);
    setMsg(null);
    const payload: HeroBannerSaveRequest = {
      heroHeadline: headline.trim() || null,
      heroSubcopy: subcopy.trim() || null,
      heroColor: color.trim() || null,
      heroImageKey: mainImg?.key ?? null,
      heroBackdropKey: pillar?.key ?? null,
      heroAccent1Key: topRight?.key ?? null,
      heroAccent3Key: bottomRight?.key ?? null,
      heroAccent2Key: bottomLeft?.key ?? null,
      heroSort: Number(sort || 0),
      heroEnabled: enabled,
    };
    try {
      await api.put(`/api/admin/hero-banners/${detail.id}`, payload);
      setMsg("저장되었습니다. (메인 반영까지 최대 10초)");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* ── 입력 ── */}
      <div className="flex flex-col gap-6">
        <div>
          <span className="font-kr text-sm font-medium text-ink">배너 타입</span>
          <p className="mt-1 rounded-[4px] border border-line bg-cream-warm/40 px-3 py-2.5 font-kr text-sm text-ink-soft">
            MAIN (메인 히어로)
          </p>
        </div>

        <div>
          <span className="font-kr text-sm font-medium text-ink">상품 · 맛</span>
          <p className="mt-1 rounded-[4px] border border-line bg-cream-warm/40 px-3 py-2.5 font-kr text-sm text-ink">
            {detail.productName}
          </p>
          <p className="mt-1 font-kr text-xs text-ink-faint">
            상품 자체(이름·가격·재고)는 [상품 관리]에서 바꿉니다. 여기선 배너 표현만 설정합니다.
          </p>
        </div>

        <label className="block">
          <span className="font-kr text-sm font-medium text-ink">메인 문구</span>
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder={`비워 두면 "${detail.defaultHeadline}"`}
            className="mt-1 h-[46px] w-full rounded-[3px] border border-line bg-cream-warm/40 px-3 font-kr text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-clay-deep"
          />
        </label>

        <label className="block">
          <span className="font-kr text-sm font-medium text-ink">서브 문구</span>
          <textarea
            value={subcopy}
            onChange={(e) => setSubcopy(e.target.value)}
            rows={2}
            placeholder={detail.defaultSubcopy ? `비워 두면 "${detail.defaultSubcopy}"` : "메인 문구 아래 한 줄 설명"}
            className="mt-1 w-full rounded-[3px] border border-line bg-cream-warm/40 px-3 py-2.5 font-kr text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-clay-deep"
          />
        </label>

        <ImageUploader
          label="메인 이미지 (제품 봉투 · 누끼)"
          hint="배경이 투명한 PNG 권장. 권장 세로형, 가운데 정렬."
          previewUrl={mainImg?.url ?? null}
          onChange={(key, url) => setMainImg({ key, url })}
          onClear={() => setMainImg(null)}
        />

        <div className="border-t border-line pt-6">
          <p className="font-kr text-sm font-bold text-ink">구성 이미지 (선택)</p>
          <p className="mt-1 font-kr text-xs text-ink-faint">
            비워 두면 그 자리는 비어 있습니다. 모두 투명 PNG 권장.
          </p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <ImageUploader
              label="구성 1 · 기둥 (제품 뒤)"
              hint="세로 스플래시(쌀·초콜릿·땅콩 기둥)"
              previewUrl={pillar?.url ?? null}
              onChange={(key, url) => setPillar({ key, url })}
              onClear={() => setPillar(null)}
            />
            <ImageUploader
              label="구성 2 · 오른쪽 상단"
              hint="떠다니는 장식"
              previewUrl={topRight?.url ?? null}
              onChange={(key, url) => setTopRight({ key, url })}
              onClear={() => setTopRight(null)}
            />
            <ImageUploader
              label="구성 3 · 오른쪽 하단"
              hint="떠다니는 장식"
              previewUrl={bottomRight?.url ?? null}
              onChange={(key, url) => setBottomRight({ key, url })}
              onClear={() => setBottomRight(null)}
            />
            <ImageUploader
              label="구성 4 · 왼쪽 하단"
              hint="떠다니는 장식"
              previewUrl={bottomLeft?.url ?? null}
              onChange={(key, url) => setBottomLeft({ key, url })}
              onClear={() => setBottomLeft(null)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 border-t border-line pt-6">
          <div>
            <span className="font-kr text-sm font-medium text-ink">배경색</span>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                type="color"
                value={validColor ? color : "#3e2259"}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-12 cursor-pointer rounded-[3px] border border-line bg-paper"
                aria-label="배경색 선택"
              />
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#3e2259"
                className="h-10 w-full rounded-[3px] border border-line bg-cream-warm/40 px-2 font-kr text-sm text-ink outline-none focus:border-clay-deep"
              />
            </div>
            <p className="mt-1 font-kr text-xs text-ink-faint">
              제품 색에 맞게 지정하세요. 비우면 기본색으로 보입니다.
            </p>
          </div>
          <label className="block">
            <span className="font-kr text-sm font-medium text-ink">표시 순서</span>
            <input
              value={sort}
              onChange={(e) => setSort(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              className="mt-1.5 h-10 w-full rounded-[3px] border border-line bg-cream-warm/40 px-3 font-kr text-sm text-ink outline-none focus:border-clay-deep"
            />
            <p className="mt-1 font-kr text-xs text-ink-faint">작을수록 먼저 나옵니다.</p>
          </label>
        </div>

        <label className="flex items-center justify-between gap-4 border-t border-line pt-6">
          <span>
            <span className="font-kr text-sm font-medium text-ink">배너 노출</span>
            <span className="mt-0.5 block font-kr text-xs text-ink-faint">
              끄면 메인 배너에서 이 슬라이드가 빠집니다(출시 예정 제품 등).
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled((v) => !v)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${enabled ? "bg-ink" : "bg-line"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper transition-all ${enabled ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </label>

        {msg && (
          <p className="rounded-[3px] bg-clay-soft/40 px-3 py-2 font-kr text-sm text-clay-deep">{msg}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push("/admin/hero-banners")}
            className="rounded-[2px] border border-line px-4 py-2.5 font-kr text-sm text-ink transition hover:bg-cream-warm"
          >
            목록
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="rounded-[2px] bg-ink px-5 py-2.5 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-50"
          >
            {busy ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>

      {/* ── 미리보기 ── */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <span className="font-kr text-sm font-medium text-ink">미리보기</span>
        <div
          className="mt-2 aspect-[3/4] w-full overflow-hidden rounded-2xl"
          style={{ background: `radial-gradient(120% 90% at 50% 22%, ${bg}dd, ${bg})` }}
        >
          <div className="relative h-full w-full">
            {pillar?.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pillar.url} alt="" className="absolute left-1/2 top-1/2 h-[86%] -translate-x-1/2 -translate-y-1/2 object-contain opacity-80" />
            )}
            {mainImg?.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mainImg.url} alt="" className="absolute left-1/2 top-1/2 z-10 h-[64%] -translate-x-1/2 -translate-y-1/2 object-contain" />
            )}
            {topRight?.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={topRight.url} alt="" className="absolute right-[6%] top-[8%] z-20 w-[26%] object-contain" />
            )}
            {bottomRight?.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bottomRight.url} alt="" className="absolute bottom-[8%] right-[6%] z-20 w-[24%] object-contain" />
            )}
            {bottomLeft?.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bottomLeft.url} alt="" className="absolute bottom-[8%] left-[6%] z-20 w-[26%] object-contain" />
            )}
          </div>
        </div>
        <div className="mt-3 text-center">
          <p className="font-kr text-base font-bold text-ink">{headline.trim() || detail.defaultHeadline}</p>
          <p className="font-kr text-xs text-ink-soft">{subcopy.trim() || detail.defaultSubcopy || ""}</p>
        </div>
      </div>
    </div>
  );
}
