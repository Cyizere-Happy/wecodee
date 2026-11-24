"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { clips } from "@/lib/media";
import { milestonePhases } from "@/lib/milestones";
import { MascotVideo } from "../MascotVideo";

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
