# Requisitos (EARS)

## 1. Contexto
- Objetivo de negócio: padronizar o processamento do DRE (Demonstração de Resultados) gerado pelo simulador para consumo consistente por outras partes do sistema, com validação robusta, normalização de valores monetários, recálculo confiável de totais e margens e erros claros para entradas inválidas.
- Atores e stakeholders: times de Finanças/FP&A, engenharia de dados, times de produto que consomem indicadores (margens, totais) e integradores do simulador.
- Restrições e políticas: entradas seguem `dre.json` com estrutura mínima `{ periodo, moeda, totais, porConta[] }`. Moeda deve ser ISO‑4217 (ex.: BRL). Não depender de conectividade externa. Logs estruturados e mensagens de erro claras em PT‑BR.

## 2. Requisitos Funcionais (EARS)
- Quando o sistema receber um `dre.json` válido, então deve validar a presença dos campos obrigatórios `periodo`, `moeda`, `porConta` e `totais` e seus tipos esperados.
- Quando `periodo` estiver no formato `YYYY-MM`, então o sistema deve aceitar; caso contrário, deve rejeitar com erro 400 e mensagem clara.
- Quando `moeda` for um código ISO‑4217 válido, então o sistema deve aceitar; caso contrário, deve rejeitar com erro 400 e mensagem clara.
- Quando `porConta[].valor` vier como string monetária (ex.: "R$ 10.000,00"), então o sistema deve normalizar para número decimal em unidade da moeda (ex.: 10000.00) respeitando separadores BR/PT e EN.
- Quando `porConta[].grupo` estiver fora do conjunto permitido {`receita`, `deducao`, `custo`, `despesa`, `outras`, `imposto`}, então o sistema deve rejeitar com erro 400 e mensagem clara.
- Quando houver sinais inconsistentes nos lançamentos (ex.: `receita` negativa, `deducao/despesa/custo/imposto` positiva), então o sistema deve rejeitar com erro 400 e mensagem clara.
- Quando a normalização finalizar, então o sistema deve recalcular todos os totais independentemente dos valores informados em `totais`.
- Quando recalcular, então o sistema deve aplicar as fórmulas:
  - `receitaBruta = soma(grupo=receita)`
  - `deducoes = soma(|valor| para grupo=deducao)`
  - `receitaLiquida = receitaBruta - deducoes`
  - `custoProdutosServicos = soma(|valor| para grupo=custo)`
  - `lucroBruto = receitaLiquida - custoProdutosServicos`
  - `despesasMarketing = soma(|valor| para contas de despesa marcadas como marketing)`
  - `despesasGeraisAdm = soma(|valor| para outras despesas operacionais)`
  - `despesasOperacionais = despesasMarketing + despesasGeraisAdm`
  - `resultadoOperacional = lucroBruto - despesasOperacionais`
  - `outrasReceitasDespesas = soma(valor para grupo=outras)` (pode ser positivo ou negativo)
  - `resultadoAntesIR = resultadoOperacional + outrasReceitasDespesas`
  - `impostoRenda = max(aliquotaIR * resultadoAntesIR, 0)` com `aliquotaIR` padrão 0,20
  - `resultadoLiquido = resultadoAntesIR - impostoRenda`
- Quando recalcular, então o sistema deve computar margens: `margemBruta = lucroBruto/receitaLiquida`, `margemOperacional = resultadoOperacional/receitaLiquida`, `margemLiquida = resultadoLiquido/receitaLiquida` com arredondamento para 4 casas decimais; quando `receitaLiquida = 0`, margens devem ser `null` e gerar aviso.
- Quando o processamento for bem‑sucedido, então o sistema deve retornar `dre_core.json` padronizado contendo `schemaVersion`, `periodo`, `moeda`, `totais` recalculados, `margens`, `porConta` normalizado e `meta` (incluindo `warnings[]`, `aliquotaIRAplicada`, `recalcMode="recompute"`).
- Quando houver entradas inválidas, então o sistema deve retornar HTTP 400 com `errors[]` detalhando `path`, `code`, `message` e exemplos de correção.
- Quando houver divergência entre `totais` informados e recalculados, então o sistema deve ignorar os informados, registrar aviso em `meta.warnings` e sempre retornar os recalculados.

## 3. Requisitos Não‑Funcionais
- Desempenho: não aplicável neste workshop; sem metas formais (no‑op). Eventuais otimizações são nice‑to‑have.
- Segurança: não aceitar campos extras fora do esquema (modo strict); sanitizar strings; sem execução de código. Sem rede necessária.
- Observabilidade: logs estruturados por fase (validate/normalize/recalc) com métricas de duração e contagem de avisos/erros.
- Confiabilidade/Disponibilidade: determinístico; resultados idempotentes frente ao mesmo input; cobertura de testes nas 3 amostras fornecidas e em casos de erro.

## 4. Critérios de Aceite (alto nível)
- DADO `dre-baseline.json`, QUANDO processado, ENTÃO `dre_core.json` contém totais e margens conforme fórmulas, sem erros.
- DADO `dre-otimista.json`, QUANDO processado, ENTÃO `dre_core.json` reflete o aumento esperado mantendo margens consistentes com os cálculos.
- DADO `dre-pessimista.json`, QUANDO processado, ENTÃO `dre_core.json` reflete a queda e IR calculado sobre resultado positivo, 0 caso negativo.
- DADO `porConta` com valor "R$ 10.000,00", QUANDO normalizado, ENTÃO `valor=10000.00`.
- DADO grupo inválido, QUANDO processado, ENTÃO retorna 400 com `errors[0].code="invalid_enum"` e path do campo.

## 5. Priorização e Rastreabilidade
- IDs: RF‑1 (Validação), RF‑2 (Normalização), RF‑3 (Recalcular Totais), RF‑4 (Margens), RF‑5 (Erros 400), RF‑6 (Saída Padronizada), RNF‑1 (Desempenho — despriorizado p/ workshop), RNF‑2 (Observabilidade), RNF‑3 (Confiabilidade), RNF‑4 (Segurança)
- Mapa → `tasks.md` (_Requirements: RF‑x/RNF‑x_)
