import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import { myTeam, personById, teamProject } from "@/lib/workspace/selectors";
import { CERTIFICATE_MIN_MILESTONES, formatDate } from "@/lib/workspace/rules";
import { Badge, Card, EmptyState, Meter, PageHeader } from "@/components/workspace/ui";
import { VerifyCertificate } from "@/components/workspace/certificate";

export const metadata = { title: "Certificates" };

// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function Certificates() {
  const { viewer, data } = await loadWorkspace("/learner/certificates");
  const mine = data.certificates.filter((c) => c.userId === viewer.id);
  const team = myTeam(data, viewer);
  const project = team ? teamProject(data, team.id) : null;
  const contributed = project?.milestones.filter((m) => m.submissions.some((s) => s.contributions.some((c) => c.userId === viewer.id))).length ?? 0;
  const approved = project?.milestones.filter((m) => m.status === "approved").length ?? 0;

  return (
    <div className="ws-content">
      <PageHeader eyebrow="Showcase" title="Certificates" lead="Free and verifiable. Each one shows your name, project, role, completion date, supervisor and a unique code." />
      <div className="ws-grid-2">
        <div className="ws-stack">
          {mine.length ? mine.map((c) => (
            <article key={c.code} className="ws-cert">
              <div className="ws-row-between ws-wrap" style={{ position: "relative", zIndex: 1 }}>
                <span className="ws-eyebrow">WeCodee certificate of completion</span>
                {c.revokedAt ? <Badge tone="red">Revoked</Badge> : <Badge tone="green">Valid</Badge>}
              </div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 650, letterSpacing: "-.04em", marginTop: 6, position: "relative" }}>{c.learnerName}</h2>
              <p className="ws-muted" style={{ position: "relative" }}>{c.role} on <strong style={{ color: "var(--ws-ink)" }}>{c.projectTitle}</strong>, completed {formatDate(c.completedAt)}, supervised by {c.supervisorName}.</p>
              <div className="ws-row-between ws-wrap" style={{ marginTop: 16, position: "relative" }}>
                <span className="mono ws-small">{c.code}</span>
                <div className="ws-actions"><Link href={"/learner/certificates/" + c.code} className="ws-btn ws-btn-primary ws-btn-sm">View and download</Link></div>
              </div>
            </article>
          )) : (
            <div className="ws-card">
              <EmptyState art="learner/certificate" title="How to earn your certificate">
                Certificates are issued when your project is complete, to every member who confirmed contributions on at least {CERTIFICATE_MIN_MILESTONES} of 8 milestones.
              </EmptyState>
              {project && (
                <div className="ws-card-body" style={{ borderTop: "1px solid var(--ws-border)", display: "grid", gap: 14 }}>
                  <div><div className="ws-row-between ws-small"><span>Milestones approved</span><span className="ws-muted">{approved} of 8</span></div><Meter value={approved} max={8} label="Milestones approved" /></div>
                  <div><div className="ws-row-between ws-small"><span>Your confirmed contributions</span><span className="ws-muted">{contributed} of {CERTIFICATE_MIN_MILESTONES} needed</span></div><Meter value={contributed} max={CERTIFICATE_MIN_MILESTONES} tone="red" label="Contributions confirmed" /></div>
                  <p className="ws-small ws-muted">Supervisor: {personById(data, team!.supervisorId)?.name}. Keep confirming your contribution on every milestone.</p>
                </div>
              )}
            </div>
          )}
        </div>
        <Card title="Verify a certificate">
          <p className="ws-small ws-muted" style={{ marginBottom: 12 }}>Enter a code to check a certificate is genuine. Anyone can also check at /verify, no sign-in needed.</p>
          <VerifyCertificate />
        </Card>
      </div>
    </div>
  );
}
