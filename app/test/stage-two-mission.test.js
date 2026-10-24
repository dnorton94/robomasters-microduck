import test from "node:test";
import assert from "node:assert/strict";
import { acceptsStageTwoCode, createStageTwoMission, STAGE_TWO_CODE, STAGE_TWO_CUBES } from "../src/game/missions/stage-two.js";

test("stage two accepts its earned code without case or whitespace sensitivity", () => {
  assert.equal(STAGE_TWO_CODE, "ACTIVATEDUCKMASTER");
  assert.equal(acceptsStageTwoCode("  activateduckmaster "), true);
  assert.equal(acceptsStageTwoCode("DUCKMASTER"), false);
});

const obs = (overrides = {}) => STAGE_TWO_CUBES.map((cube) => ({
  name: cube.name, distance: 1, scanVisible: false, colliding: false, ...overrides[cube.name],
}));

test("all QR codes must be observed, then cleared, before a core can be selected", () => {
  const mission = createStageTwoMission({ correctCore: "BLUE" });
  mission.update({ observations: obs({ RED: { scanVisible: true } }), nowMs: 0 });
  mission.update({ observations: obs({ BLUE: { scanVisible: true } }), nowMs: 100 });
  mission.update({ observations: obs({ ORANGE: { scanVisible: true } }), nowMs: 200 });
  assert.equal(mission.getState().phase, "clear");
  mission.update({ observations: obs(), nowMs: 300 });
  assert.equal(mission.getState().phase, "select");
  mission.update({ observations: obs({ BLUE: { distance: .3 } }), nowMs: 400 });
  assert.equal(mission.update({ observations: obs({ BLUE: { distance: .3 } }), nowMs: 1600 }).event, "success");
});

test("collision and selecting an unsafe core fail the stage", () => {
  const collision = createStageTwoMission({ correctCore: "BLUE" });
  assert.equal(collision.update({ observations: obs({ RED: { colliding: true } }), nowMs: 0 }).event, "collision");
  const wrong = createStageTwoMission({ correctCore: "BLUE" });
  wrong.update({ observations: obs({ RED: { scanVisible: true }, BLUE: { scanVisible: true }, ORANGE: { scanVisible: true } }), nowMs: 0 });
  wrong.update({ observations: obs(), nowMs: 10 });
  wrong.update({ observations: obs({ RED: { distance: .3 } }), nowMs: 20 });
  assert.equal(wrong.update({ observations: obs({ RED: { distance: .3 } }), nowMs: 1220 }).event, "wrong-core");
});

test("stage two contains exactly the three coloured QR cube definitions", () => {
  assert.deepEqual(STAGE_TWO_CUBES.map((cube) => cube.name), ["RED", "BLUE", "ORANGE"]);
  assert.equal(new Set(STAGE_TWO_CUBES.map((cube) => cube.payload)).size, 3);
  assert.equal(Object.isFrozen(STAGE_TWO_CUBES), true);
});
