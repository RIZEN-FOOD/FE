import { Container } from "@/components/ui";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

/** 후기 목록 로딩. 상단 배너 띠 + 두 단 인용문 배치를 비워 둔다. */
export default function ReviewsLoading() {
  return (
    <div aria-busy="true" aria-label="후기를 불러오는 중">
      <div className="bg-clay-soft/30">
        <Container className="py-9 md:py-12">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-3 h-10 w-24" />
        </Container>
      </div>
      <Container className="py-14">
        <ul className="mt-10 grid sm:grid-cols-2 sm:gap-x-14 lg:gap-x-20">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="border-t border-line py-8 md:py-10">
              <Skeleton className="h-3.5 w-20" />
              <SkeletonText lines={4} className="mt-4" />
              <div className="mt-5 flex items-end justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
