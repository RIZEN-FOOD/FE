"use client";

import { useState } from "react";
import type { ProductImage } from "@/types/product";

/**
 * 상품 이미지 갤러리.
 * 대표 이미지를 크게 보여주고, 여러 장이면 아래에 썸네일로 고를 수 있게 한다.
 */
export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-[4px] bg-clay-soft/40 font-en text-sm text-ink-faint">
        이미지 준비 중
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];

  return (
    <div>
      <div className="overflow-hidden rounded-[4px] bg-clay-soft/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={current.altText ?? name}
          className="aspect-square w-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-[3px] border transition ${
                i === active ? "border-clay-deep" : "border-line opacity-70 hover:opacity-100"
              }`}
              aria-label={`이미지 ${i + 1} 보기`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
