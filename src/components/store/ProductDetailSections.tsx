"use client";

import Image from "next/image";
import { useState } from "react";

import type { DetailSection } from "@/types/product";

/**
 * 사진형 상세페이지.
 *
 * 관리자가 쌓은 블록을 순서대로 그린다. 사진은 가로 폭을 꽉 채우고 위아래로 <b>틈 없이</b> 이어 붙는다
 * (여러 장으로 잘라 올린 상세 이미지가 한 장처럼 보이게).
 *
 * ★ 영상은 눌러야 재생된다. 유튜브 iframe 을 처음부터 넣으면 페이지가 무거워지고,
 *   손님이 보지도 않은 영상을 내려받게 된다.
 * ★ iframe 은 유튜브 주소일 때만 만든다(서버도 같은 기준으로 검사한다).
 */
export function ProductDetailSections({ sections }: { sections: DetailSection[] }) {
  if (!sections || sections.length === 0) return null;

  return (
    <section className="mt-16 border-t border-line pt-10" aria-labelledby="detail-sections-heading">
      <h2 id="detail-sections-heading" className="sr-only">
        상품 상세 안내
      </h2>

      {/* 사진이 이어 붙도록 블록 사이 간격을 두지 않는다 */}
      <div className="mx-auto max-w-3xl">
        {sections.map((s, i) => (
          <Block key={i} section={s} priority={i === 0} />
        ))}
      </div>
    </section>
  );
}

function Block({ section, priority }: { section: DetailSection; priority: boolean }) {
  if (section.type === "IMAGE" && section.imageUrl) {
    return (
      <figure className="m-0">
        <Image
          src={section.imageUrl}
          alt={section.altText?.trim() || ""}
          width={1200}
          height={1600}
          sizes="(min-width: 768px) 768px, 100vw"
          priority={priority}
          className="block h-auto w-full"
        />
        {section.caption && (
          <figcaption className="px-5 py-3 font-kr text-caption text-ink-faint">{section.caption}</figcaption>
        )}
      </figure>
    );
  }

  if (section.type === "VIDEO") {
    return <VideoBlock section={section} />;
  }

  if (section.type === "TEXT") {
    return (
      <div className="px-5 py-10">
        {section.heading && (
          <h3 className="font-display text-xl font-semibold text-ink">{section.heading}</h3>
        )}
        {section.body && (
          <p className="mt-3 whitespace-pre-line font-kr text-base leading-relaxed text-ink-soft">{section.body}</p>
        )}
      </div>
    );
  }

  return null;
}

/** 유튜브 영상. 표지를 누르면 그때 재생기를 붙인다. */
function VideoBlock({ section }: { section: DetailSection }) {
  const [playing, setPlaying] = useState(false);
  const id = youtubeId(section.videoUrl);
  if (!id) return null;

  const poster = section.thumbnailUrl?.trim() || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

  return (
    <figure className="m-0">
      <div className="relative aspect-video w-full bg-ink">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={section.caption?.trim() || "상품 소개 영상"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label="영상 재생"
            className="group absolute inset-0 h-full w-full"
          >
            {/* 표지는 유튜브 이미지일 수 있어 next/image 최적화를 쓰지 않는다 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poster} alt="" className="h-full w-full object-cover" />
            <span className="absolute inset-0 grid place-items-center bg-ink/25 transition group-hover:bg-ink/35">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-paper/90 shadow-[0_8px_20px_rgba(34,30,28,0.3)]">
                <svg width="22" height="24" viewBox="0 0 22 24" aria-hidden="true">
                  <path d="M2 2l18 10L2 22z" fill="#221E1C" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
      {section.caption && (
        <figcaption className="px-5 py-3 font-kr text-caption text-ink-faint">{section.caption}</figcaption>
      )}
    </figure>
  );
}

/** 유튜브 주소에서 영상 id 만 뽑는다. 다른 주소면 null. */
function youtubeId(url: string | null): string | null {
  if (!url) return null;
  const m =
    /^https:\/\/(?:www\.)?youtube\.com\/watch\?v=([A-Za-z0-9_-]{6,20})/.exec(url) ??
    /^https:\/\/(?:www\.)?youtube\.com\/(?:embed|shorts)\/([A-Za-z0-9_-]{6,20})/.exec(url) ??
    /^https:\/\/youtu\.be\/([A-Za-z0-9_-]{6,20})/.exec(url);
  return m ? m[1] : null;
}
