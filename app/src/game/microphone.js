// Opt-in microphone sensor for educational extensions. Audio remains local:
// this module never records, stores or transmits samples. Consumers can read
// levels/spectra or access the MediaStream to build speech and audio projects.
const listeners = new Set();
let stream = null;
let context = null;
let analyser = null;
let source = null;
let raf = 0;
let state = { status: "off", level: 0, error: null };
let timeData = null;

const publish = (patch) => {
  state = { ...state, ...patch };
  for (const listener of listeners) listener(state);
};

function sample() {
  if (!analyser) return;
  analyser.getByteTimeDomainData(timeData);
  let energy = 0;
  for (const value of timeData) {
    const x = (value - 128) / 128;
    energy += x * x;
  }
  const rms = Math.sqrt(energy / timeData.length);
  publish({ level: Math.min(1, rms * 4.5) });
  raf = requestAnimationFrame(sample);
}

export const microphoneApi = {
  async start() {
    if (stream) return state;
    if (!navigator.mediaDevices?.getUserMedia) {
      publish({ status: "error", error: "Microphone input is not supported by this browser." });
      return state;
    }
    publish({ status: "requesting", error: null, level: 0 });
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false,
      });
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      context = new AudioCtx();
      await context.resume();
      analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.72;
      timeData = new Uint8Array(analyser.fftSize);
      source = context.createMediaStreamSource(stream);
      source.connect(analyser); // analyser is intentionally not connected to output
      publish({ status: "listening", error: null });
      sample();
    } catch (error) {
      stream = null;
      publish({ status: "error", level: 0, error: error?.name === "NotAllowedError"
        ? "Microphone permission was not granted."
        : (error?.message || "Microphone could not be started.") });
    }
    return state;
  },

  stop() {
    cancelAnimationFrame(raf);
    raf = 0;
    source?.disconnect();
    for (const track of stream?.getTracks?.() ?? []) track.stop();
    context?.close?.();
    stream = context = analyser = source = timeData = null;
    publish({ status: "off", level: 0, error: null });
  },

  getState: () => state,
  getStream: () => stream,
  getAnalyser: () => analyser,
  getFrequencyData(target = new Uint8Array(analyser?.frequencyBinCount ?? 0)) {
    analyser?.getByteFrequencyData(target);
    return target;
  },
  getTimeDomainData(target = new Uint8Array(analyser?.fftSize ?? 0)) {
    analyser?.getByteTimeDomainData(target);
    return target;
  },
  subscribe(listener) {
    listeners.add(listener);
    listener(state);
    return () => listeners.delete(listener);
  },
};

if (typeof window !== "undefined") window.__microduckMicrophone = microphoneApi;

