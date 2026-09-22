import Link from "next/link";
import { Container, Reveal, SectionTag } from "@/components/ui";
import { ReviewCard } from "@/components/store/ReviewCard";
import type { ReviewItem } from "@/types/member";

/**
 * 메인의 후기 미리보기. 최신 3건.
 *
 * ★ 관리자가 승인한 후기만 API 가 내려준다 (기획서 §9).
 *   협찬 후기는 광고 표시가 법적 의무라 배지를 붙인다.
 *
 * 레이아웃 (2026-09-22 재구성)
 *   같은 크기 카드 세 장을 나란히 두면 어느 것도 먼저 읽히지 않는다.
 *   첫 후기를 크게(2칸) 두고 나머지 둘을 오른쪽에 쌓아, 하나는 읽고 둘은 훑게 한다.
 *   후기가 하나뿐이면 그것만 넓게, 둘이면 반반이다.
 *
 * 후기가 없으면 섹션을 그리지 않는다 — 빈 껍데기를 보여주지 않는다.
 */
export function ReviewPreview({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) return null;
  const [first, ...rest] = reviews;

  return (
    <section className="bg-clay-soft/45 py-24 md:py-32" aria-labelledby="review-preview-heading">
      <Container>
        <Reveal>
          <SectionTag>Reviews</SectionTag>
          <div className="flex items-end justify-between gap-6">
            <h2 id="review-preview-heading" className="font-display text-section font-semibold text-ink">
              먼저 경험한 분들의 이야기
            </h2>
            <Link
              href="/reviews"
              className="shrink-0 font-kr text-small font-medium text-ink underline-offset-4 hover:underline"
            >
              전체 보기
            </Link>
          </div>
        </Reveal>

        <div className={`mt-12 grid gap-5 ${rest.length === 0 ? "" : rest.length === 1 ? "md:grid-cols-2" : "md:grid-cols-3 md:grid-rows-2"}`}>
          <Reveal className={rest.length >= 2 ? "md:col-span-2 md:row-span-2" : ""}>
            <ReviewCard review={first} size="lg" />
          </Reveal>
          {rest.slice(0, 2).map((r, i) => (
            <Reveal key={r.id} delay={100 + i * 80}>
              <ReviewCard review={r} clamp />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
