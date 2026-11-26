import type { ReactNode } from "react";
import { Icon } from "../Icon";

export function LessonHeading({ scenario, title, id, children }: { scenario: string; title: string; id: string; children: ReactNode }) {
  return (
    <div className="ws-lesson-heading">
      <p className="ws-lesson-label">{scenario}</p>
      <h2 id={id}>{title}</h2>
      <div>{children}</div>
    </div>
  );
}

export function LessonChoices<T extends string>({ label, choices, value, onChange, flow }: {
  label: string; choices: readonly T[]; value: T; onChange: (next: T) => void; flow?: boolean;
}) {
  return (
    <div className={flow ? "ws-lesson-choices ws-lesson-flow" : "ws-lesson-choices"} role="group" aria-label={label}>
      {choices.map((choice, index) => (
        <span key={choice}>
          {index > 0 && flow && <Icon name="arrowRight" size={14} />}
          <button type="button" aria-pressed={value === choice} onClick={() => onChange(choice)}>{choice}</button>
        </span>
      ))}
    </div>
  );
}

export type LessonArtName = "srs-idea" | "srs-spec" | "srs-interface" | "observation" | "scope" | "architecture" | "implementation" | "test" | "release" | "presentation" | "review" | "publishing";

export function LessonArt({ name }: { name: LessonArtName }) {
  return (
    <div className="ws-lesson-art" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/illustrations/mascot/lessons/${name}.webp`} alt="" loading="lazy" decoding="async" width={560} height={560} />
    </div>
  );
}
