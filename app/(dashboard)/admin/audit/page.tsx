import { loadWorkspace } from "@/lib/workspace/data";
import { formatDateTime } from "@/lib/workspace/rules";
import { EmptyState, Forbidden, PageHeader } from "@/components/workspace/ui";
import { CsvButton, FilterInput } from "@/components/workspace/bits";

export const metadata = { title: "Audit log" };

/** FR-60: read-only log of sensitive actions. */
export default async function AdminAudit() {
  const { viewer, data } = await loadWorkspace("/admin/audit");
  if (viewer.role !== "admin") return <Forbidden needs="admins" />;
  const entries = [...data.audit].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const rows: (string | number)[][] = [["When", "Actor", "Action", "Entity", "Entity ID", "Details"], ...entries.map((e) => [e.createdAt, e.actor, e.action, e.entity, e.entityId, e.details])];

  return (
    <div className="ws-content">
      <PageHeader eyebrow="Admin" title="Audit log" lead="Team changes, reviews, certificates, role changes and settings. Entries can’t be edited or deleted." actions={<CsvButton name="wecodee-audit.csv" rows={rows} />} />
      {entries.length ? (
        <>
          <div style={{ marginBottom: 12, maxWidth: 360 }}><FilterInput target="audit" placeholder="Filter by actor, action or details" /></div>
          <div className="ws-table-wrap" data-filter="audit">
            <table className="ws-table">
              <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Details</th></tr></thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} data-row={`${e.actor} ${e.action} ${e.details} ${e.entityId}`.toLowerCase()}>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDateTime(e.createdAt)}</td>
                    <td>{e.actor}</td>
                    <td><span className="mono ws-small">{e.action}</span></td>
                    <td className="ws-small">{e.details}<div className="ws-faint">{e.entity} · {e.entityId}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : <div className="ws-card"><EmptyState still="lock" title="Nothing logged yet" /></div>}
    </div>
  );
}
