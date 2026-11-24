"use client";

import { useId, useState, type ComponentProps } from "react";

type FieldProps = ComponentProps<"input"> & {
  label: string;
  error?: string;
  note?: string;
  password?: boolean;
};

export function AuthField({ label, error, note, password, ...props }: FieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className={"auth-input-wrap" + (password ? " auth-password" : "")}>
        <input
          {...props}
          id={id}
          type={password && !visible ? "password" : props.type ?? "text"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || note ? id + "-help" : undefined}
        />
        {password && (
          <button
            type="button"
            className="auth-password-toggle"
            aria-label={(visible ? "Hide " : "Show ") + label.toLowerCase()}
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
          >
            {visible ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {(error || note) && (
        <p id={id + "-help"} className={error ? "auth-field-error" : "auth-field-note"}>
          {error ?? note}
        </p>
      )}
    </div>
  );
}

export function AuthSubmit({ children, busy, disabled }: {
  children: string;
  busy?: boolean;
  disabled?: boolean;
}) {
  return (
    <button className="auth-primary" type="submit" disabled={busy || disabled} aria-busy={busy}>
      <span>{children}</span>
      <span className={busy ? "auth-spinner" : "auth-button-arrow"} aria-hidden>{busy ? "" : "→"}</span>
    </button>
  );
}
