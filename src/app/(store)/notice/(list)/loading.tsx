import { Container } from "@/components/ui";
import { Skeleton } from "@/components/ui/Skeleton";

/** 공지 목록 로딩. 상단 배너 띠 + 줄 목록 배치를 비워 둔다. */
export default function NoticeLoading() {
  return (
    <div aria-busy="true" aria-label="공지사항을 불러오는 중">
      <div className="bg-clay-soft/30">
        <Container className="py-9 md:py-12">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-3 h-10 w-32" />
        </Container>
      </div>
      <Container className="py-14">
        <ul className="border-t border-line">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-4 border-b border-line py-5">
              <Skeleton className="h-6 w-12 rounded-[6px]" />
              <Skeleton className="h-4 flex-1 max-w-[60%]" />
              <Skeleton className="ml-auto h-3 w-20" />
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
