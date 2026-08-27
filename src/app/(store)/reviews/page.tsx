import type { Metadata } from "next";
import { Container, SectionTag } from "@/components/ui";

export const metadata: Metadata = {
  title: "후기",
  description: "크림오브라이스를 드셔본 분들의 후기.",
};

/**
 * 후기 모아보기.
 *
 * ⚠️ 후기 API 는 Phase 5(회원·후기·문의)에서 만든다. 지금은 화면 틀만 둔다.
 *   후기가 생기면 이 자리에 별점 분포 + 포토 후기 + 목록을 렌더한다.
 *
 * ★ 후기도 광고 규제 대상이다 (기획서 §9).
 *   "이거 먹고 살 빠졌어요" 같은 효능 단정은 노출 전 관리자가 검토·편집한다.
 *   체험단·협찬 후기는 광고 표시가 필수다. (백엔드 review.is_sponsored / visible 로 관리)
 */
export default function ReviewsPage() {
  return (
    <Container as="main" className="py-14">
      <SectionTag>Reviews</SectionTag>
      <h1 className="font-kr text-3xl font-bold tracking-tight text-ink">후기</h1>
      <p className="mt-2 font-kr text-sm text-ink-soft">
        크림오브라이스를 드셔본 분들의 이야기입니다.
      </p>

      <div className="mt-12 rounded-[4px] border border-dashed border-line px-6 py-20 text-center">
        <p className="font-kr text-sm text-ink-soft">첫 후기를 기다리고 있습니다.</p>
        <p className="mt-1 font-kr text-xs text-ink-faint">
          로그인 후 상품 페이지에서 후기를 남길 수 있습니다.
        </p>
      </div>
    </Container>
  );
}
