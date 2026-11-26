import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@/components/workspace/workspace.css";
import "@/components/workspace/visuals.css";
import "@/components/workspace/learning/lessons.css";
import { publicSource } from "@/lib/workspace/public";

/** Public WeCodee pages that need no sign-in: certificate checks and portfolios. */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ws" data-public="">
      <header className="ws-public-head">
        <Link href="/" className="ws-row" style={{ gap: 9, fontWeight: 650, letterSpacing: "-.02em" }} aria-label="WeCodee home">
          <Image src="/brand/sheep-mark.png" alt="" width={27} height={27} priority />
          <span>wecodee<span style={{ color: "var(--ws-red)" }}>.</span></span>
        </Link>
        <Link href="/login" className="ws-btn ws-btn-secondary ws-btn-sm">Sign in</Link>
      </header>
      {publicSource === "sample" && (
        <p className="ws-sample" role="note"><span className="ws-badge" data-tone="amber">Sample data</span><span>Records shown here are sample records until the learning backend is connected.</span></p>
      )}
      <main id="ws-main">{children}</main>
    </div>
  );
}
