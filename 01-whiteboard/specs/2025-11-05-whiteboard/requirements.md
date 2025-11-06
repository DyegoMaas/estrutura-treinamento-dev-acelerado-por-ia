# Requisitos (EARS)

## 1. Contexto
- Objetivo de negócio: Entregar um whiteboard de canvas infinito, fluido e responsivo, sem backend, que permita desenhar, criar setas e inserir um shape personalizado "Card" (retângulo com título/etiqueta), com sensação de produto completo para demonstrações e uso individual.
- Atores e stakeholders: Usuário final (criador/apresentador), Stakeholders (PO/Design/Engenharia).
- Restrições e políticas: MVP client‑side (sem backend), persistência local (LocalStorage/IndexedDB via `persistenceKey`), exportação apenas simulada (sem gravação real), desktop‑first (Chrome/Edge), acessibilidade básica de navegação via teclado.

## 2. Requisitos Funcionais (EARS)
- RF‑1: Quando o usuário abrir o app, então o sistema deve exibir um canvas infinito com a ferramenta Selecionar ativa por padrão.
- RF‑2: Quando o usuário pressionar 1/2/3/N, então o sistema deve alternar a ferramenta ativa para 1=Selecionar, 2=Lápis (Draw), 3=Seta (Arrow), N=Card.
- RF‑3: Quando o usuário desenhar com a ferramenta Lápis, então o sistema deve criar traços (strokes) com suavização padrão do editor.
- RF‑4: Quando o usuário criar uma Seta, então o sistema deve permitir conexões e reposicionamento dos pontos inicial/final, com snapping aos shapes próximos.
- RF‑5: Quando o usuário inserir um Card, então o sistema deve criar um retângulo com título e etiqueta configuráveis (texto editável inline), permitindo redimensionar e estilizar (cores básicas de preenchimento/borda).
- RF‑6: Quando a toolbelt estiver visível, então ela deve conter somente as ferramentas: Selecionar, Lápis, Seta e Card, destacando visualmente a ferramenta ativa.
- RF‑7: Quando o minimap estiver habilitado, então o usuário deve visualizar uma visão geral do board e a área da câmera (toggle on/off).
- RF‑8: Quando o usuário ativar o laser pointer, então o sistema deve exibir um rastro temporário para apresentação sem criar elementos persistentes no board.
- RF‑9: Quando o usuário abrir o modal de Exportar, então o sistema deve exibir opções SVG/PNG/JSON; e, nesta fase, deve apenas simular a exportação (pré‑visualização/feedback sem salvar arquivo).
- RF‑10: Quando o usuário alternar o tema, então o sistema deve trocar entre tema claro e escuro imediatamente.
- RF‑11: Quando o usuário recarregar o app, então o sistema deve restaurar o estado do board a partir da persistência local.
- RF‑12: Quando o usuário realizar pan/zoom (mouse/trackpad), então o sistema deve responder suavemente mantendo a taxa de quadros adequada.
- RF‑13: Quando o usuário pressionar Ctrl/Cmd+Z ou Shift+Ctrl/Cmd+Z, então o sistema deve desfazer/refazer a última ação.
- RF‑14: Quando uma entrada de texto estiver focada em um Card, então atalhos globais não devem interferir (ex.: 1/2/3/N desabilitados enquanto editando texto).
- RF‑15: Quando o usuário selecionar múltiplos elementos, então o sistema deve permitir mover, alinhar e agrupar/desagrupar (quando suportado pelo editor base).

## 3. Requisitos Não‑Funcionais
- Desempenho: Renderização fluida (objetivo 60 FPS) com até ~5.000 elementos locais; interações responsivas (<100 ms percebido) na maioria das ações.
- Segurança/Privacidade: Dados permanecem no dispositivo do usuário; sem tracking; sem envio a servidores.
- Observabilidade: Logs de debug no console (dev); toggles de UI (ex.: habilitar/desabilitar minimap) e métricas básicas de performance (dev).
- Confiabilidade/Disponibilidade: Persistência local resiliente a reload; comportamento previsível sem internet; recuperação básica em caso de estado inválido (reset do board).
- Portabilidade: Desktop‑first (Chrome/Edge); funcionamento básico em touch não é objetivo do MVP.

## 4. Critérios de Aceite (alto nível)
- DADO que o usuário abre o app, QUANDO o canvas é exibido, ENTÃO a ferramenta Selecionar está ativa e o zoom/pan funciona (RF‑1, RF‑12).
- DADO um board com elementos, QUANDO o usuário recarrega, ENTÃO o estado é restaurado (RF‑11).
- DADO que o usuário pressiona 1/2/3/N, QUANDO a toolbelt muda, ENTÃO a ferramenta correspondente é ativada (RF‑2, RF‑6).
- DADO um Card selecionado, QUANDO o usuário edita o título/etiqueta, ENTÃO o texto é atualizado e atalhos globais não interferem (RF‑5, RF‑14).
- DADO que o usuário abre Exportar, QUANDO escolhe SVG/PNG/JSON, ENTÃO o modal apresenta saída simulada sem salvar arquivo (RF‑9).
- DADO que o minimap está habilitado, QUANDO o usuário alterna o toggle, ENTÃO a visão geral aparece/desaparece sem travamentos (RF‑7).

## 5. Priorização e Rastreabilidade
- IDs Funcionais: RF‑1 a RF‑15 (acima).
- IDs Não‑Funcionais: RNF‑Desempenho, RNF‑Segurança, RNF‑Observabilidade, RNF‑Confiabilidade, RNF‑Portabilidade.
- Mapa → `tasks.md` (cada tarefa contém `_Requirements: <IDs>` correspondentes).
