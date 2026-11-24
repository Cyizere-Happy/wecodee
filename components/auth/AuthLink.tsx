"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AuthLink({ href, children, className }: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const link = useRef<HTMLAnchorElement>(null);
  const router = useRouter();

  return (
    <Link
      ref={link}
      href={href}
      className={className}
      onNavigate={(event) => {
        const screen = link.current?.closest(".auth-grid, .auth-centered");
        if (!screen?.animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        event.preventDefault();
        const exit = screen.animate(
          [{ opacity: 1 }, { opacity: 0.4 }],
          { duration: 125, easing: "ease-out", fill: "forwards" },
        );
        void exit.finished.then(() => {
          router.push(href);
          window.setTimeout(() => exit.cancel(), 200);
        }).catch(() => {});
      }}
    >
      {children}
    </Link>
  );
}
