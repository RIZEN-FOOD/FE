"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { safeUrl } from "@/lib/safeUrl";
import type { PopupPublic } from "@/types/popup";

/**
 * 메인 화면 팝업.
 *
 * 관리자가 등록한 팝업을 순서대로 하나씩 띄운다. 닫으면 다음 팝업이 뜬다.
 * "오늘 하루 보지 않기"를 체크하고 닫으면 오늘(한국 시간) 동안 그 팝업을 다시 띄우지 않는다.
 * 팝업 내용을 고치면(version 이 바뀌면) 같은 날이라도 다시 보여 준다.
 *
 * ★ 기억은 이 브라우저의 localStorage 에만 둔다. 막혀 있으면(사생활 보호 모드 등) 매번 뜰 뿐 오류는 없다.
 * ★ 서버에서 그린 화면과 어긋나지 않게, 브라우저에서 확인한 뒤에만 띄운다.
 */
const STORAGE_PREFIX = "rizen_popup_hide:";

function todayKst(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

function hiddenToday(p: PopupPublic): boolean {
  try {
    return window.localStorage.getItem(`${STORAGE_PREFIX}${p.id}:${p.version}`) === todayKst();
  } catch {
    return false;
  }
}

function hideForToday(p: PopupPublic) {
  try {
    // 지난 기록은 정리한다 (다른 날짜·예전 버전)
    const today = todayKst();
    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const k = window.localStorage.key(i);
      if (k?.startsWith(STORAGE_PREFIX) && window.localStorage.getItem(k) !== today) {
        window.localStorage.removeItem(k);
      }
    }
    window.localStorage.setItem(`${STORAGE_PREFIX}${p.id}:${p.version}`, today);
  } catch {
    // 저장이 막힌 브라우저 — 이번만 닫힌다
  }
}

export function MainPopup({ popups }: { popups: PopupPublic[] }) {
  const [queue, setQueue] = useState<PopupPublic[] | null>(null);

  useEffect(() => {
    setQueue(popups.filter((p) => p.imageUrl && !hiddenToday(p)));
  }, [popups]);

  const current = queue?.[0] ?? null;

  // 떠 있는 동안 뒤 페이지가 스크롤되지 않게
  useEffect(() => {
    if (!current) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQueue((q) => (q ? q.slice(1) : q));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [current]);

  if (!current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/60 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={current.title}
      onClick={(e) => {
        if (e.target === e.currentTarget) setQueue((q) => (q ? q.slice(1) : q));
      }}
    >
      <PopupCard
        key={current.id}
        title={current.title}
        imageUrl={current.imageUrl}
        showHideToday={current.showHideToday}
        showLinkButton={current.showLinkButton}
        linkUrl={current.linkUrl}
        onClose={() => setQueue((q) => (q ? q.slice(1) : q))}
        onHideToday={() => hideForToday(current)}
        autoFocus
      />
    </div>,
    document.body,
  );
}

/** 팝업 한 장의 모양. 관리자 미리보기에서도 그대로 쓴다. */
export function PopupCard({
  title,
  imageUrl,
  showHideToday,
  showLinkButton,
  linkUrl,
  onClose,
  onHideToday,
  autoFocus = false,
  preview = false,
}: {
  title: string;
  imageUrl: string | null;
  showHideToday: boolean;
  showLinkButton: boolean;
  linkUrl: string | null;
  onClose: () => void;
  onHideToday: () => void;
  autoFocus?: boolean;
  /** 관리자 미리보기 — 모양만 보이고 눌러도 이동하지 않는다 */
  preview?: boolean;
}) {
  const [hideToday, setHideToday] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const href = safeUrl(linkUrl);
  const external = href ? /^https?:\/\//i.test(href) : false;

  useEffect(() => {
    if (autoFocus) closeRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  function close() {
    if (hideToday) onHideToday();
    onClose();
  }

  // eslint-disable-next-line @next/next/no-img-element
  const img = imageUrl ? <img src={imageUrl} alt={title} className="block max-h-[62svh] w-full object-contain" /> : null;

  const linkProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  const linked = (children: React.ReactNode, className?: string) =>
    !href || preview ? (
      <div className={className}>{children}</div>
    ) : external ? (
      <a href={href} {...linkProps} className={className} onClick={close}>{children}</a>
    ) : (
      <Link href={href} className={className} onClick={close}>{children}</Link>
    );

  return (
    <div className="mx-auto w-full max-w-[400px]">
      <div className="overflow-hidden rounded-[4px] bg-paper shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
        <div className="bg-ink">{img && linked(img, "block")}</div>
        <div className="flex flex-col gap-2 px-6 py-5">
          {showLinkButton && (href || preview) &&
            linked(
              "자세히 보기",
              "block rounded-[3px] bg-ink py-3 text-center font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep",
            )}
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="rounded-[3px] border border-ink py-3 font-kr text-sm font-medium text-ink transition hover:bg-cream"
          >
            닫기
          </button>
        </div>
      </div>
      {showHideToday && (
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-cream-warm">
          <input
            type="checkbox"
            checked={hideToday}
            onChange={(e) => setHideToday(e.target.checked)}
            className="h-5 w-5 rounded-[3px] accent-cream-warm"
          />
          <span className="font-kr text-sm font-medium">오늘 하루 보지 않기</span>
        </label>
      )}
    </div>
  );
}
