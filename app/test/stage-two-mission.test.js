import test from "node:test";
import assert from "node:assert/strict";
import { acceptsStageTwoCode, STAGE_TWO_CODE, STAGE_TWO_CUBES } from "../src/game/missions/stage-two.js";

test("stage two accepts its earned code without case or whitespace sensitivity", () => {
  assert.equal(STAGE_TWO_CODE, "ACTIVATEDUCKMASTER");
  assert.equal(acceptsStageTwoCode("  activateduckmaster "), true);
  assert.equal(acceptsStageTwoCode("DUCKMASTER"), false);
});

test("stage two contains exactly the three coloured QR cube definitions", () => {
  assert.deepEqual(STAGE_TWO_CUBES.map((cube) => cube.name), ["RED", "BLUE", "ORANGE"]);
  assert.equal(new Set(STAGE_TWO_CUBES.map((cube) => cube.payload)).size, 3);
  assert.equal(Object.isFrozen(STAGE_TWO_CUBES), true);
});
