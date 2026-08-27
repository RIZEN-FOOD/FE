import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 조건부 클래스를 합치고 충돌하는 Tailwind 유틸리티를 정리한다.
 * 예: cn("px-4", isLarge && "px-8") -> "px-8"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
