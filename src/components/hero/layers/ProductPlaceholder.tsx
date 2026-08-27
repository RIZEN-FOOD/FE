/**
 * 제품 패키지 자리를 채우는 임시 도형.
 *
 * ★ 실사진이 확보되면 이 파일만 교체한다.
 *   누끼 PNG 를 next/image 로 바꿔 끼우면 되고, 바깥 레이어는 손대지 않는다.
 *   실루엣 비율은 실제 패키지(세로형 스탠딩 파우치)를 따랐다.
 */
export function ProductPlaceholder({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 420"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        {/* 패키지 표면의 미묘한 광택. 조명이 있는 것처럼 보이게 한다. */}
        <linearGradient id="bagFace" x1="0" y1="0" x2="1" y2="0.2">
          <stop offset="0%" stopColor="#FFFDF9" />
          <stop offset="45%" stopColor="#F4EFE6" />
          <stop offset="100%" stopColor="#E3DACB" />
        </linearGradient>
        <linearGradient id="bowlFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5A6270" />
          <stop offset="100%" stopColor="#383E47" />
        </linearGradient>
      </defs>

      {/* 파우치 본체 */}
      <path
        d="M42 44 h236 a14 14 0 0 1 14 14 v312 a14 14 0 0 1 -14 14 h-236 a14 14 0 0 1 -14 -14 v-312 a14 14 0 0 1 14 -14 z"
        fill="url(#bagFace)"
      />
      {/* 상단 실링 */}
      <path d="M28 44 h264 v-16 a6 6 0 0 0 -6 -6 h-252 a6 6 0 0 0 -6 6 z" fill="#E8E1D5" />

      {/* 보울 그래픽 */}
      <ellipse cx="160" cy="196" rx="66" ry="14" fill="#6B7280" opacity="0.35" />
      <path d="M94 190 a66 46 0 0 0 132 0 z" fill="url(#bowlFace)" />
      <ellipse cx="160" cy="190" rx="66" ry="15" fill="#F4EFE6" />
      {/* 블루베리 */}
      <circle cx="146" cy="186" r="7" fill="#35406B" />
      <circle cx="164" cy="182" r="6" fill="#35406B" />

      {/* 워드마크 자리 — 실제 로고 SVG 를 받으면 이 자리에 넣는다 */}
      <text
        x="160"
        y="132"
        textAnchor="middle"
        fill="#35406B"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="52"
        fontWeight="800"
        letterSpacing="-1"
      >
        RiZen
      </text>
      <text
        x="160"
        y="288"
        textAnchor="middle"
        fill="#221E1C"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="19"
        fontWeight="700"
        letterSpacing="1.5"
      >
        CREAM OF RICE
      </text>
      <text
        x="160"
        y="312"
        textAnchor="middle"
        fill="#5A524C"
        fontFamily="var(--font-noto-sans-kr), sans-serif"
        fontSize="14"
      >
        쌀가루
      </text>
      <text
        x="160"
        y="356"
        textAnchor="middle"
        fill="#9A8E85"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="11"
        letterSpacing="1"
      >
        NET WT 1kg
      </text>
    </svg>
  );
}
