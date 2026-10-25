import test from "node:test";
import assert from "node:assert/strict";
import { STAGE_ONE_MAX_ATTEMPTS, moduleEnergyMultiplier, routeEnergyMultiplier, routeRisk }
  from "../src/game/missions/mission-resources.js";

test("stage one has a fixed attempt budget", () => {
  assert.equal(STAGE_ONE_MAX_ATTEMPTS, 4);
});

test("route choice exchanges energy for containment safety", () => {
  assert.ok(routeEnergyMultiplier("direct") < routeEnergyMultiplier("balanced"));
  assert.ok(routeEnergyMultiplier("cautious") > routeEnergyMultiplier("balanced"));
  assert.ok(routeRisk("direct") > routeRisk("balanced"));
  assert.ok(routeRisk("cautious") < routeRisk("balanced"));
});

test("each additional module increases mission power draw", () => {
  assert.equal(moduleEnergyMultiplier(1), 1);
  assert.ok(moduleEnergyMultiplier(3) > moduleEnergyMultiplier(2));
});
