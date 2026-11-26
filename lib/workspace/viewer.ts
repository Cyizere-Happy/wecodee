import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getAuth } from "@/lib/auth";
import type { Role, Viewer } from "./types";

export const PREVIEW_ROLE_COOKIE = "wc-preview-role";
export const SCENARIO_COOKIE = "wc-sample-journey";
const roles: Role[] = ["learner", "supervisor", "admin"];

/** Local development without auth settings opens a preview session instead of a 503. */
export function previewAvailable() {
  return process.env.NODE_ENV === "development";
}

function adminEmails() {
  return (process.env.WECODEE_ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}

/**
 * The signed-in person, verified on the server for every request (NFR-6).
 * Returns null when there is no verified session.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  // Everything behind a session is per-request, and the pages read the clock
  // (overdue checks, weekly stats, "today"). With Cache Components that must
  // happen after prerendering stops, so stop it here for every signed-in page.
  await connection();
  const auth = await getAuth();
  if (!auth) {
    if (!previewAvailable()) return null;
    const jar = await cookies();
    const requested = jar.get(PREVIEW_ROLE_COOKIE)?.value as Role | undefined;
    return {
      id: "preview-builder",
      name: "Ama Uwase",
      email: "preview@wecodee.local",
      role: requested && roles.includes(requested) ? requested : "learner",
      preview: true,
    };
  }

  const session = await auth.api.getSession({ headers: await headers(), query: { disableRefresh: true } });
  if (!session?.user.emailVerified) return null;
  const stored = (session.user as { role?: string }).role as Role | undefined;
  const role: Role = adminEmails().includes(session.user.email.toLowerCase())
    ? "admin"
    : stored && roles.includes(stored) ? stored : "learner";
  return { id: session.user.id, name: session.user.name, email: session.user.email, role, preview: false };
});

export async function requireViewer(next = "/learner") {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=" + encodeURIComponent(next));
  return viewer;
}

export function hasRole(viewer: Viewer, ...allowed: Role[]) {
  return allowed.includes(viewer.role);
}
