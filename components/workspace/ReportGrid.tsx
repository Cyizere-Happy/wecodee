import type { ReportCell } from "@/lib/workspace/selectors";
import { formatDate } from "@/lib/workspace/rules";

const label: Record<ReportCell, string> = { reported: "Reported", missed: "Missed", leave: "On leave", today: "Due today" };

/** FR-75: members by the last 14 working days. */
export function ReportGrid({ days, rows }: { days: string[]; rows: { userId: string; name: string; cells: ReportCell[]; hours: number }[] }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="ws-cells" role="table" aria-label="Daily reports by member and day" style={{ "--days": days.length } as React.CSSProperties}>
        <div className="ws-cells-row ws-small ws-faint" role="row">
          <span role="columnheader">Member</span>
          {days.map((d, i) => <span key={d} role="columnheader" style={{ textAlign: "center", fontSize: ".6188rem" }} aria-label={formatDate(d + "T12:00:00Z")}>{i % 2 === days.length % 2 ? formatDate(d + "T12:00:00Z", { day: "numeric" }) : ""}</span>)}
          <span role="columnheader" style={{ textAlign: "right" }}>Hours</span>
        </div>
        {rows.map((row) => (
          <div className="ws-cells-row" role="row" key={row.userId}>
            <span role="rowheader" style={{ fontWeight: 550, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.name}</span>
            {row.cells.map((c, i) => (
              <span key={days[i]} role="cell" className="ws-cell" data-state={c} data-tip={`${formatDate(days[i] + "T12:00:00Z", { weekday: "short", day: "numeric", month: "short" })}: ${label[c]}`} aria-label={`${formatDate(days[i] + "T12:00:00Z")}: ${label[c]}`} />
            ))}
            <span role="cell" className="ws-small ws-muted" style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{Math.round(row.hours * 10) / 10}</span>
          </div>
        ))}
      </div>
      <div className="ws-legend">
        {(["reported", "missed", "leave", "today"] as const).map((s) => <span key={s}><i className="ws-cell" data-state={s} />{label[s]}</span>)}
      </div>
    </div>
  );
}
