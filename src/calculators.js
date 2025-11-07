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

/**
 * @typedef {Object} CalcData
 * @property {number[]} list Lista de tempos válidos informados nas linhas do grid.
 * @property {number|null} total Tempo agregado informado no formulário auxiliar.
 * @property {number} count Quantidade de ocorrências usadas no cálculo agregado.
 */

/**
 * @typedef {"amostral"|"agregado"} CalcMethod
 */

/**
 * @typedef {Object} CalcSuccess
 * @property {CalcMethod} method Estratégia aplicada para produzir o resultado.
 * @property {number} mean Valor médio calculado em horas.
 * @property {number} [median] Mediana das amostras quando disponíveis.
 * @property {number} [stdev] Desvio-padrão das amostras quando disponíveis.
 * @property {number} [n] Número de amostras processadas.
 */

/**
 * @typedef {Object} CalcError
 * @property {string} error Mensagem explicando o motivo da falha.
 */

/**
 * @typedef {CalcSuccess|CalcError} CalcOutcome
 */

/**
 * @typedef {Object} TimeMetricSnapshot
 * @property {string} total Texto informado no campo de tempo agregado.
 * @property {string|number} count Valor numérico ou textual do campo de ocorrências.
 * @property {string[]} rows Linhas persistidas do grid de tempos individuais.
 */

/**
 * @typedef {Object} TimeMetricCalcAPI
 * @property {() => void} calc Força o recálculo manual da métrica.
 * @property {() => TimeMetricSnapshot} getState Serializa o estado atual da calculadora.
 * @property {(state: TimeMetricSnapshot|null|undefined) => void} setState Restaura valores previamente salvos.
 */

/**
 * @typedef {Object} TimeMetricCalcConfig
 * @property {string} sectionId ID da seção que abriga os controles da calculadora.
 * @property {string} gridMountId ID do contêiner onde o grid será montado.
 * @property {string} addBtnId ID do botão que adiciona novas linhas.
 * @property {string} clearBtnId ID do botão que limpa as linhas.
 * @property {string} totalInputId ID do campo de tempo total agregado.
 * @property {string} countInputId ID do campo de contagem de eventos.
 * @property {string} calcBtnId ID do botão de cálculo manual.
 * @property {string} resultOutId ID do campo que recebe o resultado textual.
 * @property {string} notesId ID do contêiner para observações sobre o método.
 * @property {string} aggregateLabel Texto usado ao descrever o método agregado.
 * @property {string[]} [seedRows] Linhas iniciais para popular o grid.
 */

/**
 * @typedef {Object} AvailabilitySnapshot
 * @property {string} mtbf Valor do campo MTBF persistido.
 * @property {string} mttr Valor do campo MTTR persistido.
 * @property {string} period Período total utilizado nos cálculos.
 * @property {string} down Tempo de indisponibilidade consolidado.
 * @property {string|number} failures Quantidade de falhas informada.
 * @property {string[]} rows Linhas persistidas do grid de downtime.
 */

/**
 * @typedef {Object} AvailabilityCalcAPI
 * @property {() => void} calcSteady Executa o cálculo estacionário.
 * @property {() => void} calcPeriod Executa o cálculo referente a um período.
 * @property {() => AvailabilitySnapshot} getState Serializa valores de todos os campos.
 * @property {(state: AvailabilitySnapshot|null|undefined) => void} setState Restaura um snapshot salvo.
 */

/**
 * @typedef {Object} AvailabilityCalcConfig
 * @property {string} availMtbfId ID do input de MTBF para estimativas.
 * @property {string} availMttrId ID do input de MTTR para estimativas.
 * @property {string} steadyBtnId ID do botão de cálculo estacionário.
 * @property {string} steadyOutId ID do campo com o resultado estacionário.
 * @property {string} steadyNotesId ID do elemento que mostra observações.
 * @property {string} periodTotalId ID do input de tempo total do período.
 * @property {string} periodDownId ID do input de downtime consolidado.
 * @property {string} periodFailuresId ID do input de falhas contabilizadas.
 * @property {string} periodGridId ID do grid com tempos de parada.
 * @property {string} periodBtnId ID do botão de cálculo por período.
 * @property {string[]} [seedRows] Amostras iniciais de downtime.
 */

/**
 * Seleciona a estratégia de cálculo com base nos dados fornecidos.
 * Dá prioridade a dados amostrais válidos, caindo para totais agregados.
 * @param {CalcData} params Coleção de dados disponíveis.
 * @returns {CalcOutcome} Resultado processado com metadados do cálculo ou mensagem de erro.
 */
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
/**
 * Cria a calculadora de métricas temporais (MTBF/MTTR) com integração ao grid.
 * @param {TimeMetricCalcConfig} cfg Configuração de elementos e mensagens da interface.
 * @returns {TimeMetricCalcAPI} API simplificada para integração com o módulo principal.
 */
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

  /**
   * Recalcula a métrica escolhendo entre dados amostrais ou agregados.
   * Atualiza campos de resultado e notas na interface.
   * @returns {void}
   */
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

/**
 * Instancia a calculadora de disponibilidade combinando estimativas e medições.
 * @param {AvailabilityCalcConfig} cfg Configuração de elementos HTML utilizados.
 * @returns {AvailabilityCalcAPI} API para interação com o ciclo de autosave/restauração.
 */
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

  /**
   * Calcula a disponibilidade estacionária via fórmula MTBF/(MTBF+MTTR).
   * @returns {void}
   */
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

  /**
   * Calcula disponibilidade para um período usando prioridades (grid, total, falhas).
   * Atualiza o resumo com o método aplicado.
   * @returns {void}
   */
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
      if (Array.isArray(s.rows)) {
        periodGrid.clearAll();
        s.rows.forEach((v) => periodGrid.addRow(String(v)));
      }
    },
  };
}
