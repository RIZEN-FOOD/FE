"use client";

import { use, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api/client";
import { BannerForm } from "@/components/admin/BannerForm";
import type { BannerAdminItem } from "@/types/content";

export default function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [banner, setBanner] = useState<BannerAdminItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<BannerAdminItem>(`/api/admin/banners/${id}`)
      .then(setBanner)
      .catch((e) => setError(e instanceof ApiError ? e.message : "배너를 불러오지 못했습니다."));
  }, [id]);

  if (error) return <p className="font-kr text-sm text-clay-deep">{error}</p>;
  if (!banner) return <p className="font-kr text-sm text-ink-faint">불러오는 중…</p>;
  return <BannerForm mode="edit" bannerId={Number(id)} initial={banner} />;
}
