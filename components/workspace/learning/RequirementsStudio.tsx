"use client";

import { useState } from "react";
import { Icon } from "../Icon";
import { LessonArt, LessonChoices, LessonHeading } from "./LessonParts";

const stages = ["Idea", "Requirements", "Interface"] as const;
const comparisons = ["Functional", "Nonfunctional"] as const;
const loads = ["Agreed load", "Peak load"] as const;
const slots = ["Tuesday, 10:30", "Wednesday, 14:00", "Thursday, 09:00"] as const;
const measurable = "95% of appointment-rescheduling requests finish within two seconds at the agreed load.";

export function RequirementsStudio() {
  const [stage, setStage] = useState<(typeof stages)[number]>("Idea");
  const [comparison, setComparison] = useState<(typeof comparisons)[number]>("Functional");
  const [specified, setSpecified] = useState(false);

  return (
    <section className="ws-lesson" aria-labelledby="stage-title">
      <div className="ws-lesson-opening">
        <LessonHeading scenario="Community clinic · Fictional example" title="Before you build it, define it." id="stage-title">
          <p>A resident needs to move an appointment. Follow the request from a conversation to a specification you can check against the finished app.</p>
        </LessonHeading>
        <div className="ws-story">
          <LessonChoices label="Follow the idea" choices={stages} value={stage} onChange={setStage} flow />
          <div className="ws-story-stage">
            <div key={stage} className="ws-story-scene" data-stage={stage.toLowerCase()}>
              <div className="ws-story-prop">
                {stage === "Idea" && (
                  <figure className="ws-story-quote">
                    <figcaption>Resident interview</figcaption>
                    <blockquote>“I need to move my appointment without calling the clinic.”</blockquote>
                  </figure>
                )}
                {stage === "Requirements" && (
                  <div className="ws-story-document">
                    <div className="ws-scene-header"><Icon name="file" size={14} /> Requirements document</div>
                    <dl>
                      <dt>FR-01 · Reschedule</dt><dd>A resident can move an appointment to an available slot and see the new time confirmed.</dd>
                      <dt>NFR-01 · Response time</dt><dd>{measurable}</dd>
                    </dl>
                  </div>
                )}
                {stage === "Interface" && <AppointmentDemo />}
              </div>
              <svg className="ws-story-connector" aria-hidden="true" viewBox="0 0 82 40">
                <path d="M2 30C31 30 30 9 73 9m-7-5 7 5-7 5" pathLength="1" />
              </svg>
              <LessonArt name={stage === "Idea" ? "srs-idea" : stage === "Requirements" ? "srs-spec" : "srs-interface"} />
            </div>
          </div>
          <p className="ws-story-caption" aria-live="polite">
            {stage === "Idea" && "Start with the resident’s need. It tells you what the app has to make possible."}
            {stage === "Requirements" && "Record the action and its performance target separately so each can be checked."}
            {stage === "Interface" && "Try moving the appointment. The interface makes the functional requirement observable."}
          </p>
        </div>
      </div>

      <section className="ws-lesson-chapter" id="requirement-types" aria-labelledby="requirement-types-title">
        <div className="ws-lesson-chapter-head">
          <h3 id="requirement-types-title">One action, two kinds of requirements</h3>
          <LessonChoices label="Requirement type" choices={comparisons} value={comparison} onChange={setComparison} />
        </div>
        <div className="ws-lesson-compare" key={comparison}>
          <div className="ws-lesson-aside">
            <h4>{comparison === "Functional" ? "What the app must do" : "How well it must do it"}</h4>
            <p>{comparison === "Functional"
              ? "Change the time below. A successful reschedule updates the appointment and confirms the new time."
              : "Count the requests that finish within two seconds. Switch the load to see how the same feature can miss its performance target."}</p>
          </div>
          {comparison === "Functional" ? <AppointmentDemo /> : <PerformanceDemo />}
        </div>
      </section>

      <section className="ws-lesson-chapter" id="testable-requirement" aria-labelledby="testable-title">
        <div className="ws-lesson-chapter-head">
          <h3 id="testable-title">Turn “fast” into a test</h3>
          <button className="ws-btn ws-btn-secondary ws-btn-sm" type="button" onClick={() => setSpecified(!specified)}>
            {specified ? "Show the original wording" : "Make it measurable"}<Icon name={specified ? "history" : "arrowRight"} size={14} />
          </button>
        </div>
        <div className="ws-rewrite" data-specified={specified}>
          <div>
            <p className="ws-lesson-label">{specified ? "Measurable requirement" : "Rough draft"}</p>
            <blockquote aria-live="polite">
              {specified
                ? <><mark>95% of</mark> appointment-rescheduling requests finish <mark>within two seconds</mark> at the <mark>agreed load</mark>.</>
                : "The application should be fast."}
            </blockquote>
          </div>
          <dl aria-label="Parts of a testable requirement">
            <div><dt>What to measure</dt><dd>{specified ? "Rescheduling requests" : "Unspecified action"}</dd></div>
            <div><dt>Passing threshold</dt><dd>{specified ? "At least 95% in ≤ 2 s" : "No pass threshold"}</dd></div>
            <div><dt>Test conditions</dt><dd>{specified ? "Agreed load · 20 concurrent users here" : "No workload defined"}</dd></div>
          </dl>
        </div>
        <details className="ws-lesson-details" id="mobile-data">
          <summary>Apply the same idea to mobile data</summary>
          <p>Specify the action, a data budget, and the conditions. For example, a reschedule should transfer at most 150 KB after the appointment page has loaded, measured on a phone with its cache disabled. Your team should agree on the budget and how to measure it.</p>
        </details>
      </section>
    </section>
  );
}

function AppointmentDemo() {
  const [appointment, setAppointment] = useState<(typeof slots)[number]>(slots[0]);
  const [choice, setChoice] = useState<(typeof slots)[number]>(slots[1]);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="ws-demo-window">
      <div className="ws-scene-header"><Icon name="calendar" size={15} /> Community clinic <span>Demo</span></div>
      <div className="ws-demo-body">
        <div className="ws-appointment-current"><span className="ws-lesson-label">Current appointment</span><strong>{appointment}</strong></div>
        <div className="ws-appointment-controls">
          <label>New appointment time
            <select className="ws-select" value={choice} onChange={(event) => setChoice(event.target.value as (typeof slots)[number])}>
              {slots.map((slot) => <option key={slot}>{slot}</option>)}
            </select>
          </label>
          <button className="ws-btn ws-btn-primary ws-btn-sm" type="button" disabled={choice === appointment} onClick={() => { setAppointment(choice); setConfirmed(true); }}>Confirm change</button>
        </div>
        <p className="ws-demo-result" aria-live="polite">{confirmed ? <><Icon name="check" size={14} /> Rescheduled to {appointment}.</> : "Choose an available time to try rescheduling."}</p>
      </div>
    </div>
  );
}

function PerformanceDemo() {
  const [load, setLoad] = useState<(typeof loads)[number]>("Agreed load");
  const fast = load === "Agreed load" ? 97 : 92;
  return (
    <div className="ws-performance">
      <div className="ws-scene-header"><Icon name="clock" size={15} /> Response time <span>Simulated</span></div>
      <div className="ws-demo-body">
        <LessonChoices label="Simulated traffic" choices={loads} value={load} onChange={setLoad} />
        <div className="ws-performance-reading"><strong>{fast}%</strong><span>within two seconds<br />{load === "Agreed load" ? 20 : 60} concurrent users</span></div>
        <div className="ws-performance-track" aria-hidden="true">
          <div style={{ width: fast + "%" }} />
          <span />
        </div>
        <div className="ws-performance-labels"><span>0%</span><span>95% target</span></div>
        <p className="ws-demo-result" aria-live="polite">{fast} of 100 requests met the time limit. {fast >= 95 ? "Target met at the agreed load." : "Below 95% at peak load, outside the agreed test conditions."}</p>
      </div>
    </div>
  );
}
