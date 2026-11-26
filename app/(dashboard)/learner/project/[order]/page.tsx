import Link from "next/link";
import { notFound } from "next/navigation";
import { loadWorkspace } from "@/lib/workspace/data";
import { isLeader, isOverdue, myTeam, personById, teamProject } from "@/lib/workspace/selectors";
import { formatDate, formatDateTime, relativeDays } from "@/lib/workspace/rules";
import { confirmContribution, markMilestoneTopicWatched, setMilestoneDue, submitMilestone } from "@/lib/workspace/actions";
import { Badge, Card, MilestoneBadge, PageHeader, QuietLink } from "@/components/workspace/ui";
import { milestoneGuide } from "@/lib/workspace/milestone-guide";
import { ActionButton, ActionForm, DialogButton, Field, FieldError, Submit, TextArea } from "@/components/workspace/forms";
import { PageCrumb } from "@/components/workspace/Shell";
import { Icon } from "@/components/workspace/Icon";
import { RequirementsStudio } from "@/components/workspace/learning/RequirementsStudio";
import { ChecklistProgress } from "@/components/workspace/VisualSummary";
import { MilestoneStudio } from "@/components/workspace/learning/MilestoneStudios";
import { VisualSequence } from "@/components/workspace/Guidance";
import { GuideDialog } from "@/components/workspace/GuideDialog";

const exampleSrsFeedback = "Good structure. FR-4 and FR-9 aren't testable yet: add measurable conditions. Please also add non-functional requirements for data use on phones.";

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
  const yourContribution = confirmed.get(viewer.id);
  const confirmationCount = team.members.filter((member) => confirmed.has(member.userId)).length;
  const teamConfirmed = confirmationCount === team.members.length;
  const contributionField = "milestone-contribution-input";
  const submissionField = "milestone-submission-link";
  const submitTitle = leader ? "Submit for review" : "Your leader submits";
  const latest = milestone.submissions.at(-1);
  const overdue = isOverdue(milestone);
  const guide = milestoneGuide(order, milestone.name);
  const locked = milestone.status === "locked";
  const srs = Boolean(guide && order === 3);

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

      {!locked && (
        <section className="ws-milestone-tools" aria-label="Milestone actions">
          {open && <div className="ws-milestone-topic">
            <StepDot n={1} done={milestone.topicWatched} />
            <div>
              <p className="ws-lesson-label">Linked Hot Topic</p>
              {topic ? <Link href={"/learner/hot-topics/" + topic.id} className="ws-link">{topic.title}</Link> : <p>No Hot Topic is linked.</p>}
              {topic && <p className="ws-small ws-muted">{Math.ceil(topic.durationSec / 60)} min · {topic.category}</p>}
            </div>
            {topic && (milestone.topicWatched ? <Badge tone="green">Watched</Badge> : <ActionButton run={markMilestoneTopicWatched.bind(null, order)} variant="primary">Mark as watched</ActionButton>)}
            {topic && <GuideDialog showMascot label="Show me how to watch the linked Hot Topic" title="Start with the linked Hot Topic" art="learner/lesson" action={{ label: "Open Hot Topic", href: `/learner/hot-topics/${topic.id}` }}>
              <VisualSequence label="Hot Topic steps" steps={[
                { label: "Watch the lesson", detail: topic.title, icon: "play", state: milestone.topicWatched ? "done" : "current" },
                { label: "Mark as watched", detail: "Come back here to mark it. This unlocks submission.", icon: "check", state: milestone.topicWatched ? "done" : "pending" },
              ]} />
            </GuideDialog>}
          </div>}
          <nav aria-label="Jump to milestone work">
            {open && <a href="#milestone-contributions" className="ws-quiet-link">Contributions</a>}
            {open && leader && <a href="#milestone-submit" className="ws-quiet-link">Submission</a>}
            {milestone.status === "changes_requested" && latest?.review && <a href="#milestone-feedback" className="ws-quiet-link">Feedback</a>}
            <a href="#milestone-checklist" className="ws-quiet-link">Checklist</a>
            <a href="#milestone-history" className="ws-quiet-link">History</a>
          </nav>
        </section>
      )}
      {(locked || milestone.status === "submitted" || milestone.status === "approved") && (
        <section className="ws-milestone-notice" aria-label="Milestone status">
          <Icon name={locked ? "lock" : milestone.status === "submitted" ? "clock" : "check"} size={18} />
          <p>
            {locked ? <>This milestone opens when milestone {order - 1} is approved.</>
              : milestone.status === "submitted" ? <>Version {latest?.version} is waiting for review{latest ? `, submitted ${formatDateTime(latest.createdAt)}` : ""}. The decision will appear in History.</>
              : order < 8 ? <>Approved. Milestone {order + 1} is now open.</> : "Approved. Your project is complete."}
          </p>
          {locked ? <QuietLink href="/learner/project">Back to project</QuietLink> : milestone.status === "approved" && (
            order < 8 ? <QuietLink href={"/learner/project/" + (order + 1)}>Go to milestone {order + 1}</QuietLink> : <QuietLink href="/learner/certificates">Check certificates</QuietLink>
          )}
        </section>
      )}
      {guide && (srs ? <RequirementsStudio /> : <MilestoneStudio order={order} />)}

      {!locked && (
        <div className={open ? "ws-grid-2" : "ws-stack"}>
          {open && <div className="ws-stack">
            {milestone.status === "changes_requested" && latest?.review && (
                <section className="ws-revision" id="milestone-feedback" aria-labelledby="revision-title">
                  <div className="ws-row ws-wrap"><Badge tone="red">Changes requested</Badge><span className="ws-muted">Version {latest.version} · {formatDate(latest.review.createdAt)}</span></div>
                  <h2 id="revision-title">Supervisor feedback</h2>
                  <figure>
                    <blockquote>{latest.review.comments}</blockquote>
                    <figcaption>{personById(data, latest.review.supervisorId)?.name ?? "Your supervisor"}</figcaption>
                  </figure>
                  {srs && latest.review.comments.trim() === exampleSrsFeedback && (
                    <ul className="ws-revision-links">
                      <li><a href="#testable-requirement">Make FR-4 and FR-9 testable <Icon name="arrowRight" size={13} /></a></li>
                      <li><a href="#requirement-types">Add measurable conditions <Icon name="arrowRight" size={13} /></a></li>
                      <li><a href="#mobile-data">Include a nonfunctional requirement for mobile data usage <Icon name="arrowRight" size={13} /></a></li>
                    </ul>
                  )}
                </section>
            )}

                <div id="milestone-contributions" className="ws-lesson-anchor"><Card title={<StepTitle n={2} done={teamConfirmed} title="Everyone confirms their contribution" />} action={
                  <GuideDialog showMascot label="Show me how to confirm my contribution" title="Confirm your contribution" art="learner/team" action={{ label: yourContribution ? "Edit my contribution" : "Write my contribution", focusId: contributionField }}>
                    <VisualSequence label="Contribution steps" steps={[
                      { label: "Write what you did", detail: srs ? "Example: I rewrote two requirements so the team can test them." : "Example: I revised the deliverable and checked it against the milestone checklist.", icon: "clipboard", state: yourContribution ? "done" : "current" },
                      { label: "Check team confirmations", detail: `${confirmationCount} of ${team.members.length} confirmed. Each teammate fills in their own contribution.`, icon: "users", state: teamConfirmed ? "done" : "pending" },
                    ]} />
                  </GuideDialog>
                }>
                  <ChecklistProgress label="Team confirmations" items={team.members.map((member) => ({
                    label: member.userId === viewer.id ? "You" : personById(data, member.userId)?.name ?? "Team member",
                    complete: confirmed.has(member.userId),
                  }))} />
                  <div className="ws-divider" />
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
                    <TextArea id={contributionField} label={yourContribution ? "Update your contribution" : "Your contribution"} name="contribution" rows={2} maxLength={200} defaultValue={yourContribution} placeholder="One or two lines on what you did for this milestone." />
                    <div><Submit size="sm" variant="secondary">Confirm</Submit></div>
                  </ActionForm>
                </Card></div>

                <div id="milestone-submit" className="ws-lesson-anchor"><Card title={<StepTitle n={3} done={false} title={submitTitle} />} action={
                  <GuideDialog showMascot label={`Show me how ${leader ? "to submit for review" : "my team submits"}`} title={submitTitle} art="states/submission" action={
                    leader ? { label: "Go to submission", focusId: submissionField } : yourContribution ? undefined : { label: "Write my contribution", focusId: contributionField }
                  }>
                    <VisualSequence label="Before submitting" steps={[
                      { label: "Watch the Hot Topic", icon: "play", state: milestone.topicWatched ? "done" : "pending" },
                      { label: "Confirm contributions", detail: `${confirmationCount} of ${team.members.length} confirmed`, icon: "users", state: teamConfirmed ? "done" : "pending" },
                      { label: "Send the deliverable", detail: leader ? "Add a link or file and declare how you used AI." : "Your leader sends the work to your supervisor.", icon: "file", state: milestone.topicWatched && teamConfirmed ? "current" : "pending" },
                    ]} />
                  </GuideDialog>
                }>
                  {leader ? (
                    <ActionForm action={submitMilestone} successArt="states/received">
                      {milestone.topicWatched && teamConfirmed && (
                        <p className="ws-small ws-muted">Topic and contributions are complete. Attach your deliverable and tell your supervisor what to look for.</p>
                      )}
                      <input type="hidden" name="order" value={order} />
                      <Field id={submissionField} label="Link" name="link" type="url" placeholder="Google Docs, GitHub or a live URL" help="A link, a file, or both." />
                      <Field label="File (optional)" name="file" type="file" accept=".pdf,.docx,.zip" help="PDF, DOCX or ZIP, up to 10 MB." />
                      <TextArea label="Notes for your supervisor" name="notes" rows={3} maxLength={2000} placeholder={milestone.status === "changes_requested" ? "What did you change since the last version?" : "Anything your supervisor should know."} />
                      <TextArea label="AI-use declaration" name="aiDeclaration" rows={3} maxLength={1000} help="Which AI tools did you use, for what, and what did the team do itself? Honest declarations are never penalised." />
                      <FieldError name="contributions" />
                      <div className="ws-row ws-wrap"><Submit arrow disabled={!milestone.topicWatched}>Submit version {milestone.submissions.length + 1}</Submit>{!milestone.topicWatched && <span className="ws-small ws-muted">Watch the Hot Topic first.</span>}</div>
                    </ActionForm>
                  ) : <p className="ws-small ws-muted">{personById(data, team.leaderId)?.name} submits once everyone has confirmed. Make sure your contribution is in.</p>}
                </Card></div>
          </div>}

          <div className={open ? "ws-stack" : "ws-grid-even"}>
            <div id="milestone-checklist" className="ws-lesson-anchor"><Card title="What your supervisor checks">
              <ul style={{ display: "grid", gap: 8 }}>{milestone.checklist.map((c) => <li key={c} className="ws-row ws-small" style={{ alignItems: "flex-start" }}><Icon name="check" size={12.5} className="ws-faint" />{c}</li>)}</ul>
            </Card></div>
            <div id="milestone-history" className="ws-lesson-anchor"><Card title="History" action={<Badge plain>{milestone.submissions.length} version{milestone.submissions.length === 1 ? "" : "s"}</Badge>}>
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
            </Card></div>
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
      <StepDot n={n} done={done} />
      <h2 className="ws-h3">{title}</h2>
    </div>
  );
}

function StepDot({ n, done }: { n: number; done: boolean }) {
  return <span className="ws-step-dot" data-done={done || undefined}>
    <span className="ws-sr">Step {n}{done && ", complete"}</span>
    <span aria-hidden="true">{done ? <Icon name="check" size={11} /> : n}</span>
  </span>;
}
