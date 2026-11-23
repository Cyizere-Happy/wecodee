"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { milestones } from "@/lib/milestones";
import { clips } from "@/lib/media";
import { MascotVideo } from "./MascotVideo";

/** Scrolling fills the rail and marks the milestone currently in view. */
export function MilestonePath() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const items = q("[data-milestone]");

      // State handoff runs even for reduced motion; it's information, not decoration.
      items.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 58%",
          end: "bottom 58%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });

      if (prefersReducedMotion()) return;

      items.forEach((el) => {
        gsap.from(el.querySelector("[data-row-reveal]"), {
          autoAlpha: 0,
          y: 10,
          duration: 0.65,
          scrollTrigger: { trigger: el, start: "top 86%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid gap-y-8 md:grid-cols-12 md:gap-x-media-gap">
      <div className="md:col-span-7">
        <div className="md:sticky md:top-28">
          <figure>
            <MascotVideo clip={clips.path} threshold={0.5} />
          </figure>
        </div>
      </div>

      <ol role="list" className="relative md:col-span-5">
        {milestones.map((m, i) => {
          const state = i === active ? "active" : i < active ? "done" : "next";
          return (
            <li
              key={m.title}
              data-milestone
              aria-current={state === "active" ? "step" : undefined}
              className="relative pb-7 pl-7 last:pb-0 md:pb-9 md:pl-8"
            >
              {i < milestones.length - 1 && (
                <span
                  aria-hidden
                  className={`absolute top-[11px] -bottom-[11px] left-[5px] w-px transition-colors duration-300 ${
                    state === "done" ? "bg-signal" : "bg-rule"
                  }`}
                />
              )}
              <span
                aria-hidden
                className={`absolute top-[6px] left-0 size-[11px] rounded-full border transition-colors duration-300 ${
                  state === "next" ? "border-ink/35 bg-paper" : "border-signal bg-signal"
                }`}
              >
                <span
                  className={`absolute -inset-[7px] rounded-full border border-signal/40 transition-[opacity,transform] duration-700 ease-out-expo ${
                    state === "active" ? "scale-100 opacity-100" : "scale-50 opacity-0"
                  }`}
                />
              </span>

              <div data-row-reveal>
                <h3 className="text-lg leading-tight font-semibold">{m.title}</h3>
                <p className="mt-1 text-base text-muted">{m.artifact}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
