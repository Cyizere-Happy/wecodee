import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import { isLeader, isOverdue, myTeam, teamProject } from "@/lib/workspace/selectors";
import { formatDate, relativeDays } from "@/lib/workspace/rules";
import { createProject } from "@/lib/workspace/actions";
import { Card, EmptyState, MilestoneBadge, PageHeader } from "@/components/workspace/ui";
import { ActionForm, Field, Submit, TextArea } from "@/components/workspace/forms";
import { MilestonePath } from "@/components/workspace/MilestonePath";
import { WorkflowRail } from "@/components/workspace/learning/WorkflowRail";

export const metadata = { title: "Project" };

// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function ProjectPage() {
  const { viewer, data } = await loadWorkspace("/learner/project");
  const team = myTeam(data, viewer);
  const project = team ? teamProject(data, team.id) : null;

  if (!team || !project) {
    const canCreate = team && isLeader(team, viewer) && team.status === "active";
    return (
      <div className="ws-content">
        <PageHeader eyebrow="Build" title="Project" lead="Eight supervised milestones, from understanding the problem to presenting what you built." />
        {canCreate ? (
          <div className="ws-grid-2">
            <Card title="Create your team’s project">
              <ActionForm action={createProject}>
                <Field label="Project title" name="title" maxLength={80} placeholder="LabSlot" />
                <TextArea label="Problem" name="problem" rows={3} help="Who has the problem and how do you know it’s real?" />
                <Field label="Target users" name="targetUsers" placeholder="Secondary-school students in Kigali" />
                <TextArea label="Proposed solution" name="solution" rows={3} />
                <Field label="Planned end date" name="plannedEnd" type="date" />
                <div><Submit arrow>Create project</Submit></div>
              </ActionForm>
            </Card>
            <section className="ws-priority" aria-labelledby="project-start">
              <h2 id="project-start">From a problem to the first review</h2>
              <WorkflowRail label="Getting a project started" steps={[
                { label: "Create the project", detail: "Describe the problem, target users and evidence.", icon: "file", state: "current" },
                { label: "Submit milestone one", detail: "Confirm contributions and send the problem statement.", icon: "clipboard", state: "upcoming" },
                { label: "Write the proposal", detail: "Opens after the problem statement is approved.", icon: "flag", state: "upcoming" },
              ]} />
            </section>
          </div>
        ) : (
          <div className="ws-card">
            <EmptyState scene="pathStart" title={team ? "Your project starts soon" : "Projects start with a team"} actions={!team ? <Link href="/learner/team" className="ws-btn ws-btn-secondary">About teams</Link> : null}>
              {team ? (team.status === "active" ? "Your leader will create the project and open milestone 1." : "Once your WhatsApp group is approved, your leader creates the project.") : "When you’re placed in a team, you’ll build a real project together through eight milestones."}
            </EmptyState>
            <div className="ws-card-body" style={{ borderTop: "1px solid var(--ws-border)" }}>
              <ol className="ws-small" style={{ display: "grid", gap: 6, columns: 2 }}>
                {data.templates.map((m) => <li key={m.order}><strong>{m.order}.</strong> {m.name} <span className="ws-muted">· {m.deliverable}</span></li>)}
              </ol>
            </div>
          </div>
        )}
      </div>
    );
  }

  const approved = project.milestones.filter((m) => m.status === "approved").length;
  return (
    <div className="ws-content">
      <PageHeader
        eyebrow={`${team.name} · ${approved} of 8 approved`}
        title={project.title}
        lead={project.solution}
        actions={<span className="ws-small ws-muted">Planned end {formatDate(project.plannedEnd)}</span>}
      />
      <div className="ws-stack">
        <Card><div style={{ padding: "7px 0" }}><MilestonePath milestones={project.milestones} /></div></Card>
        <div className="ws-grid-2">
          <div className="ws-table-wrap">
            <table className="ws-table">
              <thead><tr><th>#</th><th>Milestone</th><th>Due</th><th>Status</th><th className="num">Versions</th></tr></thead>
              <tbody>
                {project.milestones.map((m) => (
                    <tr key={m.order}>
                      <td className="ws-muted">{m.order}</td>
                      <td><Link href={"/learner/project/" + m.order} className="ws-link" style={{ textDecoration: "none", fontWeight: 600 }}>{m.name}</Link><div className="ws-small ws-muted">{m.deliverable}</div></td>
                      <td className="ws-small" style={{ whiteSpace: "nowrap" }}>{m.dueDate ? <>{formatDate(m.dueDate)}<div className="ws-faint">{m.status === "approved" ? "" : relativeDays(m.dueDate)}</div></> : <span className="ws-faint">Not set</span>}</td>
                      <td><MilestoneBadge status={m.status} overdue={isOverdue(m)} /></td>
                      <td className="num">{m.submissions.length || "–"}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Card title="About the project">
            <dl className="ws-kv ws-small" style={{ gridTemplateColumns: "1fr" }}>
              <dt>Problem</dt><dd>{project.problem}</dd>
              <dt>Target users</dt><dd>{project.targetUsers}</dd>
              <dt>Solution</dt><dd>{project.solution}</dd>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
