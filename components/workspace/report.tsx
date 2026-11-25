"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, useTransition } from "react";
import { submitDailyReport } from "@/lib/workspace/actions";
import type { ActionResult } from "@/lib/workspace/types";
import { Icon } from "./Icon";
import { useToast } from "./forms";

type Draft = { done: string; next: string; blockers: string; hours: string; queuedAt: string };
const QUEUE_EVENT = "wecodee:report-queue";

function readQueueRaw(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function writeQueue(key: string, draft: Draft | null) {
  try {
    if (draft) localStorage.setItem(key, JSON.stringify(draft));
    else localStorage.removeItem(key);
  } catch { return false; }
  window.dispatchEvent(new Event(QUEUE_EVENT));
  return true;
}

function useQueuedReport(key: string): Draft | null {
  const raw = useSyncExternalStore(
    (cb) => { window.addEventListener("storage", cb); window.addEventListener(QUEUE_EVENT, cb); return () => { window.removeEventListener("storage", cb); window.removeEventListener(QUEUE_EVENT, cb); }; },
    () => readQueueRaw(key),
    () => null,
  );
  return useMemo(() => { try { return raw ? (JSON.parse(raw) as Draft) : null; } catch { return null; } }, [raw]);
}

function useOnline() {
  return useSyncExternalStore(
    (cb) => { window.addEventListener("online", cb); window.addEventListener("offline", cb); return () => { window.removeEventListener("online", cb); window.removeEventListener("offline", cb); }; },
    () => navigator.onLine,
    () => true,
  );
}

/**
 * FR-73 / FR-85 / NFR-16: written offline, a report is kept on the device and
 * sent once when the connection returns. Without a service worker this happens
 * while the app is open; Background Sync can take over when the PWA ships.
 */
export function ReportForm({ initial, hasToday, queueKey }: { initial: { done: string; next: string; blockers: string; hours: number } | null; hasToday: boolean; queueKey: string }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const queued = useQueuedReport(queueKey);
  const [pending, start] = useTransition();
  const online = useOnline();
  const toast = useToast();

  const send = useCallback((draft: Omit<Draft, "queuedAt">, fromQueue = false) => start(async () => {
    const form = new FormData();
    Object.entries(draft).forEach(([k, v]) => form.set(k, v));
    let result: ActionResult;
    try {
      result = await submitDailyReport(null, form);
    } catch {
      const saved = fromQueue || writeQueue(queueKey, { ...draft, queuedAt: new Date().toISOString() });
      toast({ tone: "error", message: saved ? "Couldn’t reach WeCodee. Your report is saved on this device." : "Couldn’t reach WeCodee or save your report on this device. Keep this page open and try again." });
      return;
    }
    if (result.ok) {
      writeQueue(queueKey, null);
      setErrors({}); setMessage("");
      toast({ tone: "success", message: fromQueue ? "Your saved report was sent." : result.message });
    } else {
      setErrors(result.fields ?? {}); setMessage(result.message);
    }
  }), [queueKey, toast]);

  useEffect(() => {
    if (online && queued) send(queued, true);
  }, [online, queued, send]);

  return (
    <form
      className="ws-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const draft = { done: String(f.get("done") ?? ""), next: String(f.get("next") ?? ""), blockers: String(f.get("blockers") ?? ""), hours: String(f.get("hours") ?? "") };
        if (!navigator.onLine) {
          const saved = writeQueue(queueKey, { ...draft, queuedAt: new Date().toISOString() });
          toast(saved
            ? { tone: "success", message: "Saved on this device. It will send when you’re back online." }
            : { tone: "error", message: "Couldn’t save your report on this device. Keep this page open and try again." });
          return;
        }
        send(draft);
      }}
    >
      {queued && <p className="ws-feedback" data-tone="warn"><Icon name="clock" size={12.5} /><span><strong>Waiting to send.</strong> A report saved offline will be sent automatically when you reconnect.</span></p>}
      {([
        ["done", "What I did", "Built the booking form validation."],
        ["next", "What I’ll do next", "Connect the form to the API."],
        ["blockers", "Blockers (optional)", "Anything stopping you? Your supervisor sees this until it’s solved."],
      ] as const).map(([name, label, placeholder]) => (
        <div className="ws-field" key={name}>
          <label htmlFor={"r-" + name}>{label}</label>
          <textarea id={"r-" + name} name={name} className="ws-textarea" rows={2} maxLength={600} placeholder={placeholder} defaultValue={initial?.[name] ?? ""} aria-invalid={errors[name] ? true : undefined} style={{ minHeight: 64 }} />
          {errors[name] && <p className="ws-error">{errors[name]}</p>}
        </div>
      ))}
      <div className="ws-row ws-wrap" style={{ alignItems: "flex-end", gap: 12 }}>
        <div className="ws-field" style={{ width: 140 }}>
          <label htmlFor="r-hours">Hours worked</label>
          <input id="r-hours" name="hours" type="number" min={0} max={12} step={0.5} inputMode="decimal" className="ws-input" defaultValue={initial?.hours ?? ""} aria-invalid={errors.hours ? true : undefined} />
        </div>
        <button type="submit" className="ws-btn ws-btn-primary" disabled={pending} style={{ minHeight: 38 }}>
          {pending && <span className="ws-spinner" aria-hidden />}{hasToday ? "Update report" : online ? "Post report" : "Save offline"}
        </button>
      </div>
      {errors.hours && <p className="ws-error">{errors.hours}</p>}
      {message && <p className="ws-feedback" data-tone="error" role="alert"><Icon name="alert" size={12.5} /><span>{message}</span></p>}
    </form>
  );
}
