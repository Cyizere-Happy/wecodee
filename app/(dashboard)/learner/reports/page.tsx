import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import { currentMilestone, isLeader, missedStreak, myTeam, personById, reportGrid, reportStreak, teamProject, workingDays } from "@/lib/workspace/selectors";
import { formatDate, kigaliDay, nowMs } from "@/lib/workspace/rules";
import { resolveBlocker } from "@/lib/workspace/actions";
import { Badge, Card, EmptyState, Feedback, MilestoneBadge, PageHeader, Stats } from "@/components/workspace/ui";
import { ActionButton } from "@/components/workspace/forms";
import { ReportForm } from "@/components/workspace/report";
import { ReportGrid } from "@/components/workspace/ReportGrid";

export const metadata = { title: "Daily reports" };

export default async function Reports() {
  const { viewer, data, scenario } = await loadWorkspace("/learner/reports");
  const team = myTeam(data, viewer);
  if (!team) {
    return (
      <div className="ws-content ws-content-narrow">
        <PageHeader eyebrow="Build" title="Daily reports" />
        <div className="ws-card"><EmptyState scene="desk" title="Reports start with your team" actions={<Link href="/learner/team" className="ws-btn ws-btn-secondary">About teams</Link>}>Once you’re placed, you’ll post a short update each working day: done, next, blockers and hours.</EmptyState></div>
      </div>
    );
  }

  const today = kigaliDay();
  const mine = data.reports.find((r) => r.userId === viewer.id && r.date === today);
  const days = workingDays(14);
  const grid = reportGrid(team, data.reports, days);
  const teamIds = new Set(team.members.map((m) => m.userId));
  const recent = data.reports.filter((r) => teamIds.has(r.userId) && days.includes(r.date));
  const hours = recent.reduce((s, r) => s + Math.min(12, r.hours), 0);
  const blockers = data.reports.filter((r) => teamIds.has(r.userId) && r.blockers && !r.blockerSolved).sort((a, b) => b.date.localeCompare(a.date));
  const project = teamProject(data, team.id);
  const milestone = project ? currentMilestone(project.milestones) : null;
  const alerts = grid.filter((row) => missedStreak(row.cells) >= data.settings.missedDaysAlert);
  const leader = isLeader(team, viewer);
  const onLeaveToday = team.members.find((m) => m.userId === viewer.id)?.onLeave;
  const weekday = new Date(nowMs() + 2 * 3_600_000).getUTCDay();

  return (
    <div className="ws-content">
      <PageHeader eyebrow="Build" title="Daily reports" lead={`Under a minute, every working day. Reminders go out at ${data.settings.reportReminderTime} if you haven’t posted.`} />

      {leader && alerts.map((a) => {
        const name = personById(data, a.userId)?.name ?? "A member";
        return <div key={a.userId} style={{ marginBottom: 12 }}><Feedback tone="warn">{name} has missed {missedStreak(a.cells)} working days in a row. Check in with them, or flag them as inactive from the <Link href="/learner/team" className="ws-link">team page</Link>.</Feedback></div>;
      })}

      <div className="ws-grid-2">
        <div className="ws-stack">
          <Card title={<div><h2 className="ws-h3">Today · {formatDate(new Date().toISOString(), { weekday: "long", day: "numeric", month: "long" })}</h2><p className="ws-small ws-muted">{mine ? "Posted. You can edit it until midnight." : "Not posted yet."}</p></div>} action={mine ? <Badge tone="green">Posted</Badge> : <Badge tone="amber">Due {data.settings.reportReminderTime}</Badge>}>
            {weekday === 0 || weekday === 6 ? <Feedback tone="info">It’s the weekend. Reports are optional today.</Feedback> : null}
            {onLeaveToday && today >= onLeaveToday.from && today <= onLeaveToday.to ? <Feedback tone="info">You’re on leave until {formatDate(onLeaveToday.to + "T12:00:00Z")}. No reminders will be sent.</Feedback> : null}
            <div style={{ marginTop: 8 }}><ReportForm queueKey={`wc-report-queue:${viewer.id}:${scenario}:${team.id}`} initial={mine ? { done: mine.done, next: mine.next, blockers: mine.blockers, hours: mine.hours } : null} hasToday={Boolean(mine)} /></div>
          </Card>

          <Card title="Team tracking · last 14 working days" action={milestone && <span className="ws-row ws-small" style={{ gap: 6 }}>Milestone {milestone.order} <MilestoneBadge status={milestone.status} /></span>}>
            <ReportGrid days={days} rows={grid.map((row) => ({ ...row, name: row.userId === viewer.id ? "You" : (personById(data, row.userId)?.name ?? "Member").split(" ")[0], hours: data.reports.filter((r) => r.userId === row.userId && days.includes(r.date)).reduce((s, r) => s + Math.min(12, r.hours), 0) }))} />
          </Card>
        </div>

        <div className="ws-stack">
          <Stats items={[
            { label: "Your streak", value: reportStreak(data.reports, viewer.id), unit: "days" },
            { label: "Team hours", value: Math.round(hours * 10) / 10, unit: "h" },
          ]} columns={2} />
          <Card title="Open blockers" action={<Badge plain>{blockers.length}</Badge>} pad={false}>
            {blockers.length ? (
              <ul className="ws-list">
                {blockers.map((b) => (
                  <li key={b.id} style={{ alignItems: "flex-start" }}>
                    <div className="ws-list-main" style={{ display: "grid", gap: 2 }}>
                      <p style={{ fontWeight: 500, whiteSpace: "normal" }}>{b.blockers}</p>
                      <p>{b.userId === viewer.id ? "You" : personById(data, b.userId)?.name} · {formatDate(b.date + "T12:00:00Z")}</p>
                    </div>
                    {b.userId === viewer.id && <ActionButton run={resolveBlocker.bind(null, b.id)} variant="ghost" icon="check">Solved</ActionButton>}
                  </li>
                ))}
              </ul>
            ) : <EmptyState compact still="medal" title="No open blockers">Nothing is stopping the team right now.</EmptyState>}
          </Card>
          <Card title="Your recent reports" pad={false}>
            <ul className="ws-list">
              {data.reports.filter((r) => r.userId === viewer.id).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map((r) => (
                <li key={r.id} style={{ alignItems: "flex-start" }}>
                  <div className="ws-list-main" style={{ display: "grid", gap: 2 }}>
                    <p style={{ whiteSpace: "normal", fontWeight: 500 }}>{r.done}</p>
                    <p>{formatDate(r.date + "T12:00:00Z", { weekday: "short", day: "numeric", month: "short" })} · {r.hours} h</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
