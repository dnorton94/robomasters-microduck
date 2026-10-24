// Shared dual-IMU surface. Values follow the real robot's sensor shape:
// acceleration in m/s², angular velocity in rad/s and orientation in degrees.
const listeners = new Set();
const empty = () => ({ enabled: true, acceleration: [0, 0, 0], angularVelocity: [0, 0, 0],
  orientation: [0, 0, 0] });
let state = { body: empty(), head: empty(), timestamp: 0 };

export function publishImuState(next, timestamp = performance.now()) {
  state = {
    body: { ...state.body, ...next.body },
    head: { ...state.head, ...next.head },
    timestamp,
  };
  for (const listener of listeners) listener(state);
}

export const imuApi = {
  getState: () => state,
  setEnabled(sensor, enabled) {
    if (sensor !== "body" && sensor !== "head") return;
    publishImuState({ [sensor]: { enabled: !!enabled } });
  },
  subscribe(listener) {
    listeners.add(listener); listener(state);
    return () => listeners.delete(listener);
  },
};

if (typeof window !== "undefined") window.__microduckImu = imuApi;
