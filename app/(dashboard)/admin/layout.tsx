import type { ReactNode } from "react";
import { RoleGate } from "@/components/workspace/RoleGate";

/** Admin dashboard. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RoleGate allow={["admin"]}>{children}</RoleGate>;
}
