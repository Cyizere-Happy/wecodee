import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import { isLeader, memberViews, myTeam, personById, teamProject } from "@/lib/workspace/selectors";
import { formatDate } from "@/lib/workspace/rules";
import { acceptLeadership, flagInactive, leaveTeam, setMemberLeave, submitGroupLink } from "@/lib/workspace/actions";
import { Badge, Card, EmptyState, Feedback, Initials, Mascot, PageHeader, QuietLink, ReadinessBadge } from "@/components/workspace/ui";
import { ActionButton, ActionForm, DialogButton, Field, Submit, TextArea } from "@/components/workspace/forms";
import { RoleEditor } from "@/components/workspace/team";
import { MilestonePath } from "@/components/workspace/MilestonePath";
import { Icon } from "@/components/workspace/Icon";

export const metadata = { title: "Team" };

const timeLabel = { morning: "Mornings", afternoon: "Afternoons", evening: "Evenings", weekend: "Weekends" } as const;

// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function TeamPage() {
  const { viewer, data } = await loadWorkspace("/learner/team");
  const team = myTeam(data, viewer);

  if (!team) {
    const quizDone = data.profile.quiz.status === "completed";
    return (
      <div className="ws-content">
        <PageHeader eyebrow="Build" title="Team" lead="Teams of five, matched by the platform and guided by a supervisor." />
        <div className="ws-grid-2">
          <div className="ws-card">
            <EmptyState still="door" title={!data.profile.optedIn ? "You’ve opted out of a project team" : quizDone ? "You’re in the placement pool" : "Your team is waiting behind this door"}
              actions={!data.profile.optedIn ? <Link href="/settings" className="ws-btn ws-btn-secondary">Opt in from Settings</Link> : !quizDone ? <Link href="/learner/quiz" className="ws-btn ws-btn-primary">Take the skills quiz<span className="ws-arrow" aria-hidden>→</span></Link> : null}>
              {!data.profile.optedIn ? "You can still learn with Hot Topics, articles and events." : quizDone ? "Teams form every week. You’ll get an email with your team, leader and next steps." : "Finish the skills quiz to join the placement pool."}
            </EmptyState>
          </div>
          <Card title="How teams are formed">
            <ol style={{ display: "grid", gap: 12, listStyle: "decimal", paddingLeft: 18 }} className="ws-small">
              <li><strong>Same level.</strong> <span className="ws-muted">Teams are grouped by skill level from your quiz.</span></li>
              <li><strong>A leader first.</strong> <span className="ws-muted">Chosen from skills and activity, with reliable time and internet.</span></li>
              <li><strong>Balanced.</strong> <span className="ws-muted">At least two women and two men where possible, never one alone.</span></li>
              <li><strong>Ready together.</strong> <span className="ws-muted">At least two members with high readiness, and working times that overlap.</span></li>
              <li><strong>Mixed skills.</strong> <span className="ws-muted">Front end, back end, mobile, data, design and DevOps, spread across the team.</span></li>
            </ol>
          </Card>
        </div>
      </div>
    );
  }

  const leader = isLeader(team, viewer);
  const members = memberViews(data, team, viewer);
  const supervisor = personById(data, team.supervisorId);
  const project = teamProject(data, team.id);
  const leaderName = team.leaderId === viewer.id ? "You" : personById(data, team.leaderId)?.name;
  const statusBadge = team.status === "active" ? <Badge tone="green">Active</Badge> : team.status === "pending_group" ? <Badge tone="amber">Pending group</Badge> : <Badge>{team.status}</Badge>;

  return (
    <div className="ws-content">
      <PageHeader
        eyebrow={`${team.level} team · formed ${formatDate(team.formedAt)}`}
        title={<>{team.name}</>}
        lead={<>Led by {leaderName}, supervised by {supervisor?.name}.</>}
        actions={<>{statusBadge}{team.groupStatus === "approved" && team.whatsappLink && <a href={team.whatsappLink} target="_blank" rel="noreferrer" className="ws-btn ws-btn-secondary ws-btn-sm"><Icon name="whatsapp" size={13.5} />Open WhatsApp group</a>}</>}
      />

      {leader && !team.leaderAccepted && (
        <section className="ws-card" style={{ marginBottom: 20, overflow: "hidden" }}>
          <div className="ws-grid-even" style={{ alignItems: "center", gap: 0 }}>
            <div className="ws-card-body" style={{ padding: 24, display: "grid", gap: 12 }}>
              <span className="ws-eyebrow">You’ve been chosen as team leader</span>
              <h2 className="ws-h2" style={{ fontSize: "1.125rem" }}>Will you lead {team.name}?</h2>
              <ul style={{ display: "grid", gap: 6 }} className="ws-small">
                {["Create the WhatsApp group and submit its link", "Assign each member one or two roles", "Make sure everyone posts daily reports", "Submit milestones for the team", "Flag members who stop taking part"].map((r) => (
                  <li key={r} className="ws-row"><Icon name="check" size={12.5} />{r}</li>
                ))}
              </ul>
              <p className="ws-small ws-muted">If you don’t answer within {data.settings.leaderResponseDays} days, the role passes to the next teammate.</p>
              <div className="ws-actions">
                <ActionButton run={acceptLeadership.bind(null, true)} variant="primary" size="md">Accept and lead</ActionButton>
                <ActionButton run={acceptLeadership.bind(null, false)} variant="ghost" size="md" confirm={{ title: "Pass on the leader role?", body: "The role goes to the next teammate. You stay in the team as a member.", action: "Decline", danger: true }}>Decline</ActionButton>
              </div>
            </div>
            <Mascot still="badge" style={{ height: 260 }} />
          </div>
        </section>
      )}

      {leader && team.leaderAccepted && team.groupStatus !== "approved" && (
        <Card title="WhatsApp group" className="ws-section">
          {team.groupStatus === "submitted" ? (
            <Feedback tone="info">Link sent. {supervisor?.name} will join the group and approve it. Your team becomes active after approval.</Feedback>
          ) : (
            <div className="ws-stack">
              {team.groupStatus === "rejected" && <Feedback tone="error">Your supervisor rejected the group: {team.groupRejectReason}</Feedback>}
              <p className="ws-small ws-muted">Create a WhatsApp group with all five members and your supervisor, then paste the invite link. Use the member numbers in the table below.</p>
              <ActionForm action={submitGroupLink} className="ws-form" reset>
                <Field label="Group invite link" name="link" type="url" inputMode="url" placeholder="https://chat.whatsapp.com/…" defaultValue={team.whatsappLink} />
                <div><Submit size="sm">Submit link</Submit></div>
              </ActionForm>
            </div>
          )}
        </Card>
      )}

      <section className="ws-section" style={{ marginTop: 20 }}>
        <div className="ws-section-head">
          <h2 className="ws-h2">Members</h2>
          {leader && <span className="ws-small ws-muted"><Icon name="lock" size={11} /> WhatsApp numbers are visible only to you and your supervisor.</span>}
        </div>
        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th>Member</th><th>Roles</th><th>Skills</th>
                {leader && <th>Readiness</th>}
                {leader && <th>WhatsApp</th>}
                {leader && <th><span className="ws-sr">Actions</span></th>}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="ws-row">
                      <span className="ws-avatar" style={{ width: 28, height: 28, fontSize: ".6188rem", background: m.isLeader ? "var(--ws-red)" : undefined }}>{m.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}</span>
                      <div style={{ minWidth: 0 }}>
                        <strong>{m.id === viewer.id ? `${m.name} (you)` : m.name}</strong>
                        <div className="ws-row ws-small" style={{ gap: 6 }}>
                          {m.isLeader && <Badge tone="red" plain>Leader</Badge>}
                          {m.onLeave && <Badge tone="blue" plain>On leave until {formatDate(m.onLeave.to + "T12:00:00Z", { day: "numeric", month: "short" })}</Badge>}
                          {m.flaggedInactive && <Badge tone="amber" plain>Flagged inactive</Badge>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{m.roles.length ? m.roles.join(", ") : <span className="ws-faint">Not assigned</span>}</td>
                  <td><div className="ws-tags">{m.skills.slice(0, 3).map((s) => <span key={s} className="ws-tag">{s}</span>)}</div></td>
                  {leader && <td><div style={{ display: "grid", gap: 4 }}><ReadinessBadge level={m.readinessLevel} /><span className="ws-small ws-muted">{timeLabel[m.preferredTime]}</span></div></td>}
                  {leader && <td>{m.whatsapp ? <a className="ws-link mono" href={"https://wa.me/" + m.whatsapp.replace(/\D/g, "")} target="_blank" rel="noreferrer">{m.whatsapp}</a> : "–"}</td>}
                  {leader && (
                    <td>
                      <div className="ws-actions" style={{ justifyContent: "flex-end", flexWrap: "nowrap" }}>
                        <RoleEditor userId={m.id} name={m.name.split(" ")[0]} current={m.roles} />
                        <DialogButton label="Leave" title={`Leave dates for ${m.name.split(" ")[0]}`} description="No daily-report reminders are sent on these days." variant="ghost">
                          <>
                            <ActionForm action={setMemberLeave}>
                              <input type="hidden" name="userId" value={m.id} />
                              <div className="ws-form-row">
                                <Field label="From" name="from" type="date" defaultValue={m.onLeave?.from} required />
                                <Field label="To" name="to" type="date" defaultValue={m.onLeave?.to} required />
                              </div>
                              <div className="ws-actions"><Submit size="sm">Save leave</Submit>{m.onLeave && <button className="ws-btn ws-btn-ghost ws-btn-sm" name="clear" value="1" type="submit">Clear leave</button>}</div>
                            </ActionForm>
                          </>
                        </DialogButton>
                        {m.id !== viewer.id && !m.flaggedInactive && (
                          <DialogButton label="Flag" title={`Flag ${m.name.split(" ")[0]} as inactive?`} description="Your supervisor confirms before anything changes. If confirmed, the member returns to the placement pool and the team may get a replacement." variant="ghost">
                            <>
                              <ActionForm action={flagInactive}>
                                <input type="hidden" name="userId" value={m.id} />
                                <TextArea label="Reason for your supervisor" name="reason" rows={3} maxLength={300} placeholder="For example: no reports or messages for a week." />
                                <div><Submit size="sm" variant="danger">Send flag</Submit></div>
                              </ActionForm>
                            </>
                          </DialogButton>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="ws-grid-2 ws-section">
        <Card title="Project" action={project && <QuietLink href="/learner/project">Open project</QuietLink>} pad={!project}>
          {project ? (
            <div className="ws-card-body" style={{ display: "grid", gap: 14 }}>
              <div><p style={{ fontWeight: 650 }}>{project.title}</p><p className="ws-small ws-muted">{project.problem}</p></div>
              <MilestonePath milestones={project.milestones} />
            </div>
          ) : <p className="ws-muted ws-small">{team.status === "active" ? (leader ? "Create the project to open milestone 1." : "Your leader will create the project.") : "The project starts once your WhatsApp group is approved."}</p>}
        </Card>
        <div className="ws-stack">
          <Card title="Supervisor">
            <div className="ws-row"><Initials name={supervisor?.name ?? "S"} /><div><p style={{ fontWeight: 600 }}>{supervisor?.name}</p><p className="ws-small ws-muted">Reviews your milestones and joins your group.</p></div></div>
          </Card>
          <Card title="Role history" pad={false}>
            {data.roleLog.length ? (
              <ul className="ws-list">{data.roleLog.slice(0, 5).map((r, i) => <li key={i}><div className="ws-list-main"><p style={{ fontWeight: 500 }}>{r.text}</p><p>{formatDate(r.at)}</p></div></li>)}</ul>
            ) : <p className="ws-card-body ws-small ws-muted">No changes yet.</p>}
          </Card>
          {!leader && (
            <div className="ws-row-between ws-wrap">
              <span className="ws-small ws-muted">Need to step away from the team?</span>
              <DialogButton label="Leave team" title="Leave this team?" description="Your leader and supervisor will be notified. You’ll return to learning on your own." variant="danger-quiet">
                <>
                  <ActionForm action={leaveTeam}>
                    <TextArea label="Reason" name="reason" rows={3} maxLength={300} />
                    <div><Submit size="sm" variant="danger">Leave team</Submit></div>
                  </ActionForm>
                </>
              </DialogButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
