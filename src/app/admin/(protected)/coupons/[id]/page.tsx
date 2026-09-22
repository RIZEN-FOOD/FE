"use client";

import { use, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import { CouponForm } from "@/components/admin/CouponForm";
import type { CouponAdminItem } from "@/types/coupon";

export default function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [coupon, setCoupon] = useState<CouponAdminItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<CouponAdminItem>(`/api/admin/coupons/${id}`)
      .then(setCoupon)
      .catch((e) => setError(e instanceof ApiError ? e.message : "할인코드를 불러오지 못했습니다."));
  }, [id]);

  if (error) return <p className="font-kr text-sm text-clay-deep">{error}</p>;
  if (!coupon) return <p className="font-kr text-sm text-ink-faint">불러오는 중…</p>;

  return (
    <div>
      <h1 className="font-kr text-2xl font-bold text-ink">할인코드 수정</h1>
      <p className="mt-1 font-kr text-sm text-ink-soft">
        이미 {coupon.orderCount.toLocaleString("ko-KR")}건에 쓰인 코드입니다. 조건을 바꾸면 이후 주문부터 적용됩니다.
      </p>
      <CouponForm initial={coupon} />
    </div>
  );
}
