import type { ArtName } from "./mascot";

const milestones = [
  {
    name: "Problem understanding", art: "milestones/problem",
    goal: "Show who has the problem and what evidence makes it worth solving.",
    example: "Example · Missed community appointments",
    steps: [
      { icon: "users", label: "People", detail: "Residents who book an appointment." },
      { icon: "search", label: "Evidence", detail: "Interview notes and booking records." },
      { icon: "clipboard", label: "Problem statement", detail: "People miss appointments when reminders arrive too late." },
    ],
  },
  {
    name: "Project proposal", art: "milestones/proposal",
    goal: "Agree on an achievable scope, a measurable objective, and who owns each part.",
    example: "Example · A first release",
    steps: [
      { icon: "flag", label: "Objective", detail: "Send a reminder the day before each appointment." },
      { icon: "clipboard", label: "Scope", detail: "Email reminders in the first release. SMS later." },
      { icon: "calendar", label: "Plan", detail: "Set review dates and name an owner for each task." },
    ],
  },
  {
    name: "Requirements (SRS)", art: "milestones/requirements",
    goal: "Write testable statements about what the software does and how well it needs to work.",
    example: "Example · Two kinds of requirements", compare: true,
    steps: [
      { icon: "clipboard", label: "Functional", detail: "A resident can reschedule an appointment." },
      { icon: "clock", label: "Nonfunctional", detail: "95% of reschedule requests finish within two seconds at the agreed load." },
    ],
  },
  {
    name: "System design", art: "milestones/design",
    goal: "Show how screens, application logic, and stored data work together.",
    example: "Example · Reading an appointment",
    steps: [
      { icon: "panel", label: "Browser", detail: "Requests the resident’s appointment." },
      { icon: "settings", label: "Application", detail: "Checks access and requests the record." },
      { icon: "book", label: "Database", detail: "Returns the appointment the caller may read." },
    ],
  },
  {
    name: "Implementation", art: "milestones/implementation",
    goal: "Build a small, working slice of the design and make the change easy to review.",
    example: "Example · Build a reschedule flow",
    steps: [
      { icon: "clipboard", label: "Pick one requirement", detail: "A resident can select a new slot." },
      { icon: "panel", label: "Build the full slice", detail: "Connect the screen, permission check, and saved update." },
      { icon: "check", label: "Review the change", detail: "Link the commits and record what works." },
    ],
  },
  {
    name: "Testing", art: "milestones/testing",
    goal: "Compare expected and actual behaviour, record defects, and check your fixes.",
    example: "Example · Two people choose the same slot",
    steps: [
      { icon: "clipboard", label: "Expected", detail: "Only the first request can book the slot." },
      { icon: "search", label: "Actual", detail: "Both requests received a confirmation." },
      { icon: "alert", label: "Issue", detail: "Record the duplicate booking, fix it, and rerun the case." },
    ],
  },
  {
    name: "Deployment", art: "milestones/deployment",
    goal: "Publish a working release and show someone else how to reproduce it.",
    example: "Example · Releasing the appointment app",
    steps: [
      { icon: "settings", label: "Configure", detail: "Set production environment values outside the repository." },
      { icon: "external", label: "Release", detail: "Deploy the tested version and record its live URL." },
      { icon: "check", label: "Verify", detail: "Try the main flow at the live URL and document the steps." },
    ],
  },
  {
    name: "Final presentation", art: "milestones/presentation",
    goal: "Demonstrate the solution and tell the story of what your team learned.",
    example: "Example · A short project demo",
    steps: [
      { icon: "users", label: "Explain the need", detail: "Show who misses appointments and why." },
      { icon: "play", label: "Demo the solution", detail: "Walk through booking and rescheduling in the live app." },
      { icon: "book", label: "Reflect", detail: "Share one trade-off and one improvement you would make next." },
    ],
  },
] as const satisfies readonly {
  name: string;
  art: ArtName;
  goal: string;
  example: string;
  compare?: boolean;
  steps: readonly { icon: string; label: string; detail: string }[];
}[];

export function milestoneGuide(order: number, name: string) {
  const guide = milestones[order - 1];
  if (guide?.name.toLowerCase() === name.trim().toLowerCase()) return guide;
}
