import type { ReactNode } from "react";
import Image from "next/image";
import { Icon, type IconName } from "../Icon";
import { CoachingExperiment, FormExperiment, JoinExperiment } from "./TopicExperiments";
import { MilestoneStudio } from "./MilestoneStudios";
import { RequirementsStudio } from "./RequirementsStudio";
import { WorkflowRail } from "./WorkflowRail";

type PreviewStep = readonly [label: string, example: string, icon: IconName];
type LessonPreview = {
  order: number;
  label: string;
  steps: readonly PreviewStep[];
  compare?: boolean;
};

const topicNarratives: Record<string, LessonPreview> = {
  "find-a-real-problem": { order: 1, label: "Turn a hunch into evidence", compare: true, steps: [["Hunch", "“The lab gets crowded.”", "help"], ["Evidence", "“I waited 40 minutes.”", "file"]] },
  "write-a-proposal": { order: 2, label: "Give the proposal boundaries", steps: [["Objective", "Book a slot in 1 minute", "flag"], ["Scope", "One computer lab", "panel"], ["Timeline", "Pilot in 2 weeks", "calendar"]] },
  "srs-basics": { order: 3, label: "Turn a vague request into a testable requirement", compare: true, steps: [["Vague", "“Make booking fast.”", "inbox"], ["Testable", "Confirm a booking within 2 s on 4G.", "quiz"]] },
  "system-design": { order: 4, label: "Follow a booking through the system", steps: [["Browser", "Request 14:00", "panel"], ["Service", "Check availability", "settings"], ["Database", "Save booking", "file"]] },
  "build-in-slices": { order: 5, label: "Build and review a feature with Git", steps: [["main", "Stable app", "check"], ["feature", "Add booking form", "copy"], ["Pull request", "Review the diff", "eye"]] },
  "testing-basics": { order: 6, label: "Re-test the same case after a fix", compare: true, steps: [["Before the fix", "Two people get the last slot", "x"], ["After the fix", "Only one booking is accepted", "check"]] },
  "deploy-free": { order: 7, label: "Follow the app from source to deployment", steps: [["Source", "Push your code", "copy"], ["Build", "Create the release", "settings"], ["Live site", "Open the public URL", "external"]] },
  "present-your-project": { order: 8, label: "Show the problem, the demo and the result", steps: [["Problem", "Two classes share a lab", "users"], ["Demo", "Book a free slot", "play"], ["Result", "One confirmed time", "check"]] },
};

function topicNarrative(id: string) {
  return Object.hasOwn(topicNarratives, id) ? topicNarratives[id] : undefined;
}

function ConceptPreview({ label, steps, compare = false }: { label: string; steps: readonly PreviewStep[]; compare?: boolean }) {
  return (
    <figure className="ws-concept-preview" data-compare={compare || undefined} aria-label={label}>
      <ol>
        {steps.map(([name, example, icon], index) => (
          <li key={name}>
            {index > 0 && <Icon name="arrowRight" size={12} className="ws-concept-arrow" />}
            <span className="ws-concept-label"><Icon name={icon} size={16} />{name}</span>
            <strong>{example}</strong>
          </li>
        ))}
      </ol>
    </figure>
  );
}

export function TopicTrail({ id, fallback }: { id: string; fallback: string }) {
  if (id === "html-forms") {
    return (
      <figure className="ws-concept-preview ws-form-preview" aria-label="Link an email label to its input">
        <div><span className="ws-concept-label">HTML label</span><strong>Email address</strong><code>for=&quot;email&quot;</code></div>
        <Icon name="link" size={17} />
        <div><span className="ws-concept-label">Input field</span><span className="ws-example-input">name@example.com</span><code>id=&quot;email&quot;</code></div>
      </figure>
    );
  }
  if (id === "sql-joins") {
    return (
      <figure className="ws-concept-preview ws-join-preview" aria-label="An inner join keeps Aline and drops Eric, who has no team">
        <div><span className="ws-concept-label">Learners</span><span>Aline · LabSlot</span><span className="ws-muted">Eric · no team</span></div>
        <Icon name="arrowRight" size={17} />
        <div><code>INNER JOIN</code><span className="ws-join-match"><Icon name="check" size={13} />Aline · LabSlot</span></div>
      </figure>
    );
  }
  const topic = topicNarrative(id);
  if (!topic) return <p className="ws-small ws-muted">{fallback}</p>;
  return <ConceptPreview label={topic.label} steps={topic.steps} compare={topic.compare} />;
}

export function TopicExperiment({ id }: { id: string }) {
  if (id === "html-forms") return <FormExperiment />;
  if (id === "sql-joins") return <JoinExperiment />;
  const order = topicNarrative(id)?.order;
  if (order === 3) return <RequirementsStudio />;
  return order ? <MilestoneStudio order={order} /> : null;
}

const articleVisuals: Record<string, { after: number; label: string; steps: readonly PreviewStep[]; compare?: boolean }> = {
  "interview-before-you-build": { after: 2, label: "Ask about a real incident", compare: true, steps: [["Assumption", "“The booking system is confusing.”", "help"], ["Interview", "“Tell me about the last time you tried it.”", "users"]] },
  "testable-requirements": { after: 1, label: "Make a promise a tester can check", compare: true, steps: [["Vague", "“The app should be fast.”", "help"], ["Measurable", "Search loads within 2 s on 4G.", "clock"]] },
  "low-data-workflow": { after: 1, label: "Fetch a smaller update", compare: true, steps: [["Download", "The entire repository", "copy"], ["Pull", "Only new commits", "download"]] },
  "ai-as-a-tutor": { after: 1, label: "Use a hint to debug", steps: [["Unexpected", "“23”", "alert"], ["Hint", "Check the types", "help"], ["After your fix", "5", "check"]] },
  "demo-day-checklist": { after: 0, label: "Prepare for the live demo", steps: [["Test live", "Open the public URL", "external"], ["Back up", "Save a recording", "play"]] },
};

function articleVisual(slug: string) {
  return Object.hasOwn(articleVisuals, slug) ? articleVisuals[slug] : undefined;
}

export function ArticlePreview({ slug }: { slug: string }) {
  const visual = articleVisual(slug);
  return visual ? <ConceptPreview label={visual.label} steps={visual.steps} compare={visual.compare} /> : null;
}

function Comparison({ label, before, after }: { label: string; before: ReactNode; after: ReactNode }) {
  return (
    <figure className="ws-editorial-compare">
      <figcaption>{label}</figcaption>
      <div>{before}<Icon name="arrowRight" size={17} />{after}</div>
    </figure>
  );
}

function ArticleFigure({ slug }: { slug: string }) {
  switch (slug) {
    case "interview-before-you-build":
      return <Comparison label="What turns a complaint into evidence?" before={<div><small>Opinion</small><blockquote>“It’s annoying.”</blockquote></div>} after={<div><small>Observed impact</small><blockquote>“I waited <mark>forty minutes</mark> at the lab door on Tuesday.”</blockquote></div>} />;
    case "testable-requirements":
      return <Comparison label="A tester needs a condition and a limit" before={<div><small>Vague</small><blockquote>“The app should be fast.”</blockquote></div>} after={<div><small>Testable</small><blockquote>“Search results appear within <mark>two seconds</mark> on a <mark>4G connection</mark>.”</blockquote></div>} />;
    case "low-data-workflow":
      return <>
        <Image alt="" src="/illustrations/mascot/stories/small-data.webp" className="ws-article-inline-art" width={900} height={450} unoptimized />
        <Comparison label="Update the same project with less data" before={<div><small>Re-download</small><strong>Fetch the entire repository</strong><span className="ws-data-blocks" aria-hidden="true"><i /><i /><i /><i /><i /></span></div>} after={<div><small>Pull changes</small><strong>Fetch the missing changes</strong><span className="ws-data-blocks" data-small="true" aria-hidden="true"><i /><i /></span></div>} />
      </>;
    case "ai-as-a-tutor":
      return <CoachingExperiment />;
    case "demo-day-checklist":
      return <WorkflowRail label="Demo preparation" steps={[{ label: "Charge devices", icon: "check" }, { label: "Test on mobile data", icon: "external" }, { label: "Record a backup", icon: "play" }]} />;
    default:
      return null;
  }
}

export function EditorialArticle({ slug, paragraphs }: { slug: string; paragraphs: readonly string[] }) {
  const placement = articleVisual(slug);
  return (
    <article className="ws-editorial-article">
      <div className="ws-prose ws-illustrated-prose">
        {paragraphs.map((paragraph, index) => <div className="ws-prose-part" key={index}><p>{paragraph}</p>{placement?.after === index && <ArticleFigure slug={slug} />}</div>)}
      </div>
    </article>
  );
}

const sceneSources = {
  team: { path: "/illustrations/mascot/stories/team-assembly.webp", height: 576 },
  portfolio: { path: "/illustrations/mascot/stories/portfolio-shelf.webp", height: 600 },
  event: { path: "/illustrations/mascot/stories/event-seat.webp", height: 600 },
} as const;

export function WorkshopArt({ scene }: { scene: keyof typeof sceneSources }) {
  const { path, height } = sceneSources[scene];
  return <Image className="ws-workshop-art" src={path} alt="" width={900} height={height} loading="eager" unoptimized />;
}
