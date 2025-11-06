[x] 1. Scaffold SPA com React + tldraw e persistência local
- Complexidade: low
- Risco: low
- Passo 1: Criar projeto (Vite/CRA) com TypeScript
- Passo 2: Instalar `@tldraw/tldraw` e importar CSS
- Passo 3: Renderizar `<Tldraw persistenceKey="whiteboard-mvp" />`
- Critérios de Aceite:
  - App abre com canvas infinito e Select ativo
  - Reload preserva o board
- _Requirements: RF-1, RF-11, RNF-Confiabilidade_

[x] 2. Registrar shape custom `Card`
- Complexidade: medium
- Risco: medium
- Passo 1: Implementar `CardShapeUtil` (title/label, resize, estilos básicos)
- Passo 2: Implementar `toSvg`/`toBackgroundSvg`
- Passo 3: Adicionar ferramenta Card à toolbelt
- Critérios de Aceite:
  - Card cria/edita título e etiqueta inline
  - Export SVG do Card respeita aparência básica
- _Requirements: RF-5, RF-9_

[x] 3. Toolbelt minimalista e hotkeys
- Complexidade: low
- Risco: low
- Passo 1: Restringir UI a Select/Draw/Arrow/Card
- Passo 2: Mapear 1=Select, 2=Draw, 3=Arrow, N=Card
- Passo 3: Ignorar hotkeys quando foco em inputs
- Critérios de Aceite:
  - Toolbelt mostra apenas 4 ferramentas
  - Atalhos funcionam e não conflitam durante edição de texto
- _Requirements: RF-2, RF-6, RF-14_

[x] 4. Laser pointer
- Complexidade: low
- Risco: low
- Passo 1: Expor/ativar ferramenta Laser do tldraw
- Passo 2: Garantir que não crie elementos persistentes
- Critérios de Aceite:
  - Laser aparece como rastro temporário
- _Requirements: RF-8_

[ ] 5. Minimap
- Complexidade: medium
- Risco: medium
- Passo 1: Adicionar toggle no UI para mostrar/ocultar minimap
- Passo 2: Integrar minimap nativo (se estável) OU fallback overlay simples
- Passo 3: Validar estabilidade em pan/zoom e ajustar thresholds
- Critérios de Aceite:
  - Minimap pode ser ligado/desligado pelo usuário
  - Sem travamentos ao pan/zoom
- _Requirements: RF-7, RNF-Observabilidade_

[ ] 6. Modal de Exportar (simulado)
- Complexidade: low
- Risco: low
- Passo 1: Implementar modal com opções SVG/PNG/JSON
- Passo 2: Integrar `editor.getSvg()` e snapshot JSON
- Passo 3: PNG desabilitado (tooltip explicando)
- Critérios de Aceite:
  - Modal exibe preview SVG/JSON e feedback de sucesso
  - Nenhum arquivo é baixado
- _Requirements: RF-9_

[ ] 7. Tema claro/escuro
- Complexidade: low
- Risco: low
- Passo 1: Alternância via CSS vars e integração com tema do tldraw
- Passo 2: Persistir preferência no storage
- Critérios de Aceite:
  - Toggle troca tema imediatamente e persiste após reload
- _Requirements: RF-10_

[ ] 8. Polimento e usabilidade
- Complexidade: low
- Risco: low
- Passo 1: Ajustar cursores, sombras ao arrastar, suavização
- Passo 2: Revisar undo/redo e multi‑seleção/alinhamento
- Critérios de Aceite:
  - Interações fluem sem engasgos, undo/redo previsível
- _Requirements: RF-3, RF-12, RF-13, RF-15, RNF-Desempenho_

[ ] 9. QA e hardening
- Complexidade: low
- Risco: medium
- Passo 1: Testar atalhos vs inputs focados
- Passo 2: Testar persistência com boards grandes (~5k elementos fake)
- Passo 3: Validar fallback do minimap
- Critérios de Aceite:
  - Nenhum bloqueador; performance aceitável; toggle do minimap funcionando
- _Requirements: RNF-Desempenho, RNF-Confiabilidade, RNF-Observabilidade_
