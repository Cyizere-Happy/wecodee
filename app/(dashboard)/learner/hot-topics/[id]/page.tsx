import Link from "next/link";
import { notFound } from "next/navigation";
import { loadWorkspace } from "@/lib/workspace/data";
import { formatDate } from "@/lib/workspace/rules";
import { rateTopic, requestDeepDive } from "@/lib/workspace/actions";
import { Badge, Card, Feedback, PageHeader, QuietLink } from "@/components/workspace/ui";
import { CheckQuestions, CompleteToggle, PromptCopy, TopicVideo, TrackView } from "@/components/workspace/topic";
import { ActionForm, Choices, Submit, TextArea } from "@/components/workspace/forms";
import { PageCrumb } from "@/components/workspace/Shell";
import { Icon } from "@/components/workspace/Icon";

// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function HotTopic({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await loadWorkspace("/learner/hot-topics/" + id);
  const topic = data.topics.find((t) => t.id === id && t.published);
  if (!topic) notFound();
  const p = data.progress[id] ?? { attempts: 0 };
  const articles = data.articles.filter((a) => a.published && a.topicIds.includes(id));
  const milestone = data.templates.find((m) => m.order === topic.phase);

  return (
    <div className="ws-content">
      <PageCrumb label={topic.title} />
      <TrackView topicId={id} viewed={Boolean(p.viewedAt)} />
      <PageHeader
        eyebrow={`${topic.category} · ${topic.level} · ${Math.ceil(topic.durationSec / 60)} min`}
        title={topic.title}
        lead={topic.summary}
        actions={<CompleteToggle topicId={id} done={Boolean(p.completedAt)} />}
      />

      <div className="ws-grid-2">
        <div className="ws-stack">
          <TopicVideo url={topic.youtubeUrl} title={topic.title} lowData={data.profile.lowDataMode} />

          <Card title={<div><h2 className="ws-h3">Master prompt</h2><p className="ws-small ws-muted">Paste it into ChatGPT, Claude, Gemini or any assistant. It keeps the AI in tutor mode.</p></div>} action={<PromptCopy topicId={id} prompt={topic.masterPrompt} />}>
            <pre className="ws-prompt">{topic.masterPrompt}</pre>
          </Card>

          <Card title="Practice task">
            <p>{topic.practiceTask}.</p>
          </Card>

          <Card title={<div><h2 className="ws-h3">Check questions</h2><p className="ws-small ws-muted">{topic.questions.length} questions on the main ideas. Retries are welcome.</p></div>}>
            <CheckQuestions topicId={id} questions={topic.questions.map(({ id, question, options }) => ({ id, question, options, correct: -1, explanation: "" }))} best={p.bestScore} first={p.firstScore} attempts={p.attempts} />
          </Card>
        </div>

        <div className="ws-stack">
          <Card title="Your progress">
            <ul style={{ display: "grid", gap: 10 }}>
              {[
                ["Watched", p.viewedAt], ["Prompt copied", p.promptCopiedAt], ["Marked as done", p.completedAt],
              ].map(([label, at]) => (
                <li key={label} className="ws-row-between">
                  <span className="ws-row" style={{ gap: 8 }}><Icon name={at ? "check" : "clock"} size={13.5} className={at ? "" : "ws-faint"} />{label}</span>
                  <span className="ws-small ws-muted">{at ? formatDate(at) : "Not yet"}</span>
                </li>
              ))}
              <li className="ws-row-between"><span className="ws-row" style={{ gap: 8 }}><Icon name="quiz" size={13.5} className="ws-faint" />Check score</span><span className="ws-small ws-muted">{p.bestScore !== undefined ? `first ${p.firstScore}% · best ${p.bestScore}%` : "Not attempted"}</span></li>
            </ul>
          </Card>

          <Card title="Request a deep dive">
            {p.deepDive ? (
              <Feedback tone="success">Requested on {formatDate(p.deepDive.createdAt)}. {topic.deepDiveRequests} learners have asked for this topic; a live session is scheduled at {data.settings.deepDiveThreshold}.</Feedback>
            ) : !p.attempts ? (
              <Feedback tone="info">Answer the check questions first, then tell us what you’d like a live session to cover.</Feedback>
            ) : (
              <ActionForm action={requestDeepDive}>
                <input type="hidden" name="topicId" value={id} />
                <TextArea label="What should the session cover?" name="details" rows={3} maxLength={500} placeholder="For example: more examples of testable performance requirements." />
                <Choices legend="Preferred time" name="slot" options={[["weekday_evening", "Weekday evening"], ["weekend", "Weekend"]]} />
                <div><Submit size="sm">Send request</Submit></div>
              </ActionForm>
            )}
          </Card>

          <Card title="Rate this topic">
            <ActionForm action={rateTopic}>
              <input type="hidden" name="topicId" value={id} />
              <fieldset className="ws-fieldset">
                <legend className="ws-sr">Rating</legend>
                <div className="ws-stars">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label key={n} aria-label={`${n} star${n > 1 ? "s" : ""}`}><input type="radio" name="rating" value={n} defaultChecked={p.rating === n} />★</label>
                  ))}
                </div>
              </fieldset>
              <TextArea label="Comment (optional)" name="comment" rows={2} maxLength={280} defaultValue={p.comment} />
              <div><Submit size="sm" variant="secondary">Save rating</Submit></div>
            </ActionForm>
          </Card>

          {(milestone || articles.length > 0) && (
            <Card title="Related" pad={false}>
              <ul className="ws-list">
                {milestone && (
                  <li><Icon name="flag" size={13.5} className="ws-faint" /><div className="ws-list-main"><p>Milestone {milestone.order}: {milestone.name}</p><p>Watch this before submitting the milestone.</p></div><QuietLink href={"/learner/project/" + milestone.order}>Open</QuietLink></li>
                )}
                {articles.map((a) => (
                  <li key={a.slug}><Icon name="book" size={13.5} className="ws-faint" /><div className="ws-list-main"><p>{a.title}</p><p>{a.readingMin} min read</p></div><QuietLink href={"/learner/articles/" + a.slug}>Read</QuietLink></li>
                ))}
              </ul>
            </Card>
          )}
          <p className="ws-small ws-faint"><Badge plain>Tip</Badge> Turn on captions in the player if you’re somewhere noisy.</p>
          <Link href="/learner/hot-topics" className="ws-quiet-link">← All Hot Topics</Link>
        </div>
      </div>
    </div>
  );
}
