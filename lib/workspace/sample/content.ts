/**
 * SAMPLE CONTENT — used only by the sample adapter (lib/workspace/sample).
 * Production content is created by admins through the Content pages.
 */
import type { Article, HotTopic, MilestoneTemplate, QuizQuestion } from "../types";
import { countWords, readingMinutes } from "../rules";

const prompt = (topic: string, level: string, points: string[], task: string) =>
  `You are my patient coding tutor. I just watched a short lesson on ${topic} at the ${level} level.
Key points from the lesson:
${points.map((p) => "- " + p).join("\n")}
Your rules:
1. Explain one idea at a time, with a small example, then ask me a question to check I understood.
2. Never give me a full solution before I have tried. Give hints first, then partial code, and only show a full answer if I ask after trying twice.
3. When I share my code, point out what is wrong and why, and let me fix it myself.
Then guide me step by step to build this practice project: ${task}.
Start by asking me what I already know about ${topic}.`;

type TopicSeed = Omit<HotTopic, "masterPrompt" | "youtubeUrl" | "published" | "views" | "promptCopies" | "deepDiveRequests"> & { points: string[] };

const topicSeeds: TopicSeed[] = [
  {
    id: "find-a-real-problem", title: "Finding a problem worth solving", category: "Product thinking", level: "Beginner", phase: 1, durationSec: 482,
    summary: "How to spot a real problem, talk to the people who have it, and write a problem statement with evidence.",
    points: ["A good problem has real people who feel it", "Interview before you build", "A problem statement names users, pain and evidence"],
    practiceTask: "Interview two people about a daily frustration and write a three-sentence problem statement",
    questions: [
      { id: "q1", question: "What makes a problem statement strong?", options: ["It describes the app you will build", "It names who has the problem and shows evidence", "It lists the technologies you will use"], correct: 1, explanation: "A problem statement is about people and evidence, not the solution." },
      { id: "q2", question: "When should you interview potential users?", options: ["After launch", "Before choosing a solution", "Only if the supervisor asks"], correct: 1, explanation: "Early interviews keep you from building the wrong thing." },
      { id: "q3", question: "Which is evidence that a problem is real?", options: ["You think it is annoying", "Five students describe losing time to it each week", "A friend likes your idea"], correct: 1, explanation: "Repeated, specific reports from the affected people count as evidence." },
    ],
  },
  {
    id: "write-a-proposal", title: "Writing a project proposal", category: "Product thinking", level: "Beginner", phase: 2, durationSec: 545,
    summary: "Turn your problem into objectives, a scope you can finish, a timeline and clear team roles.",
    points: ["Objectives should be measurable", "Scope says what you will not build too", "Roles make ownership clear"],
    practiceTask: "Draft a one-page proposal with three objectives and an out-of-scope list",
    questions: [
      { id: "q1", question: "Which objective is measurable?", options: ["Make learning fun", "Let 30 students book a lab slot in under a minute", "Build a great app"], correct: 1, explanation: "It has a who, a number and a time you can check." },
      { id: "q2", question: "Why list what is out of scope?", options: ["To look professional", "To protect the timeline from extra features", "It is required by law"], correct: 1, explanation: "Saying no early keeps the project finishable." },
      { id: "q3", question: "What belongs in the timeline?", options: ["Milestones with dates", "Only the final deadline", "The tools you like"], correct: 0, explanation: "Milestones with dates let the team and supervisor track progress." },
    ],
  },
  {
    id: "srs-basics", title: "Software requirements in 10 minutes", category: "Requirements", level: "Intermediate", phase: 3, durationSec: 598,
    summary: "Write functional and non-functional requirements that a tester can check, with stable IDs.",
    points: ["A requirement must be testable", "Functional vs non-functional", "Stable IDs let the team reference requirements"],
    practiceTask: "Write five testable requirements with IDs for a library booking app",
    questions: [
      { id: "q1", question: "Which requirement is testable?", options: ["The app should be fast", "Search results load in under 2 seconds on 4G", "Users will love the design"], correct: 1, explanation: "It states a measurable condition a tester can check." },
      { id: "q2", question: "“Passwords are hashed with bcrypt” is a…", options: ["Functional requirement", "Non-functional requirement", "User story"], correct: 1, explanation: "It constrains how the system works (security), not what it does for the user." },
      { id: "q3", question: "Why give requirements stable IDs like FR-12?", options: ["So tasks, tests and reviews can reference them", "To make the document longer", "IDs are optional decoration"], correct: 0, explanation: "IDs let everyone point at the same requirement over time." },
      { id: "q4", question: "Who should be able to read the SRS?", options: ["Only developers", "Developers, testers and the client", "Only the supervisor"], correct: 1, explanation: "An SRS is a shared agreement between everyone involved." },
    ],
  },
  {
    id: "system-design", title: "Sketching a system design", category: "Design", level: "Intermediate", phase: 4, durationSec: 571,
    summary: "Draw the architecture, model the data as an ERD and wireframe the key screens before writing code.",
    points: ["Architecture shows the big pieces", "An ERD shows tables and relationships", "Wireframes test the flow cheaply"],
    practiceTask: "Draw an ERD with four tables for a school event app",
    questions: [
      { id: "q1", question: "What does an ERD show?", options: ["Screen colours", "Entities and how they relate", "Deployment steps"], correct: 1, explanation: "Entity-relationship diagrams model data and relationships." },
      { id: "q2", question: "Why wireframe before coding?", options: ["Changes on paper are cheaper than in code", "It replaces testing", "Supervisors require art"], correct: 0, explanation: "Cheap sketches catch flow problems early." },
      { id: "q3", question: "A user has many bookings. That relationship is…", options: ["One-to-one", "One-to-many", "Many-to-many"], correct: 1, explanation: "One user row links to many booking rows." },
    ],
  },
  {
    id: "build-in-slices", title: "Building in small slices with Git", category: "Engineering", level: "Intermediate", phase: 5, durationSec: 590,
    summary: "Ship one feature at a time on branches, with commits and pull requests your team can review.",
    points: ["One feature per branch", "Small commits with clear messages", "Pull requests invite review"],
    practiceTask: "Create a repository, add a feature branch and open a pull request with two commits",
    questions: [
      { id: "q1", question: "Why work on a feature branch?", options: ["To keep main stable while you build", "Git requires it", "To hide work from the team"], correct: 0, explanation: "Branches isolate unfinished work." },
      { id: "q2", question: "Which commit message is best?", options: ["stuff", "Add booking form validation", "final final v2"], correct: 1, explanation: "It says what changed in plain words." },
      { id: "q3", question: "What is a pull request for?", options: ["Asking teammates to review and merge changes", "Downloading code", "Deleting a branch"], correct: 0, explanation: "PRs are where review happens before merging." },
    ],
  },
  {
    id: "testing-basics", title: "Testing what you built", category: "Quality", level: "Intermediate", phase: 6, durationSec: 533,
    summary: "Write a test plan, cover common and unusual inputs, record results and check your fixes.",
    points: ["A test case has steps and an expected result", "Test edge cases, not only the happy path", "Re-test after every fix"],
    practiceTask: "Write six test cases for a sign-up form, including three edge cases",
    questions: [
      { id: "q1", question: "Which is an edge case for an age field?", options: ["25", "-1", "30"], correct: 1, explanation: "Negative numbers are outside the valid range." },
      { id: "q2", question: "A test case must include…", options: ["Steps and the expected result", "Only the tester's name", "A screenshot"], correct: 0, explanation: "Without an expected result, you can't tell pass from fail." },
      { id: "q3", question: "After fixing a bug you should…", options: ["Close the laptop", "Re-run the failing test and related tests", "Delete the test"], correct: 1, explanation: "Regression checks confirm the fix and that nothing else broke." },
    ],
  },
  {
    id: "deploy-free", title: "Deploying on a free tier", category: "DevOps", level: "Intermediate", phase: 7, durationSec: 560,
    summary: "Put your project online with a free host, environment variables and a short deployment guide.",
    points: ["Secrets live in environment variables", "Free tiers have limits", "A deployment guide lets anyone redeploy"],
    practiceTask: "Deploy a small app and write a five-step deployment guide",
    questions: [
      { id: "q1", question: "Where should a database password live?", options: ["In the code", "In an environment variable", "In the README"], correct: 1, explanation: "Environment variables keep secrets out of the repository." },
      { id: "q2", question: "What should a deployment guide contain?", options: ["Steps anyone can follow to deploy", "The team's opinions", "Only the live URL"], correct: 0, explanation: "A guide makes the deployment repeatable." },
      { id: "q3", question: "Why check free-tier limits?", options: ["So the app does not stop when traffic grows", "They never matter", "To pick colours"], correct: 0, explanation: "Limits on hours, storage or requests can take the app offline." },
    ],
  },
  {
    id: "present-your-project", title: "Presenting your project", category: "Communication", level: "Beginner", phase: 8, durationSec: 480,
    summary: "Demo the problem, the solution and what you learned in a short, confident presentation.",
    points: ["Start with the problem", "Demo the main flow live", "Share what you learned and what's next"],
    practiceTask: "Record a three-minute demo video of your project",
    questions: [
      { id: "q1", question: "How should a demo start?", options: ["With the database schema", "With the problem and who has it", "With the team photo"], correct: 1, explanation: "The audience needs to know why the project matters." },
      { id: "q2", question: "A retrospective answers…", options: ["What went well, what didn't, what we'd change", "Who was the best member", "How much the app costs"], correct: 0, explanation: "Retros turn experience into lessons." },
      { id: "q3", question: "During a live demo you should…", options: ["Show every screen", "Show the main flow end to end", "Read the code aloud"], correct: 1, explanation: "Focus on the core flow that solves the problem." },
    ],
  },
  {
    id: "html-forms", title: "Accessible HTML forms", category: "Front end", level: "Beginner", phase: null, durationSec: 420,
    summary: "Labels, input types and error messages that work for everyone, on every phone.",
    points: ["Every input needs a label", "Use the right input type", "Errors must say how to fix them"],
    practiceTask: "Build a sign-up form with labels, validation and clear error messages",
    questions: [
      { id: "q1", question: "Why connect a <label> to its input?", options: ["Screen readers announce it and the tap target grows", "It changes the font", "It is required by CSS"], correct: 0, explanation: "Labels help assistive tech and make inputs easier to tap." },
      { id: "q2", question: "Which input type shows a number keypad on phones?", options: ["text", "tel", "search"], correct: 1, explanation: "type=\"tel\" brings up the phone keypad." },
      { id: "q3", question: "A good error message…", options: ["Says “Invalid”", "Explains how to fix the problem", "Appears only in the console"], correct: 1, explanation: "People need to know what to do next." },
    ],
  },
  {
    id: "sql-joins", title: "SQL joins without fear", category: "Data", level: "Intermediate", phase: null, durationSec: 590,
    summary: "INNER and LEFT joins explained with one small school database.",
    points: ["INNER JOIN keeps matching rows", "LEFT JOIN keeps every left row", "Join on keys, not names"],
    practiceTask: "Write three queries joining students, teams and reports",
    questions: [
      { id: "q1", question: "Which join keeps students without a team?", options: ["INNER JOIN", "LEFT JOIN from students", "CROSS JOIN"], correct: 1, explanation: "LEFT JOIN keeps all rows from the left table." },
      { id: "q2", question: "What should you join on?", options: ["Primary and foreign keys", "Names", "Row order"], correct: 0, explanation: "Keys are unique and stable." },
      { id: "q3", question: "An INNER JOIN returns…", options: ["Only rows with a match in both tables", "All rows from both tables", "Only the first table"], correct: 0, explanation: "Unmatched rows are dropped." },
    ],
  },
];

export const sampleTopics: HotTopic[] = topicSeeds.map(({ points, ...seed }, index) => ({
  ...seed,
  // Sample topics carry no video. Admins attach the unlisted YouTube link (FR-13).
  youtubeUrl: "",
  masterPrompt: prompt(seed.title.toLowerCase(), seed.level, points, seed.practiceTask.toLowerCase()),
  published: true,
  views: [214, 188, 162, 120, 96, 71, 44, 30, 140, 83][index] ?? 50,
  promptCopies: [131, 102, 99, 64, 52, 33, 21, 12, 88, 41][index] ?? 20,
  deepDiveRequests: [6, 4, 22, 11, 17, 3, 9, 1, 2, 14][index] ?? 0,
}));

export const sampleMilestoneTemplates: MilestoneTemplate[] = [
  { order: 1, name: "Problem understanding", deliverable: "Problem statement, target users, evidence the problem is real", topicId: "find-a-real-problem", checklist: ["Problem names who is affected", "At least two pieces of evidence", "Target users described"] },
  { order: 2, name: "Project proposal", deliverable: "Objectives, scope, timeline, team roles", topicId: "write-a-proposal", checklist: ["Measurable objectives", "In and out of scope", "Timeline with milestone dates", "Roles assigned"] },
  { order: 3, name: "Requirements (SRS)", deliverable: "SRS document", topicId: "srs-basics", checklist: ["Functional requirements with IDs", "Non-functional requirements", "Requirements are testable"] },
  { order: 4, name: "System design", deliverable: "Architecture, database diagram (ERD), UI wireframes", topicId: "system-design", checklist: ["Architecture diagram", "ERD covers main entities", "Wireframes for key screens"] },
  { order: 5, name: "Implementation", deliverable: "Code repository link (GitHub), progress notes", topicId: "build-in-slices", checklist: ["Repository is reachable", "Commits from several members", "Progress notes match the SRS"] },
  { order: 6, name: "Testing", deliverable: "Test plan, test cases and results", topicId: "testing-basics", checklist: ["Test plan", "Edge cases covered", "Results recorded and fixes re-tested"] },
  { order: 7, name: "Deployment", deliverable: "Live URL, deployment guide", topicId: "deploy-free", checklist: ["Live URL works", "No secrets in the repository", "Deployment guide is repeatable"] },
  { order: 8, name: "Final presentation", deliverable: "Demo video or slides, team retrospective", topicId: "present-your-project", checklist: ["Demo shows the main flow", "Retrospective included", "Every member presents a part"] },
];

const articleSeeds: Omit<Article, "wordCount" | "readingMin">[] = [
  {
    slug: "interview-before-you-build", title: "Interview before you build", category: "Product thinking", published: true,
    excerpt: "Five questions that tell you whether a problem is real, before you write a line of code.",
    publishedAt: "2026-10-02T08:00:00Z", topicIds: ["find-a-real-problem"], milestoneOrders: [1],
    body: [
      "Most student projects fail quietly. The code works, the demo runs, and nobody uses it. The cause is almost always the same: the team solved a problem they imagined instead of one they observed.",
      "Before you choose a solution, talk to five people who might have the problem. Ask them to describe the last time it happened. Ask what they did about it, what it cost them in time or money, and what they tried before.",
      "Listen for specifics. “It's annoying” is an opinion. “I waited forty minutes at the lab door on Tuesday because nobody knew the room was booked” is evidence.",
      "Write down exact quotes. They become the evidence section of your problem statement, and your supervisor will ask for them.",
      "If nobody can describe a recent, specific example, that is useful too. It means you have found a problem that is not painful enough yet. Pick another one.",
    ],
  },
  {
    slug: "testable-requirements", title: "What makes a requirement testable", category: "Requirements", published: true,
    excerpt: "If a tester can't tell pass from fail, it isn't a requirement yet.",
    publishedAt: "2026-10-12T08:00:00Z", topicIds: ["srs-basics", "testing-basics"], milestoneOrders: [3, 6],
    body: [
      "A requirement is a promise your software makes. A testable requirement is a promise someone can check.",
      "“The app should be fast” cannot be checked. “Search results appear within two seconds on a 4G connection” can. The second version names a condition, a number and a context.",
      "Give every requirement a stable ID such as FR-12. When a tester reports a failure, a reviewer comments, or a task is planned, the ID points everyone to the same sentence.",
      "Separate what the system does (functional) from how well it must do it (non-functional): speed, security, accessibility, data use.",
      "Finally, read each requirement as a tester would. If you can't imagine the test case, rewrite the requirement.",
    ],
  },
  {
    slug: "low-data-workflow", title: "Building on a small data budget", category: "Engineering", published: true,
    excerpt: "Practical habits for teams where not everyone has reliable internet.",
    publishedAt: "2026-10-20T08:00:00Z", topicIds: ["build-in-slices"], milestoneOrders: [5],
    body: [
      "Not every teammate has home Wi-Fi. A team that plans for this ships faster than one that pretends otherwise.",
      "Clone repositories once and pull small, frequent changes instead of re-downloading. Turn off automatic video playback. Download reference materials while you have a good connection.",
      "Give phone-only teammates work that fits their device well: documentation, test cases, user interviews and reviews.",
      "Agree on a daily report time that suits everyone's connection, and save a daily report on the open report page if you lose your connection.",
    ],
  },
  {
    slug: "ai-as-a-tutor", title: "Using AI as a tutor, not a ghostwriter", category: "Learning with AI", published: true,
    excerpt: "Why master prompts keep the AI in coaching mode, and how to declare AI use honestly.",
    publishedAt: "2026-11-01T08:00:00Z", topicIds: [], milestoneOrders: [],
    body: [
      "An AI assistant can explain anything, at any hour, at your pace. It can also write code you don't understand and can't defend in a review.",
      "Master prompts set the rules up front: explain one idea at a time, ask questions, give hints before answers, and never write a full solution before you have tried.",
      "When you submit a milestone, declare which tools you used, what for, and what the team did itself. Supervisors don't penalise honest AI use. They do ask members to explain their work.",
    ],
  },
  {
    slug: "demo-day-checklist", title: "A demo-day checklist", category: "Communication", published: false,
    excerpt: "Everything to check the night before you present.",
    publishedAt: "2026-11-20T08:00:00Z", topicIds: ["present-your-project"], milestoneOrders: [8],
    body: ["Draft. Charge every device, test the live URL on mobile data, and record a backup video in case the connection fails."],
  },
];

export const sampleArticles: Article[] = articleSeeds.map((a) => {
  const wordCount = countWords(a.body.join(" "));
  return { ...a, wordCount, readingMin: readingMinutes(wordCount) };
});

const q = (id: string, level: QuizQuestion["level"], topic: string, question: string, options: string[], correct: number): QuizQuestion =>
  ({ id, level, topic, question, options, correct, active: true });

export const sampleQuizBank: QuizQuestion[] = [
  q("b1", "Beginner", "HTML", "Which tag creates a link?", ["<a>", "<link>", "<href>", "<p>"], 0),
  q("b2", "Beginner", "HTML", "Which element is best for a page's main heading?", ["<h1>", "<header>", "<title>", "<strong>"], 0),
  q("b3", "Beginner", "CSS", "Which property changes text colour?", ["color", "font-color", "text", "background"], 0),
  q("b4", "Beginner", "JavaScript", "What does `let x = 3; x = x + 2;` leave in x?", ["5", "32", "3", "undefined"], 0),
  q("b5", "Beginner", "JavaScript", "Which value is a boolean?", ["true", "\"true\"", "1", "null"], 0),
  q("b6", "Beginner", "Logic", "How many times does `for (let i = 0; i < 3; i++)` run?", ["3", "2", "4", "Forever"], 0),
  q("b7", "Beginner", "Git", "What does `git commit` do?", ["Saves a snapshot locally", "Uploads to GitHub", "Deletes changes", "Creates a branch"], 0),
  q("b8", "Beginner", "Web", "What does HTTPS add to HTTP?", ["Encryption", "Speed", "Images", "Databases"], 0),
  q("b9", "Beginner", "Logic", "`if (age >= 18)` is true when age is…", ["18", "17", "-1", "0"], 0),
  q("b10", "Beginner", "CSS", "Which unit scales with the root font size?", ["rem", "px", "cm", "pt"], 0),
  q("i1", "Intermediate", "JavaScript", "What does `[1,2,3].map(n => n * 2)` return?", ["[2,4,6]", "[1,2,3]", "12", "undefined"], 0),
  q("i2", "Intermediate", "JavaScript", "Which keyword waits for a promise inside an async function?", ["await", "yield", "then", "defer"], 0),
  q("i3", "Intermediate", "SQL", "Which clause filters rows after grouping?", ["HAVING", "WHERE", "ORDER BY", "LIMIT"], 0),
  q("i4", "Intermediate", "SQL", "A LEFT JOIN keeps…", ["All rows from the left table", "Only matching rows", "All rows from the right table", "No rows"], 0),
  q("i5", "Intermediate", "HTTP", "Which status code means “not found”?", ["404", "200", "500", "301"], 0),
  q("i6", "Intermediate", "Git", "What does `git pull` do?", ["Fetches and merges remote changes", "Pushes commits", "Creates a tag", "Reverts a commit"], 0),
  q("i7", "Intermediate", "Security", "Prepared statements protect against…", ["SQL injection", "Slow pages", "Typos", "XSS in CSS"], 0),
  q("i8", "Intermediate", "PHP", "In Laravel, routes are usually defined in…", ["routes/web.php", "index.html", "composer.json", ".env"], 0),
  q("i9", "Intermediate", "Code reading", "`const a = [3,1,2].sort(); a[0]` is…", ["1", "3", "2", "undefined"], 0),
  q("i10", "Intermediate", "APIs", "Which method usually creates a resource?", ["POST", "GET", "HEAD", "OPTIONS"], 0),
  q("a1", "Advanced", "Architecture", "Which helps a read-heavy endpoint most?", ["A cache with clear invalidation", "More columns", "Longer timeouts", "Inline styles"], 0),
  q("a2", "Advanced", "Security", "Why hash passwords with bcrypt rather than SHA-256?", ["bcrypt is deliberately slow and salted", "SHA-256 is reversible", "bcrypt is shorter", "No difference"], 0),
  q("a3", "Advanced", "Databases", "An index on `users(email)` speeds up…", ["Lookups by email", "Inserts", "Deleting the table", "Backups"], 0),
  q("a4", "Advanced", "Concurrency", "Two requests update the same row. What prevents lost updates?", ["A transaction with row locking or version checks", "Bigger servers", "More logging", "Client-side validation"], 0),
  q("a5", "Advanced", "Testing", "Which test isolates one function from its dependencies?", ["Unit test", "End-to-end test", "Load test", "Smoke test"], 0),
  q("a6", "Advanced", "Web", "A service worker can…", ["Serve cached responses offline", "Read other sites' cookies", "Run SQL", "Replace HTTPS"], 0),
  q("a7", "Advanced", "Code reading", "`Promise.all([a, b])` rejects when…", ["Any promise rejects", "All reject", "Never", "Both resolve"], 0),
  q("a8", "Advanced", "DevOps", "Blue-green deployment reduces…", ["Downtime during releases", "Code size", "Test count", "Database size"], 0),
  q("a9", "Advanced", "APIs", "Idempotent requests are safe to…", ["Retry", "Skip authentication", "Cache forever", "Send without HTTPS"], 0),
  q("a10", "Advanced", "Privacy", "Data minimisation means…", ["Collect only what the stated purpose needs", "Compress the database", "Delete all logs", "Use short column names"], 0),
];
