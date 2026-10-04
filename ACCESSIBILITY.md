# Declaração de Acessibilidade — Rumo

**Versão:** 1.2 · **Última atualização:** 2026-10-04 · **App:** v2.14.0

> Este documento atende ao **Art. 63 da Lei nº 13.146/2015** (Lei Brasileira de Inclusão — Estatuto da Pessoa com Deficiência) e segue as **Diretrizes de Acessibilidade para Conteúdo Web (WCAG) 2.2** do W3C e a norma **ABNT NBR 17225:2025**.

> ✅ **O que mudou na versão 2.14.0 do app (2026-10-04).** Em **todos os designs**: as 17 janelas (modais e folhas) se anunciam como diálogo, com nome; os 14 rótulos do formulário de evento estão ligados aos campos; 86 botões e controles que só tinham ícone ou símbolo ganharam nome para leitores de tela. No novo design **Meridiano**, em teste: todo texto de evento passa do contraste mínimo nos modos claro e escuro, o foco do teclado aparece em todos os controles, a preferência "reduzir movimento" do sistema é respeitada e nenhum controle do celular fica abaixo de 24 px. Os problemas de contraste, foco e toque continuam no design Classic — estão descritos abaixo, com os números.

> ⚠️ **Nota de correção (2026-10-03, versão 1.1).** A versão 1.0 marcava como cumpridos vários itens que nunca tinham sido medidos — entre eles "contraste mínimo 4,5:1 em todos os temas", "modais com `role="dialog"`", "rótulos associados aos campos" e "fontes em unidades relativas". Desde a 1.1, este documento traz o que foi **medido**, com o número ao lado, e marca como "não verificado" o que ainda não foi conferido.
>
> **Como foi medido:** app aberto no Chrome (1440×900 e 390×844; para alvos de toque e cortes, também 360, 375 e 430 px de largura), com dados de demonstração; contraste calculado pela fórmula da WCAG entre a cor de **cada texto** e o fundo efetivo atrás dele (transparências compostas); contagens feitas no `calendario-mgc.html`. Medições da v2.14.0 em 2026-10-04; as do Classic que não mudaram vêm da medição de 2026-10-03.

---

## 1. Compromisso de acessibilidade

O Rumo é desenvolvido com o compromisso de **inclusão e usabilidade para todas as pessoas**, incluindo aquelas com deficiência visual, motora, auditiva ou cognitiva. Esta é uma obrigação legal e um valor do projeto.

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

### 3.1 Navegação por teclado (WCAG 2.1.1, 2.4.7)

- ✅ Navegação completa via `Tab`, `Shift+Tab`, `Enter`, `Esc`
- ✅ Atalhos globais:
  - `N` — novo evento
  - `T` — ir para hoje
  - `←` `→` — período anterior/próximo
  - `Esc` — fechar modal
  - `?` — exibir lista de atalhos
- ✅ Atalhos desativados quando foco está em campo de texto (evita conflito)
- ✅ **Meridiano:** foco visível em todos os controles (`:focus-visible` com contorno na cor de destaque; campos com anel de foco)
- ⚠️ **Classic, Lumina e Crystal:** 14 regras do CSS removem o contorno de foco (`outline:none`) sem um estilo substituto; nesses controles o foco do teclado não aparece

### 3.2 Contraste de cor (WCAG 1.4.3)

Medido em 2026-10-04 (v2.14.0), cada texto contra o fundo efetivo:

| Onde | Design e tema | Contraste medido | Mínimo WCAG |
|---|---|---|---|
| Título dos eventos, vistas **Mês** e **Semana** | Meridiano, claro e escuro, qualquer cor de destaque | 10,1 a 18,1 : 1 ✅ | 4,5 : 1 |
| Horário e "faltam N dias" dos eventos | Meridiano, claro e escuro | 6,2 a 9,1 : 1 ✅ | 4,5 : 1 |
| Número dos dias de outro mês | Meridiano | 4,7 : 1 (claro) e 6,1 : 1 (escuro) ✅ | 4,5 : 1 |
| Texto dos eventos na vista **Mês** | Classic — Oceano, Aurora, Ardósia | mínimo de 1,7 a 2,1 : 1 ❌ (máximo 5,9 a 6,7) | 4,5 : 1 |
| Eventos na vista **Semana** | Classic — Oceano | 6,3 a 8,1 : 1 ✅ | 4,5 : 1 |
| Eventos na vista **Semana** | Classic — Aurora | 1,6 a 2,2 : 1 ❌ | 4,5 : 1 |
| Eventos na vista **Semana** | Classic — Ardósia | 1,3 a 1,8 : 1 ❌ | 4,5 : 1 |
| Número dos dias de outro mês | Classic — Oceano | 1,9 : 1 ❌ | 4,5 : 1 |

- ❌ Classic nos temas escuros (Aurora, Ardósia): os dias de outro mês na vista Mês ficam com fundo claro fixo, que não acompanha o tema
- ℹ️ Lumina e Crystal não foram medidos separadamente
- ✅ No Meridiano, o título do evento fica sempre em cor neutra; a cor do evento vira ponto, barra e fundo suave — por isso o contraste não depende da cor escolhida
- ✅ 3 níveis de densidade (Compacto/Normal/Grande) — usuário escolhe
- ⚠️ Cor personalizada: usuário pode criar combinações com baixo contraste (sua responsabilidade)

### 3.3 Idioma e semântica (WCAG 3.1.1, 1.3.1, 4.1.2)

- ✅ `<html lang="pt-BR">` declarado
- ⚠️ HTML semântico parcial: há `<aside>` (barra lateral) e `<nav>` (navegação inferior no celular); não há `<header>` nem `<main>`; as janelas são `div` com `role="dialog"`
- ✅ Rótulos dos campos: os 14 rótulos do formulário de evento estão ligados aos campos por `for` — tocar ou clicar no rótulo leva ao campo, e o leitor de tela lê o rótulo
- ✅ Botões só com ícone ou símbolo têm nome acessível (`aria-label`): 86 controles ganharam nome na v2.14.0; uma verificação automática confere que nenhum botão só com ícone fica sem nome nas telas principais

### 3.4 Estrutura e hierarquia (WCAG 1.3.1)

- ❌ Não há `<h1>`; os títulos das telas são elementos de texto estilizados, sem marcação de cabeçalho
- ⚠️ Regiões nomeadas: só `<aside>` e `<nav>`
- ⚠️ Listas de eventos, tarefas e rotinas são `div`; o app tem 1 `<ol>` e nenhum `<ul>` no HTML base

### 3.5 Texto alternativo e ícones (WCAG 1.1.1)

- ✅ **Meridiano:** os ícones da interface são desenhos marcados como decorativos (`aria-hidden="true"`); o nome vem do texto ou do `aria-label` do botão
- ⚠️ **Classic, Lumina e Crystal:** os ícones da interface são emojis; leitores de tela anunciam os emojis junto com o texto dos botões
- ✅ Ícones funcionais: acompanhados de texto ou de nome acessível
- ⚠️ Algumas imagens decorativas podem não ter `alt` explícito

### 3.6 Redimensionamento de texto (WCAG 1.4.4)

- ℹ️ Zoom do navegador até 200%: não verificado
- ✅ 3 níveis de densidade ajustam tamanho de fonte e espaçamento
- ⚠️ Tamanhos de fonte em `px`: o zoom do navegador funciona, mas a preferência de tamanho de fonte do sistema não é respeitada
- ✅ **Meridiano no celular:** campos de texto com 16 px, para o iPhone não aplicar zoom ao tocar

### 3.7 Tempo e movimento (WCAG 2.2.1, 2.3.1, 2.3.3)

- ✅ Sem conteúdo piscante (>3x/segundo)
- ✅ Sem animações automáticas longas
- ✅ Animações curtas (≤0.3s)
- ✅ **Meridiano:** respeita a preferência "reduzir movimento" do sistema (`prefers-reduced-motion`) — as transições ficam instantâneas (conferido emulando a preferência no Chrome)
- ⚠️ **Classic, Lumina e Crystal:** não respeitam essa preferência
- ✅ Alertas/notificações sem limite de tempo para leitura

### 3.8 Alvos de toque (WCAG 2.5.8 — nível AA do 2.2)

- ✅ **Meridiano no celular** (medido em 390 px, nas abas e janelas): nenhum controle visível abaixo de 24 px; os de uso frequente têm 34 px ou mais. O quadradinho de concluir da aba Hoje mantém o desenho de 14 px, com área de toque de 25 × 31 px. Na vista Mês, os pontos dos eventos não são alvos separados: o toque vai para o dia inteiro.
- ⚠️ **Classic** (medido em 2026-10-03, vista Mês, 390 px): 18 de 26 controles visíveis têm menos de 44 px em alguma dimensão; 4 de 26 têm menos de 24 px de altura (botões do rodapé, com 19 px)
- ✅ FAB (botão flutuante de novo evento) com tamanho generoso nos dois designs

### 3.9 Identificação de erros (WCAG 3.3.1)

- ✅ Mensagens de erro em texto (não apenas cor)
- ✅ Toast com mensagens descritivas
- ✅ Validação inline em formulários

### 3.10 Compatibilidade com leitores de tela (WCAG 4.1.2)

- ✅ As 17 janelas (modais e folhas, no computador e no celular) declaram `role="dialog"`, `aria-modal="true"` e um nome (o título da janela ou um rótulo)
- ✅ ARIA nos controles: 91 `aria-label` no código (eram 2 na v2.13.2)
- ℹ️ Gerenciamento de foco ao abrir e fechar modais: não verificado
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

- ℹ️ **NVDA** (Windows) — sem registro de teste
- ℹ️ **VoiceOver** (macOS/iOS) — sem registro de teste
- ℹ️ **TalkBack** (Android) — sem registro de teste
- ⚠️ **JAWS** (Windows) — não testado (sem licença disponível)

> A versão 1.0 marcava NVDA e VoiceOver como testados, mas não há registro desses testes no histórico do projeto. As melhorias da v2.14.0 foram conferidas no código e por testes automáticos, não com leitor de tela; ficam como pendentes até serem feitas e anotadas.

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

**Próxima revisão prevista:** quando o Meridiano deixar de ser teste (passar a ser oferecido a todos), e no máximo em 2027-05-16

---

## 9. Status de conformidade WCAG 2.2 (resumo)

| Princípio | Status |
|---|---|
| 1. Perceptível | 🟡 Parcialmente conforme (no Classic: contraste dos eventos e temas escuros — §3.2; em todos: cabeçalhos e estrutura — §3.4) |
| 2. Operável | 🟡 Parcialmente conforme (no Classic: foco visível e alvos de toque — §3.1, §3.8; em todos: drag & drop — §4) |
| 3. Compreensível | 🟢 Rótulos associados aos campos desde a v2.14.0 (§3.3); sem pendência medida |
| 4. Robusto | 🟡 Parcialmente conforme (janelas e botões com nome desde a v2.14.0; foco ao abrir janelas e teste com leitor de tela pendentes — §3.10, §5) |

**Nível geral:** **WCAG 2.2 níveis A e AA parciais.** O design Meridiano, em teste, atende aos itens de contraste, foco visível, movimento reduzido e alvos de toque medidos acima; o Classic ainda não.

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
| 1.2 | 2026-10-04 | App v2.14.0. Em todos os designs: janelas como diálogo com nome (17), rótulos do formulário ligados aos campos (14), nome acessível nos botões só com ícone (86). Contraste medido de novo, texto por texto: no Meridiano todo texto de evento passa do mínimo nos dois modos; o Classic segue abaixo no Mês e na Semana dos temas escuros. Meridiano com foco visível, movimento reduzido, campos de 16 px e alvos de toque ≥24 px no celular |
| 1.1 | 2026-10-03 | Correção: os itens da 1.0 foram medidos no app (v2.13.2) e vários não se confirmaram — contraste (eventos no Mês e na Semana dos temas escuros), rótulos dos campos, `role="dialog"`, cabeçalhos, foco visível, fontes em `px`, alvos de toque e testes com leitor de tela sem registro. Cada item traz agora o valor medido ou "não verificado" |
| 1.0 | 2026-05-16 | Versão inicial — WCAG 2.2 nível AA parcial, ABNT NBR 17225:2025, LBI Art. 63 |

---

**© 2026 MGC Dev — Marlon Gomes da Costa**

📄 Documentos relacionados:
- [PRIVACY.md](./PRIVACY.md) — Aviso de Privacidade
- [SECURITY.md](./SECURITY.md) — Política de Segurança
- [TERMS.md](./TERMS.md) — Termos de Uso
