import type { ElementType } from "react";

type Props = {
  children: string;
  as?: ElementType;
  accentPeriod?: boolean;
  className?: string;
  id?: string;
};

/**
 * Display headline split into individually masked words. Screen readers get
 * the sentence once via aria-label.
 */
export function Headline({
  children,
  as: Tag = "h2",
  accentPeriod = false,
  className = "",
  id,
}: Props) {
  const hasAccent = accentPeriod && children.endsWith(".");
  const words = (hasAccent ? children.slice(0, -1) : children).split(" ");

  return (
    <Tag id={id} aria-label={children} data-reveal className={className}>
      <span aria-hidden>
        {words.map((word, i) => (
          <span key={i}>
            <span className="mask-word">
              <span data-word>
                {word}
                {hasAccent && i === words.length - 1 && (
                  <span className="text-signal">.</span>
                )}
              </span>
            </span>
            {i < words.length - 1 && " "}
          </span>
        ))}
      </span>
    </Tag>
  );
}
