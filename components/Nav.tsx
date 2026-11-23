"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { CtaButton } from "./CtaButton";
import { START_HREF } from "@/lib/links";
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
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,box-shadow] duration-500 ease-out-expo ${
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      } ${scrolled || open ? "bg-white/95 shadow-[0_1px_0_#ECECEC]" : "bg-white/0"}`}
    >
      <nav aria-label="Primary" className="shell flex h-16 items-center justify-between">
        <Logo />

        <ul className="hidden items-center gap-6 md:flex lg:gap-8">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-[15px] font-medium text-muted transition-colors hover:text-signal"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <CtaButton href={START_HREF} size="sm">
            Start building
          </CtaButton>
        </div>

        <button
          type="button"
          className="relative -mr-2 flex size-11 items-center justify-center md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
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

      <div
        id="mobile-menu"
        hidden={!open}
        className="h-[calc(100dvh-4rem)] overflow-y-auto bg-white md:hidden"
      >
        <ul className="shell flex flex-col pt-8">
          {navLinks.map((l) => (
            <li key={l.href} className="border-b border-rule">
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-4 text-2xl font-semibold text-ink hover:text-signal"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="shell pt-10" onClick={() => setOpen(false)}>
          <CtaButton href={START_HREF}>
            Start building
          </CtaButton>
        </div>
      </div>
    </header>
  );
}
