export const STAGE_ONE_MAX_ATTEMPTS = 4;

export function routeRisk(route) {
  return route === "direct" ? 30 : route === "cautious" ? 15 : 22;
}

export function routeEnergyMultiplier(route) {
  return route === "direct" ? 0.85 : route === "cautious" ? 1.3 : 1;
}

export function moduleEnergyMultiplier(moduleCount) {
  return 1 + (Math.max(1, moduleCount) - 1) * 0.18;
}
