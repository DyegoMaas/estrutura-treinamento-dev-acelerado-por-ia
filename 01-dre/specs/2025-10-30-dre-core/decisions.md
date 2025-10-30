# decisions.md — dre-core

## 0‑A (Elicitação Adaptativa) — Perguntas Críticas
1) Estrutura exata de `porConta[]`: Quais campos mínimos? (suposição: `codigo` (string), `descricao` (string), `grupo` (enum: receita|deducao|custo|despesa|imposto|outros), `valor` (string|number)).
2) Política de normalização monetária: Representar valores em decimal (duas casas) ou inteiro em centavos? Arredondamento: half‑up (comercial) ou bankers? (suposição: decimal com 2 casas; arredondamento half‑up).
3) Fórmulas de totais e margem: Quais campos obrigatórios em `totais` e como derivar? (suposição: `receitaLiquida = receitaBruta - deducoes`; `lucroBruto = receitaLiquida - custo`; `lucroOperacional = lucroBruto - despesas`; `lucroLiquido = lucroOperacional - impostos`; `margemLiquida = lucroLiquido / receitaLiquida`).

Classificação: Todas Non‑blocking se confirmadas rapidamente; caso contrário, bloquear Gate 1/3.

Suposições (propostas até confirmação):
- S1: `porConta[]` possui `{codigo, descricao, grupo, valor}` e `grupo` ∈ {receita, deducao, custo, despesa, imposto, outros}.
- S2: Normalização monetária usa decimal (2 casas), separadores locais detectados (BR/US). Arredondamento: half‑up. Sinal preservado.
- S3: Fórmulas de totais: `receitaLiquida = receitaBruta - deducoes`; `lucroBruto = receitaLiquida - custo`; `lucroOperacional = lucroBruto - despesas`; `lucroLiquido = lucroOperacional - impostos`; `margemLiquida = lucroLiquido / receitaLiquida` (em % com 2 casas).

Impactos:
- Requirements: RF-2/3/4 dependem de S2/S3; RF-1 depende de S1.
- Design: componentes Calculator/MarginCalculator seguem S3.
- Tasks: Itens 3–5 assumem S2/S3.

Confidence inicial: 0.85 (85%). Solicitar confirmação do usuário para S1–S3 para avançar a ≥ 0.9.

---

## Discovery — Notas
- Sem integrações externas; processador puro.
- Amostras: baseline presente (`dre-baseline.json`); otimista/pessimista pendentes.
- Observabilidade: logs estruturados e contadores mínimos.

---

## Fórmulas e Políticas (detalhes)
- Campos esperados em `totais`: `receitaBruta`, `deducoes`, `receitaLiquida`, `custo`, `lucroBruto`, `despesas`, `lucroOperacional`, `impostos`, `lucroLiquido`.
- Recalcular sempre a partir de `porConta[]` agregada por `grupo`:
  - `receitaBruta = sum(valor where grupo=receita)`
  - `deducoes = sum(valor where grupo=deducao)` (assumidamente valores positivos; subtrair na fórmula)
  - `custo = sum(valor where grupo=custo)`
  - `despesas = sum(valor where grupo=despesa)`
  - `impostos = sum(valor where grupo=imposto)`
  - Aplicar fórmulas da seção S3 sequencialmente.
- Normalização monetária:
  - Aceitar: "R$ 1.234,56", "1.234,56", "1,234.56", "1234.56", "-500".
  - Detectar formato pelo último separador e símbolo; remover não‑numéricos pertinentes; produzir decimal (2 casas) com arredondamento half‑up.
- Erros 400 — Estrutura:
  ```json
  {
    "code": "VALIDATION_ERROR",
    "message": "Invalid dre.json",
    "details": [{"path": "porConta[3].valor", "error": "type", "expected": "string|number", "got": "object"}],
    "hint": "Corrija os campos indicados e reenvie"
  }
  ```

---

## Quality Gates
- Gate 0 — Discovery: OK (pendências S1–S3). Confidence 0.85.
- Gate 1 — Requisitos: Draft completo (requirements.md). Aguardando confirmação S1–S3. Confidence alvo ≥ 0.9.
- Gate 2 — Contexto: OK (design.md contexto).
- Gate 3 — Arquitetura: OK (C4 + sequências). Confirmações S2/S3 ainda elevam risco se divergirem.
- Gate 4 — Especificação/Tarefas: Draft tasks.md pronto.
- Gate 5 — Go/No‑Go: Aguardando confirmação do usuário para S1–S3 e amostras otimista/pessimista.

---

## Outputs consolidados por fase
Outputs da Fase 0
- Decisões iniciais documentadas; hipóteses S1–S3; Confidence 0.85
- Artefatos: requirements/design/tasks iniciados

Outputs da Fase 1
- `requirements.md` preenchido (EARS); pendências S1–S3
- Confidence alvo após confirmação ≥ 0.9

Outputs da Fase 2
- Diagrama de Contexto Mermaid
- Sem integrações externas

Outputs da Fase 3
- C4 Containers/Components e 2 sequências (feliz/erro)
- Fórmulas e políticas detalhadas (este arquivo)

---

## Ações Solicitadas ao Usuário
1) Confirmar S1 (campos mínimos de `porConta[]`) e, se necessário, listar grupos adicionais.
2) Confirmar política de valores monetários e arredondamento (S2).
3) Confirmar fórmulas/filtros para `totais` e definição de `margem(ns)` (S3).
4) Fornecer amostras otimizadas: `dre-otimista.json` e `dre-pessimista.json`, com resultados esperados de totais e margens.

