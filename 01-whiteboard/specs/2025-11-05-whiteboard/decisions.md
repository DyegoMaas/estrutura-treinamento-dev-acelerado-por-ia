# decisions.md

## [2025-11-05] Whiteboard MVP (tldraw) — Discovery, Requisitos e Arquitetura
- Contexto: MVP de quadro branco infinito, sem backend, com Card custom, toolbelt mínima, minimap, laser, export simulado, tema e atalhos; persistência local.
- Opções consideradas: tldraw (A), Excalidraw (B), Konva.js (C)
- Decisão: A (tldraw) — velocidade + extensibilidade; caminho claro para futuro multiplayer.
- Riscos e mitigação:
  - Minimap potencialmente instável → sem feature flag; sempre disponível com toggle no UI; se instável, fallback overlay.
  - Export PNG não nativo no MVP → simular (SVG/JSON), planejar PNG real com canvas/html-to-image futuramente.
  - Conflitos de atalhos → rebinding e ignorar quando foco em inputs.
  - Touch/mobile → desktop‑first; toolbar flutuante opcional no futuro.
- Revisão Zen/Consensus: Majority‑weighted entre Gemini, o3 e Claude confirmando tldraw; consenso sugeriu flag para minimap; decisão do usuário: sem feature flag (minimap sempre disponível com toggle de UI). Export simulado e serviços finos (Persistence/Hotkeys/Export/ShapeRegistry) mantidos. Confiança ~9.2/10.
- Gate aplicado: Gate 0 (Discovery) concluído; seguir para Requisitos/Contexto/Arquitetura.
- Próximos passos: Finalizar `requirements.md`, `design.md` (C4 + Sequências), `tasks.md` com rastreabilidade; manter flags.

### 0‑A — Interrogatório Inicial (3‑first)
1) Export simulado: deseja apenas preview/feedback, sem download, certo? (Impacto: RF‑9, ExportModal)
   - Suposição (Non‑blocking): Sim, preview em memória; PNG desabilitado.
2) Minimap: podemos tratar como opcional (feature flag) e oculto por padrão no MVP?
   - Suposição (Non‑blocking): Sim; habilitar quando estável.
3) Público‑alvo: desktop‑first (Chrome/Edge), sem mobile/touch como foco?
   - Suposição (Non‑blocking): Sim; mobile fica fora do MVP.

- Assunções testáveis e impacto: export (RF‑9); minimap (RF‑7); escopo plataforma (RNF‑Portabilidade). Atualizar se houver mudança.
- Confidence inicial: 0.85

### Gate 1 — Requisitos
- Artefato: `requirements.md` (EARS) concluído com IDs RF/RNF.
- Pendências: confirmar 0‑A; sem bloqueios críticos.
- Confidence: 0.88

### Gate 2 — Contexto
- Artefato: Diagrama de Contexto (Mermaid) em `design.md`.
- Confidence: 0.89

### Gate 3 — Arquitetura
- Alternativas comparadas (tldraw vs Excalidraw vs Konva) e decisão registrada.
- C4 Containers + Components e 2 Sequências em `design.md`.
- Confidence: 0.90 (condicional às suposições 0‑A)

### Gate 4 — Especificação/Tarefas
- Artefato: `tasks.md` no formato PO com `_Requirements` mapeados.
- Confidence: 0.90 (aguarda validação 0‑A para Go/No‑Go)

### Gate 5 — Go/No‑Go
- Condição: Confirmação recebida (export simulado, minimap sem feature flag, desktop‑first).
- Decisão: Go (ready to build).
- Confidence final: 0.92

---

## Outputs da Fase 0
- Resumo das decisões: tldraw escolhido; minimap por flag; export simulado; serviços desacoplados.
- Confidence atualizado: 0.85
- Artefatos: `requirements.md`/`design.md`/`tasks.md` iniciados
- Lacunas: 0‑A pendente de confirmação

## Outputs da Fase 1
- Requisitos EARS completos com IDs
- Confidence: 0.88
- Artefatos: `requirements.md`
- Lacunas: confirmar 0‑A

## Outputs da Fase 2
- Contexto (Mermaid) definido
- Confidence: 0.89
- Artefatos: `design.md`
- Lacunas: minimap sob flag

## Outputs da Fase 3
- Arquitetura (C4 + 2 Sequências) concluída; decisão comparativa registrada
- Confidence: 0.90
- Artefatos: `design.md`
- Lacunas: PNG real fora do MVP

## Outputs da Fase 4
- Plano de tarefas PO rastreável
- Confidence: 0.90
- Artefatos: `tasks.md`
- Lacunas: aguarda confirmação do usuário para Gate 5

## Outputs da Fase 5
- Go/No‑Go: Go (ready to build)
- Confidence final: 0.92
- Artefatos atualizados: `requirements.md`, `design.md`, `tasks.md` refletem minimap sem feature flag
