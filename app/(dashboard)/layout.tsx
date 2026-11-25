import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@/components/workspace/workspace.css";
import { WorkspaceShell, type SearchEntry } from "@/components/workspace/Shell";
import { ShellSkeleton } from "@/components/workspace/Skeletons";
import { getViewer } from "@/lib/workspace/viewer";
import { loadWorkspace } from "@/lib/workspace/data";
import { supervisesTeam } from "@/lib/workspace/selectors";

// Every workspace page depends on the signed-in session, so navigations into it
// block on the server by design (see docs: guides/instant-navigation#opting-out).
export const instant = false;

export const metadata: Metadata = {
  title: { template: "%s · WeCodee", default: "Workspace · WeCodee" },
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

async function Shell({ children }: { children: ReactNode }) {
  // Without a session each page redirects to sign-in with its own path as `next`.
  if (!(await getViewer())) return <>{children}</>;
  const { viewer, source, scenario, data } = await loadWorkspace();
  const reviews = viewer.role === "learner" ? 0 : data.projects
    .filter((p) => { const t = data.teams.find((x) => x.id === p.teamId); return t && supervisesTeam(t, viewer); })
    .flatMap((p) => p.milestones).filter((m) => m.status === "submitted").length;
  const search: SearchEntry[] = [
    ...data.topics.filter((t) => t.published).map((t) => ({ href: "/learner/hot-topics/" + t.id, label: t.title, group: "Hot Topics", hint: t.category })),
    ...data.articles.filter((a) => a.published).map((a) => ({ href: "/learner/articles/" + a.slug, label: a.title, group: "Articles", hint: a.readingMin + " min read" })),
  ];
  return (
    <WorkspaceShell
      viewer={{ name: viewer.name, email: viewer.email, role: viewer.role, preview: viewer.preview }}
      source={source}
      journey={scenario}
      counts={{ notifications: data.notifications.filter((n) => !n.readAt).length, reviews }}
      search={search}
    >
      {children}
    </WorkspaceShell>
  );
}

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
