const QUALIFY_MS = 3000;
const FAILURE_MS = 5000;

export const RED_PLATE_POSITION = Object.freeze({ x: 0.35, y: 0, radius: 0.24 });

export function createRedPlateMission() {
  let enteredAt = null;
  let qualified = false;
  let state = { status: "ready", feedback: "LOCATE THE RED PLATE", attempt: 1 };
  const publish = (status, feedback, event = null) => {
    const changed = state.status !== status || state.feedback !== feedback;
    state = { ...state, status, feedback };
    return { changed, event, state: { ...state } };
  };
  return {
    getState: () => ({ ...state }),
    reset({ increment = true } = {}) {
      enteredAt = null;
      qualified = false;
      state = { status: "ready", feedback: "LOCATE THE RED PLATE",
        attempt: increment ? state.attempt + 1 : state.attempt };
      return { changed: true, event: "reset", state: { ...state } };
    },
    update({ onPlate, autonomous, nowMs }) {
      if (state.status === "success" || state.status === "failed")
        return { changed: false, event: null, state: { ...state } };

      if (!onPlate) {
        if (enteredAt == null) return state.status === "invalid"
          ? publish("ready", "AUTONOMOUS CONTROL REQUIRED · RETRY")
          : { changed: false, event: null, state: { ...state } };
        const elapsed = nowMs - enteredAt;
        if (elapsed >= FAILURE_MS) {
          enteredAt = null;
          qualified = false;
          return publish("failed", "CONTAINMENT FAILURE · THE VAULT IS LOST", "failed");
        }
        const validExit = qualified && autonomous;
        enteredAt = null;
        qualified = false;
        return validExit
          ? publish("success", "DOOR UNLOCKED · STAGE COMPLETE", "success")
          : publish("ready", "SIGNAL LOST · ADAPT AND RETRY", "early-exit");
      }

      if (!autonomous) {
        enteredAt = null;
        qualified = false;
        return publish("invalid", "MANUAL CONTROL DETECTED · ATTEMPT VOID", "manual");
      }
      if (enteredAt == null) enteredAt = nowMs;
      const elapsed = nowMs - enteredAt;
      if (elapsed >= FAILURE_MS)
        return publish("failed", "CONTAINMENT FAILURE · THE VAULT IS LOST", "failed");
      if (elapsed >= QUALIFY_MS) {
        qualified = true;
        return publish("armed", "DOOR CIRCUIT RESPONDING · MOVE NOW");
      }
      return publish("timing", "PLATE SIGNAL DETECTED · HOLD POSITION");
    },
  };
}
