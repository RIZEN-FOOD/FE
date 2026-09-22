"use client";

import { useCallback, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import { ImageUploader } from "@/components/admin/ImageUploader";

type AdminSetting = { key: string; value: string; description: string };

/**
 * 사이트 설정.
 *
 * ★ 사업자정보·통신판매신고번호는 전자상거래법상 게시 의무다 (CLAUDE.md §7).
 *   여기서 채운 값이 푸터와 정책 페이지에 그대로 반영된다.
 *
 * 비개발자(대표)가 쓰는 화면이라 전문용어를 피하고, 각 칸에 무엇을 넣는지
 * 설명을 붙인다 (CLAUDE.md 규칙 4). 키의 설명 문구는 서버가 함께 내려준다.
 */

// 키를 의미 단위로 묶는다. 여기 없는 키는 "기타"로 모인다.
const GROUPS: { title: string; note?: string; keys: string[] }[] = [
  {
    title: "사업자 정보",
    note: "전자상거래법상 사이트 하단에 반드시 표시해야 하는 정보입니다. 빈 칸은 사이트에 '확인 후 표기'로 나옵니다.",
    keys: [
      "company.name", "company.ceo", "company.biz_no", "company.mail_order_no",
      "company.address", "company.privacy_officer",
    ],
  },
  {
    title: "고객센터",
    keys: ["company.tel", "company.email", "company.hours"],
  },
  {
    title: "SNS 링크",
    note: "입력한 채널만 사이트 하단에 표시됩니다. 전체 주소(https://…)로 넣어주세요.",
    keys: ["sns.instagram", "sns.youtube", "sns.blog"],
  },
  {
    title: "주문·운영",
    keys: ["order.cutoff_time", "order.guest_enabled"],
  },
  {
    title: "배송·출고",
    note: "배송·교환·환불 안내 페이지에 표시됩니다. 배송비 금액은 왼쪽 '배송비' 메뉴에서 바꿉니다.",
    keys: [
      "shipping.carrier", "shipping.return_address", "shipping.tracking_url",
      "shipping.auto_complete_days", "shipping.island_zip_ranges",
    ],
  },
  {
    title: "메인 화면",
    note: "사진은 올리면 바로 반영됩니다. 올리지 않으면 지금 쓰는 기본 사진이 그대로 나옵니다.",
    keys: [
      "main.hero_images", "main.nutrition_image", "main.footer_image",
      "main.page_hero_reviews", "main.page_hero_notice",
      "main.section.review", "main.section.notice",
    ],
  },
  {
    title: "개인정보 수탁업체",
    note: "주문 정보를 맡기는 업체 이름입니다. 개인정보처리방침에 공개할 의무가 있습니다(개인정보보호법 제26조). 업체가 바뀌면 여기만 고치면 됩니다.",
    keys: [
      "privacy.processor_fulfillment", "privacy.processor_delivery", "privacy.processor_payment",
    ],
  },
  {
    title: "로그인 화면",
    note: "로그인·회원가입 화면 왼쪽(모바일에선 전체 배경)에 깔리는 사진입니다. 비우면 기본 사진이 나옵니다.",
    keys: ["auth.login_image", "auth.signup_image"],
  },
];

// 참/거짓으로 다루는 키 (토글로 보여준다)
const BOOLEAN_KEYS = new Set([
  "order.guest_enabled", "main.section.review", "main.section.notice",
]);
// 여러 줄 입력이 필요한 키
const TEXTAREA_KEYS = new Set(["shipping.island_zip_ranges"]);
// 사진 한 장을 올리는 칸
const IMAGE_KEYS = new Set([
  "main.nutrition_image", "main.footer_image", "auth.login_image", "auth.signup_image",
  "main.page_hero_reviews", "main.page_hero_notice",
]);
// 사진 여러 장을 올리는 칸 (순서대로 번갈아 보인다)
const IMAGE_LIST_KEYS = new Set(["main.hero_images"]);

// 어떤 형식으로 넣어야 하는지 애매한 칸에 붙이는 안내 문구 (CLAUDE.md 규칙 4).
const HINTS: Record<string, string> = {
  "main.hero_images":
    "메인 상단에 크게 도는 사진입니다. 여러 장 올리면 순서대로 번갈아 보입니다. 하나도 없으면 기본 사진이 나옵니다. 권장 가로형 1600x1200 이상.",
  "main.nutrition_image": "영양성분 띠의 배경 사진입니다. 가로로 넓은 사진(권장 1920x1080 이상)을 올려주세요.",
  "main.footer_image": "화면 맨 아래 배너에 들어가는 제품 사진입니다. 배경이 없는 누끼 사진이 잘 어울립니다.",
  "main.page_hero_reviews":
    "후기 페이지 맨 위 띠에 깔리는 사진입니다. 글자가 위에 얹히므로 가운데가 너무 복잡하지 않은 가로 사진(권장 1920x800 이상)이 좋습니다.",
  "main.page_hero_notice":
    "공지사항 페이지 맨 위 띠에 깔리는 사진입니다. 글자가 위에 얹히므로 가운데가 너무 복잡하지 않은 가로 사진(권장 1920x800 이상)이 좋습니다.",
  "order.cutoff_time": "24시간 형식으로 넣어주세요. 예: 14:00 (이 시각 이전 주문까지 당일 발송)",
  "sns.instagram": "전체 주소로 넣어주세요. 예: https://instagram.com/…",
  "sns.youtube": "전체 주소로 넣어주세요. 예: https://youtube.com/@…",
  "sns.blog": "전체 주소로 넣어주세요. 예: https://blog.naver.com/…",
  "privacy.processor_fulfillment": "상품을 보관하고 내보내는 업체입니다. 예: 와이에스컴퍼니",
  "privacy.processor_delivery": "상품을 배송하는 택배사입니다. 예: 롯데택배",
  "privacy.processor_payment": "결제를 대행하는 회사입니다. 계약 전이면 비워 두세요.",
  "shipping.tracking_url":
    "손님이 누르면 열리는 택배사 조회 주소입니다. 송장번호가 들어갈 자리에 {{송장번호}} 라고 적어 주세요. 비우면 조회 버튼이 나오지 않습니다.",
  "shipping.auto_complete_days":
    "숫자만 넣어주세요. 예: 3 (발송 후 3일이 지나면 자동으로 배송 완료). 0 으로 두면 자동으로 바뀌지 않고 직접 변경해야 합니다.",
  "company.biz_no": "숫자와 하이픈만. 예: 123-45-67890",
  "company.mail_order_no": "예: 2026-서울강남-01234",
  "shipping.carrier": "예: 롯데택배",
  "shipping.return_address": "반품 상품을 받을 주소입니다. 출고 대행사 창고라면 업체명도 함께 넣어주세요.",
  "shipping.island_zip_ranges":
    "도서산간 추가 배송비를 받을 우편번호입니다. 비워 두면 기본 목록(제주·울릉·옹진·신안·완도 등)을 씁니다. 택배사 목록이 다를 때만 쉼표로 나눠 넣고, 범위는 '-'로 이어주세요.",
  "auth.login_image":
    "로그인 화면 배경 사진입니다. 세로로 긴 화면이라 인물·피사체를 가운데에 두세요. 권장 세로형(예: 1067x1600 이상). 비우면 기본 사진이 나옵니다.",
  "auth.signup_image":
    "회원가입 화면 배경 사진입니다. 세로로 긴 화면이라 인물·피사체를 가운데에 두세요. 권장 세로형(예: 1067x1600 이상). 비우면 기본 사진이 나옵니다.",
};

const PLACEHOLDERS: Record<string, string> = {
  "shipping.island_zip_ranges": "63000-63644, 40200-40240, 54000",
};

export default function AdminSettingsPage() {
  const [items, setItems] = useState<AdminSetting[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<AdminSetting[]>("/api/admin/settings");
      setItems(res);
      setDraft(Object.fromEntries(res.map((s) => [s.key, s.value])));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2800);
  }

  const descOf = (key: string) => items.find((i) => i.key === key)?.description ?? "";
  const known = new Set(GROUPS.flatMap((g) => g.keys));
  const others = items.filter((i) => !known.has(i.key));

  async function save() {
    setSaving(true);
    try {
      await api.put("/api/admin/settings", { values: draft });
      flash("저장되었습니다.");
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="font-kr text-sm text-ink-faint">불러오는 중…</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-kr text-2xl font-bold text-ink">사이트 설정</h1>
          <p className="mt-1 font-kr text-sm text-ink-soft">
            여기서 바꾼 내용은 사이트 하단(푸터)과 정책 페이지에 바로 반영됩니다.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-[2px] bg-ink px-4 py-2.5 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-50"
        >
          {saving ? "저장 중…" : "저장하기"}
        </button>
      </div>

      {message && (
        <p className="mt-4 rounded-[3px] bg-clay-soft/40 px-3 py-2 font-kr text-sm text-clay-deep">
          {message}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-8">
        {GROUPS.map((group) => (
          <section key={group.title} className="rounded-[4px] border border-line bg-paper p-6">
            <h2 className="font-kr text-base font-bold text-ink">{group.title}</h2>
            {group.note && (
              <p className="mt-1 font-kr text-xs leading-relaxed text-ink-soft">{group.note}</p>
            )}
            <div className="mt-5 flex flex-col gap-5">
              {group.keys.map((key) => {
                const set = (v: string) => setDraft((d) => ({ ...d, [key]: v }));
                if (IMAGE_LIST_KEYS.has(key)) {
                  return (
                    <SettingImageList
                      key={key}
                      label={descOf(key) || key}
                      hint={HINTS[key]}
                      value={draft[key] ?? ""}
                      onChange={set}
                    />
                  );
                }
                if (IMAGE_KEYS.has(key)) {
                  return (
                    <SettingImage
                      key={key}
                      label={descOf(key) || key}
                      hint={HINTS[key]}
                      value={draft[key] ?? ""}
                      onChange={set}
                    />
                  );
                }
                return (
                  <SettingField
                    key={key}
                    label={descOf(key) || key}
                    hint={HINTS[key]}
                    placeholder={PLACEHOLDERS[key]}
                    value={draft[key] ?? ""}
                    onChange={set}
                    boolean={BOOLEAN_KEYS.has(key)}
                    textarea={TEXTAREA_KEYS.has(key)}
                  />
                );
              })}
            </div>
          </section>
        ))}

        {others.length > 0 && (
          <section className="rounded-[4px] border border-line bg-paper p-6">
            <h2 className="font-kr text-base font-bold text-ink">기타</h2>
            <div className="mt-5 flex flex-col gap-5">
              {others.map((s) => (
                <SettingField
                  key={s.key}
                  label={s.description || s.key}
                  value={draft[s.key] ?? ""}
                  onChange={(v) => setDraft((d) => ({ ...d, [s.key]: v }))}
                  boolean={BOOLEAN_KEYS.has(s.key)}
                  textarea={TEXTAREA_KEYS.has(s.key)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-[2px] bg-ink px-4 py-2.5 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-50"
        >
          {saving ? "저장 중…" : "저장하기"}
        </button>
      </div>
    </div>
  );
}

function SettingField({
  label,
  hint,
  placeholder,
  value,
  onChange,
  boolean: isBoolean,
  textarea,
}: {
  label: string;
  hint?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  boolean?: boolean;
  textarea?: boolean;
}) {
  if (isBoolean) {
    const on = value === "true";
    return (
      <label className="flex items-center justify-between gap-4">
        <span className="font-kr text-sm text-ink">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={() => onChange(on ? "false" : "true")}
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-ink" : "bg-line"}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper transition-all ${on ? "left-[22px]" : "left-0.5"}`}
          />
        </button>
      </label>
    );
  }

  return (
    <label className="block">
      <span className="block font-kr text-sm text-ink">{label}</span>
      {hint && <span className="mb-1 mt-0.5 block font-kr text-xs leading-relaxed text-ink-faint">{hint}</span>}
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="mt-1 w-full rounded-[3px] border border-line bg-cream-warm/40 px-3 py-2.5 font-kr text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-clay-deep"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1 h-[46px] w-full rounded-[3px] border border-line bg-cream-warm/40 px-3 font-kr text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-clay-deep"
        />
      )}
    </label>
  );
}

/** 사진 한 장 칸. 주소를 손으로 적는 대신 파일을 올린다. */
function SettingImage({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <ImageUploader
        label={label}
        hint=""
        previewUrl={value.trim() ? value : null}
        category="main"
        onChange={(_key, url) => onChange(url)}
        onClear={() => onChange("")}
      />
      {hint && <p className="mt-1.5 font-kr text-xs leading-relaxed text-ink-faint">{hint}</p>}
    </div>
  );
}

/** 사진 여러 장 칸. 올린 순서대로 화면에 나온다. */
function SettingImageList({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const urls = value.split(",").map((v) => v.trim()).filter(Boolean);
  const write = (next: string[]) => onChange(next.join(", "));

  return (
    <div>
      <span className="block font-kr text-sm font-medium text-ink">{label}</span>
      {hint && <p className="mt-0.5 font-kr text-xs leading-relaxed text-ink-faint">{hint}</p>}

      {urls.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-3">
          {urls.map((url, i) => (
            <li key={url + i} className="w-24">
              <div className="h-24 w-24 overflow-hidden rounded-[3px] border border-line bg-cream-warm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="font-kr text-xs text-ink-faint">{i + 1}번째</span>
                <button
                  type="button"
                  onClick={() => write(urls.filter((_, idx) => idx !== i))}
                  className="font-kr text-xs text-ink-faint transition hover:text-clay-deep"
                >
                  빼기
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3">
        <ImageUploader
          label="사진 추가"
          hint=""
          previewUrl={null}
          category="main"
          onChange={(_key, url) => write([...urls, url])}
        />
      </div>
    </div>
  );
}
