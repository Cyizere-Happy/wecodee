import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import { formatDate, formatDateTime, nowMs, relativeDays } from "@/lib/workspace/rules";
import { toggleRegistration } from "@/lib/workspace/actions";
import { Badge, Card, EmptyState, Meter, PageHeader } from "@/components/workspace/ui";
import { ActionButton } from "@/components/workspace/forms";
import { CalendarButton } from "@/components/workspace/bits";
import { Icon } from "@/components/workspace/Icon";
import { DateTile } from "@/components/workspace/VisualSummary";
import { WorkshopArt } from "@/components/workspace/learning/EditorialVisuals";

export const metadata = { title: "Live events" };

// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function Events() {
  const { data } = await loadWorkspace("/learner/events");
  const now = nowMs();
  const published = data.events.filter((e) => e.status === "published" || e.status === "completed" || (e.status === "cancelled" && data.registrations.includes(e.id)));
  const upcoming = published.filter((e) => e.status !== "completed" && new Date(e.startsAt).getTime() > now).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = published.filter((e) => e.status === "completed" || new Date(e.startsAt).getTime() <= now).sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const topicTitle = (id: string | null) => data.topics.find((t) => t.id === id)?.title;
  const featuredEvent = upcoming.find((event) => event.status === "published")?.id;

  return (
    <div className="ws-content">
      <PageHeader eyebrow="Learn" title="Live events" lead="Kigali time (UTC+2)" />

      <section className="ws-section">
        <div className="ws-section-head"><h2 className="ws-h2">Upcoming</h2></div>
        {upcoming.length ? (
          <div className="ws-stack">
            {upcoming.map((e) => {
              const going = data.registrations.includes(e.id);
              const full = e.capacity !== null && e.registered >= e.capacity && !going;
              const cancelled = e.status === "cancelled";
              const featured = e.id === featuredEvent;
              return (
                <article key={e.id} className="ws-card">
                  <div className="ws-card-body ws-event-body" data-featured={featured}>
                    <DateTile date={e.startsAt} />
                    <div style={{ display: "grid", gap: 6, minWidth: 0 }}>
                      <div className="ws-row ws-wrap" style={{ gap: 8 }}>
                        <h3 className="ws-h2" style={{ fontSize: ".8438rem" }}>{e.title}</h3>
                        {cancelled ? <Badge tone="red">Cancelled</Badge> : going ? <Badge tone="green">You’re going</Badge> : full ? <Badge tone="amber">Full</Badge> : null}
                      </div>
                      <p className="ws-muted">{e.description}</p>
                      <div className="ws-row ws-wrap ws-small ws-muted" style={{ gap: 14 }}>
                        <span className="ws-row" style={{ gap: 4 }}><Icon name="clock" size={11.5} />{formatDateTime(e.startsAt)} · {e.durationMin} min · {relativeDays(e.startsAt)}</span>
                        <span>{e.platform}</span>
                        <span>Host: {e.host}</span>
                        {topicTitle(e.topicId) && <Link className="ws-link" href={"/learner/hot-topics/" + e.topicId}>{topicTitle(e.topicId)}</Link>}
                      </div>
                      <div className="ws-event-capacity">
                        <span>{e.registered}{e.capacity ? ` / ${e.capacity}` : ""} registered</span>
                        {e.capacity ? <Meter value={e.registered} max={e.capacity} label={`${e.title} registration capacity`} /> : null}
                      </div>
                    </div>
                    {featured && <WorkshopArt scene="event" />}
                  </div>
                  {!cancelled && (
                    <div className="ws-card-foot">
                      <span className="ws-small ws-muted">{going ? "Reminders arrive 24 hours and 1 hour before." : "Register to get the link and reminders by email."}</span>
                      <div className="ws-actions">
                        {going && <CalendarButton event={e} />}
                        {going && <a className="ws-btn ws-btn-secondary ws-btn-sm" href={e.meetingUrl} target="_blank" rel="noreferrer"><Icon name="external" size={12.5} />Join link</a>}
                        <ActionButton
                          run={toggleRegistration.bind(null, e.id)}
                          variant={going ? "ghost" : "primary"}
                          disabled={full}
                          confirm={going ? { title: "Cancel your registration?", body: "You’ll stop receiving reminders. You can register again while there’s space.", action: "Cancel registration" } : undefined}
                        >
                          {going ? "Cancel registration" : full ? "Event full" : "Register"}
                        </ActionButton>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="ws-card"><EmptyState still="hourglass" title="Nothing scheduled yet">When enough learners request a deep dive on a Hot Topic, a live session appears here.</EmptyState></div>
        )}
      </section>

      <section className="ws-section">
        <div className="ws-section-head"><h2 className="ws-h2">Past sessions</h2></div>
        <Card pad={false}>
          {past.length ? (
            <ul className="ws-list">
              {past.map((e) => (
                <li key={e.id}>
                  <DateTile date={e.startsAt} />
                  <div className="ws-list-main"><p>{e.title}</p><p>{formatDate(e.startsAt)} · {e.host}{data.attended.includes(e.id) ? " · You attended" : ""}</p></div>
                  {e.recordingUrl ? <a className="ws-btn ws-btn-secondary ws-btn-sm" href={e.recordingUrl} target="_blank" rel="noreferrer"><Icon name="play" size={12.5} />Recording</a> : <span className="ws-small ws-faint">No recording</span>}
                </li>
              ))}
            </ul>
          ) : <EmptyState compact still="hourglass" title="No past sessions yet" />}
        </Card>
      </section>
    </div>
  );
}
