"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Headline } from "../Headline";
import { MilestonePath } from "../MilestonePath";

export function Journey() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      // Precise: crisp power curves and tight, even staggers.
      const tl = gsap.timeline({
        defaults: { ease: "power4.out" },
        scrollTrigger: { trigger: root.current, start: "top 68%", once: true },
      });
      tl.set(q("[data-reveal]"), { autoAlpha: 1 })
        .from(
          q("h2 [data-word]"),
          { yPercent: 115, duration: 0.85, stagger: 0.05 },
          0,
        )
        .from(
          q("[data-journey-intro]"),
          { autoAlpha: 0, y: 14, duration: 1 },
          "<0.4",
        );
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
        <div className="grid gap-y-4 md:grid-cols-12 md:items-end md:gap-x-media-gap">
          <Headline
            id="journey-title"
            className="section-heading md:col-span-7"
          >
            From idea to demo day
          </Headline>
          <p
            data-journey-intro
            className="section-copy md:col-span-5 md:col-start-8"
          >
            Eight guided milestones take you from defining the problem to
            presenting a working project.
          </p>
        </div>

        <div className="mt-8 md:mt-14">
          <MilestonePath />
        </div>
      </div>
    </section>
  );
}
