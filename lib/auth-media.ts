const scene = (key: string, video: string, description: string, crop: string, position: string) => ({
  video: "/" + video,
  poster: "/posters/auth/" + key + "-poster.webp",
  still: "/posters/auth/" + key + "-still.webp",
  description,
  crop,
  position,
});

export const authMedia = {
  login: scene("login", "Character_animation_unlocking_door_ed2f9003_1080p.mp4", "The WeCodee sheep opens a red door and welcomes you in.", "inset(0% 2% 2% 0%)", "50% 54%"),
  signup: scene("signup", "Mascot_preparing_workspace_45c86e8d_1080p.mp4", "The WeCodee sheep sets up a laptop and desk.", "inset(0% 2% 1% 0%)", "50% 55%"),
  forgot: scene("forgot", "Mascot_finding_missing_password_key_ddf999ac_1080p.mp4", "The WeCodee sheep inspects a security panel with a magnifying glass.", "inset(0% 4% 1% 4%)", "50% 51%"),
  reset: scene("reset", "Mascot_resetting_security_lock_48c88633_1080p.mp4", "The WeCodee sheep opens a lock to reveal its moving parts.", "inset(0% 3% 1% 2%)", "47% 51%"),
};

export const illustration = (name: string) => "/illustrations/" + name + ".webp";
