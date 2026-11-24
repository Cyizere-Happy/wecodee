"use client";

import { illustration } from "@/lib/auth-media";
import { AuthIllustration } from "./AuthIllustration";
import { AuthLink } from "./AuthLink";

const states = {
  "400": ["Something doesn’t quite fit.", "Check your request and give it another try.", "Try again", "/"],
  "401": ["A little key is missing.", "Sign in to continue.", "Sign in", "/login"],
  "403": ["Not this door, builder.", "You don’t have permission to access this space.", "Back to your workspace", "/workspace"],
  "404": ["Well, this wasn’t on the map.", "The page you’re looking for may have moved or no longer exists.", "Back to home", "/"],
  "429": ["One thing at a time.", "Give us a moment before trying again.", "Try again", "/login"],
  "500": ["Even builders break things.", "Something went wrong on our side. Please try again.", "Try again", "/"],
  "503": ["A little maintenance break.", "WeCodee is temporarily unavailable. Please check back shortly.", "Try again", "/"],
  offline: ["Lost our connection.", "Reconnect to the internet to continue your journey.", "Try again", "/"],
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
