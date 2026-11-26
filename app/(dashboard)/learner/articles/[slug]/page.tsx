import Link from "next/link";
import { notFound } from "next/navigation";
import { loadWorkspace } from "@/lib/workspace/data";
import { formatDate } from "@/lib/workspace/rules";
import { toggleSavedArticle } from "@/lib/workspace/actions";
import { Card, PageHeader, QuietLink } from "@/components/workspace/ui";
import { ActionButton } from "@/components/workspace/forms";
import { PageCrumb } from "@/components/workspace/Shell";
import { Icon } from "@/components/workspace/Icon";
import { MascotGuide, VisualSequence } from "@/components/workspace/Guidance";
import { milestoneGuide } from "@/lib/workspace/milestone-guide";

// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await loadWorkspace("/learner/articles/" + slug);
  const article = data.articles.find((a) => a.slug === slug && a.published);
  if (!article) notFound();
  const saved = data.savedArticles.includes(slug);
  const topics = data.topics.filter((t) => t.published && article.topicIds.includes(t.id));
  const milestones = data.templates.filter((m) => article.milestoneOrders.includes(m.order));
  const mainMilestone = milestones.length === 1 ? milestones[0] : undefined;
  const guide = mainMilestone && milestoneGuide(mainMilestone.order, mainMilestone.name);

  return (
    <div className="ws-content">
      <PageCrumb label={article.title} />
      <PageHeader
        eyebrow={`${article.category} · ${article.readingMin} min read · ${formatDate(article.publishedAt)}`}
        title={article.title}
        lead={article.excerpt}
        actions={<ActionButton run={toggleSavedArticle.bind(null, slug)} variant={saved ? "secondary" : "primary"} size="md" icon={saved ? "check" : "download"}>{saved ? "Saved article" : "Save article"}</ActionButton>}
      />
      <div className="ws-grid-2">
        <article className="ws-card ws-card-pad" style={{ padding: "25px 29px" }}>
          <div className="ws-prose">{article.body.map((p, i) => <p key={i}>{p}</p>)}</div>
        </article>
        <div className="ws-stack">
          {guide && <MascotGuide art="learner/concept" title="Apply this to your project" compact details={
            <details className="ws-guide-example">
              <summary>{guide.example}</summary>
              <VisualSequence label={guide.example} steps={guide.steps} compare={"compare" in guide && guide.compare} />
            </details>
          }>
            <p>{guide.goal}</p>
          </MascotGuide>}
          {(topics.length > 0 || milestones.length > 0) && (
            <Card title="Linked" pad={false}>
              <ul className="ws-list">
                {topics.map((t) => <li key={t.id}><Icon name="play" size={13.5} className="ws-faint" /><div className="ws-list-main"><p>{t.title}</p><p>Hot Topic · {Math.ceil(t.durationSec / 60)} min</p></div><QuietLink href={"/learner/hot-topics/" + t.id}>Watch</QuietLink></li>)}
                {milestones.map((m) => <li key={m.order}><Icon name="flag" size={13.5} className="ws-faint" /><div className="ws-list-main"><p>{m.name}</p><p>Milestone {m.order}</p></div><QuietLink href={"/learner/project/" + m.order}>Open</QuietLink></li>)}
              </ul>
            </Card>
          )}
          <Link href="/learner/articles" className="ws-quiet-link">← All articles</Link>
        </div>
      </div>
    </div>
  );
}
