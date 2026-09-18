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
 *
 * ★ Cloudflare(OpenNext) 배포에서는 API_ORIGIN 에 포트 번호를 쓰지 않는다 (https://api.도메인).
 *   OpenNext 가 "http://host:8080" 의 ":8080" 을 경로 변수로 해석해 /api 중계가 500 이 난다.
 *   이 값은 빌드 때 박히므로 빌드 환경(CI)에서 넣는다.
 */
const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:8080";

const isDev = process.env.NODE_ENV !== "production";

/**
 * 콘텐츠 보안 정책(CSP).
 *
 * 저장형 XSS 는 서버가 저장할 때 HTML 을 살균해 막는다(CLAUDE.md 규칙 6).
 * CSP 는 그 다음 방어선이다 — 어딘가 한 군데가 뚫려도 공격자가 남의 서버에서
 * 스크립트를 끌어오거나, 훔친 데이터를 밖으로 보내거나, 우리 화면을 남의 사이트에
 * 끼워 넣지 못하게 한다.
 *
 * 허용한 바깥 출처는 실제로 쓰는 곳뿐이다.
 *   - 주소 검색(다음 우편번호): t1.daumcdn.net, postcode.map.daum.net
 *   - 결제(포트원 + 각 결제사 결제창): 아래 PAY_ORIGINS
 * 폰트는 next/font 가 셀프호스팅하므로 바깥 출처가 없다.
 *
 * script-src 에 'unsafe-inline' 이 남아 있는 이유: Next.js 가 화면을 띄울 때 인라인
 * 스크립트를 쓰고(JSON-LD 구조화 데이터 포함), 이를 없애려면 요청마다 nonce 를 심는
 * 미들웨어가 필요하다. 지금은 바깥 출처 차단 효과를 먼저 취한다.
 */
const PAY_ORIGINS = [
  "https://cdn.portone.io",
  "https://*.portone.io",
  "https://*.iamport.kr",
  "https://*.kakao.com",
  "https://*.kakaopay.com",
  "https://*.naver.com",
  "https://*.pay.naver.com",
  "https://*.toss.im",
  "https://*.tosspayments.com",
  "https://*.inicis.com",
  "https://*.kcp.co.kr",
];
// 주소 검색 위젯은 스크립트(daumcdn)를 받아 검색 화면(postcode.map.*)을 프레임으로 띄운다.
// 개발 서버는 http 라 위젯도 http 주소를 쓰므로, 개발에서만 http 주소를 함께 허용한다.
const POSTCODE_ORIGINS = [
  "https://t1.daumcdn.net",
  "https://*.daumcdn.net",
  "https://postcode.map.daum.net",
  "https://postcode.map.kakao.com",
  ...(isDev ? ["http://postcode.map.kakao.com", "http://postcode.map.daum.net"] : []),
];

// 상품 상세의 유튜브 영상 블록. 재생기를 프레임으로 띄우고, 표지 이미지를 받아온다.
// 쿠키를 적게 쓰는 youtube-nocookie 도메인을 쓴다.
const YOUTUBE_ORIGINS = [
  "https://www.youtube-nocookie.com",
  "https://www.youtube.com",
];

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}${[...POSTCODE_ORIGINS, ...PAY_ORIGINS, ...YOUTUBE_ORIGINS].join(" ")}`,
  "style-src 'self' 'unsafe-inline'",
  // 업로드 사진은 개발·운영 모두 같은 출처(/uploads)에서 온다.
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // 개발 서버는 웹소켓으로 화면을 새로 고친다(HMR).
  `connect-src 'self' ${isDev ? "ws: wss: " : ""}${[...POSTCODE_ORIGINS, ...PAY_ORIGINS].join(" ")}`,
  `frame-src 'self' ${[...POSTCODE_ORIGINS, ...PAY_ORIGINS, ...YOUTUBE_ORIGINS].join(" ")}`,
  // 우리 화면을 남의 사이트에 끼워 넣지 못하게 한다(클릭재킹).
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  // 결제사로 넘어가는 폼 전송은 막지 않는다. 다만 http 로는 못 보낸다.
  "form-action 'self' https:",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // 구형 브라우저용 클릭재킹 방어 (위 frame-ancestors 와 같은 목적)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 쓰지 않는 장치 권한은 꺼 둔다.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // 결제창이 새 창으로 열리므로 팝업은 허용하되, 다른 사이트가 우리 창을 붙잡지 못하게 한다.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig: NextConfig = {
  // 운영은 Docker 로 띄운다(FE/Dockerfile). 실행에 필요한 파일만 .next/standalone 에 모은다.
  output: "standalone",
  // 서버 종류·버전을 알려줄 이유가 없다.
  poweredByHeader: false,
  images: {
    // 로컬 정적 이미지(영양·레시피 등)를 AVIF/WebP 반응형으로 자동 최적화한다.
    // 제품 이미지는 BE 파이프라인이 이미 webp 다중 사이즈로 서빙하므로 next/image
    // 로 다시 최적화하지 않는다(원격 호스트/CDN 설정 의존을 피한다).
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
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
