"use client";

import { useOptimistic, useState, useTransition, type FormEvent } from "react";
import { setPreference } from "@/lib/workspace/actions";
import { authRequest } from "@/lib/auth-request";
import { Icon } from "./Icon";
import { useToast } from "./forms";

/** An accessible switch bound to a profile preference. */
export function PreferenceSwitch({ name, value, label, description, disabled }: {
  name: "lowDataMode" | "eventNews" | "portfolioPublic"; value: boolean; label: string; description: string; disabled?: boolean;
}) {
  const [optimistic, setOptimistic] = useOptimistic(value);
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <div className="ws-row-between" style={{ alignItems: "flex-start", gap: 20 }}>
      <div><p style={{ fontWeight: 600 }} id={"pref-" + name}>{label}</p><p className="ws-small ws-muted">{description}</p></div>
      <button
        type="button"
        role="switch"
        aria-checked={optimistic}
        aria-labelledby={"pref-" + name}
        disabled={disabled || pending}
        onClick={() => start(async () => {
          setOptimistic(!optimistic);
          const r = await setPreference(name, !optimistic);
          toast({ tone: r.ok ? "success" : "error", message: r.message });
        })}
        style={{
          flex: "none", width: 40, height: 24, borderRadius: 12, padding: 2, cursor: "pointer",
          background: optimistic ? "var(--ws-ink)" : "#d9d9d9", transition: "background-color 160ms", opacity: disabled ? .5 : 1,
        }}
      >
        <span style={{ display: "block", width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 2px rgb(0 0 0 / .2)", transform: optimistic ? "translateX(14.5px)" : "none", transition: "transform 160ms" }} />
      </button>
    </div>
  );
}

/** Uses Better Auth's change-password endpoint; other sessions are signed out. */
export function PasswordForm({ preview }: { preview: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const current = String(data.get("current") ?? "");
    const next = String(data.get("next") ?? "");
    if (next.length < 12 || next.length > 128) { setError("Use 12 to 128 characters. A few memorable words work well."); return; }
    if (next !== data.get("confirm")) { setError("The new passwords don’t match."); return; }
    setBusy(true); setError("");
    const failure = await authRequest("/api/auth/change-password", { currentPassword: current, newPassword: next, revokeOtherSessions: true });
    setBusy(false);
    if (!failure) { form.reset(); toast({ tone: "success", message: "Password updated. Other devices were signed out." }); return; }
    setError(failure.status === 400 || failure.status === 401 ? "Your current password isn’t right." : failure.status === 429 ? "Too many attempts. Wait a moment and try again." : "We couldn’t update your password. Try again.");
  }

  if (preview) return <p className="ws-feedback" data-tone="info"><Icon name="help" size={12.5} /><span>Password changes need a real account. Configure authentication in <code>.env.local</code> to enable them.</span></p>;

  return (
    <form className="ws-form" onSubmit={submit} noValidate>
      {[["current", "Current password", "current-password"], ["next", "New password", "new-password"], ["confirm", "Confirm new password", "new-password"]].map(([name, label, auto]) => (
        <div className="ws-field" key={name}>
          <label htmlFor={"pw-" + name}>{label}</label>
          <input id={"pw-" + name} name={name} type="password" autoComplete={auto} className="ws-input" maxLength={128} required />
        </div>
      ))}
      {error && <p className="ws-feedback" data-tone="error" role="alert"><Icon name="alert" size={12.5} /><span>{error}</span></p>}
      <div><button className="ws-btn ws-btn-primary" disabled={busy}>{busy && <span className="ws-spinner" aria-hidden />}Update password</button></div>
    </form>
  );
}
