import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import type { Role } from "@/lib/workspace/types";
import { getViewer } from "@/lib/workspace/viewer";
import { homeFor } from "@/lib/workspace/nav";
import { PageSkeleton } from "./Skeletons";

async function Gate({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const viewer = await getViewer();
  // Signed-out visitors fall through: each page sends them to sign-in with its own path.
  if (viewer && !allow.includes(viewer.role)) redirect(homeFor(viewer.role));
  return <>{children}</>;
}

/** Keeps each SRS role inside its own dashboard; anyone else is sent to theirs. */
export function RoleGate({ allow, children }: { allow: Role[]; children: ReactNode }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Gate allow={allow}>{children}</Gate>
    </Suspense>
  );
}
