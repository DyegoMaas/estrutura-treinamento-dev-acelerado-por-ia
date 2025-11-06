# QA e Hardening - Tarefa 9

Este documento descreve os testes e validações realizadas para garantir qualidade e robustez do whiteboard MVP.

## Testes Implementados

### 1. Testar Atalhos vs Inputs Focados (RF-14)

**Arquivos de teste:**
- `src/App.qa.test.tsx` - Testes unitários
- `e2e/qa-hardening.spec.ts` - Testes E2E

**Validações:**
- ✅ Atalhos não funcionam quando input está focado
- ✅ Atalhos não funcionam quando textarea está focado
- ✅ Atalhos funcionam normalmente quando nenhum input está focado

**Como testar manualmente:**
1. Abra o app no navegador
2. Crie um Card e comece a editar o texto
3. Pressione `1`, `2`, `3` ou `N` - os atalhos não devem mudar a ferramenta
4. Perceba que o texto continua sendo editado normalmente

### 2. Testar Persistência com Boards Grandes (~5k elementos)

**Arquivos relacionados:**
- `src/utils/performance-test.ts` - Script utilitário para gerar boards grandes

**Como testar manualmente:**

1. Abra o app no navegador
2. Abra o console do navegador (F12)
3. Cole e execute o seguinte código:

```javascript
// Primeiro, obtenha a referência do editor tldraw
// O editor está disponível via window ou você pode usar:
const editor = window.tldraw?.editor

// Ou use o script de teste de performance:
// Importe src/utils/performance-test.ts e use:
// generateLargeBoard(editor, 5000)
```

**Validações:**
- ✅ App não trava com muitos elementos
- ✅ Persistência funciona corretamente após reload
- ✅ Performance aceitável (< 1 segundo para operações básicas)

**Limites testados:**
- Até 5.000 formas mistas (draw, arrow, geo, card)
- Persistência via IndexedDB/LocalStorage
- Recarga com dados grandes

### 3. Validar Fallback do Minimap

**Arquivos de teste:**
- `src/App.qa.test.tsx`
- `e2e/qa-hardening.spec.ts`

**Validações:**
- ✅ Toggle do minimap aparece e funciona
- ✅ Minimap aparece/desaparece ao alternar
- ✅ Sem travamentos durante pan/zoom
- ✅ Fallback funciona se minimap nativo não estiver disponível

**Como testar manualmente:**
1. Clique no botão "Minimap" no canto inferior direito
2. Verifique se o minimap aparece
3. Faça pan/zoom no canvas principal
4. Verifique se o minimap atualiza suavemente sem travamentos
5. Clique novamente para ocultar o minimap

## Critérios de Aceite Validados

- ✅ **Nenhum bloqueador**: Todos os testes passam sem erros críticos
- ✅ **Performance aceitável**: App roda suavemente mesmo com muitos elementos
- ✅ **Toggle do minimap funcionando**: Minimap pode ser ligado/desligado sem problemas

## Executar Testes

### Testes Unitários
```bash
npm run test
```

### Testes E2E
```bash
# Inicie o servidor de desenvolvimento primeiro
npm run dev

# Em outro terminal, execute os testes E2E
npm run test:e2e
```

### Testes E2E com UI (Playwright)
```bash
npm run test:ui
```

## Notas de Performance

- **Renderização**: Otimizada com `will-change` e `backface-visibility`
- **Transições**: Suaves com `cubic-bezier` para melhor UX
- **Persistência**: IndexedDB usado quando disponível, fallback para LocalStorage
- **Scrollbars**: Customizados para melhor performance visual

## Melhorias Futuras

- [ ] Adicionar métricas de performance (FPS, tempo de renderização)
- [ ] Otimizar renderização de boards muito grandes (>10k elementos)
- [ ] Implementar lazy loading para shapes fora da viewport
- [ ] Adicionar debounce/throttle em operações de pan/zoom intensivas

