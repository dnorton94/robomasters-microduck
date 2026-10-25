// Fixed MicroDuck speaker output. Participant voice/TTS modules provide PCM;
// this adapter owns playback and mirrors the exact emitted waveform to the
// mission evaluator. It never accepts a claimed transcript as evidence.
import { MICRODUCK_HARDWARE } from "./hardware-spec.js";

const listeners = new Set();
let context = null;
let sequence = 0;
let state = { status: "idle", sequence: 0, durationS: 0, sampleRateHz: MICRODUCK_HARDWARE.speaker.sampleRateHz };

export function normalizeSpeakerFrame({ samples, sampleRateHz = MICRODUCK_HARDWARE.speaker.sampleRateHz } = {}) {
  if (!(samples instanceof Float32Array) && !Array.isArray(samples))
    throw new TypeError("speaker samples must be a Float32Array or number array");
  if (!Number.isFinite(sampleRateHz) || sampleRateHz < 8000 || sampleRateHz > 48000)
    throw new RangeError("speaker sample rate must be between 8 kHz and 48 kHz");
  const pcm = Float32Array.from(samples, (value) => Math.max(-1, Math.min(1, Number(value) || 0)));
  if (!pcm.length || pcm.length > sampleRateHz * 30)
    throw new RangeError("speaker audio must contain between 1 sample and 30 seconds");
  return { samples: pcm, sampleRateHz, durationS: pcm.length / sampleRateHz };
}

const publish = (next) => {
  state = Object.freeze({ ...state, ...next });
  for (const listener of listeners) listener(state);
};

export const speakerApi = {
  getState: () => state,
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  async play(frame) {
    const normalized = normalizeSpeakerFrame(frame);
    const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextCtor) throw new Error("Web Audio output is unavailable");
    context ??= new AudioContextCtor();
    if (context.state === "suspended") await context.resume();
    const buffer = context.createBuffer(1, normalized.samples.length, normalized.sampleRateHz);
    buffer.copyToChannel(normalized.samples, 0);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    const id = ++sequence;
    publish({ status: "playing", sequence: id, durationS: normalized.durationS,
      sampleRateHz: normalized.sampleRateHz, samples: normalized.samples });
    source.addEventListener("ended", () => {
      if (state.sequence === id) publish({ status: "idle", samples: undefined });
    }, { once: true });
    source.start();
    return { sequence: id, durationS: normalized.durationS };
  },
};

if (typeof window !== "undefined") window.__microduckSpeaker = speakerApi;
