// Minimal browser test runner with async support
const state = {
  tests: [],
  pending: [],
  startedAt: Date.now(),
};

function el(id) {
  return document.getElementById(id);
}

function renderResult(name, ok, error) {
  const row = document.createElement("div");
  row.className = `test-row ${ok ? "ok" : "fail"}`;
  row.innerHTML = `<span class="status">${
    ok ? "✔" : "✖"
  }</span> <span class="name"></span>`;
  row.querySelector(".name").textContent = name;
  if (!ok && error) {
    const pre = document.createElement("pre");
    pre.className = "error";
    pre.textContent = String(error && (error.stack || error.message || error));
    row.appendChild(pre);
  }
  el("results").appendChild(row);
}

function record(name, ok, error) {
  state.tests.push({ name, ok, error });
  renderResult(name, ok, error);
}

export function test(name, fn) {
  const p = Promise.resolve()
    .then(() => fn())
    .then(
      () => record(name, true),
      (err) => record(name, false, err)
    );
  state.pending.push(p);
}

// Assertions
export function assertTrue(value, msg = "Expected value to be truthy") {
  if (!value) throw new Error(msg + ` (got ${value})`);
}

export function assertFalse(value, msg = "Expected value to be falsy") {
  if (value) throw new Error(msg + ` (got ${value})`);
}

export function assertEquals(actual, expected, msg = "Values are not equal") {
  if (actual !== expected) {
    throw new Error(
      `${msg}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(
        actual
      )}`
    );
  }
}

export function assertNear(
  actual,
  expected,
  tol = 1e-9,
  msg = "Values not within tolerance"
) {
  if (!(Number.isFinite(actual) && Number.isFinite(expected))) {
    throw new Error(`${msg}: non-finite values: ${actual}, ${expected}`);
  }
  if (Math.abs(actual - expected) > tol) {
    throw new Error(`${msg}: expected ${expected} ± ${tol}, got ${actual}`);
  }
}

export function assertDeepEqual(
  actual,
  expected,
  msg = "Deep equality failed"
) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) {
    throw new Error(`${msg}: expected ${b}, got ${a}`);
  }
}

export async function finalize() {
  await Promise.allSettled(state.pending);
  const total = state.tests.length;
  const passed = state.tests.filter((t) => t.ok).length;
  const failed = total - passed;
  const ms = Date.now() - state.startedAt;
  const summary = el("summary");
  summary.textContent = `${passed}/${total} passed, ${failed} failed in ${ms} ms`;
  summary.className = failed ? "fail" : "ok";
}
