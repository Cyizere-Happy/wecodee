import { loadWorkspace } from "@/lib/workspace/data";
import { myTeam, profileComplete } from "@/lib/workspace/selectors";
import { LEVELS } from "@/lib/workspace/rules";
import { requestDataDeletion, saveProfile } from "@/lib/workspace/actions";
import { Card, PageHeader, ReadinessBadge, Tip } from "@/components/workspace/ui";
import { ActionButton, ActionForm, Check, Choices, Field, Select, Submit, TextArea } from "@/components/workspace/forms";
import { PasswordForm, PreferenceSwitch } from "@/components/workspace/prefs";
import { JsonDownload } from "@/components/workspace/bits";
import { Icon } from "@/components/workspace/Icon";
import { WorkflowRail } from "@/components/workspace/learning/WorkflowRail";

export const metadata = { title: "Settings" };

const SKILLS = ["HTML", "CSS", "JavaScript", "TypeScript", "React", "PHP", "Laravel", "Node.js", "Python", "SQL", "MySQL", "Flutter", "Kotlin", "Figma", "UI design", "Data analysis", "Git", "Linux", "Docker"];
const LANGUAGES = ["JavaScript", "TypeScript", "PHP", "Python", "Java", "Kotlin", "Dart", "C", "C++", "C#", "Go", "SQL"];

/** Supervisors and admins have no learner profile, readiness or team consent (SRS §2.2). */
function StaffSettings({ name, email, role, preview }: { name: string; email: string; role: string; preview: boolean }) {
  return (
    <div className="ws-content ws-content-narrow">
      <PageHeader title="Settings" lead="Your account and password." />
      <nav className="ws-visual-tabs" aria-label="Account settings sections">
        <a href="#account"><Icon name="user" /> Account details</a><a href="#security"><Icon name="lock" /> Password</a>
      </nav>
      <div className="ws-stack">
        <div id="account" className="ws-visual-jump"><Card title="Account">
          <dl className="ws-kv">
            <dt>Name</dt><dd>{name}</dd>
            <dt>Email</dt><dd>{email}</dd>
            <dt>Role</dt><dd style={{ textTransform: "capitalize" }}>{role}</dd>
          </dl>
          <p className="ws-small ws-muted" style={{ marginTop: 12 }}>Roles are changed by an admin under Admin › Users.</p>
        </Card></div>
        <div id="security" className="ws-visual-jump"><Card title="Password"><PasswordForm preview={preview} /></Card></div>
      </div>
    </div>
  );
}

// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function Settings() {
  const { viewer, data } = await loadWorkspace("/settings");
  if (viewer.role !== "learner") return <StaffSettings name={viewer.name} email={viewer.email} role={viewer.role} preview={viewer.preview} />;
  const p = data.profile;
  const r = p.readiness;
  const placed = Boolean(myTeam(data, viewer));
  const ready = profileComplete(data);
  const quizDone = p.quiz.status === "completed";
  const otherSkills = p.skills.filter((s) => !SKILLS.includes(s)).join(", ");
  const exportData = { profile: { ...p }, hotTopicProgress: data.progress, reports: data.reports.filter((x) => x.userId === viewer.id), activity: data.activity, savedArticles: data.savedArticles, eventRegistrations: data.registrations, exportedAt: new Date().toISOString() };

  return (
    <div className="ws-content">
      <PageHeader title="Settings" lead="Your builder profile, readiness, preferences and account." />

      {!placed && <div className="ws-visual-context"><WorkflowRail label="Builder setup progress" steps={[
        { label: "Email verified", icon: "check", state: "complete" },
        { label: "Profile and readiness", icon: "user", state: ready ? "complete" : "current" },
        { label: "Skills quiz", icon: "quiz", state: quizDone ? "complete" : ready ? "current" : "upcoming" },
        { label: "Team placement", icon: "users", detail: p.optedIn ? undefined : "Opted out", state: quizDone && p.optedIn ? "current" : "upcoming" },
      ]} /></div>}
      <nav className="ws-visual-tabs" aria-label="Settings sections">
        <a href="#profile"><Icon name="user" />Profile</a><a href="#readiness"><Icon name="sliders" />Readiness</a><a href="#preferences"><Icon name="settings" />Preferences</a><a href="#security"><Icon name="lock" />Security</a><a href="#privacy"><Icon name="file" />Privacy</a>
      </nav>

      <ActionForm action={saveProfile} className="">
        <div className="ws-card" style={{ padding: "0 21.5px" }}>
          <section id="profile" className="ws-form-section">
            <div><h2 className="ws-h3">Profile</h2><p>Shown to your team and on your portfolio. Your email and WhatsApp number never appear publicly.</p></div>
            <div className="ws-form">
              <div className="ws-form-row">
                <Field label="Full name" name="name" defaultValue={p.name} autoComplete="name" maxLength={120} />
                <Field label="Username" name="username" defaultValue={p.username} maxLength={30} help="Your portfolio lives at /u/username." />
              </div>
              <div className="ws-form-row">
                <Field label="WhatsApp number" name="whatsapp" type="tel" inputMode="tel" defaultValue={p.whatsapp} placeholder="+250788123456" help="With country code. Only your team leader and supervisor see it." autoComplete="tel" />
                <Field label="Date of birth" name="dateOfBirth" type="date" defaultValue={p.dateOfBirth} autoComplete="bday" />
              </div>
              <div className="ws-form-row">
                <Select label="Gender" name="gender" defaultValue={p.gender} options={[["female", "Female"], ["male", "Male"]]} help="Used to balance teams." />
                <Select label="Experience level" name="experienceLevel" defaultValue={p.experienceLevel} options={LEVELS} help={p.quiz.status === "completed" ? `Quiz level: ${p.skillLevel}.` : "Your quiz matches this level."} />
              </div>
              <Choices legend="Skills" name="skills" type="checkbox" options={SKILLS} defaultValue={p.skills} help={placed ? "Changing skills after placement doesn’t move you to another team." : undefined} />
              <Field label="Other skills (optional)" name="otherSkills" defaultValue={otherSkills} placeholder="Comma-separated" />
              <Choices legend="Programming languages" name="languages" type="checkbox" options={LANGUAGES} defaultValue={p.languages} />
              <TextArea label="Short bio" name="bio" rows={2} maxLength={280} defaultValue={p.bio} />
            </div>
          </section>

          <section id="readiness" className="ws-form-section">
            <div><h2 className="ws-h3">Readiness</h2><p>So one member’s connection or device problems never stall the whole team. Leaders and supervisors see only your level and preferred time.</p><div style={{ marginTop: 10 }}><ReadinessBadge level={p.readinessLevel} /></div></div>
            <div className="ws-form">
              <Choices legend="Main internet access" name="internetAccess" defaultValue={r.internetAccess} options={[["home_wifi", "Home Wi-Fi"], ["mobile_data", "Mobile data"], ["school_wifi", "School or work Wi-Fi"], ["cyber_cafe", "Cyber café"], ["none", "No regular access"]]} />
              <Choices legend="How reliable is it?" name="internetReliability" defaultValue={r.internetReliability} options={[["always", "Always"], ["most_days", "Most days"], ["sometimes", "Sometimes"], ["rarely", "Rarely"]]} />
              <Choices legend="Daily data budget" name="dataBudget" defaultValue={r.dataBudget} options={[["under_100mb", "Under 100 MB"], ["100_500mb", "100–500 MB"], ["500mb_1gb", "500 MB–1 GB"], ["over_1gb", "Over 1 GB"]]} />
              <Choices legend="Computer access" name="computerAccess" defaultValue={r.computerAccess} options={[["own", "Own laptop or desktop"], ["shared", "Shared computer"], ["phone_only", "Phone only"]]} />
              <Choices legend="Reliable power to charge devices" name="powerReliability" defaultValue={r.powerReliability} options={[["yes", "Yes"], ["sometimes", "Sometimes"], ["no", "No"]]} />
              <Choices legend="Hours available per day" name="hoursPerDay" defaultValue={r.hoursPerDay} options={[["under_1", "Under 1"], ["1_2", "1–2"], ["2_4", "2–4"], ["over_4", "Over 4"]]} />
              <Choices legend="Preferred time to work" name="preferredTime" defaultValue={r.preferredTime} options={[["morning", "Morning"], ["afternoon", "Afternoon"], ["evening", "Evening"], ["weekend", "Weekend"]]} />
            </div>
          </section>

          <section className="ws-form-section">
            <div><h2 className="ws-h3">Team and consent</h2><p>Opting in is the default. Learners under 18 also need a parent or guardian’s consent.</p></div>
            <div className="ws-form">
              <Choices legend="Join a project team?" name="optedIn" defaultValue={p.optedIn ? "yes" : "no"} options={[["yes", "Yes, place me in a team"], ["no", "No, I’ll learn on my own"]]} />
              <Field label="If not, why? (optional when opting in)" name="optOutReason" defaultValue={p.optOutReason} maxLength={300} />
              <div className="ws-form-row">
                <Field label="Guardian’s name (under 18 only)" name="guardianName" autoComplete="off" />
                <Field label="Guardian’s phone" name="guardianPhone" type="tel" placeholder="+250…" />
              </div>
              <Check name="guardianConsent">My parent or guardian agrees to me taking part (under 18 only).</Check>
              <Check name="consent" defaultChecked={Boolean(p.whatsapp)}>I agree to share my WhatsApp number with my team leader and supervisor.</Check>
              <Check name="conduct" defaultChecked={Boolean(p.whatsapp)}>I accept the WeCodee code of conduct.</Check>
            </div>
          </section>
        </div>
        <div className="ws-row-between ws-wrap" style={{ position: "sticky", bottom: 0, padding: "11px 0", background: "linear-gradient(to top, #fff 70%, transparent)", zIndex: 2 }}>
          <span className="ws-small ws-muted">Your readiness level updates when you save.</span>
          <Submit arrow>Save profile</Submit>
        </div>
      </ActionForm>

      <div className="ws-grid-even ws-section">
        <Card title="Preferences">
          <div id="preferences" className="ws-stack" style={{ gap: 18 }}>
            <PreferenceSwitch name="lowDataMode" value={p.lowDataMode} label="Low-data mode" description="Videos load only when tapped, images stay compressed and nothing autoplays. On by default for low readiness." />
            <PreferenceSwitch name="eventNews" value={p.eventNews} label="New event emails" description="Get an email when a new live event is published." />
          </div>
        </Card>
        <Card title="Password">
          <div id="security"><PasswordForm preview={viewer.preview} /></div>
        </Card>
      </div>

      <section id="privacy" className="ws-section">
        <Card title="Your data">
          <div className="ws-stack" style={{ gap: 14 }}>
            <p className="ws-small ws-muted">Under Rwanda’s data protection law (No. 058/2021) you can download your data or ask us to delete it. We only collect what WeCodee needs to run teams and track progress, and we keep your consent records.</p>
            <div className="ws-actions">
              <JsonDownload name="wecodee-my-data.json" data={exportData}>Download my data</JsonDownload>
              <ActionButton run={requestDataDeletion} variant="danger-quiet" confirm={{ title: "Ask to delete your data?", body: "An admin will email you to confirm. Your account keeps working until the deletion is confirmed.", action: "Send request", danger: true }}>Request deletion</ActionButton>
            </div>
            <Tip still="lock" title="Deletion is handled by a person.">{" "}We confirm the request by email before removing anything, so nobody can delete your account but you.</Tip>
          </div>
        </Card>
      </section>
    </div>
  );
}
