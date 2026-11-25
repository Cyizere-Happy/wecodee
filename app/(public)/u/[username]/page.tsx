import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findPortfolio } from "@/lib/workspace/public";
import { formatDate } from "@/lib/workspace/rules";
import { Badge, Card, EmptyState, Initials, Mascot } from "@/components/workspace/ui";
import { PageSkeleton } from "@/components/workspace/Skeletons";

export const metadata = { title: "Portfolio · WeCodee" };

/**
 * FR-78: a learner's public portfolio at /u/username. Private portfolios answer
 * exactly like unknown ones. Email and WhatsApp number are never shown.
 */
export default function PublicPortfolioPage({ params }: { params: Promise<{ username: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Portfolio params={params} />
    </Suspense>
  );
}

async function Portfolio({ params }: { params: Promise<{ username: string }> }) {
  const p = findPortfolio(decodeURIComponent((await params).username));
  if (!p) notFound();
  return (
    <div className="ws-content ws-content-narrow">
      <section className="ws-card" style={{ overflow: "hidden" }}>
        <div className="ws-public-hero">
          <div style={{ display: "grid", gap: 9, padding: 22 }}>
            <div className="ws-row" style={{ gap: 12.5 }}>
              <Initials name={p.name} large />
              <div><h1 className="ws-title" style={{ fontSize: "1.2375rem" }}>{p.name}</h1><p className="ws-muted">{p.level} builder · on WeCodee since {formatDate(p.memberSince)}</p></div>
            </div>
            {p.skills.length > 0 && <div className="ws-tags">{p.skills.map((s) => <span key={s} className="ws-tag">{s}</span>)}</div>}
          </div>
          <Mascot scene="idea" className="ws-public-art" />
        </div>
      </section>
      <div className="ws-stack" style={{ marginTop: 14.5 }}>
        <Card title="Projects" pad={p.projects.length === 0}>
          {p.projects.length ? (
            <ul className="ws-list">
              {p.projects.map((pr) => (
                <li key={pr.title} style={{ alignItems: "flex-start" }}>
                  <div className="ws-list-main" style={{ display: "grid", gap: 3.5 }}>
                    <p style={{ fontWeight: 650 }}>{pr.title} <Badge plain>{pr.status === "complete" ? "Complete" : "In progress"}</Badge></p>
                    <p style={{ whiteSpace: "normal" }}>{pr.solution}</p>
                    <p>{pr.roles.length ? pr.roles.join(", ") + " · " : ""}Team {pr.team}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : <EmptyState compact scene="pathStart" title="No projects yet">Team projects appear here as they start.</EmptyState>}
        </Card>
        <Card title="Certificates" pad>
          {p.certificates.length ? (
            <ul className="ws-list">{p.certificates.map((c) => <li key={c.code}><div className="ws-list-main"><p>{c.projectTitle}</p><p>{c.role} · {formatDate(c.completedAt)}</p></div><Link className="ws-btn ws-btn-secondary ws-btn-sm" href={"/verify/" + c.code}>Verify</Link></li>)}</ul>
          ) : <p className="ws-small ws-muted">Certificates appear when a team project is complete.</p>}
        </Card>
      </div>
    </div>
  );
}
