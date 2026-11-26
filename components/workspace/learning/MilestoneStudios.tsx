"use client";

import { useState } from "react";
import { Icon } from "../Icon";
import { LessonArt, LessonChoices, LessonHeading } from "./LessonParts";

const scenario = "Community clinic · Fictional example";

export function MilestoneStudio({ order }: { order: number }) {
  switch (order) {
    case 1: return <Discover />;
    case 2: return <Proposal />;
    case 4: return <Architecture />;
    case 5: return <Implementation />;
    case 6: return <Testing />;
    case 7: return <Deployment />;
    case 8: return <Presentation />;
    default: return null;
  }
}

const evidence = {
  Interview: { source: "Resident interview", observation: "“I can’t call the clinic during my shift, even when I know I need to move my visit.”", users: "Residents who can’t call during clinic hours", need: "Move an existing appointment without making a call." },
  "Booking log": { source: "Example booking log · 12 scheduled visits", observation: "Three visits were missed after residents tried to change their appointment by phone.", users: "Residents trying to reschedule an existing visit", need: "Find and confirm another time before missing the visit." },
};
const sources = ["Interview", "Booking log"] as const;

function Discover() {
  const [source, setSource] = useState<(typeof sources)[number]>("Interview");
  const item = evidence[source];
  return (
    <section className="ws-lesson ws-discover" aria-labelledby="discover-title">
      <LessonHeading id="discover-title" scenario={scenario} title="Follow the evidence.">
        <p>Start with what people do today. Use what you observe to name the affected user and the need.</p>
      </LessonHeading>
      <div className="ws-evidence">
        <div className="ws-evidence-art"><LessonArt name="observation" /></div>
        <div className="ws-evidence-ledger">
          <LessonChoices label="Evidence source" choices={sources} value={source} onChange={setSource} />
          <figure key={source}>
            <figcaption className="ws-lesson-label">{item.source}</figcaption>
            <blockquote>{item.observation}</blockquote>
          </figure>
          <dl aria-live="polite">
            <div><dt>Affected users</dt><dd>{item.users}</dd></div>
            <div><dt>What they need</dt><dd>{item.need}</dd></div>
          </dl>
        </div>
      </div>
      <details className="ws-lesson-details"><summary>What makes this evidence useful?</summary><p>The interview explains the barrier. The booking log shows that it recurs. Use both where possible and keep your problem statement focused on the need.</p></details>
    </section>
  );
}

const releases = ["First release", "Follow-up"] as const;
function Proposal() {
  const [release, setRelease] = useState<(typeof releases)[number]>("First release");
  const first = release === "First release";
  return (
    <section className="ws-lesson ws-proposal" aria-labelledby="proposal-title">
      <LessonHeading id="proposal-title" scenario={scenario} title="Decide what ships first.">
        <p>Residents need a way to move an appointment without calling. Decide which features the team can deliver to meet that need.</p>
      </LessonHeading>
      <div className="ws-scope-top">
        <div className="ws-scope-art"><LessonArt name="scope" /></div>
        <div className="ws-scope-brief">
          <LessonChoices label="Proposal scope" choices={releases} value={release} onChange={setRelease} />
          <dl aria-live="polite">
            <div><dt>Objective</dt><dd>{first ? "Let residents choose and confirm a new appointment time." : "Tell residents about changes after they leave the app."}</dd></div>
            <div><dt>Proposed solution</dt><dd>{first ? "A mobile-friendly reschedule page using the clinic’s available slots." : "An opt-in SMS confirmation with the new date and time."}</dd></div>
            <div><dt>Expected impact</dt><dd>{first ? "At least 7 of 8 people can move their booking unaided in a trial." : "Confirm that 9 of 10 test messages arrive within one minute."}</dd></div>
          </dl>
        </div>
      </div>
      <ol className="ws-scope-rail" aria-label="Example delivery plan">
        <li data-current={first}><strong>Agree the user flow</strong><span>Design · Week 1</span></li>
        <li data-current={first}><strong>Build and trial rescheduling</strong><span>Engineering · Weeks 2–3</span></li>
        <li data-current={!first}><strong>Add SMS confirmation</strong><span>Follow-up · After trial</span></li>
      </ol>
    </section>
  );
}

const requestStages = [
  { title: "Send the selected slot", detail: "The browser sends the resident’s selection to the application.", example: ["Appointment #204", "Thursday, 09:00"], route: "M0 10H50" },
  { title: "Validate and authorize", detail: "The application checks ownership before asking the database to reserve the slot.", example: ["Owner verified", "Reserve 09:00"], route: "M50 10H150" },
  { title: "Save one reservation", detail: "The database saves both changes together. A conflict keeps the original booking.", example: ["Reserve new slot", "Update appointment #204"], route: "M150 10H250" },
  { title: "Confirm the outcome", detail: "The browser shows the saved time, or asks the resident to pick another if the slot was taken.", example: ["Thursday, 09:00", "Booking updated"], route: "M250 10H50" },
] as const;

function Architecture() {
  const [step, setStep] = useState(0);
  const node = step === 3 ? 0 : step;
  const stage = requestStages[step];
  return (
    <section className="ws-lesson ws-architecture" aria-labelledby="architecture-title">
      <LessonHeading id="architecture-title" scenario={scenario} title="Follow one request.">
        <p>Tap a component to see how it moves an appointment.</p>
      </LessonHeading>
      <div className="ws-architecture-board">
        <LessonArt name="architecture" />
        <div className="ws-request">
          <ol aria-label="Appointment application components" className="ws-request-nodes">
            {([["panel", "Browser"], ["settings", "Application"], ["book", "Database"]] as const).map(([icon, title], index) => (
              <li key={title}>
                <button type="button" aria-current={node === index ? "step" : undefined} aria-controls="architecture-readout" onClick={() => setStep(index)}>
                  <Icon name={icon} size={36} /><span>{title}</span>
                </button>
              </li>
            ))}
          </ol>
          <svg className="ws-request-route" aria-hidden="true" viewBox="0 0 300 20" preserveAspectRatio="none">
            <path d="M0.8 10H250" />
            <path key={step} className="ws-request-packet" d={stage.route} pathLength="1" />
          </svg>
          <div id="architecture-readout" className="ws-request-current" aria-live="polite">
            <h3>{stage.title}</h3>
            <div className="ws-request-example">
              <strong>{stage.example[0]}</strong><Icon name="arrowRight" size={18} /><strong>{stage.example[1]}</strong>
            </div>
            <p>{stage.detail}</p>
          </div>
          <button type="button" className="ws-btn ws-btn-secondary ws-btn-sm" onClick={() => setStep((step + 1) % requestStages.length)}>
            {step === 3 ? "Trace again" : "Follow the request"}<Icon name={step === 3 ? "history" : "arrowRight"} size={14} />
          </button>
        </div>
      </div>
      <details className="ws-lesson-details"><summary>What belongs in your design deliverable?</summary><p>Use a diagram like this to explain component boundaries. Add your entity relationships and wireframes so a reviewer can also see how the data and screens are organized.</p></details>
    </section>
  );
}

function Implementation() {
  const [guard, setGuard] = useState(false);
  const [slot, setSlot] = useState("Tuesday, 10:30");
  const [saved, setSaved] = useState("");
  const unchanged = slot === "Tuesday, 10:30";
  return (
    <section className="ws-lesson ws-implementation" aria-labelledby="implementation-title">
      <div className="ws-implementation-head">
        <LessonHeading id="implementation-title" scenario={scenario} title="Make the design behave.">
          <p>The wireframe says “Save new time.” Add a small rule that controls when a user can actually save.</p>
        </LessonHeading>
        <label className="ws-code-toggle"><input type="checkbox" checked={guard} onChange={(event) => { setGuard(event.target.checked); setSaved(""); }} /> Require a different time</label>
      </div>
      <div className="ws-code-and-ui">
        <div className="ws-source">
          <div className="ws-scene-header"><Icon name="file" size={14} /> Reschedule form logic</div>
          <pre><code><span>const currentTime = &quot;Tuesday, 10:30&quot;;</span>{"\n"}<mark>const canSave = {guard ? "selectedTime !== currentTime" : "true"};</mark>{"\n"}<span>{"<button disabled={!canSave}>"}</span>{"\n"}<span>{"  Save new time"}</span>{"\n"}<span>{"</button>"}</span></code></pre>
        </div>
        <div className="ws-wire-connector"><LessonArt name="implementation" /><Icon name="arrowRight" size={19} /></div>
        <div className="ws-demo-window">
          <div className="ws-scene-header"><Icon name="panel" size={14} /> Running form <span>Demo</span></div>
          <div className="ws-demo-body">
            <label className="ws-build-input">Select a time
              <select className="ws-select" value={slot} onChange={(event) => { setSlot(event.target.value); setSaved(""); }}><option>Tuesday, 10:30</option><option>Thursday, 09:00</option></select>
            </label>
            <button type="button" className="ws-btn ws-btn-primary ws-btn-sm" disabled={guard && unchanged} onClick={() => setSaved(slot)}>Save new time</button>
            <p className="ws-demo-result" aria-live="polite">{saved ? unchanged ? "The form submitted the original time." : `The form submitted ${saved}.` : guard && unchanged ? "Choose a different time to enable saving." : "Try saving to see what the form submits."}</p>
          </div>
        </div>
      </div>
      <p className="ws-lesson-caption">The form guides the user. The application must still enforce booking rules when it receives the request.</p>
    </section>
  );
}

function Testing() {
  const [result, setResult] = useState<"ready" | "failed" | "passed">("ready");
  return (
    <section className="ws-lesson ws-testing" aria-labelledby="testing-title">
      <LessonHeading id="testing-title" scenario={scenario} title="Catch a double booking.">
        <p>Two people request the same opening at once. Run the test, inspect the result, then try it with the reservation fix in place.</p>
      </LessonHeading>
      <div className="ws-test-bench">
        <div className="ws-test-fixture"><LessonArt name="test" /><p>1 available slot · 2 requests</p></div>
        <div className="ws-test-matrix">
          <div className="ws-test-head"><strong>Thursday, 09:00</strong><span aria-live="polite" data-result={result}>{result === "ready" ? "Ready" : result === "failed" ? "Test failed" : "Test passed"}</span></div>
          <table>
            <thead><tr><th scope="col">Request</th><th scope="col">Expected</th><th scope="col">Observed</th></tr></thead>
            <tbody>
              <tr><th scope="row">First resident</th><td>Confirmed</td><td>{result === "ready" ? "—" : "Confirmed"}</td></tr>
              <tr><th scope="row">Second resident</th><td>Slot unavailable</td><td data-mismatch={result === "failed"}>{result === "failed" ? "Confirmed" : result === "passed" ? "Slot unavailable" : "—"}</td></tr>
            </tbody>
          </table>
          <p aria-live="polite">{result === "failed" ? "Both requests checked availability before either saved. The second confirmation exposes the defect." : result === "passed" ? "With one reservation per slot enforced by the database, the second save returns a conflict and the original booking stays intact." : "Expected result: exactly one booking is confirmed."}</p>
          <button type="button" className="ws-btn ws-btn-secondary ws-btn-sm" onClick={() => setResult(result === "ready" ? "failed" : result === "failed" ? "passed" : "ready")}>
            {result === "ready" ? "Run the test" : result === "failed" ? "Apply the fix and rerun" : "Reset example"}<Icon name={result === "passed" ? "history" : "play"} size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

const deliveryStages = [
  ["Local", "Build on your machine", "Commit the source and record the steps for running it locally.", "localhost:3000"],
  ["Build", "Package a tested version", "Run checks and package the same revision that passed. Keep secrets in the hosting environment.", "Build from the release commit"],
  ["Preview", "Verify without real bookings", "Use staging data to try rescheduling, access controls, and the database connection.", "preview.clinic.example"],
  ["Production", "Release and verify the live app", "Publish the verified version, run a smoke check, and record the URL and rollback steps.", "appointments.clinic.example"],
] as const;

function Deployment() {
  const [stage, setStage] = useState(0);
  return (
    <section className="ws-lesson ws-deployment" aria-labelledby="deployment-title">
      <LessonHeading id="deployment-title" scenario={scenario} title="From your machine to users.">
        <p>Move one release from local development through verification to a public app.</p>
      </LessonHeading>
      <div className="ws-pipeline">
        <LessonArt name="release" />
        <div className="ws-pipeline-work">
          <ol aria-label="Release pipeline">
            {deliveryStages.map(([label], index) => (
              <li key={label} data-reached={index <= stage} aria-current={index === stage ? "step" : undefined}><span />{label}</li>
            ))}
          </ol>
          <div key={stage} className="ws-release-readout" aria-live="polite">
            <code>{deliveryStages[stage][3]}</code>
            <h3>{deliveryStages[stage][1]}</h3>
            <p>{deliveryStages[stage][2]}</p>
          </div>
          <button type="button" className="ws-btn ws-btn-secondary ws-btn-sm" onClick={() => setStage((stage + 1) % deliveryStages.length)}>
            {stage === 3 ? "Reset pipeline" : `Continue to ${deliveryStages[stage + 1][0].toLowerCase()}`}<Icon name={stage === 3 ? "history" : "arrowRight"} size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

const slides = ["Problem", "Solution", "Demo", "Results", "Lessons"] as const;
function Presentation() {
  const [slide, setSlide] = useState<(typeof slides)[number]>("Problem");
  return (
    <section className="ws-lesson ws-presentation" aria-labelledby="presentation-title">
      <LessonHeading id="presentation-title" scenario={scenario} title="Show what changed.">
        <p>Turn the project into a short story your audience can follow. Walk through each moment of this example demo.</p>
      </LessonHeading>
      <div className="ws-demo-storyboard">
        <LessonChoices label="Demo day storyboard" choices={slides} value={slide} onChange={setSlide} />
        <div className="ws-present-stage">
          <LessonArt name="presentation" />
          <div key={slide} className="ws-slide" aria-live="polite">
            <p className="ws-lesson-label">{slide}</p>
            {slide === "Problem" && <><h3>Patients couldn’t move a booking during a shift.</h3><p>Show the interview evidence and name who experienced the problem.</p></>}
            {slide === "Solution" && <><h3>A reschedule page with available times.</h3><p>Explain how choosing and confirming a slot addresses the need.</p></>}
            {slide === "Demo" && <><h3>Move the resident’s appointment.</h3><div className="ws-slide-demo"><span>Tue · 10:30</span><Icon name="arrowRight" size={19} /><strong>Thu · 09:00</strong></div></>}
            {slide === "Results" && <><h3>7 of 8 people rescheduled unaided.</h3><div className="ws-demo-dots" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <span key={i} data-success={i < 7} />)}</div><p>Example trial result. State how many people tried it and what you measured.</p></>}
            {slide === "Lessons" && <><h3>Show why a slot is unavailable.</h3><p>Explain the confusion the trial exposed and the improvement the team would make next.</p></>}
          </div>
        </div>
      </div>
    </section>
  );
}
