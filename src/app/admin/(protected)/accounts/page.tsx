"use client";

import { useCallback, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api/client";
import { formatDateTime } from "@/lib/datetime";
import type { AdminAccount, AdminMe } from "@/types/auth";

/**
 * 관리자 관리.
 *
 *  - 내 비밀번호 변경: 모든 관리자
 *  - 관리자 계정(추가·이름·권한·사용 여부·비밀번호 초기화): 최고관리자만
 *
 * ★ 비밀번호를 바꾸거나 계정을 중지하면 그 계정의 다른 기기 로그인은 모두 끊긴다(서버가 처리).
 * ★ 스스로를 잠그지 못하게 서버가 막는다 — 내 권한 내리기·내 계정 중지·마지막 최고관리자 변경.
 *   화면에서도 내 줄은 권한·사용 여부를 바꿀 수 없게 둔다.
 */

const ROLE_LABEL: Record<AdminAccount["role"], string> = {
  SUPER_ADMIN: "최고관리자",
  ADMIN: "관리자",
};

const inputClass =
  "h-[42px] w-full rounded-[3px] border border-line bg-cream-warm/40 px-3 font-kr text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-clay-deep";

const PASSWORD_HINT = "8자 이상, 영문과 숫자를 함께 써 주세요.";

function errorText(e: unknown, fallback: string) {
  return e instanceof ApiError ? e.message : fallback;
}

export default function AdminAccountsPage() {
  const [me, setMe] = useState<AdminMe | null>(null);

  useEffect(() => {
    api.get<AdminMe>("/api/admin/auth/me").then(setMe).catch(() => setMe(null));
  }, []);

  return (
    <div className="max-w-4xl">
      <h1 className="font-kr text-2xl font-bold text-ink">관리자 관리</h1>
      <p className="mt-1 font-kr text-sm text-ink-soft">
        내 비밀번호를 바꾸고, 함께 일하는 관리자 계정을 관리합니다.
      </p>

      <MyPasswordCard />

      {me?.role === "SUPER_ADMIN" ? (
        <AccountsSection myId={me.id ?? null} />
      ) : me ? (
        <p className="mt-8 rounded-[4px] border border-line bg-paper px-5 py-4 font-kr text-sm text-ink-soft">
          관리자 계정 추가·변경은 최고관리자만 할 수 있습니다.
        </p>
      ) : null}
    </div>
  );
}

/* ─────────────────────────── 내 비밀번호 ─────────────────────────── */

function MyPasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (next !== confirm) {
      setMessage({ ok: false, text: "새 비밀번호가 서로 다릅니다." });
      return;
    }
    setSaving(true);
    try {
      const res = await api.patch<{ message: string }>("/api/admin/auth/password", {
        currentPassword: current,
        newPassword: next,
      });
      setCurrent("");
      setNext("");
      setConfirm("");
      setMessage({ ok: true, text: res.message });
    } catch (err) {
      setMessage({ ok: false, text: errorText(err, "비밀번호를 바꾸지 못했습니다.") });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-8 rounded-[4px] border border-line bg-paper p-6">
      <h2 className="font-kr text-base font-bold text-ink">내 비밀번호 변경</h2>
      <p className="mt-1 font-kr text-xs text-ink-faint">
        바꾸면 이 화면은 그대로 쓰고, 다른 기기의 로그인은 모두 끊깁니다.
      </p>
      <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block font-kr text-xs text-ink-soft">현재 비밀번호</span>
          <input type="password" autoComplete="current-password" className={inputClass}
            value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1 block font-kr text-xs text-ink-soft">새 비밀번호</span>
          <input type="password" autoComplete="new-password" className={inputClass} placeholder={PASSWORD_HINT}
            value={next} onChange={(e) => setNext(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1 block font-kr text-xs text-ink-soft">새 비밀번호 확인</span>
          <input type="password" autoComplete="new-password" className={inputClass}
            value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </label>
        <div className="flex items-center justify-between gap-3 sm:col-span-3">
          {message ? (
            <p className={`font-kr text-sm ${message.ok ? "text-ink-soft" : "text-clay-deep"}`}>{message.text}</p>
          ) : (
            <span />
          )}
          <button type="submit" disabled={saving || !current || !next || !confirm}
            className="rounded-[2px] bg-ink px-4 py-2.5 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-50">
            {saving ? "바꾸는 중…" : "비밀번호 바꾸기"}
          </button>
        </div>
      </form>
    </section>
  );
}

/* ─────────────────────────── 관리자 계정 ─────────────────────────── */

function AccountsSection({ myId }: { myId: number | null }) {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAccounts(await api.get<AdminAccount[]>("/api/admin/accounts"));
    } catch (e) {
      setError(errorText(e, "계정 목록을 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="mt-8 rounded-[4px] border border-line bg-paper p-6">
      <h2 className="font-kr text-base font-bold text-ink">관리자 계정</h2>
      <p className="mt-1 font-kr text-xs leading-relaxed text-ink-faint">
        최고관리자는 모든 메뉴와 이 화면을 씁니다. 관리자는 이 화면(계정 관리)만 빼고 모두 씁니다.
        그만둔 직원은 삭제 대신 &lsquo;사용 중지&rsquo;로 두세요 — 누가 무엇을 했는지 기록이 남습니다.
      </p>

      {loading ? (
        <p className="mt-6 font-kr text-sm text-ink-faint">불러오는 중…</p>
      ) : error ? (
        <p className="mt-6 font-kr text-sm text-clay-deep">{error}</p>
      ) : (
        <ul className="mt-6 flex flex-col divide-y divide-line border-y border-line">
          {accounts.map((a) => (
            <AccountRow key={a.id} account={a} isMe={a.id === myId} onChanged={load} />
          ))}
        </ul>
      )}

      <NewAccountForm onCreated={load} />
    </section>
  );
}

function AccountRow({
  account,
  isMe,
  onChanged,
}: {
  account: AdminAccount;
  isMe: boolean;
  onChanged: () => void;
}) {
  const [displayName, setDisplayName] = useState(account.displayName);
  const [role, setRole] = useState(account.role);
  const [enabled, setEnabled] = useState(account.enabled);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const dirty =
    displayName !== account.displayName || role !== account.role || enabled !== account.enabled;

  async function save() {
    if (!enabled && account.enabled) {
      if (!window.confirm(`"${account.displayName}" 계정을 사용 중지합니다.\n그 계정은 바로 로그아웃됩니다. 계속할까요?`)) {
        return;
      }
    }
    setSaving(true);
    setMessage(null);
    try {
      await api.patch(`/api/admin/accounts/${account.id}`, { displayName, role, enabled });
      setMessage({ ok: true, text: "저장했습니다." });
      onChanged();
    } catch (e) {
      setMessage({ ok: false, text: errorText(e, "저장하지 못했습니다.") });
    } finally {
      setSaving(false);
    }
  }

  async function resetPassword() {
    if (newPassword !== newPasswordConfirm) {
      setMessage({ ok: false, text: "새 비밀번호가 서로 다릅니다." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put<{ message: string }>(`/api/admin/accounts/${account.id}/password`, {
        newPassword,
      });
      setResetOpen(false);
      setNewPassword("");
      setNewPasswordConfirm("");
      setMessage({ ok: true, text: res.message });
      onChanged();
    } catch (e) {
      setMessage({ ok: false, text: errorText(e, "비밀번호를 바꾸지 못했습니다.") });
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="py-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[120px]">
          <p className="font-numeric text-sm font-medium text-ink">
            {account.username}
            {isMe && <span className="ml-1.5 font-kr text-xs text-clay-deep">(나)</span>}
          </p>
          <p className="font-kr text-xs text-ink-faint">
            {account.locked && <span className="mr-1.5 text-clay-deep">잠김</span>}
            마지막 로그인 {account.lastLoginAt ? formatDateTime(account.lastLoginAt) : "없음"}
          </p>
        </div>

        <label className="block w-36">
          <span className="mb-1 block font-kr text-xs text-ink-soft">이름</span>
          <input className={inputClass} value={displayName} maxLength={30}
            onChange={(e) => setDisplayName(e.target.value)} />
        </label>

        <label className="block w-32">
          <span className="mb-1 block font-kr text-xs text-ink-soft">권한</span>
          <select className={inputClass} value={role} disabled={isMe}
            onChange={(e) => setRole(e.target.value as AdminAccount["role"])}>
            <option value="SUPER_ADMIN">{ROLE_LABEL.SUPER_ADMIN}</option>
            <option value="ADMIN">{ROLE_LABEL.ADMIN}</option>
          </select>
        </label>

        <button type="button" disabled={isMe} onClick={() => setEnabled((v) => !v)}
          className={`h-[42px] rounded-full border px-4 font-kr text-xs transition disabled:opacity-50 ${
            enabled ? "border-ink bg-ink text-cream-warm" : "border-line text-ink-faint hover:border-ink hover:text-ink"
          }`}>
          {enabled ? "사용 중" : "사용 중지"}
        </button>

        <button type="button" onClick={save} disabled={!dirty || saving}
          className="h-[42px] rounded-[2px] bg-ink px-4 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-40">
          저장
        </button>

        {!isMe && (
          <button type="button" onClick={() => setResetOpen((v) => !v)}
            className="h-[42px] font-kr text-xs text-ink-soft underline-offset-2 hover:underline">
            비밀번호 초기화
          </button>
        )}
      </div>

      {resetOpen && (
        <div className="mt-3 flex flex-wrap items-end gap-3 rounded-[3px] bg-cream-warm/60 p-3">
          <label className="block w-48">
            <span className="mb-1 block font-kr text-xs text-ink-soft">새 비밀번호</span>
            <input type="password" autoComplete="new-password" className={inputClass} placeholder={PASSWORD_HINT}
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </label>
          <label className="block w-48">
            <span className="mb-1 block font-kr text-xs text-ink-soft">새 비밀번호 확인</span>
            <input type="password" autoComplete="new-password" className={inputClass}
              value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} />
          </label>
          <button type="button" onClick={resetPassword} disabled={saving || !newPassword}
            className="h-[42px] rounded-[2px] border border-ink px-4 font-kr text-sm font-medium text-ink transition hover:bg-ink hover:text-cream-warm disabled:opacity-40">
            이 비밀번호로 바꾸기
          </button>
          <p className="w-full font-kr text-xs text-ink-faint">
            바꾼 비밀번호는 본인에게 직접 전하고, 로그인 후 &lsquo;내 비밀번호 변경&rsquo;에서 다시 바꾸게 하세요.
          </p>
        </div>
      )}

      {message && (
        <p className={`mt-2 font-kr text-xs ${message.ok ? "text-ink-soft" : "text-clay-deep"}`}>{message.text}</p>
      )}
    </li>
  );
}

function NewAccountForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminAccount["role"]>("ADMIN");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post("/api/admin/accounts", { username, displayName, password, role });
      setUsername("");
      setDisplayName("");
      setPassword("");
      setRole("ADMIN");
      setOpen(false);
      onCreated();
    } catch (err) {
      setError(errorText(err, "계정을 만들지 못했습니다."));
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="mt-5 rounded-[2px] border border-ink px-4 py-2.5 font-kr text-sm font-medium text-ink transition hover:bg-ink hover:text-cream-warm">
        관리자 추가
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-5 rounded-[3px] border border-line p-4">
      <p className="font-kr text-sm font-bold text-ink">새 관리자</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <label className="block">
          <span className="mb-1 block font-kr text-xs text-ink-soft">아이디</span>
          <input className={inputClass} value={username} placeholder="영문 소문자·숫자 4자 이상"
            autoComplete="off" onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1 block font-kr text-xs text-ink-soft">이름</span>
          <input className={inputClass} value={displayName} maxLength={30} placeholder="예: 김직원"
            onChange={(e) => setDisplayName(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1 block font-kr text-xs text-ink-soft">처음 비밀번호</span>
          <input type="password" className={inputClass} value={password} placeholder={PASSWORD_HINT}
            autoComplete="new-password" onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1 block font-kr text-xs text-ink-soft">권한</span>
          <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value as AdminAccount["role"])}>
            <option value="ADMIN">{ROLE_LABEL.ADMIN}</option>
            <option value="SUPER_ADMIN">{ROLE_LABEL.SUPER_ADMIN}</option>
          </select>
        </label>
      </div>
      {error && <p className="mt-3 font-kr text-xs text-clay-deep">{error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={() => setOpen(false)}
          className="rounded-[2px] px-4 py-2.5 font-kr text-sm text-ink-soft hover:text-ink">
          취소
        </button>
        <button type="submit" disabled={saving}
          className="rounded-[2px] bg-ink px-4 py-2.5 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-50">
          {saving ? "만드는 중…" : "계정 만들기"}
        </button>
      </div>
    </form>
  );
}
