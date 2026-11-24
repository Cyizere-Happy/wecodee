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

        <div className="mt-6 grid gap-y-7 lg:grid-cols-2 lg:gap-x-8">
          {milestonePhases.map(({ title, milestones }) => (
            <div key={title} data-journey-phase>
              <h3 className="text-lg font-semibold text-signal">{title}</h3>
              <ol role="list" className="mt-3 grid gap-3 sm:grid-cols-2">
                {milestones.map(({ title, artifact }) => (
                  <li
                    key={title}
                    className="rounded-xl border border-rule bg-sand/60 px-4 py-3"
                  >
                    <h4 className="text-lg leading-tight font-semibold">{title}</h4>
                    <p className="mt-1 text-base text-muted">{artifact}</p>
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
