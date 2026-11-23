"use client";

import { useEffect, useId, useRef, useState } from "react";

const prompts = [
  {
    situation: "Decode an error",
    text: "I got this error: [paste error]. Don't fix it. Explain it simply and give me one hint.",
  },
  {
    situation: "Learn a concept",
    text: "Explain [concept] with one everyday analogy, then quiz me with one question.",
  },
  {
    situation: "Check a design",
    text: "Here's my design for [project]. What's most likely to break first, and why?",
  },
];

/** Renders [placeholders] as soft red fields the student fills in. */
function PromptText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/g).map((part, i) =>
        part.startsWith("[") ? (
          <span
            key={i}
            className="rounded-[4px] bg-signal/[0.08] px-1 text-signal [box-decoration-break:clone]"
          >
            {part.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/** Example prompts students can copy into their AI assistant. */
export function PromptDeck() {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const baseId = useId();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompts[active].text);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const select = (i: number) => {
    setActive(i);
    setCopied(false);
  };

  return (
    <div className="grid overflow-hidden rounded-2xl border border-rule md:grid-cols-[minmax(12rem,1fr)_2.4fr]">
      <div
        role="tablist"
        aria-label="Guided prompts"
        aria-orientation="vertical"
        className="space-y-1 border-b border-rule p-3 md:border-r md:border-b-0 md:p-4"
        onKeyDown={(e) => {
          if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
          e.preventDefault();
          const next =
            (active + (e.key === "ArrowDown" ? 1 : -1) + prompts.length) % prompts.length;
          select(next);
          document.getElementById(`${baseId}-tab-${next}`)?.focus();
        }}
      >
        {prompts.map((p, i) => {
          const on = i === active;
          return (
            <button
              key={p.situation}
              id={`${baseId}-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls={`${baseId}-panel`}
              tabIndex={on ? 0 : -1}
              onClick={() => select(i)}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-base font-semibold transition-colors focus-visible:outline-offset-0 ${
                on ? "bg-blush text-signal" : "text-ink hover:bg-sand"
              }`}
            >
              {p.situation}
            </button>
          );
        })}
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        className="grid bg-sand p-5 sm:p-7 md:p-8"
      >
        <p className="min-h-[4.35em] max-w-[43ch] text-[clamp(1.0625rem,1.8vw,1.25rem)] leading-[1.45]">
          <PromptText text={prompts[active].text} />
        </p>
        <button
          type="button"
          onClick={copy}
          className="mt-5 min-h-10 justify-self-start rounded-lg border border-rule bg-white px-4 text-sm font-semibold text-ink transition-colors hover:border-signal hover:text-signal"
        >
          {copied ? "Copied" : "Copy prompt"}
        </button>
        <p className="sr-only" aria-live="polite">
          {copied ? "Prompt copied to clipboard" : ""}
        </p>
      </div>
    </div>
  );
}
