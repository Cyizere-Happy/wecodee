import Link from "next/link";
import type { Milestone } from "@/lib/workspace/types";
import { milestoneStatusLabel } from "@/lib/workspace/rules";
import { Icon } from "./Icon";

/** The eight milestones as stops on the red path from the landing page's Journey section. */
export function MilestonePath({ milestones, base = "/learner/project/" }: { milestones: Milestone[]; base?: string }) {
  const approved = milestones.filter((m) => m.status === "approved").length;
  const fill = milestones.length > 1 ? Math.min(1, Math.max(0, approved - 0.5) / (milestones.length - 1)) : 0;
  return (
    <ol className="ws-path" aria-label={`${approved} of ${milestones.length} milestones approved`}>
      <span className="ws-path-fill" style={{ width: `calc(${fill} * 88%)` }} aria-hidden />
      {milestones.map((m) => (
        <li key={m.order}>
          <Link href={base + m.order} aria-label={`Milestone ${m.order}, ${m.name}: ${milestoneStatusLabel[m.status]}`} data-tip={milestoneStatusLabel[m.status]}>
            <span className="ws-path-stop" data-status={m.status}>{m.status === "approved" ? <Icon name="check" size={11} /> : m.status === "locked" ? <Icon name="lock" size={10} /> : m.order}</span>
            <span className="ws-path-name">{m.name}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
