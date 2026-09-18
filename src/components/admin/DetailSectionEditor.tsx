"use client";

import { useCallback, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import type { AdminDetailSection, DetailSectionType } from "@/types/product";
import { ImageUploader } from "./ImageUploader";

/**
 * 상품 상세페이지 구성(사진형 상세페이지) 편집기.
 *
 * 블록을 위에서 아래로 쌓으면 손님 화면에서 그 순서 그대로 "틈 없이" 이어 붙는다.
 *   사진  — 가로 폭을 꽉 채운다. 여러 장을 이어 붙이면 흔히 보는 긴 상세페이지가 된다
 *   영상  — 유튜브 주소. 썸네일을 누르면 재생된다
 *   글    — 사진 사이에 넣는 짧은 설명
 *
 * ★ 영양성분·원재료·표시사항은 이 블록으로 넣지 않는다. 사진 안의 글자는 검색에 안 잡히고
 *   화면을 못 보는 분이 읽을 수 없어, 법정 표시사항은 아래쪽 전용 칸(텍스트)에 그대로 둔다.
 */
const TYPE_LABEL: Record<DetailSectionType, string> = {
  IMAGE: "사진",
  VIDEO: "영상",
  TEXT: "글",
};

function emptySection(type: DetailSectionType): AdminDetailSection {
  return {
    type,
    visible: true,
    imageKey: null,
    imageUrl: null,
    altText: null,
    videoUrl: null,
    videoFileKey: null,
    videoFileUrl: null,
    thumbnailKey: null,
    thumbnailUrl: null,
    heading: null,
    body: null,
    caption: null,
  };
}

export function DetailSectionEditor({ productId }: { productId: number }) {
  const [items, setItems] = useState<AdminDetailSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api.get<AdminDetailSection[]>(`/api/admin/products/${productId}/detail-sections`));
    } catch (e) {
      setMessage(e instanceof ApiError ? e.message : "상세페이지 구성을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2800);
  }

  function patch(index: number, next: Partial<AdminDetailSection>) {
    setItems((list) => list.map((it, i) => (i === index ? { ...it, ...next } : it)));
  }

  function add(type: DetailSectionType) {
    setItems((list) => [...list, emptySection(type)]);
  }

  function move(index: number, dir: -1 | 1) {
    const to = index + dir;
    if (to < 0 || to >= items.length) return;
    setItems((list) => {
      const next = [...list];
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
  }

  function remove(index: number) {
    if (!window.confirm("이 블록을 지웁니다. 계속할까요?")) return;
    setItems((list) => list.filter((_, i) => i !== index));
  }

  async function save() {
    // 서버도 검사하지만, 어디가 비었는지 먼저 알려 준다.
    for (const [i, it] of items.entries()) {
      if (it.type === "IMAGE" && !it.imageKey) return flash(`${i + 1}번 블록: 사진을 올려 주세요.`);
      if (it.type === "VIDEO" && !it.videoUrl?.trim()) return flash(`${i + 1}번 블록: 유튜브 주소를 넣어 주세요.`);
      if (it.type === "TEXT" && !it.heading?.trim() && !it.body?.trim()) {
        return flash(`${i + 1}번 블록: 제목이나 내용을 입력해 주세요.`);
      }
    }
    setSaving(true);
    try {
      await api.put(`/api/admin/products/${productId}/detail-sections`, {
        sections: items.map((it) => ({
          type: it.type,
          visible: it.visible,
          imageKey: it.imageKey ?? "",
          altText: it.altText ?? "",
          videoUrl: it.videoUrl ?? "",
          videoFileKey: it.videoFileKey ?? "",
          thumbnailKey: it.thumbnailKey ?? "",
          heading: it.heading ?? "",
          body: it.body ?? "",
          caption: it.caption ?? "",
        })),
      });
      await load();
      flash("저장되었습니다. 상품 상세 화면에 바로 반영됩니다.");
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-[3px] border border-line bg-cream-warm px-3 py-2 font-kr text-sm outline-none focus:border-clay-deep";

  return (
    <section className="mt-10 rounded-[4px] border border-line bg-paper px-5 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h2 className="font-kr text-base font-bold text-ink">상세페이지 구성</h2>
          <p className="mt-1 font-kr text-xs text-ink-faint">
            사진을 여러 장 쌓으면 손님 화면에서 위아래로 <b>틈 없이</b> 이어집니다. 영상과 글도 사이에 넣을 수 있습니다.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-[2px] bg-ink px-4 py-2 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-50"
        >
          {saving ? "저장 중…" : "구성 저장"}
        </button>
      </div>

      {message && (
        <p className="mt-4 rounded-[3px] bg-clay-soft/40 px-3 py-2 font-kr text-sm text-clay-deep">{message}</p>
      )}

      <p className="mt-4 rounded-[3px] bg-cream-warm px-3 py-2 font-kr text-xs leading-relaxed text-ink-soft">
        영양성분·원재료·표시사항은 사진에 넣지 말고 아래 전용 칸에 글자로 적어 주세요. 사진 속 글자는 검색에 잡히지
        않고, 화면을 못 보는 분이 읽을 수 없습니다. 효능·효과를 말하는 문구(소화·다이어트·근육 등)도 넣을 수 없습니다.
      </p>

      {loading ? (
        <p className="mt-8 font-kr text-sm text-ink-faint">불러오는 중…</p>
      ) : (
        <>
          {items.length === 0 && (
            <div className="mt-6 rounded-[4px] border border-dashed border-line px-6 py-10 text-center">
              <p className="font-kr text-sm text-ink-soft">아직 블록이 없습니다. 아래에서 추가해 주세요.</p>
            </div>
          )}

          <ol className="mt-6 flex flex-col gap-4">
            {items.map((it, i) => (
              <li key={i} className="rounded-[4px] border border-line bg-cream-warm/50 px-4 py-4">
                <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
                  <span className="grid h-7 min-w-7 place-items-center rounded-[3px] bg-ink px-1.5 font-numeric text-xs text-cream-warm">
                    {i + 1}
                  </span>
                  <span className="font-kr text-sm font-bold text-ink">{TYPE_LABEL[it.type]}</span>

                  <div className="ml-auto flex items-center gap-1">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                      className="rounded-[2px] border border-line px-2 py-1 font-kr text-xs text-ink transition hover:bg-clay-soft/40 disabled:opacity-30">
                      위로
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1}
                      className="rounded-[2px] border border-line px-2 py-1 font-kr text-xs text-ink transition hover:bg-clay-soft/40 disabled:opacity-30">
                      아래로
                    </button>
                    <button type="button" onClick={() => patch(i, { visible: !it.visible })}
                      className={`rounded-[2px] px-2 py-1 font-kr text-xs transition ${
                        it.visible ? "bg-ink text-cream-warm" : "border border-line text-ink-soft"
                      }`}>
                      {it.visible ? "보임" : "숨김"}
                    </button>
                    <button type="button" onClick={() => remove(i)}
                      className="rounded-[2px] px-2 py-1 font-kr text-xs text-ink-faint transition hover:text-clay-deep">
                      삭제
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-4">
                  {it.type === "IMAGE" && (
                    <>
                      <ImageUploader
                        label="사진"
                        hint="가로 1200px 이상 권장 · 세로 길이는 자유 (여러 장을 쌓으면 이어집니다)"
                        category="details"
                        previewUrl={it.imageUrl}
                        onChange={(key, url) => patch(i, { imageKey: key, imageUrl: url })}
                        onClear={() => patch(i, { imageKey: null, imageUrl: null })}
                      />
                      <label className="block">
                        <span className="font-kr text-sm text-ink">사진 설명</span>
                        <span className="ml-2 font-kr text-xs text-ink-faint">화면을 못 보는 분에게 읽어줍니다.</span>
                        <input value={it.altText ?? ""} onChange={(e) => patch(i, { altText: e.target.value })}
                          placeholder="예: 크림오브라이스를 우유에 풀어 조리한 모습"
                          className={`mt-1.5 ${inputCls}`} />
                      </label>
                    </>
                  )}

                  {it.type === "VIDEO" && (
                    <>
                      <label className="block">
                        <span className="font-kr text-sm text-ink">유튜브 주소 <span className="text-clay-deep">*</span></span>
                        <span className="ml-2 font-kr text-xs text-ink-faint">유튜브 영상 주소만 넣을 수 있습니다.</span>
                        <input value={it.videoUrl ?? ""} onChange={(e) => patch(i, { videoUrl: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className={`mt-1.5 ${inputCls}`} />
                      </label>
                      <ImageUploader
                        label="영상 표지 사진 (선택)"
                        hint="누르기 전에 보이는 사진. 비우면 유튜브 기본 표지를 씁니다"
                        category="details"
                        previewUrl={it.thumbnailUrl}
                        onChange={(key, url) => patch(i, { thumbnailKey: key, thumbnailUrl: url })}
                        onClear={() => patch(i, { thumbnailKey: null, thumbnailUrl: null })}
                      />
                    </>
                  )}

                  {it.type === "TEXT" && (
                    <>
                      <label className="block">
                        <span className="font-kr text-sm text-ink">제목</span>
                        <input value={it.heading ?? ""} onChange={(e) => patch(i, { heading: e.target.value })}
                          className={`mt-1.5 ${inputCls}`} />
                      </label>
                      <label className="block">
                        <span className="font-kr text-sm text-ink">내용</span>
                        <textarea value={it.body ?? ""} onChange={(e) => patch(i, { body: e.target.value })}
                          rows={4} className={`mt-1.5 ${inputCls}`} />
                      </label>
                    </>
                  )}

                  {it.type !== "TEXT" && (
                    <label className="block">
                      <span className="font-kr text-sm text-ink">캡션 (선택)</span>
                      <span className="ml-2 font-kr text-xs text-ink-faint">사진·영상 아래에 작게 들어가는 한 줄</span>
                      <input value={it.caption ?? ""} onChange={(e) => patch(i, { caption: e.target.value })}
                        className={`mt-1.5 ${inputCls}`} />
                    </label>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-5">
            {(["IMAGE", "VIDEO", "TEXT"] as DetailSectionType[]).map((t) => (
              <button key={t} type="button" onClick={() => add(t)}
                className="rounded-[2px] border border-line px-3 py-2 font-kr text-sm text-ink transition hover:bg-clay-soft/40">
                + {TYPE_LABEL[t]} 추가
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
