import { loadWorkspace } from "@/lib/workspace/data";
import { personById, teamProject } from "@/lib/workspace/selectors";
import { formatDate, kigaliDay, nowMs } from "@/lib/workspace/rules";
import { Badge, Card, Feedback, Forbidden, Meter, PageHeader, QuietLink, Stats } from "@/components/workspace/ui";
import { CsvButton } from "@/components/workspace/bits";

export const metadata = { title: "Reports" };

/** FR-59: platform reports with CSV export. */
// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function AdminReports() {
  const { viewer, data } = await loadWorkspace("/admin");
  if (viewer.role !== "admin") return <Forbidden needs="admins" />;

  const learners = data.people.filter((p) => p.role === "learner");
  const active = learners.filter((p) => p.active);
  const placed = learners.filter((p) => p.teamId);
  const pool = learners.filter((p) => p.active && p.optedIn && !p.teamId);
  const teams = data.teams.filter((t) => t.status !== "dissolved");
  const projects = data.projects;
  const approvedMilestones = projects.flatMap((p) => p.milestones).filter((m) => m.status === "approved").length;
  const topics = [...data.topics].filter((t) => t.published).sort((a, b) => b.views - a.views);
  const maxViews = Math.max(1, ...topics.map((t) => t.views));
  const demand = [...data.topics].filter((t) => t.deepDiveRequests > 0).sort((a, b) => b.deepDiveRequests - a.deepDiveRequests);
  const levels = (["Beginner", "Intermediate", "Advanced"] as const).map((l) => [l, learners.filter((p) => p.level === l).length] as const);
  const certs = data.certificates.filter((c) => !c.revokedAt).length;
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);
  const bar = (label: string, n: number, d: number, tone?: "red") => (
    <div className="ws-bar" key={label}><span>{label}</span><span className="ws-bar-track"><span style={{ width: `${pct(n, d)}%` }} data-tone={tone} /></span><span className="num">{n}</span></div>
  );
  const genders = (["female", "male"] as const).map((g) => [g === "female" ? "Women" : "Men", learners.filter((p) => p.gender === g).length] as const);
  const readiness = (["High", "Medium", "Low"] as const).map((r) => [r, learners.filter((p) => p.readinessLevel === r).length] as const);

  // Daily-report rate: reports from members of active teams over the last 5 Kigali working days.
  const now = nowMs();
  const workdays: string[] = [];
  for (let i = 1; workdays.length < 5 && i < 14; i++) {
    const t = now - i * 86_400_000;
    const wd = new Date(t + 2 * 3_600_000).getUTCDay();
    if (wd !== 0 && wd !== 6) workdays.push(kigaliDay(t));
  }
  const reporters = data.teams.filter((t) => t.status === "active").flatMap((t) => t.members.filter((m) => !m.onLeave).map((m) => m.userId));
  const expected = reporters.length * workdays.length;
  const sent = data.reports.filter((r) => reporters.includes(r.userId) && workdays.includes(r.date)).length;
  const reportHours = data.reports.reduce((sum, r) => sum + Math.min(r.hours, 12), 0);

  // Review turnaround: submission to supervisor decision.
  const reviewed = projects.flatMap((p) => p.milestones.flatMap((m) => m.submissions)).filter((s) => s.review);
  const reviewHours = reviewed.map((s) => (new Date(s.review!.createdAt).getTime() - new Date(s.createdAt).getTime()) / 3_600_000).filter((h) => h >= 0);
  const avgReview = reviewHours.length ? Math.round(reviewHours.reduce((a, b) => a + b, 0) / reviewHours.length) : null;
  const waitingReview = projects.flatMap((p) => p.milestones).filter((m) => m.status === "submitted").length;

  const pastEvents = data.events.filter((e) => e.status !== "cancelled" && new Date(e.startsAt).getTime() < now);
  const attended = pastEvents.reduce((sum, e) => sum + (e.attendees?.length ?? 0), 0);
  const registered = pastEvents.reduce((sum, e) => sum + e.registered, 0);
  const marked = pastEvents.filter((e) => e.attendees).length;

  const summaryRows: (string | number)[][] = [["Metric", "Value"],
    ["Registered learners", learners.length], ["Women", genders[0][1]], ["Men", genders[1][1]],
    ...levels.map(([l, n]) => ["Quiz level: " + l, n] as [string, number]),
    ...readiness.map(([r, n]) => ["Readiness: " + r, n] as [string, number]),
    ["Teams active", teams.filter((t) => t.status === "active").length], ["Teams completed", teams.filter((t) => t.status === "completed").length],
    ["Milestones approved", approvedMilestones], ["Average review time (hours)", avgReview ?? ""], ["Daily-report rate, last 5 working days (%)", pct(sent, expected)],
    ["Report hours logged", reportHours], ["Event attendance (marked events)", attended], ["Deep-dive requests", data.topics.reduce((a, t) => a + t.deepDiveRequests, 0)], ["Certificates issued", certs]];

  const teamRows: (string | number)[][] = [["Team", "Level", "Leader", "Supervisor", "Status", "Project", "Milestones approved"], ...teams.map((t) => {
    const p = teamProject(data, t.id);
    return [t.name, t.level, personById(data, t.leaderId)?.name ?? "", personById(data, t.supervisorId)?.name ?? "", t.status, p?.title ?? "", p?.milestones.filter((m) => m.status === "approved").length ?? 0];
  })];
  const topicRows: (string | number)[][] = [["Hot Topic", "Category", "Level", "Views", "Prompt copies", "Deep-dive requests"], ...data.topics.map((t) => [t.title, t.category, t.level, t.views, t.promptCopies, t.deepDiveRequests])];

  return (
    <div className="ws-content">
      <PageHeader eyebrow="Admin" title="Reports" lead="Registrations, placement, project progress and Hot Topic engagement across the platform." actions={<><CsvButton name="wecodee-summary.csv" rows={summaryRows}>Summary CSV</CsvButton><CsvButton name="wecodee-teams.csv" rows={teamRows}>Teams CSV</CsvButton><CsvButton name="wecodee-hot-topics.csv" rows={topicRows}>Hot Topics CSV</CsvButton></>} />
      <Stats items={[
        { label: "Registered learners", value: learners.length, icon: "user" },
        { label: "Placed in teams", value: placed.length, icon: "users" },
        { label: "Approved milestones", value: approvedMilestones, icon: "flag" },
        { label: "Certificates issued", value: certs, icon: "award" },
      ]} />

      <div className="ws-grid-even ws-section">
        <Card title="Learners">
          <dl className="ws-kv">
            <dt>Active</dt><dd>{active.length} of {learners.length}</dd>
            <dt>Waiting for a team</dt><dd>{pool.length} <QuietLink href="/admin/teams">Form teams</QuietLink></dd>
            <dt>Opted out of teams</dt><dd>{learners.filter((p) => !p.optedIn).length}</dd>
            <dt>Quiz not taken</dt><dd>{learners.filter((p) => p.quizScore === null).length}</dd>
          </dl>
          <div className="ws-bars" style={{ marginTop: 16 }}>
            {levels.map(([l, n]) => <div className="ws-bar" key={l}><span>{l}</span><span className="ws-bar-track"><span style={{ width: `${learners.length ? (n / learners.length) * 100 : 0}%` }} /></span><span className="num">{n}</span></div>)}
          </div>
        </Card>
        <Card title="Teams">
          <dl className="ws-kv">
            <dt>Active</dt><dd>{teams.filter((t) => t.status === "active").length}</dd>
            <dt>Waiting for a group</dt><dd>{teams.filter((t) => t.status === "pending_group").length}</dd>
            <dt>Completed</dt><dd>{teams.filter((t) => t.status === "completed").length}</dd>
            <dt>Projects</dt><dd>{projects.length} ({projects.filter((p) => p.status === "complete").length} complete)</dd>
          </dl>
        </Card>
      </div>

      <div className="ws-grid-even ws-section">
        <Card title="Gender and readiness">
          <p className="ws-small ws-muted" style={{ marginBottom: 9 }}>Teams aim for at least 2 women and 2 men, at least 2 High and at most 2 Low readiness.</p>
          <div className="ws-bars">{genders.map(([g, n]) => bar(g, n, learners.length))}</div>
          <div className="ws-bars" style={{ marginTop: 14.5 }}>{readiness.map(([r, n]) => bar(r, n, learners.length, r === "Low" ? "red" : undefined))}</div>
        </Card>
        <Card title="Delivery">
          <dl className="ws-kv">
            <dt>Daily-report rate</dt><dd>{pct(sent, expected)}% <span className="ws-faint ws-small">({sent} of {expected}, last 5 working days)</span></dd>
            <dt>Report hours logged</dt><dd>{reportHours} h</dd>
            <dt>Average review time</dt><dd>{avgReview === null ? "–" : avgReview < 48 ? `${avgReview} h` : `${Math.round(avgReview / 24)} days`} <span className="ws-faint ws-small">({reviewed.length} reviews)</span></dd>
            <dt>Waiting for review</dt><dd>{waitingReview}</dd>
            <dt>Event attendance</dt><dd>{marked ? <>{attended} attended of {registered} registered</> : <span className="ws-faint">Not marked yet</span>} <QuietLink href="/admin/events">Events</QuietLink></dd>
          </dl>
        </Card>
      </div>
      <div className="ws-section">
        <Feedback tone="info">Check-score trends and platform-wide participation hours need every learner’s activity, which the sample keeps per signed-in person. They appear here once the learning backend aggregates them (FR-59, FR-81).</Feedback>
      </div>

      <div className="ws-grid-2 ws-section">
        <Card title="Most viewed Hot Topics" pad={false}>
          <div className="ws-card-body ws-bars">
            {topics.slice(0, 8).map((t) => <div className="ws-bar" key={t.id}><span title={t.title} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span><span className="ws-bar-track"><span style={{ width: `${(t.views / maxViews) * 100}%` }} /></span><span className="num">{t.views}</span></div>)}
          </div>
        </Card>
        <Card title="Deep-dive demand" pad={false}>
          <ul className="ws-list">
            {demand.map((t) => (
              <li key={t.id}>
                <div className="ws-list-main"><p>{t.title}</p><p>{t.deepDiveRequests} of {data.settings.deepDiveThreshold} requests</p><Meter value={Math.min(t.deepDiveRequests, data.settings.deepDiveThreshold)} max={data.settings.deepDiveThreshold} tone="red" label={`${t.title} demand`} /></div>
                {t.deepDiveRequests >= data.settings.deepDiveThreshold && <Badge tone="red">Schedule</Badge>}
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <p className="ws-small ws-faint">Generated {formatDate(new Date().toISOString(), { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} (Kigali time).</p>
    </div>
  );
}
