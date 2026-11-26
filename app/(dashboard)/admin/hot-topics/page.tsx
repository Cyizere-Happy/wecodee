import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import { minutes } from "@/lib/workspace/rules";
import { Badge, Forbidden, PageHeader } from "@/components/workspace/ui";
import { FilterInput } from "@/components/workspace/bits";
import { StateBreakdown } from "@/components/workspace/VisualSummary";

export const metadata = { title: "Hot Topics" };

/** FR-11–18: Hot Topic library management. */
// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function AdminHotTopics() {
  const { viewer, data } = await loadWorkspace("/admin/hot-topics");
  if (viewer.role !== "admin") return <Forbidden needs="admins" />;
  const topics = data.topics;
  const hasValidChecks = (count: number) => count >= 3 && count <= 5;

  return (
    <div className="ws-content">
      <PageHeader eyebrow="Admin" title="Hot Topics" lead="Short videos (10 minutes or less) with a coaching master prompt and 3–5 check questions." actions={<Link href="/admin/hot-topics/new" className="ws-btn ws-btn-primary ws-btn-sm">New Hot Topic</Link>} />
      <StateBreakdown label="Content pipeline" parts={[
        { label: "Published", value: topics.filter((topic) => topic.published).length, tone: "green" },
        { label: "Drafts with 3–5 questions", value: topics.filter((topic) => !topic.published && hasValidChecks(topic.questions.length)).length, tone: "ink" },
        { label: "Drafts outside question limit", value: topics.filter((topic) => !topic.published && !hasValidChecks(topic.questions.length)).length, tone: "amber" },
      ]} />
      <div style={{ marginBottom: 12, maxWidth: 360 }}><FilterInput target="topics" placeholder="Filter topics" /></div>
      <div className="ws-table-wrap" data-filter="topics">
        <table className="ws-table">
          <thead><tr><th>Title</th><th>Level</th><th>Milestone</th><th>Length</th><th>Questions</th><th>Views</th><th>Deep-dive</th><th>Status</th></tr></thead>
          <tbody>
            {topics.map((t) => (
              <tr key={t.id} data-row={`${t.title} ${t.category} ${t.level}`.toLowerCase()}>
                <td><Link href={"/admin/hot-topics/" + t.id} className="ws-link" style={{ textDecoration: "none", fontWeight: 600 }}>{t.title}</Link><div className="ws-small ws-muted">{t.category}{!t.youtubeUrl && " · no video yet"}</div></td>
                <td>{t.level}</td>
                <td>{t.phase ? `M${t.phase}` : "–"}</td>
                <td>{minutes(t.durationSec)}</td>
                <td><Badge tone={hasValidChecks(t.questions.length) ? "green" : "amber"} plain>{t.questions.length} saved</Badge></td>
                <td className="num">{t.views}</td>
                <td className="num">{t.deepDiveRequests}{t.deepDiveRequests >= data.settings.deepDiveThreshold && <> <Badge tone="red" plain>Threshold</Badge></>}</td>
                <td>{t.published ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
