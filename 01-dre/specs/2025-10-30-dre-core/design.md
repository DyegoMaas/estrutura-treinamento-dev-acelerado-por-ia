# Design — Contexto, C4 e Sequências

## Contexto do Sistema

```mermaid
flowchart LR
  Simulador([Simulador DRE]) -- envia dre.json --> DRECore[(Módulo dre-core)]
  DRECore -- dre_core.json padronizado --> Consumidores[(FP&A/Produtos/ETL)]
  subgraph Domínio Financeiro
    DRECore
  end
```

Notas:
- Entrada: `dre.json` com `{ periodo, moeda, totais, porConta[] }`.
- Saída: `dre_core.json` com totais recalculados, margens e metadados.

## C4 — Containers (visão lógica)

```mermaid
flowchart TB
  Client[Entradas JSON] --> API[(Interface de Processamento)]
  API --> Validator[(Validador de Esquema)]
  API --> Normalizer[(Normalizador Monetário)]
  API --> Calculator[(Recalculadora de Totais/Margens)]
  Calculator --> Emitter[(Emissor de Saída padronizada)]
```

Responsabilidades:
- Validator: checa schema, tipos, domínios e sinais por grupo.
- Normalizer: converte strings monetárias BR/EN para decimais; padroniza período.
- Calculator: aplica fórmulas dos totais e margens; aplica `aliquotaIR` padrão 0,20.
- Emitter: monta `dre_core.json` e anexa `meta` (warnings, recalcMode, aliquotaIRAplicada).

## C4 — Components (módulos internos)

```mermaid
flowchart TB
  subgraph dre-core
    V[SchemaValidator]
    N[MoneyNormalizer]
    C[TotalsCalculator]
    M[MarginCalculator]
    E[ResponseBuilder]
  end
  V --> N --> C --> M --> E
```

Interfaces esperadas:
- `SchemaValidator.validate(input) -> {ok, errors[]}`
- `MoneyNormalizer.normalize(input) -> inputNormalizado + warnings[]`
- `TotalsCalculator.recalc(inputNorm) -> totaisRecalc`
- `MarginCalculator.compute(totais) -> margens`
- `ResponseBuilder.build(inputNorm, totais, margens, meta) -> dre_core.json`

## Sequências — Fluxos Críticos

1) Processamento bem‑sucedido

```mermaid
sequenceDiagram
  participant S as Simulador
  participant D as dre-core
  S->>D: POST dre.json
  D->>D: validar schema (Validator)
  D->>D: normalizar moeda/periodo (Normalizer)
  D->>D: recalcular totais (Calculator)
  D->>D: calcular margens (MarginCalculator)
  D-->>S: 200 OK + dre_core.json
```

2) Erro de validação (grupo inválido)

```mermaid
sequenceDiagram
  participant S as Simulador
  participant D as dre-core
  S->>D: POST dre.json (grupo=invalid)
  D->>D: validar schema (falha)
  D-->>S: 400 Bad Request + errors[] (code,path,message)
```

## Regras de Cálculo e Sinais
- `receita` deve ser positiva; `deducao`, `custo`, `despesa`, `imposto` devem ser negativas; `outras` pode ser positiva ou negativa.
- Totais expostos são positivos para custos/despesas (ex.: `custoProdutosServicos`, `despesasOperacionais`), com exceção de `outrasReceitasDespesas` que preserva sinal agregado.
- IR: `impostoRenda = max(0.20 * resultadoAntesIR, 0)`; parametrizável por configuração futura.

## Saída padronizada — dre_core.json (esboço)
```
{
  schemaVersion: 1,
  periodo: "YYYY-MM",
  moeda: "BRL",
  totais: {
    receitaBruta, deducoes, receitaLiquida, custoProdutosServicos,
    lucroBruto, despesasMarketing, despesasGeraisAdm, despesasOperacionais,
    resultadoOperacional, outrasReceitasDespesas, resultadoAntesIR,
    impostoRenda, resultadoLiquido
  },
  margens: {
    margemBruta, margemOperacional, margemLiquida
  },
  porConta: [ { id, nome, grupo, valor }... ],
  meta: {
    recalcMode: "recompute",
    aliquotaIRAplicada: 0.20,
    warnings: ["..."]
  }
}
```

