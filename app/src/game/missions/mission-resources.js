export const STAGE_ONE_MAX_ATTEMPTS = 4;

export function routeRisk(route) {
  return route === "direct" ? 30 : route === "cautious" ? 15 : 22;
}

export function inferRoute(traveledM, directDistanceM) {
  const ratio = traveledM / Math.max(0.1, directDistanceM);
  return ratio <= 1.25 ? "direct" : ratio <= 1.75 ? "balanced" : "cautious";
}
