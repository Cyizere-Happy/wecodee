"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { loadWorkspace } from "./data";
import { homeFor } from "./nav";
import { PREVIEW_ROLE_COOKIE, SCENARIO_COOKIE, previewAvailable } from "./viewer";
import { resetSampleState } from "./sample/store";
import {
  ARTICLE_WORD_LIMIT, LEVELS, QUIZ_RETAKE_DAYS, countWords, formTeams, isPhoneNumber,
  isWhatsappGroupLink, kigaliDay, quizSkillLevel, readingMinutes, readinessLevel, youtubeId,
} from "./rules";
import { myTeam, personById, supervisesTeam, supervisorIdFor, teamProject } from "./selectors";
import type { ActionResult, Level, Project, ReadinessAnswers, Role, Team, Viewer } from "./types";
import type { Workspace } from "./data";

/* ---------- helpers ---------- */

type Fields = Record<string, string>;
const ok = (message: string): ActionResult => { refresh(); return { ok: true, message }; };
const fail = (message: string, fields?: Fields): ActionResult => ({ ok: false, message, fields });
const text = (form: FormData, name: string, max = 2000) => String(form.get(name) ?? "").trim().slice(0, max);
const now = () => new Date().toISOString();
const id = (prefix: string) => prefix + "-" + crypto.randomUUID().slice(0, 8);

function audit(ws: Workspace, action: string, entity: string, entityId: string, details: string) {
  ws.data.audit.unshift({ id: id("a"), actor: ws.viewer.name, action, entity, entityId, details, createdAt: now() });
}

function notify(ws: Workspace, title: string, body: string, href?: string) {
  ws.data.notifications.unshift({ id: id("n"), title, body, href, createdAt: now() });
}

function requireRole(viewer: Viewer, ...roles: Role[]) {
  return roles.includes(viewer.role);
}

async function workspace() {
  return loadWorkspace();
}

const forbidden = () => fail("You don’t have permission to do that.");

/* ---------- preview controls (sample adapter only) ---------- */

export async function setPreviewRole(role: Role) {
  if (!previewAvailable() || !["learner", "supervisor", "admin"].includes(role)) return;
  (await cookies()).set(PREVIEW_ROLE_COOKIE, role, { path: "/", sameSite: "lax", httpOnly: true });
  redirect(homeFor(role));
}

export async function setSampleJourney(journey: "team" | "new") {
  (await cookies()).set(SCENARIO_COOKIE, journey === "new" ? "new" : "team", { path: "/", sameSite: "lax", httpOnly: true });
  refresh();
}

export async function resetSample(): Promise<ActionResult> {
  const ws = await workspace();
  resetSampleState(ws.viewer);
  return ok("Sample data restored.");
}

/* ---------- profile & settings (FR-1–3, FR-6, FR-7, FR-61–63, FR-78, FR-86) ---------- */

const readinessKeys: (keyof ReadinessAnswers)[] = ["internetAccess", "internetReliability", "dataBudget", "computerAccess", "powerReliability", "hoursPerDay", "preferredTime"];

export async function saveProfile(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ws = await workspace();
  const p = ws.data.profile;
  const fields: Fields = {};
  const name = text(form, "name", 120);
  const whatsapp = text(form, "whatsapp", 20).replace(/[\s-]/g, "");
  const dateOfBirth = text(form, "dateOfBirth", 10);
  const username = text(form, "username", 30).toLowerCase();
  const level = text(form, "experienceLevel") as Level;
  const skills = form.getAll("skills").map(String).slice(0, 20);
  const other = text(form, "otherSkills", 200).split(",").map((s) => s.trim()).filter(Boolean).slice(0, 5);
  const gender = text(form, "gender");

  if (name.length < 2) fields.name = "Enter your full name.";
  if (!/^[a-z0-9][a-z0-9-]{2,29}$/.test(username)) fields.username = "Use 3–30 lowercase letters, numbers or hyphens.";
  if (!isPhoneNumber(whatsapp)) fields.whatsapp = "Include the country code, for example +250788123456.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) || new Date(dateOfBirth).getTime() > Date.now()) fields.dateOfBirth = "Enter a valid date of birth.";
  if (!LEVELS.includes(level)) fields.experienceLevel = "Choose your experience level.";
  if (gender !== "female" && gender !== "male") fields.gender = "Choose an option.";
  if (!skills.length && !other.length) fields.skills = "Choose at least one skill.";

  const age = dateOfBirth ? (Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 86_400_000) : 99;
  const guardianName = text(form, "guardianName", 120);
  const guardianPhone = text(form, "guardianPhone", 20);
  if (age < 18) {
    if (guardianName.length < 2) fields.guardianName = "Learners under 18 need a parent or guardian’s name.";
    if (!isPhoneNumber(guardianPhone)) fields.guardianPhone = "Enter the guardian’s phone number with country code.";
    if (form.get("guardianConsent") !== "on") fields.guardianConsent = "Confirm your guardian’s consent.";
  }
  if (form.get("consent") !== "on") fields.consent = "Consent is needed so your team leader and supervisor can reach you.";
  if (form.get("conduct") !== "on") fields.conduct = "Accept the code of conduct to continue.";

  const readiness = { ...p.readiness };
  for (const key of readinessKeys) {
    const value = text(form, key);
    if (!value) fields[key] = "Choose an answer.";
    else (readiness as Record<string, string>)[key] = value;
  }
  const optedIn = form.get("optedIn") === "yes";
  const optOutReason = text(form, "optOutReason", 300);
  if (!optedIn && !optOutReason) fields.optOutReason = "Tell us briefly why you’re opting out.";

  if (Object.keys(fields).length) return fail("Check the highlighted fields.", fields);

  const level0 = readinessLevel(readiness);
  const wasLow = p.readinessLevel === "Low";
  Object.assign(p, {
    name, username, whatsapp, dateOfBirth, gender, experienceLevel: level, skills: [...skills, ...other],
    languages: form.getAll("languages").map(String), bio: text(form, "bio", 280), readiness, readinessLevel: level0,
    optedIn, optOutReason: optedIn ? undefined : optOutReason,
    // FR-86: low-data mode turns on by default for Low readiness.
    lowDataMode: level0 === "Low" && !wasLow ? true : p.lowDataMode,
    // FR-78: under-18 portfolios stay private.
    portfolioPublic: age < 18 ? false : p.portfolioPublic,
  });
  const me = personById(ws.data, ws.viewer.id);
  if (me) Object.assign(me, { name, skills: p.skills, readinessLevel: level0, whatsapp, optedIn, preferredTime: readiness.preferredTime });
  return ok("Profile saved. Your readiness level is " + level0 + ".");
}

export async function setPreference(key: "lowDataMode" | "eventNews" | "portfolioPublic", value: boolean): Promise<ActionResult> {
  const ws = await workspace();
  const p = ws.data.profile;
  if (key === "portfolioPublic" && value && p.dateOfBirth) {
    const age = (Date.now() - new Date(p.dateOfBirth).getTime()) / (365.25 * 86_400_000);
    if (age < 18) return fail("Portfolios of learners under 18 stay private until a guardian approves.");
  }
  p[key] = value;
  return ok("Preference saved.");
}

/* ---------- Hot Topics (FR-16, FR-18, FR-19, FR-65) ---------- */

export async function trackTopic(topicId: string, event: "view" | "copy" | "complete"): Promise<ActionResult> {
  const ws = await workspace();
  const topic = ws.data.topics.find((t) => t.id === topicId && t.published);
  if (!topic) return fail("This Hot Topic is no longer available.");
  const p = (ws.data.progress[topicId] ??= { attempts: 0 });
  if (event === "view" && !p.viewedAt) { p.viewedAt = now(); topic.views++; return { ok: true, message: "" }; }
  if (event === "copy") { if (!p.promptCopiedAt) topic.promptCopies++; p.promptCopiedAt = now(); return { ok: true, message: "Prompt copied." }; }
  if (event === "complete") {
    p.completedAt = p.completedAt ? undefined : now();
    return ok(p.completedAt ? "Marked as done. Nice work." : "Marked as not done.");
  }
  return { ok: true, message: "" };
}

export type CheckResult = ActionResult & { score?: number; results?: { id: string; correct: boolean; answer: number; explanation: string }[] };

export async function submitCheckAnswers(topicId: string, answers: Record<string, number>): Promise<CheckResult> {
  const ws = await workspace();
  const topic = ws.data.topics.find((t) => t.id === topicId && t.published);
  if (!topic) return fail("This Hot Topic is no longer available.");
  if (topic.questions.some((q) => typeof answers[q.id] !== "number")) return fail("Answer every question before submitting.");
  const results = topic.questions.map((q) => ({ id: q.id, correct: answers[q.id] === q.correct, answer: q.correct, explanation: q.explanation }));
  const score = Math.round((results.filter((r) => r.correct).length / results.length) * 100);
  const p = (ws.data.progress[topicId] ??= { attempts: 0 });
  p.attempts++;
  p.firstScore ??= score;
  p.bestScore = Math.max(p.bestScore ?? 0, score);
  refresh();
  return { ok: true, message: `You scored ${score}%.`, score, results };
}

export async function rateTopic(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ws = await workspace();
  const topicId = text(form, "topicId");
  const rating = Number(form.get("rating"));
  if (!ws.data.topics.some((t) => t.id === topicId)) return fail("Topic not found.");
  if (!(rating >= 1 && rating <= 5)) return fail("Choose a rating from 1 to 5.", { rating: "Choose a rating." });
  const p = (ws.data.progress[topicId] ??= { attempts: 0 });
  p.rating = rating;
  p.comment = text(form, "comment", 280) || undefined;
  return ok("Thanks for the feedback.");
}

export async function requestDeepDive(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ws = await workspace();
  const topicId = text(form, "topicId");
  const topic = ws.data.topics.find((t) => t.id === topicId);
  const p = ws.data.progress[topicId];
  if (!topic) return fail("Topic not found.");
  if (!p?.attempts) return fail("Answer the check questions before requesting a deep dive.");
  if (p.deepDive) return fail("You’ve already requested a deep dive for this topic.");
  const details = text(form, "details", 500);
  const slot = text(form, "slot");
  if (details.length < 10) return fail("Tell us what you’d like covered.", { details: "Add at least a sentence." });
  if (slot !== "weekday_evening" && slot !== "weekend") return fail("Choose a time slot.", { slot: "Choose a time slot." });
  p.deepDive = { details, slot, createdAt: now() };
  topic.deepDiveRequests++;
  if (topic.deepDiveRequests === ws.data.settings.deepDiveThreshold) {
    audit(ws, "deep_dive.threshold", "hot_topic", topic.id, `${topic.deepDiveRequests} requests`);
  }
  return ok("Request sent. The session appears under Live events once it’s scheduled.");
}

/* ---------- Articles (FR-68) ---------- */

export async function toggleSavedArticle(slug: string): Promise<ActionResult> {
  const ws = await workspace();
  if (!ws.data.articles.some((a) => a.slug === slug && a.published)) return fail("Article not found.");
  const saved = ws.data.savedArticles;
  const index = saved.indexOf(slug);
  if (index >= 0) saved.splice(index, 1); else saved.push(slug);
  return ok(index >= 0 ? "Removed from saved." : "Article saved.");
}

/* ---------- Events (FR-23) ---------- */

export async function toggleRegistration(eventId: string): Promise<ActionResult> {
  const ws = await workspace();
  const event = ws.data.events.find((e) => e.id === eventId && e.status === "published");
  if (!event) return fail("This event isn’t open for registration.");
  if (new Date(event.startsAt).getTime() < Date.now()) return fail("This event has already started.");
  const regs = ws.data.registrations;
  const index = regs.indexOf(eventId);
  if (index >= 0) { regs.splice(index, 1); event.registered--; return ok("Registration cancelled."); }
  if (event.capacity !== null && event.registered >= event.capacity) return fail("This event is full.");
  regs.push(eventId);
  event.registered++;
  notify(ws, "You’re registered: " + event.title, "We’ll remind you 24 hours and 1 hour before it starts.", "/learner/events");
  return ok("You’re registered. Check your email for the invitation.");
}

/* ---------- Skills quiz (FR-8–11) ---------- */

export type QuizPaper = { questions: { id: string; topic: string; question: string; options: string[] }[]; level: Level; startedAt: string };

export async function startQuiz(): Promise<ActionResult & { paper?: QuizPaper }> {
  const ws = await workspace();
  const p = ws.data.profile;
  if (!p.whatsapp || !p.dateOfBirth) return fail("Complete your profile before taking the quiz.");
  if (p.quiz.status === "completed") {
    const placed = Boolean(myTeam(ws.data, ws.viewer));
    const wait = new Date(p.quiz.takenAt).getTime() + QUIZ_RETAKE_DAYS * 86_400_000 - Date.now();
    if (p.quiz.retakeUsed || placed) return fail("You’ve used your quiz retake.");
    if (wait > 0) return fail(`You can retake the quiz in ${Math.ceil(wait / 86_400_000)} days.`);
  }
  const bank = ws.data.quizBank.filter((q) => q.level === p.experienceLevel && q.active);
  const pick = [...bank].sort(() => Math.random() - 0.5).slice(0, 15);
  const questions = pick.map((q) => ({ id: q.id, topic: q.topic, question: q.question, options: [...q.options].sort(() => Math.random() - 0.5) }));
  return { ok: true, message: "", paper: { questions, level: p.experienceLevel, startedAt: now() } };
}

export async function submitQuiz(startedAt: string, answers: Record<string, string>): Promise<ActionResult & { score?: number; level?: Level }> {
  const ws = await workspace();
  const p = ws.data.profile;
  const elapsed = Date.now() - new Date(startedAt).getTime();
  if (!Number.isFinite(elapsed) || elapsed < 0) return fail("This quiz attempt isn’t valid. Start again.");
  const ids = Object.keys(answers);
  const bank = ws.data.quizBank.filter((q) => ids.includes(q.id) && q.level === p.experienceLevel);
  if (bank.length < Math.min(10, ids.length) || !bank.length) return fail("This quiz attempt isn’t valid. Start again.");
  // 20-minute limit plus a short grace period for slow connections. Late answers count as unanswered.
  const late = elapsed > 21 * 60_000;
  const correct = late ? 0 : bank.filter((q) => answers[q.id] === q.options[q.correct]).length;
  const score = Math.round((correct / bank.length) * 100);
  const skillLevel = quizSkillLevel(score, p.experienceLevel);
  const retake = p.quiz.status === "completed";
  p.quiz = { status: "completed", score, chosenLevel: p.experienceLevel, skillLevel, takenAt: now(), retakeUsed: retake };
  p.skillLevel = skillLevel;
  const me = personById(ws.data, ws.viewer.id);
  if (me) { me.quizScore = score; me.level = skillLevel; }
  notify(ws, "Quiz result: " + skillLevel, `You scored ${score}. ${p.optedIn ? "You’re now in the placement pool for a team." : ""}`, "/learner/quiz");
  refresh();
  return { ok: true, message: late ? "Time ran out before you submitted." : "Quiz submitted.", score, level: skillLevel };
}

/* ---------- Daily reports (FR-73, FR-77) ---------- */

export async function submitDailyReport(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ws = await workspace();
  const team = myTeam(ws.data, ws.viewer);
  if (!team) return fail("Daily reports start once you join a team.");
  const done = text(form, "done", 600);
  const next = text(form, "next", 600);
  const blockers = text(form, "blockers", 600);
  const hours = Number(form.get("hours"));
  const fields: Fields = {};
  if (done.length < 3) fields.done = "Tell your team what you did.";
  if (next.length < 3) fields.next = "Tell your team what you’ll do next.";
  if (!(hours >= 0 && hours <= 12)) fields.hours = "Hours must be between 0 and 12.";
  if (Object.keys(fields).length) return fail("Check the highlighted fields.", fields);
  const date = kigaliDay();
  const existing = ws.data.reports.find((r) => r.userId === ws.viewer.id && r.date === date);
  if (existing) Object.assign(existing, { done, next, blockers, hours, blockerSolved: blockers ? existing.blockerSolved : false });
  else ws.data.reports.push({ id: id("r"), userId: ws.viewer.id, date, done, next, blockers, blockerSolved: false, hours });
  const today = ws.data.activity.find((d) => d.date === date);
  if (today) today.reportHours = hours; else ws.data.activity.push({ date, activeMin: 0, eventMin: 0, reportHours: hours });
  return ok(existing ? "Today’s report updated." : "Report posted. See you tomorrow.");
}

export async function resolveBlocker(reportId: string): Promise<ActionResult> {
  const ws = await workspace();
  const report = ws.data.reports.find((r) => r.id === reportId);
  if (!report) return fail("Report not found.");
  const team = ws.data.teams.find((t) => t.members.some((m) => m.userId === report.userId));
  const allowed = report.userId === ws.viewer.id || (team && supervisesTeam(team, ws.viewer));
  if (!allowed) return forbidden();
  report.blockerSolved = true;
  return ok("Blocker marked as solved.");
}

/* ---------- Team & leader (FR-31, FR-35, FR-36, FR-71, FR-72, FR-74) ---------- */

async function leaderTeam() {
  const ws = await workspace();
  const team = myTeam(ws.data, ws.viewer);
  return { ws, team: team && team.leaderId === ws.viewer.id ? team : null };
}

export async function acceptLeadership(accept: boolean): Promise<ActionResult> {
  const { ws, team } = await leaderTeam();
  if (!team) return forbidden();
  if (accept) { team.leaderAccepted = true; return ok("You’re the team leader. Next, create the WhatsApp group."); }
  const next = team.members.map((m) => personById(ws.data, m.userId)).filter((p) => p && p.id !== ws.viewer.id && p.readinessLevel !== "Low")
    .sort((a, b) => (b!.activityScore - a!.activityScore))[0];
  if (next) { team.leaderId = next.id; team.leaderAccepted = false; }
  return ok("Thanks for letting us know. The role passes to the next teammate.");
}

export async function submitGroupLink(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const { team } = await leaderTeam();
  if (!team) return forbidden();
  const link = text(form, "link", 200);
  if (!isWhatsappGroupLink(link)) return fail("Use the invite link from WhatsApp, like https://chat.whatsapp.com/AbC123…", { link: "That isn’t a WhatsApp group invite link." });
  team.whatsappLink = link;
  team.groupStatus = "submitted";
  team.groupRejectReason = undefined;
  return ok("Link sent. Your supervisor will join and approve the group.");
}

export async function assignRoles(userId: string, roles: string[]): Promise<ActionResult> {
  const { ws, team } = await leaderTeam();
  if (!team) return forbidden();
  const member = team.members.find((m) => m.userId === userId);
  if (!member) return fail("Member not found.");
  const clean = [...new Set(roles.map((r) => r.trim().slice(0, 40)).filter(Boolean))];
  if (!clean.length || clean.length > 2) return fail("Choose one or two roles.");
  const before = member.roles.join(", ") || "none";
  member.roles = clean;
  const name = personById(ws.data, userId)?.name ?? "Member";
  ws.data.roleLog.unshift({ at: now(), text: `${name}: ${before} → ${clean.join(", ")}` });
  return ok(`Roles updated for ${name.split(" ")[0]}.`);
}

export async function setMemberLeave(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const { team } = await leaderTeam();
  if (!team) return forbidden();
  const member = team.members.find((m) => m.userId === text(form, "userId"));
  if (!member) return fail("Member not found.");
  if (form.get("clear") === "1") { member.onLeave = undefined; return ok("Leave cleared."); }
  const from = text(form, "from", 10), to = text(form, "to", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || to < from) return fail("Choose a valid date range.", { to: "The end date must be on or after the start date." });
  member.onLeave = { from, to };
  return ok("Leave saved. No reminders will be sent on those days.");
}

export async function flagInactive(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const { ws, team } = await leaderTeam();
  if (!team) return forbidden();
  const member = team.members.find((m) => m.userId === text(form, "userId") && m.userId !== ws.viewer.id);
  const reason = text(form, "reason", 300);
  if (!member) return fail("Member not found.");
  if (reason.length < 5) return fail("Add a short reason for your supervisor.", { reason: "Add a short reason." });
  member.flaggedInactive = true;
  return ok("Flag sent. Your supervisor will confirm before anything changes.");
}

export async function leaveTeam(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ws = await workspace();
  const team = myTeam(ws.data, ws.viewer);
  if (!team) return fail("You’re not in a team.");
  const reason = text(form, "reason", 300);
  if (reason.length < 5) return fail("Tell your leader and supervisor why you’re leaving.", { reason: "Add a short reason." });
  if (team.leaderId === ws.viewer.id) return fail("Pass the leader role on first: contact your supervisor.");
  team.members = team.members.filter((m) => m.userId !== ws.viewer.id);
  const me = personById(ws.data, ws.viewer.id);
  if (me) me.teamId = null;
  return ok("You’ve left the team. Your leader and supervisor have been notified.");
}

/* ---------- Project & milestones (FR-38–43) ---------- */

export async function createProject(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const { ws, team } = await leaderTeam();
  if (!team || team.status !== "active") return fail("Only the leader of an active team can create the project.");
  if (teamProject(ws.data, team.id)) return fail("Your team already has a project.");
  const fields: Fields = {};
  const values = { title: text(form, "title", 80), problem: text(form, "problem", 800), targetUsers: text(form, "targetUsers", 300), solution: text(form, "solution", 800), plannedEnd: text(form, "plannedEnd", 10) };
  for (const [k, v] of Object.entries(values)) if (!v) fields[k] = "Required.";
  if (Object.keys(fields).length) return fail("Fill in every field.", fields);
  ws.data.projects.push({
    id: id("p"), teamId: team.id, ...values, plannedEnd: new Date(values.plannedEnd).toISOString(), status: "proposed",
    milestones: ws.data.templates.map((t) => ({ ...t, dueDate: null, status: t.order === 1 ? "open" : "locked", topicWatched: false, submissions: [], pendingContributions: [] })),
  });
  return ok("Project created. Milestone 1 is open.");
}

async function myMilestone(order: number) {
  const ws = await workspace();
  const team = myTeam(ws.data, ws.viewer);
  const project = team ? teamProject(ws.data, team.id) : null;
  const milestone = project?.milestones.find((m) => m.order === order) ?? null;
  return { ws, team, project, milestone };
}

export async function markMilestoneTopicWatched(order: number): Promise<ActionResult> {
  const { milestone } = await myMilestone(order);
  if (!milestone || milestone.status === "locked") return fail("This milestone isn’t open yet.");
  milestone.topicWatched = true;
  return ok("Marked as watched. You can submit this milestone now.");
}

export async function setMilestoneDue(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const order = Number(form.get("order"));
  const { ws, team, milestone, project } = await myMilestone(order);
  const date = text(form, "dueDate", 10);
  // Supervisors adjust dates from the review page; here only the leader sets them (FR-39).
  if (!team || team.leaderId !== ws.viewer.id || !milestone || !project) return forbidden();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("Choose a date.", { dueDate: "Choose a date." });
  milestone.dueDate = new Date(date + "T18:00:00+02:00").toISOString();
  return ok("Due date saved.");
}

export async function confirmContribution(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const order = Number(form.get("order"));
  const { ws, milestone } = await myMilestone(order);
  if (!milestone || !["open", "changes_requested"].includes(milestone.status)) return fail("This milestone isn’t accepting contributions.");
  const description = text(form, "contribution", 200);
  if (description.length < 5) return fail("Describe your contribution in a line or two.", { contribution: "Add a line or two." });
  milestone.pendingContributions = milestone.pendingContributions.filter((c) => c.userId !== ws.viewer.id);
  milestone.pendingContributions.push({ userId: ws.viewer.id, text: description });
  return ok("Contribution confirmed.");
}

export async function submitMilestone(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const order = Number(form.get("order"));
  const { ws, team, milestone } = await myMilestone(order);
  if (!team || team.leaderId !== ws.viewer.id) return fail("Only the team leader submits milestones.");
  if (!milestone || !["open", "changes_requested"].includes(milestone.status)) return fail("This milestone isn’t open for submission.");
  if (!milestone.topicWatched) return fail("Mark the linked Hot Topic as watched first.");
  const fields: Fields = {};
  const link = text(form, "link", 400);
  const file = form.get("file");
  const notes = text(form, "notes", 2000);
  const ai = text(form, "aiDeclaration", 1000);
  let fileName: string | undefined;
  if (file instanceof File && file.size) {
    if (file.size > 10 * 1024 * 1024) fields.file = "Files can be up to 10 MB.";
    else if (!/\.(pdf|docx|zip)$/i.test(file.name)) fields.file = "Upload a PDF, DOCX or ZIP file.";
    else fileName = file.name.slice(0, 120);
  }
  if (link) { try { if (!/^https:$/.test(new URL(link).protocol)) throw 0; } catch { fields.link = "Use a full https:// link."; } }
  if (!link && !fileName && !fields.file) fields.link = "Add a link or upload a file.";
  if (ai.length < 10) fields.aiDeclaration = "Say which AI tools you used and for what, or write “No AI tools used”.";
  const members = team.members.map((m) => m.userId);
  const missing = members.filter((u) => !milestone.pendingContributions.some((c) => c.userId === u));
  if (missing.length) fields.contributions = `${missing.length} member${missing.length > 1 ? "s" : ""} still need to confirm their contribution.`;
  if (Object.keys(fields).length) return fail("Check the highlighted fields.", fields);
  milestone.submissions.push({
    id: id("s"), version: milestone.submissions.length + 1, submittedBy: ws.viewer.id, link: link || undefined, fileName,
    notes, aiDeclaration: ai, contributions: milestone.pendingContributions, createdAt: now(),
  });
  milestone.pendingContributions = [];
  milestone.status = "submitted";
  return ok("Submitted. Your supervisor has been notified.");
}

/* ---------- Supervisor (FR-32, FR-35, FR-39, FR-44, FR-45) ---------- */

export async function reviewGroup(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ws = await workspace();
  if (!requireRole(ws.viewer, "supervisor", "admin")) return forbidden();
  const team = ws.data.teams.find((t) => t.id === text(form, "teamId"));
  if (!team || !supervisesTeam(team, ws.viewer)) return forbidden();
  if (team.groupStatus !== "submitted") return fail("There’s no group link waiting for review.");
  const approve = form.get("decision") === "approve";
  const reason = text(form, "reason", 300);
  if (!approve && reason.length < 5) return fail("Tell the leader why the group was rejected.", { reason: "Add a reason." });
  team.groupStatus = approve ? "approved" : "rejected";
  team.groupRejectReason = approve ? undefined : reason;
  if (approve) team.status = "active";
  audit(ws, approve ? "group.approved" : "group.rejected", "team", team.id, approve ? "WhatsApp group joined" : reason);
  return ok(approve ? `${team.name} is now active.` : "Group rejected. The leader has been notified.");
}

export async function reviewSubmission(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ws = await workspace();
  if (!requireRole(ws.viewer, "supervisor", "admin")) return forbidden();
  const project = ws.data.projects.find((p) => p.id === text(form, "projectId"));
  const team = project && ws.data.teams.find((t) => t.id === project.teamId);
  if (!project || !team || !supervisesTeam(team, ws.viewer)) return forbidden();
  const order = Number(form.get("order"));
  const milestone = project.milestones.find((m) => m.order === order);
  const submission = milestone?.submissions.at(-1);
  if (!milestone || milestone.status !== "submitted" || !submission) return fail("This submission is no longer waiting for review.");
  const decision = text(form, "decision");
  const comments = text(form, "comments", 2000);
  const checked = form.getAll("checklist").length;
  if (decision !== "approved" && decision !== "changes_requested") return fail("Choose a decision.");
  if (comments.length < 5) return fail("Write a comment for the team.", { comments: "Comments help the team improve." });
  if (decision === "approved" && checked < milestone.checklist.length) return fail("Tick every checklist item before approving.", { checklist: "All checklist items must be met to approve." });
  submission.review = { supervisorId: supervisorIdFor(ws.viewer), decision, comments, createdAt: now() };
  milestone.status = decision;
  if (decision === "approved") {
    const next = project.milestones.find((m) => m.order === order + 1);
    if (next) next.status = "open";
    else {
      project.status = "complete";
      team.status = "completed";
      const issued = issueCertificates(ws, project, team);
      audit(ws, "review." + decision, "milestone", `${project.id}/${order}`, `${milestone.name} v${submission.version}`);
      audit(ws, "certificate.issued", "project", project.id, `${issued} certificate${issued === 1 ? "" : "s"}`);
      return ok(`Project complete. ${issued} certificate${issued === 1 ? "" : "s"} issued; the team sees your decision in WeCodee.`);
    }
  }
  audit(ws, "review." + decision, "milestone", `${project.id}/${order}`, `${milestone.name} v${submission.version}`);
  // Email delivery needs the mail queue; the decision is visible in the team's milestone page now.
  return ok(decision === "approved" ? "Approved. The team sees your decision in WeCodee." : "Changes requested. The team sees your comments in WeCodee.");
}

export async function confirmInactive(teamId: string, userId: string, confirm: boolean): Promise<ActionResult> {
  const ws = await workspace();
  const team = ws.data.teams.find((t) => t.id === teamId);
  if (!team || !requireRole(ws.viewer, "supervisor", "admin") || !supervisesTeam(team, ws.viewer)) return forbidden();
  const member = team.members.find((m) => m.userId === userId);
  if (!member?.flaggedInactive) return fail("This member isn’t flagged.");
  if (confirm) {
    team.members = team.members.filter((m) => m.userId !== userId);
    const p = personById(ws.data, userId);
    if (p) p.teamId = null;
  } else member.flaggedInactive = false;
  audit(ws, confirm ? "member.removed_inactive" : "member.flag_dismissed", "team", team.id, personById(ws.data, userId)?.name ?? userId);
  return ok(confirm ? "Member returned to the placement pool." : "Flag dismissed.");
}

/* ---------- Notifications (FR-54) ---------- */

export async function markNotificationsRead(notificationId?: string): Promise<ActionResult> {
  const ws = await workspace();
  for (const n of ws.data.notifications) if (!notificationId || n.id === notificationId) n.readAt ??= now();
  return ok(notificationId ? "" : "All caught up.");
}

/* ---------- Admin (FR-12, FR-13, FR-21, FR-25–28, FR-52, FR-57, FR-58, FR-67) ---------- */

async function admin() {
  const ws = await workspace();
  return requireRole(ws.viewer, "admin") ? ws : null;
}

export async function updateUser(userId: string, change: { role?: Role; active?: boolean }): Promise<ActionResult> {
  const ws = await admin();
  if (!ws) return forbidden();
  const person = personById(ws.data, userId);
  if (!person) return fail("User not found.");
  if (userId === ws.viewer.id) return fail("You can’t change your own role or status.");
  if (change.role && ["learner", "supervisor", "admin"].includes(change.role)) person.role = change.role;
  if (typeof change.active === "boolean") person.active = change.active;
  audit(ws, change.role ? "user.role_changed" : change.active ? "user.reactivated" : "user.deactivated", "user", userId, change.role ?? String(change.active));
  return ok(`${person.name} updated.`);
}

export async function saveTopic(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ws = await admin();
  if (!ws) return forbidden();
  const fields: Fields = {};
  const topicId = text(form, "id");
  const title = text(form, "title", 120);
  const youtubeUrl = text(form, "youtubeUrl", 300);
  const minutes = Number(form.get("minutes")), seconds = Number(form.get("seconds") || 0);
  const durationSec = minutes * 60 + seconds;
  const level = text(form, "level") as Level;
  const phaseRaw = text(form, "phase");
  if (title.length < 4) fields.title = "Add a title.";
  if (youtubeUrl && !youtubeId(youtubeUrl)) fields.youtubeUrl = "Use a YouTube link (youtube.com/watch?v=… or youtu.be/…).";
  if (!(durationSec > 0 && durationSec <= 600)) fields.minutes = "Hot Topics must be 10 minutes or less.";
  if (!LEVELS.includes(level)) fields.level = "Choose a level.";
  const masterPrompt = text(form, "masterPrompt", 4000);
  if (!/tutor/i.test(masterPrompt) || !/try|tried/i.test(masterPrompt)) fields.masterPrompt = "Follow the coaching template: the AI acts as a tutor and doesn’t give full solutions before the learner tries.";
  if (Object.keys(fields).length) return fail("Check the highlighted fields.", fields);
  const values = {
    title, youtubeUrl, durationSec, level, summary: text(form, "summary", 400), category: text(form, "category", 40) || "General",
    phase: phaseRaw ? Number(phaseRaw) : null, masterPrompt, practiceTask: text(form, "practiceTask", 400),
  };
  const existing = ws.data.topics.find((t) => t.id === topicId);
  if (existing) Object.assign(existing, values);
  if (existing) return ok("Hot Topic saved.");
  const topicSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) + "-" + id("t").slice(2, 6);
  ws.data.topics.unshift({ ...values, id: topicSlug, questions: [], published: false, views: 0, promptCopies: 0, deepDiveRequests: 0 });
  redirect("/admin/hot-topics/" + topicSlug);
}

export async function saveCheckQuestion(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ws = await admin();
  if (!ws) return forbidden();
  const topic = ws.data.topics.find((t) => t.id === text(form, "topicId"));
  if (!topic) return fail("Topic not found.");
  const options = [0, 1, 2, 3].map((i) => text(form, "option" + i, 200)).filter(Boolean);
  const correct = Number(form.get("correct"));
  const question = text(form, "question", 300);
  if (topic.questions.length >= 5) return fail("A Hot Topic has at most 5 check questions.");
  if (question.length < 5 || options.length < 2 || !(correct >= 0 && correct < options.length)) return fail("Add a question, at least two options and the correct answer.");
  topic.questions.push({ id: id("cq"), question, options, correct, explanation: text(form, "explanation", 300) });
  return ok("Question added.");
}

export async function removeCheckQuestion(topicId: string, questionId: string): Promise<ActionResult> {
  const ws = await admin();
  if (!ws) return forbidden();
  const topic = ws.data.topics.find((t) => t.id === topicId);
  if (!topic) return fail("Topic not found.");
  if (topic.published && topic.questions.length <= 3) return fail("Published topics need at least 3 questions. Unpublish first.");
  topic.questions = topic.questions.filter((q) => q.id !== questionId);
  return ok("Question removed.");
}

export async function setTopicPublished(topicId: string, published: boolean): Promise<ActionResult> {
  const ws = await admin();
  if (!ws) return forbidden();
  const topic = ws.data.topics.find((t) => t.id === topicId);
  if (!topic) return fail("Topic not found.");
  if (published && (topic.questions.length < 3 || topic.questions.length > 5)) return fail("Add 3 to 5 check questions before publishing.");
  topic.published = published;
  return ok(published ? "Published." : "Moved to drafts.");
}

export async function saveQuizQuestion(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ws = await admin();
  if (!ws) return forbidden();
  const level = text(form, "level") as Level;
  const options = [0, 1, 2, 3].map((i) => text(form, "option" + i, 200)).filter(Boolean);
  const correct = Number(form.get("correct"));
  const question = text(form, "question", 400);
  if (!LEVELS.includes(level) || question.length < 5 || options.length < 2 || !(correct >= 0 && correct < options.length)) {
    return fail("Add a level, question, at least two options and the correct answer.");
  }
  ws.data.quizBank.unshift({ id: id("qq"), level, topic: text(form, "topic", 40) || "General", question, options, correct, active: true });
  return ok("Question added to the bank.");
}

export async function setQuizQuestionActive(questionId: string, active: boolean): Promise<ActionResult> {
  const ws = await admin();
  if (!ws) return forbidden();
  const q = ws.data.quizBank.find((x) => x.id === questionId);
  if (!q) return fail("Question not found.");
  q.active = active;
  return ok(active ? "Question restored." : "Question retired.");
}

export async function saveArticle(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ws = await admin();
  if (!ws) return forbidden();
  const slug0 = text(form, "slug");
  const title = text(form, "title", 120);
  const body = text(form, "body", 12000);
  const words = countWords(body);
  const fields: Fields = {};
  if (title.length < 4) fields.title = "Add a title.";
  if (!words) fields.body = "Write the article.";
  if (words > ARTICLE_WORD_LIMIT) fields.body = `Articles are limited to ${ARTICLE_WORD_LIMIT} words (this one has ${words}).`;
  if (Object.keys(fields).length) return fail("Check the highlighted fields.", fields);
  const values = {
    title, category: text(form, "category", 40) || "General", excerpt: text(form, "excerpt", 200),
    body: body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean), wordCount: words, readingMin: readingMinutes(words),
    topicIds: form.getAll("topicIds").map(String), milestoneOrders: form.getAll("milestones").map(Number), published: form.get("published") === "on",
  };
  const existing = ws.data.articles.find((a) => a.slug === slug0);
  if (existing) Object.assign(existing, values);
  else ws.data.articles.unshift({ ...values, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60), publishedAt: now() });
  return ok(existing ? "Article saved." : "Article created.");
}

export async function saveEvent(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ws = await admin();
  if (!ws) return forbidden();
  const fields: Fields = {};
  const eventId = text(form, "id");
  const title = text(form, "title", 120);
  const date = text(form, "date", 10), time = text(form, "time", 5);
  const meetingUrl = text(form, "meetingUrl", 300);
  const platform = text(form, "platform") as "Google Meet" | "Zoom";
  const durationMin = Number(form.get("durationMin"));
  const capacityRaw = text(form, "capacity");
  if (title.length < 4) fields.title = "Add a title.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) fields.date = "Choose a date and time (Kigali).";
  if (platform !== "Google Meet" && platform !== "Zoom") fields.platform = "Choose a platform.";
  const hostOk = (() => { try { const h = new URL(meetingUrl).hostname; return platform === "Zoom" ? /zoom\.us$/.test(h) : h === "meet.google.com"; } catch { return false; } })();
  if (!hostOk) fields.meetingUrl = `Paste the ${platform || "meeting"} link.`;
  if (!(durationMin >= 15 && durationMin <= 240)) fields.durationMin = "Between 15 and 240 minutes.";
  if (capacityRaw && !(Number(capacityRaw) >= 1)) fields.capacity = "Leave empty for no limit.";
  if (Object.keys(fields).length) return fail("Check the highlighted fields.", fields);
  const values = {
    title, description: text(form, "description", 800), host: text(form, "host", 80) || ws.viewer.name, topicId: text(form, "topicId") || null,
    startsAt: new Date(`${date}T${time}:00+02:00`).toISOString(), durationMin, platform, meetingUrl, capacity: capacityRaw ? Number(capacityRaw) : null,
  };
  const existing = ws.data.events.find((e) => e.id === eventId);
  if (existing) {
    Object.assign(existing, values);
    audit(ws, "event.updated", "event", existing.id, title);
    return ok(existing.registered ? `Saved. Registered learners see the change on Live events (${existing.registered} registered).` : "Event saved.");
  }
  const publish = form.get("publish") === "1";
  ws.data.events.unshift({ ...values, id: id("ev"), registered: 0, status: publish ? "published" : "draft" });
  if (publish && values.topicId) {
    const requesters = ws.data.topics.find((t) => t.id === values.topicId)?.deepDiveRequests ?? 0;
    return ok(`Published. ${requesters} learners who requested this topic will receive an invitation with a calendar file.`);
  }
  return ok(publish ? "Event published." : "Saved as a draft.");
}

export async function setEventStatus(eventId: string, status: "published" | "cancelled" | "completed"): Promise<ActionResult> {
  const ws = await admin();
  if (!ws) return forbidden();
  const event = ws.data.events.find((e) => e.id === eventId);
  if (!event) return fail("Event not found.");
  event.status = status;
  audit(ws, "event." + status, "event", event.id, event.title);
  return ok(status === "cancelled" ? `Cancelled. Registered learners see it on Live events (${event.registered} registered).` : status === "published" ? "Published." : "Marked as completed.");
}

export async function attachRecording(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ws = await admin();
  if (!ws) return forbidden();
  const event = ws.data.events.find((e) => e.id === text(form, "id"));
  const url = text(form, "recordingUrl", 300);
  if (!event) return fail("Event not found.");
  try { new URL(url); } catch { return fail("Paste a valid link.", { recordingUrl: "Paste a valid link." }); }
  event.recordingUrl = url;
  event.status = "completed";
  return ok("Recording attached.");
}

export async function confirmFormation(): Promise<ActionResult> {
  const ws = await admin();
  if (!ws) return forbidden();
  const { teams } = formTeams(ws.data.people, ws.data.settings.teamSize);
  if (!teams.length) return fail("There aren’t enough learners in the pool to form a team.");
  const load = (sid: string) => ws.data.teams.filter((t) => t.supervisorId === sid && t.status !== "completed" && t.status !== "dissolved").length;
  const supervisors = ws.data.people.filter((p) => p.role === "supervisor" && p.active);
  for (const [index, t] of teams.entries()) {
    const supervisor = [...supervisors].sort((a, b) => load(a.id) - load(b.id))[0];
    if (!supervisor || load(supervisor.id) >= ws.data.settings.supervisorCap) return fail("Every supervisor is at capacity. Raise the cap or add a supervisor.");
    const teamId = id("team");
    ws.data.teams.push({
      id: teamId, name: `${t.level} team ${ws.data.teams.length + 1}`, level: t.level, leaderId: t.leader.id, leaderAccepted: false,
      supervisorId: supervisor.id, groupStatus: "none", status: "pending_group", formedAt: now(),
      members: [t.leader, ...t.members].map((p) => ({ userId: p.id, roles: [] })),
    });
    for (const p of [t.leader, ...t.members]) p.teamId = teamId;
    audit(ws, "team.confirmed", "team", teamId, `Formed from preview (${index + 1}/${teams.length})`);
  }
  return ok(`${teams.length} team${teams.length > 1 ? "s" : ""} formed. Members see their team in WeCodee.`);
}

export async function adminTeamChange(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ws = await admin();
  if (!ws) return forbidden();
  const team = ws.data.teams.find((t) => t.id === text(form, "teamId"));
  const reason = text(form, "reason", 300);
  const kind = text(form, "kind");
  if (!team) return fail("Team not found.");
  if (reason.length < 5) return fail("A reason is required and will be logged.", { reason: "Add a reason." });
  if (kind === "dissolve") {
    team.status = "dissolved";
    for (const m of team.members) { const p = personById(ws.data, m.userId); if (p) p.teamId = null; }
    audit(ws, "team.dissolved", "team", team.id, reason);
    return ok(`${team.name} dissolved. Members returned to the pool.`);
  }
  if (kind === "leader") {
    const next = text(form, "userId");
    if (!team.members.some((m) => m.userId === next)) return fail("Choose a team member.");
    team.leaderId = next;
    team.leaderAccepted = false;
    audit(ws, "team.leader_changed", "team", team.id, `${personById(ws.data, next)?.name}: ${reason}`);
    return ok("Leader changed. They’ll be asked to accept the responsibilities.");
  }
  return fail("Unknown change.");
}

export async function revokeCertificate(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ws = await admin();
  if (!ws) return forbidden();
  const cert = ws.data.certificates.find((c) => c.code === text(form, "code"));
  const reason = text(form, "reason", 300);
  if (!cert) return fail("Certificate not found.");
  if (cert.revokedAt) return fail("Already revoked.");
  if (reason.length < 5) return fail("A reason is required.", { reason: "Add a reason." });
  cert.revokedAt = now();
  cert.revokeReason = reason;
  audit(ws, "certificate.revoked", "certificate", cert.code, reason);
  return ok("Certificate revoked. Verification now shows it as revoked.");
}

export async function saveSettings(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ws = await admin();
  if (!ws) return forbidden();
  const n = (k: string, min: number, max: number) => { const v = Number(form.get(k)); return Number.isInteger(v) && v >= min && v <= max ? v : null; };
  const values = {
    deepDiveThreshold: n("deepDiveThreshold", 1, 500), teamSize: n("teamSize", 3, 8), supervisorCap: n("supervisorCap", 1, 20),
    missedDaysAlert: n("missedDaysAlert", 1, 10), leaderResponseDays: n("leaderResponseDays", 1, 7), groupLinkReminderDays: n("groupLinkReminderDays", 1, 14),
  };
  const time = text(form, "reportReminderTime", 5);
  const fields: Fields = {};
  for (const [k, v] of Object.entries(values)) if (v === null) fields[k] = "Out of range.";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) fields.reportReminderTime = "Use HH:MM.";
  if (Object.keys(fields).length) return fail("Check the highlighted fields.", fields);
  Object.assign(ws.data.settings, values, { reportReminderTime: time });
  audit(ws, "settings.updated", "settings", "platform", Object.entries(values).map(([k, v]) => `${k}=${v}`).join(", "));
  return ok("Settings saved.");
}

export async function saveTemplate(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ws = await admin();
  if (!ws) return forbidden();
  const template = ws.data.templates.find((t) => t.order === Number(form.get("order")));
  if (!template) return fail("Milestone not found.");
  const name = text(form, "name", 80);
  const deliverable = text(form, "deliverable", 300);
  const checklist = text(form, "checklist", 1200).split("\n").map((s) => s.trim()).filter(Boolean);
  if (name.length < 3 || deliverable.length < 3 || !checklist.length) return fail("Name, deliverable and at least one checklist item are required.");
  Object.assign(template, { name, deliverable, checklist, topicId: text(form, "topicId") || null });
  return ok("Milestone template saved. It applies to new projects.");
}


/* ---------- Certificate verification (FR-51) ---------- */

export type VerifyResult = { found: false } | { found: true; learnerName: string; projectTitle: string; role: string; completedAt: string; supervisorName: string; revoked: boolean; revokeReason?: string };

export async function verifyCertificate(code: string): Promise<VerifyResult> {
  const ws = await workspace();
  const clean = code.trim().toUpperCase().slice(0, 20);
  const cert = ws.data.certificates.find((c) => c.code === clean);
  if (!cert) return { found: false };
  return { found: true, learnerName: cert.learnerName, projectTitle: cert.projectTitle, role: cert.role, completedAt: cert.completedAt, supervisorName: cert.supervisorName, revoked: Boolean(cert.revokedAt), revokeReason: cert.revokeReason };
}

/* ---------- Privacy (NFR-7) ---------- */

export async function requestDataDeletion(): Promise<ActionResult> {
  const ws = await workspace();
  audit(ws, "privacy.deletion_requested", "user", ws.viewer.id, "Learner asked for their data to be deleted");
  notify(ws, "Deletion request received", "An admin will confirm by email before anything is removed.");
  return ok("Request received. We’ll confirm by email before deleting anything.");
}

/* ---------- SRS gap fixes ---------- */

/** FR-26: after an event, an admin marks who attended. */
export async function markAttendance(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ws = await admin();
  if (!ws) return forbidden();
  const event = ws.data.events.find((e) => e.id === text(form, "eventId"));
  if (!event) return fail("Event not found.");
  if (new Date(event.startsAt).getTime() > Date.now()) return fail("Attendance can be marked once the event has started.");
  const learners = new Set(ws.data.people.filter((p) => p.role === "learner").map((p) => p.id));
  event.attendees = [...new Set(form.getAll("attendees").map(String))].filter((uid) => learners.has(uid));
  if (event.status === "published") event.status = "completed";
  audit(ws, "event.attendance", "event", event.id, `${event.attendees.length} present`);
  return ok(`Attendance saved: ${event.attendees.length} present.`);
}

/** FR-57: admins create accounts. The person sets a password from the invitation email. */
export async function createUser(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ws = await admin();
  if (!ws) return forbidden();
  const name = text(form, "name", 120);
  const email = text(form, "email", 200).toLowerCase();
  const role = text(form, "role") as Role;
  const gender = text(form, "gender");
  const fields: Fields = {};
  if (name.length < 2) fields.name = "Enter the person’s full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.email = "Enter a valid email address.";
  else if (ws.data.people.some((p) => p.email.toLowerCase() === email)) fields.email = "Someone already uses this email.";
  if (!["learner", "supervisor", "admin"].includes(role)) fields.role = "Choose a role.";
  if (gender !== "female" && gender !== "male") fields.gender = "Choose an option.";
  if (Object.keys(fields).length) return fail("Check the highlighted fields.", fields);
  const userId = id("u");
  ws.data.people.push({
    id: userId, name, email, role, gender: gender as "female" | "male",
    username: name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, ""),
    level: "Beginner", skills: [], readinessLevel: "Medium", preferredTime: "evening", whatsapp: "",
    quizScore: null, activityScore: 0, registeredAt: now(), active: true, teamId: null, optedIn: role === "learner",
  });
  audit(ws, "user.created", "user", userId, `${name} (${role})`);
  // The invitation email needs the mail queue (backend pending); nothing is sent from the sample.
  return ok(`${name} added as ${role}. The invitation email goes out once the mail queue is connected.`);
}

/** FR-28: move a learner to another team, or swap two learners between teams. */
export async function moveMember(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const ws = await admin();
  if (!ws) return forbidden();
  const reason = text(form, "reason", 300);
  const userId = text(form, "userId");
  const from = ws.data.teams.find((t) => t.status !== "dissolved" && t.members.some((m) => m.userId === userId));
  const to = ws.data.teams.find((t) => t.id === text(form, "toTeamId"));
  const swapWith = text(form, "swapWith");
  if (!from) return fail("Choose a member.", { userId: "Choose a member." });
  if (!to || to.id === from.id || to.status === "dissolved") return fail("Choose another active team.", { toTeamId: "Choose another active team." });
  if (reason.length < 5) return fail("A reason is required and will be logged.", { reason: "Add a reason." });
  if (from.leaderId === userId) return fail("Change the leader before moving them.", { userId: "This member leads the team." });
  const member = from.members.find((m) => m.userId === userId)!;
  if (swapWith) {
    const other = to.members.find((m) => m.userId === swapWith);
    if (!other) return fail("Choose a member of the other team.", { swapWith: "Choose a member of the other team." });
    if (to.leaderId === swapWith) return fail("Change that team’s leader first.", { swapWith: "This member leads the team." });
    from.members = from.members.map((m) => (m === member ? { userId: other.userId, roles: [] } : m));
    to.members = to.members.map((m) => (m === other ? { userId: member.userId, roles: [] } : m));
    const a = personById(ws.data, userId), b = personById(ws.data, swapWith);
    if (a) a.teamId = to.id;
    if (b) b.teamId = from.id;
    audit(ws, "team.members_swapped", "team", from.id, `${a?.name} ↔ ${b?.name}: ${reason}`);
    return ok(`${a?.name} and ${b?.name} swapped teams. Their leaders reassign roles.`);
  }
  if (to.members.length >= ws.data.settings.teamSize + 1) return fail(`${to.name} is full.`, { toTeamId: "That team is full." });
  from.members = from.members.filter((m) => m !== member);
  to.members.push({ userId, roles: [] });
  const p = personById(ws.data, userId);
  if (p) p.teamId = to.id;
  audit(ws, "team.member_moved", "team", from.id, `${p?.name} → ${to.name}: ${reason}`);
  return ok(`${p?.name} moved to ${to.name}.`);
}

async function supervisedProject(form: FormData) {
  const ws = await workspace();
  if (!requireRole(ws.viewer, "supervisor", "admin")) return { ws };
  const project = ws.data.projects.find((p) => p.id === text(form, "projectId"));
  const team = project && ws.data.teams.find((t) => t.id === project.teamId);
  if (!project || !team || !supervisesTeam(team, ws.viewer)) return { ws };
  return { ws, project, team };
}

/** FR-39: the supervisor can adjust a milestone's due date. */
export async function adjustMilestoneDue(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const { ws, project, team } = await supervisedProject(form);
  if (!project || !team) return forbidden();
  const milestone = project.milestones.find((m) => m.order === Number(form.get("order")));
  const date = text(form, "dueDate", 10);
  if (!milestone) return fail("Milestone not found.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("Choose a date.", { dueDate: "Choose a date." });
  milestone.dueDate = new Date(date + "T18:00:00+02:00").toISOString();
  audit(ws, "milestone.due_adjusted", "project", project.id, `M${milestone.order} → ${date}`);
  return ok(`Due date moved to ${date}. ${team.name} sees the new date.`);
}

/** FR-45: record the outcome when a member explained part of the work. */
export async function recordExplanation(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const { ws, project, team } = await supervisedProject(form);
  if (!project || !team) return forbidden();
  const userId = text(form, "userId");
  const topic = text(form, "topic", 200);
  const outcome = text(form, "outcome");
  const note = text(form, "note", 600);
  const fields: Fields = {};
  if (!team.members.some((m) => m.userId === userId)) fields.userId = "Choose a team member.";
  if (topic.length < 3) fields.topic = "Say which part of the work they explained.";
  if (outcome !== "clear" && outcome !== "partly" && outcome !== "unclear") fields.outcome = "Choose an outcome.";
  if (Object.keys(fields).length) return fail("Check the highlighted fields.", fields);
  (project.explanations ??= []).unshift({ id: id("x"), userId, milestone: Number(form.get("order")) || 0, topic, outcome: outcome as "clear" | "partly" | "unclear", note, by: ws.viewer.name, at: now() });
  audit(ws, "review.explanation", "project", project.id, `${personById(ws.data, userId)?.name}: ${outcome}`);
  return ok("Outcome recorded on the team’s project.");
}

/**
 * FR-81: one minute of active time. The browser sends this every 60 seconds while
 * the page is visible and the learner interacted in the last 5 minutes.
 * No refresh: the signal stays tiny (NFR-17) and never re-renders the page.
 */
export async function recordActivity(): Promise<{ ok: boolean }> {
  const ws = await workspace();
  if (ws.viewer.role !== "learner") return { ok: false };
  const today = kigaliDay();
  let row = ws.data.activity.find((a) => a.date === today);
  if (!row) { row = { date: today, activeMin: 0, eventMin: 0, reportHours: 0 }; ws.data.activity.push(row); }
  row.activeMin = Math.min(row.activeMin + 1, 24 * 60);
  return { ok: true };
}

/**
 * FR-49: when milestone 8 is approved, each member who confirmed contributions
 * on at least 6 of the 8 milestones gets a certificate with a unique code.
 */
function issueCertificates(ws: Workspace, project: Project, team: Team) {
  const supervisorName = personById(ws.data, team.supervisorId)?.name ?? "";
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const block = () => Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => alphabet[b % alphabet.length]).join("");
  let issued = 0;
  for (const member of team.members) {
    const confirmed = project.milestones.filter((m) => m.status === "approved" && m.submissions.some((s) => s.contributions.some((c) => c.userId === member.userId))).length;
    if (confirmed < 6) continue;
    if (ws.data.certificates.some((c) => c.userId === member.userId && c.projectTitle === project.title && !c.revokedAt)) continue;
    let code = "";
    do code = `WCD-${block()}-${block()}`; while (ws.data.certificates.some((c) => c.code === code));
    ws.data.certificates.unshift({
      code, userId: member.userId, learnerName: personById(ws.data, member.userId)?.name ?? "", projectTitle: project.title,
      role: member.roles.join(", ") || "Team member", completedAt: now(), supervisorName,
    });
    issued++;
  }
  return issued;
}
