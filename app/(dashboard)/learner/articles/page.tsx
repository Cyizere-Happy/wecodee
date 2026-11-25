import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import { formatDate } from "@/lib/workspace/rules";
import { toggleSavedArticle } from "@/lib/workspace/actions";
import { Badge, EmptyState, PageHeader } from "@/components/workspace/ui";
import { AutoFilter } from "@/components/workspace/topic";
import { ActionButton } from "@/components/workspace/forms";
import { Icon } from "@/components/workspace/Icon";

export const metadata = { title: "Articles" };

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
      <PageHeader eyebrow="Learn" title="Articles" lead="Five minutes or less. Save articles to find them again." />
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
        <div className="ws-card" style={{ overflow: "hidden" }}>
          <ul className="ws-list">
            {shown.map((a) => {
              const isSaved = data.savedArticles.includes(a.slug);
              return (
                <li key={a.slug} style={{ alignItems: "flex-start", paddingBlock: 16 }}>
                  <div className="ws-list-main" style={{ display: "grid", gap: 4 }}>
                    <Link href={"/learner/articles/" + a.slug} style={{ fontWeight: 650, fontSize: ".8438rem", letterSpacing: "-.015em" }}>{a.title}</Link>
                    <p>{a.excerpt}</p>
                    <div className="ws-row ws-small ws-faint" style={{ gap: 12, marginTop: 2 }}>
                      <span>{a.category}</span><span>{a.readingMin} min read</span><span>{formatDate(a.publishedAt)}</span>
                      {isSaved && <Badge tone="green">Saved</Badge>}
                    </div>
                  </div>
                  <ActionButton run={toggleSavedArticle.bind(null, a.slug)} variant="ghost" icon={isSaved ? "check" : "download"} tip={isSaved ? "Remove from saved" : "Save article"}>
                    <span className="ws-desktop-only">{isSaved ? "Saved" : "Save"}</span>
                  </ActionButton>
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
