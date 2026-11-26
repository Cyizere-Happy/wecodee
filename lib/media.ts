import { videoSrc } from "@/lib/videos";
/**
 * Mascot animations live in /public with their original filenames.
 * Some names contain a literal "…" character, so every src is URI-encoded.
 *
 * `crop` is expressed as fractions of the 16:9 source frame. Each crop was
 * chosen from the union of the mascot's movement across all frames, so the
 * sheep, Claude, and props never leave the visible window.
 */
export type Crop = { x: number; y: number; w: number; h: number };

export type MascotClip = {
  src: string;
  posterStart: string;
  posterEnd: string;
  crop: Crop;
  label: string;
};

export const clips = {
  hero: {
    src: videoSrc("cards"),
    posterStart: "/posters/hero-start.webp",
    posterEnd: "/posters/hero-end.webp",
    crop: { x: 0, y: 0.08, w: 1, h: 0.9 },
    label:
      "The WeCodee sheep walks in and arranges floating learning cards in the air.",
  },
  idea: {
    src: videoSrc("idea"),
    posterStart: "/posters/idea-start.webp",
    posterEnd: "/posters/idea-end.webp",
    crop: { x: 0.02, y: 0.02, w: 0.98, h: 0.96 },
    label:
      "The sheep has an idea, sketches a system design, and turns it into a working app with a friend.",
  },
  path: {
    src: videoSrc("path"),
    posterStart: "/posters/path-start.webp",
    posterEnd: "/posters/path-end.webp",
    crop: { x: 0.04, y: 0.12, w: 0.96, h: 0.86 },
    label:
      "The sheep follows a glowing red path, checking off a document, a wireframe, and code.",
  },
  ai: {
    src: videoSrc("collaborate"),
    posterStart: "/posters/ai-start.webp",
    posterEnd: "/posters/ai-end.webp",
    crop: { x: 0, y: 0, w: 1, h: 1 },
    label:
      "The sheep hits a syntax error, Claude arrives with a laptop, and together they fix it and celebrate.",
  },
  launch: {
    src: videoSrc("launch"),
    posterStart: "/posters/launch-start.webp",
    posterEnd: "/posters/launch-end.webp",
    crop: { x: 0, y: 0, w: 1, h: 1 },
    label:
      "The sheep throws a red paper airplane that flies off, trailing an idea, a blueprint, and an app.",
  },
} satisfies Record<string, MascotClip>;
