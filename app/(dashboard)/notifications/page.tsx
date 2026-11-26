import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import { formatDateTime, relativeDays } from "@/lib/workspace/rules";
import { markNotificationsRead } from "@/lib/workspace/actions";
import { EmptyState, PageHeader } from "@/components/workspace/ui";
import { ActionButton } from "@/components/workspace/forms";
import { Icon, type IconName } from "@/components/workspace/Icon";
import { StateBreakdown } from "@/components/workspace/VisualSummary";
import { MascotGuide, VisualSequence } from "@/components/workspace/Guidance";
import { GuideDialog } from "@/components/workspace/GuideDialog";

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
  const firstUnread = items.find((n) => !n.readAt);

  return (
    <div className="ws-content ws-notification-page">
      <PageHeader
        title="Notifications"
        actions={unread > 0 && <ActionButton run={markNotificationsRead.bind(null, undefined)} icon="check">Mark all as read</ActionButton>}
      />
      <div className="ws-guided-layout">
        <MascotGuide art="states/received" title={unread ? `${unread} unread ${unread === 1 ? "update" : "updates"}` : "You’re all caught up"} action={
          <GuideDialog label="Show me the inbox" title="How your inbox works" art="states/received" icon="inbox" action={
            firstUnread ? { label: "Show latest unread", focusId: `notification-${firstUnread.id}` } : undefined
          }>
            <VisualSequence label="Using your inbox" steps={[
              { label: "Spot what’s new", detail: "Unread rows have a pink background and an Unread label.", icon: "bell" },
              { label: "Open an update", detail: "Linked titles take you to the report, event or milestone.", icon: "arrowRight" },
              { label: "Mark it as read", detail: "Use the check on each row, or mark them all at once.", icon: "check" },
            ]} />
          </GuideDialog>
        }>
          <p>{unread ? "Start with the pink rows." : "Reviews, reminders and events arrive here."}</p>
        </MascotGuide>
        <div className="ws-guided-content">
          {items.length > 0 && <StateBreakdown label="Inbox" parts={[
            { label: "Unread", value: unread, tone: "red" },
            { label: "Read", value: items.length - unread, tone: "ink" },
          ]} />}
          <div className="ws-card ws-notification-inbox">
            {items.length ? (
              <ul className="ws-list" aria-label="Inbox updates">
                {items.map((n) => (
                  <li key={n.id} id={`notification-${n.id}`} tabIndex={-1} className="ws-notification-line" data-unread={!n.readAt}>
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
              <EmptyState showArt={false} title="No notifications yet" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
