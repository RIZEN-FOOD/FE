/**
 * 인증 화면 좌측(모바일에선 배경) 비주얼 패널.
 *
 * 로그인/회원가입 두 장면을 실사진으로 겹쳐두고, 활성 상태만 보이게 한다.
 * 토글하면 두 사진이 크로스페이드로 부드럽게 전환된다.
 *
 * 사진은 관리자 설정(auth.login_image / auth.signup_image)에서 온다.
 * 비어 있으면 저장소에 넣어둔 기본 사진을 쓴다 — 하드코딩이 아니라 폴백이다.
 */
export function AuthVisual({
  mode,
  loginImage,
  signupImage,
}: {
  mode: "login" | "signup";
  loginImage: string;
  signupImage: string;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-clay-deep">
      <Scene active={mode === "login"} src={loginImage} />
      <Scene active={mode === "signup"} src={signupImage} />
      {/* 하단을 살짝 어둡게 — 사진 위 문구/헤더 가독성 여유 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(34,30,28,0.35), transparent 55%)" }}
      />
    </div>
  );
}

/** 크로스페이드되는 한 장면. active 만 보인다. */
function Scene({ active, src }: { active: boolean; src: string }) {
  return (
    <div
      className="absolute inset-0 transition-opacity duration-700 ease-out"
      style={{ opacity: active ? 1 : 0 }}
      aria-hidden={!active}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full select-none object-cover" draggable={false} />
    </div>
  );
}
