import type { ReactNode } from "react";
import { RoleGate } from "@/components/workspace/RoleGate";

/** Supervisor dashboard. Admins can open it too, to oversee every team. */
export default function SupervisorLayout({ children }: { children: ReactNode }) {
  return <RoleGate allow={["supervisor", "admin"]}>{children}</RoleGate>;
}
