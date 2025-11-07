// utils.js
export function parseDurationToHours(token) {
  const s = String(token ?? "").trim();
  if (!s) return null;
  const asNumber = Number(s.replace(",", "."));
  if (Number.isFinite(asNumber)) return asNumber;

  const parts = s.split(":").map((p) => p.trim());
  if (parts.some((p) => p === "")) return null;

  if (parts.length === 3) {
    const [h, m, sec] = parts.map(Number);
    if ([h, m, sec].some((v) => !Number.isFinite(v) || v < 0)) return null;
    return h + m / 60 + sec / 3600;
  }
  if (parts.length === 2) {
    const [m, sec] = parts.map(Number);
    if ([m, sec].some((v) => !Number.isFinite(v) || v < 0)) return null;
    return m / 60 + sec / 3600;
  }
  if (parts.length === 1) {
    const sec = Number(parts[0]);
    if (!Number.isFinite(sec) || sec < 0) return null;
    return sec / 3600;
  }
  return null;
}

export const fmt = (n, d = 3) =>
  Number(n).toLocaleString("pt-BR", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

export const sum = (a) => a.reduce((x, y) => x + y, 0);
export const mean = (a) => (a.length ? sum(a) / a.length : NaN);
export const median = (a) => {
  if (!a.length) return NaN;
  const b = [...a].sort((x, y) => x - y);
  const m = Math.floor(b.length / 2);
  return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
};
export const stdev = (a) => {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(mean(a.map((x) => (x - m) ** 2)));
};

export const debounce = (fn, ms = 120) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

// storage (um único namespace)
const LS_KEY = "calc-mtbf-mttr-avail-v4";
export const saveState = (state) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {}
};
export const loadState = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// helpers UI
export const fmtPct = (x, d = 2) => fmt(x * 100, d) + "%";
export const showEl = (el, show) => {
  el.classList.toggle("hidden", !show);
  el.setAttribute("aria-hidden", show ? "false" : "true");
};
export const escapeAttr = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/\"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
