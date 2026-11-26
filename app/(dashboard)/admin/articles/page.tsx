import { loadWorkspace } from "@/lib/workspace/data";
import { ARTICLE_WORD_LIMIT, formatDate } from "@/lib/workspace/rules";
import { saveArticle } from "@/lib/workspace/actions";
import type { Article, HotTopic, MilestoneTemplate } from "@/lib/workspace/types";
import { Badge, Forbidden, PageHeader } from "@/components/workspace/ui";
import { ActionForm, Check, Choices, DialogButton, Field, Submit, TextArea } from "@/components/workspace/forms";

export const metadata = { title: "Articles" };

function ArticleForm({ article, topics, templates }: { article?: Article; topics: HotTopic[]; templates: MilestoneTemplate[] }) {
  return (
    <ActionForm action={saveArticle}>
      <input type="hidden" name="slug" value={article?.slug ?? ""} />
      <Field label="Title" name="title" defaultValue={article?.title} maxLength={120} required />
      <div className="ws-form-row">
        <Field label="Category" name="category" defaultValue={article?.category} maxLength={40} />
        <Field label="Excerpt" name="excerpt" defaultValue={article?.excerpt} maxLength={200} />
      </div>
      <TextArea label="Body" name="body" rows={12} defaultValue={article?.body.join("\n\n")} help={`Separate paragraphs with a blank line. Up to ${ARTICLE_WORD_LIMIT} words.`} />
      <Choices legend="Related Hot Topics" name="topicIds" type="checkbox" defaultValue={article?.topicIds} options={topics.map((t) => [t.id, t.title] as [string, string])} />
      <Choices legend="Show on milestones" name="milestones" type="checkbox" defaultValue={article?.milestoneOrders.map(String)} options={templates.map((m) => [String(m.order), `M${m.order}`] as [string, string])} />
      <Check name="published" defaultChecked={article?.published ?? true}>Published</Check>
      <div><Submit size="sm">{article ? "Save article" : "Create article"}</Submit></div>
    </ActionForm>
  );
}

/** FR-19–21: short articles (≤ 1,000 words) linked to topics and milestones. */
// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function AdminArticles() {
  const { viewer, data } = await loadWorkspace("/admin/articles");
  if (viewer.role !== "admin") return <Forbidden needs="admins" />;

  return (
    <div className="ws-content">
      <PageHeader eyebrow="Admin" title="Articles" lead={`Short reads, ${ARTICLE_WORD_LIMIT} words at most, linked to Hot Topics and milestones.`} actions={
        <DialogButton label="New article" variant="primary" title="New article"><ArticleForm topics={data.topics} templates={data.templates} /></DialogButton>
      } />
      <div className="ws-table-wrap">
        <table className="ws-table">
          <thead><tr><th>Title</th><th>Words</th><th>Milestones</th><th>Published</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {data.articles.map((a) => (
              <tr key={a.slug}>
                <td><strong>{a.title}</strong><div className="ws-small ws-muted">{a.category}</div></td>
                <td className="num">{a.wordCount}</td>
                <td>{a.milestoneOrders.map((o) => "M" + o).join(", ") || "–"}</td>
                <td>{formatDate(a.publishedAt)}</td>
                <td>{a.published ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}</td>
                <td style={{ textAlign: "right" }}><DialogButton label="Edit" title={`Edit “${a.title}”`}><ArticleForm article={a} topics={data.topics} templates={data.templates} /></DialogButton></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
