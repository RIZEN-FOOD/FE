import { Container } from "@/components/ui";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

/** 주문 상세 로딩. 제목 + 상품 줄 + 금액 요약 배치를 비워 둔다. */
export default function OrderDetailLoading() {
  return (
    <Container className="py-12 md:py-16" aria-busy="true" aria-label="주문을 불러오는 중">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="mt-2 h-4 w-56" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
        <div>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-t border-line py-4">
              <Skeleton className="h-14 w-14 rounded-[6px]" />
              <SkeletonText lines={2} className="max-w-xs flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
          <div className="mt-10 border-t border-line pt-6">
            <SkeletonText lines={3} className="max-w-md" />
          </div>
        </div>
        <div className="border-t border-line pt-6 lg:border-t-0 lg:pt-0">
          <SkeletonText lines={4} />
          <Skeleton className="mt-6 h-8 w-32" />
        </div>
      </div>
    </Container>
  );
}
