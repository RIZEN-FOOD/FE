"use client";

import { useEffect, useRef } from "react";

/**
 * 간단한 리치 텍스트 에디터.
 *
 * 상세 설명을 위한 최소 서식(제목·굵게·목록·링크)만 제공한다.
 * 무거운 에디터 라이브러리를 넣지 않는다 — 첫 로딩과 번들을 가볍게 유지한다.
 *
 * ★ 여기서 만든 HTML 은 저장 시 서버가 다시 살균한다 (BE HtmlSanitizer).
 *   클라이언트 살균은 편의일 뿐, 신뢰 경계가 아니다.
 *   그래서 이 에디터가 허용 밖의 태그를 만들어도 최종 저장본은 안전하다.
 *
 * contentEditable 은 제어 컴포넌트로 만들기 까다롭다.
 * 그래서 초기값만 심고, 이후에는 편집 결과를 onChange 로만 흘려보낸다.
 */
export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);

  // 최초 1회만 초기 HTML 을 심는다. 이후 리렌더가 커서를 망치지 않게 한다.
  useEffect(() => {
    if (ref.current && !seeded.current) {
      ref.current.innerHTML = value || "";
      seeded.current = true;
    }
  }, [value]);

  function exec(command: string, arg?: string) {
    // execCommand 는 구식이지만 이 정도 서식에는 브라우저 지원이 넓고 충분하다.
    document.execCommand(command, false, arg);
    emit();
  }

  function emit() {
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function addLink() {
    const url = window.prompt("링크 주소를 입력하세요 (http:// 또는 https://)");
    if (!url) return;
    if (!/^https?:\/\//.test(url)) {
      window.alert("http:// 또는 https:// 로 시작하는 주소만 넣을 수 있습니다.");
      return;
    }
    exec("createLink", url);
  }

  const btn =
    "rounded-[2px] border border-line px-2.5 py-1 font-kr text-xs text-ink transition hover:bg-clay-soft/40";

  return (
    <div className="rounded-[3px] border border-line bg-paper">
      <div className="flex flex-wrap gap-1 border-b border-line px-2 py-1.5">
        <button type="button" className={btn} onClick={() => exec("formatBlock", "<h3>")}>제목</button>
        <button type="button" className={btn} onClick={() => exec("bold")}><strong>굵게</strong></button>
        <button type="button" className={btn} onClick={() => exec("insertUnorderedList")}>목록</button>
        <button type="button" className={btn} onClick={addLink}>링크</button>
        <button type="button" className={btn} onClick={() => exec("removeFormat")}>서식 지우기</button>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        role="textbox"
        aria-multiline="true"
        aria-label="상세 설명"
        className="min-h-[180px] px-3 py-3 font-kr text-sm leading-relaxed text-ink outline-none [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5"
      />

      <p className="border-t border-line px-3 py-2 font-kr text-xs text-ink-faint">
        저장할 때 안전을 위해 허용된 서식만 남습니다.
      </p>
    </div>
  );
}
