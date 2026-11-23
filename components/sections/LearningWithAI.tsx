"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { clips } from "@/lib/media";
import { Headline } from "../Headline";
import { MascotVideo } from "../MascotVideo";
import { PromptDeck } from "../PromptDeck";

export function LearningWithAI() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top 66%", once: true },
      });
      tl.set(q("[data-reveal]"), { autoAlpha: 1 })
        .from(
          q("h2 [data-word]"),
          { yPercent: 115, duration: 0.85, stagger: 0.05 },
          0,
        )
        .from(
          q("[data-ai-copy] > *"),
          { autoAlpha: 0, y: 16, duration: 0.9, ease: "power3.out", stagger: 0.1 },
          "<0.45",
        );

      gsap.from(q("[data-ai-figure]"), {
        autoAlpha: 0,
        y: 18,
        duration: 0.85,
        scrollTrigger: { trigger: q("[data-ai-figure]")[0], start: "top 82%", once: true },
      });

      gsap.from(q("[data-ai-deck]"), {
        autoAlpha: 0,
        y: 16,
        duration: 0.7,
        scrollTrigger: { trigger: q("[data-ai-deck]")[0], start: "top 78%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="ai"
      aria-labelledby="ai-title"
      className="section-spacing scroll-mt-12"
    >
      <div className="shell">
        <div className="grid items-center gap-y-6 md:grid-cols-12">
          <div className="md:col-span-5">
            <Headline
              id="ai-title"
              className="section-heading max-w-[14ch]"
            >
              Get unstuck with AI
            </Headline>
            <div data-ai-copy className="mt-5">
              <p className="section-copy">
                Use these prompts with your AI assistant when you need a hint,
                an explanation, or feedback on a design.
              </p>
            </div>
          </div>

          <figure
            data-ai-figure
            className="md:col-span-7 md:col-start-6"
          >
            <MascotVideo clip={clips.ai} />
          </figure>
        </div>

        <div data-ai-deck className="mt-8 md:mt-10">
          <PromptDeck />
        </div>
      </div>
    </section>
  );
}
