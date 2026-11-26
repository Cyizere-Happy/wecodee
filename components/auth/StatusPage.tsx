"use client";

import { illustration } from "@/lib/auth-media";
import { AuthIllustration } from "./AuthIllustration";
import { AuthLink } from "./AuthLink";

const states = {
  "400": ["Check your request.", "Review the information you entered and try again.", "Try again", "/"],
  "401": ["Sign in to continue.", "This page needs an active WeCodee session.", "Sign in", "/login"],
  "403": ["This page needs another role.", "Return to the workspace for your account.", "Back to your workspace", "/workspace"],
  "404": ["Page not found.", "The page may have moved or been removed.", "Back to home", "/"],
  "429": ["Too many attempts.", "Wait a moment before trying again.", "Try again", "/login"],
  "500": ["We couldn’t load this page.", "Try again in a moment.", "Try again", "/"],
  "503": ["WeCodee is temporarily unavailable.", "Try again in a moment.", "Try again", "/"],
  offline: ["You’re offline.", "Reconnect to the internet and try again.", "Try again", "/"],
} as const;

export type StatusCode = keyof typeof states;

export function StatusPage({ code, retry, remaining = 0 }: {
  code: StatusCode;
  retry?: () => void;
  remaining?: number;
}) {
  const [heading, detail, action, href] = states[code];
  return (
    <section className="auth-centered" aria-labelledby="auth-status-title">
      <AuthIllustration still={illustration(code)} description="The WeCodee sheep reacts to a small setback." />
      <span className="auth-code">{code === "offline" ? "Offline" : code}</span>
      <h1 id="auth-status-title" className="auth-heading"><span>{heading}</span></h1>
      <p className="auth-lead">{detail}</p>
      {retry ? (
        <button className="auth-primary" type="button" disabled={remaining > 0} onClick={retry}>
          {remaining > 0 ? "Try again in " + remaining + "s" : action}
        </button>
      ) : (
        <AuthLink href={href} className="auth-primary">{action}<span aria-hidden>→</span></AuthLink>
      )}
    </section>
  );
}

export function AuthNotice({ title, text, artwork, description, href, action }: {
  title: string;
  text: string;
  artwork: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <section className="auth-centered" aria-labelledby="auth-notice-title">
      <AuthIllustration still={illustration(artwork)} description={description} />
      <h1 id="auth-notice-title" className="auth-heading"><span>{title}</span></h1>
      <p className="auth-lead" role="status">{text}</p>
      <AuthLink href={href} className="auth-primary">{action}<span aria-hidden>→</span></AuthLink>
    </section>
  );
}
