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
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_ORIGIN}/api/:path*` },
      // 로컬 이미지 저장소 폴백. 운영은 CloudFront 를 직접 쓰므로 여기 안 탄다.
      { source: "/uploads/:path*", destination: `${API_ORIGIN}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
