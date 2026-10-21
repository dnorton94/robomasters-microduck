import test from "node:test";
import assert from "node:assert/strict";
import { AutonomousSource } from "../src/game/autonomy/autonomous-source.js";

const make = (world) => {
  let manual = false;
  const actions = [];
  const source = new AutonomousSource({
    perception: { sample: () => world },
    getVelocityLimits: () => [0.25, -0.2, 1],
    manualActive: () => manual,
  });
  source.onAction = (a) => actions.push(a);
  source.configure({ enabled: true, mode: "chase" });
  return { source, actions, setManual: (v) => { manual = v; } };
};

test("chase turns toward an off-axis ball", () => {
  const { source } = make({ robot: { x: 0, y: 0, yaw: 0 }, ball: { x: 0.5, y: 0.4, active: true }, arena: { half: 1.5 } });
  source.poll(0.02);
  assert.ok(source.command[2] > 0);
});

test("chase kicks a close aligned ball", () => {
  const { source, actions } = make({ robot: { x: 0, y: 0, yaw: 0 }, ball: { x: 0.18, y: 0.01, active: true }, arena: { half: 1.5 } });
  source.poll(0.02);
  assert.deepEqual(actions, ["kickL"]);
});

test("manual input immediately suppresses autonomous command", () => {
  const { source, setManual } = make({ robot: { x: 0, y: 0, yaw: 0 }, ball: { x: 1, y: 0, active: true }, arena: { half: 1.5 } });
  source.poll(0.02);
  assert.ok(source.command[0] > 0);
  setManual(true);
  source.poll(0.02);
  assert.equal(source.command[0], 0);
  assert.equal(source.isActive(), false);
});
