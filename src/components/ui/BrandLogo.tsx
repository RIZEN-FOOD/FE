/**
 * 브랜드 로고(워드마크). 누끼 PNG 라 밝은 지면 위에 얹는다.
 * 높이는 className 으로 조절한다 (예: h-7 w-auto).
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/brand/logo.png"
      alt="RiZen"
      className={`w-auto select-none ${className ?? "h-7"}`}
      draggable={false}
    />
  );
}
