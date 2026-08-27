import { cn } from "@/lib/cn";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  /** 마우스를 올렸을 때 살짝 떠오르는 효과. 클릭 가능한 카드에만 켠다. */
  interactive?: boolean;
};

/**
 * 기본 카드. prototype.html 의 .card 를 옮긴 것.
 */
export function Card({ children, className, as: Tag = "div", interactive = false }: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-[3px] border border-line bg-paper px-7 py-[34px] transition duration-300",
        interactive &&
          "hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(90,60,40,0.09)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
