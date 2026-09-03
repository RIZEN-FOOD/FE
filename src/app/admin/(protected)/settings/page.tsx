"use client";

import { useCallback, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api/client";

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
    title: "메인 화면",
    keys: ["main.hero_images", "main.section.review", "main.section.notice"],
  },
];

// 참/거짓으로 다루는 키 (토글로 보여준다)
const BOOLEAN_KEYS = new Set([
  "order.guest_enabled", "main.section.review", "main.section.notice",
]);
// 여러 줄 입력이 필요한 키
const TEXTAREA_KEYS = new Set(["main.hero_images"]);

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
              {group.keys.map((key) => (
                <SettingField
                  key={key}
                  label={descOf(key) || key}
                  value={draft[key] ?? ""}
                  onChange={(v) => setDraft((d) => ({ ...d, [key]: v }))}
                  boolean={BOOLEAN_KEYS.has(key)}
                  textarea={TEXTAREA_KEYS.has(key)}
                />
              ))}
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
  value,
  onChange,
  boolean: isBoolean,
  textarea,
}: {
  label: string;
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
      <span className="mb-1 block font-kr text-sm text-ink">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-[3px] border border-line bg-cream-warm/40 px-3 py-2.5 font-kr text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-clay-deep"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-[46px] w-full rounded-[3px] border border-line bg-cream-warm/40 px-3 font-kr text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-clay-deep"
        />
      )}
    </label>
  );
}
