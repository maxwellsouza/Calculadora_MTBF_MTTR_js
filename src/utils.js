// utils.js
/**
 * Converte tokens numéricos ou em formato hh:mm:ss para horas decimais.
 * @param {string|number|null|undefined} token Valor bruto informado pelo usuário.
 * @returns {number|null} Horas decimais válidas ou null quando a entrada é inválida.
 */
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

/**
 * Formata um número em pt-BR com casas decimais configuráveis.
 * @param {number} n Valor numérico a ser formatado.
 * @param {number} [d=3] Quantidade de casas decimais exibidas.
 * @returns {string} Representação formatada do número.
 */
export const fmt = (n, d = 3) =>
  Number(n).toLocaleString("pt-BR", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

/**
 * Soma os valores de um array numérico.
 * @param {number[]} a Lista de números.
 * @returns {number} Soma acumulada.
 */
export const sum = (a) => a.reduce((x, y) => x + y, 0);

/**
 * Calcula a média aritmética de um conjunto.
 * @param {number[]} a Lista de números.
 * @returns {number} Média ou NaN para lista vazia.
 */
export const mean = (a) => (a.length ? sum(a) / a.length : NaN);

/**
 * Obtém a mediana de um conjunto numérico.
 * @param {number[]} a Lista de números.
 * @returns {number} Mediana ou NaN para lista vazia.
 */
export const median = (a) => {
  if (!a.length) return NaN;
  const b = [...a].sort((x, y) => x - y);
  const m = Math.floor(b.length / 2);
  return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
};

/**
 * Calcula o desvio padrão (populacional) de um conjunto numérico.
 * @param {number[]} a Lista de números.
 * @returns {number} Desvio padrão ou 0 quando não há amostras suficientes.
 */
export const stdev = (a) => {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(mean(a.map((x) => (x - m) ** 2)));
};

/**
 * Retorna uma função "debounced" que aguarda antes de executar a original.
 * @template {(...args: any[]) => void} F
 * @param {F} fn Função original a ser controlada.
 * @param {number} [ms=120] Tempo de espera em milissegundos.
 * @returns {F} Função com atraso controlado.
 */
export const debounce = (fn, ms = 120) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

// storage (um único namespace)
const LS_KEY = "calc-mtbf-mttr-avail-v4";
/**
 * Persiste o estado das calculadoras no {@link localStorage}.
 * @template T
 * @param {T} state Snapshot serializável do estado atual.
 * @returns {void}
 */
export const saveState = (state) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {}
};
/**
 * Recupera o estado salvo das calculadoras.
 * @template T
 * @returns {T|null} Objeto armazenado ou null se inexistente.
 */
export const loadState = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// helpers UI
/**
 * Formata frações como percentual.
 * @param {number} x Fração (0-1) a ser convertida.
 * @param {number} [d=2] Casas decimais do percentual.
 * @returns {string} Percentual formatado.
 */
export const fmtPct = (x, d = 2) => fmt(x * 100, d) + "%";

/**
 * Controla visibilidade de elementos com classes utilitárias.
 * @param {HTMLElement} el Elemento a ser exibido ou ocultado.
 * @param {boolean} show Define se o elemento fica visível.
 * @returns {void}
 */
export const showEl = (el, show) => {
  el.classList.toggle("hidden", !show);
  el.setAttribute("aria-hidden", show ? "false" : "true");
};

/**
 * Escapa valores para uso seguro em atributos HTML.
 * @param {unknown} v Valor bruto.
 * @returns {string} Valor sanitizado.
 */
export const escapeAttr = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/\"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
