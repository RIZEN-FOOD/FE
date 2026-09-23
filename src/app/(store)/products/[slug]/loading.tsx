import { Container } from "@/components/ui";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

/**
 * 상품 상세 로딩. 갤러리(왼쪽) + 구매 패널(오른쪽) 배치를 그대로 비워 둔다.
 * 사진 자리를 먼저 잡아야 실제 사진이 오면서 아래 내용이 밀리지 않는다(CLS).
 */
export default function ProductDetailLoading() {
  return (
    <Container className="py-10 pb-32 md:py-14 md:pb-20" aria-busy="true" aria-label="상품을 불러오는 중">
      <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-start md:gap-14 lg:gap-20">
        <div>
          <Skeleton className="aspect-square w-full" />
          <div className="mt-3 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-16" />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-3 h-10 w-3/4" />
          <SkeletonText lines={2} className="mt-4 max-w-sm" />
          <Skeleton className="mt-8 h-11 w-40" />
          <div className="mt-6 border-t border-line pt-5">
            <SkeletonText lines={2} className="max-w-xs" />
          </div>
          <Skeleton className="mt-8 h-12 w-full" />
          <Skeleton className="mt-3 h-14 w-full" />
        </div>
      </div>
    </Container>
  );
}
