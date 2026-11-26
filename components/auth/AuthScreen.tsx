"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authMedia, illustration } from "@/lib/auth-media";
import { authRequest, signInDestination } from "@/lib/auth-request";
import { AuthField, AuthSubmit } from "./AuthFields";
import { AuthIllustration } from "./AuthIllustration";
import { AuthText } from "./AuthText";
import { AuthLink } from "./AuthLink";
import { AuthNotice, StatusPage, type StatusCode } from "./StatusPage";
import { AuthPath } from "./AuthPath";

const copy = {
  login: {
    title: "Good to have you back.",
    lead: "Sign in to your WeCodee workspace.",
    action: "Sign in",
  },
  signup: {
    title: "Make room for your ideas.",
    lead: "Create your WeCodee account to start building.",
    action: "Create my account",
  },
  forgot: {
    title: "Lost your key?",
    lead: "Enter your account email to request a password recovery link.",
    action: "Send recovery link",
  },
  reset: {
    title: "A fresh start.",
    lead: "Choose a new password for your account.",
    action: "Reset password",
  },
} as const;
type Mode = keyof typeof copy | "verify";
type FieldErrors = Record<string, string>;
type View = "form" | "recovery" | "verify" | "verified" | "reset-done" | "invalid" | "expired";
type TokenResult = { token: string; state: "valid" | "invalid" | "expired" | "unavailable" };

const passwordNote = "Use 12 to 128 characters. A few memorable words work well.";
const emailValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
const api = "/api/auth/";

function subscribeToLink(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

function Intro({ title, lead, accentPeriod }: {
  title: string;
  lead: string;
  accentPeriod?: boolean;
}) {
  return (
    <>
      <h1 id="auth-title" className="auth-heading">
        <span><AuthText accentPeriod={accentPeriod}>{title}</AuthText></span>
      </h1>
      <p className="auth-lead"><AuthText accentPeriod={accentPeriod}>{lead}</AuthText></p>
    </>
  );
}

export function AuthLoading({ text = "Opening WeCodee…" }: { text?: string }) {
  return <p className="auth-lead" role="status">{text}</p>;
}

export function AuthLinkScreen({ mode, token }: { mode: "reset" | "verify"; token?: string }) {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    // Opening a second emailed link in the same tab can change only the fragment.
    return subscribeToLink(() => setRevision((value) => value + 1));
  }, []);

  return <AuthScreen key={revision} mode={mode} token={token} />;
}

export function AuthScreen({ mode, token: queryToken = "" }: { mode: Mode; token?: string }) {
  const router = useRouter();
  const fragmentToken = useSyncExternalStore(
    subscribeToLink,
    () => new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "",
    () => null,
  );
  const token = fragmentToken || queryToken;
  const [view, setView] = useState<View>(mode === "verify" ? "verify" : "form");
  const [checkedToken, setCheckedToken] = useState<TokenResult | null>(null);
  const [checkAttempt, retryCheck] = useState(0);
  const [status, setStatus] = useState<StatusCode | null>(null);
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [remaining, setRemaining] = useState(0);
  const submitting = useRef(false);
  const hasVerificationLink = mode === "verify" && Boolean(token);
  const isVerification = view === "verify";
  const isRecovery = view === "recovery";

  useEffect(() => {
    if (!remaining) return;
    const timer = window.setTimeout(() => setRemaining((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [remaining]);

  useEffect(() => {
    if (mode !== "reset" || !token) return;
    let current = true;
    void authRequest("/api/account/reset-token", { token }).then((error) => {
      if (!current) return;
      const state = !error ? "valid"
        : error.code === "TOKEN_EXPIRED" ? "expired"
        : error.code === "INVALID_TOKEN" ? "invalid" : "unavailable";
      setCheckedToken({ token, state });
    });
    return () => { current = false; };
  }, [mode, token, checkAttempt]);

  function showFailure(error: NonNullable<Awaited<ReturnType<typeof authRequest>>>) {
    if (error.status === 429) {
      setRemaining(error.retryAfter ?? 60);
      setStatus("429");
    } else if (error.code === "OFFLINE") {
      setStatus("offline");
    } else if (error.status >= 500) {
      setStatus(error.status === 503 ? "503" : "500");
    } else if (error.code === "NETWORK") {
      setMessage("We couldn’t reach WeCodee. Check your connection and try again.");
    } else if (error.status === 403) {
      setStatus("403");
    } else if (error.status === 401) {
      setStatus("401");
    } else if (error.status === 400 || error.status === 422) {
      setStatus("400");
    } else {
      setMessage("Something went wrong. Try again in a moment.");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || remaining > 0) return;
    const form = new FormData(event.currentTarget);
    const read = (name: string) => String(form.get(name) ?? "");
    const address = read("email").trim().toLowerCase() || email;
    const password = read("password");
    const firstName = read("firstName").trim();
    const lastName = read("lastName").trim();
    const errors: FieldErrors = {};

    if (mode !== "reset" && !(hasVerificationLink && isVerification) && !emailValid(address)) {
      errors.email = "Enter a valid email address.";
    }
    if (mode === "signup" && view === "form") {
      if (!firstName || firstName.length > 60) errors.firstName = "Enter a first name of up to 60 characters.";
      if (!lastName || lastName.length > 60) errors.lastName = "Enter a last name of up to 60 characters.";
    }
    if (view === "form" && mode === "login" && !password) errors.password = "Enter your password.";
    if (view === "form" && (mode === "signup" || mode === "reset") && (password.length < 12 || password.length > 128)) {
      errors.password = passwordNote;
    }
    if (view === "form" && mode === "reset" && password !== read("confirm")) errors.confirm = "The passwords don’t match.";
    setFields(errors);
    setMessage(Object.keys(errors).length ? "Check the highlighted fields and try again." : "");
    if (Object.keys(errors).length) {
      const firstInvalid = Array.from(event.currentTarget.elements).find(
        (field): field is HTMLInputElement => field instanceof HTMLInputElement && Object.hasOwn(errors, field.name),
      );
      firstInvalid?.focus();
      return;
    }

    submitting.current = true;
    setBusy(true);
    try {
      if (isVerification) {
        if (hasVerificationLink) {
          const error = await authRequest("/api/account/verify-email", { token });
          if (!error) {
            window.history.replaceState(null, "", "/verify-email");
            setView("verified");
          } else if (error.code === "TOKEN_EXPIRED") setView("expired");
          else if (["INVALID_TOKEN", "USER_NOT_FOUND", "EMAIL_ALREADY_VERIFIED"].includes(error.code)) setView("invalid");
          else showFailure(error);
        } else {
          const error = await authRequest(api + "send-verification-email", { email: address });
          if (!error) {
            setEmail(address);
            setRemaining(60);
            setMessage("If this address still needs verification, a new link will arrive shortly.");
          } else showFailure(error);
        }
        return;
      }

      if (isRecovery || mode === "forgot") {
        const error = await authRequest(api + "request-password-reset", { email: address });
        if (!error) {
          setEmail(address);
          setRemaining(60);
          setView("recovery");
          if (isRecovery) setMessage("If an account exists, another link will arrive shortly.");
        } else showFailure(error);
        return;
      }

      if (mode === "signup") {
        const error = await authRequest(api + "sign-up/email", {
          name: firstName + " " + lastName,
          email: address,
          password,
        });
        if (!error) {
          setEmail(address);
          setRemaining(60);
          setView("verify");
        } else showFailure(error);
        return;
      }

      if (mode === "reset") {
        const error = await authRequest(api + "reset-password", { token, newPassword: password });
        if (!error) {
          window.history.replaceState(null, "", "/reset-password");
          setView("reset-done");
        } else if (error.code === "INVALID_TOKEN") setView("invalid");
        else if (error.code === "TOKEN_EXPIRED") setView("expired");
        else showFailure(error);
        return;
      }

      const error = await authRequest(api + "sign-in/email", {
        email: address,
        password,
        rememberMe: form.get("remember") === "on",
      });
      if (!error) {
        const next = new URLSearchParams(window.location.search).get("next");
        router.replace(signInDestination(next));
      } else if (error.code === "EMAIL_NOT_VERIFIED") {
        setEmail(address);
        setView("verify");
      } else if (error.status === 401 || error.code === "INVALID_EMAIL_OR_PASSWORD") {
        setMessage("That email and password don’t match. Try again or reset your password.");
      } else {
        showFailure(error);
      }
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  if (status) {
    return <StatusPage code={status} remaining={status === "429" ? remaining : undefined} retry={
      status === "401" || status === "403" ? undefined : () => setStatus(null)
    } />;
  }

  if (view === "verified") {
    return <AuthNotice title="Email verified." text="Sign in to set up your builder profile." artwork="email-verified"
      description="The sheep smiles beside a verification symbol." href="/login" action="Sign in" />;
  }
  if (view === "reset-done") {
    return <AuthNotice title="Password updated." text="Use your new password to sign in."
      artwork="password-changed" description="The sheep holds a small security lock." href="/login" action="Back to sign in" />;
  }
  if ((mode === "reset" || mode === "verify") && fragmentToken === null && !queryToken) {
    return <AuthLoading />;
  }

  const resetCheck = mode === "reset" ? checkedToken?.token === token ? checkedToken.state : null : null;
  if (view === "invalid" || view === "expired" || (mode === "reset" && (!token || resetCheck === "invalid" || resetCheck === "expired"))) {
    const verification = mode === "verify";
    const expired = view === "expired" || resetCheck === "expired";
    const detail = expired ? "This link has expired. Let’s get you a fresh one."
      : "This link is missing, invalid, or already used. Let’s get you a fresh one.";
    return <AuthNotice title={expired ? "This link expired." : "This link can’t be used."} text={detail} artwork="expired-link"
      description="The sheep examines a red-and-white hourglass."
      href={verification ? "/verify-email?request=1" : "/forgot-password"} action="Request a new link" />;
  }
  if (mode === "reset" && resetCheck === "unavailable") {
    return <StatusPage code={navigator.onLine ? "503" : "offline"} retry={() => {
      setCheckedToken(null);
      retryCheck((attempt) => attempt + 1);
    }} />;
  }
  if (mode === "reset" && resetCheck !== "valid") {
    return <AuthLoading text="Checking your recovery link…" />;
  }

  if (isVerification || isRecovery) {
    return (
      <section className="auth-grid auth-receipt" aria-labelledby="auth-title" key={view}>
        <div className="auth-content">
          <Intro
            title={isVerification && hasVerificationLink ? "Verify your email." : "Check your inbox."}
            lead={isVerification ? hasVerificationLink ? "Confirm this address to finish setting up your account." : "Open the verification link to confirm your email."
              : "If an account exists for this email, you’ll receive a password recovery link shortly."}
          />
          <AuthPath kind={isVerification ? "account" : "recovery"} current={1} />
          {email && <span className="auth-address">{email}</span>}
          {!hasVerificationLink && <p className="auth-lead">Check your spam folder or request another link if the email hasn’t arrived.</p>}
          <form className="auth-form" onSubmit={submit} noValidate>
            {!email && !hasVerificationLink && <AuthField label="Email address" name="email" type="email" autoComplete="email" required error={fields.email} />}
            {message && <p className="auth-feedback" role="status">{message}</p>}
            <AuthSubmit busy={busy} disabled={remaining > 0}>
              {hasVerificationLink ? "Verify my email" : remaining > 0 ? "Resend in " + remaining + "s" : "Resend " + (isVerification ? "verification" : "recovery") + " link"}
            </AuthSubmit>
          </form>
          <p className="auth-alternate"><AuthLink href="/login" className="auth-link">Back to sign in</AuthLink></p>
        </div>
        {isVerification ? (
          <AuthIllustration still={illustration("verify-email")} description="The sheep holds a white envelope with a red seal." compact />
        ) : (
          <AuthIllustration {...authMedia.forgot} video={undefined} />
        )}
      </section>
    );
  }
  if (mode === "verify") return null;

  const content = copy[mode];
  const accentPeriod = mode === "login" || mode === "signup";
  return (
    <section className="auth-grid" aria-labelledby="auth-title">
      <div className="auth-content">
        <Intro title={content.title} lead={content.lead} accentPeriod={accentPeriod} />
        {mode === "signup" && <AuthPath kind="account" current={0} />}
        {(mode === "forgot" || mode === "reset") && <AuthPath kind="recovery" current={mode === "forgot" ? 0 : 2} />}
        <form className="auth-form" onSubmit={submit} noValidate>
          {mode === "signup" && (
            <div className="auth-name-row">
              <AuthField label="First name" name="firstName" autoComplete="given-name" maxLength={60} required error={fields.firstName} />
              <AuthField label="Last name" name="lastName" autoComplete="family-name" maxLength={60} required error={fields.lastName} />
            </div>
          )}
          {mode !== "reset" && (
            <AuthField label="Email address" name="email" type="email" autoComplete="email" maxLength={254} required error={fields.email} />
          )}
          {mode !== "forgot" && (
            <AuthField
              label={mode === "reset" ? "New password" : "Password"}
              name="password" password required maxLength={128}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              note={mode === "login" ? undefined : passwordNote} error={fields.password}
            />
          )}
          {mode === "reset" && (
            <AuthField label="Confirm password" name="confirm" password required autoComplete="new-password" maxLength={128} error={fields.confirm} />
          )}
          {mode === "login" && (
            <div className="auth-options">
              <label><input type="checkbox" name="remember" /> Remember me</label>
              <AuthLink href="/forgot-password" className="auth-link">Forgot password?</AuthLink>
            </div>
          )}
          {message && <p className="auth-feedback" role="alert">{message}</p>}
          <AuthSubmit busy={busy}>{content.action}</AuthSubmit>
        </form>
        <p className="auth-alternate">
          {mode === "login" ? <>New to WeCodee? <AuthLink href="/signup" className="auth-link">Create an account</AuthLink></>
            : mode === "signup" ? <>Already a builder? <AuthLink href="/login" className="auth-link">Sign in</AuthLink></>
            : <AuthLink href="/login" className="auth-link">Back to sign in</AuthLink>}
        </p>
      </div>
      <AuthIllustration {...authMedia[mode]} />
    </section>
  );
}
