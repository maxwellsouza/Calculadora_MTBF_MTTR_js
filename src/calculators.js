// calculators.js
import {
  parseDurationToHours,
  mean,
  median,
  stdev,
  fmt,
  fmtPct,
  debounce,
} from "./utils.js";
import { mkDurationGrid } from "./grid.js";

// Regras comuns (média amostral priorizada > agregado)
function calcFromGridOrAggregate({ list, total, count }) {
  if (list.length > 0) {
    const m = mean(list);
    if (!Number.isFinite(m) || m <= 0)
      return {
        error: "Não foi possível calcular (dados amostrais inválidos).",
      };
    return {
      method: "amostral",
      mean: m,
      median: median(list),
      stdev: stdev(list),
      n: list.length,
    };
  }
  if (
    !(Number.isFinite(total) && total >= 0) ||
    !(Number.isInteger(count) && count > 0)
  ) {
    return {
      error:
        "Informe totais válidos (tempo e quantidade ≥ 1) ou preencha o grid.",
    };
  }
  return { method: "agregado", mean: total / count };
}

// Factory para MTBF/MTTR (DRY)
export function createTimeMetricCalc(cfg) {
  const {
    // IDs
    sectionId,
    gridMountId,
    addBtnId,
    clearBtnId,
    totalInputId,
    countInputId,
    calcBtnId,
    resultOutId,
    notesId,
    // textos
    aggregateLabel,
    // seed
    seedRows = [],
  } = cfg;

  const section = document.getElementById(sectionId);
  const grid = mkDurationGrid(document.getElementById(gridMountId), seedRows);

  const $ = (id) => section.querySelector(`#${id}`);
  const totalInp = $(`${totalInputId}`); // pode estar fora de section — ajuste se necessário
  const countInp = $(`${countInputId}`);
  const resultOut = $(`${resultOutId}`);
  const notes = $(`${notesId}`);

  document
    .getElementById(addBtnId)
    .addEventListener("click", () => grid.addRow(""));
  document.getElementById(clearBtnId).addEventListener("click", () => {
    if (confirm("Limpar todas as linhas?")) grid.clearAll();
  });

  function calc() {
    notes.textContent = "";
    if (grid.hasInvalid()) {
      resultOut.value =
        "Existem valores inválidos no grid. Corrija antes de calcular.";
      return;
    }
    const list = grid.getValues();
    const total = parseDurationToHours(totalInp.value);
    const count = Number(countInp.value);

    const r = calcFromGridOrAggregate({ list, total, count });
    if (r.error) {
      resultOut.value = r.error;
      return;
    }

    resultOut.value = `Resultado = ${fmt(r.mean)} horas`;
    notes.innerHTML =
      r.method === "amostral"
        ? `Método: <strong>amostral</strong>. Amostras: ${
            r.n
          }. Mediana: <strong>${fmt(
            r.median
          )}</strong> h; Desvio-padrão: <strong>${fmt(r.stdev)}</strong> h.`
        : `Método: <strong>agregado</strong>. ${aggregateLabel}: ${fmt(
            total
          )} h, Contagem: ${count}.`;
  }

  const recalc = debounce(calc, 150);
  document.getElementById(gridMountId).addEventListener("gridchange", recalc);
  totalInp.addEventListener("input", recalc);
  countInp.addEventListener("input", recalc);
  document.getElementById(calcBtnId).addEventListener("click", calc);

  // API simples para o main (autosave/restore)
  return {
    calc,
    getState: () => ({
      total: totalInp.value,
      count: countInp.value,
      rows: grid.getRaw(),
    }),
    setState: (s) => {
      if (!s) return;
      if (typeof s.total === "string") totalInp.value = s.total;
      if (typeof s.count === "string" || typeof s.count === "number")
        countInp.value = s.count;
      if (Array.isArray(s.rows) && s.rows.length) {
        grid.clearAll();
        s.rows.forEach((v) => grid.addRow(String(v)));
      }
    },
  };
}

export function createAvailabilityCalc(cfg) {
  const {
    availMtbfId,
    availMttrId,
    steadyBtnId,
    steadyOutId,
    steadyNotesId,
    periodTotalId,
    periodDownId,
    periodFailuresId,
    periodGridId,
    periodBtnId,
    seedRows = [],
  } = cfg;

  const avMTBF = document.getElementById(availMtbfId);
  const avMTTR = document.getElementById(availMttrId);
  const steadyOut = document.getElementById(steadyOutId);
  const steadyNotes = document.getElementById(steadyNotesId);

  function calcSteady() {
    steadyNotes.textContent = "";
    const mtbf = parseDurationToHours(avMTBF.value);
    const mttr = parseDurationToHours(avMTTR.value);
    if (
      !(Number.isFinite(mtbf) && mtbf > 0) ||
      !(Number.isFinite(mttr) && mttr >= 0)
    ) {
      steadyOut.value = "Informe MTBF > 0 e MTTR ≥ 0.";
      return;
    }
    const A = mtbf / (mtbf + mttr);
    steadyOut.value = `Disponibilidade (estimada) ≈ ${fmtPct(A)}`;
    steadyNotes.innerHTML = `Com MTBF = ${fmt(mtbf)} h e MTTR = ${fmt(
      mttr
    )} h → Availability ≈ ${fmt(A, 4)}.`;
  }

  document.getElementById(steadyBtnId).addEventListener("click", calcSteady);
  [avMTBF, avMTTR].forEach((i) =>
    i.addEventListener("input", debounce(calcSteady, 150))
  );

  // Período
  const periodGrid = mkDurationGrid(
    document.getElementById(periodGridId),
    seedRows
  );
  document
    .getElementById(`${periodGridId}`)
    .addEventListener("gridchange", debounce(calcPeriod, 150));
  const periodTotal = document.getElementById(periodTotalId);
  const periodDown = document.getElementById(periodDownId);
  const periodFailures = document.getElementById(periodFailuresId);
  document.getElementById(periodBtnId).addEventListener("click", calcPeriod);
  [periodTotal, periodDown, periodFailures].forEach((i) =>
    i.addEventListener("input", debounce(calcPeriod, 150))
  );

  function calcPeriod() {
    const out = document.getElementById("availabilityPeriodResult");
    const notes = document.getElementById("availabilityPeriodNotes");
    notes.textContent = "";

    if (periodGrid.hasInvalid()) {
      out.value = "Valores inválidos no grid do período.";
      return;
    }
    const T = parseDurationToHours(periodTotal.value);
    if (!(Number.isFinite(T) && T > 0)) {
      out.value = "Informe um período válido (> 0).";
      return;
    }

    const list = periodGrid.getValues();
    if (list.length > 0) {
      const D = list.reduce((a, b) => a + b, 0);
      const U = Math.max(0, T - D);
      const A = U / T;
      out.value = `Disponibilidade (período) = ${fmtPct(A)}`;
      notes.innerHTML = `Medido. Período: ${fmt(T)} h; Downtime: ${fmt(
        D
      )} h; Uptime: ${fmt(U)} h.`;
      return;
    }

    const Dsingle = parseDurationToHours(periodDown.value);
    if (Number.isFinite(Dsingle) && Dsingle >= 0) {
      const U = Math.max(0, T - Dsingle);
      const A = U / T;
      out.value = `Disponibilidade (período) = ${fmtPct(A)}`;
      notes.innerHTML = `Consolidado. Período: ${fmt(T)} h; Downtime: ${fmt(
        Dsingle
      )} h; Uptime: ${fmt(U)} h.`;
      return;
    }

    const n = Number(periodFailures.value);
    if (Number.isInteger(n) && n >= 0) {
      const mttrGuess = parseDurationToHours(avMTTR.value);
      if (!(Number.isFinite(mttrGuess) && mttrGuess >= 0)) {
        out.value = "Informe MTTR (estimativa) ou tempos do período.";
        return;
      }
      const D = n * mttrGuess,
        U = Math.max(0, T - D),
        A = U / T;
      out.value = `Disponibilidade (período, estimada) ≈ ${fmtPct(A)}`;
      notes.innerHTML = `Estimado. Período: ${fmt(
        T
      )} h; Falhas: ${n}; Downtime ≈ ${fmt(D)} h; Uptime ≈ ${fmt(U)} h.`;
      return;
    }

    out.value =
      "Informe tempos do período, downtime total, ou nº de falhas + MTTR (estimativa).";
  }

  return {
    calcSteady,
    calcPeriod,
    getState: () => ({
      mtbf: avMTBF.value,
      mttr: avMTTR.value,
      period: periodTotal.value,
      down: periodDown.value,
      failures: periodFailures.value,
      rows: periodGrid.getRaw(),
    }),
    setState: (s) => {
      if (!s) return;
      if (typeof s.mtbf === "string") avMTBF.value = s.mtbf;
      if (typeof s.mttr === "string") avMTTR.value = s.mttr;
      if (typeof s.period === "string") periodTotal.value = s.period;
      if (typeof s.down === "string") periodDown.value = s.down;
      if (typeof s.failures === "string" || typeof s.failures === "number")
        periodFailures.value = s.failures;
      if (Array.isArray(s.rows) && s.rows.length) {
        const el = document.getElementById(periodGridId);
        // limpa e re-adiciona
        el.dispatchEvent(new CustomEvent("gridclearall")); // opcional
      }
    },
  };
}
