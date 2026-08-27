"use client";

import { use, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api/client";
import { NoticeForm } from "@/components/admin/NoticeForm";
import type { NoticeAdminItem } from "@/types/content";

export default function EditNoticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [notice, setNotice] = useState<NoticeAdminItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<NoticeAdminItem>(`/api/admin/notices/${id}`)
      .then(setNotice)
      .catch((e) => setError(e instanceof ApiError ? e.message : "공지를 불러오지 못했습니다."));
  }, [id]);

  if (error) return <p className="font-kr text-sm text-clay-deep">{error}</p>;
  if (!notice) return <p className="font-kr text-sm text-ink-faint">불러오는 중…</p>;
  return <NoticeForm mode="edit" noticeId={Number(id)} initial={notice} />;
}
