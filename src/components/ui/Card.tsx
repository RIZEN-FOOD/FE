import { cn } from "@/lib/cn";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  /** 마우스를 올렸을 때 살짝 떠오르는 효과. 클릭 가능한 카드에만 켠다. */
  interactive?: boolean;
  /**
   * 바탕 톤. 같은 화면에서 카드가 여럿이면 하나쯤은 tint 로 두어
   * 흰 상자 나열처럼 보이지 않게 한다.
   */
  tone?: "paper" | "tint" | "ink";
};

const tones = {
  paper: "border-line bg-paper",
  tint: "border-clay-soft/50 bg-clay-soft/25",
  ink: "border-transparent bg-ink text-cream-warm",
};

/**
 * 기본 카드. prototype.html 의 .card 를 옮긴 것.
 *
 * 2026-09-22 정리
 *   - 모서리 12px (담는 것). 버튼의 6px 와 구분한다.
 *   - 그림자는 따뜻한 잉크색을 띤 확산광만. 테두리는 hairline(rgba 10%).
 *   - 카드는 "떠 있어야 할 이유"가 있을 때만 쓴다. 단순 구분은 여백이나 border-t 로 한다.
 */
export function Card({ children, className, as: Tag = "div", interactive = false, tone = "paper" }: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-[12px] border px-7 py-8 transition-[transform,box-shadow,border-color] duration-[var(--dur-base)] ease-[var(--ease-out)]",
        tones[tone],
        interactive &&
          "hover:-translate-y-1 hover:border-clay-soft hover:shadow-[0_24px_48px_-20px_rgba(90,60,40,0.25)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
