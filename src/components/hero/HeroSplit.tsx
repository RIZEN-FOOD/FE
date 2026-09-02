import { ProductPlaceholder } from "./layers/ProductPlaceholder";

/**
 * 히어로 — 좌우 2단.
 *
 *   왼쪽  문구 (크림 지면)
 *   오른쪽 사진. 화면 끝까지 꽉 차고, 여러 장이면 크로스페이드로 순환한다.
 *
 * 2단은 992px(lg) 이상에서만이고 그때만 화면 높이를 꽉 채운다.
 * 모바일에서는 문구가 먼저다 — 사진을 위에 두면 투명 고정 헤더가 겹쳐 안 읽힌다.
 *
 * 순수 CSS 애니메이션이라 JS 가 없어도 돈다. 서버 컴포넌트이므로
 * 사진과 문구가 처음 HTML 에 그대로 실린다 (SEO).
 *
 * ★ 사진 목록은 관리자가 site_setting 의 main.hero_images 로 바꾼다.
 *   이 컴포넌트는 받은 배열을 그릴 뿐이고, 개수 제한이 없다.
 *   한 장이면 자동으로 정지 화면이 된다.
 *
 * ── 겹침 방식에 대하여 ──
 * 두 장을 동시에 반투명으로 넘기면(A 는 사라지고 B 는 나타나고) 그 순간
 * 뒤 배경이 최대 25% 비쳐 사진이 옅어진다. 그래서 그렇게 하지 않는다.
 *
 * 맨 아래에 마지막 사진의 불투명 복사본을 깔아두고, 각 장은 그 위로
 * "덮어 올라오기만" 한다. 사라질 때는 이미 위층이 꽉 찬 뒤라 즉시 꺼도 보이지 않는다.
 * 덕분에 합성 결과가 항상 불투명하다 — 어느 순간에도 배경이 비치지 않는다.
 */

/** 한 장이 머무는 시간 */
const HOLD_MS = 3000;
/** 겹쳐 넘어가는 시간 */
const FADE_MS = 700;

export type HeroPhoto = { src: string; alt: string };

/**
 * 장수에 맞춰 keyframes 를 만든다. 한 바퀴 = 장수 x HOLD.
 *
 * 각 장의 지연은 i*HOLD - FADE 다. FADE 만큼 당기는 이유는
 * 첫 장이 로드 시점에 이미 떠 있어야 하기 때문이다.
 *
 * 꺼지는 시점이 두 가지다.
 *   보통 장  다음 장이 다 덮은 뒤 (HOLD+FADE)
 *   마지막 장  다음 차례인 첫 장은 아래층이라 덮어주지 못한다.
 *              그래서 첫 장이 올라오기 시작할 때(HOLD) 꺼지고,
 *              똑같은 사진인 맨 아래 복사본이 그 자리를 그대로 잇는다.
 */
function buildKeyframes(count: number): string {
  const total = count * HOLD_MS;
  const pct = (ms: number) => ((ms / total) * 100).toFixed(3);
  const fade = pct(FADE_MS);
  const hold = pct(HOLD_MS);
  const covered = pct(HOLD_MS + FADE_MS);
  // 즉시 끄기 위한 최소 간격. 이 순간 위층이 이미 꽉 차 있어 눈에 띄지 않는다.
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

export function HeroSplit({ photos }: { photos: HeroPhoto[] }) {
  const animated = photos.length > 1;
  const last = photos[photos.length - 1];

  return (
    <section
      className="relative grid grid-cols-1 lg:min-h-svh lg:grid-cols-2"
      aria-labelledby="hero-heading"
    >
      {/* ── 왼쪽 · 문구 ── */}
      <div className="flex items-center bg-cream-warm px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-[600px]">
          <p className="font-en text-[13px] font-semibold uppercase tracking-[0.08em] text-clay-deep">
            Clean Carbohydrate
          </p>
          <h1
            id="hero-heading"
            className="mt-4 font-kr text-[40px] font-bold leading-[1.1] tracking-[-0.035em] text-ink [word-break:keep-all] lg:text-[50px]"
          >
            쌀,<br />그대로
          </h1>
          <p className="mt-5 font-kr text-base leading-[1.6] text-ink-soft [word-break:keep-all]">
            곱게 도정한 쌀 100%. 물이나 우유에 풀어 드세요.
            운동 후 탄수화물 보충에 좋은 담백한 한 끼입니다.
          </p>
        </div>
      </div>

      {/* ── 오른쪽 · 사진 ── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-clay lg:aspect-auto lg:h-full">
        {photos.length === 0 ? (
          // 사진이 아직 없을 때. 깨진 이미지 대신 제품 도형을 세운다.
          <div className="flex h-full w-full items-center justify-center p-10">
            <ProductPlaceholder className="h-full max-h-[440px] w-auto drop-shadow-[0_28px_46px_rgba(90,60,40,0.32)]" />
          </div>
        ) : (
          <>
            {animated && (
              <>
                <style dangerouslySetInnerHTML={{ __html: buildKeyframes(photos.length) }} />
                {/*
                  받침 층. 마지막 사진과 같은 그림을 불투명하게 깔아둔다.
                  마지막 장이 꺼지고 첫 장이 올라오는 구간을 이 층이 메운다.
                  같은 주소라 네트워크 요청이 늘지 않는다.
                */}
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
      </div>
    </section>
  );
}
