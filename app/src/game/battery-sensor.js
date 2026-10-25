// Shared read-only battery telemetry. The simulator publishes this shape so a
// physical battery monitor can replace it without changing the UI or autonomy.
import { useGame } from "../store.js";

export const batteryApi = {
  getState: () => useGame.getState().battery,
  setEnabled(enabled) {
    useGame.setState((state) => ({ battery: { ...state.battery, enabled: !!enabled } }));
  },
};

if (typeof window !== "undefined") window.__microduckBattery = batteryApi;
