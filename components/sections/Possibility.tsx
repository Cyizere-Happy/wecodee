"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { clips } from "@/lib/media";
import { Headline } from "../Headline";
import { MascotVideo } from "../MascotVideo";

export function Possibility() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top 68%", once: true },
      });
      tl.set(q("[data-reveal]"), { autoAlpha: 1 })
        .from(
          q("h2 [data-word]"),
          { yPercent: 115, duration: 0.85, stagger: 0.05 },
          0,
        )
        .from(
          q("[data-possibility-copy] > *"),
          { autoAlpha: 0, y: 14, duration: 1.1, stagger: 0.1 },
          "<0.4",
        );

      gsap.from(q("[data-possibility-figure]"), {
        autoAlpha: 0,
        x: -28,
        duration: 1.6,
        scrollTrigger: { trigger: q("[data-possibility-figure]")[0], start: "top 80%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="explore"
      aria-labelledby="possibility-title"
      className="section-spacing scroll-mt-12"
    >
      <div className="shell grid items-center gap-y-7 md:grid-cols-12">
        <figure
          data-possibility-figure
          className="order-2 md:order-1 md:col-span-7"
        >
          <MascotVideo clip={clips.idea} />
        </figure>

        <div className="order-1 md:order-2 md:col-span-5 md:col-start-8">
          <Headline
            id="possibility-title"
            className="section-heading max-w-[16ch]"
          >
            Start with a problem you care about.
          </Headline>
          <div data-possibility-copy className="mt-5">
            <p className="section-copy">
              Talk to the people who face it, sketch a solution, and build
              something they can actually use.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
