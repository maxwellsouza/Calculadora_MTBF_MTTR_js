import { applyValidation } from "../src/grid.js";
import { test, assertTrue, assertFalse } from "./test-runner.js";

function mkInput(val = "") {
  const i = document.createElement("input");
  i.className = "gjs-input";
  i.value = val;
  return i;
}

test("applyValidation flags invalid inputs and sets ARIA", () => {
  const container = document.createElement("div");
  const valid = mkInput("1.5");
  const invalid = mkInput("oops");
  container.append(valid, invalid);

  const anyInvalid = applyValidation(container);
  assertTrue(anyInvalid);
  assertTrue(valid.classList.contains("valid"));
  assertFalse(valid.classList.contains("invalid"));
  assertTrue(invalid.classList.contains("invalid"));
  assertFalse(invalid.classList.contains("valid"));
  assertTrue(invalid.getAttribute("aria-invalid") === "true");
});

test("applyValidation: all valid and empty not counted as invalid", () => {
  const container = document.createElement("div");
  const a = mkInput("01:30:00");
  const b = mkInput(""); // empty should not mark anyInvalid=true
  container.append(a, b);

  const anyInvalid = applyValidation(container);
  assertFalse(anyInvalid);
  assertTrue(a.classList.contains("valid"));
  assertFalse(a.classList.contains("invalid"));
});
