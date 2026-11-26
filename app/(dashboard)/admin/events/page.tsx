import { loadWorkspace } from "@/lib/workspace/data";
import { formatDateTime, nowMs } from "@/lib/workspace/rules";
import { attachRecording, markAttendance, saveEvent, setEventStatus } from "@/lib/workspace/actions";
import type { HotTopic, LiveEvent } from "@/lib/workspace/types";
import { Badge, Forbidden, PageHeader } from "@/components/workspace/ui";
import { ActionButton, ActionForm, Check, Choices, DialogButton, Field, Select, Submit, TextArea } from "@/components/workspace/forms";

export const metadata = { title: "Events" };

function kigaliParts(iso: string) {
  const d = new Date(new Date(iso).getTime() + 2 * 3_600_000).toISOString();
  return { date: d.slice(0, 10), time: d.slice(11, 16) };
}

function EventForm({ event, topics }: { event?: LiveEvent; topics: HotTopic[] }) {
  const when = event ? kigaliParts(event.startsAt) : null;
  return (
    <ActionForm action={saveEvent} reset={!event}>
      <input type="hidden" name="id" value={event?.id ?? ""} />
      <Field label="Title" name="title" defaultValue={event?.title} maxLength={120} required />
      <TextArea label="Description" name="description" rows={3} maxLength={800} defaultValue={event?.description} />
      <div className="ws-form-row">
        <Field label="Date" name="date" type="date" defaultValue={when?.date} required />
        <Field label="Start time (Kigali)" name="time" type="time" defaultValue={when?.time ?? "18:00"} required />
      </div>
      <div className="ws-form-row">
        <Field label="Duration (minutes)" name="durationMin" type="number" min={15} max={240} defaultValue={event?.durationMin ?? 60} required />
        <Field label="Capacity" name="capacity" type="number" min={1} defaultValue={event?.capacity ?? ""} help="Leave empty for no limit." />
      </div>
      <Choices legend="Platform" name="platform" defaultValue={event?.platform ?? "Google Meet"} options={["Google Meet", "Zoom"]} />
      <Field label="Meeting link" name="meetingUrl" type="url" defaultValue={event?.meetingUrl} placeholder="https://meet.google.com/…" required />
      <div className="ws-form-row">
        <Field label="Host" name="host" defaultValue={event?.host} maxLength={80} />
        <Select label="Deep-dive for" name="topicId" defaultValue={event?.topicId ?? ""} placeholder="General event" options={topics.map((t) => [t.id, `${t.title} (${t.deepDiveRequests} requests)`] as [string, string])} />
      </div>
      {!event && <Choices legend="When saved" name="publish" defaultValue="1" options={[["1", "Publish and invite"], ["0", "Keep as draft"]]} />}
      <div><Submit size="sm">{event ? "Save event" : "Create event"}</Submit></div>
    </ActionForm>
  );
}

const tone = { draft: undefined, published: "green", cancelled: "red", completed: "blue" } as const;

/** FR-22–26: live events, deep-dive scheduling, cancellation and recordings. */
// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function AdminEvents() {
  const { viewer, data } = await loadWorkspace("/admin/events");
  if (viewer.role !== "admin") return <Forbidden needs="admins" />;
  const now = nowMs();
  const events = [...data.events].sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const learners = data.people.filter((p) => p.role === "learner" && p.active).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="ws-content">
      <PageHeader eyebrow="Admin" title="Events" lead="Live sessions on Google Meet or Zoom. Registered learners see publish, change and cancellation on Live events (email once the mail queue is connected)." actions={
        <DialogButton label="New event" variant="primary" title="New live event"><EventForm topics={data.topics} /></DialogButton>
      } />
      <div className="ws-table-wrap">
        <table className="ws-table">
          <thead><tr><th>Event</th><th>When (Kigali)</th><th>Registered</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td><strong>{e.title}</strong><div className="ws-small ws-muted">{e.platform} · {e.host}</div></td>
                <td>{formatDateTime(e.startsAt)}<div className="ws-small ws-muted">{e.durationMin} min</div></td>
                <td className="num">{e.registered}{e.capacity ? ` / ${e.capacity}` : ""}{e.attendees && <div className="ws-small ws-muted">{e.attendees.length} attended</div>}</td>
                <td><Badge tone={tone[e.status]}>{e.status[0].toUpperCase() + e.status.slice(1)}</Badge>{e.recordingUrl && <div className="ws-small"><a className="ws-link" href={e.recordingUrl} target="_blank" rel="noreferrer">Recording</a></div>}</td>
                <td style={{ textAlign: "right" }}>
                  <div className="ws-actions" style={{ justifyContent: "flex-end" }}>
                    {e.status !== "cancelled" && e.status !== "completed" && <DialogButton label="Edit" title={`Edit “${e.title}”`}><EventForm event={e} topics={data.topics} /></DialogButton>}
                    {e.status === "draft" && <ActionButton run={setEventStatus.bind(null, e.id, "published")} variant="primary">Publish</ActionButton>}
                    {e.status === "published" && <ActionButton run={setEventStatus.bind(null, e.id, "cancelled")} variant="danger-quiet" confirm={{ title: "Cancel this event?", body: `${e.registered} registered learners see the cancellation on Live events. This can’t be undone.`, action: "Cancel event", danger: true }}>Cancel</ActionButton>}
                    {(e.status === "published" || e.status === "completed") && new Date(e.startsAt).getTime() < now && (
                      <DialogButton label={e.attendees ? "Attendance" : "Mark attendance"} title={`Who attended “${e.title}”?`} description="Attendance counts toward participation hours and the admin reports.">
                        <ActionForm action={markAttendance}>
                          <input type="hidden" name="eventId" value={e.id} />
                          <fieldset className="ws-fieldset"><legend>Learners present</legend>
                            <div style={{ display: "grid", gap: 6, maxHeight: 260, overflowY: "auto" }}>
                              {learners.map((p) => <Check key={p.id} name="attendees" value={p.id} defaultChecked={e.attendees?.includes(p.id)}>{p.name}</Check>)}
                            </div>
                          </fieldset>
                          <div><Submit size="sm">Save attendance</Submit></div>
                        </ActionForm>
                      </DialogButton>
                    )}
                    {(e.status === "published" || e.status === "completed") && new Date(e.startsAt).getTime() < now && !e.recordingUrl && (
                      <DialogButton label="Add recording" title="Attach the recording">
                        <ActionForm action={attachRecording}>
                          <input type="hidden" name="id" value={e.id} />
                          <Field label="Recording link" name="recordingUrl" type="url" required placeholder="https://youtu.be/…" />
                          <div><Submit size="sm">Attach</Submit></div>
                        </ActionForm>
                      </DialogButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
