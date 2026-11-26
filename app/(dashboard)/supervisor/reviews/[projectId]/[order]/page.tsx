import Link from "next/link";
import { notFound } from "next/navigation";
import { loadWorkspace } from "@/lib/workspace/data";
import { personById, supervisesTeam } from "@/lib/workspace/selectors";
import { formatDate, formatDateTime } from "@/lib/workspace/rules";
import { adjustMilestoneDue, recordExplanation, reviewSubmission } from "@/lib/workspace/actions";
import { Badge, Card, Feedback, Forbidden, MilestoneBadge, PageHeader } from "@/components/workspace/ui";
import { ActionForm, Choices, DialogButton, Field, FieldError, Select, Submit, TextArea } from "@/components/workspace/forms";
import { PageCrumb } from "@/components/workspace/Shell";
import { Icon } from "@/components/workspace/Icon";
import { MascotGuide, VisualSequence } from "@/components/workspace/Guidance";

// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function ReviewPage({ params }: { params: Promise<{ projectId: string; order: string }> }) {
  const { projectId, order: raw } = await params;
  const { viewer, data } = await loadWorkspace(`/supervisor/reviews/${projectId}/${raw}`);
  if (viewer.role === "learner") return <Forbidden needs="supervisors and admins" />;
  const project = data.projects.find((p) => p.id === projectId);
  const team = project && data.teams.find((t) => t.id === project.teamId);
  const milestone = project?.milestones.find((m) => m.order === Number(raw));
  if (!project || !team || !milestone) notFound();
  if (!supervisesTeam(team, viewer)) return <Forbidden needs="this team’s supervisor" />;
  const submission = milestone.submissions.at(-1);
  const waiting = milestone.status === "submitted" && submission;
  const outcomeTone = { clear: "green", partly: "amber", unclear: "red" } as const;
  const explanations = (project.explanations ?? []).filter((x) => x.milestone === milestone.order);
  const memberOptions = team.members.map((m) => [m.userId, personById(data, m.userId)?.name ?? m.userId] as [string, string]);

  // FR-39 and FR-45 tools sit beside the review, available whatever the review state.
  const tools = (
    <>
      <Card title="Due date" action={<span className="ws-small ws-muted">{milestone.dueDate ? formatDate(milestone.dueDate) : "Not set by the leader"}</span>}>
        <ActionForm action={adjustMilestoneDue}>
          <input type="hidden" name="projectId" value={project.id} />
          <input type="hidden" name="order" value={milestone.order} />
          <div className="ws-row ws-wrap" style={{ alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: 140 }}><Field label="Adjust to" name="dueDate" type="date" defaultValue={milestone.dueDate?.slice(0, 10)} /></div>
            <Submit variant="secondary">Save date</Submit>
          </div>
        </ActionForm>
      </Card>
      <Card
        title="Explain your work"
        action={
          <DialogButton label="Record outcome" title="Record an explanation" description="You asked a member to explain part of the work in the WhatsApp group or a call. Note how it went.">
            <ActionForm action={recordExplanation} reset>
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="order" value={milestone.order} />
              <Select label="Member" name="userId" options={memberOptions} placeholder="Choose a member" />
              <Field label="What they explained" name="topic" maxLength={200} placeholder="For example, the login form validation" />
              <Choices legend="Outcome" name="outcome" options={[["clear", "Clear, they did the work"], ["partly", "Partly clear"], ["unclear", "Couldn’t explain it"]]} />
              <TextArea label="Note (optional)" name="note" rows={3} maxLength={600} />
              <div><Submit>Save outcome</Submit></div>
            </ActionForm>
          </DialogButton>
        }
        pad={explanations.length === 0}
      >
        {explanations.length === 0 ? (
          <p className="ws-small ws-muted">Unsure who did what? Ask a member to walk you through part of the work, then record how it went.</p>
        ) : (
          <ul className="ws-list">
            {explanations.map((x) => (
              <li key={x.id} style={{ alignItems: "flex-start" }}>
                <div className="ws-list-main" style={{ display: "grid", gap: 2 }}>
                  <p>{personById(data, x.userId)?.name} · {x.topic}</p>
                  <p style={{ whiteSpace: "normal" }}>{x.note || "No note"} · {x.by}, {formatDate(x.at)}</p>
                </div>
                <Badge tone={outcomeTone[x.outcome]}>{x.outcome === "clear" ? "Clear" : x.outcome === "partly" ? "Partly" : "Unclear"}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );

  return (
    <div className="ws-content">
      <PageCrumb label={`${team.name} · M${milestone.order}`} />
      <PageHeader
        eyebrow={`${team.name} · ${project.title}`}
        title={`M${milestone.order}: ${milestone.name}`}
        lead={`Deliverable: ${milestone.deliverable}.`}
        actions={<><MilestoneBadge status={milestone.status} /><Link className="ws-btn ws-btn-secondary ws-btn-sm" href={"/supervisor/teams/" + team.id}>Team page</Link></>}
      />
      {!submission ? (
        <div className="ws-grid-2"><div className="ws-stack"><Feedback tone="info">Nothing has been submitted for this milestone yet.</Feedback></div><div className="ws-stack">{tools}</div></div>
      ) : (
        <div className="ws-grid-2">
          <div className="ws-stack">
            <Card title={`Version ${submission.version} · ${formatDateTime(submission.createdAt)}`} action={<span className="ws-small ws-muted">by {personById(data, submission.submittedBy)?.name}</span>}>
              <dl className="ws-kv">
                {submission.link && <><dt>Link</dt><dd><a className="ws-link" href={submission.link} target="_blank" rel="noreferrer">{submission.link}</a></dd></>}
                {submission.fileName && <><dt>File</dt><dd><Icon name="file" size={11.5} /> {submission.fileName} <span className="ws-faint ws-small">(downloads once file storage is connected)</span></dd></>}
                <dt>Notes</dt><dd>{submission.notes || "–"}</dd>
                <dt>AI use</dt><dd>{submission.aiDeclaration}</dd>
              </dl>
            </Card>
            <Card title="Member contributions" pad={false}>
              <ul className="ws-list">
                {team.members.map((m) => {
                  const c = submission.contributions.find((x) => x.userId === m.userId);
                  return (
                    <li key={m.userId} style={{ alignItems: "flex-start" }}>
                      <Icon name={c ? "check" : "alert"} size={13.5} className={c ? "" : "ws-faint"} />
                      <div className="ws-list-main" style={{ display: "grid", gap: 2 }}><p>{personById(data, m.userId)?.name} <span className="ws-faint ws-small">{m.roles.join(", ")}</span></p><p style={{ whiteSpace: "normal" }}>{c?.text ?? "No contribution confirmed"}</p></div>
                    </li>
                  );
                })}
              </ul>
            </Card>
            {milestone.submissions.length > 1 && (
              <Card title="Earlier versions">
                <ol className="ws-timeline">
                  {milestone.submissions.slice(0, -1).reverse().map((s) => (
                    <li key={s.id} data-tone={s.review?.decision === "approved" ? "green" : "red"}>
                      <p style={{ fontWeight: 600 }}>v{s.version} · {formatDate(s.createdAt)}</p>
                      {s.review && <p className="ws-small ws-muted">{s.review.comments}</p>}
                    </li>
                  ))}
                </ol>
              </Card>
            )}
          </div>
          <div className="ws-stack">
            {waiting ? (
              <>
                <MascotGuide art="states/feedback" title="Give feedback the team can act on" compact>
                  <p>Point to a specific part of the deliverable. If something is missing, explain what would satisfy that checklist item.</p>
                </MascotGuide>
                <Card title="Your review">
                  <div className="ws-guidance-intro"><VisualSequence label="Review process" steps={[
                    { label: "Open deliverable", icon: "file" },
                    { label: "Check criteria", icon: "clipboard" },
                    { label: "Record decision", icon: "check" },
                  ]} /></div>
                  <ActionForm action={reviewSubmission} successArt="supervisor/decision">
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="order" value={milestone.order} />
                    <fieldset className="ws-fieldset">
                      <legend>Checklist</legend>
                      <div style={{ display: "grid", gap: 8 }}>
                        {milestone.checklist.map((c) => <label key={c} className="ws-check"><input type="checkbox" name="checklist" value={c} /><span>{c}</span></label>)}
                      </div>
                      <FieldError name="checklist" />
                    </fieldset>
                    <TextArea label="Comments for the team" name="comments" rows={5} maxLength={2000} placeholder="What works, what needs to change, and why." />
                    <Choices legend="Decision" name="decision" options={[["approved", "Approve"], ["changes_requested", "Request changes"]]} />
                    <p className="ws-small ws-muted">The team sees your decision and comments on their milestone page.</p>
                    <div><Submit arrow>Send review</Submit></div>
                  </ActionForm>
                </Card>
              </>
            ) : (
              <Card title={submission.review ? "Review recorded" : "Review"}>
                {submission.review ? (
                  <MascotGuide art="supervisor/decision" title={submission.review.decision === "approved" ? "Milestone approved" : "Changes requested"} compact>
                    <p>{submission.review.comments}</p>
                    <p className="ws-small ws-guide-review">{personById(data, submission.review.supervisorId)?.name} · {formatDateTime(submission.review.createdAt)}</p>
                  </MascotGuide>
                ) : <p className="ws-muted">Not reviewed yet.</p>}
              </Card>
            )}
            {tools}
          </div>
        </div>
      )}
    </div>
  );
}
