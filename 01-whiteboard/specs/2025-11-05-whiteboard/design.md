# Design

## Contexto e Decisão
- Stack: React + `tldraw` (v2.x) como SDK de canvas infinito, sem backend.
- Forma: SPA com serviços internos (PersistenceService, HotkeysManager, ExportService/UI, ShapeRegistry); minimap sempre disponível com toggle no UI (sem feature flag).
- Decisão: tldraw como engine pela extensibilidade (custom shapes, UI override, estado), velocidade de entrega e caminho futuro para colaboração.

## Alternativas comparadas
- tldraw (escolhida): + Extensível, shapes custom, ferramentas/atalhos, persistência local simples (`persistenceKey`), laser; − Minimap pode estar instável conforme versão.
- Excalidraw: + Export e mobile maduros; − Custom shapes menos flexíveis sem fork; estética mais opinativa.
- Konva.js: + Controle total baixo nível; − 4–5× esforço para reimplementar editor, seleção, histórico, snapping.

## Diagrama de Contexto (Mermaid)

```mermaid
flowchart LR
  user([Usuário]) -->|Interage| app[(Whiteboard SPA - React + tldraw)]
  app -->|Persistência local| storage[(LocalStorage/IndexedDB)]
  app -->|Export simulado| export(Export UI)
```

## C4: Containers (Mermaid)

```mermaid
flowchart TB
  Browser[Browser] --> WebApp[SPA: React + tldraw]
  subgraph SPA
    WebApp --> Editor[Tldraw Editor Wrapper]
    WebApp --> Toolbelt[Minimal Toolbelt]
    WebApp --> ShapeRegistry[Card Shape Util]
    WebApp --> Services[(Services)]
    Services --> Persistence[PersistenceService]
    Services --> Hotkeys[HotkeysManager]
    Services --> ExportSvc[Export Service/UI]
    Services --> Theme[Theme Provider]
    Services --> Minimap[Minimap]
  end
  WebApp --> Storage[(LocalStorage/IndexedDB)]
```

## C4: Components (Mermaid)

```mermaid
flowchart LR
  AppShell[AppShell/Providers] --> EditorWrapper[Tldraw component]
  AppShell --> ThemeProvider[ThemeProvider]
  AppShell --> HotkeysManager
  AppShell --> ExportModal
  EditorWrapper --> CardShapeUtil[CardShapeUtil]
  EditorWrapper --> ToolbeltUI[Toolbelt Select/Draw/Arrow/Card]
  EditorWrapper --> Laser[Laser Pointer]
  EditorWrapper --> MinimapUI[Minimap]
  AppShell --> PersistenceService
  PersistenceService --> LocalStorage
```

## Sequência – Carregamento/Persistência

```mermaid
sequenceDiagram
  participant U as Usuário
  participant A as AppShell
  participant E as Editor (tldraw)
  participant P as PersistenceService
  U->>A: Abre o app
  A->>P: Ler estado por persistenceKey
  P-->>A: Estado (ou vazio)
  A->>E: Monta <Tldraw/> com state + shapeUtils
  E-->>A: Editor pronto
  E->>P: Salvar alterações (onChange)
```

## Sequência – Export (simulado)

```mermaid
sequenceDiagram
  participant U as Usuário
  participant A as AppShell
  participant E as Editor
  participant X as ExportModal
  U->>A: Clica Exportar
  A->>X: Abrir modal
  U->>X: Seleciona SVG/PNG/JSON
  X->>E: Solicitar preview (getSvg/getJson)
  E-->>X: Conteúdo em memória
  X-->>U: Exibe preview/feedback (sem download)
```

## Notas de Implementação
- Shape `Card`: util com `getDefaultProps`, `getGeometry`, `component`, `indicator` e `toSvg()/toBackgroundSvg()` para export visual consistente.
- Toolbelt mínima: esconder ferramentas não usadas; hotkeys 1/2/3/N mapeando `select/draw/arrow/card`.
- Minimap: sempre disponível; toggle no UI; se necessário, fallback para overlay simples com viewport.
- Export (simulado): usar `editor.getSvg()`/`editor.store.getSnapshot()` e desabilitar PNG real no MVP.
- Tema: alternância via CSS vars e suporte do tema do `tldraw`.
