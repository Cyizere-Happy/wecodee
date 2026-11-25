import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import { personById, supervisesTeam } from "@/lib/workspace/selectors";
import { formatDateTime, relativeDays } from "@/lib/workspace/rules";
import { Badge, EmptyState, Forbidden, PageHeader } from "@/components/workspace/ui";

export const metadata = { title: "Review queue" };

export default async function ReviewQueue() {
  const { viewer, data } = await loadWorkspace("/supervisor/reviews");
  if (viewer.role === "learner") return <Forbidden needs="supervisors and admins" />;

  const rows = data.projects.flatMap((p) => {
    const team = data.teams.find((t) => t.id === p.teamId);
    if (!team || !supervisesTeam(team, viewer)) return [];
    return p.milestones.flatMap((m) => m.submissions.map((s) => ({ team, project: p, milestone: m, submission: s })));
  });
  const waiting = rows.filter((r) => r.milestone.status === "submitted" && r.submission === r.milestone.submissions.at(-1)).sort((a, b) => a.submission.createdAt.localeCompare(b.submission.createdAt));
  const reviewed = rows.filter((r) => r.submission.review).sort((a, b) => b.submission.review!.createdAt.localeCompare(a.submission.review!.createdAt)).slice(0, 12);

  return (
    <div className="ws-content">
      <PageHeader eyebrow="Supervisor" title="Review queue" lead="Oldest first. Approve only when every checklist item is met; otherwise request changes with clear comments." />
      <section className="ws-section">
        <div className="ws-section-head"><h2 className="ws-h2">Waiting for you</h2><Badge plain>{waiting.length}</Badge></div>
        {waiting.length ? (
          <div className="ws-table-wrap">
            <table className="ws-table">
              <thead><tr><th>Team</th><th>Milestone</th><th>Version</th><th>Submitted</th><th></th></tr></thead>
              <tbody>
                {waiting.map((r) => (
                  <tr key={r.submission.id}>
                    <td><strong>{r.team.name}</strong><div className="ws-small ws-muted">{r.project.title}</div></td>
                    <td>M{r.milestone.order} · {r.milestone.name}</td>
                    <td>v{r.submission.version}</td>
                    <td title={formatDateTime(r.submission.createdAt)}>{relativeDays(r.submission.createdAt)}</td>
                    <td style={{ textAlign: "right" }}><Link className="ws-btn ws-btn-primary ws-btn-sm" href={`/supervisor/reviews/${r.project.id}/${r.milestone.order}`}>Review</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="ws-card"><EmptyState scene="celebrate" title="Inbox zero">Every submission has been reviewed. Nice.</EmptyState></div>}
      </section>
      <section className="ws-section">
        <div className="ws-section-head"><h2 className="ws-h2">Recently reviewed</h2></div>
        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead><tr><th>Team</th><th>Milestone</th><th>Decision</th><th>Reviewer</th><th>When</th></tr></thead>
            <tbody>
              {reviewed.map((r) => (
                <tr key={r.submission.id}>
                  <td>{r.team.name}</td>
                  <td>M{r.milestone.order} · {r.milestone.name} <span className="ws-faint">v{r.submission.version}</span></td>
                  <td>{r.submission.review!.decision === "approved" ? <Badge tone="green">Approved</Badge> : <Badge tone="red">Changes requested</Badge>}</td>
                  <td>{personById(data, r.submission.review!.supervisorId)?.name}</td>
                  <td>{relativeDays(r.submission.review!.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
