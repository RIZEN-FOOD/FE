"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { HeroImageSlideForm } from "@/components/admin/HeroImageSlideForm";
import { api } from "@/lib/api/client";
import type { HeroImageSlideAdmin } from "@/types/product";

/** 메인 배너 — 이미지 한 장 슬라이드 수정 (V41, 2026-10-13). */
export default function AdminHeroImageSlideEditPage() {
  const params = useParams<{ id: string }>();
  const [detail, setDetail] = useState<HeroImageSlideAdmin | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    api
      .get<HeroImageSlideAdmin>(`/api/admin/hero-image-slides/${params.id}`)
      .then((d) => live && setDetail(d))
      .catch(() => live && setError("배너를 불러오지 못했습니다."));
    return () => {
      live = false;
    };
  }, [params.id]);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/hero-banners" className="font-kr text-sm text-ink-soft underline-offset-4 hover:underline">
        ← 메인 배너 목록
      </Link>
      <h1 className="mt-3 font-kr text-2xl font-bold text-ink">이미지 배너 수정</h1>
      <p className="mt-1 font-kr text-sm text-ink-soft">사진 한 장이 메인 화면 전체를 덮는 배너입니다.</p>

      <div className="mt-6">
        {error ? (
          <p className="font-kr text-sm text-clay-deep">{error}</p>
        ) : detail ? (
          <HeroImageSlideForm mode="edit" initial={detail} />
        ) : (
          <p className="font-kr text-sm text-ink-faint">불러오는 중…</p>
        )}
      </div>
    </div>
  );
}
