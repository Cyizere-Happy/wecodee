"use client";

import Link from "next/link";
import { useState } from "react";
import { authRequest } from "@/lib/auth-request";
import { illustration } from "@/lib/auth-media";
import { AuthIllustration } from "./AuthIllustration";

export function WorkspaceWelcome({ name }: { name: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function signOut() {
    setBusy(true);
    setMessage("");
    const error = await authRequest("/api/auth/sign-out", {});
    if (!error) {
      window.location.replace("/login");
      return;
    }
    setMessage("We couldn’t sign you out. Please try again.");
    setBusy(false);
  }

  return (
    <section className="auth-centered" aria-labelledby="workspace-title">
      <AuthIllustration still={illustration("account-created")} description="The WeCodee sheep holds a small red builder’s badge." />
      <h1 id="workspace-title" className="auth-heading"><span>Hello, builder.</span></h1>
      <p className="auth-lead">This is where it all begins, {name}.</p>
      <p className="auth-lead">Explore the milestones for your first project.</p>
      {message && <p role="alert" className="auth-feedback">{message}</p>}
      <div className="auth-actions">
        <Link href="/#journey" className="auth-primary">Explore milestones <span aria-hidden>→</span></Link>
        <button type="button" className="auth-secondary" disabled={busy} onClick={signOut}>
          {busy ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </section>
  );
}
