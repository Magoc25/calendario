# Declaração de Acessibilidade — Calendário MGC

**Versão:** 1.0 · **Última atualização:** 2026-05-16

> Este documento atende ao **Art. 63 da Lei nº 13.146/2015** (Lei Brasileira de Inclusão — Estatuto da Pessoa com Deficiência) e segue as **Diretrizes de Acessibilidade para Conteúdo Web (WCAG) 2.2** do W3C e a norma **ABNT NBR 17225:2025**.

---

## 1. Compromisso de acessibilidade

O Calendário MGC é desenvolvido com o compromisso de **inclusão e usabilidade para todas as pessoas**, incluindo aquelas com deficiência visual, motora, auditiva ou cognitiva. Esta é uma obrigação legal e um valor do projeto.

**Base legal:**
> *"É obrigatória a acessibilidade nos sítios da internet mantidos por empresas com sede ou representação comercial no País ou por órgãos de governo, para uso da pessoa com deficiência, garantindo-lhe acesso às informações disponíveis, conforme as melhores práticas e diretrizes de acessibilidade adotadas internacionalmente."* — Art. 63 da LBI

---

## 2. Padrões seguidos

| Padrão | Nível | Status |
|---|---|---|
| **WCAG 2.2** (W3C) | AA | 🟡 Conformidade parcial |
| **ABNT NBR 17225:2025** | — | 🟡 Conformidade parcial |
| **eMAG** (Modelo de Acessibilidade de Governo Eletrônico) | — | ℹ️ Não aplicável (projeto privado) |

---

## 3. Recursos de acessibilidade implementados

### 3.1 Navegação por teclado (WCAG 2.1.1)

- ✅ Navegação completa via `Tab`, `Shift+Tab`, `Enter`, `Esc`
- ✅ Atalhos globais:
  - `N` — novo evento
  - `T` — ir para hoje
  - `←` `→` — período anterior/próximo
  - `Esc` — fechar modal
  - `?` — exibir lista de atalhos
- ✅ Atalhos desativados quando foco está em campo de texto (evita conflito)
- ✅ Foco visível ao navegar (outline padrão do navegador preservado)

### 3.2 Contraste de cor (WCAG 1.4.3)

- ✅ Tema **Oceano** (padrão): contraste mínimo 4.5:1 para texto
- ✅ Tema **Aurora** (escuro): contraste mínimo 4.5:1
- ✅ Tema **Ardósia** (escuro): contraste mínimo 4.5:1
- ✅ Tema **Marfim** (claro): contraste mínimo 4.5:1
- ✅ Tema **Sereno** (claro): contraste mínimo 4.5:1
- ✅ 3 níveis de densidade (Compacto/Normal/Grande) — usuário escolhe
- ⚠️ Cor personalizada: usuário pode criar combinações com baixo contraste (sua responsabilidade)

### 3.3 Idioma e semântica (WCAG 3.1.1)

- ✅ `<html lang="pt-BR">` declarado
- ✅ HTML semântico (`<header>`, `<main>`, `<aside>`, `<button>`, `<dialog>`)
- ✅ Labels associados a inputs via `<label for="">` ou `aria-label`
- ✅ Botões com texto descritivo ou `aria-label`

### 3.4 Estrutura e hierarquia (WCAG 1.3.1)

- ✅ Hierarquia de cabeçalhos respeitada (`<h1>` único, sequência lógica)
- ✅ Regiões nomeadas com landmarks ARIA quando aplicável
- ✅ Listas marcadas semanticamente (`<ul>`, `<ol>`)

### 3.5 Texto alternativo e ícones (WCAG 1.1.1)

- ✅ Ícones decorativos: emojis com função visual, `aria-hidden="true"` quando puramente decorativo
- ✅ Ícones funcionais: acompanhados de texto ou `title`/`aria-label`
- ⚠️ Algumas imagens decorativas podem não ter `alt` explícito

### 3.6 Redimensionamento de texto (WCAG 1.4.4)

- ✅ Layout responsivo a `zoom` do navegador até 200%
- ✅ 3 níveis de densidade ajustam tamanho de fonte e espaçamento
- ✅ Fontes em unidades relativas (`em`, `rem`)

### 3.7 Tempo e movimento (WCAG 2.2.1, 2.3.1)

- ✅ Sem conteúdo piscante (>3x/segundo)
- ✅ Sem animações automáticas longas
- ✅ Animações curtas (≤0.3s) — não causam desconforto
- ✅ Alertas/notificações sem limite de tempo para leitura

### 3.8 Alvos de toque (WCAG 2.5.8 — nível AA do 2.2)

- ✅ Botões mobile com tamanho mínimo de 44×44px (acima do mínimo 24×24)
- ✅ FAB (botão flutuante) com tamanho generoso
- ✅ Botões do header com padding adequado

### 3.9 Identificação de erros (WCAG 3.3.1)

- ✅ Mensagens de erro em texto (não apenas cor)
- ✅ Toast com mensagens descritivas
- ✅ Validação inline em formulários

### 3.10 Compatibilidade com leitores de tela (WCAG 4.1.2)

- ✅ HTML válido e semântico
- ✅ ARIA usado quando HTML semântico não basta
- ✅ Modais com `role="dialog"` e foco gerenciado
- ⚠️ Algumas interações dinâmicas (drag & drop) podem ter limitações

---

## 4. Limitações conhecidas

Mesmo com o compromisso de acessibilidade, algumas funcionalidades têm limitações:

| Funcionalidade | Limitação | Workaround |
|---|---|---|
| **Drag & drop** entre dias (vista Mês) | Não acessível via teclado | Usar menu de contexto → "Mover para..." |
| **Drag & drop** do Top 3 (Hoje) | Não acessível via teclado | Adicionar via botão padrão |
| **Drum roll** de hora (mobile) | Pode ser difícil para deficiência motora | Permitir entrada de texto manual |
| **Mini-calendário** lateral | Visualização densa, foco visível pode ser pequeno | Usar atalhos `←`/`→` para navegação |
| **Resize de eventos** (vista Semana) | Apenas com mouse | Editar via formulário |
| **Heatmap anual** (rotinas) | Predominantemente visual | Versão tabular pode ser adicionada (roadmap) |

**Compromisso:** estas limitações estão no roadmap de melhorias. Sugestões são bem-vindas.

---

## 5. Tecnologias assistivas testadas

- ✅ **NVDA** (Windows) — leitor de tela
- ✅ **VoiceOver** (macOS/iOS) — leitor de tela
- ⚠️ **TalkBack** (Android) — testes parciais
- ⚠️ **JAWS** (Windows) — não testado (sem licença disponível)

---

## 6. Recursos do navegador que ajudam

Independentemente do app, recursos nativos do navegador podem ajudar:

- **Zoom:** `Ctrl/Cmd +` para aumentar texto
- **Modo de leitura:** disponível em Firefox/Safari
- **Inversão de cores:** OS-level (Windows/macOS/iOS/Android)
- **Alto contraste:** OS-level
- **Cursor de mouse aumentado:** OS-level
- **Reconhecimento de voz:** Dragon NaturallySpeaking, Voice Control (macOS), Voice Access (Android)

---

## 7. Como reportar problemas de acessibilidade

Sua participação é fundamental para melhorar a acessibilidade do projeto.

**Canal:** marlongc25@protonmail.com
**Assunto:** `[A11Y] <descrição breve>`

**Inclua, se possível:**
- Funcionalidade afetada
- Tecnologia assistiva usada (leitor de tela, modo, navegador)
- Sistema operacional
- O que esperava e o que aconteceu
- Sugestão de melhoria (opcional)

**Alternativa:** abrir [Issue no GitHub](https://github.com/Magoc25/calendario/issues) com label `accessibility`.

---

## 8. Compromisso de melhoria contínua

- 📋 **Auditoria anual** de acessibilidade conforme WCAG 2.2 e ABNT NBR 17225:2025
- 📋 Cada nova funcionalidade é avaliada quanto a acessibilidade antes do release
- 📋 Issues marcadas com `accessibility` têm prioridade no roadmap
- 📋 Atualização desta declaração quando houver mudança material

**Próxima revisão prevista:** 2027-05-16

---

## 9. Status de conformidade WCAG 2.2 (resumo)

| Princípio | Status |
|---|---|
| 1. Perceptível | 🟡 Parcialmente conforme (limitações em heatmaps) |
| 2. Operável | 🟡 Parcialmente conforme (limitações em drag & drop) |
| 3. Compreensível | ✅ Conforme |
| 4. Robusto | ✅ Conforme |

**Nível geral:** **WCAG 2.2 nível A** conformidade completa, **nível AA** parcial.

---

## 10. Base legal e referências

### Legislação brasileira
- [Lei 13.146/2015 — LBI (Planalto)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm) — Art. 63: obrigatoriedade
- [Decreto 6.949/2009 — Convenção da ONU sobre Pessoas com Deficiência](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/decreto/d6949.htm)

### Normas técnicas
- [WCAG 2.2 — W3C](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [ABNT NBR 17225:2025 — Acessibilidade em sistemas web](https://www.gov.br/governodigital/pt-br/noticias/nova-norma-abnt-para-sistemas-web-amplia-inclusao-digital-de-pessoas-com-deficiencia)
- [eMAG — Modelo de Acessibilidade](https://emag.governoeletronico.gov.br/)

### Recursos do desenvolvedor
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM — Web Accessibility In Mind](https://webaim.org/)

---

## 11. Histórico de versões

| Versão | Data | Mudanças |
|---|---|---|
| 1.0 | 2026-05-16 | Versão inicial — WCAG 2.2 nível AA parcial, ABNT NBR 17225:2025, LBI Art. 63 |

---

**© 2026 MGC Dev — Marlon Gomes da Costa**

📄 Documentos relacionados:
- [PRIVACY.md](./PRIVACY.md) — Aviso de Privacidade
- [SECURITY.md](./SECURITY.md) — Política de Segurança
- [TERMS.md](./TERMS.md) — Termos de Uso
