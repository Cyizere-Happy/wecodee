import type { NextConfig } from "next";

// Tailwind v4 runs as a CSS loader. Turbopack uses it through `turbopack.rules`;
// the same loader is registered for webpack (`next dev --webpack`), which machines
// without Next.js's native SWC binary have to use.
const tailwindLoader = "@tailwindcss/turbopack";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
    // FR-41 / NFR-8: milestone files are up to 10 MB, plus multipart overhead.
    serverActions: { bodySizeLimit: "11mb" },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: [tailwindLoader],
        as: "*.css",
      },
    },
  },
  // Each SRS role has its own dashboard. Old /workspace/... links keep working;
  // /workspace itself redirects by role (app/workspace/page.tsx).
  async redirects() {
    return [
      { source: "/workspace/supervise/:path*", destination: "/supervisor/:path*", permanent: false },
      { source: "/workspace/admin/:path*", destination: "/admin/:path*", permanent: false },
      { source: "/workspace/notifications", destination: "/notifications", permanent: false },
      { source: "/workspace/settings", destination: "/settings", permanent: false },
      { source: "/workspace/:path+", destination: "/learner/:path+", permanent: false },
    ];
  },
  webpack(config) {
    // Loaders run last-to-first, so appending Tailwind to each of Next's CSS chains
    // (those that include its postcss-loader) compiles Tailwind before PostCSS and css-loader.
    const visit = (rules: unknown[]) => {
      for (const rule of rules) {
        if (!rule || typeof rule !== "object") continue;
        const r = rule as { oneOf?: unknown[]; rules?: unknown[]; use?: unknown };
        if (Array.isArray(r.oneOf)) visit(r.oneOf);
        if (Array.isArray(r.rules)) visit(r.rules);
        if (Array.isArray(r.use)) {
          const names = r.use.map((u) => (typeof u === "string" ? u : ((u as { loader?: string } | null)?.loader ?? "")));
          if (names.some((n) => n.includes("postcss-loader")) && !names.includes(tailwindLoader)) r.use.push(tailwindLoader);
        }
      }
    };
    visit(config.module.rules);
    return config;
  },
};

export default nextConfig;
