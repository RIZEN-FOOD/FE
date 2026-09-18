"use client";

import { useCallback, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { MainFeatureAdmin } from "@/types/mainFeature";

/**
 * 메인 FEATURES 관리.
 *
 * 메인 화면 가운데 "RIZEN 쌀가루는 뭐가 다른가요?" 칸들의 문구·사진·순서를 대표가 직접 관리한다.
 * 저장은 main_feature 테이블이다 — 화면 코드에 문구도 사진도 남기지 않는다 (CLAUDE.md 규칙 3).
 *
 * ★ 효능·효과 표현은 식품표시광고법 위반이다 (CLAUDE.md 규칙 1). 화면 위에 경고를 상시 띄운다.
 * ★ 삭제는 이중 확인 (CLAUDE.md 규칙 4).
 */
export default function AdminFeaturesPage() {
  const [items, setItems] = useState<MainFeatureAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await api.get<MainFeatureAdmin[]>("/api/admin/main-features"));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2800);
  }

  const patch = (id: number, part: Partial<MainFeatureAdmin>) =>
    setItems((list) => list.map((it) => (it.id === id ? { ...it, ...part } : it)));

  /** 순서는 화면에서 바꾸고 저장할 때 한 번에 보낸다. */
  function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= items.length) return;
    setItems((list) => {
      const copy = [...list];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
  }

  async function addCard() {
    setSaving(true);
    try {
      await api.post("/api/admin/main-features", {
        title: "새 칸",
        body: "",
        imageKey: null,
        imageMobileKey: null,
        altText: null,
        autoNutritionBody: false,
        visible: true,
      });
      await load();
      flash("칸을 추가했습니다. 문구를 채우고 저장해 주세요.");
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "추가하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: MainFeatureAdmin) {
    if (!window.confirm(`"${item.title}" 칸을 삭제합니다.\n되돌릴 수 없습니다. 계속할까요?`)) return;
    if (!window.confirm("정말 삭제하시겠어요?")) return;
    setSaving(true);
    try {
      await api.delete(`/api/admin/main-features/${item.id}`);
      await load();
      flash("삭제되었습니다.");
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "삭제하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function saveAll() {
    if (items.some((it) => !it.title.trim())) {
      flash("큰 문구가 비어 있는 칸이 있습니다.");
      return;
    }
    setSaving(true);
    try {
      for (const it of items) {
        await api.put(`/api/admin/main-features/${it.id}`, {
          title: it.title,
          body: it.body,
          imageKey: it.imageKey,
          imageMobileKey: it.imageMobileKey,
          altText: it.altText,
          autoNutritionBody: it.autoNutritionBody,
          visible: it.visible,
        });
      }
      await api.put("/api/admin/main-features/order", { ids: items.map((it) => it.id) });
      await load();
      flash("저장되었습니다. 메인 화면에 바로 반영됩니다.");
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="font-kr text-sm text-ink-faint">불러오는 중…</p>;
  }
  if (error) {
    return <p className="font-kr text-sm text-clay-deep">{error}</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-kr text-2xl font-bold text-ink">메인 FEATURES</h1>
          <p className="mt-1 font-kr text-sm text-ink-soft">
            메인 화면 가운데 &lsquo;RIZEN 쌀가루는 뭐가 다른가요?&rsquo; 칸입니다. 위에서부터 차례대로
            보입니다.
          </p>
        </div>
        <SaveButton saving={saving} onClick={saveAll} />
      </div>

      <div className="mt-5 rounded-[3px] border border-clay-soft bg-clay-soft/25 px-4 py-3">
        <p className="font-kr text-xs leading-relaxed text-clay-deep">
          크림오브라이스는 <b>일반 식품</b>입니다. &lsquo;다이어트 효과&rsquo;, &lsquo;소화가 잘
          됩니다&rsquo;, &lsquo;근육 증가에 도움&rsquo; 같은 효능·효과 문구는 식품표시광고법 위반이라 넣을
          수 없습니다. 원재료·맛·탄수화물 보충처럼 사실만 적어주세요.
        </p>
      </div>

      {message && (
        <p className="mt-4 rounded-[3px] bg-clay-soft/40 px-3 py-2 font-kr text-sm text-clay-deep">
          {message}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-6">
        {items.length === 0 && (
          <p className="font-kr text-sm text-ink-faint">
            칸이 없습니다. 아래 &lsquo;칸 추가&rsquo;로 만들어 주세요. 칸이 하나도 없으면 메인 화면에서 이
            영역이 통째로 보이지 않습니다.
          </p>
        )}

        {items.map((item, index) => (
          <section key={item.id} className="rounded-[4px] border border-line bg-paper p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-kr text-base font-bold text-ink">
                {String(index + 1).padStart(2, "0")}번 칸
              </h2>
              <div className="flex items-center gap-2">
                <OrderButton label="위로" disabled={index === 0} onClick={() => move(index, -1)} />
                <OrderButton
                  label="아래로"
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                />
                <button
                  type="button"
                  onClick={() => patch(item.id, { visible: !item.visible })}
                  className={`rounded-full border px-3 py-1.5 font-kr text-xs transition ${
                    item.visible
                      ? "border-ink bg-ink text-cream-warm"
                      : "border-line text-ink-faint hover:border-ink hover:text-ink"
                  }`}
                >
                  {item.visible ? "보임" : "숨김"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(item)}
                  className="font-kr text-xs text-ink-faint transition hover:text-clay-deep"
                >
                  삭제
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-5">
              <label className="block">
                <span className="block font-kr text-sm text-ink">큰 문구</span>
                <input
                  value={item.title}
                  onChange={(e) => patch(item.id, { title: e.target.value })}
                  maxLength={100}
                  placeholder="예: 국산 멥쌀 한 가지"
                  className="mt-1 h-[46px] w-full rounded-[3px] border border-line bg-cream-warm/40 px-3 font-kr text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-clay-deep"
                />
              </label>

              <label className="block">
                <span className="block font-kr text-sm text-ink">작은 문구</span>
                <textarea
                  value={item.body}
                  onChange={(e) => patch(item.id, { body: e.target.value })}
                  rows={3}
                  maxLength={500}
                  placeholder="한두 문장으로 적어주세요."
                  className="mt-1 w-full rounded-[3px] border border-line bg-cream-warm/40 px-3 py-2.5 font-kr text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-clay-deep"
                />
              </label>

              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={item.autoNutritionBody}
                  onChange={(e) => patch(item.id, { autoNutritionBody: e.target.checked })}
                  className="mt-0.5 h-4 w-4 shrink-0"
                />
                <span className="font-kr text-xs leading-relaxed text-ink-soft">
                  작은 문구를 비워두면 상품 영양성분으로 문장을 자동으로 만들기
                  <br />
                  <span className="text-ink-faint">
                    예: 1회 제공량 45g에 탄수화물 34g, 150kcal가 들어 있습니다… — 영양성분을 고치면 이 문장도
                    같이 바뀝니다.
                  </span>
                </span>
              </label>

              <ImageUploader
                label="사진 (PC)"
                hint="권장 1920×1080 이상 (가로로 넓게)"
                previewUrl={item.imageUrl}
                category="main"
                onChange={(key, url) => patch(item.id, { imageKey: key, imageUrl: url })}
                onClear={() => patch(item.id, { imageKey: null, imageUrl: null })}
              />
              <p className="-mt-3 font-kr text-xs text-ink-faint">
                메인 화면에서 이 칸의 배경으로 깔립니다. 왼쪽에 글자가 얹히니 피사체는 오른쪽에 두세요.
                사진을 올리지 않으면 그 칸은 어두운 배경에 글자만 보입니다.
              </p>

              <ImageUploader
                label="사진 (휴대폰, 선택)"
                hint="권장 1080×1350 (세로 4:5)"
                previewUrl={item.imageMobileUrl}
                category="main"
                onChange={(key, url) => patch(item.id, { imageMobileKey: key, imageMobileUrl: url })}
                onClear={() => patch(item.id, { imageMobileKey: null, imageMobileUrl: null })}
              />
              <p className="-mt-3 font-kr text-xs text-ink-faint">
                올리지 않으면 휴대폰에서도 PC 사진을 쓰되 좌우가 잘립니다. 세로 사진을 올리면 잘림이 줄어듭니다.
              </p>

              <label className="block">
                <span className="block font-kr text-sm text-ink">사진 설명 (선택)</span>
                <span className="mb-1 mt-0.5 block font-kr text-xs leading-relaxed text-ink-faint">
                  화면을 못 보는 분에게 읽어주는 설명입니다. 비우면 큰 문구를 대신 읽어줍니다.
                </span>
                <input
                  value={item.altText ?? ""}
                  onChange={(e) => patch(item.id, { altText: e.target.value })}
                  maxLength={300}
                  placeholder="예: 국산 멥쌀로 만든 크림오브라이스 한 그릇"
                  className="mt-1 h-[46px] w-full rounded-[3px] border border-line bg-cream-warm/40 px-3 font-kr text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-clay-deep"
                />
              </label>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={addCard}
          disabled={saving}
          className="rounded-[2px] border border-ink px-4 py-2.5 font-kr text-sm font-medium text-ink transition hover:bg-ink hover:text-cream-warm disabled:opacity-50"
        >
          칸 추가
        </button>
        <SaveButton saving={saving} onClick={saveAll} />
      </div>
    </div>
  );
}

function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="rounded-[2px] bg-ink px-4 py-2.5 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-50"
    >
      {saving ? "저장 중…" : "저장하기"}
    </button>
  );
}

function OrderButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-[2px] border border-line px-2.5 py-1.5 font-kr text-xs text-ink-soft transition hover:border-ink hover:text-ink disabled:opacity-40"
    >
      {label}
    </button>
  );
}
