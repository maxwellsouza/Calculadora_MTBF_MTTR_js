import {
  parseDurationToHours,
  fmt,
  fmtPct,
  sum,
  mean,
  median,
  stdev,
  debounce,
  saveState,
  loadState,
  showEl,
  escapeAttr,
} from "../src/utils.js";
import {
  test,
  assertEquals,
  assertNear,
  assertTrue,
  assertFalse,
  assertDeepEqual,
} from "./test-runner.js";

test("parseDurationToHours: decimal number and comma", () => {
  assertEquals(parseDurationToHours("2.5"), 2.5);
  assertEquals(parseDurationToHours("2,5"), 2.5);
});

test("parseDurationToHours: hh:mm:ss", () => {
  assertNear(parseDurationToHours("1:30:00"), 1.5);
  assertNear(parseDurationToHours("00:10:30"), 10 / 60 + 30 / 3600);
});

test("parseDurationToHours: mm:ss and ss", () => {
  assertNear(parseDurationToHours("90:00"), 90 / 60);
  assertNear(parseDurationToHours("0:45"), 45 / 3600);
});

test("parseDurationToHours: invalid or empty", () => {
  assertEquals(parseDurationToHours(""), null);
  assertEquals(parseDurationToHours(null), null);
  assertEquals(parseDurationToHours(undefined), null);
  assertEquals(parseDurationToHours("1::2"), null);
  assertEquals(parseDurationToHours("abc"), null);
});

test("fmt: pt-BR formatting with decimals", () => {
  const s = fmt(1.23456, 3);
  assertTrue(/1,235/.test(s), `Expected pt-BR decimal, got ${s}`);
});

test("fmtPct: percentage with pt-BR decimals", () => {
  const s = fmtPct(0.1234, 2);
  assertTrue(/12,34%/.test(s), `Expected 12,34%, got ${s}`);
});

test("sum/mean/median", () => {
  assertEquals(sum([1, 2, 3]), 6);
  assertEquals(mean([1, 2, 3]), 2);
  assertTrue(Number.isNaN(mean([])));
  assertEquals(median([1]), 1);
  assertEquals(median([1, 3, 2]), 2);
  assertEquals(median([1, 2, 3, 4]), 2.5);
});

test("stdev (population)", () => {
  assertEquals(stdev([1]), 0);
  assertNear(stdev([1, 1]), 0);
  assertNear(stdev([1, 2, 3, 4]), Math.sqrt(1.25));
});

test("debounce: collapses multiple calls", async () => {
  let calls = 0;
  const fn = () => {
    calls += 1;
  };
  const d = debounce(fn, 50);
  d();
  d();
  d();
  await new Promise((r) => setTimeout(r, 80));
  assertEquals(calls, 1);
});

test("localStorage save/load state roundtrip", () => {
  const obj = { a: 1, b: "x", c: [1, 2, 3] };
  saveState(obj);
  const back = loadState();
  assertDeepEqual(back, obj);
});

test("showEl toggles classes and ARIA", () => {
  const el = document.createElement("div");
  el.className = "hidden";
  showEl(el, true);
  assertFalse(el.classList.contains("hidden"));
  assertEquals(el.getAttribute("aria-hidden"), "false");
  showEl(el, false);
  assertTrue(el.classList.contains("hidden"));
  assertEquals(el.getAttribute("aria-hidden"), "true");
});

test("escapeAttr sanitizes dangerous characters", () => {
  const input = `a&"<>`;
  const out = escapeAttr(input);
  assertEquals(out, "a&amp;&quot;&lt;&gt;");
});
