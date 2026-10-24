import test from "node:test";
import assert from "node:assert/strict";
import { createRedPlateMission } from "../src/game/missions/red-plate.js";

test("red plate succeeds after qualifying and leaving inside the safety window", () => {
  const mission = createRedPlateMission();
  mission.update({ onPlate: true, autonomous: true, nowMs: 1000 });
  assert.equal(mission.update({ onPlate: true, autonomous: true, nowMs: 4000 }).state.status, "armed");
  const result = mission.update({ onPlate: false, autonomous: true, nowMs: 5500 });
  assert.equal(result.event, "success");
});

test("red plate rejects an early exit", () => {
  const mission = createRedPlateMission();
  mission.update({ onPlate: true, autonomous: true, nowMs: 0 });
  const earlyExit = mission.update({ onPlate: false, autonomous: true, nowMs: 2999 });
  assert.equal(earlyExit.event, "early-exit");
  const reset = mission.reset();
  assert.equal(reset.state.status, "ready");
  assert.equal(reset.state.attempt, 2);
});

test("red plate fails at the containment deadline", () => {
  const mission = createRedPlateMission();
  mission.update({ onPlate: true, autonomous: true, nowMs: 0 });
  const result = mission.update({ onPlate: true, autonomous: true, nowMs: 5000 });
  assert.equal(result.event, "failed");
});

test("leaving exactly at the containment deadline is too late", () => {
  const mission = createRedPlateMission();
  mission.update({ onPlate: true, autonomous: true, nowMs: 0 });
  mission.update({ onPlate: true, autonomous: true, nowMs: 3000 });
  assert.equal(mission.update({ onPlate: false, autonomous: true, nowMs: 5000 }).event, "failed");
});

test("manual control cannot complete the mission", () => {
  const mission = createRedPlateMission();
  const result = mission.update({ onPlate: true, autonomous: false, nowMs: 0 });
  assert.equal(result.event, "manual");
  assert.equal(result.state.status, "invalid");
});
