"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
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

export function Journey() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const phases = root.current?.querySelectorAll("[data-journey-phase]");
      phases?.forEach((phase) => {
        gsap.from(phase, {
          opacity: 0.65,
          y: 16,
          duration: 0.65,
          scrollTrigger: { trigger: phase, start: "top 95%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="journey"
      aria-labelledby="journey-title"
      className="section-spacing scroll-mt-12"
    >
      <div className="shell">
        <header className="text-center">
          <h2 id="journey-title" className="section-heading">
            From idea to demo day
          </h2>
          <p className="section-copy mx-auto mt-4">
            Eight guided milestones take you from defining the problem to
            presenting a working project.
          </p>
        </header>

        <figure className="mx-auto mt-6 w-full max-w-2xl sm:mt-8">
          <MascotVideo clip={clips.path} threshold={0.15} playThrough />
        </figure>

        <JourneyOverview />

        <div className="mt-7 space-y-9 sm:mt-9 md:space-y-11">
          {milestonePhases.map(({ title, milestones }) => (
            <div key={title} data-journey-phase>
              <h3 className="border-b border-rule pb-3 text-xl font-semibold text-signal">
                {title}
              </h3>
              <ol role="list" className="mt-4 grid gap-4 sm:grid-cols-2">
                {milestones.map(({ title, description, artifact }) => (
                  <li
                    key={title}
                    className="flex flex-col overflow-hidden rounded-2xl border border-rule bg-paper shadow-xs"
                  >
                    <div className="flex-1 px-5 py-5 sm:px-6">
                      <h4 className="text-xl leading-tight font-semibold">{title}</h4>
                      <p className="mt-2 max-w-[40ch] text-base leading-relaxed text-muted">
                        {description}
                      </p>
                    </div>
                    <dl className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border-t border-rule bg-sand/75 px-5 py-3 text-sm sm:px-6">
                      <dt className="font-semibold text-signal">You’ll make</dt>
                      <dd className="text-ink">{artifact}</dd>
                    </dl>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
