"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { CtaButton } from "./CtaButton";
import { START_HREF, START_LABEL } from "@/lib/links";
import { navLinks } from "./navLinks";
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        // Step aside while reading downward, return on any upward intent.
        setHidden(y > 480 && y > last + 4);
        if (y < last - 4 || y <= 480) setHidden(false);
        last = y;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pt-3 transition-transform duration-500 ease-out-expo focus-within:translate-y-0 ${
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="shell relative">
        <nav
          aria-label="Primary"
          className={`flex min-h-14 items-center justify-between gap-2 rounded-full border border-rule bg-white px-3 sm:px-4 ${
            scrolled ? "shadow-sm" : "shadow-xs"
          }`}
        >
          <Logo />

          <ul className="hidden items-center md:flex lg:gap-2">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="inline-flex min-h-10 items-center rounded-surface px-3 text-sm font-medium text-muted transition-colors hover:bg-sand hover:text-ink"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <CtaButton href={START_HREF} size="sm">
              {START_LABEL}
            </CtaButton>
          </div>

          <button
            type="button"
            className="relative flex size-11 items-center justify-center rounded-surface hover:bg-sand md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span
              aria-hidden
              className={`absolute h-[1.5px] w-5 bg-ink transition-transform duration-500 ease-out-expo ${
                open ? "rotate-45" : "-translate-y-[4px]"
              }`}
            />
            <span
              aria-hidden
              className={`absolute h-[1.5px] w-5 bg-ink transition-transform duration-500 ease-out-expo ${
                open ? "-rotate-45" : "translate-y-[4px]"
              }`}
            />
          </button>
        </nav>

        <nav
          id="mobile-menu"
          aria-label="Mobile"
          hidden={!open}
          className="absolute inset-x-[var(--gutter)] top-full mt-2 max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-surface border border-rule bg-white p-4 shadow-sm md:hidden"
        >
          <ul>
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block rounded-surface px-2 py-3 text-base font-semibold text-ink hover:bg-sand"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <CtaButton href={START_HREF}>
              {START_LABEL}
            </CtaButton>
          </div>
        </nav>
      </div>
    </header>
  );
}
