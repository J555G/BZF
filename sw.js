/* Offline-Unterstützung: App-Dateien vorab speichern. Eigene Dateien zuerst aus dem Netz laden,
   damit Updates sofort ankommen; ohne Netz aus dem Speicher. Schriften zuerst aus dem Speicher.
   Bei jeder Änderung der App VERSION erhöhen. */
const VERSION = "bzf-v6";
const FILES = ["./", "index.html", "questions.js", "lessons.js", "scenarios.js", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const own = new URL(e.request.url).origin === location.origin;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(res => {
      if (res && (res.ok || res.type === "opaque")) cache.put(e.request, res.clone());
      return res;
    });
    if (own) return net.catch(() => hit);
    return hit || net.catch(() => hit);
  }));
});
