import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { AuthLoading } from "@/components/auth/AuthScreen";
import { WorkspaceWelcome } from "@/components/auth/WorkspaceWelcome";

export const metadata = { title: "Your workspace · WeCodee", robots: { index: false } };

async function WorkspaceSession() {
  const requestHeaders = await headers();
  const auth = await getAuth();
  const session = await auth?.api.getSession({ headers: requestHeaders, query: { disableRefresh: true } });
  if (!session || !session.user.emailVerified) redirect("/login?next=%2Fworkspace");

  return <WorkspaceWelcome name={session.user.name.split(" ")[0]} />;
}

export default function Workspace() {
  return <Suspense fallback={<AuthLoading text="Opening your workspace…" />}><WorkspaceSession /></Suspense>;
}
