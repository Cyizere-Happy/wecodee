/**
 * SAMPLE STATE — builds a believable workspace around the signed-in person so
 * every page can be exercised before the learning backend exists. Dates are
 * relative to "now" so the sample never looks stale.
 */
import type {
  ActivityDay, AuditEntry, Certificate, DailyReport, LiveEvent, Milestone, Notification, Person,
  PlatformSettings, Profile, Project, Team, TopicProgress, Viewer,
} from "../types";
import { kigaliDay, readinessLevel } from "../rules";
import { sampleArticles, sampleMilestoneTemplates, sampleQuizBank, sampleTopics } from "./content";

export type Scenario = "team" | "new";

export type SampleState = {
  scenario: Scenario;
  profile: Profile;
  people: Person[];
  topics: typeof sampleTopics;
  progress: Record<string, TopicProgress>;
  articles: typeof sampleArticles;
  savedArticles: string[];
  events: LiveEvent[];
  registrations: string[];
  attended: string[];
  quizBank: typeof sampleQuizBank;
  teams: Team[];
  projects: Project[];
  reports: DailyReport[];
  activity: ActivityDay[];
  certificates: Certificate[];
  notifications: Notification[];
  audit: AuditEntry[];
  settings: PlatformSettings;
  templates: typeof sampleMilestoneTemplates;
  roleLog: { at: string; text: string }[];
};

const DAY = 86_400_000;
const iso = (offsetDays: number, hour = 9) => {
  const d = new Date(Date.now() + offsetDays * DAY);
  d.setUTCHours(hour - 2, 0, 0, 0); // Kigali is UTC+2
  return d.toISOString();
};
const day = (offsetDays: number) => kigaliDay(Date.now() + offsetDays * DAY);

const SUPERVISOR = "sup-aline";
const ADMIN = "adm-eric";

function person(p: Partial<Person> & Pick<Person, "id" | "name" | "gender" | "level">): Person {
  return {
    username: p.name.toLowerCase().replace(/[^a-z]+/g, "."),
    email: p.name.toLowerCase().split(" ")[0] + "@example.org",
    role: "learner",
    skills: [],
    readinessLevel: "Medium",
    preferredTime: "evening",
    whatsapp: "+250 78" + String(1000000 + p.id.length * 7919).slice(0, 7),
    quizScore: 60,
    activityScore: 50,
    registeredAt: iso(-60),
    active: true,
    teamId: null,
    optedIn: true,
    ...p,
  };
}

function milestones(project: "mine" | "musanze" | "rubavu"): Milestone[] {
  const approvedThrough = project === "mine" ? 2 : project === "musanze" ? 3 : 1;
  return sampleMilestoneTemplates.map((t) => {
    const base: Milestone = {
      ...t, dueDate: iso(-35 + t.order * 9, 18), status: t.order <= approvedThrough ? "approved" : "locked",
      topicWatched: t.order <= approvedThrough, submissions: [], pendingContributions: [],
    };
    if (t.order <= approvedThrough) {
      base.submissions = [{
        id: `${project}-m${t.order}-v1`, version: 1, submittedBy: "leader",
        link: "https://docs.google.com/document/d/sample-" + t.order, notes: "Submitted for review.",
        aiDeclaration: "Used an AI assistant to check grammar. All content written by the team.",
        contributions: [], createdAt: iso(-40 + t.order * 9, 17),
        review: { supervisorId: SUPERVISOR, decision: "approved", comments: "Clear and complete. Approved.", createdAt: iso(-39 + t.order * 9, 11) },
      }];
    }
    return base;
  });
}

export function seed(viewer: Viewer, scenario: Scenario): SampleState {
  const me = viewer.id;
  const first = viewer.name.split(" ")[0] || "Builder";
  const isNew = scenario === "new";
  const readiness = {
    internetAccess: "mobile_data", internetReliability: "most_days", dataBudget: "500mb_1gb",
    computerAccess: "own", powerReliability: "yes", hoursPerDay: "2_4", preferredTime: "evening",
  } as const;

  const profile: Profile = {
    userId: me,
    name: viewer.name,
    username: first.toLowerCase().replace(/[^a-z0-9]/g, "") || "builder",
    bio: isNew ? "" : "Learning to build useful software for my community.",
    whatsapp: isNew ? "" : "+250788123456",
    gender: "female",
    dateOfBirth: isNew ? "" : "2006-04-12",
    experienceLevel: "Intermediate",
    skillLevel: isNew ? null : "Intermediate",
    skills: isNew ? [] : ["JavaScript", "HTML", "CSS", "Figma"],
    languages: isNew ? [] : ["JavaScript", "PHP"],
    readiness,
    readinessLevel: readinessLevel(readiness),
    lowDataMode: false,
    portfolioPublic: false,
    optedIn: true,
    eventNews: true,
    quiz: isNew ? { status: "not_started" } : { status: "completed", score: 68, chosenLevel: "Intermediate", skillLevel: "Intermediate", takenAt: iso(-30), retakeUsed: false },
    registeredAt: isNew ? iso(0) : iso(-38),
  };

  const meAsPerson = person({
    id: me, name: viewer.name, email: viewer.email, gender: "female", level: "Intermediate", role: viewer.role,
    skills: profile.skills, readinessLevel: profile.readinessLevel, quizScore: isNew ? null : 68, activityScore: 81,
    whatsapp: profile.whatsapp, teamId: isNew ? null : "team-kigali", registeredAt: profile.registeredAt,
  });

  const people: Person[] = [
    meAsPerson,
    person({ id: "u-jean", name: "Jean Bosco Habimana", gender: "male", level: "Intermediate", skills: ["PHP", "Laravel", "MySQL"], readinessLevel: "High", quizScore: 72, activityScore: 74, teamId: "team-kigali", preferredTime: "evening", portfolioPublic: true }),
    person({ id: "u-grace", name: "Grace Uwimana", gender: "female", level: "Intermediate", skills: ["UI design", "Figma"], readinessLevel: "Low", quizScore: 55, activityScore: 40, teamId: "team-kigali", preferredTime: "weekend" }),
    person({ id: "u-patrick", name: "Patrick Niyonzima", gender: "male", level: "Intermediate", skills: ["Python", "SQL", "Data analysis"], readinessLevel: "Medium", quizScore: 64, activityScore: 58, teamId: "team-kigali" }),
    person({ id: "u-divine", name: "Divine Ingabire", gender: "female", level: "Intermediate", skills: ["Git", "Linux", "Docker"], readinessLevel: "High", quizScore: 70, activityScore: 66, teamId: "team-kigali" }),
    person({ id: SUPERVISOR, name: viewer.role === "supervisor" ? viewer.name : "Aline Mukamana", gender: "female", level: "Advanced", role: "supervisor", quizScore: null }),
    person({ id: "sup-claude", name: "Claudine Mutoni", gender: "female", level: "Advanced", role: "supervisor", quizScore: null }),
    person({ id: ADMIN, name: "Eric Nshuti", gender: "male", level: "Advanced", role: "admin", quizScore: null }),
    // Musanze Makers (active, milestone 4 in review)
    ...["Samuel Mugisha:male:High", "Alice Umutoni:female:Medium", "Kevin Iradukunda:male:Medium", "Sandrine Uwase:female:High", "Olivier Ndayisaba:male:Low"]
      .map((s, i) => { const [name, gender, r] = s.split(":"); return person({ id: "u-mz" + i, name, gender: gender as Person["gender"], level: "Beginner", readinessLevel: r as Person["readinessLevel"], teamId: "team-musanze", skills: [["HTML", "CSS"], ["Figma"], ["JavaScript"], ["PHP"], ["Git"]][i] }); }),
    // Huye Hackers (pending group approval)
    ...["Yvonne Mukeshimana:female:High", "Eric Tuyishime:male:High", "Chantal Nyirahabimana:female:Medium", "Fabrice Nkurunziza:male:Medium", "Josiane Umubyeyi:female:Low"]
      .map((s, i) => { const [name, gender, r] = s.split(":"); return person({ id: "u-hy" + i, name, gender: gender as Person["gender"], level: "Advanced", readinessLevel: r as Person["readinessLevel"], teamId: "team-huye", skills: [["React", "TypeScript"], ["Node.js"], ["SQL"], ["Docker"], ["UI design"]][i] }); }),
    // Rubavu Coders (active, milestone 2 overdue)
    ...["Moses Hakizimana:male:Medium", "Esther Mukamazimpaka:female:High", "Thierry Bizimana:male:High", "Liliane Ishimwe:female:Medium", "Didier Mugabo:male:Low"]
      .map((s, i) => { const [name, gender, r] = s.split(":"); return person({ id: "u-rb" + i, name, gender: gender as Person["gender"], level: "Beginner", readinessLevel: r as Person["readinessLevel"], teamId: "team-rubavu", skills: [["HTML"], ["CSS"], ["JavaScript"], ["Figma"], ["Git"]][i] }); }),
    // Placement pool (verified, quiz done, opted in, no team)
    ...[
      "Aimable Kayitare:male:Intermediate:High:React,TypeScript:78:70", "Belise Uwamahoro:female:Intermediate:Medium:Figma,UI design:61:55",
      "Cedric Mbonyi:male:Intermediate:Low:PHP:52:30", "Delphine Iribagiza:female:Intermediate:High:Python,SQL:74:62",
      "Emmanuel Rukundo:male:Intermediate:Medium:Docker,Linux:66:48", "Fiona Kamikazi:female:Intermediate:Medium:Flutter:59:51",
      "Gilbert Sibomana:male:Intermediate:High:Node.js,MySQL:71:66", "Honorine Mukarugwiza:female:Intermediate:Low:HTML,CSS:45:22",
      "Innocent Ntwari:male:Intermediate:Medium:Kotlin:63:41", "Jeanne Nyiransabimana:female:Intermediate:High:Data analysis,SQL:69:59",
      "Kalisa Ganza:male:Beginner:Medium:HTML:38:35", "Laetitia Uwera:female:Beginner:High:CSS,JavaScript:44:52",
      "Moise Habineza:male:Beginner:Low:Git:35:18", "Nadine Umuhoza:female:Beginner:Medium:Figma:41:27",
    ].map((s, i) => {
      const [name, gender, level, r, skills, quiz, activity] = s.split(":");
      return person({ id: "u-pool" + i, name, gender: gender as Person["gender"], level: level as Person["level"], readinessLevel: r as Person["readinessLevel"], skills: skills.split(","), quizScore: Number(quiz), activityScore: Number(activity), registeredAt: iso(-20 + i), preferredTime: i % 3 ? "evening" : "weekend" });
    }),
  ];
  if (isNew) people.splice(1, 4);

  const teams: Team[] = [
    {
      id: "team-musanze", name: "Musanze Makers", level: "Beginner", leaderId: "u-mz0", leaderAccepted: true, supervisorId: SUPERVISOR,
      whatsappLink: "https://chat.whatsapp.com/MusanzeMakers01", groupStatus: "approved", status: "active", formedAt: iso(-45),
      members: [0, 1, 2, 3, 4].map((i) => ({ userId: "u-mz" + i, roles: [["Project manager"], ["UI/UX designer"], ["Front-end developer"], ["Back-end developer"], ["Tester"]][i] })),
    },
    {
      id: "team-huye", name: "Huye Hackers", level: "Advanced", leaderId: "u-hy0", leaderAccepted: true, supervisorId: SUPERVISOR,
      whatsappLink: "https://chat.whatsapp.com/HuyeHackersGroup", groupStatus: "submitted", status: "pending_group", formedAt: iso(-2),
      members: [0, 1, 2, 3, 4].map((i) => ({ userId: "u-hy" + i, roles: [] })),
    },
    {
      id: "team-rubavu", name: "Rubavu Coders", level: "Beginner", leaderId: "u-rb0", leaderAccepted: true, supervisorId: "sup-claude",
      whatsappLink: "https://chat.whatsapp.com/RubavuCodersTeam", groupStatus: "approved", status: "active", formedAt: iso(-50),
      members: [0, 1, 2, 3, 4].map((i) => ({ userId: "u-rb" + i, roles: [["Project manager"], ["Front-end developer"], ["Back-end developer"], ["UI/UX designer"], ["Documentation lead"]][i] })),
    },
  ];

  if (!isNew) {
    teams.unshift({
      id: "team-kigali", name: "Kigali Builders", level: "Intermediate", leaderId: me, leaderAccepted: true, supervisorId: SUPERVISOR,
      whatsappLink: "https://chat.whatsapp.com/KigaliBuilders2026", groupStatus: "approved", status: "active", formedAt: iso(-28),
      members: [
        { userId: me, roles: ["Project manager", "Front-end developer"] },
        { userId: "u-jean", roles: ["Back-end developer"] },
        { userId: "u-grace", roles: ["UI/UX designer", "Documentation lead"] },
        { userId: "u-patrick", roles: ["Tester"] },
        { userId: "u-divine", roles: ["DevOps"], onLeave: { from: day(-1), to: day(2) } },
      ],
    });
  }

  const mine = milestones("mine");
  mine[2] = {
    ...mine[2], status: "changes_requested", topicWatched: true, dueDate: iso(4, 18),
    submissions: [{
      id: "mine-m3-v1", version: 1, submittedBy: me, link: "https://docs.google.com/document/d/kigali-builders-srs",
      notes: "First full draft of the SRS for LabSlot.", aiDeclaration: "Used Claude to explain the IEEE 830 structure. All requirements written by the team.",
      contributions: [
        { userId: me, text: "Wrote the scope and user roles sections." },
        { userId: "u-jean", text: "Wrote the data requirements." },
        { userId: "u-grace", text: "Wrote usability and accessibility requirements." },
        { userId: "u-patrick", text: "Checked every requirement for testability." },
      ],
      createdAt: iso(-3, 20),
      review: { supervisorId: SUPERVISOR, decision: "changes_requested", comments: "Good structure. FR-4 and FR-9 aren't testable yet: add measurable conditions. Please also add non-functional requirements for data use on phones.", createdAt: iso(-2, 10) },
    }],
    pendingContributions: [{ userId: "u-jean", text: "Rewrote FR-4 with a measurable response time." }],
  };

  const musanze = milestones("musanze");
  musanze[3] = {
    ...musanze[3], status: "submitted", topicWatched: true, dueDate: iso(1, 18),
    submissions: [{
      id: "mz-m4-v1", version: 1, submittedBy: "u-mz0", link: "https://github.com/musanze-makers/market-prices/tree/main/docs/design",
      notes: "Architecture diagram, ERD and wireframes for the market prices app.", aiDeclaration: "Used ChatGPT to review our ERD naming. Diagrams drawn by the team.",
      contributions: [0, 1, 2, 3, 4].map((i) => ({ userId: "u-mz" + i, text: ["Coordinated and wrote the architecture overview.", "Drew all wireframes in Figma.", "Mapped screens to components.", "Designed the ERD.", "Checked the design against the SRS."][i] })),
      createdAt: iso(-1, 19),
    }],
  };
  const rubavu = milestones("rubavu");
  rubavu[1] = { ...rubavu[1], status: "open", topicWatched: true, dueDate: iso(-3, 18) };
  if (!isNew) mine.forEach((m) => { if (m.order > 3) m.dueDate = iso(4 + (m.order - 3) * 10, 18); });

  const projects: Project[] = [
    { id: "p-musanze", teamId: "team-musanze", title: "Isoko Prices", problem: "Farmers sell below market price because they can't see prices in nearby markets.", targetUsers: "Smallholder farmers in Musanze", solution: "SMS-friendly web app listing daily prices from four markets.", plannedEnd: iso(40), status: "in_progress", milestones: musanze },
    { id: "p-rubavu", teamId: "team-rubavu", title: "Lake Clean-up Tracker", problem: "Volunteers don't know which shoreline areas were already cleaned.", targetUsers: "Community volunteers in Rubavu", solution: "A shared map of cleaned areas with weekly sign-ups.", plannedEnd: iso(55), status: "in_progress", milestones: rubavu },
  ];
  if (!isNew) {
    projects.unshift({ id: "p-kigali", teamId: "team-kigali", title: "LabSlot", problem: "Students waste time queuing for the school computer lab without knowing when it's free.", targetUsers: "Secondary-school students and the lab technician", solution: "A mobile-first booking app for lab slots with reminders.", plannedEnd: iso(48), status: "in_progress", milestones: mine });
  }

  const reports: DailyReport[] = [];
  if (!isNew) {
    const crew = [me, "u-jean", "u-grace", "u-patrick", "u-divine"];
    const workdays: number[] = [];
    for (let offset = -21; offset <= -1; offset++) {
      const weekday = new Date(Date.now() + offset * DAY + 2 * 3_600_000).getUTCDay(); // Kigali weekday
      if (weekday !== 0 && weekday !== 6) workdays.push(offset);
    }
    const lastThree = workdays.slice(-3);
    const done = [
      ["Updated the SRS scope section.", "Drafted user roles for the SRS.", "Reviewed FR-4 with Jean.", "Planned the booking flow with Grace."],
      ["Built the bookings table migration.", "Added slot validation rules.", "Modelled lab rooms in the ERD.", "Wrote the data requirements."],
      ["Revised the booking flow wireframe.", "Wrote accessibility notes.", "Designed the empty states.", "Checked colour contrast."],
      ["Wrote test cases for booking rules.", "Tested cancellation edge cases.", "Checked FR-1 to FR-6 for testability.", "Set up the test plan template."],
      ["Set up the staging server.", "Added the deploy script.", "Configured environment variables.", "Documented the setup steps."],
    ];
    workdays.forEach((offset, d) => {
      crew.forEach((userId, i) => {
        if (userId === "u-grace" && lastThree.includes(offset)) return; // three working days missed in a row (FR-76)
        if (userId === "u-divine" && offset >= -1) return; // on leave
        if (userId === "u-patrick" && d === workdays.length - 6) return;
        reports.push({
          id: `r-${userId}-${offset}`, userId, date: day(offset),
          done: done[i][d % 4],
          next: ["Review FR-4 with Jean.", "Add slot validation.", "Write the accessibility notes.", "Test cancellation edge cases.", "Add the deploy script."][i],
          blockers: userId === "u-jean" && offset === lastThree[1] ? "Not sure how to model recurring lab slots in the ERD." : userId === "u-patrick" && offset === lastThree[2] ? "Need the latest SRS draft to write tests." : "",
          blockerSolved: false, hours: [3, 4, 2, 2.5, 3][i] + (d % 3) * 0.5,
        });
      });
    });
  }

  const activity: ActivityDay[] = isNew ? [{ date: day(0), activeMin: 12, eventMin: 0, reportHours: 0 }] : Array.from({ length: 30 }, (_, i) => {
    const offset = i - 29;
    const report = reports.find((r) => r.userId === me && r.date === day(offset));
    return { date: day(offset), activeMin: (i * 37) % 70 + 15, eventMin: offset === -9 ? 60 : 0, reportHours: report?.hours ?? 0 };
  });

  const events: LiveEvent[] = [
    { id: "ev-srs", title: "Deep dive: Testable requirements", topicId: "srs-basics", description: "Live walkthrough of rewriting vague requirements into testable ones, using your submitted examples.", host: "Aline Mukamana", startsAt: iso(3, 18), durationMin: 60, platform: "Google Meet", meetingUrl: "https://meet.google.com/abc-defg-hij", capacity: 60, registered: 41, status: "published" },
    { id: "ev-git", title: "Git branching, live", topicId: "build-in-slices", description: "Branch, commit, open a pull request and resolve a merge conflict together.", host: "Eric Nshuti", startsAt: iso(9, 17), durationMin: 75, platform: "Zoom", meetingUrl: "https://zoom.us/j/1234567890", capacity: 40, registered: 40, status: "published" },
    { id: "ev-erd", title: "Office hours: ERDs", topicId: "system-design", description: "Bring your ERD and get feedback from a supervisor.", host: "Claudine Mutoni", startsAt: iso(-9, 18), durationMin: 60, platform: "Google Meet", meetingUrl: "https://meet.google.com/xyz-abcd-efg", capacity: null, registered: 33, status: "completed", recordingUrl: "https://www.youtube.com/watch?v=sample" },
    { id: "ev-deploy", title: "Deploying on free tiers", topicId: "deploy-free", description: "Draft session for the deployment phase.", host: "Eric Nshuti", startsAt: iso(21, 18), durationMin: 60, platform: "Zoom", meetingUrl: "https://zoom.us/j/9876543210", capacity: 80, registered: 0, status: "draft" },
  ];

  const progress: Record<string, TopicProgress> = isNew ? {} : {
    "find-a-real-problem": { viewedAt: iso(-27), promptCopiedAt: iso(-27), completedAt: iso(-27), firstScore: 67, bestScore: 100, attempts: 2, rating: 5 },
    "write-a-proposal": { viewedAt: iso(-18), promptCopiedAt: iso(-18), completedAt: iso(-17), firstScore: 100, bestScore: 100, attempts: 1, rating: 4 },
    "srs-basics": { viewedAt: iso(-6), promptCopiedAt: iso(-6), completedAt: iso(-6), firstScore: 50, bestScore: 75, attempts: 2, deepDive: { details: "How to make performance requirements testable on cheap phones.", slot: "weekday_evening", createdAt: iso(-6) } },
    "html-forms": { viewedAt: iso(-10), completedAt: iso(-10), firstScore: 67, bestScore: 67, attempts: 1 },
    "sql-joins": { viewedAt: iso(-1), attempts: 0 },
  };

  const staffNotifications: Notification[] = viewer.role === "admin" ? [
    { id: "na1", title: "Deep-dive demand reached the threshold", body: "“Testable requirements” has enough requests to schedule a live session.", href: "/admin/events", createdAt: iso(-1, 9) },
    { id: "na2", title: "Learners are waiting for a team", body: "The placement pool has enough Intermediate learners to form new teams.", href: "/admin/teams", createdAt: iso(0, 8) },
    { id: "na3", title: "Rubavu Coders missed a milestone deadline", body: "Their current milestone is overdue. The team and supervisor were emailed.", href: "/supervisor/teams/team-rubavu", createdAt: iso(-2, 9), readAt: iso(-2, 10) },
  ] : [
    { id: "ns1", title: "Musanze Makers submitted System design", body: "Milestone 4 is waiting for your review.", href: "/supervisor/reviews/p-musanze/4", createdAt: iso(-1, 16) },
    { id: "ns2", title: "Huye Hackers sent their WhatsApp group", body: "Join the group, check all five members are in, then approve it.", href: "/supervisor", createdAt: iso(-2, 18) },
    { id: "ns3", title: "New blocker on Kigali Builders", body: "Patrick needs the latest SRS draft to write tests.", href: "/supervisor", createdAt: iso(-1, 19) },
    { id: "ns4", title: "Review sent to Kigali Builders", body: "You requested changes on Requirements (SRS), version 1.", href: "/supervisor/teams/team-kigali", createdAt: iso(-3, 11), readAt: iso(-3, 12) },
  ];
  const notifications: Notification[] = viewer.role !== "learner" ? staffNotifications : isNew ? [
    { id: "n-welcome", title: "Welcome to WeCodee", body: "Complete your builder profile, then take the skills quiz to join a team.", href: "/learner", createdAt: iso(0, 8) },
  ] : [
    { id: "n1", title: "Changes requested on Requirements (SRS)", body: "Aline asked for measurable conditions on FR-4 and FR-9.", href: "/learner/project/3", createdAt: iso(-2, 10) },
    { id: "n2", title: "Grace missed 3 daily reports", body: "Check in with Grace, or flag the member as inactive if needed.", href: "/learner/reports", createdAt: iso(-1, 19) },
    { id: "n3", title: "Deep dive scheduled", body: "“Deep dive: Testable requirements” is on in 3 days. You requested this topic.", href: "/learner/events", createdAt: iso(-1, 12) },
    { id: "n4", title: "Reminder: daily report", body: "Post today's report before 19:00.", href: "/learner/reports", createdAt: iso(0, 17), },
    { id: "n5", title: "Milestone 2 approved", body: "Project proposal approved. Requirements (SRS) is now open.", href: "/learner/project/2", createdAt: iso(-12, 11), readAt: iso(-12, 12) },
  ];

  const certificates: Certificate[] = [
    { code: "WCD-7K2M-Q9TA", userId: "u-alum1", learnerName: "Pacifique Mugwaneza", projectTitle: "Bus Stop Times", role: "Back-end developer", completedAt: iso(-70), supervisorName: "Aline Mukamana" },
    { code: "WCD-3HX8-PL4R", userId: "u-alum2", learnerName: "Clarisse Mutesi", projectTitle: "Bus Stop Times", role: "Project manager", completedAt: iso(-70), supervisorName: "Aline Mukamana" },
    { code: "WCD-9VB1-ZE6N", userId: "u-alum3", learnerName: "Gad Nshimiyimana", projectTitle: "Clinic Queue", role: "Tester", completedAt: iso(-64), supervisorName: "Claudine Mutoni", revokedAt: iso(-20), revokeReason: "Contribution confirmations could not be verified." },
  ];

  const audit: AuditEntry[] = [
    { id: "a1", actor: "Aline Mukamana", action: "review.changes_requested", entity: "milestone", entityId: "p-kigali/3", details: "Requirements (SRS) v1", createdAt: iso(-2, 10) },
    { id: "a2", actor: "Eric Nshuti", action: "team.confirmed", entity: "team", entityId: "team-huye", details: "Formed from placement preview", createdAt: iso(-2, 9) },
    { id: "a3", actor: "Eric Nshuti", action: "certificate.revoked", entity: "certificate", entityId: "WCD-9VB1-ZE6N", details: "Contribution confirmations could not be verified.", createdAt: iso(-20, 15) },
    { id: "a4", actor: "Aline Mukamana", action: "group.approved", entity: "team", entityId: "team-kigali", details: "WhatsApp group joined", createdAt: iso(-26, 14) },
  ];

  return {
    scenario, profile, people, topics: structuredClone(sampleTopics), progress, articles: structuredClone(sampleArticles),
    savedArticles: isNew ? [] : ["testable-requirements"], events, registrations: isNew ? [] : ["ev-srs"], attended: isNew ? [] : ["ev-erd"],
    quizBank: structuredClone(sampleQuizBank), teams, projects, reports, activity, certificates, notifications, audit,
    settings: { deepDiveThreshold: 20, teamSize: 5, supervisorCap: 5, reportReminderTime: "19:00", missedDaysAlert: 3, leaderResponseDays: 2, groupLinkReminderDays: 3 },
    templates: structuredClone(sampleMilestoneTemplates),
    roleLog: isNew ? [] : [{ at: iso(-27), text: "Roles assigned to all five members." }, { at: iso(-8), text: "Grace Uwimana: added Documentation lead." }],
  };
}

export const SAMPLE_SUPERVISOR_ID = SUPERVISOR;
