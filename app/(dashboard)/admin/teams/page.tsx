import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import { personById, teamProject } from "@/lib/workspace/selectors";
import { formatDate, formTeams } from "@/lib/workspace/rules";
import { adminTeamChange, confirmFormation, moveMember } from "@/lib/workspace/actions";
import { Badge, Card, EmptyState, Forbidden, PageHeader, Tip } from "@/components/workspace/ui";
import { ActionButton, ActionForm, Choices, DialogButton, Select, Submit, TextArea } from "@/components/workspace/forms";
import { StateBreakdown } from "@/components/workspace/VisualSummary";
import { WorkflowRail } from "@/components/workspace/learning/WorkflowRail";

export const metadata = { title: "Teams & formation" };

/** FR-27/28/70: automatic team formation preview, confirmation and admin changes. */
// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function AdminTeams() {
  const { viewer, data } = await loadWorkspace("/admin/teams");
  if (viewer.role !== "admin") return <Forbidden needs="admins" />;
  const preview = formTeams(data.people, data.settings.teamSize);
  const teams = data.teams.filter((t) => t.status !== "dissolved");

  return (
    <div className="ws-content">
      <PageHeader eyebrow="Admin" title="Teams & formation" lead="Review the proposed match before placing learners." />
      <div className="ws-visual-context">
        <WorkflowRail label="Team formation workflow" steps={[
          { label: "Placement pool", icon: "inbox", detail: "Verified, opted in, quiz completed" },
          { label: "Match learners", icon: "users", detail: `${data.settings.teamSize} learners per team by level, with mixed readiness, gender and skills`, state: "current" },
          { label: "Assign supervisor", icon: "user", detail: `Fewest active teams · cap ${data.settings.supervisorCap}` },
          { label: "Set up the group", icon: "whatsapp", detail: "Leader accepts and submits a group link" },
        ]} />
      </div>

      <section className="ws-section">
        <div className="ws-section-head">
          <h2 className="ws-h2">Formation preview</h2>
          {preview.teams.length > 0 && <ActionButton run={confirmFormation} variant="primary" confirm={{ title: `Form ${preview.teams.length} team${preview.teams.length > 1 ? "s" : ""}?`, body: "Members see their team, leaders are asked to accept, and supervisors are assigned. You can still move members, change a leader or dissolve a team afterwards.", action: "Form teams" }}>Confirm formation</ActionButton>}
        </div>
        {preview.teams.length ? (
          <div className="ws-grid-even">
            {preview.teams.map((t, i) => (
              <Card key={i} title={`${t.level} team`} action={<Badge plain>{t.members.length + 1} members</Badge>}>
                <ul className="ws-stack" style={{ gap: 6 }}>
                  {[t.leader, ...t.members].map((p) => (
                    <li key={p.id} className="ws-row-between ws-small">
                      <span>{p.name} {p === t.leader && <Badge tone="red" plain>Leader</Badge>}</span>
                      <span className="ws-muted">{p.readinessLevel} · {p.gender === "female" ? "F" : "M"} · {p.quizScore}%</span>
                    </li>
                  ))}
                </ul>
                <p className="ws-small ws-muted" style={{ marginTop: 12 }}>Readiness H{t.readinessMix.High}/M{t.readinessMix.Medium}/L{t.readinessMix.Low} · {t.genderMix.female} female, {t.genderMix.male} male · {t.skillCategories.join(", ") || "no skill data"}</p>
              </Card>
            ))}
          </div>
        ) : (
          <div className="ws-card"><EmptyState still="puzzle" title="Not enough learners to form a team">Learners join the pool after completing their profile and the skills quiz.</EmptyState></div>
        )}
        {preview.waiting.length > 0 && <div style={{ marginTop: 12 }}><Tip still="hourglass" title={`${preview.waiting.length} learner${preview.waiting.length > 1 ? "s" : ""} keep waiting.`}>{" "}There aren’t enough at their level for a full team yet: {preview.waiting.map((p) => `${p.name} (${p.level})`).join(", ")}.</Tip></div>}
      </section>

      <section className="ws-section">
        <div className="ws-section-head"><h2 className="ws-h2">All teams</h2><Badge plain>{teams.length}</Badge></div>
        <StateBreakdown label="Formed teams by status" parts={[
          { label: "Pending group", value: teams.filter((team) => team.status === "pending_group").length, tone: "amber" },
          { label: "Active", value: teams.filter((team) => team.status === "active").length, tone: "red" },
          { label: "Completed", value: teams.filter((team) => team.status === "completed").length, tone: "green" },
        ]} />
        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead><tr><th>Team</th><th>Leader</th><th>Supervisor</th><th>Status</th><th>Project</th><th></th></tr></thead>
            <tbody>
              {teams.map((t) => {
                const p = teamProject(data, t.id);
                return (
                  <tr key={t.id}>
                    <td><Link className="ws-link" style={{ textDecoration: "none", fontWeight: 600 }} href={"/supervisor/teams/" + t.id}>{t.name}</Link><div className="ws-small ws-muted">{t.level} · {formatDate(t.formedAt)}</div></td>
                    <td>{personById(data, t.leaderId)?.name} {!t.leaderAccepted && <Badge tone="amber" plain>Not accepted</Badge>}</td>
                    <td>{personById(data, t.supervisorId)?.name}</td>
                    <td><Badge tone={t.status === "active" ? "green" : t.status === "completed" ? "blue" : "amber"}>{{ pending_group: "Pending group", active: "Active", completed: "Completed", dissolved: "Dissolved" }[t.status]}</Badge></td>
                    <td>{p ? `${p.title} · ${p.milestones.filter((m) => m.status === "approved").length}/8` : <span className="ws-faint">–</span>}</td>
                    <td style={{ textAlign: "right" }}>
                      <div className="ws-actions" style={{ justifyContent: "flex-end", flexWrap: "nowrap" }}>
                      {t.status !== "dissolved" && t.status !== "completed" && (
                        <DialogButton label="Move member" title={`Move or swap a member of ${t.name}`} description="Leave “Swap with” empty to move the member. Every change needs a reason and is written to the audit log.">
                          <ActionForm action={moveMember}>
                            <Select label="Member" name="userId" placeholder="Choose a member" options={t.members.filter((m) => m.userId !== t.leaderId).map((m) => [m.userId, personById(data, m.userId)?.name ?? m.userId] as [string, string])} help="Leaders can’t be moved; change the leader first." />
                            <Select label="To team" name="toTeamId" placeholder="Choose a team" options={teams.filter((o) => o.id !== t.id && o.status !== "dissolved" && o.status !== "completed").map((o) => [o.id, `${o.name} (${o.level}, ${o.members.length} members)`] as [string, string])} />
                            <Select label="Swap with (optional)" name="swapWith" placeholder="No swap, just move" options={teams.filter((o) => o.id !== t.id && o.status !== "dissolved" && o.status !== "completed").flatMap((o) => o.members.filter((m) => m.userId !== o.leaderId).map((m) => [m.userId, `${personById(data, m.userId)?.name} · ${o.name}`] as [string, string]))} help="Pick someone from the team chosen above." />
                            <TextArea label="Reason" name="reason" rows={2} maxLength={300} required />
                            <div><Submit size="sm">Apply</Submit></div>
                          </ActionForm>
                        </DialogButton>
                      )}
                      <DialogButton label="Change" title={`Change ${t.name}`} description="Every change needs a reason and is written to the audit log.">
                        <ActionForm action={adminTeamChange}>
                          <input type="hidden" name="teamId" value={t.id} />
                          <Choices legend="Change" name="kind" defaultValue="leader" options={[["leader", "Change leader"], ["dissolve", "Dissolve team"]]} />
                          <Select label="New leader" name="userId" defaultValue={t.leaderId} options={t.members.map((m) => [m.userId, personById(data, m.userId)?.name ?? m.userId] as [string, string])} help="Ignored when dissolving." />
                          <TextArea label="Reason" name="reason" rows={2} maxLength={300} required />
                          <div><Submit size="sm">Apply change</Submit></div>
                        </ActionForm>
                      </DialogButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
