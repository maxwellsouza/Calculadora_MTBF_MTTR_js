<p align="center">
  <img src="https://img.shields.io/badge/JS-ESModules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000" />
  <img src="https://img.shields.io/badge/Grid.js-Editable%20Tables-3772FF?style=for-the-badge" />
  <img src="https://img.shields.io/badge/UI-Pastel%20%2B%20AMOLED-FFC8DD?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-2ecc71?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Responsive-Mobile%20First-6a82fb?style=for-the-badge&logo=android&logoColor=white" />
  <img src="https://img.shields.io/badge/Static-100%25%20Frontend-9b59b6?style=for-the-badge" />
</p>

<br />

# 📊 Calculadoras de MTBF, MTTR e Disponibilidade  
**Interface Ultra-Clean • JavaScript ESM • Grid.js • Responsivo • Tema Pastel + Dark AMOLED**

Este projeto oferece três calculadoras técnicas totalmente interativas — **MTBF**, **MTTR** e **Disponibilidade** — desenvolvidas com **JavaScript modular (ESM)**, interface **clean pastel**, grids editáveis usando **Grid.js**, textos explicativos completos e experiência de uso responsiva.

É uma ferramenta ideal para profissionais de **Confiabilidade, Manutenção, Engenharia, Facilities, Produção e Operações**.

---

# ✨ Funcionalidades

✅ **Interface Pastel Ultra-Clean**  
✅ **Modo Escuro AMOLED (preto real)**  
✅ **Layout responsivo e mobile-first**  
✅ **Três calculadoras completas**  
✅ **Grids editáveis com validação automática**  
✅ **Conversão automática de hh:mm:ss → horas**  
✅ **Método Amostral e Método Agregado**  
✅ **Autosave via localStorage**  
✅ **Arquitetura modular (ESM)**  
✅ **Fácil expansão e manutenção**

---

# 📐 Indicadores Suportados

### **MTBF — Mean Time Between Failures**
Tempo médio entre falhas → mede **confiabilidade**.

### **MTTR — Mean Time To Repair**
Tempo médio de reparo → mede **manutenibilidade**.

### **Disponibilidade**
Percentual de tempo operacional  
- **Estimado** (MTBF/MTTR)  
- **Observado** (período real)  
- **Estimado por nº de falhas**  

Todos os textos explicativos estão em `copy-ptBR.js`.

---

# 📁 Estrutura do Projeto

/
├── index.html
├── styles.css
├── copy-ptBR.js
└── src/
├── utils.js
├── grid.js
├── calculators.js
├── ui.js
└── main.js


### 🧩 Descrição dos módulos

| Arquivo          | Função Principal                         |
| ---------------- | ---------------------------------------- |
| `utils.js`       | Parsers, estatísticas, debounce, storage |
| `grid.js`        | Criação/validação dos grids (Grid.js)    |
| `calculators.js` | Lógica MTBF, MTTR e Disponibilidade      |
| `ui.js`          | Abas, animações, modo claro/escuro       |
| `main.js`        | Orquestra tudo                           |
| `copy-ptBR.js`   | Conteúdo técnico e textos exibidos       |

---
