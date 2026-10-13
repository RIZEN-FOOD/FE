"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import type { HeroBannerRow, HeroImageSlideAdmin } from "@/types/product";

/** 목록 한 줄 — 누끼(상품) 또는 이미지 한 장. */
type Row =
  | { kind: "cutout"; sort: number; enabled: boolean; data: HeroBannerRow }
  | { kind: "image"; sort: number; enabled: boolean; data: HeroImageSlideAdmin };

/**
 * 메인 히어로 배너 목록.
 *
 * 두 종류가 표시 순서대로 한 목록에 섞여 보인다 (2026-10-13).
 *   누끼   — 상품 1개의 히어로 구성(사진·문구·구성 이미지·배경색). 상품마다 하나.
 *   이미지 — 사진 한 장이 화면 전체를 덮고, 버튼이 정한 주소로 보낸다.
 * 노출 토글은 여기서 바로 켜고 끈다. 상세는 편집 화면에서 다룬다.
 */
export default function AdminHeroBannersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cutouts, images] = await Promise.all([
        api.get<HeroBannerRow[]>("/api/admin/hero-banners"),
        api.get<HeroImageSlideAdmin[]>("/api/admin/hero-image-slides"),
      ]);
      const merged: Row[] = [
        ...cutouts.map((d) => ({ kind: "cutout" as const, sort: d.heroSort, enabled: d.heroEnabled, data: d })),
        ...images.map((d) => ({ kind: "image" as const, sort: d.sortOrder, enabled: d.enabled, data: d })),
      ];
      // 노출 중인 것을 위로, 그 안에서는 메인에 나오는 순서대로 (같은 순서면 누끼가 먼저 — 메인과 같다)
      merged.sort((a, b) => Number(b.enabled) - Number(a.enabled) || a.sort - b.sort);
      setRows(merged);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(row: Row) {
    try {
      if (row.kind === "image") {
        await api.patch(`/api/admin/hero-image-slides/${row.data.id}/enabled`, { enabled: !row.enabled });
        setMsg(`이미지 배너를 ${!row.enabled ? "노출" : "숨김"}으로 바꿨습니다.`);
      } else {
        // 노출만 빠르게 바꾼다. 나머지 값은 편집 화면에서 넣은 그대로 유지되도록
        // 상세를 읽어 통째로 다시 저장한다(부분 저장 API 를 따로 두지 않음).
        const d = await api.get<Record<string, unknown>>(`/api/admin/hero-banners/${row.data.id}`);
        await api.put(`/api/admin/hero-banners/${row.data.id}`, {
          heroHeadline: d.heroHeadline ?? null,
          heroSubcopy: d.heroSubcopy ?? null,
          heroColor: d.heroColor ?? null,
          heroImageKey: d.heroImageKey ?? null,
          heroBackdropKey: d.heroBackdropKey ?? null,
          heroAccent1Key: d.heroAccent1Key ?? null,
          heroAccent3Key: d.heroAccent3Key ?? null,
          heroAccent2Key: d.heroAccent2Key ?? null,
          heroSort: d.heroSort ?? 0,
          heroEnabled: !row.enabled,
        });
        setMsg(`${row.data.productName} 배너를 ${!row.enabled ? "노출" : "숨김"}으로 바꿨습니다.`);
      }
      load();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "변경에 실패했습니다.");
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-kr text-2xl font-bold text-ink">메인 배너</h1>
          <p className="mt-1 max-w-2xl font-kr text-sm text-ink-soft">
            메인 상단에 도는 히어로 배너입니다. <b className="font-medium text-ink">누끼</b>는 상품별 사진·문구·배경색으로,
            <b className="font-medium text-ink"> 이미지</b>는 사진 한 장이 화면 전체를 덮습니다. 숫자가 작은 순서대로 돕니다.
            가격·재고·품절은 [상품 관리]에서 바꿉니다.
          </p>
        </div>
        <Link
          href="/admin/hero-banners/new"
          className="rounded-[2px] bg-ink px-4 py-2.5 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep"
        >
          + 배너 추가
        </Link>
      </div>

      {msg && (
        <p className="mt-4 rounded-[3px] bg-clay-soft/40 px-3 py-2 font-kr text-sm text-clay-deep">{msg}</p>
      )}

      {loading ? (
        <p className="mt-8 font-kr text-sm text-ink-faint">불러오는 중…</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-[4px] border border-line">
          <table className="w-full">
            <thead className="bg-cream-warm/50">
              <tr className="font-kr text-xs text-ink-soft">
                <th className="px-4 py-3 text-left font-medium">순서</th>
                <th className="px-4 py-3 text-left font-medium">배너</th>
                <th className="px-4 py-3 text-left font-medium">노출</th>
                <th className="px-4 py-3 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.kind}-${r.data.id}`} className="border-t border-line">
                  <td className="px-4 py-3 font-numeric text-sm text-ink-soft">{r.sort}</td>
                  <td className="px-4 py-3">
                    {r.kind === "cutout" ? (
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[4px] border border-line"
                          style={{ backgroundColor: r.data.heroColor ?? "#eee" }}
                        >
                          {r.data.heroImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.data.heroImageUrl} alt="" className="h-full w-full object-contain" />
                          ) : null}
                        </span>
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 truncate font-kr text-sm font-medium text-ink">
                            <KindBadge kind="cutout" />
                            {r.data.productName}
                          </p>
                          <p className="truncate font-kr text-xs text-ink-faint">{r.data.headline}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="block h-11 w-[78px] shrink-0 overflow-hidden rounded-[4px] border border-line bg-ink">
                          {r.data.imagePcUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.data.imagePcUrl} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </span>
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 truncate font-kr text-sm font-medium text-ink">
                            <KindBadge kind="image" />
                            {r.data.altText}
                          </p>
                          <p className="truncate font-kr text-xs text-ink-faint">
                            {r.data.buttonLabel && r.data.linkUrl
                              ? `버튼 '${r.data.buttonLabel}' → ${r.data.linkUrl}`
                              : "버튼 없음"}
                          </p>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={r.enabled}
                      onClick={() => toggle(r)}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${r.enabled ? "bg-ink" : "bg-line"}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper transition-all ${r.enabled ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={r.kind === "cutout" ? `/admin/hero-banners/${r.data.id}` : `/admin/hero-banners/image/${r.data.id}`}
                      className="font-kr text-sm font-medium text-clay-deep underline-offset-4 hover:underline"
                    >
                      편집
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function KindBadge({ kind }: { kind: "cutout" | "image" }) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 font-kr text-[11px] font-medium ${
        kind === "image" ? "border-clay-deep text-clay-deep" : "border-line text-ink-soft"
      }`}
    >
      {kind === "image" ? "이미지" : "누끼"}
    </span>
  );
}
