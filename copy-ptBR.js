// copy-ptBR.js — textos completos e explicativos (pt-BR)
// Mantém as mesmas exports usadas pelo main.js:
// INTRO_TECH_HTML, MTBF_TEXT_HTML, MTTR_TEXT_HTML, AVAIL_TEXT_HTML

export const INTRO_TECH_HTML = `
  <h2>O que são MTBF, MTTR e Disponibilidade?</h2>

  <p>
    Em manutenção e confiabilidade, três indicadores formam a base para decidir
    <strong>prioridades de melhoria</strong>, <strong>recursos</strong> e <strong>metas</strong>:
    <strong>MTBF</strong> (tempo médio entre falhas), <strong>MTTR</strong> (tempo médio para reparar)
    e <strong>Disponibilidade</strong> (percentual de tempo em que o ativo esteve apto a operar).
  </p>

  <div class="info-box">
    <ul>
      <li><strong>MTBF</strong> — mede o intervalo médio de operação entre uma falha e a próxima.</li>
      <li><strong>MTTR</strong> — mede quanto tempo, em média, leva para restaurar o funcionamento.</li>
      <li><strong>Disponibilidade</strong> — mede a parcela do tempo em que o ativo esteve disponível.</li>
    </ul>
  </div>

  <p>
    Você pode digitar tempos como número de horas (<code>2.5</code>) ou em formato <code>hh:mm:ss</code>
    (<code>2:30:00</code>). A calculadora converte automaticamente para horas e utiliza os dados de forma
    inteligente: quando há lista de tempos individuais, <em>prioriza o cálculo amostral</em> (mais fiel à realidade);
    quando não há, usa o <em>método agregado</em> (totais ÷ contagens).
  </p>

  <div class="note">
    <strong>Por que isso importa?</strong> Melhorar MTBF reduz a frequência de paradas; reduzir MTTR encurta a duração das paradas.
    Ambos impactam diretamente a <strong>Disponibilidade</strong> e, portanto, a capacidade de produção e o atendimento a SLAs.
  </div>

  <details>
    <summary><strong>Boas práticas de medição</strong></summary>
    <ul>
      <li>Defina o que é <em>falha</em> e o que é <em>reparo</em> (ex.: setup não é reparo; preventiva planejada é downtime planejado).</li>
      <li>Registre início e fim com a <em>mesma referência temporal</em> (reloginho único, fuso, padrão).</li>
      <li>Trate dados fora de padrão (outliers) com critério: erro de apontamento x evento legítimo raro.</li>
      <li>Não misture contextos distintos (turnos, produtos, modos de operação) sem separar as análises.</li>
    </ul>
  </details>
`;

export const MTBF_TEXT_HTML = `
  <h2>MTBF — Tempo Médio Entre Falhas</h2>

  <p>
    O MTBF responde: <strong>em média, quanto tempo o equipamento opera até a próxima falha?</strong>
    Ele ajuda a estimar a <em>confiabilidade</em> do ativo e a planejar estoques sobressalentes, planos de preventiva
    e janelas de produção.
  </p>

  <div class="formula">
    <div class="formula-title">Fórmula (método agregado)</div>
    <code>MTBF = Tempo total de operação (U) ÷ Número de falhas (N)</code>
  </div>

  <p>Exemplo (agregado): se o ativo operou <strong>600 h</strong> e teve <strong>3 falhas</strong>:</p>
  <div class="example">
    <code>MTBF = 600 ÷ 3 = 200 horas</code>
  </div>

  <div class="formula alt">
    <div class="formula-title">Fórmula (método amostral)</div>
    <code>MTBF = média dos tempos individuais entre falhas (tabela)</code>
  </div>

  <p>
    <strong>Quando usar cada um?</strong> Se você possui a lista de intervalos entre falhas (TBF) no período,
    <em>prefira o método amostral</em>. Ele aproveita a variabilidade dos dados e permite enxergar dispersão
    (mediana, desvio-padrão, etc.). Sem a lista, use o agregado (<code>U ÷ N</code>).
  </p>

  <p>Calcule por:</p>
  <ol>
    <li><strong>Método Agregado</strong> — <code>MTBF = Tempo total de operação / Nº de falhas</code>.</li>
    <li><strong>Método Amostral</strong> — média dos tempos individuais entre falhas (tabela).</li>
  </ol>

  <div class="info-box">
    <strong>Interpretação rápida:</strong> Quanto maior o MTBF, maiores são os intervalos entre falhas.
    Se o MTBF caiu, investigue causas recorrentes (pareto de falhas), condições de operação e qualidade de manutenção.
  </div>

  <details>
    <summary><strong>Passo a passo recomendado</strong></summary>
    <ol>
      <li>Defina com clareza o que conta como “falha”.</li>
      <li>Se possível, <em>liste</em> os tempos entre falhas (tabela). Caso não tenha, meça o total de operação (U) e conte as falhas (N).</li>
      <li>Revise valores inválidos ou negativos; corrija apontamentos inconsistentes.</li>
      <li>Calcule MTBF e acompanhe mediana e desvio-padrão para entender a dispersão.</li>
      <li>Faça comparações por turno, produto, linha ou condição de operação.</li>
    </ol>
  </details>

  <details>
    <summary><strong>Erros comuns</strong></summary>
    <ul>
      <li>Incluir setups ou esperas de produção como “falha” (não são).</li>
      <li>Somar preventiva planejada como downtime corretivo (distorce MTBF/Disponibilidade).</li>
      <li>Usar contagem de falhas diferente do período de operação considerado.</li>
    </ul>
  </details>
`;

export const MTTR_TEXT_HTML = `
  <h2>MTTR — Tempo Médio Para Reparo</h2>

  <p>
    O MTTR responde: <strong>em média, quanto tempo levamos para restaurar o funcionamento após uma falha?</strong>
    Ele orienta ações para reduzir tempo de indisponibilidade, como padronização, kits de reparo, treinamento e SMED.
  </p>

  <div class="formula">
    <div class="formula-title">Fórmula (método agregado)</div>
    <code>MTTR = Tempo total de reparo (R) ÷ Número de reparos (M)</code>
  </div>

  <p>Exemplo (agregado): se o total de tempo em manutenção corretiva foi <strong>16 h</strong> em <strong>5 reparos</strong>:</p>
  <div class="example">
    <code>MTTR = 16 ÷ 5 = 3,2 horas</code>
  </div>

  <div class="formula alt">
    <div class="formula-title">Fórmula (método amostral)</div>
    <code>MTTR = média dos tempos individuais de reparo (tabela)</code>
  </div>

  <p>
    <strong>Quando usar cada um?</strong> Se você possui a lista de tempos de reparo (tabela),
    <em>prefira o método amostral</em> (mostra dispersão e gargalos). Sem a lista, use o agregado (<code>R ÷ M</code>).
  </p>

  <p>Calcule por:</p>
  <ol>
    <li><strong>Método Agregado</strong> — <code>MTTR = Tempo total de reparo / Nº de reparos</code>.</li>
    <li><strong>Método Amostral</strong> — média dos tempos individuais de reparo (tabela).</li>
  </ol>

  <div class="info-box">
    <strong>Interpretação rápida:</strong> MTTR menor indica reparos mais rápidos.
    Se o MTTR aumentou, investigue esperas por peças, deslocamentos, diagnose, acessibilidade e procedimentos.
  </div>

  <details>
    <summary><strong>Passo a passo recomendado</strong></summary>
    <ol>
      <li>Registre início e fim de cada reparo (diagnose + intervenção + testes de retorno).</li>
      <li>Liste tempos individuais (quando possível) e padronize o que entra no “reparo”.</li>
      <li>Calcule média, mediana e desvio-padrão para entender variação entre equipes/turnos.</li>
      <li>Priorize causas de maior impacto (pareto) e adote melhorias (checklists, kits, treinamento).</li>
    </ol>
  </details>

  <details>
    <summary><strong>Erros comuns</strong></summary>
    <ul>
      <li>Contar esperas de produção como “reparo”.</li>
      <li>Somar preventiva planejada como corretiva.</li>
      <li>Comparar MTTRs de contextos muito diferentes sem segmentar (turno, linha, produto).</li>
    </ul>
  </details>
`;

export const AVAIL_TEXT_HTML = `
  <h2>Disponibilidade</h2>

  <p>
    A disponibilidade mostra <strong>qual porcentagem do tempo o ativo esteve realmente disponível para operar</strong>.
    Ela pode ser estimada a partir de MTBF e MTTR (cenários e planejamento) ou observada diretamente em um período específico.
  </p>

  <h3>1) Disponibilidade estimada (a partir de MTBF e MTTR)</h3>
  <div class="formula">
    <div class="formula-title">Fórmula</div>
    <code>Disponibilidade ≈ MTBF ÷ (MTBF + MTTR)</code>
  </div>

  <p>Exemplo: com <strong>MTBF = 200 h</strong> e <strong>MTTR = 2 h</strong>:</p>
  <div class="example">
    <code>Disponibilidade ≈ 200 ÷ (200 + 2) = 0,990 → 99,0%</code>
  </div>

  <div class="note">
    <strong>Uso:</strong> comparar estratégias de melhoria (aumentar MTBF, reduzir MTTR), simular cenários e metas.
    É uma <em>aproximação média</em> — não substitui a medição real do período.
  </div>

  <h3>2) Disponibilidade observada em um período</h3>
  <p>
    Considere um período total <strong>T</strong>, o <strong>downtime</strong> total por reparo <strong>D</strong>
    e o <strong>uptime</strong> <strong>U</strong> (tempo disponível).
  </p>

  <div class="formula alt">
    <div class="formula-title">Fórmulas equivalentes</div>
    <code>Disponibilidade (período) = U ÷ T = 1 − (D ÷ T)</code>
  </div>

  <p>Exemplo: em <strong>T = 720 h</strong> (30 dias), com downtime <strong>D = 12 h</strong>:</p>
  <div class="example">
    <code>Disponibilidade = 1 − (12 ÷ 720) = 0,9833 → 98,33%</code>
  </div>

  <div class="info-box">
    <strong>Qual usar?</strong>
    <ul>
      <li><em>Estimada</em>: quando planeja/avalia cenários (pressupõe comportamento médio).</li>
      <li><em>Observada</em>: quando tem dados reais do período (mais fiel, considera transientes e variações).</li>
    </ul>
  </div>

  <details>
    <summary><strong>Passo a passo recomendado</strong></summary>
    <ol>
      <li>Defina o período <strong>T</strong> de análise (ex.: mês, semana, turno).</li>
      <li>Se possível, liste os <strong>tempos de reparo</strong> do período e some para obter <strong>D</strong>.</li>
      <li>Sem a lista, informe diretamente o downtime total <strong>D</strong>.</li>
      <li>Se nada disso for possível, como aproximação, use <strong>nº de falhas × MTTR</strong> para estimar <strong>D</strong>.</li>
      <li>Calcule <code>U = T − D</code> e a disponibilidade <code>U ÷ T</code>.</li>
    </ol>
  </details>

  <details>
    <summary><strong>Erros comuns</strong></summary>
    <ul>
      <li>Somar preventiva planejada dentro do downtime corretivo (compromete comparações).</li>
      <li>Medir T, D e U em referências de tempo diferentes.</li>
      <li>Usar MTBF/MTTR de linhas diferentes para estimar a disponibilidade de uma linha específica.</li>
    </ul>
  </details>
`;
