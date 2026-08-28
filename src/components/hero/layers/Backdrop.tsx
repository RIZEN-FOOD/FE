/**
 * 히어로 배경. 클레이 그라디언트 + 조명.
 * 전부 CSS 라 자산이 필요 없고 로딩 비용이 0 이다.
 *
 * data-hero-glow 요소는 스크롤에 따라 위치가 움직인다.
 * 조명이 실제로 존재하는 것처럼 보이게 하는 장치다.
 */
export function Backdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-b from-clay-soft via-clay to-clay-deep" />

      {/* 파우더 흩날림 질감 (AI 생성). 그라디언트 위에 얹어 깊이를 더한다. */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-soft-light"
        style={{ backgroundImage: "url('/assets/bg/hero-bg.png')" }}
      />

      {/* 위쪽에서 비추는 광원 */}
      <div
        data-hero-glow
        className="absolute left-1/2 top-[-20%] h-[80vh] w-[80vh] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,253,249,0.9) 0%, rgba(232,196,166,0.35) 45%, transparent 70%)",
        }}
      />

      {/* 바닥의 따뜻한 반사광 */}
      <div
        className="absolute inset-x-0 bottom-0 h-[35vh] opacity-60"
        style={{
          background:
            "linear-gradient(to top, rgba(184,127,93,0.55) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
