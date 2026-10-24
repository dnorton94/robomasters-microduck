import test from "node:test";
import assert from "node:assert/strict";
import { PolicyPreviewSource } from "../src/game/controls/policy-preview.js";

test("walk/drive preview supplies forward velocity then stops", () => {
  const source = new PolicyPreviewSource({
    getVelocityLimits: () => [0.6, -0.3, 1.5],
    manualActive: () => false,
  });
  source.start(1);
  source.poll(0.1);
  assert.equal(source.isActive(), true);
  assert.ok(Math.abs(source.command[0] - 0.6) < 1e-6);
  source.poll(1);
  source.poll(0.1);
  assert.equal(source.isActive(), false);
  assert.deepEqual([...source.command], [0, 0, 0]);
});

test("manual input immediately cancels the policy preview", () => {
  let manual = false;
  const source = new PolicyPreviewSource({
    getVelocityLimits: () => [0.6, -0.3, 1.5],
    manualActive: () => manual,
  });
  source.start();
  source.poll(0.1);
  manual = true;
  source.poll(0.1);
  assert.equal(source.isActive(), false);
  assert.deepEqual([...source.command], [0, 0, 0]);
});
