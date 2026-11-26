import Link from "next/link";
import { loadWorkspace } from "@/lib/workspace/data";
import { myTeam, profileComplete } from "@/lib/workspace/selectors";
import { QUIZ_RETAKE_DAYS, formatDate, nowMs } from "@/lib/workspace/rules";
import { Badge, Card, EmptyState, Meter, PageHeader, Tip } from "@/components/workspace/ui";
import { QuizRunner } from "@/components/workspace/quiz";

export const metadata = { title: "Skills quiz" };

// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

export default async function Quiz() {
  const { viewer, data } = await loadWorkspace("/learner/quiz");
  const p = data.profile;
  const placed = Boolean(myTeam(data, viewer));

  if (!profileComplete(data)) {
    return (
      <div className="ws-content ws-content-narrow">
        <PageHeader eyebrow="Learn" title="Skills quiz" />
        <div className="ws-card">
          <EmptyState still="door" title="One step before the quiz" actions={<Link href="/settings" className="ws-btn ws-btn-primary">Complete your profile<span className="ws-arrow" aria-hidden>→</span></Link>}>
            Tell us your experience level, skills and a few readiness questions first. The quiz matches the level you choose.
          </EmptyState>
        </div>
      </div>
    );
  }

  if (p.quiz.status === "completed") {
    const quiz = p.quiz;
    const retakeAt = new Date(quiz.takenAt).getTime() + QUIZ_RETAKE_DAYS * 86_400_000;
    const canRetake = !quiz.retakeUsed && !placed && nowMs() >= retakeAt;
    const moved = quiz.skillLevel !== quiz.chosenLevel;
    return (
      <div className="ws-content ws-content-narrow">
        <PageHeader eyebrow="Learn" title="Skills quiz" lead={`Taken on ${formatDate(quiz.takenAt)}.`} />
        <div className="ws-stack">
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 20, alignItems: "center" }}>
              <div style={{ display: "grid", gap: 10 }}>
                <p className="ws-muted ws-small">Your score</p>
                <p style={{ fontSize: "2.25rem", fontWeight: 650, letterSpacing: "-.05em", lineHeight: 1 }}>{quiz.score}<span className="ws-muted" style={{ fontSize: ".9rem", letterSpacing: 0 }}> / 100</span></p>
                <Meter value={quiz.score} tone="red" label="Quiz score" />
                <p>
                  You chose <strong>{quiz.chosenLevel}</strong>. {moved ? <>Your score {quiz.score >= 75 ? "raised" : "moved"} you to <strong>{quiz.skillLevel}</strong>.</> : <>Your score confirmed it.</>}
                </p>
              </div>
              <Badge tone="ink" plain>{quiz.skillLevel}</Badge>
            </div>
          </Card>
          <Tip still="medal" title={placed ? "You’re placed in a team." : p.optedIn ? "You’re in the placement pool." : "You opted out of a project team."}>
            {placed ? " Your level stays with your team; retakes are closed after placement." : p.optedIn ? " Teams form weekly. We’ll email you when yours is ready." : " You can opt in from Settings at any time."}
          </Tip>
          {!placed && !quiz.retakeUsed && (
            canRetake ? <QuizRunner chosenLevel={p.experienceLevel} retake /> : (
              <p className="ws-small ws-muted">You can retake the quiz once from {formatDate(new Date(retakeAt).toISOString())}, if you haven’t been placed by then.</p>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="ws-content ws-content-narrow">
      <PageHeader eyebrow="Learn" title="Skills quiz" lead="A short quiz that matches your chosen level. It helps us place you in a balanced team of five." />
      <QuizRunner chosenLevel={p.experienceLevel} retake={false} />
    </div>
  );
}
