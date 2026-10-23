/* Spracherkennung im Hintergrund (Web Worker), vollständig offline.
   Engine: sherpa-onnx (Apache-2.0), WebAssembly-Fassung aus dem npm-Paket sherpa-onnx 2.0.0,
   für den Browser angepasst (siehe speech/README.md). Modell: Kroko Streaming Zipformer (DE/EN).
   Nachrichten an den Worker:
     {t:"init", wasm:ArrayBuffer, files:{"encoder.onnx":ArrayBuffer, ...}}
     {t:"start"}                        neue Aufnahme
     {t:"audio", sr:Zahl, data:Float32Array}
     {t:"stop"}                         Aufnahme beendet, Endergebnis liefern
   Antworten: {t:"ready", ms}, {t:"partial", text}, {t:"final", text, audioSec, decodeMs}, {t:"error", msg}, {t:"log", msg} */
"use strict";
let M = null, rec = null, stream = null, audioSec = 0, decodeMs = 0, lastText = "";

self.onmessage = async e => {
  const m = e.data;
  try{
    if(m.t === "init") await init(m);
    else if(m.t === "start") start();
    else if(m.t === "audio") audio(m.sr, m.data);
    else if(m.t === "stop") stop();
  }catch(err){
    self.postMessage({t:"error", msg: String(err && err.message || err)});
  }
};

async function init(m){
  const t0 = performance.now();
  importScripts("sherpa-onnx-2.0.0.js", "sherpa-onnx-asr.js");
  M = { wasmBinary: m.wasm, print: s => self.postMessage({t:"log", msg:s}), printErr: s => self.postMessage({t:"log", msg:s}) };
  await Module(M);
  M.FS.mkdir("/m");
  for(const [name, buf] of Object.entries(m.files)) M.FS.writeFile("/m/" + name, new Uint8Array(buf));
  rec = createOnlineRecognizer(M, {
    featConfig: { sampleRate: 16000, featureDim: 80 },
    modelConfig: {
      transducer: { encoder: "/m/encoder.onnx", decoder: "/m/decoder.onnx", joiner: "/m/joiner.onnx" },
      paraformer: { encoder: "", decoder: "" },
      zipformer2Ctc: { model: "" },
      nemoCtc: { model: "" },
      toneCtc: { model: "" },
      tokens: "/m/tokens.txt",
      numThreads: 1, provider: "cpu", debug: 0, modelType: "", modelingUnit: "cjkchar", bpeVocab: ""
    },
    decodingMethod: "greedy_search",
    maxActivePaths: 4,
    enableEndpoint: 0,                 // eine Aufnahme = ein Funkspruch, keine automatische Pausentrennung
    rule1MinTrailingSilence: 2.4, rule2MinTrailingSilence: 1.2, rule3MinUtteranceLength: 20,
    hotwordsFile: "", hotwordsScore: 1.5,
    ctcFstDecoderConfig: { graph: "", maxActive: 3000 },
    ruleFsts: "", ruleFars: ""
  });
  // Modelldateien liegen jetzt im Speicher der Engine, Kopien im Dateisystem freigeben
  for(const name of Object.keys(m.files)) try{ M.FS.unlink("/m/" + name); }catch(_){}
  self.postMessage({t:"ready", ms: Math.round(performance.now() - t0)});
}

function start(){
  if(!rec) throw new Error("Engine nicht geladen");
  if(stream) stream.free();
  stream = rec.createStream();
  audioSec = 0; decodeMs = 0; lastText = "";
}

function audio(sr, data){
  if(!stream) return;
  audioSec += data.length / sr;
  stream.acceptWaveform(sr, data);
  decodeReady();
  const text = rec.getResult(stream).text;
  if(text !== lastText){ lastText = text; self.postMessage({t:"partial", text}); }
}

function stop(){
  if(!stream) return;
  // kurze Stille anhängen, damit die letzten Silben noch ausgewertet werden
  stream.acceptWaveform(16000, new Float32Array(16000 * 0.4));
  stream.inputFinished();
  decodeReady();
  const text = rec.getResult(stream).text;
  self.postMessage({t:"final", text, audioSec, decodeMs: Math.round(decodeMs)});
  stream.free(); stream = null;
}

function decodeReady(){
  const t0 = performance.now();
  while(rec.isReady(stream)) rec.decode(stream);
  decodeMs += performance.now() - t0;
}
