import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import { formatDateTime, relativeDays } from "@/lib/workspace/rules";
import { markNotificationsRead } from "@/lib/workspace/actions";
import { EmptyState, PageHeader } from "@/components/workspace/ui";
import { ActionButton } from "@/components/workspace/forms";

export const metadata = { title: "Notifications" };

export default async function Notifications() {
  const { data } = await loadWorkspace("/notifications");
  const items = [...data.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <div className="ws-content ws-content-narrow">
      <PageHeader
        title="Notifications"
        lead="Everything we email you also lands here."
        actions={unread > 0 && <ActionButton run={markNotificationsRead.bind(null, undefined)} icon="check">Mark all as read</ActionButton>}
      />
      <div className="ws-card" style={{ overflow: "hidden" }}>
        {items.length ? (
          <ul className="ws-list">
            {items.map((n) => (
              <li key={n.id} style={{ alignItems: "flex-start", background: n.readAt ? undefined : "#fffafa" }}>
                <span aria-hidden style={{ width: 8, height: 8, marginTop: 7, borderRadius: "50%", flex: "none", background: n.readAt ? "transparent" : "var(--ws-red)" }} />
                <div className="ws-list-main" style={{ display: "grid", gap: 2 }}>
                  <p style={{ fontWeight: n.readAt ? 500 : 650 }}>{n.href ? <Link href={n.href}>{n.title}</Link> : n.title}</p>
                  <p style={{ whiteSpace: "normal" }}>{n.body}</p>
                  <p className="ws-faint" title={formatDateTime(n.createdAt)}>{relativeDays(n.createdAt)}</p>
                </div>
                {!n.readAt && <ActionButton run={markNotificationsRead.bind(null, n.id)} variant="ghost" tip="Mark as read" icon="check"><span className="ws-sr">Mark as read</span></ActionButton>}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState still="envelope" title="You’re all caught up">When something needs you, like a review, a reminder or a new event, it’ll arrive here.</EmptyState>
        )}
      </div>
    </div>
  );
}
