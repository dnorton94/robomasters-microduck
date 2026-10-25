import test from "node:test";
import assert from "node:assert/strict";
import { hasAutonomousBehavior, listAutonomousBehaviors } from "../src/game/autonomy/behavior-registry.js";
import { MICRODUCK_HARDWARE } from "../src/game/hardware-spec.js";

test("official autonomous behaviours remain registered and locked", () => {
  const catalog = listAutonomousBehaviors();
  assert.deepEqual(catalog.slice(0, 2), [
    { id: "roam", label: "Roam", locked: true },
    { id: "chase", label: "Chase Ball", locked: true },
  ]);
  assert.equal(hasAutonomousBehavior("roam"), true);
  assert.equal(hasAutonomousBehavior("missing"), false);
  assert.equal(Object.isFrozen(catalog), true);
});

test("course hardware contract is fixed and deeply frozen", () => {
  assert.deepEqual(MICRODUCK_HARDWARE.tof,
    { count: 1, mount: "head", width: 8, height: 8, rangeM: 2, hz: 10 });
  assert.equal(MICRODUCK_HARDWARE.camera.count, 1);
  assert.deepEqual(MICRODUCK_HARDWARE.speaker,
    { count: 1, mount: "head", channels: 1, sampleRateHz: 16000 });
  assert.equal(Object.isFrozen(MICRODUCK_HARDWARE), true);
  assert.equal(Object.isFrozen(MICRODUCK_HARDWARE.camera), true);
  assert.equal(Object.isFrozen(MICRODUCK_HARDWARE.imu.mounts), true);
});
