/**
 * Every mascot animation, in one place.
 *
 * The originals stay in /public. In production they are served from Cloudinary,
 * resized and recompressed for the page (they display well under 1080p), from a
 * CDN close to the visitor. Set NEXT_PUBLIC_VIDEO_SOURCE=local to serve the
 * files in /public instead, e.g. offline or before they have been uploaded.
 *
 * `id` is each video's public ID in the Cloudinary Media Library (the uploaded
 * filename without extension; Cloudinary stores "…" as "_").
 */
export const CLOUDINARY_CLOUD = "ddjxf7ep7";

/** 1280px wide covers the largest on-page size at 2x density; q_auto picks the bitrate. */
export const DELIVERY = "q_auto,w_1280,c_limit";

export const videos = {
  cards: { file: "Sheep_mascot_organizing_floating…_06022653_1080p.mp4", id: "Sheep_mascot_organizing_floating__06022653_1080p" },
  idea: { file: "Mascot_creating_software_project_e1124eac_1080p.mp4", id: "Mascot_creating_software_project_e1124eac_1080p" },
  path: { file: "Mascot_navigating_milestone_path…_cc7de657_1080p.mp4", id: "Mascot_navigating_milestone_path__cc7de657_1080p" },
  collaborate: { file: "Mascots_collaborating_on_code_an…_36e587cc_1080p.mp4", id: "Mascots_collaborating_on_code_an__36e587cc_1080p" },
  launch: { file: "Mascot_launching_paper_airplane_0c58da8a_1080p.mp4", id: "Mascot_launching_paper_airplane_0c58da8a_1080p" },
  login: { file: "Character_animation_unlocking_door_ed2f9003_1080p.mp4", id: "Character_animation_unlocking_door_ed2f9003_1080p" },
  signup: { file: "Mascot_preparing_workspace_45c86e8d_1080p.mp4", id: "Mascot_preparing_workspace_45c86e8d_1080p" },
  forgot: { file: "Mascot_finding_missing_password_key_ddf999ac_1080p.mp4", id: "Mascot_finding_missing_password_key_ddf999ac_1080p" },
  reset: { file: "Mascot_resetting_security_lock_48c88633_1080p.mp4", id: "Mascot_resetting_security_lock_48c88633_1080p" },
} as const;

export type VideoName = keyof typeof videos;

const local = process.env.NEXT_PUBLIC_VIDEO_SOURCE === "local";

export function videoSrc(name: VideoName) {
  const { file, id } = videos[name];
  if (local) return encodeURI("/" + file);
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/${DELIVERY}/${id}.mp4`;
}
