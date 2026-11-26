import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import { learnerStats, myTeam, teamProject } from "@/lib/workspace/selectors";
import { formatDate, nowMs } from "@/lib/workspace/rules";
import { Badge, Card, EmptyState, Initials, PageHeader, Stats } from "@/components/workspace/ui";
import { MascotGuide } from "@/components/workspace/Guidance";
import { PreferenceSwitch } from "@/components/workspace/prefs";

export const metadata = { title: "Portfolio" };

// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function Portfolio() {
  const { viewer, data } = await loadWorkspace("/learner/portfolio");
  const p = data.profile;
  const stats = learnerStats(data);
  const team = myTeam(data, viewer);
  const project = team ? teamProject(data, team.id) : null;
  const roles = team?.members.find((m) => m.userId === viewer.id)?.roles ?? [];
  const certs = data.certificates.filter((c) => c.userId === viewer.id && !c.revokedAt);
  const age = p.dateOfBirth ? (nowMs() - new Date(p.dateOfBirth).getTime()) / (365.25 * 86_400_000) : null;
  const minor = age !== null && age < 18;
  const events = data.events.filter((e) => data.attended.includes(e.id));

  return (
    <div className="ws-content">
      <PageHeader
        eyebrow="Showcase"
        title="Portfolio"
        lead={<>This is how your portfolio looks to others at <span className="mono">/u/{p.username}</span>. Your email and WhatsApp number are never shown.</>}
        actions={<Badge tone={p.portfolioPublic ? "green" : undefined}>{p.portfolioPublic ? "Public" : "Private"}</Badge>}
      />

      <div className="ws-grid-2">
        <div className="ws-stack">
          <section className="ws-card" style={{ overflow: "hidden" }}>
            <div className="ws-card-body" style={{ display: "grid", gap: 10 }}>
                <div className="ws-row" style={{ gap: 14 }}>
                  <Initials name={p.name} large />
                  <div><h2 style={{ fontSize: "1.2375rem", fontWeight: 650, letterSpacing: "-.04em" }}>{p.name}</h2><p className="ws-muted">{p.skillLevel ?? p.experienceLevel} builder{roles.length ? " · " + roles.join(", ") : ""}</p></div>
                </div>
                <p>{p.bio || <span className="ws-faint">Add a short bio in Settings.</span>}</p>
                <div className="ws-tags">{p.skills.map((s) => <span key={s} className="ws-tag">{s}</span>)}</div>
                <div className="ws-tags">{Array.from({ length: stats.badges }, (_, i) => <Badge key={i} tone="red">Hot Topic badge ×10</Badge>)}</div>
            </div>
          </section>

          <Stats items={[
            { label: "Participation", value: stats.hours.total, unit: "h" },
            { label: "Hot Topics", value: stats.completed },
            { label: "Average check", value: stats.average ?? "–", unit: stats.average !== null ? "%" : undefined },
            { label: "Events attended", value: events.length },
          ]} />

          <Card title="Projects" pad={!project}>
            {project ? (
              <ul className="ws-list">
                <li style={{ alignItems: "flex-start" }}>
                  <div className="ws-list-main" style={{ display: "grid", gap: 4 }}>
                    <p style={{ fontWeight: 650 }}>{project.title} <Badge plain>{project.status === "complete" ? "Complete" : "In progress"}</Badge></p>
                    <p style={{ whiteSpace: "normal" }}>{project.solution}</p>
                    <p>Role: {roles.join(", ") || "–"} · Team {team?.name}</p>
                    {project.milestones.find((m) => m.order === 5)?.submissions.at(-1)?.link && <a className="ws-link ws-small" href={project.milestones.find((m) => m.order === 5)!.submissions.at(-1)!.link} target="_blank" rel="noreferrer">Repository</a>}
                  </div>
                </li>
              </ul>
            ) : <EmptyState compact scene="pathStart" title="No projects yet">Your team project will appear here.</EmptyState>}
          </Card>

          <Card title="Certificates" pad={!certs.length}>
            {certs.length ? (
              <ul className="ws-list">{certs.map((c) => <li key={c.code}><div className="ws-list-main"><p>{c.projectTitle}</p><p>{c.role} · {formatDate(c.completedAt)} · <span className="mono">{c.code}</span></p></div></li>)}</ul>
            ) : <p className="ws-small ws-muted">Certificates appear here when your project is complete. <Link href="/learner/certificates" className="ws-link">How to earn one</Link></p>}
          </Card>
        </div>

        <div className="ws-stack">
          <MascotGuide art="learner/portfolio" title="Show your role in the work" compact>
            <p>Add a short bio and skills in Settings. Your projects, team roles, and certificates appear as you earn them.</p>
          </MascotGuide>
          <Card title="Visibility">
            <PreferenceSwitch name="portfolioPublic" value={p.portfolioPublic} disabled={minor && !p.portfolioPublic} label="Public portfolio" description={minor ? "Learners under 18 stay private unless a guardian approves." : "Anyone with the link can see it. Private by default."} />
          </Card>
          <Card title="Participation hours">
            <p className="ws-small ws-muted" style={{ marginBottom: 12 }}>Active time on the platform, plus live events you attended, plus hours in your daily reports (up to 12 a day).</p>
            <div className="ws-bars">
              {([["Active on WeCodee", stats.hours.active], ["Live events", stats.hours.events], ["Daily reports", stats.hours.reports]] as const).map(([label, value]) => (
                <div className="ws-bar" key={label}><span>{label}</span><span className="ws-bar-track"><span style={{ width: `${stats.hours.total ? (value / stats.hours.total) * 100 : 0}%` }} data-tone={label === "Daily reports" ? "red" : undefined} /></span><span className="num">{value} h</span></div>
              ))}
            </div>
            <p className="ws-small ws-faint" style={{ marginTop: 12 }}>Active time counts only while the page is visible and you’ve interacted in the last 5 minutes.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
