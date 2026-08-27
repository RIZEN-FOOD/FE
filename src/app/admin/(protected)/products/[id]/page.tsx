"use client";

import { use, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api/client";
import { ProductForm } from "@/components/admin/ProductForm";
import type { ProductDetail } from "@/types/product";

/**
 * 상품 수정.
 *
 * "new" 는 별도 라우트(/products/new)라 여기 오지 않는다.
 * 상세를 불러와 폼에 채운다.
 */
export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<ProductDetail>(`/api/admin/products/${id}`)
      .then(setDetail)
      .catch((e) => setError(e instanceof ApiError ? e.message : "상품을 불러오지 못했습니다."));
  }, [id]);

  if (error) {
    return <p className="font-kr text-sm text-clay-deep">{error}</p>;
  }
  if (!detail) {
    return <p className="font-kr text-sm text-ink-faint">불러오는 중…</p>;
  }

  return <ProductForm mode="edit" productId={Number(id)} initial={detail} />;
}
