/* Microclimate service worker — app-shell offline launch.
   The page still handles its own DATA caching in localStorage; this SW only
   makes the HTML shell load when there's no network at all. Bump CACHE to ship
   an update. */
const CACHE = "microclimate-v1";
const SHELL = ["./index.html", "./"];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    for (const url of SHELL) { try { await c.add(url); } catch (_) {} }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Leave live data to the app's own fetch + localStorage fallback.
  if (url.hostname.endsWith("open-meteo.com") || url.hostname.includes("bigdatacloud")) return;

  // App shell: network-first (so edits land), fall back to cache when offline.
  if (req.mode === "navigate" ||
      url.pathname.endsWith("/") || url.pathname.endsWith("/index.html")) {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        const c = await caches.open(CACHE);
        c.put("./index.html", res.clone());
        return res;
      } catch (_) {
        return (await caches.match("./index.html")) ||
               (await caches.match("./")) ||
               Response.error();
      }
    })());
    return;
  }

  // Same-origin assets: cache-first, then network.
  if (url.origin === self.location.origin) {
    e.respondWith(caches.match(req).then((r) => r || fetch(req)));
  }
});
