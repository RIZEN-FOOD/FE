import type { Metadata } from "next";
import { Archivo, Noto_Sans_KR, Kaushan_Script } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import "./globals.css";

/**
 * 서체 3종 (기획서 부록).
 * next/font 가 빌드 시 폰트를 셀프호스팅해서 외부 요청과 레이아웃 시프트를 없앤다.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

/** 로고 워드마크 전용. 본문에 쓰지 않는다. */
const kaushan = Kaushan_Script({
  variable: "--font-kaushan",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "라이즌푸드",
    template: "%s | 라이즌푸드",
  },
  description: "크림오브라이스 — 곱게 도정한 쌀로 만든 탄수화물 보충 식품.",
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
        className={`${archivo.variable} ${notoSansKr.variable} ${kaushan.variable} antialiased`}
      >
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
