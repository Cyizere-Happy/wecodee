import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { betterAuth } from "better-auth";
import nodemailer from "nodemailer";
import { after } from "next/server";

function configuredAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  const url = process.env.BETTER_AUTH_URL;
  const smtp = process.env.AUTH_SMTP_URL;
  const from = process.env.AUTH_MAIL_FROM;
  if (!secret || secret.length < 32 || !url || !smtp || !from) return null;

  try {
    const origin = new URL(url);
    const mailServer = new URL(smtp);
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
    if (origin.protocol !== "https:" && !(origin.protocol === "http:" && loopback)) return null;
    if (!["smtp:", "smtps:"].includes(mailServer.protocol)) return null;
    return { secret, origin: origin.origin, mailServer, from };
  } catch {
    return null;
  }
}

async function initializeAuth(config: NonNullable<ReturnType<typeof configuredAuth>>) {
  const path = resolve(/* turbopackIgnore: true */ process.env.AUTH_DB_PATH || ".wecodee/auth.sqlite");
  mkdirSync(dirname(path), { recursive: true });
  const database = new DatabaseSync(path);
  database.exec("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;");

  const mail = config.mailServer;
  const secure = mail.protocol === "smtps:";
  const localRelay = ["localhost", "127.0.0.1", "[::1]"].includes(mail.hostname);
  const transport = nodemailer.createTransport({
    host: mail.hostname.replace(/^\[|\]$/g, ""),
    port: mail.port ? Number(mail.port) : secure ? 465 : 587,
    secure,
    requireTLS: !secure && !localRelay,
    auth: mail.username ? {
      user: decodeURIComponent(mail.username),
      pass: decodeURIComponent(mail.password),
    } : undefined,
    connectionTimeout: 12_000,
    greetingTimeout: 12_000,
    socketTimeout: 20_000,
  });

  async function sendLink(to: string, token: string, purpose: "verify" | "reset") {
    const isVerify = purpose === "verify";
    const location = new URL(isVerify ? "/verify-email" : "/reset-password", config.origin);
    location.hash = new URLSearchParams({ token }).toString();
    await transport.sendMail({
      from: config.from,
      to,
      subject: isVerify ? "Verify your WeCodee email" : "Reset your WeCodee password",
      text: (isVerify ? "Verify your email to finish setting up WeCodee." : "Use this link to choose a new WeCodee password.")
        + "\n\n" + location.href + "\n\nIf you did not request this, you can ignore this email.",
    });
  }

  const auth = betterAuth({
    appName: "WeCodee",
    baseURL: config.origin,
    secret: config.secret,
    database,
    logger: { disabled: true },
    user: {
      additionalFields: {
        // SRS §2.2 roles. Only admins change it (input: false keeps it out of sign-up and profile updates).
        role: { type: "string", required: false, defaultValue: "learner", input: false },
      },
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      requireEmailVerification: true,
      resetPasswordTokenExpiresIn: 30 * 60,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: ({ user, token }) => sendLink(user.email, token, "reset"),
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: false,
      expiresIn: 60 * 60,
      sendVerificationEmail: ({ user, token }) => sendLink(user.email, token, "verify"),
    },
    session: { expiresIn: 60 * 60 * 24 * 7 },
    rateLimit: {
      enabled: true,
      storage: "database",
      customRules: {
        "/sign-in/email": { window: 60, max: 8 },
        "/sign-up/email": { window: 60, max: 5 },
        "/send-verification-email": { window: 60, max: 3 },
        "/request-password-reset": { window: 60, max: 3 },
        "/reset-password": { window: 60, max: 5 },
      },
    },
    advanced: {
      useSecureCookies: config.origin.startsWith("https:"),
      backgroundTasks: {
        handler: (work) => after(work.catch(() => {
          console.warn("WeCodee authentication email could not be delivered.");
        })),
      },
    },
  });

  try {
    const context = await auth.$context;
    await context.runMigrations();
    return auth;
  } catch (error) {
    database.close();
    throw error;
  }
}

let authPromise: ReturnType<typeof initializeAuth> | undefined;

export function getAuth() {
  const config = configuredAuth();
  if (!config) return null;
  authPromise ??= initializeAuth(config).catch((error) => {
    authPromise = undefined;
    throw error;
  });
  return authPromise;
}

export function authUnavailable() {
  return Response.json(
    { code: "AUTH_UNAVAILABLE" },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
