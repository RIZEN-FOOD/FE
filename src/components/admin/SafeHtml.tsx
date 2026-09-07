"use client";

import DOMPurify from "dompurify";
import { useEffect, useState } from "react";

/**
 * 저장 전 미리보기 등에서 리치 HTML 을 안전하게 렌더한다.
 *
 * ★ 왜 필요한가 (CLAUDE.md 규칙 6):
 *   에디터 본문(descriptionHtml 등)은 클라이언트가 만든 원본이고, 서버 살균은
 *   "저장 시"에만 일어난다. 저장 전 미리보기에 원본을 그대로 주입하면 붙여넣기 등으로
 *   섞여 들어온 마크업이 관리자 브라우저에서 실행될 수 있다(self-XSS).
 *   그래서 렌더 직전에 클라이언트에서도 한 번 더 살균한다.
 *
 * ★ DOMPurify 는 브라우저 DOM 이 필요하다. 서버 렌더(SSR)에서는 window 가 없어
 *   빈 문자열로 두고, 마운트된 뒤 클라이언트에서만 살균해 채운다.
 */
export function SafeHtml({ html, className }: { html: string; className?: string }) {
  const [clean, setClean] = useState("");

  useEffect(() => {
    setClean(DOMPurify.sanitize(html ?? ""));
  }, [html]);

  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
