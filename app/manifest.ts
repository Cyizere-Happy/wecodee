import type { MetadataRoute } from "next";

/** FR-83 / NFR-15: installable on Android (Chrome) and iPhone (Safari, Add to Home Screen). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WeCodee",
    short_name: "WeCodee",
    description: "Learn, build in a team and ship a real project, one milestone at a time.",
    start_url: "/workspace",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
