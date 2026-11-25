import { loadWorkspace } from "@/lib/workspace/data";
import { formatDate } from "@/lib/workspace/rules";
import { createUser, updateUser } from "@/lib/workspace/actions";
import { Badge, Forbidden, PageHeader, ReadinessBadge } from "@/components/workspace/ui";
import { ActionButton, ActionForm, DialogButton, Field, Select, Submit } from "@/components/workspace/forms";
import { CsvButton, FilterInput } from "@/components/workspace/bits";
import { RoleSelect } from "@/components/workspace/admin";

export const metadata = { title: "Users" };

/** FR-57: manage users, roles and account status. */
export default async function AdminUsers() {
  const { viewer, data } = await loadWorkspace("/admin/users");
  if (viewer.role !== "admin") return <Forbidden needs="admins" />;
  const people = [...data.people].sort((a, b) => a.name.localeCompare(b.name));
  const rows: (string | number)[][] = [["Name", "Username", "Email", "Role", "Level", "Readiness", "Quiz score", "Team", "Active", "Registered"], ...people.map((p) => [p.name, p.username, p.email, p.role, p.level, p.readinessLevel, p.quizScore ?? "", data.teams.find((t) => t.id === p.teamId)?.name ?? "", p.active ? "yes" : "no", p.registeredAt.slice(0, 10)])];

  return (
    <div className="ws-content">
      <PageHeader eyebrow="Admin" title="Users" lead={`${people.length} accounts. Role and status changes are written to the audit log.`} actions={<>
        <CsvButton name="wecodee-users.csv" rows={rows} />
        <DialogButton label="Add user" icon="plus" variant="primary" title="Add a user" description="They get an email to set their password. Supervisors and admins don’t take the quiz or join teams.">
          <ActionForm action={createUser} reset>
            <Field label="Full name" name="name" maxLength={120} autoComplete="off" required />
            <Field label="Email" name="email" type="email" maxLength={200} autoComplete="off" required />
            <div className="ws-form-row">
              <Select label="Role" name="role" defaultValue="learner" options={[["learner", "Learner"], ["supervisor", "Supervisor"], ["admin", "Admin"]]} />
              <Select label="Gender" name="gender" placeholder="Choose" options={[["female", "Female"], ["male", "Male"]]} help="Used to balance teams." />
            </div>
            <div><Submit>Add user</Submit></div>
          </ActionForm>
        </DialogButton>
      </>} />
      <div style={{ marginBottom: 12, maxWidth: 360 }}><FilterInput target="users" placeholder="Filter by name, email or team" /></div>
      <div className="ws-table-wrap" data-filter="users">
        <table className="ws-table">
          <thead><tr><th>Name</th><th>Role</th><th>Level</th><th>Readiness</th><th>Team</th><th>Registered</th><th>Status</th></tr></thead>
          <tbody>
            {people.map((p) => {
              const team = data.teams.find((t) => t.id === p.teamId);
              const self = p.id === viewer.id;
              return (
                <tr key={p.id} data-row={`${p.name} ${p.email} ${p.username} ${team?.name ?? ""} ${p.role}`.toLowerCase()} style={p.active ? undefined : { opacity: .6 }}>
                  <td><strong>{p.name}</strong>{self && <span className="ws-faint ws-small"> (you)</span>}<div className="ws-small ws-muted">{p.email}</div></td>
                  <td><RoleSelect userId={p.id} role={p.role} name={p.name} disabled={self} /></td>
                  <td>{p.role === "learner" ? <>{p.level}{p.quizScore !== null && <span className="ws-faint ws-small"> · {p.quizScore}%</span>}</> : "–"}</td>
                  <td>{p.role === "learner" ? <ReadinessBadge level={p.readinessLevel} /> : "–"}</td>
                  <td>{team?.name ?? (p.role === "learner" ? <span className="ws-faint">{p.optedIn ? "In pool" : "Opted out"}</span> : "–")}</td>
                  <td>{formatDate(p.registeredAt)}</td>
                  <td>
                    {self ? <Badge tone="green">Active</Badge> : p.active ? (
                      <ActionButton run={updateUser.bind(null, p.id, { active: false })} variant="danger-quiet" confirm={{ title: `Deactivate ${p.name}?`, body: "They won’t be able to sign in and are left out of team formation. You can reactivate them later.", action: "Deactivate", danger: true }}>Deactivate</ActionButton>
                    ) : <ActionButton run={updateUser.bind(null, p.id, { active: true })}>Reactivate</ActionButton>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
