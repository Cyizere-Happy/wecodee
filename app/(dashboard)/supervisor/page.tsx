import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import { isOverdue, openBlockers, personById, supervisesTeam, teamProject } from "@/lib/workspace/selectors";
import { formatDate, formatDateTime, relativeDays } from "@/lib/workspace/rules";
import { confirmInactive, resolveBlocker, reviewGroup } from "@/lib/workspace/actions";
import { Badge, Card, EmptyState, Forbidden, PageHeader, QuietLink, Stats } from "@/components/workspace/ui";
import { ActionButton, ActionForm, Choices, DialogButton, Submit, TextArea } from "@/components/workspace/forms";
import { Icon } from "@/components/workspace/Icon";

export const metadata = { title: "Supervisor" };

// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function SuperviseOverview() {
  const { viewer, data } = await loadWorkspace("/supervisor");
  if (viewer.role === "learner") return <Forbidden needs="supervisors and admins" />;

  const teams = data.teams.filter((t) => t.status !== "dissolved" && supervisesTeam(t, viewer));
  const groups = teams.filter((t) => t.groupStatus === "submitted");
  const queue = teams.flatMap((t) => {
    const p = teamProject(data, t.id);
    return (p?.milestones ?? []).filter((m) => m.status === "submitted").map((m) => ({ team: t, project: p!, milestone: m, at: m.submissions.at(-1)!.createdAt }));
  }).sort((a, b) => a.at.localeCompare(b.at));
  const overdue = teams.flatMap((t) => (teamProject(data, t.id)?.milestones ?? []).filter((m) => isOverdue(m)).map((m) => ({ team: t, milestone: m })));
  const blockers = openBlockers(data, teams.map((t) => t.id));
  const flags = teams.flatMap((t) => t.members.filter((m) => m.flaggedInactive).map((m) => ({ team: t, member: m })));

  return (
    <div className="ws-content">
      <PageHeader eyebrow="Supervisor" title={`Good to see you, ${viewer.name.split(" ")[0]}.`} lead="Everything waiting on you across the teams you supervise, oldest first." />
      <Stats items={[
        { label: "Assigned teams", value: teams.length, icon: "users" },
        { label: "Awaiting review", value: queue.length, icon: "inbox" },
        { label: "Overdue milestones", value: overdue.length, icon: "alert" },
        { label: "Open blockers", value: blockers.length, icon: "flag" },
      ]} />

      <div className="ws-grid-2" style={{ marginTop: 24 }}>
        <div className="ws-stack">
          <Card title="Submissions awaiting review" action={<QuietLink href="/supervisor/reviews">Review queue</QuietLink>} pad={false}>
            {queue.length ? (
              <ul className="ws-list">
                {queue.map((q) => (
                  <li key={q.project.id + q.milestone.order}>
                    <Icon name="inbox" size={14.5} className="ws-faint" />
                    <div className="ws-list-main"><p>{q.team.name} · M{q.milestone.order} {q.milestone.name}</p><p>Version {q.milestone.submissions.length} · submitted {relativeDays(q.at)}</p></div>
                    <Link href={`/supervisor/reviews/${q.project.id}/${q.milestone.order}`} className="ws-btn ws-btn-primary ws-btn-sm">Review</Link>
                  </li>
                ))}
              </ul>
            ) : <EmptyState compact still="medal" title="Review queue is clear">New submissions will appear here, oldest first.</EmptyState>}
          </Card>

          <Card title="WhatsApp groups awaiting approval" pad={false}>
            {groups.length ? (
              <ul className="ws-list">
                {groups.map((t) => (
                  <li key={t.id} style={{ flexWrap: "wrap" }}>
                    <Icon name="whatsapp" size={14.5} className="ws-faint" />
                    <div className="ws-list-main"><p>{t.name}</p><p>Leader {personById(data, t.leaderId)?.name} · formed {formatDate(t.formedAt)}</p></div>
                    <a className="ws-btn ws-btn-secondary ws-btn-sm" href={t.whatsappLink} target="_blank" rel="noreferrer"><Icon name="external" size={12.5} />Join group</a>
                    <DialogButton label="Decide" title={`Approve ${t.name}’s group?`} description="Join the group first, then confirm it has all five members." variant="primary">
                      <ActionForm action={reviewGroup}>
                        <input type="hidden" name="teamId" value={t.id} />
                        <Choices legend="Decision" name="decision" defaultValue="approve" options={[["approve", "Approve: the team becomes active"], ["reject", "Reject"]]} />
                        <TextArea label="Reason (required to reject)" name="reason" rows={2} maxLength={300} />
                        <div><Submit size="sm">Save decision</Submit></div>
                      </ActionForm>
                    </DialogButton>
                  </li>
                ))}
              </ul>
            ) : <p className="ws-card-body ws-small ws-muted">No groups waiting.</p>}
          </Card>

          <Card title="Overdue milestones" pad={false}>
            {overdue.length ? (
              <ul className="ws-list">
                {overdue.map(({ team, milestone }) => (
                  <li key={team.id + milestone.order}>
                    <Icon name="alert" size={14.5} className="ws-faint" />
                    <div className="ws-list-main"><p>{team.name} · M{milestone.order} {milestone.name}</p><p>Was due {formatDate(milestone.dueDate!)} ({relativeDays(milestone.dueDate!)}). Shown as overdue to the team.</p></div>
                    <QuietLink href={"/supervisor/teams/" + team.id}>Team</QuietLink>
                  </li>
                ))}
              </ul>
            ) : <p className="ws-card-body ws-small ws-muted">Nothing overdue.</p>}
          </Card>
        </div>

        <div className="ws-stack">
          {flags.length > 0 && (
            <Card title="Inactive flags to confirm" pad={false}>
              <ul className="ws-list">
                {flags.map(({ team, member }) => (
                  <li key={member.userId} style={{ flexWrap: "wrap" }}>
                    <div className="ws-list-main"><p>{personById(data, member.userId)?.name}</p><p>Flagged by the leader of {team.name}</p></div>
                    <ActionButton run={confirmInactive.bind(null, team.id, member.userId, false)} variant="ghost">Dismiss</ActionButton>
                    <ActionButton run={confirmInactive.bind(null, team.id, member.userId, true)} variant="danger-quiet" confirm={{ title: "Remove this member?", body: "They return to the placement pool and the team may receive a replacement. This is logged.", action: "Confirm removal", danger: true }}>Confirm</ActionButton>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <Card title="Open blockers" action={<Badge plain>{blockers.length}</Badge>} pad={false}>
            {blockers.length ? (
              <ul className="ws-list">
                {blockers.map((b) => (
                  <li key={b.id} style={{ alignItems: "flex-start" }}>
                    <div className="ws-list-main" style={{ display: "grid", gap: 2 }}>
                      <p style={{ whiteSpace: "normal", fontWeight: 500 }}>{b.blockers}</p>
                      <p>{personById(data, b.userId)?.name} · {data.teams.find((t) => t.members.some((m) => m.userId === b.userId))?.name} · {formatDateTime(b.date + "T12:00:00Z").split(",")[0]}</p>
                    </div>
                    <ActionButton run={resolveBlocker.bind(null, b.id)} variant="ghost" icon="check">Solved</ActionButton>
                  </li>
                ))}
              </ul>
            ) : <EmptyState compact still="medal" title="No open blockers" />}
          </Card>
          <Card title="Your teams" action={<QuietLink href="/supervisor/teams">All teams</QuietLink>} pad={false}>
            <ul className="ws-list">
              {teams.map((t) => {
                const p = teamProject(data, t.id);
                return (
                  <Link key={t.id} href={"/supervisor/teams/" + t.id} style={{ display: "flex" }}>
                    <div className="ws-list-main"><p>{t.name}</p><p>{t.level} · {p ? `${p.milestones.filter((m) => m.status === "approved").length}/8 approved` : "No project yet"}</p></div>
                    <Badge tone={t.status === "active" ? "green" : "amber"}>{t.status === "active" ? "Active" : "Pending group"}</Badge>
                  </Link>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
