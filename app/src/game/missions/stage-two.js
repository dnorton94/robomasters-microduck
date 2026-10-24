export const STAGE_TWO_CODE = "ACTIVATEDUCKMASTER";
export const STAGE_THREE_CODE = "LEAD DUCK PLEASE";

export const STAGE_TWO_CUBES = Object.freeze([
  Object.freeze({ name: "RED", color: 0xc9282d, x: -0.72, y: 0.72, payload: "VAULT-CORE:RED" }),
  Object.freeze({ name: "BLUE", color: 0x2878d0, x: 0, y: 0.96, payload: "VAULT-CORE:BLUE" }),
  Object.freeze({ name: "ORANGE", color: 0xf47b20, x: 0.72, y: 0.72, payload: "VAULT-CORE:ORANGE" }),
]);

export const acceptsStageTwoCode = (value) =>
  String(value ?? "").trim().toUpperCase() === STAGE_TWO_CODE;
export const acceptsStageThreeCode = (value) =>
  String(value ?? "").trim().replace(/\s+/g, " ").toUpperCase() === STAGE_THREE_CODE;

export function createStageTwoMission({ order }) {
  let cursor = 0;
  let state = { status: "active" };
  const publish = (status, event = null) => {
    const changed = state.status !== status;
    state = { status };
    return { changed, event, state: { ...state } };
  };
  return {
    getState: () => ({ ...state }),
    getProgress: () => cursor,
    update({ observations }) {
      if (state.status === "success" || state.status === "failed")
        return { changed: false, event: null, state: { ...state } };
      if (observations.some((item) => item.colliding)) {
        return publish("failed", "collision");
      }
      const scan = observations.find((item) => item.scanVisible);
      if (!scan) return publish("active", null);
      if (scan.name !== order[cursor]) {
        cursor = 0;
        return publish("active", "wrong-order");
      }
      cursor += 1;
      return cursor === order.length
        ? publish("success", "success")
        : publish("active", "correct-step");
    },
  };
}
