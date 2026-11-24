"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { clips } from "@/lib/media";
import { milestonePhases } from "@/lib/milestones";
import { MascotVideo } from "../MascotVideo";

function JourneyOverview() {
  return (
    <svg
      role="img"
      aria-label="Plan, then build, then share"
      viewBox="0 0 280 60"
      width="280"
      height="60"
      className="mx-auto mt-1 block h-auto w-full max-w-[17.5rem] text-ink sm:mt-2"
    >
      <g
        className="text-signal"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g transform="translate(32 5)">
          <path d="M5 2h9l5 5v15H5z M14 2v5h5 M8 11h8 M8 15h8 M8 19h5" />
        </g>
        <g transform="translate(128 5)">
          <path d="m7 7-5 5 5 5 M17 7l5 5-5 5 M14 4l-4 16" />
        </g>
        <g transform="translate(224 5)">
          <path d="m2 10 20-8-6 20-5-8-9-4Z M22 2 11 14" />
        </g>
      </g>
      <path
        d="M85 17h14m-4-4 4 4-4 4 M181 17h14m-4-4 4 4-4 4"
        className="text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g fill="currentColor" fontSize="15" fontWeight="600" textAnchor="middle">
        <text x="44" y="48">Plan</text>
        <text x="140" y="48">Build</text>
        <text x="236" y="48">Share</text>
      </g>
    </svg>
  );
}

function PhaseArrow({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d={direction === "previous" ? "M13 8H3m4-4L3 8l4 4" : "M3 8h10M9 4l4 4-4 4"} />
    </svg>
  );
}

export function Journey() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const baseId = useId();
  const lastPhase = milestonePhases.length - 1;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const explorer = root.current?.querySelector("[data-journey-explorer]");
      if (!explorer) return;

      gsap.from(explorer, {
        opacity: 0.7,
        y: 16,
        duration: 0.65,
        scrollTrigger: { trigger: explorer, start: "top 95%", once: true },
      });
    },
    { scope: root },
  );

  useEffect(() => {
    ScrollTrigger.refresh();
  }, [active]);

  function handleTabKeys(event: KeyboardEvent<HTMLDivElement>) {
    let index: number;
    switch (event.key) {
      case "ArrowLeft":
        index = active === 0 ? lastPhase : active - 1;
        break;
      case "ArrowRight":
        index = active === lastPhase ? 0 : active + 1;
        break;
      case "Home":
        index = 0;
        break;
      case "End":
        index = lastPhase;
        break;
      default:
        return;
    }

    event.preventDefault();
    setActive(index);
    document.getElementById(baseId + "-tab-" + index)?.focus();
  }

  return (
    <section
      ref={root}
      id="journey"
      aria-labelledby="journey-title"
      className="section-spacing scroll-mt-12"
    >
      <div className="shell">
        <header className="grid gap-4 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-x-media-gap">
          <h2 id="journey-title" className="section-heading">
            From idea to demo day
          </h2>
          <p className="section-copy">
            Eight guided milestones take you from defining the problem to
            presenting a working project.
          </p>
        </header>

        <figure className="mx-auto mt-6 w-full max-w-2xl sm:mt-8">
          <MascotVideo clip={clips.path} threshold={0.15} playThrough />
        </figure>

        <JourneyOverview />

        <div className="mt-7 sm:mt-9" data-journey-explorer>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div
              role="tablist"
              aria-label="Journey stages"
              onKeyDown={handleTabKeys}
              className="flex flex-wrap gap-2"
            >
              {milestonePhases.map(({ label }, index) => (
                <button
                  key={label}
                  id={baseId + "-tab-" + index}
                  type="button"
                  role="tab"
                  aria-selected={active === index}
                  aria-controls={baseId + "-panel-" + index}
                  tabIndex={active === index ? 0 : -1}
                  onClick={() => setActive(index)}
                  className="inline-flex min-h-11 items-center rounded-surface border border-rule px-4 text-sm font-semibold text-ink transition-colors hover:border-signal hover:text-signal aria-selected:border-ink aria-selected:bg-ink aria-selected:text-white sm:px-6"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                aria-label="Previous stage"
                disabled={active === 0}
                onClick={() => setActive(active - 1)}
                className="grid size-11 place-items-center rounded-surface border border-rule text-ink transition-colors enabled:hover:border-signal enabled:hover:text-signal disabled:opacity-35"
              >
                <PhaseArrow direction="previous" />
              </button>
              <button
                type="button"
                aria-label="Next stage"
                disabled={active === lastPhase}
                onClick={() => setActive(active + 1)}
                className="grid size-11 place-items-center rounded-surface border border-rule text-ink transition-colors enabled:hover:border-signal enabled:hover:text-signal disabled:opacity-35"
              >
                <PhaseArrow direction="next" />
              </button>
            </div>
          </div>

          {milestonePhases.map(({ label, title, milestones }, index) => (
            <section
              key={label}
              id={baseId + "-panel-" + index}
              role="tabpanel"
              aria-labelledby={baseId + "-tab-" + index}
              hidden={active !== index}
              tabIndex={0}
              className="overflow-hidden rounded-surface border border-rule bg-paper shadow-xs"
            >
              <h3 className="border-b border-rule bg-sand/60 px-5 py-4 text-2xl font-semibold sm:px-7 sm:py-5">
                {title}
              </h3>
              <ol role="list" className="grid gap-px bg-rule sm:grid-cols-2">
                {milestones.map(({ title, description, artifact }) => (
                  <li key={title} className="flex flex-col bg-paper p-5 sm:px-7 sm:py-6">
                    <div className="flex-1">
                      <h4 className="text-xl leading-tight font-semibold">{title}</h4>
                      <p className="mt-2 max-w-[42ch] text-base leading-relaxed text-muted">
                        {description}
                      </p>
                    </div>
                    <dl className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 text-sm">
                      <dt className="font-semibold text-signal">You’ll make</dt>
                      <dd className="text-ink">{artifact}</dd>
                    </dl>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
