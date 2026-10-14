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
      className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/60 md:items-center md:px-4 md:py-6"
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

  // ★ 팝업 틀이 이미지 비율에 맞춰진다 (2026-10-14). 전에는 틀 폭을 400px 로 고정하고 이미지를 그 안에
  //   맞춰 넣어서, 세로로 긴 이미지는 높이 제한(62svh)에 걸려 좁아지고 양옆에 검은 띠가 생겼다.
  //   PC: 이미지는 비율 그대로 «가로 400px · 세로 화면의 62%» 안에서 가장 크게 그려지고, 틀은 그 폭을 따른다.
  //   휴대폰: 아래에서 올라오는 시트라 화면 폭을 꽉 채우고, 높이는 비율대로(세로 화면의 70%까지).
  const img = imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={title}
      className="block h-auto max-h-[70svh] w-full object-contain md:mx-auto md:max-h-[62svh] md:w-auto md:max-w-[min(400px,calc(100vw-2rem))]"
    />
  ) : null;

  const linkProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  const linked = (children: React.ReactNode, className?: string) =>
    !href || preview ? (
      <div className={className}>{children}</div>
    ) : external ? (
      <a href={href} {...linkProps} className={className} onClick={close}>{children}</a>
    ) : (
      <Link href={href} className={className} onClick={close}>{children}</Link>
    );

  const hideTodayBox = (className: string) => (
    <label className={`cursor-pointer items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        checked={hideToday}
        onChange={(e) => setHideToday(e.target.checked)}
        className="h-5 w-5 rounded-[6px] accent-current"
      />
      <span className="font-kr text-sm font-medium">오늘 하루 보지 않기</span>
    </label>
  );

  return (
    <div className="w-full md:mx-auto md:w-fit md:max-w-full">
      {/* 휴대폰: 화면 아래에서 올라오는 시트(폭 꽉 채움). PC: 가운데 뜨는 카드 — 이미지 폭을 따르되,
          버튼이 너무 좁아지지 않게 최소 폭만 둔다(아주 가늘고 긴 이미지일 때만 양옆이 흰색으로 빈다). */}
      <div className="w-full animate-[rz-sheet-up_320ms_var(--ease-out)] overflow-hidden rounded-none bg-paper shadow-[0_-12px_40px_rgba(0,0,0,0.28)] md:min-w-[260px] md:animate-none md:shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
        <div className="bg-paper">{img && linked(img, "block")}</div>
        <div className="flex flex-col gap-2 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 md:pb-5">
          {showLinkButton && (href || preview) &&
            linked(
              "자세히 보기",
              "block rounded-[6px] bg-ink py-3 text-center font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep",
            )}
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="rounded-[6px] border border-ink py-3 font-kr text-sm font-medium text-ink transition hover:bg-cream"
          >
            닫기
          </button>
          {/* 휴대폰: 시트 안에 둔다 (시트 아래는 화면 끝이라 둘 자리가 없다) */}
          {showHideToday && hideTodayBox("mt-1 inline-flex self-center text-ink-soft md:hidden")}
        </div>
      </div>
      {/* PC: 카드 아래 어두운 배경 위에 */}
      {showHideToday && hideTodayBox("mt-3 hidden text-cream-warm md:inline-flex")}
    </div>
  );
}
