import test from "node:test";
import assert from "node:assert/strict";
import { isTypingTarget } from "../src/game/controls/keyboard.js";

test("keyboard controls yield to editable interface elements", () => {
  assert.equal(isTypingTarget({ tagName: "INPUT", isContentEditable: false }), true);
  assert.equal(isTypingTarget({ tagName: "TEXTAREA", isContentEditable: false }), true);
  assert.equal(isTypingTarget({ tagName: "DIV", isContentEditable: true }), true);
  assert.equal(isTypingTarget({ tagName: "CANVAS", isContentEditable: false }), false);
});
