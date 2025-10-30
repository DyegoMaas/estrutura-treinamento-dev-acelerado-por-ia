[x] 1. Validar esquema do dre.json
- Complexidade: medium
- Risco: medium
- Passo 1: Definir esquema strict (campos obrigatórios, tipos, enum de grupos)
- Passo 2: Validar formato de `periodo` (YYYY-MM) e `moeda` ISO-4217
- Passo 3: Regras de sinais por grupo e campos extras proibidos
- Critérios de Aceite:
  - Dado campo ausente ou tipo errado, retorna 400 com path e code
  - Dado grupo inválido, retorna 400 com code `invalid_enum`
- _Requirements: RF-1, RNF-4_

[ ] 2. Normalizar valores monetários e período
- Complexidade: medium
- Risco: low
- Passo 1: Converter strings BR/EN ("R$ 10.000,00", "10,000.00") para número
- Passo 2: Padronizar `periodo` (YYYY-MM) e normalizar `moeda`
- Passo 3: Registrar `warnings[]` quando ajustar formatos
- Critérios de Aceite:
  - Dado "R$ 10.000,00", então valor=10000.00
  - Dado período inválido, retorna 400
- _Requirements: RF-2, RNF-2_

[ ] 3. Recalcular totais
- Complexidade: medium
- Risco: medium
- Passo 1: Implementar agregações por grupo conforme fórmulas
- Passo 2: Ignorar `totais` do input e sempre recomputar
- Passo 3: Adicionar aviso se divergirem
- Critérios de Aceite:
  - Dado dre-baseline.json, totais batem fórmulas
  - Dado dre-otimista.json e dre-pessimista.json, totais coerentes
- _Requirements: RF-3, RNF-3_

[ ] 4. Calcular margens
- Complexidade: low
- Risco: low
- Passo 1: Calcular margens sobre `receitaLiquida`
- Passo 2: Tratar divisão por zero (null + warning)
- Critérios de Aceite:
  - MargemBruta = lucroBruto/receitaLiquida (4 casas)
  - MargemOperacional = resultadoOperacional/receitaLiquida (4 casas)
  - MargemLiquida = resultadoLiquido/receitaLiquida (4 casas)
- _Requirements: RF-4_

[ ] 5. Cálculo de IR (20%)
- Complexidade: low
- Risco: low
- Passo 1: impostoRenda = max(0.20 * resultadoAntesIR, 0)
- Passo 2: Permitir futura parametrização
- Critérios de Aceite:
  - Dado resultadoAntesIR<0, IR=0
  - Dado baseline, IR=4600
- _Requirements: RF-3_

[ ] 6. Emissão do dre_core.json
- Complexidade: low
- Risco: low
- Passo 1: Montar saída padronizada com `meta`
- Passo 2: Garantir ordenação/precisão consistente
- Critérios de Aceite:
  - Campo `meta.recalcMode="recompute"` presente
  - `aliquotaIRAplicada=0.20`
- _Requirements: RF-6, RNF-3_

[ ] 7. Tratamento de erros 400
- Complexidade: low
- Risco: low
- Passo 1: Retornar 400 com `errors[]` (code,path,message)
- Passo 2: Mensagens em PT-BR e orientativas
- Critérios de Aceite:
  - Paths corretos e códigos consistentes (ex.: invalid_enum, invalid_type)
- _Requirements: RF-5_

[ ] 8. QA com amostras baseline/otimista/pessimista
- Complexidade: low
- Risco: low
- Passo 1: Executar 3 amostras e validar totais/margens
- Passo 2: Validar tolerância/precisão e warnings
- Critérios de Aceite:
  - 3 amostras aprovadas sem erros
- _Requirements: RNF-3_

[ ] 9. Observabilidade mínima
- Complexidade: low
- Risco: low
- Passo 1: Logs estruturados por fase (validate/normalize/recalc)
- Passo 2: Métricas simples (dur_ms, warnings, errors)
- _Requirements: RNF-2_
