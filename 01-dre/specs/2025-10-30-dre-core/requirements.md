# Requisitos (EARS) — dre-core

## 1. Contexto
- Objetivo de negócio: Receber um `dre.json` do simulador (estrutura { periodo, totais, porConta[] }), validar e normalizar valores monetários, recalcular totais e margem, retornar um `dre_core.json` padronizado (com números e métricas coerentes), e reportar erros claros (HTTP 400) em caso de entrada inválida.
- Atores e stakeholders: Time de Produto/Finanças (consumidores do resultado), Time de Plataforma/API (integração), QA (validação com amostras baseline/otimista/pessimista).
- Restrições e políticas: Precisão monetária com regras de arredondamento consistentes; transparência de erros; compatibilidade com amostras; rastreabilidade de versões do esquema.

## 2. Requisitos Funcionais (EARS)
- RF-1 — Validação de esquema: Quando o módulo receber um `dre.json`, então o sistema deve validar a presença e tipos de `periodo`, `totais`, e `porConta[]`, incluindo campos mínimos de cada item em `porConta` (ver suposições em decisions.md) e retornar 400 com lista de violações quando inválido.
- RF-2 — Normalização monetária: Quando o `dre.json` contiver valores monetários em formato de moeda (ex.: "R$ 1.234,56", "1.234,56", "1234.56"), então o sistema deve normalizá-los para número (ver política em decisions.md) preservando sinal e magnitude, e registrar a origem de formatação (ex.: BR/US) quando inferida.
- RF-3 — Recalcular totais: Quando valores por conta forem válidos e normalizados, então o sistema deve recalcular os campos em `totais` (ver fórmulas definidas) e substituir/confirmar os valores informados, garantindo consistência.
- RF-4 — Calcular margem: Quando houver `receitaLiquida` e `lucroLiquido`/`lucroBruto` conforme fórmula definida, então o sistema deve calcular `margem` (percentual) e expor no retorno padronizado com a política de arredondamento definida.
- RF-5 — Erros claros: Quando houver entradas inválidas, então o sistema deve retornar 400 com estrutura de erro padronizada contendo: `code`, `message`, `details[]` (path JSON, erro, esperado/obtido) e `hint` (curto), para facilitar correção.
- RF-6 — Retorno padronizado: Quando a validação e o recálculo concluírem, então o sistema deve retornar `dre_core.json` padronizado contendo: `periodo`, `totais` recalculados, `porConta` normalizados, `margem`(ns), `meta` (versão do schema, data de validação, políticas de arredondamento aplicadas).
- RF-7 — Testes com amostras: Quando executado contra três amostras (baseline/otimista/pessimista), então o sistema deve validar que não há erros (para entradas válidas) e que totais e margem batem com os resultados esperados documentados.

## 3. Requisitos Não‑Funcionais
- RNF-1 — Precisão: Cálculo monetário deve usar representação que evite erro binário (ex.: decimal/configuração equivalente). Arredondamento conforme política (ver decisions.md).
- RNF-2 — Performance: Processar arquivo com até 5k contas em < 200ms em ambiente padrão (indicativo, revisável).
- RNF-3 — Observabilidade: Registrar logs estruturados de validação (contagem de erros, paths afetados) e contadores de normalizações aplicadas.
- RNF-4 — Confiabilidade: Regras determinísticas; mesma entrada → mesmo resultado.
- RNF-5 — Compatibilidade: Aceitar variações comuns de moeda (símbolo, separadores `.`/`,`), conforme política definida.

## 4. Critérios de Aceite (alto nível)
- DADO um `dre.json` válido (baseline), QUANDO processado, ENTÃO retorna 200 com `dre_core.json` onde totais e margens são coerentes com as fórmulas, e todos os valores monetários estão numéricos.
- DADO um `dre.json` com campo obrigatório ausente, QUANDO processado, ENTÃO retorna 400 com `details[]` apontando `path` e `motivo` claros.
- DADO um `dre.json` com valores monetários "R$ 1.234,56", QUANDO processado, ENTÃO os valores numéricos resultantes equivalem a 1234.56 segundo a política definida.
- DADO três amostras baseline/otimista/pessimista, QUANDO processadas, ENTÃO os totais e margens recalculados batem com os esperados do anexo de teste.

## 5. Priorização e Rastreabilidade
- IDs: RF-1..RF-7, RNF-1..RNF-5
- Mapa → `tasks.md` (_Requirements: IDs_)

