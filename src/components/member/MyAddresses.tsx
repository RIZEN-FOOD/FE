"use client";

import { useCallback, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import { PostcodeButton } from "@/components/checkout/PostcodeButton";
import type { MemberAddress, MemberAddressSaveRequest } from "@/types/member";

/**
 * 마이페이지 — 배송지 주소록.
 *
 * 저장된 배송지를 보고, 추가·수정·삭제하고 기본 배송지를 정한다.
 * 우편번호는 주소 검색(PostcodeButton)으로 채운다.
 */
type FormState = {
  id: number | null; // null 이면 신규
  label: string;
  receiverName: string;
  receiverPhone: string;
  zipcode: string;
  addr1: string;
  addr2: string;
  makeDefault: boolean;
};

const EMPTY: FormState = {
  id: null,
  label: "",
  receiverName: "",
  receiverPhone: "",
  zipcode: "",
  addr1: "",
  addr2: "",
  makeDefault: false,
};

export function MyAddresses() {
  const [items, setItems] = useState<MemberAddress[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null); // null 이면 폼 닫힘
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems(await api.get<MemberAddress[]>("/api/member/addresses"));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "배송지를 불러오지 못했습니다.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openNew() {
    setFormError(null);
    setForm({ ...EMPTY });
  }

  function openEdit(a: MemberAddress) {
    setFormError(null);
    setForm({
      id: a.id,
      label: a.label ?? "",
      receiverName: a.receiverName,
      receiverPhone: a.receiverPhone ?? "",
      zipcode: a.zipcode,
      addr1: a.addr1,
      addr2: a.addr2 ?? "",
      makeDefault: a.isDefault,
    });
  }

  async function submit() {
    if (!form) return;
    setFormError(null);
    if (!form.receiverName.trim()) return setFormError("받는 분을 입력해 주세요.");
    if (!form.zipcode || !form.addr1) return setFormError("주소 검색으로 주소를 채워 주세요.");

    const body: MemberAddressSaveRequest = {
      label: form.label.trim() || undefined,
      receiverName: form.receiverName.trim(),
      receiverPhone: form.receiverPhone.trim() || undefined,
      zipcode: form.zipcode,
      addr1: form.addr1,
      addr2: form.addr2.trim() || undefined,
      makeDefault: form.makeDefault,
    };

    setSaving(true);
    try {
      if (form.id == null) {
        await api.post("/api/member/addresses", body);
      } else {
        await api.put(`/api/member/addresses/${form.id}`, body);
      }
      setForm(null);
      await load();
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("이 배송지를 삭제할까요?")) return;
    try {
      await api.delete(`/api/member/addresses/${id}`);
      await load();
    } catch (e) {
      window.alert(e instanceof ApiError ? e.message : "삭제에 실패했습니다.");
    }
  }

  async function makeDefault(id: number) {
    try {
      await api.patch(`/api/member/addresses/${id}/default`);
      await load();
    } catch (e) {
      window.alert(e instanceof ApiError ? e.message : "설정에 실패했습니다.");
    }
  }

  if (error) return <p className="font-kr text-sm text-clay-deep">{error}</p>;
  if (!items) return <p className="font-kr text-sm text-ink-faint">불러오는 중…</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-kr text-sm text-ink-soft">배송지 {items.length}/10</p>
        {!form && items.length < 10 && (
          <button
            type="button"
            onClick={openNew}
            className="rounded-[6px] bg-ink px-4 py-2 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep"
          >
            + 배송지 추가
          </button>
        )}
      </div>

      {/* 입력 폼 */}
      {form && (
        <div className="mt-4 rounded-[12px] border border-line bg-paper p-5">
          <h3 className="font-kr text-sm font-bold text-ink">
            {form.id == null ? "새 배송지" : "배송지 수정"}
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="배송지 이름 (선택)" value={form.label}
              onChange={(v) => setForm({ ...form, label: v })} placeholder="예: 집, 회사" />
            <FormField label="받는 분" value={form.receiverName}
              onChange={(v) => setForm({ ...form, receiverName: v })} required />
            <FormField label="받는 분 연락처 (선택)" value={form.receiverPhone}
              onChange={(v) => setForm({ ...form, receiverPhone: v })} placeholder="010-1234-5678" />
            <div className="sm:col-span-2">
              <span className="mb-1 block font-kr text-caption font-medium text-ink-soft">
                우편번호 <span className="text-clay-deep">*</span>
              </span>
              <div className="flex gap-2">
                <input value={form.zipcode} readOnly placeholder="주소 검색"
                  className="h-[46px] w-32 rounded-[6px] border border-line bg-cream-warm/50 px-3 font-kr text-sm text-ink outline-none placeholder:text-ink-faint" />
                <PostcodeButton
                  onComplete={({ zonecode, address }) => setForm({ ...form, zipcode: zonecode, addr1: address })}
                  className="h-[46px] shrink-0 rounded-[6px] bg-ink px-4 font-kr text-sm font-medium text-cream-warm transition hover:bg-slate-deep disabled:opacity-50"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <FormField label="주소" value={form.addr1} onChange={() => {}} readOnly
                placeholder="주소 검색으로 자동 입력" required />
            </div>
            <div className="sm:col-span-2">
              <FormField label="상세 주소 (선택)" value={form.addr2}
                onChange={(v) => setForm({ ...form, addr2: v })} placeholder="동·호수 등" />
            </div>
          </div>

          <label className="mt-4 flex items-center gap-2">
            <input type="checkbox" checked={form.makeDefault}
              onChange={(e) => setForm({ ...form, makeDefault: e.target.checked })}
              className="h-4 w-4 accent-ink" />
            <span className="font-kr text-sm text-ink">기본 배송지로 설정</span>
          </label>

          {formError && <p className="mt-3 font-kr text-caption text-clay-deep">{formError}</p>}

          <div className="mt-5 flex gap-2">
            <button type="button" onClick={submit} disabled={saving}
              className="rounded-[6px] bg-ink px-5 py-2 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-50">
              {saving ? "저장 중…" : "저장"}
            </button>
            <button type="button" onClick={() => setForm(null)}
              className="rounded-[6px] border border-line px-5 py-2 font-kr text-sm text-ink transition hover:bg-clay-soft/40">
              취소
            </button>
          </div>
        </div>
      )}

      {/* 목록 */}
      {items.length === 0 && !form ? (
        <div className="mt-4 rounded-[12px] border border-dashed border-line px-6 py-16 text-center">
          <p className="font-kr text-sm text-ink-soft">저장된 배송지가 없습니다.</p>
          <button type="button" onClick={openNew}
            className="mt-3 font-kr text-sm font-medium text-clay-deep underline underline-offset-4">
            배송지 추가하기
          </button>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((a) => (
            <li key={a.id} className="rounded-[12px] border border-line bg-paper p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {a.isDefault && (
                      <span className="rounded-full bg-ink px-2 py-0.5 font-kr text-caption font-medium text-cream-warm">
                        기본
                      </span>
                    )}
                    {a.label && <span className="font-kr text-sm font-bold text-ink">{a.label}</span>}
                    <span className="font-kr text-sm text-ink">{a.receiverName}</span>
                  </div>
                  {a.receiverPhone && (
                    <p className="mt-1 font-kr text-sm text-ink-soft">{a.receiverPhone}</p>
                  )}
                  <p className="mt-1 font-kr text-sm text-ink-soft">
                    ({a.zipcode}) {a.addr1} {a.addr2 ?? ""}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-3 border-t border-line pt-3">
                {!a.isDefault && (
                  <button type="button" onClick={() => makeDefault(a.id)}
                    className="font-kr text-caption text-ink-soft transition hover:text-ink">
                    기본으로
                  </button>
                )}
                <button type="button" onClick={() => openEdit(a)}
                  className="font-kr text-caption text-ink-soft transition hover:text-ink">
                  수정
                </button>
                <button type="button" onClick={() => remove(a.id)}
                  className="font-kr text-caption text-ink-faint transition hover:text-clay-deep">
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  required,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="mb-1 block font-kr text-caption font-medium text-ink-soft">
        {label} {required && <span className="text-clay-deep">*</span>}
      </span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[46px] w-full rounded-[6px] border border-line bg-paper px-3 font-kr text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-clay-deep read-only:bg-cream-warm/50"
      />
    </label>
  );
}
