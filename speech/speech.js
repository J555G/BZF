/* Sprachpaket und Sprechtaste (Hauptseite).
   - Download der Engine (eigene Datei) und der Modelle (Hugging Face) nur auf Wunsch,
     danach dauerhaft im Cache "bzf-speech-1" (getrennt vom App-Cache in sw.js, überlebt App-Updates).
   - Mikrofon über AudioWorklet, 0,4 s Vorlauf (Sprechbeginn kurz vor dem Drücken geht nicht verloren),
     0,25 s Nachlauf nach dem Loslassen.
   Schnittstelle: window.BZF_SPEECH */
(function(){
"use strict";
const CACHE = "bzf-speech-1";
const WASM = "speech/sherpa-onnx-2.0.0.wasm";
const MODELS = {
  de: { name:"Kroko Deutsch", mb:71,
        base:"https://huggingface.co/csukuangfj/sherpa-onnx-streaming-zipformer-de-kroko-2025-08-06/resolve/887db3d083240198c2d2b99fb66cfcfe6948ced8/" },
  en: { name:"Kroko English", mb:71,
        base:"https://huggingface.co/csukuangfj/sherpa-onnx-streaming-zipformer-en-kroko-2025-08-06/resolve/main/" }
};
const FILES = ["encoder.onnx", "decoder.onnx", "joiner.onnx", "tokens.txt"];
const urlsFor = lang => [new URL(WASM, location.href).href, ...FILES.map(f => MODELS[lang].base + f)];

async function cached(url){
  if(!("caches" in self)) return false;
  const c = await caches.open(CACHE);
  return !!(await c.match(url));
}
async function isInstalled(lang){
  for(const u of urlsFor(lang)) if(!(await cached(u))) return false;
  return true;
}
async function remove(lang){
  const c = await caches.open(CACHE);
  for(const f of FILES) await c.delete(MODELS[lang].base + f);
  const other = lang==="de" ? "en" : "de";
  if(!(await isInstalled(other))) await c.delete(new URL(WASM, location.href).href);
}
async function usage(){
  try{ const e = await navigator.storage.estimate(); return e; }catch(_){ return null; }
}

/* Lädt eine Datei aus dem Cache oder aus dem Netz (mit Fortschritt) und legt sie im Cache ab. */
async function fetchCached(url, onBytes){
  const c = await caches.open(CACHE);
  const hit = await c.match(url);
  if(hit){ const b = await hit.arrayBuffer(); onBytes(b.byteLength); return b; }
  const res = await fetch(url, { mode:"cors", cache:"no-store" });
  if(!res.ok) throw new Error(`HTTP ${res.status} bei ${url.split("/").pop()}`);
  const reader = res.body.getReader(), parts = [];
  let n = 0;
  for(;;){
    const { done, value } = await reader.read();
    if(done) break;
    parts.push(value); n += value.length; onBytes(value.length);
  }
  const blob = new Blob(parts);
  await c.put(url, new Response(blob, { headers:{ "Content-Type":"application/octet-stream", "Content-Length":String(n) } }));
  return blob.arrayBuffer();
}

/* ---------- Engine ---------- */
let worker = null, workerLang = null, readyP = null, onPartial = null, finalResolve = null;

async function load(lang, onProgress){
  if(worker && workerLang===lang) return readyP;
  if(worker){ worker.terminate(); worker = null; }
  try{ if(navigator.storage && navigator.storage.persist) await navigator.storage.persist(); }catch(_){}
  const total = (15 + MODELS[lang].mb) * 1048576;
  let got = 0;
  const step = b => { got += b; onProgress && onProgress(Math.min(got, total), total, "download"); };
  const urls = urlsFor(lang);
  const bufs = [];
  for(const u of urls) bufs.push(await fetchCached(u, step));
  onProgress && onProgress(total, total, "init");
  workerLang = lang;
  worker = new Worker("speech/speech-worker.js");
  readyP = new Promise((resolve, reject) => {
    worker.onmessage = e => {
      const m = e.data;
      if(m.t==="ready") resolve(m);
      else if(m.t==="partial") onPartial && onPartial(m.text);
      else if(m.t==="final"){ if(finalResolve){ finalResolve(m); finalResolve = null; } }
      else if(m.t==="error"){ reject(new Error(m.msg)); if(finalResolve){ finalResolve({ text:"", error:m.msg }); finalResolve = null; } }
      else if(m.t==="log") console.log("[sherpa-onnx]", m.msg);
    };
    worker.onerror = e => reject(new Error(e.message || "Worker-Fehler"));
  });
  const files = {};
  FILES.forEach((f, i) => files[f] = bufs[i+1]);
  worker.postMessage({ t:"init", wasm:bufs[0], files }, [bufs[0], ...bufs.slice(1)]);
  return readyP;
}
function unload(){ if(worker){ worker.terminate(); worker = null; workerLang = null; readyP = null; } }

/* ---------- Mikrofon ---------- */
const WORKLET = `class Tap extends AudioWorkletProcessor{process(i){const c=i[0]&&i[0][0];if(c)this.port.postMessage(c.slice(0));return true}}registerProcessor("tap",Tap);`;
let ctx = null, media = null, node = null, src = null, tx = false, tail = 0;
let pre = [], preLen = 0, batch = [], batchLen = 0;

async function micOpen(){
  if(media) return true;
  media = await navigator.mediaDevices.getUserMedia({ audio:{ channelCount:1, echoCancellation:true, noiseSuppression:true, autoGainControl:true } });
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
  if(ctx.state==="suspended") await ctx.resume();
  if(!micOpen.worklet){
    const url = URL.createObjectURL(new Blob([WORKLET], { type:"text/javascript" }));
    await ctx.audioWorklet.addModule(url);
    micOpen.worklet = true;
  }
  src = ctx.createMediaStreamSource(media);
  node = new AudioWorkletNode(ctx, "tap");
  node.port.onmessage = e => chunk(e.data);
  const mute = ctx.createGain(); mute.gain.value = 0;
  src.connect(node); node.connect(mute); mute.connect(ctx.destination);
  return true;
}
function micClose(){
  if(media){ media.getTracks().forEach(t => t.stop()); media = null; }
  try{ src && src.disconnect(); node && node.disconnect(); }catch(_){}
  src = node = null; tx = false; pre = []; preLen = 0;
}
function chunk(d){
  const sr = ctx.sampleRate;
  if(tx || tail > 0){
    batch.push(d); batchLen += d.length;
    if(!tx){ tail -= d.length; if(tail <= 0){ flush(); worker && worker.postMessage({ t:"stop" }); } }
    else if(batchLen >= sr * 0.1) flush();
  } else {
    pre.push(d); preLen += d.length;
    while(preLen - pre[0].length > sr * 0.4){ preLen -= pre[0].length; pre.shift(); }
  }
}
function flush(){
  if(!batchLen || !worker) { batch = []; batchLen = 0; return; }
  const out = new Float32Array(batchLen); let o = 0;
  for(const b of batch){ out.set(b, o); o += b.length; }
  batch = []; batchLen = 0;
  worker.postMessage({ t:"audio", sr:ctx.sampleRate, data:out }, [out.buffer]);
}

/* Sprechtaste gedrückt: Aufnahme beginnen. Liefert false, wenn das Mikrofon erst freigegeben werden musste. */
async function pressStart(partialCb){
  const fresh = !media;
  await micOpen();
  if(ctx.state==="suspended") await ctx.resume();
  if(fresh) return false;
  onPartial = partialCb;
  worker.postMessage({ t:"start" });
  batch = pre; batchLen = preLen; pre = []; preLen = 0;
  tx = true; tail = 0;
  return true;
}
/* Sprechtaste losgelassen: Nachlauf abwarten, dann Endergebnis. */
function pressEnd(){
  if(!tx) return Promise.resolve(null);
  tx = false; tail = ctx.sampleRate * 0.25;
  return new Promise(r => { finalResolve = r; });
}

window.BZF_SPEECH = { MODELS, isInstalled, remove, usage, load, unload, micOpen, micClose, pressStart, pressEnd,
  get ready(){ return !!readyP; }, get lang(){ return workerLang; } };
})();
