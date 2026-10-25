const normalizePhrase = (value) => String(value ?? "")
  .toUpperCase()
  .replace(/[^A-Z0-9]+/g, " ")
  .trim()
  .replace(/\s+/g, " ");

export function matchesStageThreePhrase(transcript, expected) {
  return normalizePhrase(transcript) === normalizePhrase(expected);
}

export function createStageThreeSpeechEvaluator() {
  let worker = null;
  let nextId = 0;
  const pending = new Map();

  const ensureWorker = () => {
    if (worker) return worker;
    worker = new Worker(new URL("./stage-three-asr.worker.js", import.meta.url), { type: "module" });
    worker.addEventListener("message", ({ data }) => {
      const request = pending.get(data.id);
      if (!request) return;
      if (data.type === "progress") {
        request.onProgress?.(data.progress);
        return;
      }
      pending.delete(data.id);
      if (data.type === "result") request.resolve(data.transcript);
      else request.reject(new Error(data.message || "Local speech recognition failed"));
    });
    worker.addEventListener("error", (error) => {
      for (const request of pending.values()) request.reject(error);
      pending.clear();
    });
    return worker;
  };

  return {
    transcribe({ samples, sampleRateHz, onProgress } = {}) {
      const audio = Float32Array.from(samples ?? []);
      if (!audio.length) return Promise.reject(new Error("Speaker audio is empty"));
      const id = ++nextId;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject, onProgress });
        ensureWorker().postMessage({ id, samples: audio, sampleRateHz }, [audio.buffer]);
      });
    },
    dispose() {
      worker?.terminate();
      worker = null;
      for (const request of pending.values()) request.reject(new Error("Speech evaluator disposed"));
      pending.clear();
    },
  };
}
