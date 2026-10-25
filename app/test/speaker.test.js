import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSpeakerFrame } from "../src/game/speaker.js";

test("speaker normalizes and clamps participant PCM", () => {
  const frame = normalizeSpeakerFrame({ samples: [-2, -.25, .5, 4], sampleRateHz: 16000 });
  assert.deepEqual([...frame.samples], [-1, -.25, .5, 1]);
  assert.equal(frame.durationS, 4 / 16000);
});

test("speaker rejects unsupported audio shapes", () => {
  assert.throws(() => normalizeSpeakerFrame({ samples: "hello" }), TypeError);
  assert.throws(() => normalizeSpeakerFrame({ samples: [], sampleRateHz: 16000 }), RangeError);
  assert.throws(() => normalizeSpeakerFrame({ samples: [0], sampleRateHz: 1000 }), RangeError);
});
