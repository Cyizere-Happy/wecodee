import { loadWorkspace } from "@/lib/workspace/data";
import { saveTemplate } from "@/lib/workspace/actions";
import { Card, Forbidden, PageHeader } from "@/components/workspace/ui";
import { ActionForm, Field, Select, Submit, TextArea } from "@/components/workspace/forms";
import { WorkflowRail } from "@/components/workspace/learning/WorkflowRail";

export const metadata = { title: "Milestones" };

/** FR-37/44: the eight milestone templates every project follows. */
// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function AdminMilestones() {
  const { viewer, data } = await loadWorkspace("/admin/milestones");
  if (viewer.role !== "admin") return <Forbidden needs="admins" />;

  return (
    <div className="ws-content ws-content-narrow">
      <PageHeader eyebrow="Admin" title="Milestones" lead="The eight steps every project follows. Changes apply to projects created afterwards; existing projects keep their checklist." />
      <div className="ws-visual-context ws-template-path">
        <h2>Project template for future teams</h2>
        <WorkflowRail label="Default project sequence" steps={data.templates.map((milestone) => ({
          label: milestone.name,
          icon: "flag",
          detail: <a href={`#template-${milestone.order}`} className="ws-link">{milestone.deliverable}</a>,
        }))} />
      </div>
      <div className="ws-stack">
        {data.templates.map((m) => (
          <div key={m.order} id={`template-${m.order}`} className="ws-visual-jump"><Card title={`M${m.order} · ${m.name}`}>
            <ActionForm action={saveTemplate}>
              <input type="hidden" name="order" value={m.order} />
              <div className="ws-form-row">
                <Field label="Name" name="name" defaultValue={m.name} maxLength={80} required />
                <Select label="Linked Hot Topic" name="topicId" defaultValue={m.topicId ?? ""} placeholder="None" options={data.topics.map((t) => [t.id, t.title] as [string, string])} />
              </div>
              <Field label="Deliverable" name="deliverable" defaultValue={m.deliverable} maxLength={300} required />
              <TextArea label="Supervisor checklist" name="checklist" rows={Math.max(3, m.checklist.length + 1)} defaultValue={m.checklist.join("\n")} help="One item per line. All items must be ticked to approve." />
              <div><Submit size="sm" variant="secondary">Save M{m.order}</Submit></div>
            </ActionForm>
          </Card></div>
        ))}
      </div>
    </div>
  );
}
