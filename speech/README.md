# Sprachfunktion (Test)

Spracherkennung vollständig offline im Browser, für den Funk-Trainer.

| Datei | Inhalt |
|---|---|
| `speech.js` | Download und Cache des Sprachpakets, Mikrofon, Sprechtaste (Hauptseite) |
| `speech-worker.js` | Erkennung im Hintergrund (Web Worker) |
| `normalize.js` | Umwandlung von Zahlen und Buchstabieralphabet, Abgleich der Pflichtbestandteile |
| `sherpa-onnx-2.0.0.js`, `.wasm` | Engine sherpa-onnx 2.0.0 (Apache-2.0, siehe `LICENSE-sherpa-onnx`) |
| `sherpa-onnx-asr.js` | JavaScript-Schnittstelle der Engine, unverändert aus dem npm-Paket |

## Herkunft der Engine

Aus dem npm-Paket `sherpa-onnx@2.0.0` (Dateien `sherpa-onnx-wasm-nodejs.js/.wasm`). Die `.wasm`-Datei ist unverändert.
In der `.js`-Datei sind zwei Stellen angepasst, damit sie auch außerhalb von Node.js läuft:

1. Die Fehlermeldung „NODERAWFS is currently only supported on Node.js environment" entfernt.
2. Die Umleitung des Dateisystems auf Node.js (`NODERAWFS`) nur noch unter Node.js aktiv; im Browser bleibt das normale Speicher-Dateisystem.
3. Dateiname der `.wasm`-Datei auf `sherpa-onnx-2.0.0.wasm` geändert.

Sollte diese Fassung im Browser nicht laufen, ist die Alternative ein eigener Build der offiziellen Web-Fassung über GitHub Actions (emsdk, `build-wasm-simd-asr.sh` aus dem sherpa-onnx-Repo).

## Modelle

Kroko Streaming Zipformer (Banafo), für sherpa-onnx aufbereitet von csukuangfj auf Hugging Face:

- Deutsch: `csukuangfj/sherpa-onnx-streaming-zipformer-de-kroko-2025-08-06` (ca. 71 MB)
- Englisch: `csukuangfj/sherpa-onnx-streaming-zipformer-en-kroko-2025-08-06`

Lizenz der Modelle: siehe https://huggingface.co/Banafo/Kroko-ASR (vor einer kommerziellen Nutzung prüfen).
Die Modelle werden erst auf Wunsch direkt von Hugging Face geladen und im Browser-Cache `bzf-speech-1` gespeichert,
getrennt vom App-Cache, damit sie bei App-Updates erhalten bleiben.
