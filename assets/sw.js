const VERSION = "zarven-site-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./site.html",
  "./404.html",
  "./robots.txt",
  "./sitemap.xml",
  "./assets/styles.css",
  "./assets/app.js",
  "./assets/site.js",
  "./assets/logo.jpg",
  "./assets/manifest.webmanifest",
  "./team/index.html",
  "./dsgvo/index.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    (async () => {
      const url = new URL(req.url);
      const isNav = req.mode === "navigate";
      const cache = await caches.open(VERSION);

      if (isNav) {
        const cached = await cache.match(url.pathname.endsWith("/") ? "./index.html" : url.pathname);
        if (cached) return cached;
        try {
          const fresh = await fetch(req);
          cache.put(req, fresh.clone());
          return fresh;
        } catch {
          return (await cache.match("./index.html")) || Response.error();
        }
      }

      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        if (fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      } catch {
        return cached || Response.error();
      }
    })()
  );
});
