"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { HeroBannerForm } from "@/components/admin/HeroBannerForm";
import { api } from "@/lib/api/client";
import type { HeroBannerDetail } from "@/types/product";

export default function AdminHeroBannerEditPage() {
  const params = useParams<{ id: string }>();
  const [detail, setDetail] = useState<HeroBannerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    api
      .get<HeroBannerDetail>(`/api/admin/hero-banners/${params.id}`)
      .then((d) => live && setDetail(d))
      .catch(() => live && setError("배너를 불러오지 못했습니다."));
    return () => {
      live = false;
    };
  }, [params.id]);

  return (
    <div className="max-w-4xl">
      <h1 className="font-kr text-2xl font-bold text-ink">배너 편집</h1>
      <p className="mt-1 font-kr text-sm text-ink-soft">
        이미지는 배경 없는 PNG로 올려 주세요. 구성 이미지는 비워 두면 그 자리가 비어 있습니다.
      </p>

      <div className="mt-8">
        {error ? (
          <p className="font-kr text-sm text-clay-deep">{error}</p>
        ) : detail ? (
          <HeroBannerForm detail={detail} />
        ) : (
          <p className="font-kr text-sm text-ink-faint">불러오는 중…</p>
        )}
      </div>
    </div>
  );
}
