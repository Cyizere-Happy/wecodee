"use client";

import { useState } from "react";
import { LessonArt, LessonChoices } from "./LessonParts";
import { WorkflowRail } from "./WorkflowRail";
import { ChecklistProgress } from "../VisualSummary";
import { Mascot } from "../ui";

const outcomes = ["Approval path", "Revision path"] as const;

export function ReviewChecklist({ checklist }: { checklist: readonly string[] }) {
  const [completed, setCompleted] = useState<boolean[]>([]);
  const count = completed.filter(Boolean).length;
  return (
    <fieldset className="ws-fieldset">
      <legend>Checklist</legend>
      <ChecklistProgress label="Review progress" items={checklist.map((label, index) => ({ label, complete: Boolean(completed[index]) }))} />
      <div className="ws-review-checks">
        {checklist.map((label, index) => (
          <label key={index} className="ws-check">
            <input type="checkbox" name="checklist" value={label} onChange={(event) => {
              const checked = event.currentTarget.checked;
              setCompleted((items) => checklist.map((_, position) => position === index ? checked : Boolean(items[position])));
            }} />
            <span>{label}</span>
          </label>
        ))}
      </div>
      <p className="ws-small ws-muted" role="status">{count === checklist.length ? "All checks met. You can approve after adding feedback." : "Approval requires every check."}</p>
    </fieldset>
  );
}

export function ReviewOutcome({ version, last, decision }: { version: number; last: boolean; decision?: "approved" | "changes_requested" }) {
  const [example, setExample] = useState<(typeof outcomes)[number]>("Approval path");
  const approved = decision ? decision === "approved" : example === "Approval path";
  return (
    <section className="ws-ops-scene ws-review-scene" aria-labelledby="review-path-title">
      {decision ? <Mascot art="stories/review-filed" className="ws-review-filed" /> : <LessonArt name="review" />}
      <div>
        <div className="ws-ops-scene-head">
          <h2 id="review-path-title">{decision ? "What the decision means" : "Preview each review outcome"}</h2>
          {!decision && <LessonChoices label="Review outcome preview" choices={outcomes} value={example} onChange={setExample} />}
        </div>
        <WorkflowRail label="Milestone review workflow" steps={[
          { label: `Version ${version} submitted`, icon: "file", state: "complete" },
          { label: "Checklist and feedback", icon: "clipboard", state: decision ? "complete" : "current" },
          { label: approved ? (last ? "Project complete" : "Next milestone opens") : "Team can revise", icon: approved ? "check" : "edit", state: decision ? "current" : "upcoming" },
        ]} />
        <p className="ws-ops-note" aria-live="polite">
          {approved
            ? (last ? "Final approval completes the project and checks each member’s certificate eligibility." : "Approval opens the next milestone for the whole team.")
            : "The team can read the recorded feedback and submit a new version. Earlier versions stay in History."}
        </p>
      </div>
    </section>
  );
}
