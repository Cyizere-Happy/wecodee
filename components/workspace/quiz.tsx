"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { startQuiz, submitQuiz, type QuizPaper } from "@/lib/workspace/actions";
import { QUIZ_MINUTES } from "@/lib/workspace/rules";
import { stills } from "@/lib/workspace/mascot";
import type { Level } from "@/lib/workspace/types";
import { Icon } from "./Icon";
import { useToast } from "./forms";

type Phase = { kind: "intro" } | { kind: "taking"; paper: QuizPaper } | { kind: "done"; score: number; level: Level; message: string };

export function QuizRunner({ chosenLevel, retake }: { chosenLevel: Level; retake: boolean }) {
  const [phase, setPhase] = useState<Phase>({ kind: "intro" });
  const [pending, start] = useTransition();
  const toast = useToast();

  if (phase.kind === "done") {
    return (
      <div className="ws-card"><div className="ws-empty">
        <span className="ws-mascot" data-soft="" style={{ width: 168, height: 168 }}>{/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stills.medal} alt="" /></span>
        <h3>You scored {phase.score}. Your level is {phase.level}.</h3>
        <p>{phase.message} We’ll use your level to match you with a team.</p>
        <div className="ws-actions"><a href="/learner" className="ws-btn ws-btn-primary">Back to overview</a></div>
      </div></div>
    );
  }

  if (phase.kind === "taking") {
    return <QuizPaperView paper={phase.paper} onDone={(score, level, message) => setPhase({ kind: "done", score, level, message })} />;
  }

  return (
    <div className="ws-card">
      <div className="ws-card-body" style={{ display: "grid", gap: 14, padding: 24 }}>
        <h2 className="ws-h2">{retake ? "Retake" : "Ready when you are"}: {chosenLevel} quiz</h2>
        <ul style={{ display: "grid", gap: 8 }}>
          {[
            ["quiz", "10 to 15 multiple-choice and code-reading questions."],
            ["clock", `${QUIZ_MINUTES} minutes. The timer starts when you press Start and keeps running if you leave the page.`],
            ["chart", "Below 40 drops a level, 40–74 confirms it, 75 or more raises it."],
            ["history", retake ? "This is your one retake." : "You can retake once, after 7 days, before you’re placed in a team."],
          ].map(([icon, text]) => (
            <li key={text} className="ws-row" style={{ alignItems: "flex-start" }}><Icon name={icon as "quiz"} size={14.5} className="ws-faint" /><span>{text}</span></li>
          ))}
        </ul>
        <div>
          <button type="button" className="ws-btn ws-btn-primary ws-btn-lg" disabled={pending} onClick={() => start(async () => {
            const r = await startQuiz();
            if (!r.ok || !r.paper) toast({ tone: "error", message: r.message });
            else setPhase({ kind: "taking", paper: r.paper });
          })}>
            {pending && <span className="ws-spinner" aria-hidden />}Start the quiz<span className="ws-arrow" aria-hidden>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function QuizPaperView({ paper, onDone }: { paper: QuizPaper; onDone: (score: number, level: Level, message: string) => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [now, setNow] = useState(() => Date.now());
  const [pending, start] = useTransition();
  const submitted = useRef(false);
  const toast = useToast();
  const deadline = new Date(paper.startedAt).getTime() + QUIZ_MINUTES * 60_000;
  const left = Math.max(0, deadline - now);
  const q = paper.questions[index];
  const answered = Object.keys(answers).length;

  const finish = useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;
    start(async () => {
      const r = await submitQuiz(paper.startedAt, Object.fromEntries(paper.questions.map((x) => [x.id, answers[x.id] ?? ""])));
      if (r.ok && r.score !== undefined && r.level) onDone(r.score, r.level, r.message);
      else { submitted.current = false; toast({ tone: "error", message: r.message }); }
    });
  }, [answers, onDone, paper, toast]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  useEffect(() => { if (left === 0) finish(); }, [left, finish]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (!submitted.current) e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const mm = String(Math.floor(left / 60000)).padStart(2, "0");
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");

  return (
    <div className="ws-card">
      <div className="ws-card-head">
        <span className="ws-small ws-muted">Question {index + 1} of {paper.questions.length} · {answered} answered</span>
        <span className={"ws-badge" + (left < 120_000 ? "" : "")} data-tone={left < 120_000 ? "red" : undefined} role="timer" aria-live={left < 60_000 ? "polite" : "off"}>
          <Icon name="clock" size={11} /> {mm}:{ss}
        </span>
      </div>
      <div className="ws-meter" style={{ borderRadius: 0, height: 3 }} aria-hidden><span style={{ width: `${((index + 1) / paper.questions.length) * 100}%`, background: "var(--ws-red)" }} /></div>
      <fieldset className="ws-fieldset ws-card-body" style={{ padding: 24 }} key={q.id}>
        <span className="ws-eyebrow">{q.topic}</span>
        <legend className="ws-h2" style={{ fontSize: ".9563rem", marginBottom: 14, float: "left", width: "100%" }}>
          {q.question.split(/(`[^`]+`)/).map((part, i) => part.startsWith("`") ? <code key={i} className="mono" style={{ background: "var(--ws-surface)", padding: "1px 4.5px", borderRadius: 4, fontSize: ".9em" }}>{part.slice(1, -1)}</code> : part)}
        </legend>
        <div style={{ clear: "both" }}>
          {q.options.map((o) => (
            <label key={o} className="ws-option">
              <input type="radio" name={q.id} checked={answers[q.id] === o} onChange={() => setAnswers((a) => ({ ...a, [q.id]: o }))} />
              <span className="mono" style={{ fontSize: ".7313rem" }}>{o}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="ws-card-foot">
        <button type="button" className="ws-btn ws-btn-ghost ws-btn-sm" disabled={index === 0} onClick={() => setIndex(index - 1)}>← Previous</button>
        {index < paper.questions.length - 1 ? (
          <button type="button" className="ws-btn ws-btn-secondary ws-btn-sm" onClick={() => setIndex(index + 1)}>Next →</button>
        ) : (
          <button type="button" className="ws-btn ws-btn-primary ws-btn-sm" disabled={pending} onClick={finish}>
            {pending && <span className="ws-spinner" aria-hidden />}Submit {answered < paper.questions.length ? `(${paper.questions.length - answered} unanswered)` : ""}
          </button>
        )}
      </div>
    </div>
  );
}
