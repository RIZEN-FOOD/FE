"use client";

import { use, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import { PopupForm } from "@/components/admin/PopupForm";
import type { PopupAdminItem } from "@/types/popup";

export default function EditPopupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [popup, setPopup] = useState<PopupAdminItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<PopupAdminItem>(`/api/admin/popups/${id}`)
      .then(setPopup)
      .catch((e) => setError(e instanceof ApiError ? e.message : "팝업을 불러오지 못했습니다."));
  }, [id]);

  if (error) return <p className="font-kr text-sm text-clay-deep">{error}</p>;
  if (!popup) return <p className="font-kr text-sm text-ink-faint">불러오는 중…</p>;
  return <PopupForm mode="edit" popupId={Number(id)} initial={popup} />;
}
