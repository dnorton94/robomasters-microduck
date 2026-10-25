import { CUSTOM_AUTONOMOUS_BEHAVIORS } from "./custom-behaviors.js";
import { hasCompleteResourceDeclaration, normalizeResourceProfile } from "../power-model.js";

const official = [
  { id: "roam", label: "Roam", locked: true,
    resources: { standby: .02, compute: .05, updateRateHz: 10, sensors: ["imu", "tof"] } },
  { id: "chase", label: "Chase Ball", locked: true,
    resources: { standby: .02, compute: .08, updateRateHz: 15, sensors: ["camera", "tof", "imu"] } },
];

const validCustom = CUSTOM_AUTONOMOUS_BEHAVIORS.filter((item) =>
  item && typeof item.id === "string" && item.id && typeof item.label === "string" &&
  typeof item.create === "function" && hasCompleteResourceDeclaration(item.resources) &&
  !official.some((builtIn) => builtIn.id === item.id));

const catalog = Object.freeze([...official.map(({ id, label, locked }) => ({ id, label, locked })),
  ...validCustom.map((item) => ({
  id: item.id, label: item.label, locked: false,
}))]);
const customById = new Map(validCustom.map((item) => [item.id, item]));
const resourcesById = new Map(official.map((item) => [item.id, normalizeResourceProfile(item.resources)]));
for (const item of validCustom) resourcesById.set(item.id, normalizeResourceProfile(item.resources));

export const listAutonomousBehaviors = () => catalog;
export const hasAutonomousBehavior = (id) => catalog.some((item) => item.id === id);
export const getCustomAutonomousBehavior = (id) => customById.get(id) ?? null;
export const getAutonomousResourceProfile = (id) => resourcesById.get(id) ?? normalizeResourceProfile();
