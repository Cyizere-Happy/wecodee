/** Contextual help the mascot offers from the top bar, keyed by route prefix (longest match wins). */
export const helpTopics: { prefix: string; title: string; tips: string[] }[] = [
  { prefix: "/learner", title: "Your workspace", tips: ["Press Ctrl K (⌘K on Mac) to jump anywhere.", "Watch, copy a prompt, post a report or submit a milestone: each is three taps or fewer from here.", "The red dot on the bell means something needs you."] },
  { prefix: "/learner/hot-topics", title: "Hot Topics", tips: ["Every video is 10 minutes or less.", "Copy the master prompt into any AI assistant. It keeps the AI in tutor mode, not answer mode.", "Answer the check questions to unlock a deep-dive request."] },
  { prefix: "/learner/articles", title: "Articles", tips: ["Articles take 5 minutes or less to read.", "Save an article to find it again from the Articles page."] },
  { prefix: "/learner/events", title: "Live events", tips: ["All times are shown in Kigali time.", "Download the calendar file so your phone reminds you.", "You’ll also get emails 24 hours and 1 hour before."] },
  { prefix: "/learner/quiz", title: "Skills quiz", tips: ["You have 20 minutes. Your answers save as you go.", "Your score decides your skill level, which is used to match your team.", "You can retake once, after 7 days, before you’re placed."] },
  { prefix: "/learner/team", title: "Your team", tips: ["Only your leader and supervisor can see WhatsApp numbers.", "Leaders assign one or two roles per member.", "Leaving a team needs a reason; your leader and supervisor are told."] },
  { prefix: "/learner/reports", title: "Daily reports", tips: ["It takes under a minute: done, next, blockers, hours.", "You can edit today’s report until midnight.", "Blockers stay visible to your supervisor until you mark them solved."] },
  { prefix: "/learner/project", title: "Project milestones", tips: ["One milestone is open at a time.", "Watch the linked Hot Topic before submitting.", "Every member confirms their own contribution before the leader submits."] },
  { prefix: "/learner/portfolio", title: "Portfolio", tips: ["Your email and WhatsApp number never appear on your portfolio.", "Portfolios of learners under 18 stay private unless a guardian approves."] },
  { prefix: "/learner/certificates", title: "Certificates", tips: ["Certificates are issued when your project is complete.", "You need confirmed contributions on at least 6 of 8 milestones.", "Anyone can check a certificate with its code."] },
  { prefix: "/settings", title: "Settings", tips: ["Low-data mode stops autoplay and loads videos only when you tap.", "Updating your readiness answers doesn’t move you to another team."] },
  { prefix: "/supervisor", title: "Supervisor dashboard", tips: ["Review submissions oldest first.", "Approve only when every checklist item is met.", "Blockers from daily reports appear here until they’re solved."] },
  { prefix: "/admin", title: "Admin dashboard", tips: ["Every change to teams, reviews and certificates is written to the audit log.", "Reports export as CSV.", "Preview team formation before confirming it."] },
];

export function helpFor(pathname: string) {
  return [...helpTopics].sort((a, b) => b.prefix.length - a.prefix.length).find((h) => pathname === h.prefix || pathname.startsWith(h.prefix + "/")) ?? helpTopics[0];
}
