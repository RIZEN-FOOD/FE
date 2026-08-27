# FE — 라이즌푸드 웹

Next.js 15 (App Router) / TypeScript / Tailwind CSS v4 / GSAP / Lenis / Zustand

레포 루트의 [README](../README.md) 를 먼저 읽는다.

## 실행

    npm install
    npm run dev      # http://localhost:3000
    npm run build
    npm run lint

API 주소는 루트 `.env` 의 `NEXT_PUBLIC_API_BASE_URL` 로 넘어온다.
`NEXT_PUBLIC_` 접두사가 붙은 값은 브라우저에 노출되므로 비밀값을 넣지 않는다.

## 구조

    src/app/            라우트 (App Router)
      globals.css       ★ 디자인 토큰 정의 (@theme)
      layout.tsx        서체 주입, 공통 메타데이터
    src/components/ui/  공용 컴포넌트
    src/lib/            유틸 (cn 등)
    src/store/          Zustand 스토어

## 디자인 토큰

Tailwind v4 는 `tailwind.config.ts` 대신 CSS 의 `@theme` 으로 토큰을 정의한다.
팔레트와 서체는 전부 `src/app/globals.css` 에 있다. 값 목록은 루트 README 참조.

색상 hex 를 컴포넌트에 직접 적지 않는다. `bg-clay`, `text-ink-soft` 처럼 토큰 이름을 쓴다.

서체 변수는 `@theme inline` 안에 둔다.
next/font 가 만든 변수는 `<body>` 에 붙는데 일반 `@theme` 은 `:root` 에서 값을 계산해
그 변수를 읽지 못하기 때문이다. 폰트를 추가할 때 이 블록에 넣어야 한다.

## 접근성·성능 규칙

- `prefers-reduced-motion` 을 존중한다 (globals.css 에 전역 처리, GSAP 쪽도 별도 분기)
- JS 없이도 텍스트가 DOM 에 존재해야 한다 (SEO). 서버 컴포넌트를 기본으로 쓴다
- 첫 화면 2.5초 이내, Lighthouse 모바일 90+
