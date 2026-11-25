import Link from "next/link";
import Image from "next/image";
import { loadWorkspace } from "@/lib/workspace/data";
import {
  currentMilestone, isLeader, isOverdue, learnerStats, myTeam, personById, profileComplete, reportStreak,
  teamProject, upcomingEvents,
} from "@/lib/workspace/selectors";
import { formatDate, formatDateTime, kigaliDay, relativeDays } from "@/lib/workspace/rules";
import { Badge, Card, EmptyState, Mascot, MilestoneBadge, QuietLink, Stats } from "@/components/workspace/ui";
import { MascotClip, SearchLauncher } from "@/components/workspace/bits";
import { Icon } from "@/components/workspace/Icon";
import { MilestonePath } from "@/components/workspace/MilestonePath";

export const metadata = { title: "Overview" };

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
  const onboarding = !team;
  const steps = [
    { label: "Verify your email", detail: "Done when you signed up.", done: true, href: null },
    { label: "Complete your builder profile", detail: "Contact, skills and a few readiness questions.", done: profileDone, href: "/settings" },
    { label: "Take the skills quiz", detail: "20 minutes. It sets your level for team matching.", done: quizDone, href: profileDone ? "/learner/quiz" : null },
    { label: "Get placed in a team of five", detail: data.profile.optedIn ? "Teams form every week from the placement pool." : "You opted out of a project team.", done: Boolean(team), href: quizDone ? "/learner/team" : null },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="ws-content">
      <section className="ws-hero" aria-labelledby="ws-hero-title">
        {nextEvent ? (
          <Link href="/learner/events" className="ws-pill">
            <Image src="/brand/sheep-mark.png" alt="" width={20} height={20} />
            {nextEvent.title} · {relativeDays(nextEvent.startsAt)}
            <Icon name="chevronRight" size={12.5} />
          </Link>
        ) : (
          <span className="ws-pill"><Image src="/brand/sheep-mark.png" alt="" width={20} height={20} />Welcome to WeCodee</span>
        )}
        <h1 id="ws-hero-title" className="ws-hero-title">
          <span>{onboarding ? <>Let’s get you building, {first}<span style={{ color: "var(--ws-red)" }}>.</span></> : <>What are we building today<span style={{ color: "var(--ws-red)" }}>?</span></>}</span>
        </h1>
        <SearchLauncher />
      </section>

      {onboarding && (
        <section className="ws-card" style={{ marginBottom: 24, overflow: "hidden" }} aria-labelledby="ws-onboarding">
          <div className="ws-grid-even" style={{ alignItems: "center", gap: 0 }}>
            <div style={{ padding: "20px 21.5px" }}>
              <span className="ws-eyebrow">Getting started · {doneCount} of {steps.length}</span>
              <h2 id="ws-onboarding" className="ws-h2" style={{ fontSize: "1.125rem", letterSpacing: "-.035em" }}>Your desk is ready. Four small steps to your first team.</h2>
              <ol className="ws-steps" style={{ marginTop: 14, marginInline: -20 }}>
                {steps.map((s, i) => {
                  const current = !s.done && steps.slice(0, i).every((x) => x.done);
                  return (
                    <li key={s.label} className="ws-step" data-state={s.done ? "done" : current ? "current" : "locked"}>
                      <span className="ws-step-dot">{s.done ? <Icon name="check" size={11.5} /> : i + 1}</span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 600 }}>{s.label}</p>
                        <p className="ws-small ws-muted">{s.detail}</p>
                      </div>
                      {current && s.href && <Link href={s.href} className="ws-btn ws-btn-primary ws-btn-sm">Start<span className="ws-arrow" aria-hidden>→</span></Link>}
                    </li>
                  );
                })}
              </ol>
            </div>
            <MascotClip clip="preparing" lowData={data.profile.lowDataMode} style={{ aspectRatio: "16 / 10", width: "100%" }} />
          </div>
        </section>
      )}

      <div className="ws-launch" style={{ marginBottom: 24 }}>
        <article className="ws-card ws-launch-card ws-card-link">
          <div className="ws-launch-art"><Mascot scene="celebrate" /></div>
          <div className="ws-launch-body">
            <h3>{nextTopic && inProgress.includes(nextTopic) ? "Pick up where you left off" : "Learn something in 10 minutes"}</h3>
            <p>{nextTopic ? nextTopic.title + ". " + nextTopic.summary : "Short videos with a master prompt for your AI tutor."}</p>
            <Link href={nextTopic ? "/learner/hot-topics/" + nextTopic.id : "/learner/hot-topics"} className="ws-btn ws-btn-secondary ws-btn-sm">{nextTopic ? "Watch now" : "Browse Hot Topics"}</Link>
          </div>
        </article>
        <article className="ws-card ws-launch-card ws-card-link">
          <div className="ws-launch-art"><Mascot scene={team ? "desk" : "welcome"} /></div>
          <div className="ws-launch-body">
            <h3>{team ? (reportedToday ? "Today’s report is in" : "Post today’s report") : "Meet your future team"}</h3>
            <p>{team ? (reportedToday ? "Nice. You can still edit it until midnight." : "Done, next, blockers, hours. Under a minute, even offline.") : "Teams of five are matched by skills, time and connection, so nobody gets left behind."}</p>
            <Link href={team ? "/learner/reports" : "/learner/team"} className="ws-btn ws-btn-secondary ws-btn-sm">{team ? (reportedToday ? "Edit report" : "Write report") : "How teams work"}</Link>
          </div>
        </article>
        <article className="ws-card ws-launch-card ws-card-link">
          <div className="ws-launch-art"><Mascot scene="path" /></div>
          <div className="ws-launch-body">
            <h3>{milestone ? `Milestone ${milestone.order}: ${milestone.name}` : "Ship a real project"}</h3>
            <p>{milestone ? (milestone.dueDate ? `Due ${formatDate(milestone.dueDate)} (${relativeDays(milestone.dueDate)}). ` : "") + milestone.deliverable + "." : "Eight supervised milestones, from problem to deployment and a free certificate."}</p>
            <Link href={milestone ? "/learner/project/" + milestone.order : "/learner/project"} className="ws-btn ws-btn-secondary ws-btn-sm">{milestone ? "Open milestone" : "See the journey"}</Link>
          </div>
        </article>
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
            {project && milestone ? (
              <div className="ws-card-body" style={{ display: "grid", gap: 18 }}>
                <div className="ws-row-between ws-wrap">
                  <div>
                    <p style={{ fontWeight: 650, fontSize: ".9rem", letterSpacing: "-.02em" }}>{project.title}</p>
                    <p className="ws-small ws-muted">{project.solution}</p>
                  </div>
                  <MilestoneBadge status={milestone.status} overdue={isOverdue(milestone)} />
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
              <EmptyState compact still="door" title={quizDone ? "You’re in the placement pool" : "No team yet"}>
                {quizDone ? "We form teams every week. You’ll get an email the moment yours is ready." : "Take the skills quiz to join the placement pool."}
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
