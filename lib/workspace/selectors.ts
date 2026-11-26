/**
 * Read-only views over workspace data. Permission-sensitive fields (WhatsApp
 * numbers, detailed readiness answers) are only exposed through these helpers,
 * so pages can't leak them by accident (FR-30, FR-63, NFR-6).
 */
import type { WorkspaceData } from "./data";
import type { DailyReport, Milestone, Person, Team, Viewer } from "./types";
import { kigaliDay, participationHours } from "./rules";

export function personById(data: WorkspaceData, id: string): Person | undefined {
  return data.people.find((p) => p.id === id);
}

export function myTeam(data: WorkspaceData, viewer: Viewer): Team | null {
  return data.teams.find((t) => t.status !== "dissolved" && t.members.some((m) => m.userId === viewer.id)) ?? null;
}

export function teamProject(data: WorkspaceData, teamId: string) {
  return data.projects.find((p) => p.teamId === teamId) ?? null;
}

export function isLeader(team: Team | null, viewer: Viewer) {
  return Boolean(team && team.leaderId === viewer.id);
}

/** FR-30 / NFR-6: leader, the team's supervisor, and admins. */
export function canSeeWhatsapp(team: Team, viewer: Viewer) {
  return viewer.role === "admin" || team.leaderId === viewer.id || (viewer.role === "supervisor" && supervisesTeam(team, viewer));
}

/** In the sample, a supervisor viewer stands in for the sample supervisor. */
export function supervisorIdFor(viewer: Viewer) {
  return viewer.role === "supervisor" ? "sup-aline" : viewer.id;
}

export function supervisesTeam(team: Team, viewer: Viewer) {
  return viewer.role === "admin" || team.supervisorId === supervisorIdFor(viewer);
}

export type MemberView = {
  id: string; name: string; level: Person["level"]; skills: string[]; roles: string[];
  readinessLevel: Person["readinessLevel"]; preferredTime: Person["preferredTime"];
  whatsapp: string | null; isLeader: boolean; onLeave?: { from: string; to: string }; flaggedInactive?: boolean;
};

export function memberViews(data: WorkspaceData, team: Team, viewer: Viewer): MemberView[] {
  const showPhone = canSeeWhatsapp(team, viewer);
  return team.members.map((m) => {
    const p = personById(data, m.userId);
    return {
      id: m.userId, name: p?.name ?? "Former member", level: p?.level ?? team.level, skills: p?.skills ?? [],
      roles: m.roles, readinessLevel: p?.readinessLevel ?? "Medium", preferredTime: p?.preferredTime ?? "evening",
      whatsapp: showPhone ? p?.whatsapp ?? null : null, isLeader: team.leaderId === m.userId,
      onLeave: m.onLeave, flaggedInactive: m.flaggedInactive,
    };
  });
}

export function currentMilestone(milestones: Milestone[]) {
  return milestones.find((m) => m.status !== "approved" && m.status !== "locked") ?? milestones.find((m) => m.status === "locked") ?? null;
}

export function isOverdue(m: Milestone, now = Date.now()) {
  return Boolean(m.dueDate && m.status !== "approved" && m.status !== "submitted" && m.status !== "locked" && new Date(m.dueDate).getTime() < now);
}

/** Last `count` Kigali working days, newest last. */
export function workingDays(count = 14, now = Date.now()) {
  const days: string[] = [];
  for (let offset = 0; days.length < count && offset < count * 2; offset++) {
    const t = now - offset * 86_400_000;
    const weekday = new Date(t + 2 * 3_600_000).getUTCDay();
    if (weekday !== 0 && weekday !== 6) days.unshift(kigaliDay(t));
  }
  return days;
}

export type ReportCell = "reported" | "missed" | "leave" | "today";

export function dailyReportHours(reports: readonly DailyReport[], days: readonly string[]) {
  const totals = new Map<string, number>();
  for (const { date, hours } of reports) {
    totals.set(date, (totals.get(date) ?? 0) + Math.min(12, hours));
  }
  return days.map((date) => ({ date, hours: totals.get(date) ?? 0 }));
}

export function reportGrid(team: Team, reports: DailyReport[], days: string[]) {
  const today = kigaliDay();
  return team.members.map((m) => ({
    userId: m.userId,
    cells: days.map((date): ReportCell => {
      if (m.onLeave && date >= m.onLeave.from && date <= m.onLeave.to) return "leave";
      if (reports.some((r) => r.userId === m.userId && r.date === date)) return "reported";
      return date === today ? "today" : "missed";
    }),
  }));
}

/** Consecutive missed working days, ending yesterday (FR-76). */
export function missedStreak(cells: ReportCell[]) {
  let streak = 0;
  for (let i = cells.length - 1; i >= 0; i--) {
    if (cells[i] === "today") continue;
    if (cells[i] === "missed") streak++;
    else break;
  }
  return streak;
}

export function reportStreak(reports: DailyReport[], userId: string, days = workingDays(30)) {
  const mine = new Set(reports.filter((r) => r.userId === userId).map((r) => r.date));
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (mine.has(days[i])) streak++;
    else if (days[i] !== kigaliDay()) break;
  }
  return streak;
}

export function learnerStats(data: WorkspaceData) {
  const entries = Object.values(data.progress);
  const completed = entries.filter((p) => p.completedAt).length;
  const scored = entries.filter((p) => p.bestScore !== undefined);
  const average = scored.length ? Math.round(scored.reduce((s, p) => s + (p.bestScore ?? 0), 0) / scored.length) : null;
  const weekStart = Date.now() - 7 * 86_400_000;
  const week = participationHours(data.activity.filter((d) => new Date(d.date).getTime() >= weekStart));
  const total = participationHours(data.activity);
  return { completed, average, weekHours: week.total, hours: total, badges: Math.floor(completed / 10) };
}

/** FR-66: check-score trend per category, ordered by attempt date. */
export function scoreTrend(data: WorkspaceData) {
  return data.topics
    .map((t) => ({ topic: t, progress: data.progress[t.id] }))
    .filter((x) => x.progress?.bestScore !== undefined)
    .sort((a, b) => (a.progress.viewedAt ?? "").localeCompare(b.progress.viewedAt ?? ""))
    .map((x) => ({ id: x.topic.id, title: x.topic.title, category: x.topic.category, first: x.progress.firstScore ?? 0, best: x.progress.bestScore ?? 0 }));
}

export function upcomingEvents(data: WorkspaceData, now = Date.now()) {
  return data.events
    .filter((e) => e.status === "published" && new Date(e.startsAt).getTime() > now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function profileComplete(data: WorkspaceData) {
  const p = data.profile;
  return Boolean(p.whatsapp && p.dateOfBirth && p.skills.length);
}

export function openBlockers(data: WorkspaceData, teamIds: string[]) {
  const members = new Set(data.teams.filter((t) => teamIds.includes(t.id)).flatMap((t) => t.members.map((m) => m.userId)));
  return data.reports.filter((r) => r.blockers && !r.blockerSolved && members.has(r.userId)).sort((a, b) => b.date.localeCompare(a.date));
}
