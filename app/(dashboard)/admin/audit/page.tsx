import { loadWorkspace } from "@/lib/workspace/data";
import { formatDateTime, kigaliDay } from "@/lib/workspace/rules";
import { EmptyState, Forbidden, PageHeader } from "@/components/workspace/ui";
import { CsvButton, FilterInput } from "@/components/workspace/bits";
import { DateTile, StateBreakdown } from "@/components/workspace/VisualSummary";

export const metadata = { title: "Audit log" };

/** FR-60: read-only log of sensitive actions. */
// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function AdminAudit() {
  const { viewer, data } = await loadWorkspace("/admin/audit");
  if (viewer.role !== "admin") return <Forbidden needs="admins" />;
  const entries = [...data.audit].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const counts = new Map<string, number>();
  for (const { entity } of entries) counts.set(entity, (counts.get(entity) ?? 0) + 1);
  const activity = [...counts].sort((a, b) => b[1] - a[1]);
  const entityParts = activity.slice(0, 4).map(([entity, value], index) => ({
    label: entity.charAt(0).toUpperCase() + entity.slice(1), value,
    tone: (["red", "ink", "green", "amber"] as const)[index],
  }));
  const remaining = activity.slice(4).reduce((sum, [, value]) => sum + value, 0);
  const rows: (string | number)[][] = [["When", "Actor", "Action", "Entity", "Entity ID", "Details"], ...entries.map((e) => [e.createdAt, e.actor, e.action, e.entity, e.entityId, e.details])];

  return (
    <div className="ws-content">
      <PageHeader eyebrow="Admin" title="Audit log" lead="Team changes, reviews, certificates, role changes and settings. Entries can’t be edited or deleted." actions={<CsvButton name="wecodee-audit.csv" rows={rows} />} />
      {entries.length ? (
        <>
          <StateBreakdown label="Activity by record type" parts={remaining ? [...entityParts, { label: "Other", value: remaining }] : entityParts} />
          <div style={{ marginBottom: 12, maxWidth: 360 }}><FilterInput target="audit" placeholder="Filter by actor, action or details" /></div>
          <div className="ws-table-wrap" data-filter="audit">
            <table className="ws-table">
              <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Details</th></tr></thead>
              <tbody>
                {entries.map((e, index) => (
                  <tr key={e.id} data-row={`${e.actor} ${e.action} ${e.details} ${e.entityId}`.toLowerCase()}>
                    <td><div className="ws-row" style={{ gap: 7, whiteSpace: "nowrap" }}>
                      {(index === 0 || kigaliDay(Date.parse(entries[index - 1].createdAt)) !== kigaliDay(Date.parse(e.createdAt))) && <DateTile date={e.createdAt} />}
                      <time dateTime={e.createdAt}>{formatDateTime(e.createdAt)}</time>
                    </div></td>
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
