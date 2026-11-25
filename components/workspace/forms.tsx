"use client";

import {
  createContext, useActionState, useCallback, useContext, useEffect, useId, useRef, useState, useTransition,
  type ComponentProps, type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/lib/workspace/types";
import { stills } from "@/lib/workspace/mascot";
import { Icon } from "./Icon";

/* ---------- Toasts ---------- */

type Toast = { id: number; tone: "success" | "error"; message: string };
const ToastContext = createContext<(t: Omit<Toast, "id">) => void>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    if (!t.message) return;
    const id = Date.now() + Math.random();
    setToasts((list) => [...list.slice(-2), { ...t, id }]);
    window.setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 4200);
  }, []);
  return (
    <ToastContext value={push}>
      {children}
      <div className="ws-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="ws-toast" data-tone={t.tone}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.tone === "success" ? stills.medal : stills.repair} alt="" />
            <p>{t.message}</p>
            <button type="button" className="ws-icon-btn" aria-label="Dismiss" onClick={() => setToasts((l) => l.filter((x) => x.id !== t.id))}><Icon name="x" size={12.5} /></button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

/* ---------- Action forms ---------- */

type ServerAction = (state: ActionResult | null, form: FormData) => Promise<ActionResult>;
const FieldErrors = createContext<Record<string, string>>({});
/** Set by DialogButton so a form inside it closes the dialog after a successful submit. */
const CloseDialog = createContext<(() => void) | null>(null);

export function ActionForm({ action, children, className = "ws-form", onSuccess, reset = false, id }: {
  action: ServerAction;
  children: ReactNode;
  className?: string;
  onSuccess?: (result: ActionResult) => void;
  reset?: boolean;
  id?: string;
}) {
  const [state, run] = useActionState(action, null);
  const toast = useToast();
  const form = useRef<HTMLFormElement>(null);
  const seen = useRef<ActionResult | null>(null);
  const closeDialog = useContext(CloseDialog);

  useEffect(() => {
    if (!state || seen.current === state) return;
    seen.current = state;
    if (state.ok) {
      toast({ tone: "success", message: state.message });
      // Completion feedback: a short pulse on the submit button (CSS [data-done], skipped with reduced motion).
      const button = form.current?.querySelector<HTMLElement>('button[type="submit"], button:not([type])');
      if (button) { button.dataset.done = "true"; window.setTimeout(() => { delete button.dataset.done; }, 600); }
      if (reset) form.current?.reset();
      onSuccess?.(state);
      closeDialog?.();
    } else if (state.fields) {
      const first = Object.keys(state.fields)[0];
      const el = form.current?.querySelector<HTMLElement>(`[name="${first}"]`);
      el?.focus();
    }
  }, [state, toast, reset, onSuccess, closeDialog]);

  return (
    <FieldErrors value={state && !state.ok ? state.fields ?? {} : {}}>
      <form ref={form} action={run} className={className} noValidate id={id}>
        {children}
        {state && !state.ok && (
          <p className="ws-feedback" data-tone="error" role="alert"><Icon name="alert" size={12.5} /><span>{state.message}</span></p>
        )}
      </form>
    </FieldErrors>
  );
}

export function useFieldError(name: string) {
  return useContext(FieldErrors)[name];
}

export function FieldError({ name }: { name: string }) {
  const error = useFieldError(name);
  return error ? <p className="ws-error">{error}</p> : null;
}

type BaseField = { label: ReactNode; name: string; help?: ReactNode; aside?: ReactNode };

export function Field({ label, name, help, aside, ...props }: BaseField & ComponentProps<"input">) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <div className="ws-field">
      <div className="ws-label-row"><label htmlFor={id}>{label}</label>{aside}</div>
      <input id={id} name={name} className="ws-input" aria-invalid={error ? true : undefined} aria-describedby={help || error ? id + "-h" : undefined} {...props} />
      {(error || help) && <p id={id + "-h"} className={error ? "ws-error" : "ws-help"}>{error ?? help}</p>}
    </div>
  );
}

export function TextArea({ label, name, help, aside, ...props }: BaseField & ComponentProps<"textarea">) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <div className="ws-field">
      <div className="ws-label-row"><label htmlFor={id}>{label}</label>{aside}</div>
      <textarea id={id} name={name} className="ws-textarea" aria-invalid={error ? true : undefined} aria-describedby={help || error ? id + "-h" : undefined} {...props} />
      {(error || help) && <p id={id + "-h"} className={error ? "ws-error" : "ws-help"}>{error ?? help}</p>}
    </div>
  );
}

export function Select({ label, name, help, options, placeholder, ...props }: BaseField & ComponentProps<"select"> & { options: (string | [string, string])[]; placeholder?: string }) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <div className="ws-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} name={name} className="ws-select" aria-invalid={error ? true : undefined} aria-describedby={help || error ? id + "-h" : undefined} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const [value, text] = typeof o === "string" ? [o, o] : o;
          return <option key={value} value={value}>{text}</option>;
        })}
      </select>
      {(error || help) && <p id={id + "-h"} className={error ? "ws-error" : "ws-help"}>{error ?? help}</p>}
    </div>
  );
}

export function Check({ name, children, ...props }: { name: string; children: ReactNode } & ComponentProps<"input">) {
  const error = useFieldError(name);
  return (
    <div className="ws-field">
      <label className="ws-check"><input type="checkbox" name={name} aria-invalid={error ? true : undefined} {...props} /><span>{children}</span></label>
      {error && <p className="ws-error">{error}</p>}
    </div>
  );
}

/** Pill-style choices for a radio group or multi-select. */
export function Choices({ legend, name, options, type = "radio", defaultValue, help }: {
  legend: string; name: string; options: (string | [string, string])[]; type?: "radio" | "checkbox"; defaultValue?: string | string[]; help?: string;
}) {
  const error = useFieldError(name);
  const selected = Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : [];
  return (
    <fieldset className="ws-fieldset">
      <legend>{legend}</legend>
      <div className="ws-choices">
        {options.map((o) => {
          const [value, text] = typeof o === "string" ? [o, o] : o;
          return (
            <label key={value} className="ws-choice">
              <input type={type} name={name} value={value} defaultChecked={selected.includes(value)} />
              <span>{text}</span>
            </label>
          );
        })}
      </div>
      {(error || help) && <p className={error ? "ws-error" : "ws-help"} style={{ marginTop: 6 }}>{error ?? help}</p>}
    </fieldset>
  );
}

export function Submit({ children, variant = "primary", size, disabled, arrow }: {
  children: ReactNode; variant?: "primary" | "secondary" | "danger"; size?: "sm" | "lg"; disabled?: boolean; arrow?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`ws-btn ws-btn-${variant}${size ? " ws-btn-" + size : ""}`} disabled={pending || disabled} aria-busy={pending}>
      {pending ? <span className="ws-spinner" aria-hidden /> : null}
      <span>{children}</span>
      {arrow && !pending && <span className="ws-arrow" aria-hidden>→</span>}
    </button>
  );
}

/* ---------- Dialogs ---------- */

export function Dialog({ open, onClose, children, label, className = "" }: { open: boolean; onClose: () => void; children: ReactNode; label: string; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={"ws-dialog " + className}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {open && children}
    </dialog>
  );
}

/** A button that opens a dialog containing a form; an ActionForm inside closes it on success. */
export function DialogButton({ label, title, description, children, variant = "secondary", size = "sm", icon }: {
  label: ReactNode; title: string; description?: ReactNode; children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger-quiet"; size?: "sm" | "md"; icon?: Parameters<typeof Icon>[0]["name"];
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <button type="button" className={`ws-btn ws-btn-${variant}${size === "sm" ? " ws-btn-sm" : ""}`} onClick={() => setOpen(true)}>
        {icon && <Icon name={icon} size={12.5} />}{label}
      </button>
      <Dialog open={open} onClose={close} label={title}>
        <div className="ws-dialog-body">
          <div>
            <h2>{title}</h2>
            {description && <p className="ws-muted" style={{ marginTop: 4 }}>{description}</p>}
          </div>
          <CloseDialog value={close}>{children}</CloseDialog>
        </div>
      </Dialog>
    </>
  );
}

/**
 * Runs a server action from a button, with an optional confirmation step
 * for destructive or hard-to-undo changes.
 */
export function ActionButton({ run, children, variant = "secondary", size = "sm", confirm, icon, disabled, tip }: {
  run: () => Promise<ActionResult>;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "danger-quiet";
  size?: "sm" | "md";
  icon?: Parameters<typeof Icon>[0]["name"];
  disabled?: boolean;
  tip?: string;
  confirm?: { title: string; body: ReactNode; action: string; danger?: boolean };
}) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const execute = () => start(async () => {
    const result = await run();
    setOpen(false);
    toast({ tone: result.ok ? "success" : "error", message: result.message });
  });
  return (
    <>
      <button
        type="button"
        className={`ws-btn ws-btn-${variant}${size === "sm" ? " ws-btn-sm" : ""}`}
        disabled={pending || disabled}
        aria-busy={pending}
        data-tip={tip}
        onClick={() => (confirm ? setOpen(true) : execute())}
      >
        {pending ? <span className="ws-spinner" aria-hidden /> : icon ? <Icon name={icon} size={12.5} /> : null}
        {children}
      </button>
      {confirm && (
        <Dialog open={open} onClose={() => setOpen(false)} label={confirm.title}>
          <div className="ws-dialog-body">
            <h2>{confirm.title}</h2>
            <div className="ws-muted">{confirm.body}</div>
          </div>
          <div className="ws-dialog-foot">
            <button type="button" className="ws-btn ws-btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button type="button" className={`ws-btn ${confirm.danger ? "ws-btn-danger" : "ws-btn-primary"}`} disabled={pending} onClick={execute}>
              {pending && <span className="ws-spinner" aria-hidden />}{confirm.action}
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
