import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/**
 * robots.txt.
 *
 * 공개 페이지는 모두 색인 허용. 관리자·마이페이지·주문/장바구니/결제/인증 등
 * 비공개·거래 경로는 색인에서 제외한다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/mypage", "/cart", "/checkout", "/orders", "/auth", "/design-system"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
