import test from "node:test";
import assert from "node:assert/strict";
import { acceptsStageThreeCode, acceptsStageTwoCode, createStageTwoMission, STAGE_THREE_CODE, STAGE_TWO_CODE, STAGE_TWO_CUBES } from "../src/game/missions/stage-two.js";

test("stage two accepts its earned code without case or whitespace sensitivity", () => {
  assert.equal(STAGE_TWO_CODE, "ACTIVATEDUCKMASTER");
  assert.equal(acceptsStageTwoCode("  activateduckmaster "), true);
  assert.equal(acceptsStageTwoCode("DUCKMASTER"), false);
});

test("stage three accepts the access phrase", () => {
  assert.equal(STAGE_THREE_CODE, "LEAD DUCK PLEASE");
  assert.equal(acceptsStageThreeCode(" lead   duck please "), true);
  assert.equal(acceptsStageThreeCode("leap duck please"), true);
});

const obs = (overrides = {}) => STAGE_TWO_CUBES.map((cube) => ({
  name: cube.name, distance: 1, scanVisible: false, colliding: false, ...overrides[cube.name],
}));

test("QR reports must arrive in the hidden order", () => {
  const mission = createStageTwoMission({ order: ["BLUE", "RED", "ORANGE"] });
  assert.equal(mission.update({ observations: obs({ BLUE: { scanVisible: true } }) }).event, "correct-step");
  assert.equal(mission.update({ observations: obs({ RED: { scanVisible: true } }) }).event, "correct-step");
  assert.equal(mission.update({ observations: obs({ ORANGE: { scanVisible: true } }) }).event, "success");
});

test("a wrong scan requests a new round and collisions still fail", () => {
  const wrong = createStageTwoMission({ order: ["BLUE", "RED", "ORANGE"] });
  assert.equal(wrong.update({ observations: obs({ RED: { scanVisible: true } }) }).event, "wrong-order");
  const collision = createStageTwoMission({ order: ["BLUE", "RED", "ORANGE"] });
  assert.equal(collision.update({ observations: obs({ RED: { colliding: true } }) }).event, "collision");
});

test("stage two contains exactly the three coloured QR cube definitions", () => {
  assert.deepEqual(STAGE_TWO_CUBES.map((cube) => cube.name), ["RED", "BLUE", "ORANGE"]);
  assert.equal(new Set(STAGE_TWO_CUBES.map((cube) => cube.payload)).size, 3);
  assert.equal(Object.isFrozen(STAGE_TWO_CUBES), true);
});
