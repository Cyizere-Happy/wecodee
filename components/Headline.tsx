import type { ElementType } from "react";

type Props = {
  children: string;
  as?: ElementType;
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
  className = "",
  id,
}: Props) {
  const words = children.split(" ");

  return (
    <Tag id={id} aria-label={children} data-reveal className={className}>
      <span aria-hidden>
        {words.map((word, i) => (
          <span key={i}>
            <span className="mask-word">
              <span data-word>{word}</span>
            </span>
            {i < words.length - 1 && " "}
          </span>
        ))}
      </span>
    </Tag>
  );
}
