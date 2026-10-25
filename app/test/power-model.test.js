import test from "node:test";
import assert from "node:assert/strict";
import { batteryDrainPerSecond, hasCompleteResourceDeclaration, normalizeResourceProfile }
  from "../src/game/power-model.js";

test("movement consumes more power than standing idle", () => {
  const idle = batteryDrainPerSecond();
  const walking = batteryDrainPerSecond({ movementLoad: 1 });
  assert.ok(walking > idle);
});

test("active sensors and compute consume power based on workload", () => {
  const light = batteryDrainPerSecond({
    activeProfile: { sensors: ["imu"], compute: 0.05, updateRateHz: 10 },
  });
  const vision = batteryDrainPerSecond({
    activeProfile: { sensors: ["camera", "tof", "imu"], compute: 0.9, updateRateHz: 30 },
  });
  assert.ok(vision > light);
});

test("inactive attached behaviours draw less than active inference", () => {
  const standby = batteryDrainPerSecond({
    attachedProfiles: [{ standby: 0.02 }, { standby: 0.04 }],
  });
  const inference = batteryDrainPerSecond({
    attachedProfiles: [{ standby: 0.02 }, { standby: 0.04 }],
    runtimeCompute: 1,
  });
  assert.ok(standby > batteryDrainPerSecond());
  assert.ok(inference > standby);
});

test("resource declarations are sanitized and retain a minimum standby cost", () => {
  const profile = normalizeResourceProfile({
    standby: 0,
    compute: 2,
    updateRateHz: -1,
    sensors: ["camera", "camera", "unknown"],
  });
  assert.deepEqual(profile, {
    standby: 0.02,
    compute: 1,
    updateRateHz: 0,
    sensors: ["camera"],
  });
});

test("custom resources must completely and honestly describe their workload", () => {
  assert.equal(hasCompleteResourceDeclaration({
    standby: 0.03, compute: 0.7, updateRateHz: 10, sensors: ["camera", "tof"],
  }), true);
  assert.equal(hasCompleteResourceDeclaration({ compute: 0.7, sensors: ["camera"] }), false);
  assert.equal(hasCompleteResourceDeclaration({
    standby: 0.03, compute: 0.7, updateRateHz: 10, sensors: ["invented-sensor"],
  }), false);
});
