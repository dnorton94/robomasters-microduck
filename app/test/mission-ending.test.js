import test from "node:test";
import assert from "node:assert/strict";
import { selectMissionEnding } from "../src/game/missions/mission-ending.js";

test("mission ending reflects battery and containment consequences", () => {
  assert.equal(selectMissionEnding({ batteryPct: 80, containment: 10 }).id, "restored");
  assert.equal(selectMissionEnding({ batteryPct: 35, containment: 45 }).id, "costly");
  assert.equal(selectMissionEnding({ batteryPct: 90, containment: 90 }).id, "pyrrhic");
  assert.equal(selectMissionEnding({ batteryPct: 5, containment: 5 }).id, "pyrrhic");
});
