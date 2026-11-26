import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import { CERTIFICATE_MIN_MILESTONES, formatDate } from "@/lib/workspace/rules";
import { revokeCertificate } from "@/lib/workspace/actions";
import { Badge, EmptyState, Forbidden, PageHeader } from "@/components/workspace/ui";
import { ActionForm, DialogButton, Submit, TextArea } from "@/components/workspace/forms";
import { CsvButton, FilterInput } from "@/components/workspace/bits";
import { StateBreakdown } from "@/components/workspace/VisualSummary";
import { WorkflowRail } from "@/components/workspace/learning/WorkflowRail";

export const metadata = { title: "Certificates" };

/** FR-49–52: issued certificates and revocation. */
// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function AdminCertificates() {
  const { viewer, data } = await loadWorkspace("/admin/certificates");
  if (viewer.role !== "admin") return <Forbidden needs="admins" />;
  const certs = [...data.certificates].sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  const rows: (string | number)[][] = [["Code", "Learner", "Project", "Role", "Completed", "Supervisor", "Revoked"], ...certs.map((c) => [c.code, c.learnerName, c.projectTitle, c.role, c.completedAt.slice(0, 10), c.supervisorName, c.revokedAt ? c.revokedAt.slice(0, 10) : ""])];

  return (
    <div className="ws-content">
      <PageHeader eyebrow="Admin" title="Certificates" lead="Find a credential or review its status." actions={<CsvButton name="wecodee-certificates.csv" rows={rows} />} />
      <StateBreakdown label="Issued certificates" parts={[
        { label: "Valid", value: certs.filter((certificate) => !certificate.revokedAt).length, tone: "green" },
        { label: "Revoked", value: certs.filter((certificate) => certificate.revokedAt).length, tone: "red" },
      ]} />
      <div className="ws-visual-context"><WorkflowRail label="Certificate issuance" steps={[
        { label: "Project completed", icon: "flag" },
        { label: "Contributions checked", icon: "clipboard", detail: `At least ${CERTIFICATE_MIN_MILESTONES} of 8 milestones per learner` },
        { label: "Certificate issued", icon: "award" },
      ]} /></div>
      {certs.length ? (
        <>
          <div style={{ marginBottom: 12, maxWidth: 360 }}><FilterInput target="certs" placeholder="Filter by code, learner or project" /></div>
          <div className="ws-table-wrap" data-filter="certs">
            <table className="ws-table">
              <thead><tr><th>Code</th><th>Learner</th><th>Project</th><th>Completed</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {certs.map((c) => (
                  <tr key={c.code} data-row={`${c.code} ${c.learnerName} ${c.projectTitle}`.toLowerCase()}>
                    <td className="mono"><Link className="ws-link" href={"/admin/certificates/" + c.code}>{c.code}</Link></td>
                    <td>{c.learnerName}<div className="ws-small ws-muted">{c.role}</div></td>
                    <td>{c.projectTitle}</td>
                    <td>{formatDate(c.completedAt)}</td>
                    <td>{c.revokedAt ? <span title={c.revokeReason}><Badge tone="red">Revoked</Badge></span> : <Badge tone="green">Valid</Badge>}</td>
                    <td style={{ textAlign: "right" }}>
                      {!c.revokedAt && (
                        <DialogButton label="Revoke" variant="danger-quiet" title={`Revoke ${c.code}?`} description="Verification will show this certificate as revoked, with your reason. This can’t be undone.">
                          <ActionForm action={revokeCertificate}>
                            <input type="hidden" name="code" value={c.code} />
                            <TextArea label="Reason" name="reason" rows={3} maxLength={300} required />
                            <div><Submit size="sm" variant="danger">Revoke certificate</Submit></div>
                          </ActionForm>
                        </DialogButton>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : <div className="ws-card"><EmptyState still="badge" title="No certificates yet">They appear here as soon as the first project is complete.</EmptyState></div>}
    </div>
  );
}
