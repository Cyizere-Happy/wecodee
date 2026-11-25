/*
 * WeCodee service worker (FR-84, NFR-14, NFR-15).
 * - Static build files: cache first (they are content-hashed).
 * - Brand art and illustrations: served from cache, refreshed in the background.
 * - Pages: network first; the last copy of each dashboard page is kept so it
 *   opens offline. Auth, API and Server Action requests are never cached.
 * Queued daily reports live in the page (localStorage) and are sent when the app
 * is next opened online; Background Sync needs the learning API (see README).
 */
const VERSION = "wecodee-v1";
const PAGES = VERSION + "-pages";
const STATIC = VERSION + "-static";
const SHELL = ["/workspace", "/learner", "/learner/team", "/learner/articles", "/learner/hot-topics", "/illustrations/offline.webp", "/brand/sheep-mark.png"];
const KEEP_PAGES = 40;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGES).then((cache) => Promise.all(SHELL.map((url) => cache.add(new Request(url, { credentials: "same-origin" })).catch(() => {})))).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

const offlinePage = () =>
  new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline · WeCodee</title>
<body style="font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;color:#171717;padding:16px">
<main><img src="/illustrations/offline.webp" alt="" width="200" height="200" style="object-fit:contain"><h1 style="font-size:1.2rem">You’re offline</h1>
<p style="color:#6b6b6b;max-width:32ch">This page hasn’t been saved on your phone yet. Pages you opened before still work, and daily reports are kept until you’re back online.</p>
<p><a href="/learner" style="color:#bd3041">Open your dashboard</a></p></main></body>`,
    { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - max))) await cache.delete(key);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || request.headers.has("Next-Action") || request.headers.get("RSC") === "1") return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(caches.open(STATIC).then(async (cache) => (await cache.match(request)) ?? fetch(request).then((res) => { if (res.ok) cache.put(request, res.clone()); return res; })));
    return;
  }

  if (/^\/(brand|illustrations|posters|icons)\//.test(url.pathname)) {
    event.respondWith(caches.open(STATIC).then(async (cache) => {
      const hit = await cache.match(request);
      const network = fetch(request).then((res) => { if (res.ok) cache.put(request, res.clone()); return res; }).catch(() => hit);
      return hit ?? network;
    }));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok && res.type === "basic" && !res.redirected) {
            const copy = res.clone();
            caches.open(PAGES).then((cache) => cache.put(request, copy)).then(() => trim(PAGES, KEEP_PAGES));
          }
          return res;
        })
        .catch(async () => (await caches.match(request, { ignoreSearch: true })) ?? offlinePage()),
    );
  }
});
