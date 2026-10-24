// Shared NFC reader surface. The simulator publishes antenna events here;
// a hardware adapter can publish the same shape without changing lessons/UI.
const listeners = new Set();
let state = { enabled: true, head: null, beak: null, tags: [], tagCount: 0, placing: false, timestamp: 0 };

export function publishNfcState(next) {
  state = { ...state, ...next, timestamp: performance.now() };
  for (const listener of listeners) listener(state);
}

export const nfcApi = {
  getState: () => state,
  setEnabled(enabled) { publishNfcState({ enabled: !!enabled }); },
  subscribe(listener) {
    listeners.add(listener); listener(state);
    return () => listeners.delete(listener);
  },
};

if (typeof window !== "undefined") window.__microduckNfc = nfcApi;
