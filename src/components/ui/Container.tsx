import { cn } from "@/lib/cn";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  /** section, header 등으로 바꿔 쓸 때 사용 */
  as?: React.ElementType;
};

/**
 * 본문 기준 폭 컨테이너.
 * prototype.html 의 .wrap (max-width:1180px; padding:0 28px) 을 옮긴 것.
 */
export function Container({ children, className, as: Tag = "div" }: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full max-w-wrap px-7", className)}>
      {children}
    </Tag>
  );
}
