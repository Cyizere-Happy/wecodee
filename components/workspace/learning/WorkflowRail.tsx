import type { ReactNode } from "react";
import { Icon, type IconName } from "../Icon";

type WorkflowStep = {
  label: string;
  detail?: ReactNode;
  icon: IconName;
  state?: "complete" | "current" | "upcoming";
};

export function WorkflowRail({ label, steps }: { label: string; steps: readonly WorkflowStep[] }) {
  return (
    <ol className="ws-workflow-rail" aria-label={label}>
      {steps.map((step, index) => (
        <li key={step.label} aria-current={step.state === "current" ? "step" : undefined} data-state={step.state}>
          {index > 0 && <Icon name="arrowRight" size={13} className="ws-workflow-arrow" />}
          <Icon name={step.icon} size={15} className="ws-workflow-icon" />
          <div><strong>{step.label}</strong>{step.detail && <div>{step.detail}</div>}</div>
        </li>
      ))}
    </ol>
  );
}
