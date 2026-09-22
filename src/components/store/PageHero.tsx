import { Container } from "@/components/ui";
import { hasPublicAsset } from "@/lib/publicAssets";

/**
 * 콘텐츠 페이지(후기·공지 등) 맨 위에 까는 사진 밴드.
 *
 * 2026-09-22. 그 전까지 후기·공지·장바구니·문의는 실질 이미지가 한 장도 없어서
 * 식품 브랜드 사이트인데 글자만 있는 페이지가 이어졌다. 제목을 사진 위에 얹어
 * 페이지가 시작된다는 신호를 준다.
 *
 * ★ 사진이 없으면(파일이 지워졌거나 경로가 틀렸으면) 밴드를 크림색으로 깔고
 *   글자 색만 어둡게 바꾼다 — 제목이 사라지거나 안 읽히는 일은 없어야 한다.
 * ★ 장식이므로 alt 는 비운다. 제목은 그 위의 진짜 텍스트다.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  image,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  image: string;
}) {
  const ok = hasPublicAsset(image);

  return (
    <section className={`relative overflow-hidden ${ok ? "bg-ink" : "bg-cream-warm"}`}>
      {ok && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full select-none object-cover"
            draggable={false}
          />
          {/* 글자가 읽히도록 덮는 막. 사진이 밝아도 4.5:1 이 나오게 충분히 어둡게 둔다. */}
          <div aria-hidden="true" className="absolute inset-0 bg-ink/62" />
        </>
      )}

      <Container className="relative py-16 md:py-20">
        <p
          className={`font-en text-[11px] font-medium uppercase tracking-[0.22em] ${
            ok ? "text-clay-soft" : "text-clay-deep"
          }`}
        >
          {eyebrow}
        </p>
        <h1
          className={`mt-3 font-display text-title font-semibold tracking-[-0.01em] [word-break:keep-all] ${
            ok ? "text-cream-warm" : "text-ink"
          }`}
        >
          {title}
        </h1>
        {description && (
          <p
            className={`mt-3 max-w-lg font-kr text-[15px] leading-[1.7] [word-break:keep-all] ${
              ok ? "text-cream-warm/85" : "text-ink-soft"
            }`}
          >
            {description}
          </p>
        )}
      </Container>
    </section>
  );
}
