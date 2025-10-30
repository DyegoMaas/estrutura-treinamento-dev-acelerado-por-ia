# decisions.md — dre-core

## 2025-10-30 0-A (Elicitação Adaptativa)
- Pergunta 1 (Blocking?): Qual o regime de cálculo do IR? Fixamos alíquota padrão?  
  Suposição: aplicar 20% sobre `resultadoAntesIR` com piso 0; parametrizável no futuro.  
  Impacto: requirements (RF-3/5), design (Calculator), tasks (5).  
  Status: Non‑blocking (parametrização futura).
- Pergunta 2 (Blocking?): Como identificar despesas de marketing vs. gerais no `porConta`?  
  Suposição: identificação por `nome` ou metadado simples; neste escopo, agregaremos todas as `despesa` em `despesasGeraisAdm`, e se `nome` contiver "Marketing"/"Ads" classificar em `despesasMarketing`.  
  Impacto: requirements (regras de agrupamento), tasks (3/4).  
  Status: Non‑blocking (heurística inicial documentada).
- Pergunta 3 (Blocking?): Divergências entre `totais` de entrada e os recalculados devem causar erro?  
  Suposição: não; recalcular sempre, ignorar input e registrar `warning`.  
  Impacto: requirements (RF-3), design (Emitter/meta), tasks (3/6).  
  Status: Non‑blocking.

Confidence inicial após 0-A: 88% (há suposição sobre classificação de marketing e IR parametrizável, porém risco baixo).

## Passo 0 — Discovery (Zen/Consensus)
- Zen: requisitos agrupados em 5 frentes: validação, normalização, recálculo, margens/IR, erros/saída. Dependências internas simples, sem I/O externo. Priorização: RF‑1→RF‑3→RF‑4→RF‑5→RF‑6.
- Consensus (síntese): privilegiar recálculo independente e saída padronizada com `meta`. Erros 400 com códigos estáveis e paths. IR 20% padrão com piso 0.
- Riscos: strings monetárias variadas (BR/EN); heurística de marketing; divisão por zero. Mitigações: normalizador robusto, warnings e testes das 3 amostras.

Gate 0: OK. Confidence: 90%.

## Fase 1 — Requisitos
- Consolidado em `requirements.md` no formato EARS com critérios de aceite e IDs de rastreio.  
Gate 1: OK. Confidence: 92%.

## Fase 2 — Contexto
- Diagrama Mermaid de contexto; fronteiras e consumidores definidos.  
Gate 2: OK. Confidence: 93%.

## Fase 3 — Arquitetura
- Alternativa escolhida: pipeline síncrono em 4 estágios (validate → normalize → recalc → emit). Outras alternativas (ex.: DSL de mapeamento ou motor de regras) descartadas por complexidade desnecessária neste escopo.  
- Diagramas C4 (Containers/Components) e 2 sequências incluídos.  
Gate 3: OK. Confidence: 94%.

## Fase 4 — Especificação & Tarefas
- `tasks.md` com rastreabilidade aos RF/RNF, critérios de aceite e riscos.  
Gate 4: OK. Confidence: 95%.

## Fase 5 — Go/No‑Go
- Pronto para implementação pelo spec‑dev.  
- Decisão: Go (ready to build).  
Confidence final: 95%.

### Outputs consolidados
- Resumo: validação strict, normalização BR/EN, recálculo total e margens, IR 20%, erros 400 padronizados, saída `dre_core.json` com `meta`.
- Artefatos atualizados: requirements.md, design.md, tasks.md.
- Lacunas: parametrização de IR e classificação de marketing poderão evoluir; sem bloqueio.

## 2025-10-30 Atualização RNF — Desempenho (Workshop)
- Contexto: performance não é preocupação neste workshop e não irá para produção.
- Decisão: marcar RNF‑1 (Desempenho) como despriorizado/no‑op; remover metas duras. Manter demais RNFs (Observabilidade, Confiabilidade, Segurança).
- Efeito: `requirements.md` atualizado (RNF‑1 com nota); tasks inalteradas (nenhuma dependia de RNF‑1). 
- Gate aplicado: Fase 1/4 (Requisitos/Especificação) — alinhado; sem impacto em confiança.
- Confidence permanece: 95%.
