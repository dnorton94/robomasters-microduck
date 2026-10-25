import { env, pipeline } from "@huggingface/transformers";

const baseUrl = new URL(import.meta.env.BASE_URL, self.location.origin);
env.allowLocalModels = true;
env.allowRemoteModels = false;
env.useBrowserCache = false;
env.localModelPath = new URL("models/", baseUrl).href;
env.backends.onnx.wasm.wasmPaths = new URL("transformers/", baseUrl).href;
env.backends.onnx.wasm.numThreads = 1;

const MODEL_ID = "onnx-community/whisper-tiny.en";
let transcriberPromise = null;

function resample(input, sourceRate, targetRate = 16000) {
  if (sourceRate === targetRate) return input;
  const output = new Float32Array(Math.max(1, Math.round(input.length * targetRate / sourceRate)));
  const ratio = sourceRate / targetRate;
  for (let index = 0; index < output.length; index++) {
    const position = index * ratio;
    const left = Math.floor(position);
    const right = Math.min(input.length - 1, left + 1);
    const mix = position - left;
    output[index] = input[left] * (1 - mix) + input[right] * mix;
  }
  return output;
}

function getTranscriber(id) {
  transcriberPromise ??= pipeline("automatic-speech-recognition", MODEL_ID, {
    device: "wasm",
    dtype: "q8",
    local_files_only: true,
    progress_callback: (progress) => self.postMessage({ type: "progress", id, progress }),
  });
  return transcriberPromise;
}

self.addEventListener("message", async ({ data }) => {
  const { id } = data;
  try {
    const sampleRateHz = Number(data.sampleRateHz);
    if (!Number.isFinite(sampleRateHz) || sampleRateHz < 8000 || sampleRateHz > 48000)
      throw new Error("Unsupported speaker sample rate");
    const audio = resample(data.samples, sampleRateHz);
    const transcriber = await getTranscriber(id);
    const result = await transcriber(audio);
    self.postMessage({ type: "result", id, transcript: result.text ?? "" });
  } catch (error) {
    self.postMessage({ type: "error", id, message: error?.message ?? String(error) });
  }
});
