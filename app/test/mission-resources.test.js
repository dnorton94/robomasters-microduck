import test from "node:test";
import assert from "node:assert/strict";
import { STAGE_ONE_MAX_ATTEMPTS, inferRoute, moduleEnergyMultiplier, routeRisk }
  from "../src/game/missions/mission-resources.js";

test("stage one has a fixed attempt budget", () => {
  assert.equal(STAGE_ONE_MAX_ATTEMPTS, 4);
});

test("observed path length determines route strategy and containment risk", () => {
  assert.equal(inferRoute(1.1, 1), "direct");
  assert.equal(inferRoute(1.5, 1), "balanced");
  assert.equal(inferRoute(2, 1), "cautious");
  assert.ok(routeRisk("direct") > routeRisk("balanced"));
  assert.ok(routeRisk("cautious") < routeRisk("balanced"));
});

test("each additional module increases mission power draw", () => {
  assert.equal(moduleEnergyMultiplier(1), 1);
  assert.ok(moduleEnergyMultiplier(3) > moduleEnergyMultiplier(2));
});
