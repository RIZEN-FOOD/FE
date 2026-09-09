import type { NextConfig } from "next";

/**
 * API 프록시.
 *
 * JWT 는 HttpOnly + SameSite=Lax 쿠키에 담긴다. SameSite=Lax 쿠키는
 * 크로스 오리진 fetch(3000 → 8080)에는 실리지 않는다.
 * 그래서 프론트에서 /api 를 같은 출처처럼 부르고, 여기서 백엔드로 넘긴다.
 * 브라우저 입장에서는 same-origin 이라 쿠키가 그대로 오간다.
 *
 * 운영에서도 같은 패턴을 쓴다. 프록시 대상만 환경변수로 바뀐다.
 */
const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  images: {
    // 로컬 정적 이미지(영양·레시피 등)를 AVIF/WebP 반응형으로 자동 최적화한다.
    // 제품 이미지는 BE 파이프라인이 이미 webp 다중 사이즈로 서빙하므로 next/image
    // 로 다시 최적화하지 않는다(원격 호스트/CDN 설정 의존을 피한다).
    formats: ["image/avif", "image/webp"],
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_ORIGIN}/api/:path*` },
      // 로컬 이미지 저장소 폴백. 운영은 CloudFront 를 직접 쓰므로 여기 안 탄다.
      { source: "/uploads/:path*", destination: `${API_ORIGIN}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
