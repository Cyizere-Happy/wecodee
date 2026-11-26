import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import {
  currentMilestone, isLeader, isOverdue, learnerStats, myTeam, personById, profileComplete, reportStreak,
  teamProject, upcomingEvents,
} from "@/lib/workspace/selectors";
import { formatDate, formatDateTime, kigaliDay, relativeDays } from "@/lib/workspace/rules";
import { Badge, Card, EmptyState, MilestoneBadge, PageHeader, QuietLink, Stats } from "@/components/workspace/ui";
import { SearchLauncher } from "@/components/workspace/bits";
import { Icon } from "@/components/workspace/Icon";
import { MilestonePath } from "@/components/workspace/MilestonePath";
import { MascotGuide, VisualSequence } from "@/components/workspace/Guidance";
import { milestoneGuide } from "@/lib/workspace/milestone-guide";
import type { ArtName } from "@/lib/workspace/mascot";

export const metadata = { title: "Overview" };

// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function Overview() {
  const { viewer, data } = await loadWorkspace("/learner");
  const first = viewer.name.split(" ")[0];
  const team = myTeam(data, viewer);
  const project = team ? teamProject(data, team.id) : null;
  const milestone = project ? currentMilestone(project.milestones) : null;
  const stats = learnerStats(data);
  const events = upcomingEvents(data);
  const nextEvent = events.find((e) => data.registrations.includes(e.id)) ?? events[0];
  const reportedToday = data.reports.some((r) => r.userId === viewer.id && r.date === kigaliDay());
  const inProgress = data.topics.filter((t) => t.published && data.progress[t.id]?.viewedAt && !data.progress[t.id]?.completedAt);
  const nextTopic = inProgress[0]
    ?? data.topics.find((t) => t.published && t.phase === milestone?.order && !data.progress[t.id]?.completedAt)
    ?? data.topics.find((t) => t.published && !data.progress[t.id]?.completedAt);

  const profileDone = profileComplete(data);
  const quizDone = data.profile.quiz.status === "completed";
  const steps = [
    { label: "Verify your email", detail: "Done when you signed up.", icon: "check", done: true },
    { label: "Builder profile", detail: "Add your contact details and skills.", icon: "user", done: profileDone },
    { label: "Skills quiz", detail: "Set your readiness level for team matching.", icon: "quiz", done: quizDone },
    { label: "Team placement", detail: data.profile.optedIn ? "Teams form from the placement pool." : "You opted out of team placement.", icon: "users", done: Boolean(team) },
  ] as const;
  const nextStep = steps.findIndex((step) => !step.done);
  type NextAction = { art: ArtName; title: string; detail: string; href: string; label: string };
  let next: NextAction;
  if (!profileDone) {
    next = { art: "learner/welcome", title: "Set up your builder profile", detail: "Your contact details and skills help WeCodee prepare you for the readiness quiz and team placement.", href: "/settings", label: "Complete profile" };
  } else if (!quizDone) {
    next = { art: "learner/quiz", title: "Find your starting point", detail: "The skills quiz takes 20 minutes. WeCodee uses your result to match teammates by readiness.", href: "/learner/quiz", label: "Open skills quiz" };
  } else if (!team) {
    next = data.profile.optedIn
      ? { art: "learner/team", title: "You’re in the placement pool", detail: "You can keep learning while your team is being formed.", href: "/learner/team", label: "See placement status" }
      : { art: "learner/team", title: "Team placement is off", detail: "You can keep learning and change your placement preference in Settings.", href: "/settings", label: "Open settings" };
  } else if (project?.status === "complete") {
    next = { art: "states/project-complete", title: "Your project is complete", detail: "Check your certificate eligibility based on your confirmed milestone contributions.", href: "/learner/certificates", label: "View certificates" };
  } else if (!project || !milestone) {
    next = team.status === "active" && isLeader(team, viewer)
      ? { art: "learner/team", title: "Create your team project", detail: "Start with the problem your team wants to solve. Your project is where you’ll submit each deliverable.", href: "/learner/project", label: "Open project" }
      : { art: "learner/team", title: "Get ready to build together", detail: team.status === "active" ? "Your team leader can now create your project." : "Your project can start once the WhatsApp group is approved.", href: "/learner/team", label: "Open team page" };
  } else {
    const href = "/learner/project/" + milestone.order;
    if (milestone.status === "submitted") {
      next = { art: "states/waiting", title: "Your milestone is with your supervisor", detail: "You can read the decision and feedback on the milestone once the review is recorded.", href, label: "View submission" };
    } else if (milestone.status === "changes_requested") {
      next = { art: "states/feedback", title: "Your supervisor left feedback", detail: "Read the requested changes and agree on who will handle each revision before your team resubmits.", href, label: "Read feedback" };
    } else {
      next = { art: milestoneGuide(milestone.order, milestone.name)?.art ?? "states/submission", title: milestone.name, detail: milestone.deliverable + (milestone.dueDate ? " · Due " + formatDate(milestone.dueDate) : ""), href, label: "Open current milestone" };
    }
  }

  return (
    <div className="ws-content">
      <PageHeader
        title={<>Good to see you, {first}<span style={{ color: "var(--ws-red)" }}>.</span></>}
        lead={team ? "Check in on your team, project, and learning." : "Here’s where to pick up your WeCodee journey."}
        actions={<SearchLauncher />}
      />

      <div className="ws-guidance-intro">
        <MascotGuide art={next.art} title={next.title} action={<Link href={next.href} className="ws-btn ws-btn-primary">{next.label}<Icon name="arrowRight" size={14} /></Link>}>
          <p>{next.detail}</p>
        </MascotGuide>
        {!team && <VisualSequence label="Getting started" steps={steps.map((step, index) => ({
          ...step,
          state: step.done ? "done" : index === nextStep && (index !== 3 || data.profile.optedIn) ? "current" : "pending",
        }))} />}
        <nav aria-label="Learner shortcuts" className="ws-guidance-links">
          <Link href={nextTopic ? "/learner/hot-topics/" + nextTopic.id : "/learner/hot-topics"} className="ws-btn ws-btn-secondary ws-btn-sm">
            <Icon name="play" size={14} />{nextTopic ? (inProgress.includes(nextTopic) ? "Resume " : "Open ") + nextTopic.title : "Browse Hot Topics"}
          </Link>
          <Link href={team ? "/learner/reports" : "/learner/team"} className="ws-btn ws-btn-secondary ws-btn-sm">
            <Icon name={team ? "clipboard" : "users"} size={14} />{team ? reportedToday ? "Edit today’s report" : "Write today’s report" : "How teams work"}
          </Link>
          <Link href="/learner/project" className="ws-btn ws-btn-secondary ws-btn-sm"><Icon name="flag" size={14} />Project milestones</Link>
          {nextEvent && <Link href="/learner/events" className="ws-btn ws-btn-secondary ws-btn-sm"><Icon name="calendar" size={14} />{nextEvent.title} · {relativeDays(nextEvent.startsAt)}</Link>}
        </nav>
      </div>

      <Stats items={[
        { label: "Hours this week", value: stats.weekHours, unit: "h", icon: "clock" },
        { label: "Check score average", value: stats.average ?? "–", unit: stats.average !== null ? "%" : undefined, icon: "quiz" },
        { label: "Hot Topics completed", value: stats.completed, icon: "play" },
        { label: "Report streak", value: team ? reportStreak(data.reports, viewer.id) : "–", unit: team ? "days" : undefined, icon: "clipboard" },
      ]} />

      <div className="ws-grid-2" style={{ marginTop: 24 }}>
        <div className="ws-stack">
          <Card title="Project" action={project && <QuietLink href="/learner/project">All milestones</QuietLink>} pad={!project}>
            {project ? (
              <div className="ws-card-body" style={{ display: "grid", gap: 18 }}>
                <div className="ws-row-between ws-wrap">
                  <div>
                    <p style={{ fontWeight: 650, fontSize: ".9rem", letterSpacing: "-.02em" }}>{project.title}</p>
                    <p className="ws-small ws-muted">{project.solution}</p>
                  </div>
                  {milestone ? <MilestoneBadge status={milestone.status} overdue={isOverdue(milestone)} /> : <Badge tone="green">Complete</Badge>}
                </div>
                <MilestonePath milestones={project.milestones} />
              </div>
            ) : (
              <EmptyState compact scene="pathStart" title="No project yet">
                {team ? (isLeader(team, viewer) ? "Create your project once your WhatsApp group is approved." : "Your leader creates the project once the team is active.") : "Your project starts when you join a team."}
              </EmptyState>
            )}
          </Card>

          <Card title="Continue learning" action={<QuietLink href="/learner/hot-topics">All Hot Topics</QuietLink>} pad={false}>
            {inProgress.length ? (
              <ul className="ws-list">
                {inProgress.slice(0, 4).map((t) => (
                  <li key={t.id}>
                    <Icon name="play" size={14.5} className="ws-faint" />
                    <div className="ws-list-main"><Link href={"/learner/hot-topics/" + t.id} className="ws-link" style={{ textDecoration: "none" }}>{t.title}</Link><p>{t.category} · {Math.round(t.durationSec / 60)} min</p></div>
                    <Badge tone="blue">In progress</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact still="badge" title="Nothing in progress" actions={<Link href="/learner/hot-topics" className="ws-btn ws-btn-secondary ws-btn-sm">Find a topic</Link>}>
                Start a Hot Topic and it will wait for you here.
              </EmptyState>
            )}
          </Card>
        </div>

        <div className="ws-stack">
          <Card title="Team" action={team && <QuietLink href="/learner/team">Team page</QuietLink>}>
            {team ? (
              <div style={{ display: "grid", gap: 10 }}>
                <div className="ws-row-between"><strong style={{ fontWeight: 650 }}>{team.name}</strong><Badge tone={team.status === "active" ? "green" : "amber"}>{team.status === "active" ? "Active" : "Pending group"}</Badge></div>
                <dl className="ws-kv ws-small">
                  <dt>Leader</dt><dd>{team.leaderId === viewer.id ? "You" : personById(data, team.leaderId)?.name}</dd>
                  <dt>Supervisor</dt><dd>{personById(data, team.supervisorId)?.name}</dd>
                  <dt>Your roles</dt><dd>{team.members.find((m) => m.userId === viewer.id)?.roles.join(", ") || "Not assigned yet"}</dd>
                  <dt>Skill level</dt><dd>{data.profile.skillLevel}</dd>
                </dl>
              </div>
            ) : (
              <EmptyState compact still="door" title={quizDone && data.profile.optedIn ? "You’re in the placement pool" : "No team yet"}>
                {quizDone ? data.profile.optedIn ? "We form teams every week. You’ll get an email when yours is ready." : "You can opt into team placement in Settings." : "Take the skills quiz to join the placement pool."}
              </EmptyState>
            )}
          </Card>

          <Card title="Upcoming events" action={<QuietLink href="/learner/events">All events</QuietLink>} pad={false}>
            {events.length ? (
              <ul className="ws-list">
                {events.slice(0, 3).map((e) => (
                  <li key={e.id}>
                    <Icon name="calendar" size={14.5} className="ws-faint" />
                    <div className="ws-list-main"><p>{e.title}</p><p>{formatDateTime(e.startsAt)} · {e.platform}</p></div>
                    {data.registrations.includes(e.id) && <Badge tone="green">Going</Badge>}
                  </li>
                ))}
              </ul>
            ) : <EmptyState compact still="hourglass" title="Nothing scheduled">New sessions appear here when they’re published.</EmptyState>}
          </Card>

          <Card title="Certificates" action={<QuietLink href="/learner/certificates">View</QuietLink>}>
            <p className="ws-small ws-muted">
              {data.certificates.some((c) => c.userId === viewer.id)
                ? "You have certificates ready to download."
                : "Complete your project with contributions on at least 6 of 8 milestones to earn a free, verifiable certificate."}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
