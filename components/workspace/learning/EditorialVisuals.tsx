import type { ReactNode } from "react";
import Image from "next/image";
import { Icon, type IconName } from "../Icon";
import { CoachingExperiment, FormExperiment, JoinExperiment } from "./TopicExperiments";
import { MilestoneStudio } from "./MilestoneStudios";
import { RequirementsStudio } from "./RequirementsStudio";
import { WorkflowRail } from "./WorkflowRail";

type PreviewStep = readonly [label: string, icon: IconName];

const topicNarratives = {
  "find-a-real-problem": { order: 1, path: [["Listen", "users"], ["Find evidence", "search"], ["Define the problem", "file"]] },
  "write-a-proposal": { order: 2, path: [["Set the objective", "flag"], ["Draw a boundary", "panel"], ["Plan the work", "calendar"]] },
  "srs-basics": { order: 3, path: [["Read the request", "inbox"], ["Specify", "clipboard"], ["Make it testable", "quiz"]] },
  "system-design": { order: 4, path: [["Interface", "panel"], ["Service", "settings"], ["Data", "file"]] },
  "build-in-slices": { order: 5, path: [["Branch", "copy"], ["Build one slice", "edit"], ["Review", "eye"]] },
  "testing-basics": { order: 6, path: [["Run the case", "play"], ["Fix", "edit"], ["Re-test", "check"]] },
  "deploy-free": { order: 7, path: [["Build", "settings"], ["Host", "inbox"], ["Open the URL", "external"]] },
  "present-your-project": { order: 8, path: [["Problem", "search"], ["Demo", "play"], ["Retrospective", "history"]] },
  "html-forms": { order: null, path: [["Label", "link"], ["Field", "panel"], ["Feedback", "check"]] },
  "sql-joins": { order: null, path: [["Learners", "users"], ["Memberships", "link"], ["Join result", "file"]] },
} satisfies Record<string, { order: number | null; path: PreviewStep[] }>;

function topicNarrative(id: string) {
  return Object.hasOwn(topicNarratives, id) ? topicNarratives[id as keyof typeof topicNarratives] : undefined;
}

function ConceptPreview({ label, steps }: { label: string; steps: readonly PreviewStep[] }) {
  return (
    <ol className="ws-concept-preview" aria-label={label}>
      {steps.map(([name, icon]) => (
        <li key={name}>
          <span className="ws-concept-icon"><Icon name={icon} size={21} /></span>
          <span>{name}</span>
        </li>
      ))}
    </ol>
  );
}

export function TopicTrail({ id, fallback }: { id: string; fallback: string }) {
  const topic = topicNarrative(id);
  if (!topic) return <p className="ws-small ws-muted">{fallback}</p>;
  return <ConceptPreview label="What you’ll do" steps={topic.path} />;
}

export function TopicExperiment({ id }: { id: string }) {
  if (id === "html-forms") return <FormExperiment />;
  if (id === "sql-joins") return <JoinExperiment />;
  const order = topicNarrative(id)?.order;
  if (order === 3) return <RequirementsStudio />;
  return order ? <MilestoneStudio order={order} /> : null;
}

const articleVisuals = {
  "interview-before-you-build": { after: 2, path: [["Assumption", "help"], ["Interview", "users"], ["Evidence", "file"]] },
  "testable-requirements": { after: 1, path: [["“Fast”", "help"], ["“Under 2 seconds”", "clock"]] },
  "low-data-workflow": { after: 1, path: [["Repository", "copy"], ["Pull new commits", "download"]] },
  "ai-as-a-tutor": { after: 1, path: [["Ask for a hint", "help"], ["Try a fix", "edit"], ["Re-test", "quiz"]] },
  "demo-day-checklist": { after: 0, path: [["Test live", "external"], ["Record a backup", "play"]] },
} satisfies Record<string, { after: number; path: PreviewStep[] }>;

function articleVisual(slug: string) {
  return Object.hasOwn(articleVisuals, slug) ? articleVisuals[slug as keyof typeof articleVisuals] : undefined;
}

export function ArticlePreview({ slug }: { slug: string }) {
  const visual = articleVisual(slug);
  return visual ? <ConceptPreview label="What this article covers" steps={visual.path} /> : null;
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
