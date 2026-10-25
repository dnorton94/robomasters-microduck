import test from "node:test";
import assert from "node:assert/strict";
import { matchesStageThreePhrase } from "../src/game/missions/stage-three-asr.js";

test("stage three accepts the spoken phrase despite punctuation and casing", () => {
  assert.equal(matchesStageThreePhrase(
    "Aria, wake and lead us home, Starlight!",
    "ARIA WAKE AND LEAD US HOME STARLIGHT",
  ), true);
  assert.equal(matchesStageThreePhrase(
    "Aria wake and lead us home Moonbeam",
    "ARIA WAKE AND LEAD US HOME STARLIGHT",
  ), false);
});
