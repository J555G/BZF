/* Offline-Unterstützung: App-Dateien vorab speichern. Eigene Dateien zuerst aus dem Netz laden,
   damit Updates sofort ankommen; ohne Netz aus dem Speicher. Schriften zuerst aus dem Speicher.
   Bei jeder Änderung der App VERSION erhöhen. */
const VERSION = "bzf-v8";
const FILES = ["./", "index.html", "questions.js", "lessons.js", "scenarios.js", "manifest.webmanifest", "icon-192.png", "icon-512.png",
  "speech/normalize.js", "speech/speech.js", "speech/speech-worker.js", "speech/sherpa-onnx-2.0.0.js", "speech/sherpa-onnx-asr.js"];
/* Sprachpaket (Engine und Modelle) verwaltet speech/speech.js selbst im Cache "bzf-speech-1",
   damit es bei App-Updates nicht gelöscht wird. Diese Anfragen hier nicht anfassen. */
const SPEECH = /\.wasm$|huggingface\.co|hf\.co|xethub|cas-bridge/;

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && !k.startsWith("bzf-speech")).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || SPEECH.test(e.request.url)) return;
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
