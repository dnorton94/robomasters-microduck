import { CUSTOM_AUTONOMOUS_BEHAVIORS } from "./custom-behaviors.js";

const official = [
  { id: "roam", label: "Roam", locked: true },
  { id: "chase", label: "Chase Ball", locked: true },
];

const validCustom = CUSTOM_AUTONOMOUS_BEHAVIORS.filter((item) =>
  item && typeof item.id === "string" && item.id && typeof item.label === "string" &&
  typeof item.create === "function" && !official.some((builtIn) => builtIn.id === item.id));

const catalog = Object.freeze([...official, ...validCustom.map((item) => ({
  id: item.id, label: item.label, locked: false,
}))]);
const customById = new Map(validCustom.map((item) => [item.id, item]));

export const listAutonomousBehaviors = () => catalog;
export const hasAutonomousBehavior = (id) => catalog.some((item) => item.id === id);
export const getCustomAutonomousBehavior = (id) => customById.get(id) ?? null;
