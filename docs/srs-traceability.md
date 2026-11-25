# SRS traceability

Each requirement in `WeCodee_SRS.docx` mapped to where it lives in the app, with its status.

| Status | Meaning |
| --- | --- |
| **Done** | Works end to end in the app. With the sample adapter, data is in server memory (see README). |
| **Partial** | The interface and rules exist, but part of the requirement needs the backend. The missing part is named. |
| **Backend** | Needs a service that doesn't exist yet: the learning database, mail queue, scheduler, file storage or web push. The app doesn't pretend it happened. |

Paths are relative to `app/`. Actions are in `lib/workspace/actions.ts` and rules in `lib/workspace/rules.ts`.

## Accounts, readiness and quiz

| ID | Requirement | Where | Status |
| --- | --- | --- | --- |
| FR-1 | Registration fields | `(auth)/signup` creates the account. `(dashboard)/settings` holds the builder profile (`saveProfile`) | Done |
| FR-2 | WhatsApp consent and code of conduct | Settings › Team and consent (`saveProfile` validates both) | Done |
| FR-3 | Guardian details under 18 | Settings › Team and consent (`saveProfile`) | Done |
| FR-4 | Email verified before the quiz | Better Auth verification. `lib/workspace/viewer.ts` refuses unverified sessions | Done |
| FR-5 | Log in, log out, reset password | `(auth)/*`, account menu › Sign out, Settings › Password | Done |
| FR-6 | Edit profile; skills don't move teams | Settings › Profile (help text plus `saveProfile`) | Done |
| FR-7 | Opt in to a team, with an opt-out reason | Settings › Team and consent | Done |
| FR-8 | Quiz at the chosen level | `learner/quiz`, `startQuiz` | Done |
| FR-9 | 10–15 questions, random, 20 minutes | `startQuiz` draws 15 from the active bank; `QUIZ_MINUTES` | Done |
| FR-10 | Score 0–100 and set the level by cut-offs | `quizSkillLevel` (tested) | Done |
| FR-11 | One retake after 7 days, before placement | `startQuiz` (`QUIZ_RETAKE_DAYS`) | Done |
| FR-12 | Admin quiz bank | `admin/quiz`, `saveQuizQuestion`, `setQuizQuestionActive` | Done |
| FR-61 | Readiness questions | Settings › Readiness | Done |
| FR-62 | High/Medium/Low rule | `readinessLevel` (tested) | Done |
| FR-63 | Update anytime; staff see only level and time | Settings; `lib/workspace/selectors.ts` hides the answers | Done |

## Hot Topics, check questions, articles and events

| ID | Requirement | Where | Status |
| --- | --- | --- | --- |
| FR-13 | Admin creates topics, video ≤ 10 min enforced | `admin/hot-topics`, `saveTopic` | Done |
| FR-14 | Browse and search by category, level, phase | `learner/hot-topics` filters and the search palette | Done |
| FR-15 | Topic page: video, copy prompt, checks, task, deep dive | `learner/hot-topics/[id]` | Done |
| FR-16 | Views, prompt copies, completion | `trackTopic` | Done |
| FR-17 | Coaching master-prompt template | Topic form pre-filled from Appendix A | Done |
| FR-18 | Rate 1–5 with a comment | `rateTopic` | Done |
| FR-19 | One deep-dive request after the checks | `requestDeepDive` | Done |
| FR-20 | Threshold alert | Admin reports › Deep-dive demand plus an audit entry. The admin email needs the mail queue | Partial |
| FR-21 | Admin creates events | `admin/events`, `saveEvent` | Done |
| FR-22 | Publish invites requesters | Publishing lists the event and adds a calendar file. Invitation email needs the mail queue | Partial |
| FR-23 | Register up to capacity | `learner/events`, `toggleRegistration` | Done |
| FR-24 | Reminders 24 h and 1 h before | Needs the scheduler and mail queue | Backend |
| FR-25 | Edit or cancel, with email | Edit and cancel (with confirmation) work. The email needs the mail queue | Partial |
| FR-26 | Recording link and attendance | `admin/events`: **Add recording** and **Mark attendance** (`markAttendance`) | Done |
| FR-64 | 3–5 check questions per topic | `saveCheckQuestion` enforces it | Done |
| FR-65 | Answers and explanations after submitting; retries | `submitCheckAnswers` (answers stay on the server) | Done |
| FR-66 | Check scores feed progress | Learner dashboard and portfolio. Platform-wide trends need the backend (shown as a notice in Admin › Reports) | Partial |
| FR-67 | Articles with optional cover image | `admin/articles`, `saveArticle`. Cover upload needs file storage | Partial |
| FR-68 | Browse, reading time, offline | `learner/articles`. The service worker keeps opened pages | Done |
| FR-69 | Topic and milestone pages list articles | `learner/hot-topics/[id]`, `learner/project/[order]` | Done |

## Teams

| ID | Requirement | Where | Status |
| --- | --- | --- | --- |
| FR-27 | Formation rules with a preview | `formTeams` (tested), `admin/teams` preview, `confirmFormation` | Done |
| FR-28 | Swap, move, change leader, dissolve, with reason logged | `admin/teams`: **Move member** (`moveMember`, move or swap) and **Change** (`adminTeamChange`) | Done |
| FR-29 | Team email on confirmation | In-app notification. The email needs the mail queue | Partial |
| FR-30 | WhatsApp numbers for leader and staff only | `selectors.ts` (`canSeeWhatsapp`) | Done |
| FR-31 | Group link format check | `submitGroupLink`, `isWhatsappGroupLink` (tested) | Done |
| FR-32 | Supervisor with the fewest teams (cap) | `formTeams` assignment, Admin › Platform settings | Done |
| FR-33 | Approved team becomes Active | `reviewGroup` | Done |
| FR-34 | Link reminders (3 days) and leader pass (5 days) | Needs the scheduler | Backend |
| FR-35 | Flag inactive; supervisor confirms | `flagInactive`, `confirmInactive` | Done |
| FR-36 | Leave with a reason | `leaveTeam` | Done |
| FR-37 | Team page | `learner/team`, `supervisor/teams/[id]` | Done |
| FR-70 | Readiness mix in formation | `formTeams` and the preview badges | Done |
| FR-71 | Leader responsibilities, then accept | `learner/team` responsibilities panel, `acceptLeadership`. Auto-pass after 2 days needs the scheduler | Partial |
| FR-72 | One or two roles per member | `assignRoles` | Done |
| FR-73 | Daily report under a minute, offline | `learner/reports`, `submitDailyReport`, offline queue (`components/workspace/report.tsx`) | Done |
| FR-74 | 19:00 reminder; leave dates | Leave works (`setMemberLeave`). The reminder needs the scheduler | Partial |
| FR-75 | 14-day tracking grid | `learner/team`, `supervisor/teams/[id]` | Done |
| FR-76 | 3 missed days alert | Flagged on the grid and on the supervisor dashboard. The email needs the mail queue | Partial |
| FR-77 | Blockers on the supervisor dashboard until solved | `supervisor`, `resolveBlocker` | Done |

## Projects, milestones and reviews

| ID | Requirement | Where | Status |
| --- | --- | --- | --- |
| FR-38 | Leader creates the project | `createProject` | Done |
| FR-39 | Leader sets due dates; supervisor adjusts | `setMilestoneDue` (leader), and **Due date** on the review page (`adjustMilestoneDue`) | Done |
| FR-40 | Linked topic watched first | `markMilestoneTopicWatched` | Done |
| FR-41 | Link or file (PDF, DOCX, ZIP ≤ 10 MB) | `submitMilestone` validates type and size. Storing the file needs file storage | Partial |
| FR-42 | AI-use declaration | `submitMilestone` | Done |
| FR-43 | Every member confirms a contribution | `confirmContribution` | Done |
| FR-44 | Checklist review | `supervisor/reviews/[projectId]/[order]`, `reviewSubmission`. The team email needs the mail queue | Done (in-app) |
| FR-45 | Record the "explain your work" outcome | Review page › **Explain your work** (`recordExplanation`) | Done |
| FR-46 | Submission history | Review page › Earlier versions; milestone page | Done |
| FR-47 | Overdue marking and email | `isOverdue` badges. The email needs the mail queue | Partial |
| FR-48 | Complete project in a public showcase (with consent) | Projects are marked Complete. The showcase needs the team-consent record from the backend | Backend |

## Certificates, badges and notifications

| ID | Requirement | Where | Status |
| --- | --- | --- | --- |
| FR-49 | Certificate rule (6 of 8 contributions) | `reviewSubmission` calls `issueCertificates` when M8 is approved; the team is marked Completed | Done |
| FR-50 | Certificate fields and QR code | `learner/certificates/[code]` shows every field and the public verify URL. The QR image needs a QR encoder; no dependency was added without approval | Partial |
| FR-51 | Public verification page | `/verify` and `/verify/[code]` (no sign-in; `lib/workspace/public.ts`) | Done |
| FR-52 | Download; admin revokes with a reason | Print-to-PDF, `revokeCertificate` | Done |
| FR-53 | Badge per 10 topics | Portfolio, learner dashboard | Done |
| FR-54 | Every email is also a notification | `/notifications` | Done |
| FR-55 | Learner dashboard | `learner` | Done |
| FR-56 | Supervisor dashboard | `supervisor` | Done |
| FR-57 | Create, edit, deactivate, assign roles | `admin/users`: **Add user** (`createUser`), role select, deactivate. The invitation email needs the mail queue | Done (in-app) |
| FR-58 | Admin content and settings | `admin/*` | Done |
| FR-59 | Admin reports and CSV | `admin`: registrations, quiz levels, gender split, readiness, teams, milestones, review times, daily-report rate, report hours, attendance, topics, deep dives, certificates, and a Summary CSV. Check-score trends and platform-wide active hours need the backend | Partial |
| FR-60 | Audit log | `admin/audit`; every team, review and certificate change calls `audit()` | Done |

## Portfolio, participation and PWA

| ID | Requirement | Where | Status |
| --- | --- | --- | --- |
| FR-78 | `/u/username`, public or private | `/u/[username]` (private answers like unknown); learner toggle in `learner/portfolio` | Done (sample directory) |
| FR-79 | Portfolio contents | `learner/portfolio`, `/u/[username]` | Done |
| FR-80 | Participation hours formula | `participationHours` (tested) | Done |
| FR-81 | 60-second activity signal | `ActivitySignal` in `components/workspace/pwa.tsx`, `recordActivity` | Done |
| FR-82 | Learner progress | `learner` | Done |
| FR-83 | Installable PWA | `app/manifest.ts`, `public/sw.js`, `public/icons/`; **Install WeCodee** or iPhone steps in the account menu | Done |
| FR-84 | Offline after first visit, with a banner | `public/sw.js` keeps the shell and the pages you opened; offline banner in the shell | Done |
| FR-85 | Offline queue | Daily reports are queued with a "waiting to send" badge. Background Sync and queued check answers need the learning API | Partial |
| FR-86 | Low-data mode | Settings › Preferences; on by default for Low readiness | Done |
| FR-87 | Web push reminders | Needs a push service and VAPID keys | Backend |

## Non-functional requirements

| ID | Where | Status |
| --- | --- | --- |
| NFR-1, NFR-14 | Videos from YouTube; low-data mode; sample pages are small; service-worker cache | Done (measure on the host) |
| NFR-2, NFR-9, NFR-10 | Hosting, uptime and backups | Backend |
| NFR-3 | Mobile-first; watch, copy, report and submit are each ≤ 3 taps from the dashboard | Done |
| NFR-4 | English copy is in the components; moving it to language files is still to do | Partial |
| NFR-5 | Better Auth hashing, CSRF on Server Actions, rate limits on auth | Done (auth); the SRS names bcrypt and Laravel, but this stack is Next.js |
| NFR-6 | Every action checks the role on the server; `RoleGate` per dashboard | Done |
| NFR-7 | Download my data and request deletion in Settings | Done (deletion is confirmed by a person) |
| NFR-8 | Upload type and size validation | Partial (storage outside the web root needs file storage) |
| NFR-11 | README, checks | Done |
| NFR-12 | Times shown in Africa/Kigali (`formatDate`, `kigaliDay`) | Done |
| NFR-13 | Labels on every field, contrast, focus rings, skip link, reduced motion | Done |
| NFR-15 | Manifest, service worker, icons | Done (needs HTTPS in production) |
| NFR-16 | Queued reports survive closing the app and are sent once | Done for reports |
| NFR-17 | Activity signal is one small Server Action call a minute | Done |

## Backend dependencies

These services don't exist yet. Without them, the dashboard shows what happened in the app and doesn't claim that anything was sent:

- **Learning database and API:** persists everything that's in sample memory today, aggregates check-score trends and active time across learners, and provides team consent for the showcase.
- **Mail queue (SMTP):** every email in §6.1. Each one already appears as an in-app notification.
- **Scheduler (cron):** event reminders, the 19:00 report reminder, group-link reminders, leader auto-pass, overdue emails and weekly team formation.
- **File storage:** milestone files and article covers.
- **Web push (VAPID):** FR-87.
- **QR encoder:** FR-50. Needs either an approved dependency or a server-side generator.
