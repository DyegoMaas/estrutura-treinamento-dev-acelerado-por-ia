# Whiteboard MVP

SPA de whiteboard com canvas infinito usando React + tldraw.

## Requisitos

- Node.js >= 20.19.0
- npm ou yarn

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173` no navegador.

## Testes

```bash
# Testes unitários
npm run test

# Testes E2E (requer servidor dev rodando)
npm run test:e2e
```

## Build

```bash
npm run build
```

## Estrutura

- `src/App.tsx` - Componente principal com Tldraw
- `src/main.tsx` - Entry point React
- `src/test/` - Testes unitários
- `e2e/` - Testes E2E com Playwright

## Recursos Implementados

- ✅ Canvas infinito com tldraw
- ✅ Persistência local (IndexedDB/LocalStorage)
- ✅ Ferramenta Select ativa por padrão

## Próximos Passos

Ver `specs/2025-11-05-whiteboard/tasks.md` para tarefas pendentes.

