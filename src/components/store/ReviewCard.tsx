import Link from "next/link";

import { formatDate } from "@/lib/datetime";
import type { ReviewItem } from "@/types/member";

/** 별점 — 채워진 별/빈 별을 SVG 로 그린다(이모지 대신). */
function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`5점 만점에 ${rating}점`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill={i < rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.4"
          className={i < rating ? "text-clay-deep" : "text-line"}
          aria-hidden="true"
        >
          <path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.9l-5.81 3.06 1.11-6.47-4.7-4.58 6.5-.95z" />
        </svg>
      ))}
    </span>
  );
}

function Badge({ tone, children }: { tone: "soft" | "ad"; children: React.ReactNode }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-kr text-caption ${
        tone === "ad" ? "bg-clay-soft text-clay-deep" : "bg-cream-warm text-ink-soft"
      }`}
    >
      {children}
    </span>
  );
}

/**
 * 후기 카드. 홈 미리보기와 후기 모아보기가 공유한다.
 *
 * 별점 · 내용 · 후기자 · 날짜를 담은 직사각형 카드.
 * 앞머리에 세리프 따옴표를 두어 편집 감성을 준다.
 * 협찬 후기는 광고 표시(법적 의무), 구매 확인 배지도 노출한다.
 */
export function ReviewCard({
  review,
  clamp = false,
  size = "md",
}: {
  review: ReviewItem;
  /** 홈 미리보기처럼 높이를 맞춰야 할 때 본문을 줄인다. */
  clamp?: boolean;
  /** 메인에서 첫 후기를 크게 보여줄 때. 여백과 본문 크기가 한 단계 커진다. */
  size?: "md" | "lg";
}) {
  const lg = size === "lg";
  return (
    <article
      className={`group flex h-full flex-col rounded-[12px] border border-line bg-paper transition-[transform,box-shadow,border-color] duration-[var(--dur-base)] ease-[var(--ease-out)] hover:-translate-y-1 hover:border-clay-soft hover:shadow-[0_24px_48px_-20px_rgba(90,60,40,0.25)] ${
        lg ? "p-8 md:p-10" : "p-6"
      }`}
    >
      <div className="flex items-center justify-between">
        <Stars rating={review.rating} />
        <div className="flex gap-1.5">
          {review.verifiedPurchase && <Badge tone="soft">구매 확인</Badge>}
          {review.sponsored && <Badge tone="ad">광고</Badge>}
        </div>
      </div>

      {/* 세리프 따옴표 장식 */}
      <span
        aria-hidden="true"
        className="mt-3 block font-display text-4xl italic leading-none text-clay/40"
      >
        &ldquo;
      </span>

      <p
        className={`mt-1 flex-1 whitespace-pre-line font-kr leading-[1.8] text-ink ${
          lg ? "text-lead" : "text-base"
        } ${clamp ? "line-clamp-5" : lg ? "line-clamp-[9]" : ""}`}
      >
        {review.content}
      </p>

      {review.imageUrls.length > 0 && (
        <div className="mt-4 flex gap-2">
          {review.imageUrls.slice(0, 3).map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={url}
              alt=""
              className="h-16 w-16 rounded-[12px] object-cover"
            />
          ))}
        </div>
      )}

      <div className="mt-5 flex items-end justify-between border-t border-line pt-4">
        <div className="min-w-0">
          <p className="font-kr text-sm font-semibold text-ink">{review.authorName}</p>
          <Link
            href={`/products/${review.productSlug}`}
            className="mt-0.5 block truncate font-kr text-caption text-ink-faint transition hover:text-clay-deep"
          >
            {review.productName}
          </Link>
        </div>
        <time className="shrink-0 font-numeric text-caption text-ink-faint">
          {formatDate(review.createdAt)}
        </time>
      </div>
    </article>
  );
}
