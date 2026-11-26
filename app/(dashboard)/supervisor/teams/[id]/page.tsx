import Link from "next/link";
import { notFound } from "next/navigation";
import { loadWorkspace } from "@/lib/workspace/data";
import { isOverdue, memberViews, personById, reportGrid, supervisesTeam, teamProject, workingDays } from "@/lib/workspace/selectors";
import { formatDate } from "@/lib/workspace/rules";
import { Badge, Card, Forbidden, Meter, MilestoneBadge, PageHeader, ReadinessBadge } from "@/components/workspace/ui";
import { ReportGrid } from "@/components/workspace/ReportGrid";
import { MilestonePath } from "@/components/workspace/MilestonePath";
import { PageCrumb } from "@/components/workspace/Shell";
import { MascotGuide } from "@/components/workspace/Guidance";

// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function SupervisedTeam({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { viewer, data } = await loadWorkspace("/supervisor/teams/" + id);
  if (viewer.role === "learner") return <Forbidden needs="supervisors and admins" />;
  const team = data.teams.find((t) => t.id === id);
  if (!team) notFound();
  if (!supervisesTeam(team, viewer)) return <Forbidden needs="this team’s supervisor" />;
  const project = teamProject(data, team.id);
  const members = memberViews(data, team, viewer);
  const days = workingDays(14);
  const grid = reportGrid(team, data.reports, days);
  const approved = project?.milestones.filter((milestone) => milestone.status === "approved").length ?? 0;

  return (
    <div className="ws-content">
      <PageCrumb label={team.name} />
      <PageHeader
        eyebrow={`${team.level} · formed ${formatDate(team.formedAt)}`}
        title={team.name}
        lead={project ? `${project.title}: ${project.solution}` : "No project yet."}
        actions={<>{team.status === "active" ? <Badge tone="green">Active</Badge> : <Badge tone="amber">Pending group</Badge>}{team.whatsappLink && <a className="ws-btn ws-btn-secondary ws-btn-sm" href={team.whatsappLink} target="_blank" rel="noreferrer">WhatsApp group</a>}</>}
      />
      <div className="ws-stack">
        {project ? (
          <Card title="Milestones" action={<Badge plain>{approved} of {project.milestones.length} approved</Badge>}>
            <Meter value={approved} max={project.milestones.length} label="Approved milestones" />
            <MilestonePath milestones={project.milestones} base={`/supervisor/reviews/${project.id}/`} />
          </Card>
        ) : (
          <MascotGuide art="supervisor/teams" title={team.status === "active" ? "Waiting for the first project" : "Waiting for group approval"} compact>
            <p>{team.status === "active" ? "When the leader creates a project, its milestones and review history appear here." : "The team can start a project once its WhatsApp group is approved."}</p>
          </MascotGuide>
        )}
        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead><tr><th>Member</th><th>Roles</th><th>Readiness</th><th>WhatsApp</th></tr></thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td><strong>{m.name}</strong> {m.isLeader && <Badge tone="red" plain>Leader</Badge>} {m.flaggedInactive && <Badge tone="amber" plain>Flagged</Badge>}</td>
                  <td>{m.roles.join(", ") || <span className="ws-faint">Not assigned</span>}</td>
                  <td><ReadinessBadge level={m.readinessLevel} /> <span className="ws-small ws-muted">{m.preferredTime}</span></td>
                  <td>{m.whatsapp ? <a className="ws-link mono" href={"https://wa.me/" + m.whatsapp.replace(/\D/g, "")} target="_blank" rel="noreferrer">{m.whatsapp}</a> : "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Card title="Daily reports · last 14 working days">
          <ReportGrid days={days} rows={grid.map((r) => ({ ...r, name: (personById(data, r.userId)?.name ?? "Member").split(" ")[0], hours: data.reports.filter((x) => x.userId === r.userId && days.includes(x.date)).reduce((s, x) => s + Math.min(12, x.hours), 0) }))} />
        </Card>
        {project && (
          <div className="ws-table-wrap">
            <table className="ws-table">
              <thead><tr><th>#</th><th>Milestone</th><th>Due</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {project.milestones.map((m) => (
                  <tr key={m.order}>
                    <td className="ws-muted">{m.order}</td><td>{m.name}</td><td>{m.dueDate ? formatDate(m.dueDate) : "–"}</td>
                    <td><MilestoneBadge status={m.status} overdue={isOverdue(m)} /></td>
                    <td style={{ textAlign: "right" }}>{m.submissions.length > 0 && <Link className="ws-quiet-link" href={`/supervisor/reviews/${project.id}/${m.order}`}>{m.status === "submitted" ? "Review" : "History"}</Link>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
