import { loadWorkspace } from "@/lib/workspace/data";
import { saveSettings } from "@/lib/workspace/actions";
import { Forbidden, PageHeader } from "@/components/workspace/ui";
import { ActionForm, Field, Submit } from "@/components/workspace/forms";

export const metadata = { title: "Platform settings" };

/** FR-58: configurable platform rules. Every change is audited. */
// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function AdminSettings() {
  const { viewer, data } = await loadWorkspace("/admin/settings");
  if (viewer.role !== "admin") return <Forbidden needs="admins" />;
  const s = data.settings;

  return (
    <div className="ws-content ws-content-narrow">
      <PageHeader eyebrow="Admin" title="Platform settings" lead="Rules the platform applies automatically. Changes are written to the audit log." />
      <ActionForm action={saveSettings} className="">
        <div className="ws-card" style={{ padding: "0 21.5px" }}>
          <section className="ws-form-section">
            <div><h2 className="ws-h3">Teams</h2><p>How teams are formed and supervised.</p></div>
            <div className="ws-form">
              <div className="ws-form-row">
                <Field label="Team size" name="teamSize" type="number" min={3} max={8} defaultValue={s.teamSize} help="3 to 8. The SRS default is 5." />
                <Field label="Teams per supervisor" name="supervisorCap" type="number" min={1} max={20} defaultValue={s.supervisorCap} />
              </div>
              <div className="ws-form-row">
                <Field label="Leader response window (days)" name="leaderResponseDays" type="number" min={1} max={7} defaultValue={s.leaderResponseDays} help="Then the next-best candidate is asked." />
                <Field label="Group link reminder after (days)" name="groupLinkReminderDays" type="number" min={1} max={14} defaultValue={s.groupLinkReminderDays} />
              </div>
            </div>
          </section>
          <section className="ws-form-section">
            <div><h2 className="ws-h3">Reports and events</h2><p>Reminders and thresholds.</p></div>
            <div className="ws-form">
              <div className="ws-form-row">
                <Field label="Daily report reminder (Kigali)" name="reportReminderTime" type="time" defaultValue={s.reportReminderTime} />
                <Field label="Missed days before alert" name="missedDaysAlert" type="number" min={1} max={10} defaultValue={s.missedDaysAlert} help="Consecutive working days." />
              </div>
              <Field label="Deep-dive request threshold" name="deepDiveThreshold" type="number" min={1} max={500} defaultValue={s.deepDiveThreshold} help="Admins are notified when a topic reaches this many requests." />
            </div>
          </section>
        </div>
        <div style={{ marginTop: 16 }}><Submit>Save settings</Submit></div>
      </ActionForm>
    </div>
  );
}
