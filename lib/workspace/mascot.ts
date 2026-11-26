import { videoSrc } from "@/lib/videos";
/**
 * Every mascot appearance in the workspace comes from the existing artwork in
 * /public (see README › Artwork). Nothing here is redrawn or re-coloured.
 */

/** Full-body stills on pure white. */
export const stills = {
  mark: "/brand/sheep-mark.png",
  envelope: "/illustrations/verify-email.webp",
  badge: "/illustrations/account-created.webp",
  medal: "/illustrations/email-verified.webp",
  lock: "/illustrations/password-changed.webp",
  hourglass: "/illustrations/expired-link.webp",
  puzzle: "/illustrations/400.webp",
  door: "/illustrations/401.webp",
  barrier: "/illustrations/403.webp",
  map: "/illustrations/404.webp",
  mailRush: "/illustrations/429.webp",
  repair: "/illustrations/500.webp",
  maintenance: "/illustrations/503.webp",
  cable: "/illustrations/offline.webp",
} as const;

/** Wide scenes from the landing page and auth videos (soft studio backdrop). */
export const scenes = {
  cards: "/posters/hero-end.webp",
  idea: "/posters/idea-end.webp",
  path: "/posters/path-end.webp",
  pathStart: "/posters/path-start.webp",
  celebrate: "/posters/ai-end.webp",
  stuck: "/posters/ai-start.webp",
  launch: "/posters/launch-end.webp",
  launchStart: "/posters/launch-start.webp",
  desk: "/posters/auth/signup-still.webp",
  welcome: "/posters/auth/login-still.webp",
  search: "/posters/auth/forgot-still.webp",
  unlock: "/posters/auth/reset-still.webp",
} as const;

export const clips = {
  preparing: { src: videoSrc("signup"), poster: "/posters/auth/signup-poster.webp", label: "The WeCodee sheep sets up a laptop and desk for you." },
  cards: { src: videoSrc("cards"), poster: "/posters/hero-start.webp", label: "The WeCodee sheep arranges floating learning cards." },
  path: { src: videoSrc("path"), poster: "/posters/path-start.webp", label: "The sheep follows a red path, checking off a document, a wireframe and code." },
  launch: { src: videoSrc("launch"), poster: "/posters/launch-start.webp", label: "The sheep throws a red paper airplane carrying an idea, a blueprint and an app." },
} as const;

export type StillName = keyof typeof stills;
export type SceneName = keyof typeof scenes;
export type ClipName = keyof typeof clips;
