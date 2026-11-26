import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import { toggleSavedArticle } from "@/lib/workspace/actions";
import { Badge, EmptyState, PageHeader } from "@/components/workspace/ui";
import { AutoFilter } from "@/components/workspace/topic";
import { ActionButton } from "@/components/workspace/forms";
import { Icon } from "@/components/workspace/Icon";
import { ArticleCover } from "@/components/workspace/learning/EditorialVisuals";

export const metadata = { title: "Articles" };

// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function Articles({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { data } = await loadWorkspace("/learner/articles");
  const { q = "", category = "", saved = "" } = await searchParams;
  const articles = data.articles.filter((a) => a.published);
  const categories = [...new Set(articles.map((a) => a.category))].sort();
  const query = q.trim().toLowerCase();
  const shown = articles.filter((a) =>
    (!query || (a.title + " " + a.excerpt + " " + a.body.join(" ")).toLowerCase().includes(query))
    && (!category || a.category === category)
    && (!saved || data.savedArticles.includes(a.slug)));

  return (
    <div className="ws-content">
      <PageHeader eyebrow="Learn" title="Articles" />
      <AutoFilter>
        <label className="ws-search">
          <Icon name="search" size={13.5} />
          <input className="ws-input" type="search" name="q" defaultValue={q} placeholder="Search articles" aria-label="Search articles" />
        </label>
        <select className="ws-select" name="category" defaultValue={category} aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="ws-select" name="saved" defaultValue={saved} aria-label="Saved">
          <option value="">All articles</option>
          <option value="1">Saved articles</option>
        </select>
      </AutoFilter>

      {shown.length ? (
        <div className="ws-editorial-index">
          <ul>
            {shown.map((a) => {
              const isSaved = data.savedArticles.includes(a.slug);
              return (
                <li key={a.slug}>
                  <div className="ws-editorial-entry">
                    <Link href={"/learner/articles/" + a.slug}>
                      <ArticleCover slug={a.slug} />
                      <h2>{a.title}</h2>
                    </Link>
                    <p>{a.excerpt}</p>
                    <div className="ws-editorial-meta">
                      <div className="ws-row ws-small ws-muted" style={{ gap: 8 }}>
                        <span>{a.category} · {a.readingMin} min read</span>
                        {isSaved && <Badge tone="green">Saved</Badge>}
                      </div>
                      <ActionButton run={toggleSavedArticle.bind(null, a.slug)} variant="ghost" icon={isSaved ? "check" : "download"} tip={isSaved ? "Remove from saved" : "Save article"}>
                        <span className="ws-sr">{isSaved ? "Remove from saved articles" : "Save article"}</span>
                        <span className="ws-desktop-only" aria-hidden="true">{isSaved ? "Saved" : "Save"}</span>
                      </ActionButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="ws-card">
          <EmptyState still={saved ? "envelope" : "map"} title={saved ? "No saved articles yet" : "No articles match"} actions={<Link href="/learner/articles" className="ws-btn ws-btn-secondary ws-btn-sm">Show all articles</Link>}>
            {saved ? "Save an article while you’re online to read it later without a connection." : "Try another word or category."}
          </EmptyState>
        </div>
      )}
    </div>
  );
}
