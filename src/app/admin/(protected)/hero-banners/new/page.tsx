"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { HeroImageSlideForm } from "@/components/admin/HeroImageSlideForm";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import type { HeroBannerRow, HeroImageSlideAdmin } from "@/types/product";

type Mode = "cutout" | "image";

/**
 * 메인 배너 추가 — 등록 방식을 고른다 (2026-10-13).
 *
 *   누끼 상품으로 등록  — 상품을 고르면 지금까지 쓰던 누끼 편집 화면으로 간다(상품 1개 = 슬라이드 1개).
 *   이미지 하나로 등록  — 사진 한 장이 히어로 화면 전체를 덮고, 버튼은 원하는 주소로 보낸다.
 */
export default function AdminHeroBannerNewPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("image");
  const [products, setProducts] = useState<HeroBannerRow[]>([]);
  const [productId, setProductId] = useState<string>("");
  const [nextSort, setNextSort] = useState(0);

  useEffect(() => {
    let live = true;
    Promise.all([
      api.get<HeroBannerRow[]>("/api/admin/hero-banners"),
      api.get<HeroImageSlideAdmin[]>("/api/admin/hero-image-slides"),
    ])
      .then(([rows, images]) => {
        if (!live) return;
        setProducts(rows);
        // 새 배너는 맨 뒤로 — 지금 가장 큰 순서 + 1
        const max = Math.max(0, ...rows.map((r) => r.heroSort), ...images.map((s) => s.sortOrder));
        setNextSort(max + 1);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);

  const options: { value: Mode; title: string; desc: string }[] = [
    { value: "cutout", title: "누끼 상품으로 등록", desc: "배경 없는 제품 사진을 가운데에 두고, 문구·가격·구매 버튼이 함께 나옵니다. (지금 방식)" },
    { value: "image", title: "이미지 하나로 등록", desc: "사진 한 장이 메인 화면 전체를 덮습니다. 버튼을 누르면 정한 상품이나 페이지로 이동합니다." },
  ];

  return (
    <div className="max-w-3xl">
      <Link href="/admin/hero-banners" className="font-kr text-sm text-ink-soft underline-offset-4 hover:underline">
        ← 메인 배너 목록
      </Link>
      <h1 className="mt-3 font-kr text-2xl font-bold text-ink">배너 추가</h1>

      {/* 등록 방식 */}
      <fieldset className="mt-6">
        <legend className="font-kr text-sm font-medium text-ink">등록 방식</legend>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          {options.map((o) => (
            <label
              key={o.value}
              className={cn(
                "flex cursor-pointer gap-3 rounded-[4px] border bg-paper px-4 py-4 transition",
                mode === o.value ? "border-ink" : "border-line hover:border-ink-faint",
              )}
            >
              <input
                type="radio"
                name="hero-mode"
                value={o.value}
                checked={mode === o.value}
                onChange={() => setMode(o.value)}
                className="mt-1 h-4 w-4 accent-ink"
              />
              <span>
                <span className="block font-kr text-sm font-bold text-ink">{o.title}</span>
                <span className="mt-1 block font-kr text-xs leading-relaxed text-ink-soft">{o.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-8">
        {mode === "cutout" ? (
          <div className="rounded-[4px] border border-line bg-paper px-5 py-5">
            <label className="block">
              <span className="font-kr text-sm font-medium text-ink">배너로 쓸 상품</span>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="mt-1.5 w-full rounded-[3px] border border-line bg-cream-warm px-3 py-2 font-kr text-sm outline-none focus:border-clay-deep"
              >
                <option value="">상품을 고르세요</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.productName}{p.heroEnabled ? " (이미 노출 중)" : ""}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-2 font-kr text-xs text-ink-faint">
              누끼 배너는 상품마다 하나입니다. 다음 화면에서 누끼 사진·문구·배경색을 넣고 &lsquo;노출&rsquo;을 켜면 메인에 나옵니다.
            </p>
            <button
              type="button"
              disabled={!productId}
              onClick={() => router.push(`/admin/hero-banners/${productId}`)}
              className="mt-4 rounded-[2px] bg-ink px-5 py-2 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-40"
            >
              다음 — 누끼 편집
            </button>
          </div>
        ) : (
          <HeroImageSlideForm key={`new-${nextSort}`} mode="create" defaultSort={nextSort} />
        )}
      </div>
    </div>
  );
}
