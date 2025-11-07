// ui.js
export function setActiveTab(id) {
  ["btnIntro", "btnMTBF", "btnMTTR", "btnAvailability"].forEach((btnId) => {
    const el = document.getElementById(btnId);
    const active = btnId === id;
    el.classList.toggle("active", active);
    el.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

export function swapPanelAnim() {
  const panel = document.querySelector(".panel");
  if (!panel) return;
  panel.classList.remove("anim-swap");
  panel.offsetHeight; // reflow
  panel.classList.add("anim-swap");
}

const THEME_KEY = "calc-theme";
export function applyStoredTheme() {
  const html = document.documentElement;
  const pref = localStorage.getItem(THEME_KEY);
  html.setAttribute("data-theme", pref || "auto");
}
export function toggleTheme() {
  const html = document.documentElement;
  const cur = html.getAttribute("data-theme") || "auto";
  const next = cur === "light" ? "dark" : cur === "dark" ? "auto" : "light";
  localStorage.setItem(THEME_KEY, next);
  applyStoredTheme();
  const icon = document.querySelector("#btnTheme i");
  if (icon)
    icon.className =
      next === "dark"
        ? "fa-solid fa-sun"
        : next === "light"
        ? "fa-solid fa-moon"
        : "fa-solid fa-circle-half-stroke";
}

// ripple minimalista
export function attachRipple(root = document) {
  root.addEventListener("click", (e) => {
    const btn = e.target.closest(".primary.ripple, .ghost.small, .btn-icon");
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ink = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ink.className = "ripple-ink";
    ink.style.width = ink.style.height = size + "px";
    ink.style.left = e.clientX - rect.left - size / 2 + "px";
    ink.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(ink);
    setTimeout(() => ink.remove(), 650);
  });
}
