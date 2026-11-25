import { notFound } from "next/navigation";
import { loadWorkspace } from "@/lib/workspace/data";
import { LEVELS } from "@/lib/workspace/rules";
import { removeCheckQuestion, saveCheckQuestion, saveTopic, setTopicPublished } from "@/lib/workspace/actions";
import type { HotTopic } from "@/lib/workspace/types";
import { Badge, Card, Forbidden, PageHeader } from "@/components/workspace/ui";
import { ActionButton, ActionForm, Field, Select, Submit, TextArea } from "@/components/workspace/forms";
import { PageCrumb } from "@/components/workspace/Shell";

const TEMPLATE = `You are my patient coding tutor. I'm a {level} learner working on: {topic}.
Explain the idea in simple terms with one small example.
Then give me a short exercise. Don't give me the full solution until I've tried.
When I share my attempt, point out one thing I did well and one thing to improve.`;

/** Create or edit a Hot Topic, its check questions and publish state. */
export default async function EditHotTopic({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { viewer, data } = await loadWorkspace("/admin/hot-topics/" + id);
  if (viewer.role !== "admin") return <Forbidden needs="admins" />;
  const isNew = id === "new";
  const topic: HotTopic | undefined = isNew ? undefined : data.topics.find((t) => t.id === id);
  if (!isNew && !topic) notFound();
  const n = topic?.questions.length ?? 0;

  return (
    <div className="ws-content">
      <PageCrumb label={topic?.title ?? "New"} />
      <PageHeader
        eyebrow="Hot Topic"
        title={topic?.title ?? "New Hot Topic"}
        lead={isNew ? "New topics start as drafts. Add 3–5 check questions, then publish." : undefined}
        actions={topic && (topic.published
          ? <><Badge tone="green">Published</Badge><ActionButton run={setTopicPublished.bind(null, topic.id, false)} confirm={{ title: "Move to drafts?", body: "Learners won’t see it until you publish again. Their progress is kept.", action: "Unpublish" }}>Unpublish</ActionButton></>
          : <><Badge>Draft</Badge><ActionButton run={setTopicPublished.bind(null, topic.id, true)} variant="primary" disabled={n < 3 || n > 5} tip={n < 3 ? "Add at least 3 check questions first" : undefined}>Publish</ActionButton></>)}
      />
      <div className="ws-grid-2">
        <Card title="Details">
          <ActionForm action={saveTopic}>
            <input type="hidden" name="id" value={topic?.id ?? ""} />
            <Field label="Title" name="title" defaultValue={topic?.title} maxLength={120} required />
            <TextArea label="Summary" name="summary" rows={2} maxLength={400} defaultValue={topic?.summary} />
            <Field label="YouTube link" name="youtubeUrl" type="url" defaultValue={topic?.youtubeUrl} placeholder="https://youtu.be/…" help="Leave empty until the video is recorded. Learners see a placeholder." />
            <div className="ws-form-row">
              <Field label="Minutes" name="minutes" type="number" min={0} max={10} defaultValue={topic ? Math.floor(topic.durationSec / 60) : 8} required />
              <Field label="Seconds" name="seconds" type="number" min={0} max={59} defaultValue={topic ? topic.durationSec % 60 : 0} />
            </div>
            <div className="ws-form-row">
              <Select label="Level" name="level" defaultValue={topic?.level ?? "Beginner"} options={LEVELS} />
              <Select label="Milestone" name="phase" defaultValue={topic?.phase ? String(topic.phase) : ""} placeholder="Not linked" options={data.templates.map((m) => [String(m.order), `M${m.order} · ${m.name}`] as [string, string])} />
            </div>
            <Field label="Category" name="category" defaultValue={topic?.category} maxLength={40} placeholder="e.g. Requirements" />
            <TextArea label="Master prompt" name="masterPrompt" rows={7} maxLength={4000} defaultValue={topic?.masterPrompt ?? TEMPLATE} help="Coaching template: the AI is a tutor and doesn’t give full solutions before the learner tries." />
            <TextArea label="Practice task" name="practiceTask" rows={2} maxLength={400} defaultValue={topic?.practiceTask} />
            <div><Submit>{isNew ? "Create draft" : "Save changes"}</Submit></div>
          </ActionForm>
        </Card>

        <div className="ws-stack">
          {topic ? (
            <>
              <Card title="Check questions" action={<Badge tone={n >= 3 && n <= 5 ? "green" : "amber"} plain>{n} of 3–5</Badge>} pad={false}>
                {n > 0 ? (
                  <ol className="ws-list">
                    {topic.questions.map((q, i) => (
                      <li key={q.id} style={{ alignItems: "flex-start" }}>
                        <span className="ws-faint ws-small">{i + 1}</span>
                        <div className="ws-list-main" style={{ display: "grid", gap: 2 }}><p style={{ whiteSpace: "normal" }}>{q.question}</p><p>Answer: {q.options[q.correct]}</p></div>
                        <ActionButton run={removeCheckQuestion.bind(null, topic.id, q.id)} variant="ghost" icon="trash" tip="Remove question" confirm={{ title: "Remove this question?", body: "Learners’ past scores are kept.", action: "Remove", danger: true }}><span className="ws-sr">Remove</span></ActionButton>
                      </li>
                    ))}
                  </ol>
                ) : <p className="ws-card-body ws-small ws-muted">No questions yet.</p>}
              </Card>
              {n < 5 && (
                <Card title="Add a question">
                  <ActionForm action={saveCheckQuestion} reset>
                    <input type="hidden" name="topicId" value={topic.id} />
                    <Field label="Question" name="question" maxLength={300} required />
                    {[0, 1, 2, 3].map((i) => <Field key={i} label={`Option ${i + 1}${i > 1 ? " (optional)" : ""}`} name={"option" + i} maxLength={200} required={i < 2} />)}
                    <Select label="Correct option" name="correct" defaultValue="0" options={[["0", "Option 1"], ["1", "Option 2"], ["2", "Option 3"], ["3", "Option 4"]]} />
                    <Field label="Explanation" name="explanation" maxLength={300} help="Shown after the learner answers." />
                    <div><Submit size="sm" variant="secondary">Add question</Submit></div>
                  </ActionForm>
                </Card>
              )}
              <Card title="Engagement">
                <dl className="ws-kv"><dt>Views</dt><dd>{topic.views}</dd><dt>Prompt copies</dt><dd>{topic.promptCopies}</dd><dt>Deep-dive requests</dt><dd>{topic.deepDiveRequests} of {data.settings.deepDiveThreshold}</dd></dl>
              </Card>
            </>
          ) : <Card title="Check questions"><p className="ws-small ws-muted">Save the draft first, then add 3–5 questions.</p></Card>}
        </div>
      </div>
    </div>
  );
}
