# Decisões, Pendências e Quality Gates — dre-core

## Decisões
- Fonte da verdade dos totais: sempre recalculados a partir de `porConta[]`.
- Deduções, custos, despesas, imposto: somados por absolutos nos totais; itens podem vir negativos.
- Margens calculadas sobre receita líquida (evita distorções quando houver deduções relevantes).
- Arredondamento: 2 casas decimais, half-away-from-zero.
- Erro 400 com `details[]` granulares para múltiplas falhas simultâneas.

## Pendências / Perguntas
- Confirmar conjunto exato de moedas suportadas (todas ISO-4217 ou subset?).
- Confirmar se `schemaVersion` deve ser validado estritamente (=1) ou apenas presente.
- Confirmar se totais enviados devem ser comparados e logar `warnings` quando divergirem do recalculado.

## Quality Gates
- QG1: Validação rigorosa
  - Rejeita `periodo` fora de `YYYY-MM`.
  - Rejeita `moeda` fora da lista ISO-4217 reconhecida.
  - Rejeita `grupo` não permitido.
  - Rejeita itens sem `{id,nome,grupo,valor}`.

- QG2: Normalização consistente
  - Strings de moeda comuns convertem corretamente para `number` com sinal preservado.
  - Sem perdas significativas de precisão em montantes grandes.

- QG3: Cálculo determinístico
  - Fórmulas aplicadas conforme `design.md` com testes cobrindo trilhas principais.
  - Divisão por zero protegida; margens = 0 quando `receitaLiquida == 0`.

- QG4: Saída padronizada
  - `dre_core.json` com `schemaVersion`, `periodo`, `moeda`, `totais`, `margens`, `porConta` normalizada, `quality`.
  - Arredondamento e sinais coerentes.

- QG5: Observabilidade de qualidade
  - `quality.checks` indica `schemaValidated` e `totaisRecalculados`.
  - `quality.warnings` lista divergências relevantes (ex.: totais de entrada ≠ recalculados).

## Riscos e Mitigações
- Parsing de formatos diversos de moeda → cobrir com funções robustas e testes de borda.
- Divergências entre totais de entrada e recalculados → não falhar, mas emitir `warnings` (a menos de decisão contrária).

