<h1 align="center">Calculadoras de MTBF, MTTR e Disponibilidade</h1>
<p align="center">
  <img src="https://img.shields.io/badge/JS-ESModules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000" alt="JS ESModules" />
  <img src="https://img.shields.io/badge/Grid.js-Editable%20Grids-3772FF?style=for-the-badge" alt="Grid.js" />
  <img src="https://img.shields.io/badge/Responsive-Mobile%20First-6a82fb?style=for-the-badge&logo=android&logoColor=white" alt="Responsive" />
  <img src="https://img.shields.io/badge/Static-100%25%20Frontend-9b59b6?style=for-the-badge" alt="Static" />
  <img src="https://img.shields.io/badge/Tests-Browser--based-2F855A?style=for-the-badge" alt="Tests" />
  <img src="https://img.shields.io/badge/License-MIT-2ecc71?style=for-the-badge" alt="MIT License" />
</p>

Aplicativo 100% front‑end (ES Modules) para cálculos de MTBF, MTTR e Disponibilidade. Interface responsiva, grids editáveis com validação e textos explicativos. Sem build/bundler: basta abrir no navegador.

— Live Preview: https://maxwellsouza.github.io/Calculadora_MTBF_MTTR_js/

## Recursos

- Três calculadoras: MTBF, MTTR e Disponibilidade (estimada e por período)
- Grids editáveis (Grid.js) com validação visual e ARIA
- Conversão automática de hh:mm:ss para horas decimais
- Dois métodos: amostral (grid) e agregado (total/contagem)
- Modo escuro (AMOLED) e tema pastel
- Autosave via localStorage (recupera sessão)
- Arquitetura modular (ESM) e fácil manutenção

## Como usar

- Abra `index.html` no seu navegador.
- Navegue nas abas para selecionar a calculadora.
- Preencha os campos ou edite as linhas do grid. Os resultados e notas são atualizados automaticamente ou via botão “Calcular”.

Observações:
- O grid do período (Disponibilidade) aceita linhas de downtime individuais; ao informar o grid, ele tem prioridade sobre o downtime total único.
- Os dados persistem localmente na chave `calc-mtbf-mttr-avail-v4` do `localStorage`.

## Tecnologias

- JavaScript ES Modules (navegador)
- Grid.js (via CDN UMD)
- Font Awesome (ícones) e Google Fonts

## Estrutura do projeto

```
.
├─ index.html         # Página principal (UI + CDN)
├─ styles.css         # Estilos (light/dark, responsivo)
├─ copy-ptBR.js       # Conteúdo técnico e textos de apoio
├─ src/
│  ├─ utils.js        # Parsers, estatística, formatação, debounce, storage, helpers de UI
│  ├─ grid.js         # Integração com Grid.js e validação dos inputs do grid
│  ├─ calculators.js  # Lógica das calculadoras (MTBF/MTTR/Disponibilidade)
│  ├─ ui.js           # Abas, tema, ripple e transições
│  └─ main.js         # Bootstrap, autosave/restore, wiring de eventos
└─ tests/
   ├─ test-runner.js  # Mini harness de testes (browser)
   ├─ test-utils.js   # Testes de utilitários
   ├─ test-grid.js    # Testes de validação do grid
   └─ runner.html     # Página para executar os testes
```

## Testes

- Execute em `tests/runner.html` (abra no navegador).
- Cobertura inicial: utilitários (`src/utils.js`) e validação do grid (`applyValidation` em `src/grid.js`).
- Para adicionar testes: crie `tests/test-*.js` e importe em `tests/runner.html`.

Exemplo:

```js
// tests/test-exemplo.js
import { test, assertEquals } from './test-runner.js';
import { sum } from '../src/utils.js';

test('sum soma elementos', () => {
  assertEquals(sum([1,2,3]), 6);
});
```

## Acessibilidade & UX

- Entradas do grid recebem `valid`/`invalid` e `aria-invalid` conforme a validação.
- Resultados são apresentados em elementos `<output>` com `aria-live="polite"`.
- Animações discretas e foco em legibilidade.

## Manutenção e Extensão

- IDs dos elementos estão centralizados no `index.html` e passados via config nas fábricas das calculadoras.
- Para o grid de disponibilidade por período, botões `periodAddRow`/`periodClear` são conectados à API do grid.
- Guia completo para devs (arquitetura, fluxos, APIs, persistência, dicas): consulte `DEVELOPERS.md`.

## Licença

MIT.
