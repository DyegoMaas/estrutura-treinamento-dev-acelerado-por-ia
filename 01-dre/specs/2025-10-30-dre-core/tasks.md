# Plano de Tarefas — dre-core

## Épico
Implementar módulo `dre-core` para validar, normalizar e recalcular DRE a partir de `dre.json`, retornando `dre_core.json` padronizado com margens, e erros 400 em entradas inválidas.

## Itens (PO-style)
1) Esqueleto do módulo
   - Criar pasta `dre-core/` e entry-point (ex.: `index.(ts|js|py)` conforme stack do projeto).
   - Definir tipos/contratos de entrada e saída.

2) Validação de esquema
   - Verificar `schemaVersion`, `periodo (YYYY-MM)`, `moeda (ISO-4217)`, `porConta[]` com `{id,nome,grupo,valor}`.
   - Implementar coleção de erros com `path` e `expected/got`.

3) Normalização de moeda → número
   - Converter strings de moeda para número decimal preservando sinal.
   - Padronizar `porConta[].valor` numérico.

4) Engine de totais
   - Implementar funções de soma por grupo e fórmulas canônicas.
   - Arredondamento e tolerância numérica.

5) Cálculo de margens
   - Calcular margens sobre receita líquida; proteger divisão por zero.

6) Construção do `dre_core.json`
   - Montar estrutura padronizada, incluir `quality.checks` e `warnings`.

7) Tratamento de erros 400
   - Mapear `ValidationResult` para payload de erro padronizado.

8) Testes com amostras
   - Baseline: `dre-baseline.json` (existente no repositório).
   - Otimista/Pessimista: criar `dre-otimista.json`, `dre-pessimista.json` cobrindo strings de moeda e sinais.
   - Casos negativos: `periodo` inválido, `moeda` inválida, `grupo` fora da lista, item incompleto.

9) (Opcional) CLI utilitária
   - Script `agent-scripts/dre-core-validate.sh` para processar um arquivo e imprimir saída/erros.

## Entregáveis
- Código do módulo `dre-core` + testes de unidade.
- Três amostras válidas (baseline/otimista/pessimista) + casos inválidos.
- Scripts auxiliares (opcional) no diretório `agent-scripts/`.

## Aceite
- Todos os Quality Gates em `decisions.md` atendidos.
- Testes passando para as três amostras e cenários negativos.

