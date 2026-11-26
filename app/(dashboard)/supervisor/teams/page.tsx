import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import { currentMilestone, isOverdue, personById, supervisesTeam, teamProject } from "@/lib/workspace/selectors";
import { formatDate } from "@/lib/workspace/rules";
import { Badge, EmptyState, Forbidden, Meter, MilestoneBadge, PageHeader } from "@/components/workspace/ui";

export const metadata = { title: "Teams" };

// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function SupervisedTeams() {
  const { viewer, data } = await loadWorkspace("/supervisor/teams");
  if (viewer.role === "learner") return <Forbidden needs="supervisors and admins" />;
  const teams = data.teams.filter((t) => t.status !== "dissolved" && supervisesTeam(t, viewer));

  return (
    <div className="ws-content">
      <PageHeader eyebrow="Supervisor" title="Teams" lead={viewer.role === "admin" ? "All teams on the platform." : `Teams assigned to you (cap ${data.settings.supervisorCap}).`} />
      {teams.length ? (
        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead><tr><th>Team</th><th>Leader</th><th>Status</th><th>Current milestone</th><th style={{ width: 160 }}>Progress</th></tr></thead>
            <tbody>
              {teams.map((t) => {
                const p = teamProject(data, t.id);
                const m = p ? currentMilestone(p.milestones) : null;
                const approved = p?.milestones.filter((x) => x.status === "approved").length ?? 0;
                return (
                  <tr key={t.id}>
                    <td><Link href={"/supervisor/teams/" + t.id} className="ws-link" style={{ textDecoration: "none", fontWeight: 600 }}>{t.name}</Link><div className="ws-small ws-muted">{t.level} · formed {formatDate(t.formedAt)}</div></td>
                    <td>{personById(data, t.leaderId)?.name}</td>
                    <td>{t.status === "active" ? <Badge tone="green">Active</Badge> : t.groupStatus === "submitted" ? <Badge tone="amber">Group to approve</Badge> : <Badge tone="amber">Pending group</Badge>}</td>
                    <td>{m ? <div className="ws-row" style={{ gap: 6 }}><span className="ws-small">M{m.order} {m.name}</span><MilestoneBadge status={m.status} overdue={isOverdue(m)} /></div> : <span className="ws-faint">No project</span>}</td>
                    <td><div style={{ display: "grid", gap: 4 }}><Meter value={approved} max={8} label={`${t.name} progress`} /><span className="ws-small ws-muted">{approved} of 8</span></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : <div className="ws-card"><EmptyState art="supervisor/teams" title="No teams assigned yet">Teams are assigned to the supervisor with the fewest active teams when they’re formed.</EmptyState></div>}
    </div>
  );
}
