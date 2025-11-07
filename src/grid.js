// grid.js
import { parseDurationToHours, debounce, escapeAttr } from "./utils.js";

export function applyValidation(container) {
  let anyInvalid = false;
  container.querySelectorAll("input.gjs-input").forEach((inp) => {
    const hours = parseDurationToHours(inp.value);
    const ok = hours !== null && Number.isFinite(hours) && hours >= 0;
    inp.classList.toggle("valid", ok);
    inp.classList.toggle("invalid", !ok);
    inp.setAttribute("aria-invalid", ok ? "false" : "true");
    if (!ok && inp.value.trim() !== "") anyInvalid = true;
  });
  return anyInvalid;
}

export function mkDurationGrid(mountEl, initialData = []) {
  if (!("gridjs" in window)) throw new Error("Grid.js não encontrado.");
  const { Grid, html } = window.gridjs;

  let times = initialData.map(String);
  const asRows = () => times.map((t, i) => [i + 1, t]);

  const grid = new Grid({
    columns: [
      { id: "idx", name: "#", width: "56px" },
      {
        id: "duration",
        name: "tempo (h ou hh:mm:ss)",
        formatter: (cell, row) => {
          const idx0 = Number(row?.cells?.[0]?.data) - 1;
          return html(
            `<input class="gjs-input" data-row="${idx0}" value="${escapeAttr(
              cell
            )}" />`
          );
        },
      },
      {
        id: "actions",
        name: "",
        width: "56px",
        formatter: (_c, row) => {
          const idx0 = Number(row?.cells?.[0]?.data) - 1;
          return html(
            `<button class="row-del ghost small" data-row="${idx0}" title="Remover"><i class="fa-solid fa-xmark"></i></button>`
          );
        },
      },
    ],
    data: asRows(),
    pagination: false,
    sort: false,
    search: false,
    className: { table: "gjs-table" },
  }).render(mountEl);

  // input change — delegação + debounce
  mountEl.addEventListener(
    "input",
    debounce((e) => {
      const target = e.target;
      if (
        !(target instanceof HTMLInputElement) ||
        !target.classList.contains("gjs-input")
      )
        return;
      const idx = Number(target.dataset.row);
      if (Number.isInteger(idx) && idx >= 0 && idx < times.length) {
        times[idx] = target.value;
        applyValidation(mountEl);
        mountEl.dispatchEvent(new CustomEvent("gridchange"));
      }
    }, 120)
  );

  mountEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button.row-del");
    if (!btn) return;
    const idx = Number(btn.dataset.row);
    if (Number.isInteger(idx) && idx >= 0 && idx < times.length) {
      times.splice(idx, 1);
      grid.updateConfig({ data: asRows() }).forceRender();
      applyValidation(mountEl);
      mountEl.dispatchEvent(new CustomEvent("gridchange"));
    }
  });

  // primeira validação
  setTimeout(() => applyValidation(mountEl), 0);

  return {
    addRow(value = "") {
      times.push(String(value));
      grid.updateConfig({ data: asRows() }).forceRender();
      applyValidation(mountEl);
      mountEl.dispatchEvent(new CustomEvent("gridchange"));
    },
    clearAll() {
      times = [];
      grid.updateConfig({ data: asRows() }).forceRender();
      applyValidation(mountEl);
      mountEl.dispatchEvent(new CustomEvent("gridchange"));
    },
    getValues() {
      return times
        .map(parseDurationToHours)
        .filter((h) => h !== null && Number.isFinite(h) && h >= 0);
    },
    getRaw() {
      return [...times];
    },
    hasInvalid() {
      return applyValidation(mountEl);
    },
  };
}
