import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadWorkspace } from "@/lib/workspace/data";
import { formatDate } from "@/lib/workspace/rules";
import { Badge, Feedback, PageHeader } from "@/components/workspace/ui";
import { PrintButton } from "@/components/workspace/certificate";
import { PageCrumb } from "@/components/workspace/Shell";
import { WorkflowRail } from "@/components/workspace/learning/WorkflowRail";

/** FR-50/52: a printable certificate. "Download PDF" uses the browser's Save as PDF. */
// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { viewer, data } = await loadWorkspace("/learner/certificates/" + code);
  const cert = data.certificates.find((c) => c.code === code);
  if (!cert || (cert.userId !== viewer.id && viewer.role !== "admin")) notFound();

  return (
    <div className="ws-content ws-content-narrow">
      <PageCrumb label={cert.code} />
      <PageHeader title="Certificate" actions={cert.revokedAt ? <Badge tone="red">Revoked</Badge> : <PrintButton />} />
      <div className="ws-visual-context">
        <WorkflowRail label="Certificate lifecycle" steps={[
          { label: "Project completed", icon: "flag", detail: formatDate(cert.completedAt), state: "complete" },
          { label: cert.revokedAt ? "Revoked" : "Certificate issued", icon: cert.revokedAt ? "alert" : "award", detail: cert.revokedAt ? formatDate(cert.revokedAt) : cert.code, state: cert.revokedAt ? "current" : "complete" },
          { label: "Public verification", icon: "search", detail: <Link className="ws-link" href={"/verify/" + cert.code}>Open verification</Link> },
        ]} />
      </div>
      {cert.revokedAt && <div style={{ marginBottom: 16 }}><Feedback tone="error">Revoked on {formatDate(cert.revokedAt)}: {cert.revokeReason}</Feedback></div>}
      <article className="ws-cert ws-print" style={{ padding: "43px 39.5px", textAlign: "center", display: "grid", gap: 14, justifyItems: "center" }}>
        <Image src="/brand/sheep-mark.png" alt="" width={50} height={50} />
        <p className="ws-eyebrow" style={{ margin: 0 }}>Certificate of completion</p>
        <p className="ws-muted">This certifies that</p>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 650, letterSpacing: "-.045em", lineHeight: 1.1 }}>{cert.learnerName}</h2>
        <p style={{ maxWidth: "46ch" }}>completed the project <strong>{cert.projectTitle}</strong> as <strong>{cert.role}</strong>, through all eight supervised WeCodee milestones.</p>
        <dl className="ws-kv ws-small" style={{ marginTop: 10, textAlign: "left" }}>
          <dt>Completed</dt><dd>{formatDate(cert.completedAt, { day: "numeric", month: "long", year: "numeric" })}</dd>
          <dt>Supervisor</dt><dd>{cert.supervisorName}</dd>
          <dt>Verification code</dt><dd className="mono">{cert.code}</dd>
        </dl>
        <p className="ws-small ws-faint" style={{ position: "relative" }}>Anyone can check this certificate on the WeCodee site at <span className="mono">/verify/{cert.code}</span>.</p>
      </article>
    </div>
  );
}
