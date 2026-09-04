# FE — 라이즌푸드 웹

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger + Lenis · Zustand

레포 루트(= `RIZEN-FOOD/.github`)의 [README](../README.md) 를 먼저 읽는다.
작업 규칙은 [CLAUDE.md](../CLAUDE.md).

## 실행

    npm install
    npm run dev      # 기본 http://localhost:3000 (포트가 쓰이면 next 가 다음 번호로 잡는다)
    npm run build
    npm run lint

API 주소는 `NEXT_PUBLIC_API_BASE_URL` 로 주입된다 (기본 `http://localhost:8080`).
`NEXT_PUBLIC_` 접두사 값은 브라우저에 노출되므로 비밀값을 넣지 않는다.

## 화면

### 공개 (스토어)

- 메인 `/` — 히어로(중앙 대형 타이포 + 사진 크로스페이드) · 대표 상품 · 브랜드 · 영양성분 · 활용법 · 후기 · 공지
- 상품 목록 `/products` · 상세 `/products/[slug]`
- 장바구니 `/cart` · 주문·결제 `/checkout` · 주문 상세 `/orders/[orderNo]` (취소·반품·교환 요청)
- 후기 `/reviews` · 공지 `/notice` · 1:1 문의 `/inquiry`
- 마이페이지 `/mypage` (주문 · 위시리스트 · 후기 · 문의 · 계정)
- 약관·개인정보·배송/교환/환불 `/policy/{terms,privacy,shipping}` — 전자상거래법 법정 페이지
- 로그인 `/auth/login`

### 관리자 `/admin` (로그인 후, 모든 API `@PreAuthorize`)

대시보드 · 주문 관리 · 취소·반품·교환 · 상품 관리 · 배너 관리 · 공지사항 · 후기 관리 · 문의함 · 사이트 설정.
회원 관리는 준비 중(백엔드 대기).

개발용: 디자인 토큰 미리보기 `/design-system`.

## 구조

    src/app/
      (store)/            공개 스토어 라우트 그룹
      admin/(protected)/  관리자 (인증 가드)
      globals.css         ★ 디자인 토큰(@theme) — 팔레트·서체 한 곳
      layout.tsx          서체 주입·공통 메타
    src/components/
      hero/ layout/ store/ admin/ ui/ policy/
    src/lib/              API 클라이언트·유틸 (cn, datetime …)
    src/store/            Zustand (memberAuth, adminAuth, cart, wishlist)
    src/types/            도메인 타입

## 서체

next/font + Pretendard(동적 서브셋). 컴포넌트에선 토큰으로만 쓴다.

- `font-kr` — Pretendard Variable (본문 한글) → Noto Sans KR 폴백
- `font-display` — Fraunces (제목 세리프) → Pretendard 폴백
- `font-en` — Archivo (라틴 UI). `.font-numeric`(숫자 강조)도 Archivo
- `font-script` — Kaushan Script (로고 전용)

서체 변수는 `globals.css` 의 `@theme inline` 안에 둔다.
next/font 가 만든 변수는 `<body>` 에 붙는데, 일반 `@theme`(`:root` 계산)은 그 변수를 못 읽기 때문이다.
폰트를 추가할 때 이 블록에 넣는다.

## 디자인 토큰

Tailwind v4 는 `tailwind.config.ts` 없이 CSS `@theme` 으로 토큰을 정의한다.
팔레트·서체는 전부 `src/app/globals.css`. 값 목록은 루트 README 참조.

색상 hex 를 컴포넌트에 직접 적지 않는다. `bg-clay`, `text-ink-soft` 처럼 토큰 이름을 쓴다.

## 접근성·성능

- `prefers-reduced-motion` 을 존중한다 (globals.css 전역 + GSAP 별도 분기)
- JS 없이도 텍스트가 DOM 에 존재해야 한다 (SEO). 서버 컴포넌트를 기본으로 쓴다
- 첫 화면 2.5초 이내, Lighthouse 모바일 90+

## 규칙 (요약 — 전문은 [CLAUDE.md](../CLAUDE.md))

- 상품·가격·배송비 하드코딩 금지 — 전부 DB 에서 온다
- 금액은 서버가 재계산, 재고는 원자적 차감, 주문번호는 비순번, 주문에 스냅샷 저장
- 식품 효능·효과 표현 금지 / 법정 표시사항은 이미지가 아닌 텍스트로
- JWT 는 HttpOnly·Secure·SameSite 쿠키 (localStorage 금지)
- `.env` 커밋 금지 · `main` 직접 커밋 금지 (phase 브랜치 사용)
