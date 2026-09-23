/**
 * 로딩 자리표시자. 화면이 오기 전, 올 자리에 같은 모양의 옅은 덩어리를 둔다.
 *
 * ★ 최종 화면과 같은 배치로 놓는다 — 빈 화면이었다가 툭 나오는 것을 막는 게 목적이라,
 *   모양이 다르면 두 번 놀란다. 원형 스피너는 쓰지 않는다.
 * ★ 색은 클레이 톤 한 가지. 숨쉬는 정도의 pulse 만 쓰고, 모션 최소화 설정이면 전역 규칙이 꺼준다.
 * ★ 스크린리더에는 읽히지 않는다(aria-hidden). 로딩 안내는 감싸는 쪽이 한 번만 한다.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-[12px] bg-clay-soft/40 ${className ?? ""}`}
    />
  );
}

/** 글줄 자리. 폭을 달리 주면 문단처럼 보인다. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  const widths = ["w-full", "w-11/12", "w-4/5", "w-2/3"];
  return (
    <div aria-hidden="true" className={`flex flex-col gap-2.5 ${className ?? ""}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-4 animate-pulse rounded-[6px] bg-clay-soft/40 ${widths[i % widths.length]}`} />
      ))}
    </div>
  );
}
