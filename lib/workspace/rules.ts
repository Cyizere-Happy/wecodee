/**
 * Pure SRS business rules. They hold no state and run on the server and the
 * client alike, so forms can preview the same outcome the server enforces.
 */
import type { Level, Person, Readiness, ReadinessAnswers, ActivityDay, MilestoneStatus } from "./types";

export const LEVELS: Level[] = ["Beginner", "Intermediate", "Advanced"];
export const TIME_ZONE = "Africa/Kigali";

/** Request time for server-rendered pages (kept in one place so it can be faked in tests). */
export function nowMs() {
  return Date.now();
}

/** FR-62. */
export function readinessLevel(a: Pick<ReadinessAnswers, "computerAccess" | "internetReliability" | "hoursPerDay">): Readiness {
  if (a.computerAccess === "phone_only" || a.internetReliability === "rarely" || a.hoursPerDay === "under_1") return "Low";
  const reliable = a.internetReliability === "always" || a.internetReliability === "most_days";
  const time = a.hoursPerDay === "2_4" || a.hoursPerDay === "over_4";
  if (a.computerAccess === "own" && reliable && time) return "High";
  return "Medium";
}

/** FR-10: below 40 drops a level, 40–74 confirms, 75+ raises (where possible). */
export function quizSkillLevel(score: number, chosen: Level): Level {
  const index = LEVELS.indexOf(chosen);
  if (score < 40) return LEVELS[Math.max(0, index - 1)];
  if (score >= 75) return LEVELS[Math.min(LEVELS.length - 1, index + 1)];
  return chosen;
}

export const QUIZ_MINUTES = 20;
export const QUIZ_RETAKE_DAYS = 7;

/** FR-31. */
export function isWhatsappGroupLink(value: string) {
  return /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{10,40}\/?$/.test(value.trim());
}

/** FR-1: WhatsApp number with country code, e.g. +250788123456. */
export function isPhoneNumber(value: string) {
  return /^\+[1-9]\d{7,14}$/.test(value.replace(/[\s-]/g, ""));
}

export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.endsWith("youtube.com") || u.hostname.endsWith("youtube-nocookie.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const match = u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{6,})/);
      return match?.[1] ?? null;
    }
  } catch {}
  return null;
}

/** FR-80: active + event time + daily-report hours capped at 12 a day. */
export function participationHours(days: ActivityDay[]) {
  let active = 0, events = 0, reports = 0;
  for (const day of days) {
    active += day.activeMin / 60;
    events += day.eventMin / 60;
    reports += Math.min(12, day.reportHours);
  }
  const round = (n: number) => Math.round(n * 10) / 10;
  return { active: round(active), events: round(events), reports: round(reports), total: round(active + events + reports) };
}

/** FR-67: about 200 words a minute; bodies are capped at 1,000 words. */
export const ARTICLE_WORD_LIMIT = 1000;
export function readingMinutes(words: number) {
  return Math.max(1, Math.ceil(words / 200));
}
export function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** FR-49. */
export const CERTIFICATE_MIN_MILESTONES = 6;

export const TEAM_ROLES = [
  "Project manager", "Front-end developer", "Back-end developer", "UI/UX designer",
  "Tester", "Documentation lead", "DevOps",
] as const;

export const SKILL_CATEGORIES: Record<string, string> = {
  React: "front end", HTML: "front end", CSS: "front end", JavaScript: "front end", TypeScript: "front end",
  PHP: "back end", Laravel: "back end", "Node.js": "back end", Python: "back end", SQL: "data", MySQL: "data",
  Flutter: "mobile", Kotlin: "mobile", "React Native": "mobile",
  "Data analysis": "data", Figma: "design/UI", "UI design": "design/UI", Docker: "DevOps", Git: "DevOps", Linux: "DevOps",
};

export const milestoneStatusLabel: Record<MilestoneStatus, string> = {
  locked: "Locked",
  open: "Open",
  submitted: "In review",
  changes_requested: "Changes requested",
  approved: "Approved",
};

/* ---------- Team formation (SRS §4.1, FR-27, FR-70) ---------- */

export type FormationTeam = {
  level: Level;
  leader: Person;
  members: Person[];
  readinessMix: Record<Readiness, number>;
  genderMix: { female: number; male: number };
  skillCategories: string[];
};

export type FormationResult = { teams: FormationTeam[]; waiting: Person[] };

function categories(people: Person[]) {
  return new Set(people.flatMap((p) => p.skills.map((s) => SKILL_CATEGORIES[s]).filter(Boolean)));
}

export function leaderScore(p: Person) {
  const skills = Math.min(100, (p.quizScore ?? 0) + 2 * p.skills.length);
  return 0.6 * skills + 0.4 * p.activityScore;
}

/**
 * Forms teams of `size` from the placement pool: group by level, pick leaders
 * (High or Medium readiness, best leader score), then add members one at a time,
 * preferring candidates that keep gender and readiness balance and bring the
 * most missing skill categories.
 */
export function formTeams(pool: Person[], size = 5): FormationResult {
  const eligible = pool.filter((p) => p.active && p.optedIn && !p.teamId && p.quizScore !== null && p.role === "learner");
  const teams: FormationTeam[] = [];
  const waiting: Person[] = [];

  for (const level of LEVELS) {
    const group = eligible.filter((p) => p.level === level);
    const teamCount = Math.floor(group.length / size);
    if (!teamCount) { waiting.push(...group); continue; }

    const ranked = [...group].sort((a, b) => leaderScore(b) - leaderScore(a) || a.registeredAt.localeCompare(b.registeredAt));
    const leaders = ranked.filter((p) => p.readinessLevel !== "Low").slice(0, teamCount);
    const remaining = group.filter((p) => !leaders.includes(p));
    const built = leaders.map((leader) => [leader]);

    for (let slot = 1; slot < size; slot++) {
      for (const team of built) {
        if (!remaining.length) break;
        let best = -1, bestScore = -Infinity;
        remaining.forEach((candidate, index) => {
          const next = [...team, candidate];
          const women = next.filter((p) => p.gender === "female").length;
          const men = next.length - women;
          const low = next.filter((p) => p.readinessLevel === "Low").length;
          const high = next.filter((p) => p.readinessLevel === "High").length;
          let score = 0;
          if (low > 2) score -= 100;
          if (high < 2 && candidate.readinessLevel === "High") score += 20;
          if (Math.min(women, men) < 2 && (candidate.gender === "female" ? women <= men : men <= women)) score += 30;
          const missing = [...categories([candidate])].filter((c) => !categories(team).has(c)).length;
          score += missing * 8;
          if (candidate.preferredTime === team[0].preferredTime) score += 6;
          score += leaderScore(candidate) / 50;
          if (score > bestScore) { bestScore = score; best = index; }
        });
        team.push(remaining.splice(best, 1)[0]);
      }
    }
    waiting.push(...remaining);

    for (const [leader, ...members] of built) {
      const all = [leader, ...members];
      teams.push({
        level,
        leader,
        members,
        readinessMix: {
          High: all.filter((p) => p.readinessLevel === "High").length,
          Medium: all.filter((p) => p.readinessLevel === "Medium").length,
          Low: all.filter((p) => p.readinessLevel === "Low").length,
        },
        genderMix: { female: all.filter((p) => p.gender === "female").length, male: all.filter((p) => p.gender === "male").length },
        skillCategories: [...categories(all)],
      });
    }
  }
  return { teams, waiting };
}

/* ---------- Formatting ---------- */

export function formatDate(iso: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, ...options }).format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return formatDate(iso, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function relativeDays(iso: string, now = Date.now()) {
  const days = Math.round((new Date(iso).getTime() - now) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  return days > 0 ? `in ${days} days` : `${-days} days ago`;
}

/** YYYY-MM-DD in Kigali time. */
export function kigaliDay(date: Date | number = Date.now()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

/** CSV for spreadsheets. Text a spreadsheet would run as a formula gets a leading ' (CSV injection). */
export function toCsv(rows: (string | number)[][]) {
  return rows
    .map((row) => row.map((cell) => {
      let text = String(cell);
      if (typeof cell === "string" && /^[=+\-@\t\r]/.test(text)) text = "'" + text;
      return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    }).join(","))
    .join("\r\n");
}

export function minutes(seconds: number) {
  return `${Math.round(seconds / 60)} min`;
}
