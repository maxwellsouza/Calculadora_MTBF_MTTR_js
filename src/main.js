// main.js
import {
  INTRO_TECH_HTML,
  MTBF_TEXT_HTML,
  MTTR_TEXT_HTML,
  AVAIL_TEXT_HTML,
} from "../copy-ptBR.js";
import { saveState, loadState, showEl } from "./utils.js";
import {
  setActiveTab,
  swapPanelAnim,
  applyStoredTheme,
  toggleTheme,
  attachRipple,
} from "./ui.js";
import { createTimeMetricCalc, createAvailabilityCalc } from "./calculators.js";

/**
 * @typedef {import("./calculators.js").TimeMetricCalcAPI} TimeMetricCalcAPI
 * @typedef {import("./calculators.js").AvailabilityCalcAPI} AvailabilityCalcAPI
 * @typedef {import("./calculators.js").TimeMetricSnapshot} TimeMetricSnapshot
 * @typedef {import("./calculators.js").AvailabilitySnapshot} AvailabilitySnapshot
 */

/**
 * @typedef {Object} PersistedState
 * @property {TimeMetricSnapshot} mtbf Estado salvo da calculadora de MTBF.
 * @property {TimeMetricSnapshot} mttr Estado salvo da calculadora de MTTR.
 * @property {AvailabilitySnapshot} avail Estado salvo da calculadora de disponibilidade.
 * @property {string} activeTab Identificador da aba ativa na última sessão.
 */

/**
 * Inicializa a aplicação configurando temas, abas e calculadoras MTBF/MTTR.
 * Responsável por restaurar estado salvo e disparar cálculos iniciais.
 * @returns {void}
 */
function init() {
  applyStoredTheme();
  attachRipple(document);

  const txt = document.getElementById("dynamicText");
  const secMTBF = document.getElementById("calcMTBF");
  const secMTTR = document.getElementById("calcMTTR");
  const secAV = document.getElementById("calcAvailability");

  // Abas
  const showIntro = () => {
    setActiveTab("btnIntro");
    txt.innerHTML = INTRO_TECH_HTML;
    showEl(secMTBF, false);
    showEl(secMTTR, false);
    showEl(secAV, false);
    swapPanelAnim();
  };
  const showMTBF = () => {
    setActiveTab("btnMTBF");
    txt.innerHTML = MTBF_TEXT_HTML;
    showEl(secMTBF, true);
    showEl(secMTTR, false);
    showEl(secAV, false);
    swapPanelAnim();
  };
  const showMTTR = () => {
    setActiveTab("btnMTTR");
    txt.innerHTML = MTTR_TEXT_HTML;
    showEl(secMTTR, true);
    showEl(secMTBF, false);
    showEl(secAV, false);
    swapPanelAnim();
  };
  const showAV = () => {
    setActiveTab("btnAvailability");
    txt.innerHTML = AVAIL_TEXT_HTML;
    showEl(secAV, true);
    showEl(secMTBF, false);
    showEl(secMTTR, false);
    swapPanelAnim();
  };

  document.getElementById("btnIntro").addEventListener("click", showIntro);
  document.getElementById("btnMTBF").addEventListener("click", showMTBF);
  document.getElementById("btnMTTR").addEventListener("click", showMTTR);
  document.getElementById("btnAvailability").addEventListener("click", showAV);
  document.getElementById("btnTheme").addEventListener("click", toggleTheme);

  // Calculadoras (config → fábrica)
  /** @type {TimeMetricCalcAPI} */
  const mtbf = createTimeMetricCalc({
    sectionId: "calcMTBF",
    gridMountId: "mtbfTable",
    addBtnId: "mtbfAddRow",
    clearBtnId: "mtbfClear",
    totalInputId: "mtbfTotal",
    countInputId: "mtbfFailures",
    calcBtnId: "btnCalcMTBF",
    resultOutId: "mtbfResult",
    notesId: "mtbfNotes",
    aggregateLabel: "Tempo total de operação",
    seedRows: ["210", "3:00:00", "2:45:30", "190", "215"],
  });

  /** @type {TimeMetricCalcAPI} */
  const mttr = createTimeMetricCalc({
    sectionId: "calcMTTR",
    gridMountId: "mttrTable",
    addBtnId: "mttrAddRow",
    clearBtnId: "mttrClear",
    totalInputId: "mttrTotal",
    countInputId: "mttrRepairs",
    calcBtnId: "btnCalcMTTR",
    resultOutId: "mttrResult",
    notesId: "mttrNotes",
    aggregateLabel: "Tempo total de reparo",
    seedRows: ["2.5", "3", "2:12:00", "3:06:00", "3.4"],
  });

  /** @type {AvailabilityCalcAPI} */
  const avail = createAvailabilityCalc({
    availMtbfId: "avMTBF",
    availMttrId: "avMTTR",
    steadyBtnId: "btnCalcAvailabilitySteady",
    steadyOutId: "availabilitySteadyResult",
    steadyNotesId: "availabilitySteadyNotes",
    periodTotalId: "periodTotal",
    periodDownId: "periodDown",
    periodFailuresId: "periodFailures",
    periodGridId: "periodTable",
    periodBtnId: "btnCalcAvailabilityPeriod",
    seedRows: ["02:30:00", "01:15:00", "00:45:00", "0.5", "01:00:00"],
  });

  // Autosave/restore único
  const saveAll = () =>
    saveState(
      /** @type {PersistedState} */ ({
        mtbf: mtbf.getState(),
        mttr: mttr.getState(),
        avail: avail.getState(),
        activeTab:
          document.querySelector(".tab-btn.active")?.id || "btnIntro",
      })
    );

  document.addEventListener("input", saveAll);
  document.getElementById("mtbfTable").addEventListener("gridchange", saveAll);
  document.getElementById("mttrTable").addEventListener("gridchange", saveAll);
  document
    .getElementById("periodTable")
    .addEventListener("gridchange", saveAll);

  const s = /** @type {PersistedState|null} */ (loadState());
  if (s) {
    mtbf.setState(s.mtbf);
    mttr.setState(s.mttr);
    avail.setState(s.avail);
    const tab = s.activeTab && document.getElementById(s.activeTab);
    (tab || document.getElementById("btnIntro")).click();
  } else {
    showIntro();
  }

  // Primeiro cálculo
  mtbf.calc?.();
  mttr.calc?.();
  avail.calcSteady?.();
  avail.calcPeriod?.();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
