import { Container } from "@/components/ui";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

/**
 * 상품 목록 로딩. 실제 화면(제목 + 2/3열 사진 격자)과 같은 배치로 자리를 잡아 둔다.
 * 헤더·푸터는 (store) 레이아웃이 그대로 그리고, 이 안쪽만 잠깐 대신 나온다.
 */
export default function ProductsLoading() {
  return (
    <Container className="py-14" aria-busy="true" aria-label="상품을 불러오는 중">
      <Skeleton className="h-9 w-24" />
      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i}>
            <Skeleton className="aspect-square w-full" />
            <SkeletonText lines={2} className="mt-3.5 max-w-[80%]" />
          </li>
        ))}
      </ul>
    </Container>
  );
}
