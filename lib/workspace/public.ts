import "server-only";
import { seed } from "./sample/seed";
import type { Certificate, Person, Project } from "./types";

/**
 * Read-only data for visitors who aren't signed in (FR-48, FR-51, FR-78).
 *
 * Sample adapter: a fixed copy of the sample directory, independent of any
 * signed-in person's in-memory changes. The production adapter reads the same
 * records from the learning database. Only fields meant for the public leave
 * this module: never emails, WhatsApp numbers or readiness answers.
 */
const directory = seed({ id: "visitor", name: "Visitor", email: "", role: "learner", preview: false }, "team");

export const publicSource: "sample" | "live" = "sample";

export type PublicCertificate = Pick<Certificate, "code" | "learnerName" | "projectTitle" | "role" | "completedAt" | "supervisorName" | "revokedAt" | "revokeReason">;

export function findCertificate(code: string): PublicCertificate | null {
  const clean = code.trim().toUpperCase().slice(0, 20);
  const cert = directory.certificates.find((c) => c.code === clean);
  if (!cert) return null;
  const { code: c, learnerName, projectTitle, role, completedAt, supervisorName, revokedAt, revokeReason } = cert;
  return { code: c, learnerName, projectTitle, role, completedAt, supervisorName, revokedAt, revokeReason };
}

export type PublicPortfolio = {
  name: string;
  username: string;
  level: Person["level"];
  skills: string[];
  memberSince: string;
  projects: (Pick<Project, "title" | "solution" | "status"> & { roles: string[]; team: string })[];
  certificates: PublicCertificate[];
};

/** Returns null for unknown and private portfolios alike, so a private page's existence isn't revealed. */
export function findPortfolio(username: string): PublicPortfolio | null {
  const person = directory.people.find((p) => p.role === "learner" && p.active && p.username === username.toLowerCase());
  if (!person?.portfolioPublic) return null;
  const team = directory.teams.find((t) => t.id === person.teamId && t.status !== "dissolved");
  const project = team && directory.projects.find((p) => p.teamId === team.id);
  return {
    name: person.name,
    username: person.username,
    level: person.level,
    skills: person.skills,
    memberSince: person.registeredAt,
    projects: project && team ? [{ title: project.title, solution: project.solution, status: project.status, roles: team.members.find((m) => m.userId === person.id)?.roles ?? [], team: team.name }] : [],
    certificates: directory.certificates.filter((c) => c.userId === person.id && !c.revokedAt).map((c) => findCertificate(c.code)!),
  };
}

export function publicPortfolios() {
  return directory.people.filter((p) => p.role === "learner" && p.active && p.portfolioPublic).map((p) => p.username);
}
