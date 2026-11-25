import type { ReactNode } from "react";
import { RoleGate } from "@/components/workspace/RoleGate";

/** Learner dashboard. Team leaders are learners; their leader tools are on the team page. */
export default function LearnerLayout({ children }: { children: ReactNode }) {
  return <RoleGate allow={["learner"]}>{children}</RoleGate>;
}
