import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import { LEVELS } from "@/lib/workspace/rules";
import { Badge, EmptyState, PageHeader } from "@/components/workspace/ui";
import { AutoFilter } from "@/components/workspace/topic";
import { Icon } from "@/components/workspace/Icon";
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

  return (
    <div className="ws-content">
      <PageHeader
        eyebrow="Learn"
        title="Hot Topics"
        lead="Short lessons you can use on your project."
        actions={<span className="ws-badge" data-plain>{done} of {topics.length} completed</span>}
      />

      {topics.length > 0 && !q && !category && !level && !phase && !status && (
        <div className="ws-guidance-intro"><MascotGuide art="learner/lesson" title="Pick one idea to put into practice" compact>
          <p>Start with the short video when it’s available. Use the coaching prompt to practise, then try the check questions.</p>
        </MascotGuide></div>
      )}

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
        <div className="ws-grid">
          {shown.map((t) => {
            const p = data.progress[t.id];
            const milestone = data.templates.find((m) => m.order === t.phase);
            return (
              <Link key={t.id} href={"/learner/hot-topics/" + t.id} className="ws-card ws-card-pad" style={{ display: "grid", gap: 10, alignContent: "start" }}>
                <div className="ws-row-between">
                  <span className="ws-small ws-muted">{t.category}</span>
                  {p?.completedAt ? <Badge tone="green">Done</Badge> : p?.viewedAt ? <Badge tone="blue">In progress</Badge> : <Badge plain>{t.level}</Badge>}
                </div>
                <h2 className="ws-h2" style={{ fontSize: ".8438rem" }}>{t.title}</h2>
                <p className="ws-small ws-muted" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.summary}</p>
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
          <EmptyState still="map" title="Nothing on the map for that search." actions={<Link href="/learner/hot-topics" className="ws-btn ws-btn-secondary ws-btn-sm">Clear filters</Link>}>
            Try a different word, or clear the filters to see every Hot Topic.
          </EmptyState>
        </div>
      )}
    </div>
  );
}
