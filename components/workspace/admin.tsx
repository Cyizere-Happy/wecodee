"use client";

import { useState, useTransition } from "react";
import { updateUser } from "@/lib/workspace/actions";
import type { Role } from "@/lib/workspace/types";
import { useToast } from "./forms";

/** FR-57: change a user's role in place. Role changes are audited on the server. */
export function RoleSelect({ userId, role, name, disabled }: { userId: string; role: Role; name: string; disabled?: boolean }) {
  const [value, setValue] = useState(role);
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <select
      className="ws-select ws-select-sm"
      aria-label={`Role for ${name}`}
      value={value}
      disabled={disabled || pending}
      onChange={(e) => {
        const next = e.target.value as Role;
        const previous = value;
        setValue(next);
        start(async () => {
          const r = await updateUser(userId, { role: next });
          if (!r.ok) setValue(previous);
          toast({ tone: r.ok ? "success" : "error", message: r.message });
        });
      }}
      style={{ width: "auto", minWidth: 120 }}
    >
      <option value="learner">Learner</option>
      <option value="supervisor">Supervisor</option>
      <option value="admin">Admin</option>
    </select>
  );
}
