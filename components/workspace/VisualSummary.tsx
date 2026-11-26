import Link from "next/link";
import { formatDate } from "@/lib/workspace/rules";
import { Icon } from "./Icon";

type Count = {
  label: string;
  value: number;
  tone?: "red" | "ink" | "green" | "amber" | "neutral";
  href?: string;
  current?: boolean;
};

/** A proportion and its exact counts share one set of labels. */
export function StateBreakdown({ label, parts }: { label: string; parts: readonly Count[] }) {
  const hasValues = parts.some((part) => part.value > 0);
  return (
    <figure className="ws-state-breakdown">
      <figcaption>{label}</figcaption>
      <div className="ws-state-track" aria-hidden="true">
        {hasValues && parts.filter((part) => part.value > 0).map((part) => (
          <span key={part.label} data-tone={part.tone} style={{ flexGrow: part.value }} />
        ))}
      </div>
      <ul>
        {parts.map(({ label: name, value, tone, href, current }) => {
          const content = <><i data-tone={tone} aria-hidden="true" /><span>{name}</span><strong>{value}</strong></>;
          return (
            <li key={name}>
              {href ? <Link href={href} aria-current={current ? "true" : undefined}>{content}</Link> : <span>{content}</span>}
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

export function DailyHours({ days }: { days: readonly { date: string; hours: number }[] }) {
  const max = Math.max(1, ...days.map((day) => day.hours));
  return (
    <figure className="ws-daily-hours">
      <figcaption>Team hours by working day</figcaption>
      <ul>
        {days.map(({ date, hours }) => {
          const iso = date + "T12:00:00Z";
          const value = Math.round(hours * 10) / 10;
          return (
            <li key={date}>
              <span className="ws-sr">{formatDate(iso, { weekday: "long", day: "numeric", month: "short" })}, {value} hours</span>
              <span className="ws-hours-value" aria-hidden="true">{value || "–"}</span>
              <span aria-hidden="true" className="ws-hours-bar">
                <span style={{ height: (hours / max) * 100 + "%" }} data-empty={hours === 0} />
              </span>
              <time aria-hidden="true" dateTime={date}>{formatDate(iso, { day: "numeric" })}</time>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

export function DateTile({ date }: { date: string }) {
  return (
    <time className="ws-date-tile" dateTime={date} aria-label={formatDate(date, { weekday: "long", day: "numeric", month: "long" })}>
      <span aria-hidden="true">{formatDate(date, { month: "short" })}</span>
      <strong aria-hidden="true">{formatDate(date, { day: "numeric" })}</strong>
    </time>
  );
}

export function ChecklistProgress({ label, items, showLabels = false }: {
  label: string;
  items: readonly { label: string; complete: boolean; detail?: string }[];
  showLabels?: boolean;
}) {
  return (
    <figure className="ws-check-progress" data-labels={showLabels}>
      <figcaption><span>{label}</span><strong>{items.filter((item) => item.complete).length} of {items.length}</strong></figcaption>
      <ol>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} data-complete={item.complete} title={item.detail ?? item.label}>
            <Icon name={item.complete ? "check" : "clock"} size={12} />
            <span className={showLabels ? undefined : "ws-sr"}>{item.label}<span className="ws-sr">{item.complete ? " complete" : " pending"}</span>
              {item.detail && <small className="ws-check-detail">{item.detail}</small>}
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}
