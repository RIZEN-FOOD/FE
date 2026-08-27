/**
 * 완성된 한 그릇. 3/4 각도 컷 자리.
 *
 * ★ 실사진이 오면 이 파일만 교체한다.
 *   두 번째로 주신 라이프스타일 컷이 이 자리에 가장 가깝다.
 *
 * 토핑(블루베리·아몬드)은 연출이며 제품에 포함되지 않는다.
 * 실제 상세페이지에는 "연출된 이미지" 고지가 필요하다.
 */
export function FinishedBowlPlaceholder({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 300" className={className} aria-hidden="true" role="presentation">
      <defs>
        <linearGradient id="fbBody" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#646C7A" />
          <stop offset="60%" stopColor="#454C59" />
          <stop offset="100%" stopColor="#31363F" />
        </linearGradient>
        <radialGradient id="fbCream" cx="0.38" cy="0.28" r="0.85">
          <stop offset="0%" stopColor="#FFFDF9" />
          <stop offset="55%" stopColor="#F6F0E4" />
          <stop offset="100%" stopColor="#E2D2B9" />
        </radialGradient>
      </defs>

      {/* 3/4 각도라 타원이 더 열려 보인다 */}
      <ellipse cx="210" cy="248" rx="140" ry="20" fill="#8A6748" opacity="0.26" />
      <path d="M56 120 a154 108 0 0 0 308 0 z" fill="url(#fbBody)" />
      <ellipse cx="210" cy="120" rx="154" ry="56" fill="#6E7686" />
      <ellipse cx="210" cy="122" rx="142" ry="49" fill="url(#fbCream)" />

      {/* 크림 표면의 결 */}
      <ellipse cx="180" cy="108" rx="52" ry="16" fill="#FFFFFF" opacity="0.5" />
      <ellipse cx="248" cy="136" rx="38" ry="12" fill="#EFE5D2" opacity="0.7" />

      {/* 토핑 — 블루베리 */}
      <circle cx="176" cy="112" r="13" fill="#35406B" />
      <circle cx="172" cy="107" r="4" fill="#FFFFFF" opacity="0.32" />
      <circle cx="212" cy="102" r="11" fill="#3B4675" />
      <circle cx="246" cy="124" r="12" fill="#2E3860" />
      {/* 토핑 — 아몬드 */}
      <ellipse cx="196" cy="138" rx="8" ry="13" fill="#C89B6A" transform="rotate(24 196 138)" />
      <ellipse cx="232" cy="146" rx="8" ry="13" fill="#BE8F5E" transform="rotate(-18 232 146)" />
      {/* 계피 가루 */}
      <circle cx="262" cy="110" r="2.4" fill="#9A6B3F" opacity="0.75" />
      <circle cx="270" cy="118" r="1.8" fill="#9A6B3F" opacity="0.6" />
      <circle cx="256" cy="120" r="2" fill="#9A6B3F" opacity="0.65" />
    </svg>
  );
}
