"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CheckQuestion } from "@/lib/workspace/types";
import { youtubeId } from "@/lib/workspace/rules";
import { submitCheckAnswers, trackTopic, type CheckResult } from "@/lib/workspace/actions";
import { Icon } from "./Icon";
import { CopyButton } from "./bits";
import { useToast } from "./forms";

/** Submits a GET filter form as soon as a control changes. */
export function AutoFilter({ children, className = "ws-toolbar" }: { children: React.ReactNode; className?: string }) {
  const router = useRouter();
  const timer = useRef<number>(0);
  return (
    <form
      className={className}
      role="search"
      onChange={(e) => {
        const form = e.currentTarget;
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => {
          const params = new URLSearchParams();
          new FormData(form).forEach((v, k) => { if (v) params.set(k, String(v)); });
          router.replace("?" + params.toString(), { scroll: false });
        }, (e.target as HTMLElement).tagName === "INPUT" ? 250 : 0);
      }}
      onSubmit={(e) => e.preventDefault()}
    >
      {children}
    </form>
  );
}

export function TrackView({ topicId, viewed }: { topicId: string; viewed: boolean }) {
  useEffect(() => { if (!viewed) void trackTopic(topicId, "view"); }, [topicId, viewed]);
  return null;
}

/** FR-86: in low-data mode, or always for the first paint, the video loads only after a tap. */
export function TopicVideo({ url, title, lowData }: { url: string; title: string; lowData: boolean }) {
  const id = youtubeId(url);
  const [play, setPlay] = useState(false);
  if (!id) {
    return (
      <div className="ws-video" style={{ background: "#fafafa" }}>
        <div className="ws-video-cover" style={{ cursor: "default" }}>
          <div><Icon name="play" size={24} /><strong>Video coming soon</strong></div>
        </div>
      </div>
    );
  }
  return (
    <div className="ws-video">
      {play ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&cc_load_policy=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button type="button" className="ws-video-cover" onClick={() => setPlay(true)}>
          {!lowData && <span className="ws-video-thumbnail">{/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" /></span>}
          <div><span className="ws-play"><Icon name="play" size={20} /></span><strong>Play video</strong><span className="ws-small">{lowData ? "Low-data mode: the video loads only when you tap." : "Streams from YouTube."}</span></div>
        </button>
      )}
    </div>
  );
}

export function PromptCopy({ topicId, prompt }: { topicId: string; prompt: string }) {
  return <CopyButton text={prompt} label="Copy prompt" variant="primary" onCopied={() => void trackTopic(topicId, "copy")} />;
}

export function CompleteToggle({ topicId, done }: { topicId: string; done: boolean }) {
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <button
      type="button"
      className={"ws-btn " + (done ? "ws-btn-secondary" : "ws-btn-primary")}
      aria-pressed={done}
      disabled={pending}
      onClick={() => start(async () => { const r = await trackTopic(topicId, "complete"); toast({ tone: r.ok ? "success" : "error", message: r.message }); })}
    >
      {pending ? <span className="ws-spinner" aria-hidden /> : <Icon name="check" size={13.5} />}{done ? "Done" : "Mark as done"}
    </button>
  );
}

/** FR-64/65: answer, see correct answers and explanations, retry. */
export function CheckQuestions({ topicId, questions, best, first, attempts }: { topicId: string; questions: CheckQuestion[]; best?: number; first?: number; attempts: number }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<CheckResult | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const complete = questions.every((q) => typeof answers[q.id] === "number");

  if (!questions.length) return <p className="ws-muted ws-small">Check questions for this topic are on their way.</p>;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await submitCheckAnswers(topicId, answers);
          if (!r.ok) toast({ tone: "error", message: r.message });
          setResult(r.ok ? r : null);
        });
      }}
    >
      {questions.map((q, qi) => {
        const r = result?.results?.find((x) => x.id === q.id);
        return (
          <fieldset key={q.id} className="ws-question ws-fieldset" disabled={Boolean(result)}>
            <legend>{qi + 1}. {q.question}</legend>
            {q.options.map((o, oi) => {
              const state = r ? (oi === r.answer ? "correct" : answers[q.id] === oi ? "wrong" : undefined) : undefined;
              return (
                <label key={oi} className="ws-option" data-result={state}>
                  <input type="radio" name={q.id} checked={answers[q.id] === oi} onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))} />
                  <span style={{ flex: 1 }}>{o}</span>
                  {state === "correct" && <Icon name="check" size={13.5} />}
                  {state === "wrong" && <Icon name="x" size={13.5} />}
                </label>
              );
            })}
            {r && <p className="ws-small" style={{ marginTop: 8, color: r.correct ? "var(--ws-green)" : "var(--ws-red-ink)" }}>{r.correct ? "Correct. " : "Not quite. "}<span className="ws-muted">{r.explanation}</span></p>}
          </fieldset>
        );
      })}
      <div className="ws-row-between ws-wrap" style={{ marginTop: 12 }}>
        <p className="ws-small ws-muted" aria-live="polite">
          {result ? <><strong style={{ color: "var(--ws-ink)" }}>{result.score}%</strong> this time. </> : null}
          {attempts > 0 || result ? `First score ${first ?? result?.score}% · best ${Math.max(best ?? 0, result?.score ?? 0)}%` : "Your first and best scores are saved."}
        </p>
        {result ? (
          <button type="button" className="ws-btn ws-btn-secondary ws-btn-sm" onClick={() => { setResult(null); setAnswers({}); }}>Try again</button>
        ) : (
          <button type="submit" className="ws-btn ws-btn-primary ws-btn-sm" disabled={!complete || pending}>{pending && <span className="ws-spinner" aria-hidden />}Check answers</button>
        )}
      </div>
    </form>
  );
}
