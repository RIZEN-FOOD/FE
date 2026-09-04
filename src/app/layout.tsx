import type { Metadata } from "next";
import { Archivo, Noto_Sans_KR, Noto_Serif_KR, Fraunces, Kaushan_Script } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import "./globals.css";

/**
 * 서체.
 * next/font 가 빌드 시 폰트를 셀프호스팅해서 외부 요청과 레이아웃 시프트를 없앤다.
 *
 * 본문은 산세리프(Noto Sans KR / Archivo), 제목은 세리프 디스플레이
 * (본명조 Noto Serif KR + Fraunces)로 편집·프리미엄 식품 감성을 준다.
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

/** 한글 제목용 세리프(본명조). */
const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

/** 라틴 제목용 세리프. optical sizing 이 있어 큰 제목에서 표정이 산다. */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
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
        className={`${archivo.variable} ${notoSansKr.variable} ${notoSerifKr.variable} ${fraunces.variable} ${kaushan.variable} antialiased`}
      >
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
