/**
 * 줄기를 받는 그릇.
 *
 * ★ 실사진이 오면 이 파일만 교체한다 (그릇 정면~약간 위에서 본 컷, 누끼).
 *   비율은 제품 패키지의 보울 그래픽을 따랐다.
 */
export function BowlPlaceholder({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 220" className={className} aria-hidden="true" role="presentation">
      <defs>
        <linearGradient id="bowlBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5A6270" />
          <stop offset="70%" stopColor="#414855" />
          <stop offset="100%" stopColor="#2F343D" />
        </linearGradient>
        <radialGradient id="bowlContent" cx="0.42" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FFFDF9" />
          <stop offset="60%" stopColor="#F4EDE0" />
          <stop offset="100%" stopColor="#E4D5BE" />
        </radialGradient>
      </defs>

      {/* 그릇 몸통 */}
      <path d="M40 62 a160 92 0 0 0 320 0 z" fill="url(#bowlBody)" />
      {/* 테두리 */}
      <ellipse cx="200" cy="62" rx="160" ry="30" fill="#6B7383" />
      {/* 담긴 내용물 */}
      <ellipse cx="200" cy="64" rx="150" ry="26" fill="url(#bowlContent)" />
      {/* 표면 광택 */}
      <ellipse cx="158" cy="56" rx="46" ry="11" fill="#FFFFFF" opacity="0.45" />
      {/* 바닥 그림자 */}
      <ellipse cx="200" cy="196" rx="120" ry="14" fill="#8A6748" opacity="0.28" />
    </svg>
  );
}
