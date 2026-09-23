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
          width="14"
          height="14"
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

/**
 * 후기 한 편. 홈 미리보기와 후기 모아보기가 공유한다.
 *
 * 2026-09-23. 카드를 걷어냈다. 후기는 «사람이 한 말»이라 상자보다 인용문이 맞다.
 *   테두리·배경 없이 지면 위에 별점 → 본문 → 이름·상품·날짜 순으로 놓인다.
 *   여럿을 나란히 둘 때의 구분은 감싸는 쪽(ReviewPreview·목록)이 hairline 으로 한다.
 *   협찬 후기의 «광고» 표시는 법적 의무라 그대로 둔다. 배지 모양 대신 글자로 적는다.
 */
export function ReviewCard({
  review,
  clamp = false,
  size = "md",
}: {
  review: ReviewItem;
  /** 홈 미리보기처럼 높이를 맞춰야 할 때 본문을 줄인다. */
  clamp?: boolean;
  /** 메인에서 첫 후기를 크게 보여줄 때. 본문이 인용문 크기로 커진다. */
  size?: "md" | "lg";
}) {
  const lg = size === "lg";
  return (
    <article className="flex h-full flex-col">
      <div className="flex items-center gap-3">
        <Stars rating={review.rating} />
        {(review.verifiedPurchase || review.sponsored) && (
          <span className="font-kr text-caption text-ink-faint">
            {review.verifiedPurchase && "구매 확인"}
            {review.verifiedPurchase && review.sponsored && " · "}
            {review.sponsored && <span className="font-medium text-clay-deep">광고</span>}
          </span>
        )}
      </div>

      <blockquote
        className={`mt-4 flex-1 whitespace-pre-line font-kr text-ink ${
          lg
            ? "font-display text-lead font-semibold leading-[1.55]"
            : "text-base leading-[1.8]"
        } ${clamp ? (lg ? "line-clamp-[7]" : "line-clamp-5") : ""}`}
      >
        {review.content}
      </blockquote>

      {review.imageUrls.length > 0 && (
        <div className="mt-4 flex gap-2">
          {review.imageUrls.slice(0, 3).map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={url} alt="" className="h-16 w-16 rounded-[12px] object-cover" />
          ))}
        </div>
      )}

      <footer className="mt-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="font-kr text-sm font-semibold text-ink">{review.authorName}</p>
          <Link
            href={`/products/${review.productSlug}`}
            className="mt-0.5 block truncate font-kr text-caption text-ink-faint transition-colors duration-[var(--dur-base)] hover:text-clay-deep"
          >
            {review.productName}
          </Link>
        </div>
        <time className="shrink-0 font-numeric text-caption text-ink-faint">
          {formatDate(review.createdAt)}
        </time>
      </footer>
    </article>
  );
}
