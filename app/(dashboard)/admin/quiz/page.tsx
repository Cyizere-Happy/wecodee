import { loadWorkspace } from "@/lib/workspace/data";
import { LEVELS, QUIZ_MINUTES } from "@/lib/workspace/rules";
import { saveQuizQuestion, setQuizQuestionActive } from "@/lib/workspace/actions";
import { Badge, Forbidden, PageHeader, Stats } from "@/components/workspace/ui";
import { ActionButton, ActionForm, DialogButton, Field, Select, Submit } from "@/components/workspace/forms";
import { FilterInput } from "@/components/workspace/bits";

export const metadata = { title: "Quiz bank" };

/** FR-8–10: the skills quiz question bank. Options are shuffled when served. */
export default async function AdminQuiz() {
  const { viewer, data } = await loadWorkspace("/admin/quiz");
  if (viewer.role !== "admin") return <Forbidden needs="admins" />;
  const bank = data.quizBank;

  return (
    <div className="ws-content">
      <PageHeader eyebrow="Admin" title="Quiz bank" lead={`Each learner gets 15 questions at their chosen level, ${QUIZ_MINUTES} minutes, options shuffled. Retired questions stay in past results.`} actions={
        <DialogButton label="Add question" variant="primary" title="Add a quiz question">
          <ActionForm action={saveQuizQuestion} reset>
            <div className="ws-form-row">
              <Select label="Level" name="level" defaultValue="Beginner" options={LEVELS} />
              <Field label="Topic" name="topic" maxLength={40} placeholder="e.g. HTML" />
            </div>
            <Field label="Question" name="question" maxLength={400} required />
            {[0, 1, 2, 3].map((i) => <Field key={i} label={`Option ${i + 1}${i > 1 ? " (optional)" : ""}`} name={"option" + i} maxLength={200} required={i < 2} />)}
            <Select label="Correct option" name="correct" defaultValue="0" options={[["0", "Option 1"], ["1", "Option 2"], ["2", "Option 3"], ["3", "Option 4"]]} />
            <div><Submit size="sm">Add to bank</Submit></div>
          </ActionForm>
        </DialogButton>
      } />
      <Stats items={LEVELS.map((l) => ({ label: `${l} questions`, value: bank.filter((q) => q.level === l && q.active).length }))} columns={3} />
      <div style={{ margin: "18px 0 11px", maxWidth: 360 }}><FilterInput target="quiz" placeholder="Filter questions" /></div>
      <div className="ws-table-wrap" data-filter="quiz">
        <table className="ws-table">
          <thead><tr><th>Question</th><th>Level</th><th>Topic</th><th>Answer</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {bank.map((q) => (
              <tr key={q.id} data-row={`${q.question} ${q.topic} ${q.level}`.toLowerCase()} style={q.active ? undefined : { opacity: .6 }}>
                <td style={{ maxWidth: 420 }}>{q.question}</td>
                <td>{q.level}</td>
                <td>{q.topic}</td>
                <td className="ws-small">{q.options[q.correct]}</td>
                <td>{q.active ? <Badge tone="green">Active</Badge> : <Badge>Retired</Badge>}</td>
                <td style={{ textAlign: "right" }}>
                  {q.active
                    ? <ActionButton run={setQuizQuestionActive.bind(null, q.id, false)} variant="ghost" confirm={{ title: "Retire this question?", body: "It won’t appear in new quizzes. You can restore it later.", action: "Retire" }}>Retire</ActionButton>
                    : <ActionButton run={setQuizQuestionActive.bind(null, q.id, true)} variant="ghost">Restore</ActionButton>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
