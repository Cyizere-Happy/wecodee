/**
 * Domain types for the WeCodee workspace, modelled on SRS §7 (data model).
 * Every page and action talks to these shapes through `WorkspaceRepository`,
 * so a production adapter can replace the sample adapter without UI changes.
 */

export type Role = "learner" | "supervisor" | "admin";
export type Level = "Beginner" | "Intermediate" | "Advanced";
export type Readiness = "High" | "Medium" | "Low";
export type Gender = "female" | "male";

export type Viewer = {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** True when the session comes from the local preview, not Better Auth. */
  preview: boolean;
};

/** FR-61 readiness answers. */
export type ReadinessAnswers = {
  internetAccess: "home_wifi" | "mobile_data" | "school_wifi" | "cyber_cafe" | "none";
  internetReliability: "always" | "most_days" | "sometimes" | "rarely";
  dataBudget: "under_100mb" | "100_500mb" | "500mb_1gb" | "over_1gb";
  computerAccess: "own" | "shared" | "phone_only";
  powerReliability: "yes" | "sometimes" | "no";
  hoursPerDay: "under_1" | "1_2" | "2_4" | "over_4";
  preferredTime: "morning" | "afternoon" | "evening" | "weekend";
};

export type QuizState =
  | { status: "not_started" }
  | { status: "completed"; score: number; chosenLevel: Level; skillLevel: Level; takenAt: string; retakeUsed: boolean };

export type Profile = {
  userId: string;
  name: string;
  username: string;
  bio: string;
  whatsapp: string;
  gender: Gender;
  dateOfBirth: string;
  experienceLevel: Level;
  skillLevel: Level | null;
  skills: string[];
  languages: string[];
  readiness: ReadinessAnswers;
  readinessLevel: Readiness;
  lowDataMode: boolean;
  portfolioPublic: boolean;
  optedIn: boolean;
  optOutReason?: string;
  eventNews: boolean;
  quiz: QuizState;
  registeredAt: string;
};

export type CheckQuestion = {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

export type HotTopic = {
  id: string;
  title: string;
  summary: string;
  youtubeUrl: string;
  durationSec: number;
  category: string;
  level: Level;
  /** Milestone order (1–8) this topic belongs to, if any. */
  phase: number | null;
  masterPrompt: string;
  practiceTask: string;
  questions: CheckQuestion[];
  published: boolean;
  views: number;
  promptCopies: number;
  deepDiveRequests: number;
};

export type TopicProgress = {
  viewedAt?: string;
  promptCopiedAt?: string;
  completedAt?: string;
  rating?: number;
  comment?: string;
  firstScore?: number;
  bestScore?: number;
  attempts: number;
  deepDive?: { details: string; slot: "weekday_evening" | "weekend"; createdAt: string };
};

export type Article = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string[];
  wordCount: number;
  readingMin: number;
  publishedAt: string;
  topicIds: string[];
  milestoneOrders: number[];
  published: boolean;
};

export type EventStatus = "draft" | "published" | "cancelled" | "completed";

export type LiveEvent = {
  id: string;
  title: string;
  topicId: string | null;
  description: string;
  host: string;
  startsAt: string;
  durationMin: number;
  platform: "Google Meet" | "Zoom";
  meetingUrl: string;
  capacity: number | null;
  registered: number;
  status: EventStatus;
  recordingUrl?: string;
  /** FR-26: learners an admin marked as present. */
  attendees?: string[];
};

export type Person = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  level: Level;
  gender: Gender;
  skills: string[];
  readinessLevel: Readiness;
  preferredTime: ReadinessAnswers["preferredTime"];
  whatsapp: string;
  quizScore: number | null;
  activityScore: number;
  registeredAt: string;
  active: boolean;
  teamId: string | null;
  optedIn: boolean;
  /** FR-78: shown at /u/username. Private by default; under-18s need a guardian’s approval. */
  portfolioPublic?: boolean;
};

export type TeamStatus = "pending_group" | "active" | "completed" | "dissolved";
export type GroupStatus = "none" | "submitted" | "approved" | "rejected";

export type TeamMember = {
  userId: string;
  roles: string[];
  onLeave?: { from: string; to: string };
  flaggedInactive?: boolean;
};

export type Team = {
  id: string;
  name: string;
  level: Level;
  leaderId: string;
  leaderAccepted: boolean;
  supervisorId: string;
  whatsappLink?: string;
  groupStatus: GroupStatus;
  groupRejectReason?: string;
  status: TeamStatus;
  formedAt: string;
  members: TeamMember[];
};

export type DailyReport = {
  id: string;
  userId: string;
  date: string;
  done: string;
  next: string;
  blockers: string;
  blockerSolved: boolean;
  hours: number;
};

export type MilestoneStatus = "locked" | "open" | "submitted" | "changes_requested" | "approved";

export type Review = {
  supervisorId: string;
  decision: "approved" | "changes_requested";
  comments: string;
  createdAt: string;
};

export type Submission = {
  id: string;
  version: number;
  submittedBy: string;
  link?: string;
  fileName?: string;
  notes: string;
  aiDeclaration: string;
  contributions: { userId: string; text: string }[];
  createdAt: string;
  review?: Review;
};

export type MilestoneTemplate = {
  order: number;
  name: string;
  deliverable: string;
  topicId: string | null;
  checklist: string[];
};

export type Milestone = MilestoneTemplate & {
  dueDate: string | null;
  status: MilestoneStatus;
  topicWatched: boolean;
  submissions: Submission[];
  /** Contributions confirmed for the next submission (FR-43). */
  pendingContributions: { userId: string; text: string }[];
};

/** FR-45: a supervisor asked a member to explain part of the work. */
export type Explanation = { id: string; userId: string; milestone: number; topic: string; outcome: "clear" | "partly" | "unclear"; note: string; by: string; at: string };

export type Project = {
  id: string;
  teamId: string;
  title: string;
  problem: string;
  targetUsers: string;
  solution: string;
  plannedEnd: string;
  status: "proposed" | "in_progress" | "complete";
  milestones: Milestone[];
  explanations?: Explanation[];
};

export type Certificate = {
  code: string;
  userId: string;
  learnerName: string;
  projectTitle: string;
  role: string;
  completedAt: string;
  supervisorName: string;
  revokedAt?: string;
  revokeReason?: string;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  href?: string;
  createdAt: string;
  readAt?: string;
};

export type AuditEntry = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  createdAt: string;
};

export type QuizQuestion = {
  id: string;
  level: Level;
  topic: string;
  question: string;
  options: string[];
  correct: number;
  active: boolean;
};

export type ActivityDay = {
  date: string;
  activeMin: number;
  eventMin: number;
  reportHours: number;
};

export type PlatformSettings = {
  deepDiveThreshold: number;
  teamSize: number;
  supervisorCap: number;
  reportReminderTime: string;
  missedDaysAlert: number;
  leaderResponseDays: number;
  groupLinkReminderDays: number;
};

export type ActionResult = { ok: true; message: string } | { ok: false; message: string; fields?: Record<string, string> };
