export const STAGE_TWO_CODE = "ACTIVATEDUCKMASTER";

export const STAGE_TWO_CUBES = Object.freeze([
  Object.freeze({ name: "RED", color: 0xc9282d, x: -0.72, y: 0.72, payload: "VAULT-CORE:RED" }),
  Object.freeze({ name: "BLUE", color: 0x2878d0, x: 0, y: 0.96, payload: "VAULT-CORE:BLUE" }),
  Object.freeze({ name: "ORANGE", color: 0xf47b20, x: 0.72, y: 0.72, payload: "VAULT-CORE:ORANGE" }),
]);

export const acceptsStageTwoCode = (value) =>
  String(value ?? "").trim().toUpperCase() === STAGE_TWO_CODE;
