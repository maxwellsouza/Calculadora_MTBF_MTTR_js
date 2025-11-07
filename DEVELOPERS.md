## Visão Geral

Aplicativo 100% front‑end (ES Modules) para calcular MTBF, MTTR e Disponibilidade. A UI é uma página estática (`index.html`) que carrega os módulos em `src/`. O grid editável usa Grid.js via CDN (global `window.gridjs`). Estado é salvo/restaurado via `localStorage`.

Principais módulos:
- `src/utils.js`: utilitários (parser de duração, estatística, formatação, debounce, storage, helpers de UI);
- `src/grid.js`: encapsula Grid.js e validação de entradas do grid;
- `src/calculators.js`: fábricas de calculadoras (MTBF/MTTR e Disponibilidade);
- `src/ui.js`: abas, animação, tema, ripple;
- `src/main.js`: inicialização, wiring de eventos, autosave/restore.

Dependências externas (CDN):
- Grid.js (UMD): stylesheet + script em `index.html`.
- Font Awesome (ícones) e Google Fonts.

Como executar: abra `index.html` no navegador. Não há build/bundler.

---

## Fluxo de Inicialização

Arquivo: `src/main.js`
- Aplica tema salvo e ripple.
- Define handlers das abas e conteúdo dinâmico.
- Cria duas instâncias de tempo (MTBF e MTTR) com `createTimeMetricCalc`.
- Cria instância de disponibilidade com `createAvailabilityCalc`.
- Configura autosave: escuta `input` e `gridchange` nas três tabelas.
- Restaura estado persistido (se existir) e ativa a última aba.
- Dispara primeiro cálculo (para preencher resultados iniciais).

Persistência (snapshot completo):
- Chave `localStorage`: `calc-mtbf-mttr-avail-v4`.
- Estrutura: ver typedef `PersistedState` em `src/main.js` e os snapshots de cada calculadora em `src/calculators.js`.

---

## Módulo: utils.js

Funções chave:
- `parseDurationToHours(token)`: aceita número decimal (ponto ou vírgula), `hh:mm:ss`, `mm:ss` ou `ss`. Retorna horas decimais ou `null` quando inválido.
- `fmt(n, d=3)` / `fmtPct(x, d=2)`: formatação pt‑BR (usa `toLocaleString`).
- Estatística: `sum`, `mean`, `median`, `stdev` (populacional quando há >1 amostras).
- `debounce(fn, ms=120)`: atraso simples para eventos de input/DOM.
- Storage: `saveState(obj)` e `loadState()` com try/catch defensivo.
- UI: `showEl(el, show)` e `escapeAttr(v)`.

Notas:
- Se alterar a semântica do snapshot salvo, incremente o sufixo da chave (`...-vN`) para evitar conflitos.

---

## Módulo: grid.js

Objetivo: encapsular Grid.js e expor uma API mínima p/ a app.

APIs exportadas:
- `applyValidation(container)`: valida inputs `.gjs-input`, aplica classes `valid`/`invalid` e `aria-invalid` em cada campo; retorna `true` se existe algum inválido não vazio.
- `mkDurationGrid(mountEl, initialData=[])`: monta o grid e retorna:
  - `addRow(value?)`, `clearAll()`;
  - `getValues()` (em horas decimais, somente válidos), `getRaw()` (strings);
  - `hasInvalid()` (revalida e retorna booleano).

Detalhes:
- Re-render com `grid.updateConfig({ data }).forceRender()` após mudanças.
- Eventos:
  - Input no grid: delegação + `debounce` → valida → emite `CustomEvent('gridchange')` no mount.
  - Clique em botão da linha (classe `row-del`): remove linha, re-render, valida e emite `gridchange`.

Requisitos:
- Grid.js UMD deve estar presente em `window.gridjs` (incluído no `index.html`).

---

## Módulo: calculators.js

Tipos de dados (typedefs JSDoc):
- `TimeMetricSnapshot` e `AvailabilitySnapshot`: snapshots serializáveis para persistência.
- `TimeMetricCalcAPI` e `AvailabilityCalcAPI`: APIs expostas por cada fábrica.

Fábricas:
- `createTimeMetricCalc(cfg)`
  - Prioridade amostral: se há amostras válidas no grid → calcula média/mediana/desvio.
  - Caso contrário: usa total agregado + contagem (se válidos) para média.
  - UI: mostra resultado e notas do método aplicado.
  - API: `calc()`, `getState()`, `setState(state)`.
  - Eventos: `gridchange` do grid, `input` nos campos de total/contagem e clique no botão `calc`.
  - Botões do grid: adiciona e limpa linhas (confirm) através de IDs passados pelo `main.js` (MTBF/MTTR).

- `createAvailabilityCalc(cfg)`
  - Estacionário (`calcSteady`): `A = MTBF / (MTBF + MTTR)`; valida `MTBF>0` e `MTTR>=0`.
  - Período (`calcPeriod`): prioridade dos dados:
    1) grid do período (soma downtime por linha);
    2) downtime consolidado único;
    3) estimativa via `nFalhas * MTTR(estimado)`.
  - UI: atualiza `availabilityPeriodResult` e notas com método aplicado.
  - API: `calcSteady()`, `calcPeriod()`, `getState()`, `setState()`.
  - Botões do grid do período: `periodAddBtnId` e `periodClearBtnId` (opcionais) conectam `addRow("")` e `clearAll()` com confirmação.

Observação de testes: a lógica de seleção (amostral vs agregado) pode ser extraída/exportada se desejar testes unitários diretos sem DOM.

---

## Módulo: ui.js

- Abas: `setActiveTab(btnId)`, transição `swapPanelAnim()`.
- Tema: `applyStoredTheme()`, `toggleTheme()`; usa `data-theme` no `<html>`.
- UX: `attachRipple(document)` adiciona efeito de ripple aos botões com classe `ripple`.

---

## IDs e Convenções (index.html)

- Abas: `btnIntro`, `btnMTBF`, `btnMTTR`, `btnAvailability` e painéis `calcMTBF`, `calcMTTR`, `calcAvailability`.
- MTBF: inputs `mtbfTotal`, `mtbfFailures`; grid `mtbfTable`; botões `mtbfAddRow`, `mtbfClear`, `btnCalcMTBF`.
- MTTR: inputs `mttrTotal`, `mttrRepairs`; grid `mttrTable`; botões `mttrAddRow`, `mttrClear`, `btnCalcMTTR`.
- Disponibilidade:
  - Estimada: `avMTBF`, `avMTTR`, botão `btnCalcAvailabilitySteady`, saída `availabilitySteadyResult` e notas `availabilitySteadyNotes`.
  - Período: `periodTotal`, `periodDown`, `periodFailures`, grid `periodTable`, botões `periodAddRow`, `periodClear`, botão `btnCalcAvailabilityPeriod`, saída `availabilityPeriodResult`, notas `availabilityPeriodNotes`.

---

## Persistência de Estado

- Chave: `calc-mtbf-mttr-avail-v4`.
- Estruturas:
  - `TimeMetricSnapshot`: `{ total: string, count: string|number, rows: string[] }`.
  - `AvailabilitySnapshot`: `{ mtbf: string, mttr: string, period: string, down: string, failures: string|number, rows: string[] }`.
- No `main.js`, a estrutura persistida combina os três snapshots + `activeTab`.
- Evento de salvamento: qualquer `input` global e `gridchange` de cada grid.
- Se mudar formato, incremente a versão na chave para evitar dados antigos quebrarem a UI.

---

## Testes

- Runner: `tests/runner.html` (abre no navegador).
- Harness: `tests/test-runner.js` (asserts: `assertEquals`, `assertNear`, `assertTrue`, `assertFalse`, `assertDeepEqual`).
- Cobertura inicial:
  - `tests/test-utils.js`: utilitários;
  - `tests/test-grid.js`: validação do grid (sem dependência do Grid.js UMD).
- Adicionando testes: crie `tests/test-*.js` e importe no `tests/runner.html`.

Sugestões futuras:
- Exportar uma função pura de cálculo (ex.: `calcFromGridOrAggregate`) para permitir testes da decisão amostral/agregada.

---

## Tarefas Comuns de Manutenção

- Adicionar um novo botão ao grid: crie o elemento no HTML, inclua o ID no config da fábrica e adicione o listener (seguir padrão dos existentes). Para disponibilidade, use `periodAddBtnId`/`periodClearBtnId`.
- Alterar rótulos/textos: `copy-ptBR.js` para textos explicativos; strings de UI nos módulos correspondentes.
- Ajustar validação: edite `parseDurationToHours` ou `applyValidation`.
- Atualizar dependências CDN: confira os links em `index.html` (Grid.js/FontAwesome). O UMD de Grid.js expõe `window.gridjs`.
- Incrementar seed rows: use as props `seedRows` nos construtores das calculadoras em `main.js`.

Compatibilidade/Acessibilidade:
- Classes `valid`/`invalid` e `aria-invalid` são aplicadas nos campos do grid.
- Leitores de tela recebem resultados via elementos `<output>` com `aria-live="polite"`.

Estilo/Código:
- ES Modules, sem bundler.
- JSDoc para tipos e APIs.
- Funções pequenas e puras quando possível.
- Evitar dependências externas adicionais.

---

## Depuração Rápida

- “Grid.js não encontrado”: verifique se o CDN está carregando e se o `script` UMD está presente no `index.html` (global `window.gridjs`).
- Botões do grid não funcionam: checar IDs no HTML e se estão sendo passados no config da calculadora em `main.js`.
- Nada persiste: checar permissões de `localStorage` e se a chave `calc-mtbf-mttr-avail-v4` não foi alterada.

