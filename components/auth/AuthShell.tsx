import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./auth.css";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell">
      <header className="auth-header shell">
        <Logo />
        <Link href="/" className="auth-back"><span aria-hidden>←</span> Back to website</Link>
      </header>
      <main className="auth-main shell">{children}</main>
    </div>
  );
}
