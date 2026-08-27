"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { AdminProductPage } from "@/types/product";

/**
 * 대시보드.
 *
 * ★ 실제로 볼 것만 올린다. 쓰지 않는 차트는 넣지 않는다 (기획서 §7.1).
 *   지금 데이터가 있는 지표는 상품 현황뿐이다.
 *   방문·신규 회원·미답변 문의는 회원·문의 기능(다음 단계)이 들어와야 채워진다.
 *   숫자를 지어내지 않고, 준비 전 지표는 준비 중으로 정직하게 보여준다.
 */
export default function DashboardPage() {
  const [stats, setStats] = useState<{ total: number; featured: number; soldOut: number } | null>(null);

  useEffect(() => {
    // 관리자 목록 전체를 한 번 훑어 현황을 센다.
    api.get<AdminProductPage>("/api/admin/products?page=0&size=100").then((res) => {
      setStats({
        total: res.totalCount,
        featured: res.items.filter((p) => p.featured).length,
        soldOut: res.items.filter((p) => p.soldOut).length,
      });
    }).catch(() => setStats(null));
  }, []);

  return (
    <div>
      <h1 className="font-kr text-2xl font-bold text-ink">대시보드</h1>
      <p className="mt-1 font-kr text-sm text-ink-soft">사이트 현황을 한눈에 봅니다.</p>

      {/* 지금 데이터가 있는 지표 */}
      <section className="mt-8">
        <h2 className="font-kr text-sm font-semibold text-ink-soft">상품 현황</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="전체 상품" value={stats?.total} />
          <StatCard label="메인 노출" value={stats?.featured} />
          <StatCard label="품절" value={stats?.soldOut} tone={stats && stats.soldOut > 0 ? "warn" : "default"} />
        </div>
      </section>

      {/* 아직 데이터가 없는 지표 — 정직하게 준비 중 */}
      <section className="mt-8">
        <h2 className="font-kr text-sm font-semibold text-ink-soft">준비 중인 지표</h2>
        <p className="mt-1 font-kr text-xs text-ink-faint">
          회원·문의 기능이 들어오면 오늘 방문 / 신규 회원 / 미답변 문의가 여기 표시됩니다.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="오늘 방문" value={undefined} pending />
          <StatCard label="신규 회원" value={undefined} pending />
          <StatCard label="미답변 문의" value={undefined} pending />
        </div>
      </section>

      <div className="mt-8">
        <Link
          href="/admin/products"
          className="inline-block rounded-[2px] bg-ink px-5 py-2.5 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep"
        >
          상품 관리로 가기
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  pending,
  tone = "default",
}: {
  label: string;
  value: number | undefined;
  pending?: boolean;
  tone?: "default" | "warn";
}) {
  return (
    <div className="rounded-[4px] border border-line bg-paper px-4 py-4">
      <p className="font-kr text-xs text-ink-faint">{label}</p>
      <p className={`mt-1 font-numeric text-2xl font-bold ${tone === "warn" ? "text-clay-deep" : "text-ink"}`}>
        {pending ? "—" : value ?? "…"}
      </p>
    </div>
  );
}
