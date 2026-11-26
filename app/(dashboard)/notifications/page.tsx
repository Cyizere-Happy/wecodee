import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import { formatDateTime, relativeDays } from "@/lib/workspace/rules";
import { markNotificationsRead } from "@/lib/workspace/actions";
import { EmptyState, PageHeader } from "@/components/workspace/ui";
import { ActionButton } from "@/components/workspace/forms";
import { Icon, type IconName } from "@/components/workspace/Icon";
import { StateBreakdown } from "@/components/workspace/VisualSummary";

export const metadata = { title: "Notifications" };

// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

const notificationIcons: readonly [string, IconName][] = [
  ["/learner/project", "flag"], ["/supervisor/reviews", "clipboard"], ["/learner/events", "calendar"],
  ["/learner/team", "users"], ["/learner/reports", "clipboard"], ["/learner/certificates", "award"],
];

export default async function Notifications() {
  const { data } = await loadWorkspace("/notifications");
  const items = [...data.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <div className="ws-content ws-content-narrow">
      <PageHeader
        title="Notifications"
        actions={unread > 0 && <ActionButton run={markNotificationsRead.bind(null, undefined)} icon="check">Mark all as read</ActionButton>}
      />
      {items.length > 0 && <StateBreakdown label="Inbox" parts={[
        { label: "Unread", value: unread, tone: "red" },
        { label: "Read", value: items.length - unread, tone: "ink" },
      ]} />}
      <div className="ws-card" style={{ overflow: "hidden" }}>
        {items.length ? (
          <ul className="ws-list">
            {items.map((n) => (
              <li key={n.id} className="ws-notification-line" data-unread={!n.readAt}>
                <span className="ws-notification-icon"><Icon name={notificationIcons.find(([path]) => n.href === path || n.href?.startsWith(path + "/"))?.[1] ?? "bell"} /></span>
                <div className="ws-list-main" style={{ display: "grid", gap: 2 }}>
                  <p style={{ fontWeight: n.readAt ? 500 : 650 }}>{n.href ? <Link href={n.href}>{n.title}</Link> : n.title}</p>
                  <p style={{ whiteSpace: "normal" }}>{n.body}</p>
                  <p className="ws-muted"><time dateTime={n.createdAt} title={formatDateTime(n.createdAt)}>{relativeDays(n.createdAt)}</time>{!n.readAt && " · Unread"}</p>
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
