import { videoSrc, type VideoName } from "@/lib/videos";

const scene = (key: string, video: VideoName, description: string, crop: string, position: string) => ({
  video: videoSrc(video),
  poster: "/posters/auth/" + key + "-poster.webp",
  still: "/posters/auth/" + key + "-still.webp",
  description,
  crop,
  position,
});

export const authMedia = {
  login: scene("login", "login", "The WeCodee sheep opens a red door and welcomes you in.", "inset(0% 2% 2% 0%)", "50% 54%"),
  signup: scene("signup", "signup", "The WeCodee sheep sets up a laptop and desk.", "inset(0% 2% 1% 0%)", "50% 55%"),
  forgot: scene("forgot", "forgot", "The WeCodee sheep inspects a security panel with a magnifying glass.", "inset(0% 4% 1% 4%)", "50% 51%"),
  reset: scene("reset", "reset", "The WeCodee sheep opens a lock to reveal its moving parts.", "inset(0% 3% 1% 2%)", "47% 51%"),
};

export const illustration = (name: string) => "/illustrations/" + name + ".webp";
