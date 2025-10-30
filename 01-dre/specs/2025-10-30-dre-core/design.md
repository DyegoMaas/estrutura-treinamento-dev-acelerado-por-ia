# Design — dre-core

## Contexto e Limites
O `dre-core` é um processador puro de DRE que recebe um `dre.json` do simulador, valida/normaliza os dados financeiros, recalcula totais e margens e retorna um `dre_core.json` padronizado. Não persiste estado e não integra fontes externas.

## Diagrama de Contexto (Mermaid)
```mermaid
flowchart LR
  Simulador[[Simulador]] -->|dre.json| Core[(dre-core)]
  Core -->|dre_core.json| Consumidor[[API/Serviço Consumidor]]
  Core -.->|Erros 400| Consumidor
```

## C4 — Containers (alto nível)
```mermaid
flowchart TB
  subgraph ConsumerSide[Consumidor]
    API[API/Serviço] 
  end
  subgraph Processing[dre-core]
    Validator[Schema Validator]
    Normalizer[Currency Normalizer]
    Calculator[Totals & Margin Calculator]
    Formatter[Output Formatter]
    ErrorBuilder[Error Builder]
  end
  Simu[Simulador] -->|dre.json| Validator
  Validator --> Normalizer
  Normalizer --> Calculator
  Calculator --> Formatter
  Validator -.-> ErrorBuilder
  Normalizer -.-> ErrorBuilder
  API -->|chama| Formatter
```

## C4 — Components (dentro do dre-core)
```mermaid
flowchart LR
  Input[Input Parser] --> SchemaValidator
  SchemaValidator --> CurrencyNormalizer
  CurrencyNormalizer --> RulesEngine
  RulesEngine --> TotalsCalculator
  TotalsCalculator --> MarginCalculator
  MarginCalculator --> OutputAssembler
  SchemaValidator -.-> ErrorCollector
  CurrencyNormalizer -.-> ErrorCollector
  RulesEngine -.-> ErrorCollector
  ErrorCollector --> OutputAssembler
```

## Sequência — Caminho Feliz
```mermaid
sequenceDiagram
  participant S as Simulador
  participant C as Consumidor
  participant D as dre-core
  S->>D: POST dre.json
  D->>D: Validar esquema
  D->>D: Normalizar valores monetários
  D->>D: Recalcular totais
  D->>D: Calcular margem(ns)
  D-->>C: 200 dre_core.json
```

## Sequência — Erro de Validação
```mermaid
sequenceDiagram
  participant S as Simulador
  participant C as Consumidor
  participant D as dre-core
  S->>D: POST dre.json
  D->>D: Validar esquema
  D-->>C: 400 {code,message,details[],hint}
```

## Regras/Políticas (resumo)
- Schema mínimo (ver decisions.md) para `periodo`, `totais` e itens de `porConta[]`.
- Política de normalização: aceitar variações BR/US (símbolo, separadores); valores resultam numéricos.
- Fórmulas de totais/margem: ver decisões e fórmulas definidas em `decisions.md`.
- Arredondamento: consistente e documentado em `decisions.md`.

