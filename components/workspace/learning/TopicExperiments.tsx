"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "../Icon";
import { LessonChoices, LessonHeading } from "./LessonParts";

export function FormExperiment() {
  const [linked, setLinked] = useState(false);
  const [focused, setFocused] = useState(false);
  const label = useRef<HTMLLabelElement>(null);
  const fieldId = useId();

  return (
    <section className="ws-lesson ws-topic-experiment" aria-labelledby="form-experiment">
      <LessonHeading id="form-experiment" scenario="Interactive example" title="Make the label part of the form.">
        <p>Try the label before and after linking it to the email field.</p>
      </LessonHeading>
      <div className="ws-form-experiment">
        <Image className="ws-form-experiment-art" src="/illustrations/mascot/stories/form-label.webp" alt="" width={900} height={450} unoptimized />
        <div className="ws-demo-window">
          <div className="ws-scene-header"><Icon name="panel" /> Event sign-up</div>
          <div className="ws-demo-body">
            <LessonChoices label="Label connection" choices={["Label disconnected", "Label connected"]} value={linked ? "Label connected" : "Label disconnected"} onChange={(choice) => { setLinked(choice === "Label connected"); setFocused(false); }} />
            <div className="ws-form-experiment-control" data-linked={linked}>
              <label className="ws-experiment-label" ref={label} htmlFor={linked ? fieldId : undefined} onClick={() => setFocused(linked)}>Email address</label>
              <Icon name={linked ? "link" : "x"} />
              <input id={fieldId} aria-label={linked ? undefined : "Example email address"} className="ws-input" type="email" placeholder="you@example.com" autoComplete="off" />
            </div>
            <button className="ws-btn ws-btn-ghost ws-btn-sm" type="button" onClick={() => label.current?.click()}>Try the email label</button>
            <p className="ws-demo-result" aria-live="polite">
              {linked ? focused ? "The label moved focus to the email field." : "The label and input share an ID." : "The visible label cannot focus the field yet."}
            </p>
            <code className="ws-demo-code">{linked ? '<label for="email">Email</label>' : '<label>Email</label>'}</code>
          </div>
        </div>
      </div>
    </section>
  );
}

const learners = [
  { name: "Aline", team: "LabSlot" },
  { name: "Eric", team: null },
  { name: "Maya", team: "LabSlot" },
];

export function JoinExperiment() {
  const [join, setJoin] = useState<"INNER JOIN" | "LEFT JOIN">("INNER JOIN");
  const rows = join === "INNER JOIN" ? learners.filter(({ team }) => team) : learners;

  return (
    <section className="ws-lesson ws-topic-experiment" aria-labelledby="join-experiment">
      <LessonHeading id="join-experiment" scenario="Fictional learner records" title="See who stays in the result.">
        <p>Switch the join to see what happens to Eric’s row.</p>
      </LessonHeading>
      <div className="ws-join-experiment">
        <Image className="ws-form-experiment-art" src="/illustrations/mascot/stories/data-joins.webp" alt="" width={900} height={450} unoptimized />
        <div>
          <LessonChoices label="SQL join type" choices={["INNER JOIN", "LEFT JOIN"]} value={join} onChange={setJoin} />
          <div className="ws-join-board">
            <div className="ws-join-inputs">
              <div><strong>Learners</strong><span>Aline · Eric · Maya</span></div>
              <div><strong>Team membership</strong><span>Aline → LabSlot · Maya → LabSlot</span></div>
            </div>
            <Icon name="arrowRight" size={20} className="ws-join-arrow" />
            <table className="ws-join-table">
              <caption>Join result</caption>
              <thead><tr><th scope="col">Learner</th><th scope="col">Team</th></tr></thead>
              <tbody>{rows.map(({ name, team }) => <tr key={name}><td>{name}</td><td>{team ?? <code>NULL</code>}</td></tr>)}</tbody>
            </table>
          </div>
          <code className="ws-demo-code">FROM learners {join} memberships ON learners.id = memberships.learner_id</code>
          <p className="ws-lesson-caption" role="status">{rows.length} rows. {join === "INNER JOIN" ? "Only matching learners." : "All learners. No membership becomes NULL."}</p>
        </div>
      </div>
    </section>
  );
}

export function CoachingExperiment() {
  const [step, setStep] = useState<"Unexpected result" | "Ask for a hint" | "Test your fix">("Unexpected result");
  const stages = {
    "Unexpected result": { code: "String(2) + 3  // \"23\"", note: "Expected 5. The first value is text, so + joins the values." },
    "Ask for a hint": { code: "Which operand is a string?", note: "Sample coaching response. Inspect the type of each value before changing the expression." },
    "Test your fix": { code: "Number(\"2\") + 3  // 5", note: "The learner converts the text to a number and checks that the expected result matches." },
  };

  return (
    <figure className="ws-coaching-board">
      <figcaption><strong>Debug with a hint</strong><span>Example exchange with an external AI assistant</span></figcaption>
      <Image className="ws-coaching-art" src="/illustrations/mascot/stories/ai-review.webp" alt="WeCodee checks the corrected result on a monitor beside an orange pixel-art assistant with a laptop." width={900} height={600} unoptimized />
      <LessonChoices label="Debugging step" choices={["Unexpected result", "Ask for a hint", "Test your fix"]} value={step} onChange={setStep} flow />
      <div className="ws-coaching-result" aria-live="polite">
        <code>{stages[step].code}</code><p>{stages[step].note}</p>
      </div>
    </figure>
  );
}

export function QuizPractice() {
  const [choice, setChoice] = useState<"4" | "7" | "10" | null>(null);
  return (
    <details className="ws-quiz-practice">
      <summary>Try an ungraded code-reading example</summary>
      <p>A project logged three hours yesterday and four today. What will the display show?</p>
      <code className="ws-demo-code">const totalHours = 3 + 4;</code>
      <div className="ws-lesson-choices" role="group" aria-label="Example answer">
        {(["4", "7", "10"] as const).map((answer) => <button key={answer} type="button" aria-pressed={choice === answer} onClick={() => setChoice(answer)}>{answer} h</button>)}
      </div>
      <p role="status">{choice && (choice === "7" ? "Correct. The total adds both days." : "Follow the + operator and add the two values.")}</p>
    </details>
  );
}
