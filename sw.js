// Service worker for the GitHub Pages site. Pages and data load from the network first, so a monthly
// refresh shows up on the next visit; the cached copy is only used when you're offline.
const CACHE = "phcf-v1";
const CORE = ["./", "./index.html", "./data.js", "./history.js", "./manifest.webmanifest", "./assets/icon-192.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const save = (req, res) => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; };

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    e.respondWith(fetch(req).then(res => save(req, res)).catch(() => caches.match(req).then(hit => hit || caches.match("./index.html"))));
  } else if (/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    // Fonts rarely change: serve the cached copy and refresh it in the background.
    e.respondWith(caches.match(req).then(hit => {
      const net = fetch(req).then(res => save(req, res)).catch(() => hit);
      return hit || net;
    }));
  }
});
