# Agentes Spec-Driven v4

## Comandos Disponíveis

As regras na pasta `rules/` funcionam como comandos que podem ser executados para diferentes fases do desenvolvimento orientado por especificações:

### Comandos Principais

| Comando | Arquivo | Descrição |
|---------|---------|-----------|
| `/spec` | `spec-plan.md` | **Planejamento e Especificação** - Análise de requisitos, geração de especificações técnicas, diagramas C4 e Mermaid, Quality Gates |
| `/dev`  | `spec-dev.md` | **Desenvolvimento** - Implementação baseada nas especificações, seguindo as tarefas definidas no planejamento |
| `/qa`   | `spec-qa.md` | **Quality Assurance** - Testes, validação e verificação da implementação contra as especificações |

### Como Usar

1. **Inicie com `/spec`** para criar as especificações e plano de desenvolvimento
2. **Continue com `/dev`** para implementar as funcionalidades baseadas nas specs
3. **Finalize com `/qa`** para validar e testar a implementação

### Estrutura de Saída

Todos os comandos trabalham com especificações organizadas em:
```
./specs/yyyy-MM-dd-[feature-slug]/
  requirements.md   # Requisitos (EARS)
  design.md         # Contexto, C4 e Sequências (Mermaid)
  tasks.md          # Plano de tarefas no estilo PO
  decisions.md      # Decisões, pendências e Quality Gates
```

### Scripts Auxiliares

Sempre que for necessário criar scripts auxiliares durante o desenvolvimento, eles devem ser organizados no diretório:

```
./agent-scripts/
  [script-name].ps1     # Scripts PowerShell
  [script-name].py      # Scripts Python
  [script-name].sh      # Scripts Bash/Shell
  [script-name].js      # Scripts Node.js
```

**Diretrizes para Scripts:**
- Use nomes descritivos que indiquem a função do script
- Inclua comentários explicando o propósito e uso
- Mantenha scripts simples e focados em uma tarefa específica
- Documente dependências e pré-requisitos no cabeçalho do script
- Se o diretório não existir, crie-o automaticamente

## Ferramentas MCP Disponíveis

O sistema spec-driven v4 utiliza diversas ferramentas MCP (Model Context Protocol) para diferentes aspectos do desenvolvimento:

### Ferramentas de Análise e Planejamento

| Ferramenta | Uso | Descrição |
|------------|-----|-----------|
| `chat_zen` | Brainstorming e discussão | Colaboração para ideias, validações e explicações detalhadas |
| `planner_zen` | Planejamento complexo | Quebra de tarefas complexas com planejamento sequencial e revisões |
| `consensus_zen` | Decisões arquiteturais | Análise multi-modelo para decisões críticas e escolhas tecnológicas |
| `perplexity` | Pesquisa e best practices | Pesquisa de informações atualizadas e melhores práticas |

### Ferramentas de Desenvolvimento

| Ferramenta | Uso | Descrição |
|------------|-----|-----------|
| `codereview_zen` | Revisão de código | Análise sistemática de qualidade, segurança e performance |
| `debug_zen` | Depuração | Investigação sistemática de bugs e problemas complexos |
| `refactor_zen` | Refatoração | Análise de oportunidades de melhoria e modernização |
| `analyze_zen` | Análise de código | Avaliação arquitetural e análise de padrões |

### Ferramentas de Qualidade

| Ferramenta | Uso | Descrição |
|------------|-----|-----------|
| `testgen_zen` | Geração de testes | Criação de suites de teste com cobertura de edge cases |
| `secaudit_zen` | Auditoria de segurança | Análise OWASP Top 10 e avaliação de vulnerabilidades |
| `precommit_zen` | Validação pré-commit | Verificação de mudanças antes do commit |

### Ferramentas de Documentação

| Ferramenta | Uso | Descrição |
|------------|-----|-----------|
| `docgen_zen` | Geração de documentação | Criação automática de documentação técnica |
| `tracer_zen` | Rastreamento de fluxo | Análise de execução e mapeamento de dependências |

### Ferramentas de Pesquisa

| Ferramenta | Uso | Descrição |
|------------|-----|-----------|
| `resolve-library-id_Context_7` | Resolução de bibliotecas | Identificação de IDs compatíveis para bibliotecas |
| `get-library-docs_Context_7` | Documentação de bibliotecas | Obtenção de documentação atualizada de bibliotecas |

### Diretrizes de Uso

- **Combine ferramentas** conforme necessário para análises mais completas
- **Use `consensus_zen`** para decisões arquiteturais importantes
- **Aplique `chat_zen`** para brainstorming antes de implementações complexas
- **Execute `precommit_zen`** antes de commits importantes
- **Utilize ferramentas de pesquisa** para manter-se atualizado com best practices

---

*Para mais detalhes sobre cada comando, consulte os arquivos individuais na pasta `rules/`.*