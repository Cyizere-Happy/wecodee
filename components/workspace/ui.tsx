import type { ReactNode } from "react";
import Link from "next/link";
import { mascotArtSrc, scenes, stills, type ArtName, type SceneName, type StillName } from "@/lib/workspace/mascot";
import type { MilestoneStatus, Readiness } from "@/lib/workspace/types";
import { milestoneStatusLabel } from "@/lib/workspace/rules";
import { Icon, type IconName } from "./Icon";

type Tone = "red" | "green" | "amber" | "blue" | "ink" | undefined;

export function PageHeader({ eyebrow, title, lead, actions }: { eyebrow?: string; title: ReactNode; lead?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="ws-page-head">
      <div>
        {eyebrow && <span className="ws-eyebrow">{eyebrow}</span>}
        <h1 className="ws-title">{title}</h1>
        {lead && <p className="ws-lead">{lead}</p>}
      </div>
      {actions && <div className="ws-actions">{actions}</div>}
    </header>
  );
}

export function Badge({ tone, children, plain }: { tone?: Tone; children: ReactNode; plain?: boolean }) {
  return <span className="ws-badge" data-tone={tone} data-plain={plain || undefined}>{children}</span>;
}

const milestoneTone: Record<MilestoneStatus, Tone> = { locked: undefined, open: "blue", submitted: "amber", changes_requested: "red", approved: "green" };
export function MilestoneBadge({ status, overdue }: { status: MilestoneStatus; overdue?: boolean }) {
  if (overdue) return <Badge tone="red">Overdue</Badge>;
  return <Badge tone={milestoneTone[status]}>{milestoneStatusLabel[status]}</Badge>;
}

const readinessTone: Record<Readiness, Tone> = { High: "green", Medium: "blue", Low: "amber" };
export function ReadinessBadge({ level }: { level: Readiness }) {
  return <Badge tone={readinessTone[level]}>{level} readiness</Badge>;
}

export function Mascot({ art, still, scene, alt, className = "", style }: { art?: ArtName; still?: StillName; scene?: SceneName; alt?: string; className?: string; style?: React.CSSProperties }) {
  const src = art ? mascotArtSrc(art) : still ? stills[still] : scenes[scene ?? "cards"];
  return (
    <span className={"ws-mascot " + className} data-soft={still ? "" : undefined} data-scene={scene ? "" : undefined} role={alt ? "img" : undefined} aria-label={alt} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={art ? 512 : undefined} height={art ? 512 : undefined} decoding="async" loading="lazy" />
    </span>
  );
}

export function EmptyState({ art, still, scene, title, children, actions, compact }: {
  art?: ArtName; still?: StillName; scene?: SceneName; title: string; children?: ReactNode; actions?: ReactNode; compact?: boolean;
}) {
  return (
    <div className={"ws-empty" + (compact ? " ws-empty-compact" : "")}>
      <Mascot art={art} still={still} scene={scene} />
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {actions && <div className="ws-actions">{actions}</div>}
    </div>
  );
}

export function Tip({ still = "mark", title, children, action }: { still?: StillName; title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <aside className="ws-tip">
      <Mascot still={still} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p><strong>{title}</strong>{children}</p>
      </div>
      {action}
    </aside>
  );
}

export function Card({ title, action, children, footer, pad = true, className = "" }: {
  title?: ReactNode; action?: ReactNode; children: ReactNode; footer?: ReactNode; pad?: boolean; className?: string;
}) {
  return (
    <section className={"ws-card " + className}>
      {(title || action) && <div className="ws-card-head">{typeof title === "string" ? <h2 className="ws-h3">{title}</h2> : title}{action}</div>}
      {pad ? <div className="ws-card-body">{children}</div> : children}
      {footer && <div className="ws-card-foot">{footer}</div>}
    </section>
  );
}

export function Stats({ items, columns }: { items: { label: string; value: ReactNode; unit?: string; icon?: IconName }[]; columns?: number }) {
  return (
    <dl className="ws-stats" style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}>
      {items.map((s) => (
        <div className="ws-stat" key={s.label}>
          <dt>{s.icon && <Icon name={s.icon} size={12.5} />}{s.label}</dt>
          <dd>{s.value}{s.unit && <small>{s.unit}</small>}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Meter({ value, max = 100, tone, label }: { value: number; max?: number; tone?: "red"; label: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="ws-meter" data-tone={tone} role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={max}>
      <span style={{ width: pct + "%" }} />
    </div>
  );
}

export function QuietLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="ws-quiet-link">{children}<Icon name="chevronRight" size={12.5} /></Link>;
}

export function Feedback({ tone, children }: { tone: "error" | "success" | "info" | "warn"; children: ReactNode }) {
  const icon: IconName = tone === "success" ? "check" : tone === "info" ? "help" : "alert";
  return <p className="ws-feedback" data-tone={tone} role={tone === "error" ? "alert" : "status"}><Icon name={icon} size={12.5} /><span>{children}</span></p>;
}

export function Initials({ name, large }: { name: string; large?: boolean }) {
  const letters = name.split(/\s+/).filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");
  return <span className={"ws-avatar" + (large ? " ws-avatar-lg" : "")} aria-hidden>{letters || "W"}</span>;
}

/** Shown when the viewer's role doesn't allow a page (NFR-6). */
export function Forbidden({ needs }: { needs: string }) {
  return (
    <div className="ws-content ws-content-narrow">
      <div className="ws-card">
        <EmptyState still="barrier" title="Not this door, builder." actions={<Link href="/workspace" className="ws-btn ws-btn-primary">Back to your workspace</Link>}>
          This area is for {needs}. If you think you should have access, ask a WeCodee admin.
        </EmptyState>
      </div>
    </div>
  );
}
