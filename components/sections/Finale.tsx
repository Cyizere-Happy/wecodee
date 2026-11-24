"use client";

import { useCallback, useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { clips } from "@/lib/media";
import { START_HREF, START_LABEL } from "@/lib/links";
import { MascotVideo } from "../MascotVideo";
import { CtaButton } from "../CtaButton";

function PaperPlane() {
  return (
    <svg aria-hidden viewBox="0 0 48 32">
      <path d="M1 15.5 47 1 19 22.5Z" fill="#D82F40" />
      <path d="M19 22.5 47 1 23 31Z" fill="#B42433" />
      <path d="m19 22.5 4 8.5 2.4-10.7Z" fill="#8E1B28" />
    </svg>
  );
}

export function Finale() {
  const root = useRef<HTMLElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      // The plane continues across the illustration after it leaves the clip.
      timeline.current = gsap
        .timeline({ paused: true })
        .fromTo(
          q("[data-finale-plane]"),
          { autoAlpha: 0, x: -260, y: 150, rotate: 18, scale: 0.6 },
          { autoAlpha: 1, x: 0, y: 0, rotate: 0, scale: 1, duration: 2, ease: "power3.out" },
          4.4,
        );
    },
    { scope: root },
  );

  const onStart = useCallback(() => {
    const tl = timeline.current;
    if (tl && tl.progress() === 0) tl.play();
  }, []);

  return (
    <section
      ref={root}
      id="start"
      aria-labelledby="finale-title"
      className="relative scroll-mt-20 overflow-x-clip pb-16 md:pb-24"
    >
      <div className="shell">
        <div className="grid items-center gap-y-8 border-y border-rule py-7 md:grid-cols-12 md:gap-x-media-gap md:py-6">
          <figure className="relative order-2 overflow-hidden md:order-1 md:col-span-7">
            <MascotVideo clip={clips.launch} threshold={0.5} onStart={onStart} />
            <span data-finale-plane className="absolute top-4 right-4 hidden w-9 lg:block">
              <PaperPlane />
            </span>
          </figure>

          <div className="order-1 md:order-2 md:col-span-5">
            <h2 id="finale-title" className="section-heading max-w-[13ch]">
              Make something yours.
            </h2>

            <div className="mt-6">
              <CtaButton href={START_HREF}>{START_LABEL}</CtaButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
