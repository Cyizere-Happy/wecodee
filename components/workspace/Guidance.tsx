import type { ReactNode } from "react";
import type { ArtName } from "@/lib/workspace/mascot";
import { Icon, type IconName } from "./Icon";
import { Mascot } from "./ui";

export function MascotGuide({ art, title, children, action, details, compact = false }: {
  art: ArtName;
  title: string;
  children: ReactNode;
  action?: ReactNode;
  details?: ReactNode;
  compact?: boolean;
}) {
  return (
    <aside className={"ws-guide" + (compact ? " ws-guide-compact" : "")}>
      <div className="ws-guide-copy">
        <h2>{title}</h2>
        <div className="ws-guide-text">{children}</div>
        {action && <div className="ws-guide-actions">{action}</div>}
      </div>
      <Mascot art={art} className="ws-guide-art" />
      {details}
    </aside>
  );
}

export type VisualStep = {
  label: string;
  detail?: string;
  icon: IconName;
  state?: "done" | "current" | "pending";
};

export function VisualSequence({ label, steps, compare = false }: {
  label: string;
  steps: readonly VisualStep[];
  compare?: boolean;
}) {
  return (
    <ol className="ws-visual-sequence" data-compare={compare || undefined} aria-label={label}>
      {steps.map((step) => (
        <li key={step.label} data-state={step.state} aria-current={step.state === "current" ? "step" : undefined}>
          <span className="ws-visual-icon"><Icon name={step.state === "done" ? "check" : step.icon} size={16} /></span>
          <span className="ws-visual-copy">
            <strong>{step.label}</strong>
            {step.detail && <span>{step.detail}</span>}
            {step.state === "done" && <span className="ws-sr">Complete</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
