import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "dark" | "line";
type Size = "md" | "sm";

const base =
  "inline-block cursor-pointer rounded-[2px] border-none text-center font-kr font-bold transition duration-[250ms] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-deep " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  dark: "bg-ink text-cream-warm hover:bg-slate-deep hover:-translate-y-px",
  line: "border-[1.4px] border-ink bg-transparent text-ink hover:bg-ink hover:text-cream-warm",
};

const sizes: Record<Size, string> = {
  md: "px-[26px] py-3 text-[13.5px]",
  sm: "px-5 py-[9px] text-[12.5px]",
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

/**
 * 기본 버튼. prototype.html 의 .btn / .btn-dark / .btn-line / .btn-sm 을 옮긴 것.
 *
 * href 를 주면 링크로, 안 주면 button 으로 렌더한다.
 * 구매 버튼처럼 외부 채널로 나가는 경우가 많아 링크 형태를 1급으로 지원한다.
 */
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
