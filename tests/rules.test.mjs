// Unit tests for the pure SRS rules. Runs on Node's built-in test runner
// (Node 22.18+/24 strips TypeScript types natively): `npm test`.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  countWords, formTeams, isPhoneNumber, isWhatsappGroupLink, kigaliDay, participationHours,
  quizSkillLevel, readinessLevel, readingMinutes, toCsv, youtubeId,
} from "../lib/workspace/rules.ts";

test("FR-62 readiness level", () => {
  assert.equal(readinessLevel({ computerAccess: "own", internetReliability: "always", hoursPerDay: "2_4" }), "High");
  assert.equal(readinessLevel({ computerAccess: "shared", internetReliability: "most_days", hoursPerDay: "1_2" }), "Medium");
  assert.equal(readinessLevel({ computerAccess: "phone_only", internetReliability: "always", hoursPerDay: "over_4" }), "Low");
  assert.equal(readinessLevel({ computerAccess: "own", internetReliability: "rarely", hoursPerDay: "over_4" }), "Low");
  assert.equal(readinessLevel({ computerAccess: "own", internetReliability: "always", hoursPerDay: "under_1" }), "Low");
});

test("FR-10 quiz adjusts the chosen level", () => {
  assert.equal(quizSkillLevel(39, "Intermediate"), "Beginner");
  assert.equal(quizSkillLevel(40, "Intermediate"), "Intermediate");
  assert.equal(quizSkillLevel(74, "Intermediate"), "Intermediate");
  assert.equal(quizSkillLevel(75, "Intermediate"), "Advanced");
  assert.equal(quizSkillLevel(10, "Beginner"), "Beginner");
  assert.equal(quizSkillLevel(95, "Advanced"), "Advanced");
});

test("FR-31 WhatsApp group links and FR-1 phone numbers", () => {
  assert.ok(isWhatsappGroupLink("https://chat.whatsapp.com/AbCdEf123456"));
  assert.ok(!isWhatsappGroupLink("http://chat.whatsapp.com/AbCdEf123456"));
  assert.ok(!isWhatsappGroupLink("https://wa.me/250788123456"));
  assert.ok(isPhoneNumber("+250 788 123 456"));
  assert.ok(!isPhoneNumber("0788123456"));
});

test("YouTube ids", () => {
  assert.equal(youtubeId("https://youtu.be/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(youtubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(youtubeId("https://vimeo.com/123"), null);
  assert.equal(youtubeId("not a url"), null);
});

test("FR-80 participation hours cap report hours at 12 a day", () => {
  const h = participationHours([
    { date: "2026-11-23", activeMin: 90, eventMin: 60, reportHours: 15 },
    { date: "2026-11-24", activeMin: 30, eventMin: 0, reportHours: 3 },
  ]);
  assert.deepEqual(h, { active: 2, events: 1, reports: 15, total: 18 });
});

test("FR-67 article length", () => {
  assert.equal(countWords("  one two\nthree  "), 3);
  assert.equal(readingMinutes(0), 1);
  assert.equal(readingMinutes(201), 2);
});

test("Kigali day boundary (UTC+2)", () => {
  assert.equal(kigaliDay(Date.UTC(2026, 10, 24, 22, 30)), "2026-11-25");
  assert.equal(kigaliDay(Date.UTC(2026, 10, 24, 21, 59)), "2026-11-24");
});

test("CSV escapes quotes and neutralises formulas", () => {
  assert.equal(toCsv([["a,b", 'say "hi"'], ["=SUM(A1)", -3]]), '"a,b","say ""hi"""\r\n\'=SUM(A1),-3');
});

function learner(i, over = {}) {
  return {
    id: "p" + i, name: "Learner " + i, username: "l" + i, email: `l${i}@example.org`, role: "learner",
    level: "Beginner", gender: i % 2 ? "female" : "male", skills: [["HTML"], ["PHP"], ["Figma"], ["SQL"], ["Git"]][i % 5],
    readinessLevel: ["High", "Medium", "Low"][i % 3], preferredTime: "evening", whatsapp: "", quizScore: 50 + i,
    activityScore: 40 + i, registeredAt: new Date(Date.UTC(2026, 9, 1 + i)).toISOString(), active: true, teamId: null, optedIn: true, ...over,
  };
}

test("SRS §4.1 team formation", () => {
  const pool = [
    ...Array.from({ length: 12 }, (_, i) => learner(i)),
    learner(20, { level: "Advanced" }),
    learner(21, { optedIn: false }),
    learner(22, { quizScore: null }),
    learner(23, { teamId: "team-x" }),
    learner(24, { active: false }),
  ];
  const { teams, waiting } = formTeams(pool, 5);
  assert.equal(teams.length, 2, "12 Beginners make two teams of five");
  for (const t of teams) {
    const all = [t.leader, ...t.members];
    assert.equal(all.length, 5);
    assert.notEqual(t.leader.readinessLevel, "Low", "leaders never have Low readiness");
    assert.ok(all.every((p) => p.level === t.level), "teams are single-level");
    assert.ok(t.readinessMix.Low <= 2, "at most two Low-readiness members");
  }
  const placed = new Set(teams.flatMap((t) => [t.leader, ...t.members]).map((p) => p.id));
  assert.equal(placed.size, 10, "nobody is placed twice");
  assert.deepEqual(waiting.map((p) => p.id).sort(), ["p20", ...[...Array(12).keys()].map((i) => "p" + i).filter((id) => !placed.has(id))].sort());
  for (const id of ["p21", "p22", "p23", "p24"]) assert.ok(!placed.has(id) && !waiting.some((p) => p.id === id), `${id} is not eligible`);
});
