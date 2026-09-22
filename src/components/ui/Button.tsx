import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "dark" | "line" | "soft";
type Size = "lg" | "md" | "sm";

/**
 * 기본 버튼. prototype.html 의 .btn / .btn-dark / .btn-line 을 옮긴 것.
 *
 * 2026-09-22 정리
 *   - 모서리는 6px 고정(CI v1). 배지처럼 둥근 알약은 버튼이 아니다.
 *   - 글자는 한글 기준 15~16px. 14px 아래로 내려가지 않는다.
 *   - 누르면 살짝 가라앉는다(active:translate-y). 호버는 떠오른다. 둘 다 transform 만 쓴다.
 *   - 그림자는 배경(따뜻한 잉크색)을 띤 부드러운 확산광. 검은 drop shadow 를 쓰지 않는다.
 *   - 글자가 두 줄로 꺾이지 않는다(whitespace-nowrap). 꺾이면 라벨을 줄이거나 버튼을 넓힌다.
 *
 * href 를 주면 링크로, 안 주면 button 으로 렌더한다.
 */
const base =
  "inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-[6px] border-none text-center font-kr font-bold " +
  "transition-[transform,background-color,color,box-shadow,border-color] duration-[var(--dur-base)] ease-[var(--ease-out)] " +
  "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-deep " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100";

const variants: Record<Variant, string> = {
  dark: "bg-ink text-cream-warm shadow-[0_10px_24px_-8px_rgba(34,30,28,0.35)] hover:bg-slate-deep hover:shadow-[0_14px_30px_-8px_rgba(34,30,28,0.4)]",
  line: "border-[1.5px] border-ink/70 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-cream-warm",
  /** 세 번째 순위. 강조 없이 조용히 놓이는 동작(취소·돌아가기). */
  soft: "bg-ink/[0.06] text-ink hover:bg-ink/10",
};

const sizes: Record<Size, string> = {
  lg: "min-h-14 px-8 py-4 text-base",
  md: "min-h-12 px-6 py-3 text-base",
  sm: "min-h-10 px-4 py-2 text-small",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    /** 값이 있으면 <a>(Next Link)로 렌더한다 */
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const {
    variant = "dark",
    size = "md",
    className,
    children,
    href,
    ...rest
  } = props as CommonProps & { href?: string } & Record<string, unknown>;

  const classes = cn(base, variants[variant], sizes[size], className);

  if (href === undefined) {
    return (
      <button type="button" className={classes} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
        {children}
      </button>
    );
  }

  // 외부 채널로 새 창을 열 때 rel 을 붙여 원본 탭 탈취(reverse tabnabbing)를 막는다.
  if (/^https?:\/\//.test(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
      {children}
    </Link>
  );
}
