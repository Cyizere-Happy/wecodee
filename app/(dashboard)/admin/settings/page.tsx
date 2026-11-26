import { loadWorkspace } from "@/lib/workspace/data";
import { saveSettings } from "@/lib/workspace/actions";
import { Forbidden, PageHeader } from "@/components/workspace/ui";
import { ActionForm, Field, Submit } from "@/components/workspace/forms";
import { Icon } from "@/components/workspace/Icon";

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
      <section className="ws-priority" aria-labelledby="supervisor-capacity">
        <h2 id="supervisor-capacity">How the saved limits work together</h2>
        <dl className="ws-setting-formula">
          <div><dt>Learners per team</dt><dd>{s.teamSize}</dd></div>
          <div><dt>Teams per supervisor</dt><dd><span aria-hidden="true">×</span>{s.supervisorCap}</dd></div>
          <div className="ws-settings-output"><dt>Potential seats per supervisor</dt><dd><span aria-hidden="true">=</span>{s.teamSize * s.supervisorCap}</dd></div>
        </dl>
        <p className="ws-ops-note">This is the upper limit for a supervisor with full teams. Actual placement depends on team matching and available supervisors.</p>
      </section>
      <nav className="ws-visual-tabs" aria-label="Platform settings sections">
        <a href="#team-rules"><Icon name="users" />Team matching</a>
        <a href="#reminder-rules"><Icon name="calendar" />Reports and deep dives</a>
      </nav>
      <ActionForm action={saveSettings} className="" successArt="admin/settings-saved" errorArt="admin/failed">
        <div className="ws-card" style={{ padding: "0 21.5px" }}>
          <section id="team-rules" className="ws-form-section ws-visual-jump">
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
          <section id="reminder-rules" className="ws-form-section ws-visual-jump">
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
