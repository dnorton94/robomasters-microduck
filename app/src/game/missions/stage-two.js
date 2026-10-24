export const STAGE_TWO_CODE = "ACTIVATEDUCKMASTER";

export const STAGE_TWO_CUBES = Object.freeze([
  Object.freeze({ name: "RED", color: 0xc9282d, x: -0.72, y: 0.72, payload: "VAULT-CORE:RED" }),
  Object.freeze({ name: "BLUE", color: 0x2878d0, x: 0, y: 0.96, payload: "VAULT-CORE:BLUE" }),
  Object.freeze({ name: "ORANGE", color: 0xf47b20, x: 0.72, y: 0.72, payload: "VAULT-CORE:ORANGE" }),
]);

export const acceptsStageTwoCode = (value) =>
  String(value ?? "").trim().toUpperCase() === STAGE_TWO_CODE;

const SELECT_HOLD_MS = 1200;

export function createStageTwoMission({ correctCore }) {
  let scanned = new Set();
  let phase = "scan";
  let selected = null;
  let selectedAt = null;
  let state = { status: "active", phase };
  const publish = (status, event = null) => {
    const changed = state.status !== status || state.phase !== phase;
    state = { status, phase };
    return { changed, event, state: { ...state } };
  };
  return {
    getState: () => ({ ...state }),
    getScanned: () => [...scanned],
    update({ observations, nowMs }) {
      if (state.status === "success" || state.status === "failed")
        return { changed: false, event: null, state: { ...state } };
      if (observations.some((item) => item.colliding)) {
        phase = "ended";
        return publish("failed", "collision");
      }
      if (phase === "scan") {
        for (const item of observations) if (item.scanVisible) scanned.add(item.name);
        if (scanned.size === STAGE_TWO_CUBES.length) phase = "clear";
        return publish("active", null);
      }
      if (phase === "clear") {
        if (observations.every((item) => item.distance > 0.62)) phase = "select";
        return publish("active", null);
      }
      const nearby = observations.find((item) => item.distance < 0.4);
      if (!nearby) {
        selected = null;
        selectedAt = null;
        return publish("active", null);
      }
      if (selected !== nearby.name) {
        selected = nearby.name;
        selectedAt = nowMs;
        return publish("active", null);
      }
      if (nowMs - selectedAt < SELECT_HOLD_MS) return publish("active", null);
      phase = "ended";
      return selected === correctCore
        ? publish("success", "success")
        : publish("failed", "wrong-core");
    },
  };
}
