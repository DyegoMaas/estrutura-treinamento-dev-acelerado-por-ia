[ ] 1. Definir e versionar o schema do dre-core
- Complexidade: medium
- Risco: medium
- Passo 1: Modelar campos obrigatórios (periodo, totais, porConta[])
- Passo 2: Definir tipos e restrições (string/enum/number)
- Passo 3: Documentar paths e mensagens de erro
- Critérios de Aceite:
  - Schema validado em exemplos sintéticos e baseline
  - Paths de erro seguem padrão <root>.<field>[i].<subfield>
- _Requirements: RF-1, RNF-1_

[ ] 2. Implementar validação de esquema e coleta de erros
- Complexidade: medium
- Risco: medium
- Passo 1: Validar presença e tipo de campos
- Passo 2: Acumular violações com path, esperado, obtido
- Passo 3: Mapear para estrutura de erro 400
- Critérios de Aceite:
  - Input inválido retorna 400 com details[] completos
- _Requirements: RF-1, RF-5_

[ ] 3. Implementar normalização monetária
- Complexidade: medium
- Risco: medium
- Passo 1: Detectar formato BR/US (símbolo, separadores)
- Passo 2: Converter para número conforme política
- Passo 3: Registrar meta de normalizações
- Critérios de Aceite:
  - "R$ 1.234,56" → 1234.56; "1,234.56" → 1234.56; "-500" → -500.00
- _Requirements: RF-2, RNF-1, RNF-5_

[ ] 4. Recalcular totais
- Complexidade: medium
- Risco: medium
- Passo 1: Definir fórmulas (decisions.md)
- Passo 2: Implementar soma por grupos e totais
- Passo 3: Validar consistência com baseline
- Critérios de Aceite:
  - Totais calculados batem com os esperados nos samples
- _Requirements: RF-3, RNF-1_

[ ] 5. Calcular margens
- Complexidade: low
- Risco: low
- Passo 1: Definir fórmula principal (decisions.md)
- Passo 2: Arredondar/padronizar percentual
- Critérios de Aceite:
  - Margem = lucroLiquido/receitaLiquida (ou definida) consistente
- _Requirements: RF-4, RNF-1_

[ ] 6. Montar retorno padronizado (dre_core.json)
- Complexidade: low
- Risco: low
- Passo 1: Incluir periodo, totais, porConta normalizados, margens
- Passo 2: Incluir meta (schemaVersion, validatedAt, roundingPolicy)
- Critérios de Aceite:
  - Estrutura padronizada conforme design
- _Requirements: RF-6_

[ ] 7. Testes com amostras baseline/otimista/pessimista
- Complexidade: medium
- Risco: low
- Passo 1: Definir resultados esperados de totais/margens
- Passo 2: Validar que baseline passa; criar/ajustar otimista/pessimista
- Critérios de Aceite:
  - Três amostras processadas sem divergências
- _Requirements: RF-7_

[ ] 8. Observabilidade mínima
- Complexidade: low
- Risco: low
- Passo 1: Contadores de erros e normalizações
- Passo 2: Logs de paths inválidos
- _Requirements: RNF-3_

