import type { MetadataRoute } from "next";

import { serverApi } from "@/lib/server/api";
import { SITE_URL } from "@/lib/site";
import type { ProductListItem } from "@/types/product";
import type { NoticePublicPage } from "@/types/content";

/**
 * 사이트맵. 공개 페이지만 담는다.
 *
 * 상품·공지는 DB 에서 온다(하드코딩 금지). 관리자·마이페이지·주문 등 비공개/거래
 * 경로는 넣지 않는다(robots 에서도 막는다).
 * API 가 응답하지 않으면 정적 경로만 내보낸다.
 */
export const revalidate = 3600; // 1시간마다 갱신

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/products`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/reviews`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/notice`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/policy/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/policy/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/policy/shipping`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const [products, notices] = await Promise.all([
    serverApi.getJson<{ items: ProductListItem[] }>("/api/products?page=0&size=1000&sort=new"),
    serverApi.getJson<NoticePublicPage>("/api/notices?page=0&size=1000"),
  ]);

  const productRoutes: MetadataRoute.Sitemap = (products?.items ?? []).map((p) => ({
    url: `${base}/products/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const noticeRoutes: MetadataRoute.Sitemap = (notices?.items ?? []).map((n) => ({
    url: `${base}/notice/${n.id}`,
    lastModified: n.publishedAt ? new Date(n.publishedAt) : undefined,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [...staticRoutes, ...productRoutes, ...noticeRoutes];
}
