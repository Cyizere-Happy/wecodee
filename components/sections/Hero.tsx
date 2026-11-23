"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { clips } from "@/lib/media";
import { START_HREF } from "@/lib/links";
import { Headline } from "../Headline";
import { MascotVideo } from "../MascotVideo";
import { CtaButton } from "../CtaButton";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      // Calm and confident: one slow breath in, nothing competing with it.
      const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.15 });
      tl.set(q("[data-reveal]"), { autoAlpha: 1 })
        .from(
          q("h1 [data-word]"),
          { yPercent: 115, duration: 0.9, stagger: 0.055 },
          0,
        )
        .from(
          q("[data-hero-mascot]"),
          { autoAlpha: 0, y: 16, duration: 0.9 },
          0,
        )
        .from(
          q("[data-hero-copy] > *"),
          { autoAlpha: 0, y: 14, duration: 0.75, stagger: 0.08 },
          0.2,
        );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="top"
      aria-labelledby="hero-title"
      className="relative pt-28 pb-10 md:pt-32 md:pb-14 lg:pt-36"
    >
      <div className="shell grid items-center gap-9 md:grid-cols-12 md:gap-x-8 lg:gap-x-12">
        <div className="md:col-span-6 lg:col-span-5">
          <Headline
            as="h1"
            id="hero-title"
            className="max-w-[11ch] text-[clamp(2.875rem,5.6vw,4.75rem)] leading-[0.98] font-bold tracking-[-0.04em] text-balance"
          >
            Big ideas start small.
          </Headline>
          <div data-hero-copy className="mt-5 md:mt-7">
            <p className="section-copy max-w-[36ch]">
              Turn your first idea into real software. WeCodee guides you from
              figuring out what to build to sharing a project of your own.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 md:mt-8">
              <CtaButton href={START_HREF}>
                Start building
              </CtaButton>
              <CtaButton href="#explore" variant="secondary">
                See how it works
              </CtaButton>
            </div>
          </div>
        </div>

        <figure
          data-hero-mascot
          className="md:col-span-6 lg:col-span-7"
        >
          <MascotVideo clip={clips.hero} priority threshold={0.3} />
        </figure>
      </div>
    </section>
  );
}
