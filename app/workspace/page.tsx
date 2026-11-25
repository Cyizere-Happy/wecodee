import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/workspace/viewer";
import { homeFor } from "@/lib/workspace/nav";

export const metadata = { robots: { index: false, follow: false } };

async function ToDashboard(): Promise<null> {
  const viewer = await getViewer();
  redirect(viewer ? homeFor(viewer.role) : "/login?next=%2Fworkspace");
}

/** `/workspace` (where sign-in lands) sends each person to their role's dashboard. */
export default function Workspace() {
  return (
    <Suspense fallback={null}>
      <ToDashboard />
    </Suspense>
  );
}
