import Link from "next/link";

import { ProductPlaceholder } from "./layers/ProductPlaceholder";

/**
 * 히어로 — 풀블리드 이미지 + 중앙 대형 타이포 (포스터/에디토리얼).
 *
 * 사진이 화면을 가득 채우고, 초대형 제목·문구·CTA 를 화면 중앙에 앉힌다.
 * 어두운 톤 오버레이로 어떤 사진 위에서도 흰 글씨가 읽힌다.
 * 여러 장이면 순수 CSS 크로스페이드로 순환한다.
 *
 * 서버 컴포넌트라 문구가 처음 HTML 에 실린다 (SEO). JS 없이도 첫 사진이 보인다.
 *
 * ★ 사진 목록은 관리자가 site_setting 의 main.hero_images 로 바꾼다.
 *   한 장이면 자동으로 정지 화면이 된다.
 *
 * ── 겹침 방식 ──
 * 맨 아래에 마지막 사진의 불투명 복사본을 깔고, 각 장은 그 위로 "덮어 올라오기만"
 * 한다. 덕분에 전환 중에도 배경이 비치지 않아 사진이 옅어지지 않는다.
 */

const HOLD_MS = 3000;
const FADE_MS = 700;

export type HeroPhoto = { src: string; alt: string };

function buildKeyframes(count: number): string {
  const total = count * HOLD_MS;
  const pct = (ms: number) => ((ms / total) * 100).toFixed(3);
  const fade = pct(FADE_MS);
  const hold = pct(HOLD_MS);
  const covered = pct(HOLD_MS + FADE_MS);
  const off = (n: string) => (Number(n) + 0.001).toFixed(3);

  return `
@keyframes rz-hero-in {
  0% { opacity: 0; }
  ${fade}% { opacity: 1; }
  ${covered}% { opacity: 1; }
  ${off(covered)}% { opacity: 0; }
  100% { opacity: 0; }
}
@keyframes rz-hero-in-last {
  0% { opacity: 0; }
  ${fade}% { opacity: 1; }
  ${hold}% { opacity: 1; }
  ${off(hold)}% { opacity: 0; }
  100% { opacity: 0; }
}
@keyframes rz-hero-zoom {
  0% { transform: scale(var(--from)) translateZ(0); }
  ${hold}% { transform: scale(var(--to)) translateZ(0); }
  100% { transform: scale(var(--to)) translateZ(0); }
}
.rz-hero-shot { opacity: 0; }
.rz-hero-shot:first-of-type { opacity: 1; }
@media (prefers-reduced-motion: no-preference) {
  .rz-hero-shot {
    animation: rz-hero-in ${total}ms linear infinite;
    animation-delay: var(--delay);
    will-change: opacity;
  }
  .rz-hero-shot:last-of-type { animation-name: rz-hero-in-last; }
  .rz-hero-shot img {
    animation: rz-hero-zoom ${total}ms linear infinite;
    animation-delay: var(--delay);
    will-change: transform;
  }
}`;
}

/** 한 장 걸러 확대 방향을 뒤집는다. 원본 해상도가 낮아 폭은 좁게 둔다. */
const zoomFrom = (i: number) => (i % 2 === 0 ? "1" : "1.08");
const zoomTo = (i: number) => (i % 2 === 0 ? "1.08" : "1");

export function HeroSplit({
  photos,
  primaryHref,
}: {
  photos: HeroPhoto[];
  /** 주 CTA(바로 구매) 링크. 없으면 상품 목록으로 보낸다. */
  primaryHref?: string;
}) {
  const animated = photos.length > 1;
  const last = photos[photos.length - 1];
  const buyHref = primaryHref ?? "/products";

  return (
    <section
      className="relative min-h-svh w-full overflow-hidden bg-clay"
      aria-labelledby="hero-heading"
    >
      {/* ── 배경 사진 ── */}
      {photos.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <ProductPlaceholder className="h-[50vmin] max-h-[460px] w-auto drop-shadow-[0_28px_46px_rgba(90,60,40,0.32)]" />
        </div>
      ) : (
        <>
          {animated && (
            <>
              <style dangerouslySetInnerHTML={{ __html: buildKeyframes(photos.length) }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={last.src}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover object-center"
                style={{ transform: `scale(${zoomTo(photos.length - 1)})` }}
                decoding="async"
              />
            </>
          )}
          {photos.map((photo, i) => (
            <div
              key={photo.src}
              className={animated ? "rz-hero-shot absolute inset-0" : "absolute inset-0"}
              style={
                animated
                  ? ({
                      "--delay": `${i * HOLD_MS - FADE_MS}ms`,
                      "--from": zoomFrom(i),
                      "--to": zoomTo(i),
                    } as React.CSSProperties)
                  : undefined
              }
              aria-hidden={i > 0 ? "true" : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={i === 0 ? photo.alt : ""}
                className="h-full w-full object-cover object-center"
                fetchPriority={i === 0 ? "high" : undefined}
                decoding="async"
              />
            </div>
          ))}
        </>
      )}

      {/* ── 톤 오버레이 ── */}
      {/* 중앙 문구가 사진 어디에서도 읽히도록 전체를 고르게 덮는다. */}
      <div className="pointer-events-none absolute inset-0 bg-ink/55" />
      {/* 위·아래를 조금 더 짙게 — 헤더와 하단이 자연스럽게 가라앉는다 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink/45" />

      {/* ── 문구 · 화면 중앙 ── */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="mx-auto w-full max-w-3xl px-6 text-center">
          <p className="font-en text-[12px] font-semibold uppercase tracking-[0.24em] text-cream-warm/80">
            Clean Carbohydrate
          </p>
          <h1
            id="hero-heading"
            className="mt-4 font-display text-[clamp(3rem,10vw,6rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-cream-warm [word-break:keep-all] [text-shadow:0_2px_30px_rgba(0,0,0,0.4)]"
          >
            쌀, <em className="italic font-medium">그대로</em>
          </h1>
          <p className="mx-auto mt-6 max-w-md font-kr text-[15px] leading-[1.7] text-cream-warm/85 [word-break:keep-all] [text-shadow:0_1px_12px_rgba(0,0,0,0.45)]">
            곱게 도정한 쌀 100%. 물이나 우유에 풀어 드세요.
            운동 후 탄수화물 보충에 좋은 담백한 한 끼입니다.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={buyHref}
              className="rounded-[3px] bg-cream-warm px-8 py-3.5 font-kr text-sm font-bold text-ink transition hover:bg-paper"
            >
              구매하기
            </Link>
            <Link
              href="/products"
              className="rounded-[3px] border border-cream-warm/50 px-8 py-3.5 font-kr text-sm font-medium text-cream-warm transition hover:bg-cream-warm/10"
            >
              전체 상품 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
