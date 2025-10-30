# Requisitos — dre-core (EARS)

Contexto: O módulo `dre-core` recebe um `dre.json` produzido pelo simulador com estrutura básica `{ periodo, moeda, totais, porConta[] }`. O objetivo é validar, normalizar, recalcular totais/margens e retornar um `dre_core.json` padronizado. Em caso de entrada inválida, responder com erro claro (HTTP 400).

## Léxico e Convenções
- Periodicidade: `periodo` no formato `YYYY-MM` (ex.: `2025-01`).
- Moeda: `moeda` é código ISO-4217 (ex.: `BRL`).
- Valores monetários: aceitos como número (ponto decimal) ou string de moeda; strings serão normalizadas para número decimal (ex.: `"R$ 10.000,50" -> 10000.50`).
- Sinal de valores: receitas positivas; deduções, custos, despesas, impostos podem ser negativos no item, mas totais serão calculados por fórmulas explícitas.

## Entradas (EARS)
- Quando o sistema receber um JSON com `schemaVersion`, `periodo`, `moeda`, `totais`, `porConta[]`, então deve validar presença e tipos obrigatórios.
- Quando `periodo` não estiver no formato `YYYY-MM`, então deve rejeitar com erro 400 e detalhe do campo.
- Quando `moeda` não for um código ISO-4217 suportado, então deve rejeitar com erro 400.
- Quando `porConta[]` contiver itens sem `{ id, nome, grupo, valor }`, então deve rejeitar com erro 400 listando os itens inválidos.
- Quando `valor` vier como string de moeda, então deve normalizar para número decimal, respeitando separadores locais.
- Quando `grupo` não pertencer ao conjunto permitido, então deve rejeitar com erro 400.

Grupos permitidos:
- `receita` (receitas brutas)
- `deducao` (impostos/descontos sobre vendas)
- `custo` (COGS/serviços)
- `despesa` (OPEX: marketing, G&A etc.)
- `outras` (outras receitas/despesas operacionais)
- `imposto` (IR/CSLL ou equivalente)

## Processamento
- Quando o JSON for válido, então o sistema deve:
  - Normalizar todos os valores monetários para número (`number`, precisão dupla), padronizando duas casas em exibição.
  - Recalcular totais a partir de `porConta[]` por fórmulas canônicas:
    - `receitaBruta` = soma(grupo=`receita`).
    - `deducoes` = soma(abs(valor) para grupo=`deducao`) com sinal positivo na composição; no item, o valor pode vir negativo.
    - `receitaLiquida` = `receitaBruta` - `deducoes`.
    - `custoProdutosServicos` = soma(abs(valor) para grupo=`custo`).
    - `lucroBruto` = `receitaLiquida` - `custoProdutosServicos`.
    - `despesasOperacionais` = soma(abs(valor) para grupo=`despesa`).
    - `resultadoOperacional` = `lucroBruto` - `despesasOperacionais`.
    - `outrasReceitasDespesas` = soma(valor para grupo=`outras`) [pode ser positivo ou negativo].
    - `resultadoAntesIR` = `resultadoOperacional` + `outrasReceitasDespesas`.
    - `impostoRenda` = soma(abs(valor) para grupo=`imposto`).
    - `resultadoLiquido` = `resultadoAntesIR` - `impostoRenda`.
  - Calcular margens (% sobre receita líquida; se `receitaLiquida == 0`, margens = 0):
    - `margemBruta` = `lucroBruto` / `receitaLiquida`.
    - `margemOperacional` = `resultadoOperacional` / `receitaLiquida`.
    - `margemLiquida` = `resultadoLiquido` / `receitaLiquida`.
  - Arredondamento: valores monetários e margens arredondados a 2 casas decimais, sem acumular erros (round half away from zero).

## Saída (dre_core.json)
Estrutura padronizada:
```
{
  "schemaVersion": 1,
  "periodo": "YYYY-MM",
  "moeda": "BRL",
  "totais": {
    "receitaBruta": number,
    "deducoes": number,
    "receitaLiquida": number,
    "custoProdutosServicos": number,
    "lucroBruto": number,
    "despesasOperacionais": number,
    "resultadoOperacional": number,
    "outrasReceitasDespesas": number,
    "resultadoAntesIR": number,
    "impostoRenda": number,
    "resultadoLiquido": number
  },
  "margens": {
    "margemBruta": number,
    "margemOperacional": number,
    "margemLiquida": number
  },
  "porConta": [ { id, nome, grupo, valor: number } ],
  "quality": {
    "warnings": string[],
    "checks": { "schemaValidated": boolean, "totaisRecalculados": boolean }
  }
}
```

## Erros (HTTP 400)
Formato padronizado:
```
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Entrada inválida",
    "details": [ { "path": "totais.receitaBruta", "expected": "number", "got": "string" } ]
  }
}
```

## Critérios de Aceite
- Dado `dre-baseline.json`, quando processado, então os totais e margens recalculados devem corresponder às fórmulas e ao sinal definido.
- Dadas amostras otimista e pessimista, quando processadas, então a normalização de moeda em string produz valores numéricos corretos e coerentes.
- Dado JSON com campo faltante (`periodo`, `moeda`, `porConta`), então retorna 400 com `details` apontando o `path` exato.
- Dado `moeda` inválida (ex.: `BR$`), então retorna 400.
- Dado `grupo` fora do permitido, então retorna 400 listando os índices afetados.

