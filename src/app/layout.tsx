import type { Metadata } from "next";
import { Archivo, Gowun_Batang } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { SITE_URL } from "@/lib/site";
// 본문 한글: Pretendard(동적 서브셋 — 필요한 글자만 로드). Noto Sans 보다 부드럽다.
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

/**
 * 서체 (2026-09-18 정리).
 * next/font 가 빌드 시 폰트를 셀프호스팅해서 외부 요청과 레이아웃 시프트를 없앤다.
 *
 *   본문·메뉴·버튼 : Pretendard Variable (동적 서브셋, 아래 import)
 *   제목           : 고운바탕(Gowun Batang) — 한글 세리프. 본문과 확실히 구분된다
 *   숫자·영문 라벨 : Archivo (가격·영양 수치·제품 영문명)
 *
 * 셋 다 SIL Open Font License 1.1 이라 상업 이용·웹 임베딩에 문제가 없다.
 * 쓰지 않던 Noto Sans KR(라틴 서브셋만 로드돼 한글에 기여 0)·Fraunces·Kaushan Script 는 걷어냈다.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

/** 제목 전용 한글 세리프. 굵기 두 단계만 쓴다. */
const gowunBatang = Gowun_Batang({
  variable: "--font-gowun",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "라이즌푸드",
    template: "%s | 라이즌푸드",
  },
  description: "크림오브라이스 — 곱게 도정한 쌀로 만든 탄수화물 보충 식품.",
  openGraph: {
    type: "website",
    siteName: "라이즌푸드",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/*
          JS 가 동작하는 환경에서만 히어로 챕터를 숨긴 상태로 시작한다.
          이 스크립트가 없으면 JS 실패 시 글이 영영 안 보인다.
          렌더 전에 실행돼야 깜빡임이 없으므로 head 에 인라인으로 둔다.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
      </head>
      <body
        className={`${archivo.variable} ${gowunBatang.variable} antialiased`}
      >
        {/* 키보드 사용자를 위한 본문 바로가기. 평소엔 숨고 포커스되면 나타난다. */}
        <a
          href="#main-content"
          className="sr-only rounded-[3px] bg-ink px-4 py-2 font-kr text-sm font-medium text-cream-warm focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100]"
        >
          본문 바로가기
        </a>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
