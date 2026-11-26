import type { ReactNode } from "react";
import Image from "next/image";
import { Icon } from "../Icon";
import { CoachingExperiment, FormExperiment, JoinExperiment } from "./TopicExperiments";
import { MilestoneStudio } from "./MilestoneStudios";
import { RequirementsStudio } from "./RequirementsStudio";
import { WorkflowRail } from "./WorkflowRail";

const topicNarratives = {
  "find-a-real-problem": { order: 1, art: "lessons/observation", path: ["Listen", "Find evidence", "Define the problem"] },
  "write-a-proposal": { order: 2, art: "milestones/proposal", path: ["Set the objective", "Draw a boundary", "Plan the work"] },
  "srs-basics": { order: 3, art: "milestones/requirements", path: ["Read the request", "Specify", "Make it testable"] },
  "system-design": { order: 4, art: "milestones/design", path: ["Interface", "Service", "Data"] },
  "build-in-slices": { order: 5, art: "milestones/implementation", path: ["Branch", "Build one slice", "Review"] },
  "testing-basics": { order: 6, art: "milestones/testing", path: ["Run the case", "Fix", "Re-test"] },
  "deploy-free": { order: 7, art: "lessons/release", path: ["Build", "Host", "Open the URL"] },
  "present-your-project": { order: 8, art: "milestones/presentation", path: ["Problem", "Demo", "Retrospective"] },
  "html-forms": { order: null, art: "stories/form-label", path: ["Label", "Field", "Feedback"] },
  "sql-joins": { order: null, art: "stories/data-joins", path: ["Learners", "Memberships", "Join result"] },
} satisfies Record<string, { order: number | null; art: string; path: string[] }>;

function topicNarrative(id: string) {
  return Object.hasOwn(topicNarratives, id) ? topicNarratives[id as keyof typeof topicNarratives] : undefined;
}

function CatalogArt({ art, className }: { art: string; className: string }) {
  return (
    <div className={className}>
      <Image alt="" src={`/illustrations/mascot/${art}.webp`} fill sizes="(max-width: 640px) 100vw, 38vw" unoptimized />
    </div>
  );
}

export function TopicTrail({ id, fallback }: { id: string; fallback: string }) {
  const topic = topicNarrative(id);
  if (!topic) return <p className="ws-small ws-muted">{fallback}</p>;
  return (
    <div className="ws-topic-trail">
      <CatalogArt art={topic.art} className="ws-topic-cover" />
      <ol aria-label="Concept in this lesson">
        {topic.path.map((part, index) => <li key={part}>{index > 0 && <Icon name="chevronRight" size={10} />}{part}</li>)}
      </ol>
    </div>
  );
}

export function TopicExperiment({ id }: { id: string }) {
  if (id === "html-forms") return <FormExperiment />;
  if (id === "sql-joins") return <JoinExperiment />;
  const order = topicNarrative(id)?.order;
  if (order === 3) return <RequirementsStudio />;
  return order ? <MilestoneStudio order={order} /> : null;
}

const articleVisuals: Record<string, { art: string; after: number }> = {
  "interview-before-you-build": { art: "lessons/observation", after: 2 },
  "testable-requirements": { art: "lessons/srs-spec", after: 1 },
  "low-data-workflow": { art: "stories/small-data", after: 1 },
  "ai-as-a-tutor": { art: "stories/ai-review", after: 1 },
  "demo-day-checklist": { art: "lessons/presentation", after: 0 },
};

export function ArticleCover({ slug }: { slug: string }) {
  const art = articleVisuals[slug]?.art;
  return art ? <CatalogArt art={art} className="ws-article-cover" /> : <span className="ws-article-cover ws-article-cover-empty"><Icon name="book" size={34} /></span>;
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
        <CatalogArt art="stories/small-data" className="ws-article-inline-art" />
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
  const placement = articleVisuals[slug];
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
