"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import type { HeroBannerRow } from "@/types/product";

/**
 * 메인 히어로 배너 목록.
 *
 * 배너 = 상품 1개의 히어로 구성. 노출 토글은 여기서 바로 켜고 끌 수 있다.
 * 사진·문구·구성 이미지·순서 등 상세는 편집 화면에서 다룬다.
 */
export default function AdminHeroBannersPage() {
  const [rows, setRows] = useState<HeroBannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await api.get<HeroBannerRow[]>("/api/admin/hero-banners"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(row: HeroBannerRow) {
    // 노출만 빠르게 바꾼다. 나머지 값은 편집 화면에서 넣은 그대로 유지되도록
    // 상세를 읽어 통째로 다시 저장한다(부분 저장 API 를 따로 두지 않음).
    try {
      const d = await api.get<Record<string, unknown>>(`/api/admin/hero-banners/${row.id}`);
      await api.put(`/api/admin/hero-banners/${row.id}`, {
        heroHeadline: d.heroHeadline ?? null,
        heroSubcopy: d.heroSubcopy ?? null,
        heroColor: d.heroColor ?? null,
        heroImageKey: d.heroImageKey ?? null,
        heroBackdropKey: d.heroBackdropKey ?? null,
        heroAccent1Key: d.heroAccent1Key ?? null,
        heroAccent3Key: d.heroAccent3Key ?? null,
        heroAccent2Key: d.heroAccent2Key ?? null,
        heroSort: d.heroSort ?? 0,
        heroEnabled: !row.heroEnabled,
      });
      setMsg(`${row.productName} 배너를 ${!row.heroEnabled ? "노출" : "숨김"}으로 바꿨습니다.`);
      load();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "변경에 실패했습니다.");
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="font-kr text-2xl font-bold text-ink">메인 배너</h1>
      <p className="mt-1 font-kr text-sm text-ink-soft">
        메인 상단에 도는 히어로 배너입니다. 상품별로 사진·문구·구성 이미지·배경색·순서를 설정하고, 노출을 켜고 끕니다.
        가격·재고·품절은 [상품 관리]에서 바꿉니다.
      </p>

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
                <tr key={r.id} className="border-t border-line">
                  <td className="px-4 py-3 font-numeric text-sm text-ink-soft">{r.heroSort}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[4px] border border-line"
                        style={{ backgroundColor: r.heroColor ?? "#eee" }}
                      >
                        {r.heroImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.heroImageUrl} alt="" className="h-full w-full object-contain" />
                        ) : null}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-kr text-sm font-medium text-ink">{r.productName}</p>
                        <p className="truncate font-kr text-xs text-ink-faint">{r.headline}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={r.heroEnabled}
                      onClick={() => toggle(r)}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${r.heroEnabled ? "bg-ink" : "bg-line"}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper transition-all ${r.heroEnabled ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/hero-banners/${r.id}`}
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
