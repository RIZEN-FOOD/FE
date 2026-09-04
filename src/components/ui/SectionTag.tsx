import { cn } from "@/lib/cn";

type SectionTagProps = {
  children: React.ReactNode;
  className?: string;
  /** 다크 섹션(slate-deep 배경) 위에 올릴 때 밝은 색으로 바꾼다 */
  tone?: "default" | "onDark";
};

/**
 * 섹션 머리에 붙는 영문 소제목. 앞에 짧은 가로선이 붙는다.
 * prototype.html 의 .tag 를 옮긴 것.
 *
 * 장식 요소라 스크린리더에는 읽히되 가로선은 읽히지 않도록 ::before 로 그린다.
 */
export function SectionTag({ children, className, tone = "default" }: SectionTagProps) {
  return (
    <p
      className={cn(
        "mb-4 flex items-center font-en text-[11px] font-medium uppercase tracking-[0.22em]",
        "before:mr-2.5 before:h-px before:w-6 before:bg-current before:content-['']",
        tone === "onDark" ? "text-clay-soft" : "text-clay-deep",
        className,
      )}
    >
      {children}
    </p>
  );
}
