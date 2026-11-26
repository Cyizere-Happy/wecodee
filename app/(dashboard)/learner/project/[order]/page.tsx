import Link from "next/link";
import { notFound } from "next/navigation";
import { loadWorkspace } from "@/lib/workspace/data";
import { isLeader, isOverdue, myTeam, personById, teamProject } from "@/lib/workspace/selectors";
import { formatDate, formatDateTime, relativeDays } from "@/lib/workspace/rules";
import { confirmContribution, markMilestoneTopicWatched, setMilestoneDue, submitMilestone } from "@/lib/workspace/actions";
import { Badge, Card, EmptyState, Feedback, Mascot, MilestoneBadge, PageHeader, QuietLink } from "@/components/workspace/ui";
import { ActionButton, ActionForm, DialogButton, Field, FieldError, Submit, TextArea } from "@/components/workspace/forms";
import { PageCrumb } from "@/components/workspace/Shell";
import { Icon } from "@/components/workspace/Icon";

// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function MilestonePage({ params }: { params: Promise<{ order: string }> }) {
  const { order: raw } = await params;
  const order = Number(raw);
  const { viewer, data } = await loadWorkspace("/learner/project/" + raw);
  const team = myTeam(data, viewer);
  const project = team ? teamProject(data, team.id) : null;
  const milestone = project?.milestones.find((m) => m.order === order);
  if (!Number.isInteger(order) || !team || !project || !milestone) notFound();

  const leader = isLeader(team, viewer);
  const topic = data.topics.find((t) => t.id === milestone.topicId);
  const articles = data.articles.filter((a) => a.published && a.milestoneOrders.includes(order));
  const open = milestone.status === "open" || milestone.status === "changes_requested";
  const confirmed = new Map(milestone.pendingContributions.map((c) => [c.userId, c.text]));
  const latest = milestone.submissions.at(-1);
  const overdue = isOverdue(milestone);

  return (
    <div className="ws-content">
      <PageCrumb label={`Milestone ${order}`} />
      <PageHeader
        eyebrow={`Milestone ${order} of 8 · ${project.title}`}
        title={milestone.name}
        lead={<>Deliverable: {milestone.deliverable}.</>}
        actions={<>
          <MilestoneBadge status={milestone.status} overdue={overdue} />
          <span className="ws-small ws-muted">{milestone.dueDate ? `Due ${formatDate(milestone.dueDate)} · ${relativeDays(milestone.dueDate)}` : "No due date"}</span>
          {leader && milestone.status !== "approved" && (
            <DialogButton label="Set due date" title="Set the due date" description="Your supervisor can adjust it." icon="calendar">
              <ActionForm action={setMilestoneDue}>
                <input type="hidden" name="order" value={order} />
                <Field label="Due date" name="dueDate" type="date" defaultValue={milestone.dueDate?.slice(0, 10)} />
                <div><Submit size="sm">Save</Submit></div>
              </ActionForm>
            </DialogButton>
          )}
        </>}
      />

      {milestone.status === "locked" ? (
        <div className="ws-card"><EmptyState still="lock" title="This milestone is still locked" actions={<Link href="/learner/project" className="ws-btn ws-btn-secondary">Back to project</Link>}>It opens when milestone {order - 1} is approved. One milestone at a time keeps everyone moving together.</EmptyState></div>
      ) : (
        <div className="ws-grid-2">
          <div className="ws-stack">
            {milestone.status === "submitted" && (
              <section className="ws-card" style={{ overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", alignItems: "center" }}>
                  <div className="ws-card-body"><h2 className="ws-h2">On its way to your supervisor</h2><p className="ws-small ws-muted" style={{ marginTop: 4 }}>Version {latest?.version} was submitted {latest && formatDateTime(latest.createdAt)}. The review shows up here and in Notifications.</p></div>
                  <Mascot scene="launch" style={{ height: 150 }} />
                </div>
              </section>
            )}
            {milestone.status === "approved" && (
              <section className="ws-card" style={{ overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", alignItems: "center" }}>
                  <div className="ws-card-body"><h2 className="ws-h2">Approved. Nice work.</h2><p className="ws-small ws-muted" style={{ marginTop: 4 }}>{order < 8 ? `Milestone ${order + 1} is now open.` : "Your project is complete."}</p>{order < 8 && <div style={{ marginTop: 10 }}><QuietLink href={"/learner/project/" + (order + 1)}>Go to milestone {order + 1}</QuietLink></div>}</div>
                  <Mascot scene="celebrate" style={{ height: 150 }} />
                </div>
              </section>
            )}
            {milestone.status === "changes_requested" && latest?.review && (
              <Feedback tone="error"><strong>Changes requested by {personById(data, latest.review.supervisorId)?.name}:</strong> {latest.review.comments}</Feedback>
            )}

            {open && (
              <>
                <Card title={<StepTitle n={1} done={milestone.topicWatched} title="Watch the linked Hot Topic" />}>
                  {topic ? (
                    <div className="ws-row-between ws-wrap">
                      <div className="ws-row"><Icon name="play" size={14.5} className="ws-faint" /><div><Link href={"/learner/hot-topics/" + topic.id} className="ws-link">{topic.title}</Link><p className="ws-small ws-muted">{Math.ceil(topic.durationSec / 60)} min · {topic.category}</p></div></div>
                      {milestone.topicWatched ? <Badge tone="green">Watched</Badge> : <ActionButton run={markMilestoneTopicWatched.bind(null, order)} variant="primary">Mark as watched</ActionButton>}
                    </div>
                  ) : <p className="ws-small ws-muted">No Hot Topic is linked to this milestone.</p>}
                </Card>

                <Card title={<StepTitle n={2} done={team.members.every((m) => confirmed.has(m.userId))} title="Everyone confirms their contribution" />}>
                  <ul style={{ display: "grid", gap: 10 }}>
                    {team.members.map((m) => {
                      const text = confirmed.get(m.userId);
                      return (
                        <li key={m.userId} className="ws-row" style={{ alignItems: "flex-start" }}>
                          <Icon name={text ? "check" : "clock"} size={13.5} className={text ? "" : "ws-faint"} />
                          <div style={{ minWidth: 0 }}><p style={{ fontWeight: 550 }}>{m.userId === viewer.id ? "You" : personById(data, m.userId)?.name}</p><p className="ws-small ws-muted">{text ?? "Not confirmed yet"}</p></div>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="ws-divider" />
                  <ActionForm action={confirmContribution}>
                    <input type="hidden" name="order" value={order} />
                    <TextArea label={confirmed.has(viewer.id) ? "Update your contribution" : "Your contribution"} name="contribution" rows={2} maxLength={200} defaultValue={confirmed.get(viewer.id)} placeholder="One or two lines on what you did for this milestone." />
                    <div><Submit size="sm" variant="secondary">Confirm</Submit></div>
                  </ActionForm>
                </Card>

                <Card title={<StepTitle n={3} done={false} title={leader ? "Submit for review" : "Your leader submits"} />}>
                  {leader ? (
                    <ActionForm action={submitMilestone}>
                      <input type="hidden" name="order" value={order} />
                      <Field label="Link" name="link" type="url" placeholder="Google Docs, GitHub or a live URL" help="A link, a file, or both." />
                      <Field label="File (optional)" name="file" type="file" accept=".pdf,.docx,.zip" help="PDF, DOCX or ZIP, up to 10 MB." />
                      <TextArea label="Notes for your supervisor" name="notes" rows={3} maxLength={2000} placeholder={milestone.status === "changes_requested" ? "What did you change since the last version?" : "Anything your supervisor should know."} />
                      <TextArea label="AI-use declaration" name="aiDeclaration" rows={3} maxLength={1000} help="Which AI tools did you use, for what, and what did the team do itself? Honest declarations are never penalised." />
                      <FieldError name="contributions" />
                      <div className="ws-row ws-wrap"><Submit arrow disabled={!milestone.topicWatched}>Submit version {milestone.submissions.length + 1}</Submit>{!milestone.topicWatched && <span className="ws-small ws-muted">Watch the Hot Topic first.</span>}</div>
                    </ActionForm>
                  ) : <p className="ws-small ws-muted">{personById(data, team.leaderId)?.name} submits once everyone has confirmed. Make sure your contribution is in.</p>}
                </Card>
              </>
            )}
          </div>

          <div className="ws-stack">
            <Card title="What your supervisor checks">
              <ul style={{ display: "grid", gap: 8 }}>{milestone.checklist.map((c) => <li key={c} className="ws-row ws-small" style={{ alignItems: "flex-start" }}><Icon name="check" size={12.5} className="ws-faint" />{c}</li>)}</ul>
            </Card>
            <Card title="History" action={<Badge plain>{milestone.submissions.length} version{milestone.submissions.length === 1 ? "" : "s"}</Badge>}>
              {milestone.submissions.length ? (
                <ol className="ws-timeline">
                  {[...milestone.submissions].reverse().map((s) => (
                    <li key={s.id} data-tone={s.review?.decision === "approved" ? "green" : s.review ? "red" : undefined}>
                      <p style={{ fontWeight: 600 }}>Version {s.version} · {formatDateTime(s.createdAt)}</p>
                      <p className="ws-small ws-muted">Submitted by {s.submittedBy === viewer.id ? "you" : personById(data, s.submittedBy)?.name ?? "the leader"}</p>
                      {s.link && <a className="ws-link ws-small" href={s.link} target="_blank" rel="noreferrer" style={{ overflowWrap: "anywhere" }}>{s.link}</a>}
                      {s.fileName && <p className="ws-small"><Icon name="file" size={11} /> {s.fileName}</p>}
                      {s.notes && <p className="ws-small" style={{ marginTop: 4 }}>{s.notes}</p>}
                      <p className="ws-small ws-muted" style={{ marginTop: 4 }}><strong>AI use:</strong> {s.aiDeclaration}</p>
                      {s.review && <div className="ws-feedback" data-tone={s.review.decision === "approved" ? "success" : "error"} style={{ marginTop: 8 }}><span><strong>{s.review.decision === "approved" ? "Approved" : "Changes requested"}</strong> · {formatDate(s.review.createdAt)}<br />{s.review.comments}</span></div>}
                    </li>
                  ))}
                </ol>
              ) : <p className="ws-small ws-muted">Nothing submitted yet. Every version and comment will be kept here.</p>}
            </Card>
            {articles.length > 0 && (
              <Card title="Read before you submit" pad={false}>
                <ul className="ws-list">{articles.map((a) => <li key={a.slug}><Icon name="book" size={13.5} className="ws-faint" /><div className="ws-list-main"><p>{a.title}</p><p>{a.readingMin} min read</p></div><QuietLink href={"/learner/articles/" + a.slug}>Read</QuietLink></li>)}</ul>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StepTitle({ n, title, done }: { n: number; title: string; done: boolean }) {
  return (
    <div className="ws-row">
      <span className="ws-step-dot" style={done ? { background: "var(--ws-ink)", borderColor: "var(--ws-ink)", color: "#fff" } : undefined}>{done ? <Icon name="check" size={11} /> : n}</span>
      <h2 className="ws-h3">{title}</h2>
    </div>
  );
}
