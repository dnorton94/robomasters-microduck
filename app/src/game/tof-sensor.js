// Shared 8x8 Time-of-Flight sensor surface. Simulator code publishes frames;
// lessons and future robot adapters consume the same immutable shape.
import { MICRODUCK_HARDWARE } from "./hardware-spec.js";

const listeners = new Set();
const spec = MICRODUCK_HARDWARE.tof;
let state = { enabled: true, width: spec.width, height: spec.height, rangeM: spec.rangeM,
  hz: spec.hz, timestamp: 0, distancesM: Array(spec.width * spec.height).fill(null) };

export function publishTofFrame(distancesM, timestamp = performance.now()) {
  state = { ...state, timestamp, distancesM: [...distancesM] };
  for (const listener of listeners) listener(state);
}

export const tofApi = {
  getState: () => state,
  getFrame: () => [...state.distancesM],
  setEnabled(enabled) {
    state = { ...state, enabled: !!enabled };
    for (const listener of listeners) listener(state);
  },
  subscribe(listener) {
    listeners.add(listener);
    listener(state);
    return () => listeners.delete(listener);
  },
};

if (typeof window !== "undefined") window.__microduckTof = tofApi;

