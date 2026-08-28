/**
 * 씬2 — 그릇에 재료가 담긴 정적 장면.
 *
 * 계속 흐르는 연출이 아니다. 재료 누끼들이 그릇 위에 "담긴 채로" 멈춰 있고,
 * 크기 차이·겹침·그림자로 입체감을 준다.
 *
 * 재료 이미지는 AI 누끼. 그릇은 실사진이 오면 교체할 자리다.
 */
const toppings: { src: string; x: number; y: number; size: number; z: number; rot: number }[] = [
  // x·y 는 그릇 중심 기준 %(백분율), size 는 컨테이너 대비 %
  { src: "/assets/ingredients/blueberry.png", x: -18, y: -8, size: 26, z: 3, rot: -8 },
  { src: "/assets/ingredients/banana.png", x: 20, y: -12, size: 24, z: 2, rot: 10 },
  { src: "/assets/ingredients/almond.png", x: 30, y: 14, size: 17, z: 3, rot: 18 },
  { src: "/assets/ingredients/walnut.png", x: -30, y: 16, size: 20, z: 2, rot: -14 },
  { src: "/assets/ingredients/rice.png", x: 4, y: 22, size: 14, z: 1, rot: 6 },
];

export function BowlScene({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="relative mx-auto aspect-square w-[min(78vmin,560px)]">
        {/* 그릇 (실사진 오면 교체) */}
        <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full drop-shadow-[0_30px_50px_rgba(90,60,40,0.28)]" aria-hidden="true">
          <defs>
            <linearGradient id="bowlBodyScene" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5A6270" />
              <stop offset="70%" stopColor="#414855" />
              <stop offset="100%" stopColor="#2F343D" />
            </linearGradient>
            <radialGradient id="bowlCreamScene" cx="0.42" cy="0.32" r="0.8">
              <stop offset="0%" stopColor="#FFFDF9" />
              <stop offset="60%" stopColor="#F4EDE0" />
              <stop offset="100%" stopColor="#E4D5BE" />
            </radialGradient>
          </defs>
          <ellipse cx="200" cy="250" rx="150" ry="20" fill="#8A6748" opacity="0.22" />
          <path d="M52 130 a148 104 0 0 0 296 0 z" fill="url(#bowlBodyScene)" />
          <ellipse cx="200" cy="130" rx="148" ry="52" fill="#6E7686" />
          <ellipse cx="200" cy="132" rx="138" ry="46" fill="url(#bowlCreamScene)" />
          <ellipse cx="168" cy="118" rx="50" ry="15" fill="#FFFFFF" opacity="0.5" />
        </svg>

        {/* 그릇 위에 담긴 재료 누끼 */}
        {toppings.map((t, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={t.src}
            alt=""
            aria-hidden="true"
            className="absolute drop-shadow-[0_6px_10px_rgba(40,30,20,0.35)]"
            style={{
              left: `calc(50% + ${t.x}%)`,
              top: `calc(42% + ${t.y}%)`,
              width: `${t.size}%`,
              transform: `translate(-50%, -50%) rotate(${t.rot}deg)`,
              zIndex: t.z,
            }}
          />
        ))}
      </div>
    </div>
  );
}
