import Link from "next/link";
import { Container, SectionTag } from "@/components/ui";
import { ReviewCard } from "@/components/store/ReviewCard";
import type { ReviewItem } from "@/types/member";

/**
 * 메인의 후기 미리보기. 최신 3건.
 *
 * ★ 관리자가 승인한 후기만 API 가 내려준다 (기획서 §9).
 *   협찬 후기는 광고 표시가 법적 의무라 배지를 붙인다.
 *
 * 후기가 없으면 섹션을 그리지 않는다 — 빈 껍데기를 보여주지 않는다.
 */
export function ReviewPreview({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="bg-cream py-24 md:py-28" aria-labelledby="review-preview-heading">
      <Container>
        <SectionTag>Reviews</SectionTag>
        <div className="flex items-end justify-between">
          <h2
            id="review-preview-heading"
            className="font-display text-[2rem] font-semibold tracking-[-0.01em] text-ink md:text-[30px]"
          >
            먼저 경험한 분들의 이야기
          </h2>
          <Link
            href="/reviews"
            className="shrink-0 font-kr text-sm text-ink-soft underline-offset-4 hover:underline"
          >
            전체 보기
          </Link>
        </div>

        <ul className="mt-10 grid items-stretch gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <li key={r.id}>
              <ReviewCard review={r} clamp />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
