"use client";

import { useState, useTransition } from "react";
import { assignRoles } from "@/lib/workspace/actions";
import { TEAM_ROLES } from "@/lib/workspace/rules";
import { Dialog, useToast } from "./forms";
import { Icon } from "./Icon";

/** FR-72: one or two roles per member from the list, or a custom role. */
export function RoleEditor({ userId, name, current }: { userId: string; name: string; current: string[] }) {
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<string[]>(current);
  const [custom, setCustom] = useState(current.find((r) => !TEAM_ROLES.includes(r as never)) ?? "");
  const [pending, start] = useTransition();
  const toast = useToast();
  const picked = [...roles.filter((r) => TEAM_ROLES.includes(r as never)), ...(custom.trim() ? [custom.trim()] : [])];

  return (
    <>
      <button type="button" className="ws-btn ws-btn-ghost ws-btn-sm" onClick={() => { setRoles(current); setOpen(true); }}><Icon name="edit" size={12.5} />Roles</button>
      <Dialog open={open} onClose={() => setOpen(false)} label={`Roles for ${name}`}>
        <div className="ws-dialog-body">
          <div><h2>Roles for {name}</h2><p className="ws-muted">Choose one or two. Changes are logged and shown on their portfolio.</p></div>
          <div className="ws-choices" role="group" aria-label="Roles">
            {TEAM_ROLES.map((r) => {
              const on = roles.includes(r);
              return (
                <label key={r} className="ws-choice">
                  <input type="checkbox" checked={on} disabled={!on && picked.length >= 2} onChange={() => setRoles(on ? roles.filter((x) => x !== r) : [...roles, r])} />
                  <span>{r}</span>
                </label>
              );
            })}
          </div>
          <div className="ws-field">
            <label htmlFor={"custom-" + userId}>Custom role (optional)</label>
            <input id={"custom-" + userId} className="ws-input" value={custom} maxLength={40} onChange={(e) => setCustom(e.target.value)} disabled={!custom && picked.length >= 2} placeholder="For example: Data analyst" />
          </div>
          <p className="ws-small ws-muted" aria-live="polite">{picked.length ? `Selected: ${picked.join(", ")}` : "Nothing selected yet."}</p>
        </div>
        <div className="ws-dialog-foot">
          <button type="button" className="ws-btn ws-btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
          <button type="button" className="ws-btn ws-btn-primary" disabled={pending || !picked.length || picked.length > 2} onClick={() => start(async () => {
            const r = await assignRoles(userId, picked);
            toast({ tone: r.ok ? "success" : "error", message: r.message });
            if (r.ok) setOpen(false);
          })}>{pending && <span className="ws-spinner" aria-hidden />}Save roles</button>
        </div>
      </Dialog>
    </>
  );
}
