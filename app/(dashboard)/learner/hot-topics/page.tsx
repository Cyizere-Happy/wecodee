import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import { LEVELS } from "@/lib/workspace/rules";
import { Badge, EmptyState, PageHeader } from "@/components/workspace/ui";
import { AutoFilter } from "@/components/workspace/topic";
import { Icon } from "@/components/workspace/Icon";
import { TopicTrail } from "@/components/workspace/learning/EditorialVisuals";
import { StateBreakdown } from "@/components/workspace/VisualSummary";
import { MascotGuide } from "@/components/workspace/Guidance";

export const metadata = { title: "Hot Topics" };

// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function HotTopics({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { data } = await loadWorkspace("/learner/hot-topics");
  const { q = "", category = "", level = "", phase = "", status = "" } = await searchParams;
  const topics = data.topics.filter((t) => t.published);
  const categories = [...new Set(topics.map((t) => t.category))].sort();
  const query = q.trim().toLowerCase();
  const shown = topics.filter((t) => {
    const p = data.progress[t.id];
    const state = p?.completedAt ? "done" : p?.viewedAt ? "progress" : "new";
    return (!query || (t.title + " " + t.summary + " " + t.category).toLowerCase().includes(query))
      && (!category || t.category === category)
      && (!level || t.level === level)
      && (!phase || String(t.phase ?? "") === phase)
      && (!status || state === status);
  });
  const done = topics.filter((t) => data.progress[t.id]?.completedAt).length;
  const started = topics.filter((t) => data.progress[t.id]?.viewedAt && !data.progress[t.id]?.completedAt).length;
  const resume = shown.find((t) => data.progress[t.id]?.viewedAt && !data.progress[t.id]?.completedAt);
  const statusLink = (value: string) => {
    const filter = new URLSearchParams(Object.entries({ q, category, level, phase, status: value }).filter(([, v]) => v));
    return "/learner/hot-topics?" + filter.toString();
  };

  return (
    <div className="ws-content">
      <PageHeader
        eyebrow="Learn"
        title="Hot Topics"
      />

      <div className="ws-guided-layout">
        <MascotGuide title="Pick your next lesson" action={resume && <Link href={"/learner/hot-topics/" + resume.id} className="ws-quiet-link">Resume {resume.title}</Link>}>
          <p>Use the diagram to preview a lesson. Choose <strong>In progress</strong> to resume, or filter by project phase to find a lesson for your milestone.</p>
        </MascotGuide>
        <div className="ws-guided-content">
          <StateBreakdown label="Progress across all Hot Topics" parts={[
            { label: "Completed", value: done, tone: "green", href: statusLink("done"), current: status === "done" },
            { label: "In progress", value: started, tone: "red", href: statusLink("progress"), current: status === "progress" },
            { label: "Not started", value: topics.length - done - started, href: statusLink("new"), current: status === "new" },
          ]} />
          <AutoFilter>
            <label className="ws-search">
              <Icon name="search" size={13.5} />
              <input className="ws-input" type="search" name="q" defaultValue={q} placeholder="Search Hot Topics" aria-label="Search Hot Topics" />
            </label>
            <select className="ws-select" name="category" defaultValue={category} aria-label="Category">
              <option value="">All categories</option>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select className="ws-select" name="level" defaultValue={level} aria-label="Level">
              <option value="">All levels</option>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
            <select className="ws-select" name="phase" defaultValue={phase} aria-label="Project phase">
              <option value="">Any phase</option>
              {data.templates.map((m) => <option key={m.order} value={m.order}>{m.order}. {m.name}</option>)}
            </select>
            <select className="ws-select" name="status" defaultValue={status} aria-label="Progress">
              <option value="">Any progress</option>
              <option value="new">Not started</option>
              <option value="progress">In progress</option>
              <option value="done">Completed</option>
            </select>
          </AutoFilter>

          {shown.length ? (
            <div className="ws-topic-library">
              {shown.map((t) => {
                const p = data.progress[t.id];
                const milestone = data.templates.find((m) => m.order === t.phase);
                return (
                  <Link key={t.id} href={"/learner/hot-topics/" + t.id} className="ws-topic-entry">
                    <TopicTrail id={t.id} fallback={t.summary} />
                    <div className="ws-row-between">
                      <span className="ws-small ws-muted">{t.category}</span>
                      {p?.completedAt ? <Badge tone="green">Done</Badge> : p?.viewedAt ? <Badge tone="blue">In progress</Badge> : <Badge plain>{t.level}</Badge>}
                    </div>
                    <h2 className="ws-h2">{t.title}</h2>
                    <div className="ws-row ws-small ws-faint" style={{ gap: 14 }}>
                      <span className="ws-row" style={{ gap: 4 }}><Icon name="clock" size={11.5} />{Math.ceil(t.durationSec / 60)} min</span>
                      {milestone && <span className="ws-row" style={{ gap: 4 }}><Icon name="flag" size={11.5} />Milestone {milestone.order}</span>}
                      {p?.bestScore !== undefined && <span className="ws-row" style={{ gap: 4 }}><Icon name="quiz" size={11.5} />{p.bestScore}%</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="ws-card">
              <EmptyState showArt={false} title="No lessons match" actions={<Link href="/learner/hot-topics" className="ws-btn ws-btn-secondary ws-btn-sm">Clear filters</Link>}>
                Try a different word, or clear the filters to see every Hot Topic.
              </EmptyState>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
