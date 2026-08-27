/**
 * 인증 화면 좌측(모바일에선 배경) 비주얼 패널.
 *
 * 로그인/회원가입 두 상태에 서로 다른 장면을 겹쳐두고, 활성 상태만 보이게 한다.
 * 토글하면 두 장면이 크로스페이드로 부드럽게 전환된다.
 *
 * 실제 제품 사진이 오면 이 도형들을 실사진으로 바꾼다.
 */
export function AuthVisual({ mode }: { mode: "login" | "signup" }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 로그인 장면 — 완성된 그릇, 따뜻한 클레이 */}
      <Scene active={mode === "login"}>
        <div className="absolute inset-0 bg-gradient-to-br from-clay-soft via-clay to-clay-deep" />
        <div
          className="absolute left-1/2 top-[-15%] h-[70vh] w-[70vh] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,253,249,0.9) 0%, rgba(232,196,166,0.3) 45%, transparent 70%)",
          }}
        />
        <svg viewBox="0 0 400 220" className="absolute left-1/2 top-1/2 w-[54%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_20px_40px_rgba(90,60,40,0.3)]" aria-hidden="true">
          <path d="M40 62 a160 92 0 0 0 320 0 z" fill="#414855" />
          <ellipse cx="200" cy="62" rx="160" ry="30" fill="#6B7383" />
          <ellipse cx="200" cy="64" rx="150" ry="26" fill="#F6F0E4" />
          <ellipse cx="158" cy="56" rx="46" ry="11" fill="#FFFFFF" opacity="0.5" />
          <circle cx="176" cy="60" r="9" fill="#35406B" />
          <circle cx="214" cy="56" r="7" fill="#3B4675" />
        </svg>
      </Scene>

      {/* 회원가입 장면 — 파우더가 쏟아지는 순간, 서늘한 슬레이트 */}
      <Scene active={mode === "signup"}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate via-slate-deep to-ink" />
        <div
          className="absolute left-[60%] top-[-10%] h-[60vh] w-[60vh] rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(222,177,145,0.6) 0%, rgba(184,127,93,0.2) 50%, transparent 72%)",
          }}
        />
        <svg viewBox="0 0 320 420" className="absolute left-1/2 top-1/2 h-[58%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_22px_44px_rgba(0,0,0,0.35)]" aria-hidden="true">
          <path d="M42 44 h236 a14 14 0 0 1 14 14 v312 a14 14 0 0 1 -14 14 h-236 a14 14 0 0 1 -14 -14 v-312 a14 14 0 0 1 14 -14 z" fill="#FFFDF9" />
          <path d="M28 44 h264 v-16 a6 6 0 0 0 -6 -6 h-252 a6 6 0 0 0 -6 6 z" fill="#E8E1D5" />
          <text x="160" y="150" textAnchor="middle" fill="#35406B" fontFamily="Archivo, sans-serif" fontSize="56" fontWeight="800" letterSpacing="-1">RiZen</text>
          <text x="160" y="250" textAnchor="middle" fill="#221E1C" fontFamily="Archivo, sans-serif" fontSize="20" fontWeight="700" letterSpacing="2">CREAM OF RICE</text>
        </svg>
      </Scene>

      {/* 브랜드 워드마크 */}
      <div className="absolute bottom-10 left-10 z-10">
        <p className="font-en text-2xl font-extrabold tracking-tight text-cream-warm">RiZen</p>
        <p className="mt-1 font-kr text-sm text-cream-warm/80">
          {mode === "login" ? "다시 오신 것을 환영합니다" : "곱게 도정한 쌀, 크림오브라이스"}
        </p>
      </div>
    </div>
  );
}

/** 크로스페이드되는 한 장면. active 만 보인다. */
function Scene({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      className="absolute inset-0 transition-opacity duration-700 ease-out"
      style={{ opacity: active ? 1 : 0 }}
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}
