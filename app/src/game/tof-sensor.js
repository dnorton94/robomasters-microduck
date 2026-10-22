// Shared 8x8 Time-of-Flight sensor surface. Simulator code publishes frames;
// lessons and future robot adapters consume the same immutable shape.
const listeners = new Set();
let state = { enabled: true, width: 8, height: 8, rangeM: 2, hz: 10, timestamp: 0,
  distancesM: Array(64).fill(null) };

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

