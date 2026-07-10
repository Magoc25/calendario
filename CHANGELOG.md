# Changelog — Calendário MGC

Todas as mudanças notáveis neste projeto estão documentadas aqui.  
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [2.6.3] — Julho 2026

### 🐛 Corrigido — banner de atualização voltando a cada abertura do app (Safari/macOS)
- O Safari pode "ressuscitar" um Service Worker em espera a **cada abertura fria** do app — muitas vezes **idêntico** ao que já está rodando (ou uma cópia antiga do cache). O app tratava "existe worker esperando" como "existe atualização" e mostrava o banner de novo, mesmo com tudo em dia. Agora a página faz um **handshake de versão** com os dois workers antes de avisar: cópia idêntica é ativada em silêncio (sem banner e sem recarregar), cópia mais antiga é ignorada, e o banner só aparece quando a versão em espera é **realmente mais nova**.
- Este banner pode aparecer **uma última vez** ao receber esta atualização (o worker antigo ainda não sabe responder ao handshake) — clique em Atualizar e pronto.

### 🔧 Infra
- Smoke-test: 94 → 96 checagens.

---

## [2.6.2] — Julho 2026

### 🐛 Corrigido — banner "Atualização baixada" persistente no Safari/macOS
- **Botão Atualizar confiável no Safari** — o clique lia o estado do Service Worker **depois** de um re-check que podia renová-lo, caindo num recarregamento cru que servia a página antiga (e o banner voltava). Agora aplica direto o SW que está esperando; e como o Safari nem sempre dispara o `controllerchange`, a página também escuta a ativação do próprio worker para recarregar uma única vez.
- **O ✕ agora silencia o aviso por 24 horas** — antes ele só escondia até o próximo carregamento, então o banner "voltava sempre". A atualização continua sendo aplicada sozinha quando todas as janelas do app são fechadas.

### 🔧 Infra
- Smoke-test: 91 → 94 checagens (banner de update coberto).

---

## [2.6.1] — Julho 2026

Release de proteção do sync — elimina o vetor de perda de notas/configurações quando um dispositivo desatualizado (ou aberto há muito tempo) sobrescrevia na nuvem o que outro dispositivo tinha acabado de criar (ocorrido real: Safari/macOS com versão antiga em cache apagou nota e configurações feitas no Windows).

### 🛡️ Sync — merge em vez de sobrescrever
- **Notas da aba Notas** agora sincronizam por **merge por id + tombstones** (mesmo padrão das Listas e dos eventos): nenhum dispositivo apaga a nota que outro criou; conflito na mesma nota vence a edição mais recente; exclusão propaga sem "ressuscitar" a nota.
- **Notas por data/evento** sincronizam por **merge por chave com carimbo de edição** e tombstones — edição e exclusão propagam por chave, sem last-write-wins do bloco inteiro. Formato retrocompatível: dispositivo em versão antiga continua vendo as notas normalmente.
- **Todo envio à nuvem virou pull-merge-push** — antes de subir, o app baixa o estado da nuvem e mescla eventos, listas e notas; um dispositivo com dados velhos incorpora o que há de novo em vez de sobrescrever.
- **Sincronização ao voltar ao app** — trocar de aba/janela e voltar dispara um pull (no máx. 1×/min): mudanças feitas em outro dispositivo chegam sem precisar reabrir.

> 💡 **Dispositivo ainda em versão antiga?** Abra-o, aplique a atualização (banner "Atualizar") e **confira a versão no rodapé antes de editar dados** — versões ≤2.3.1 ainda podem sobrescrever a nuvem na primeira abertura (bug corrigido na 2.4.0).

### 🔧 Infra
- Smoke-test ampliado para 91 checagens (7 novas cobrindo os merges de notas).

---

## [2.6.0] — Julho 2026

Aba Listas turbinada: arquivar, limpar concluídos, modelos e — o destaque — fixar a lista inteira na aba Hoje.

### 🆕 Adicionado — aba Listas
- **Fixar a lista inteira na aba Hoje** (📌) — a lista aparece em ✅ Tarefas de hoje como uma linha recolhível: título + progresso (ex.: 3/8); expanda (▸) para ver e marcar os itens (o check vale nos dois sentidos — Hoje ↔ Listas). Fica fixada até você desafixar. O **check da própria lista** a conclui: ela aparece riscada/✓ na aba Listas e segue na Hoje como concluída até desafixar (ou reabra com ↩).
- **Arquivar lista** (🗄) — guarda uma lista sem excluí-la; sai dos grupos por mês e vai para a seção recolhível **🗄 Arquivadas**; desarquivar por 📤. Desfazer restaura.
- **Limpar concluídos** (🧹) — remove de uma vez os itens já marcados de uma lista (Desfazer restaura todos).
- **Enviar item para outra aba** — cada item da lista ganha **📌** (manda para ✅ Tarefas de hoje) e **📅** (abre o modal de novo evento já com o título). Não removem o item da lista.
- **Modelos de lista** (📋) — salve uma lista como modelo (guarda os itens) e crie novas listas a partir dele com um toque.

### ⚠️ Migração — quem sincroniza via Supabase (opcional)
Só para os **modelos de lista** sincronizarem entre dispositivos, rode no SQL Editor do Supabase **do calendário**:
```sql
alter table cal_sync add column if not exists list_templates text;
```
Sem rodar, tudo funciona — os modelos ficam apenas no aparelho (o resto do sync não é afetado). Fixar/concluir listas já sincroniza sem mexer no banco.

### 🔧 Infra
- Smoke-test ampliado para 84 checagens.

---

## [2.5.1] — Julho 2026

### 🐛 Corrigido
- **Versão exibida no rodapé** — depois de atualizar o app, o rodapé continuava mostrando a versão anterior por até 6 horas (era buscada do CHANGELOG e guardada num cache de 6h). Agora reflete **imediatamente** a versão do app que está rodando. Detectar que há uma versão nova disponível continua sendo feito pelo aviso de atualização.

> 💡 **Se o app ainda mostra uma versão antiga:** é o cache do app (PWA). Feche o Calendário **completamente** (todas as janelas/abas) e reabra — ao reabrir, a versão nova entra. No app instalado, encerre e abra de novo; se aparecer o aviso **"Atualização baixada — Atualizar"**, clique nele.

---

## [2.5.0] — Julho 2026

Aba Notas mais rica (inspirada no app Notas do Mac), aba Listas organizada por mês e correções de usabilidade do editor.

### 🆕 Adicionado — aba Notas
- **Checklist dentro da nota (☑)** — lista de tarefas com caixinhas clicáveis: marcar tacha o texto; Enter num item marcado cria o próximo desmarcado; ☑ de novo desfaz; ☰ converte checklist↔lista comum. O check é aplicado **na linha onde o cursor está**.
- **Estilos de título** — select "Estilo do parágrafo" (Texto / Título / Subtítulo) na toolbar; acompanha o bloco sob o cursor.
- **Tags #hashtag** — qualquer `#palavra` no título ou texto vira tag automaticamente; barra de chips na aba filtra por tag (a tag é o próprio texto, nada extra a gerenciar).
- **Busca global inclui as notas** — o 🔍 do header agora encontra notas avulsas (grupo 🗒 com preview); clicar abre a nota direto.
- **URLs clicáveis** — links soltos no texto viram clicáveis ao salvar (abrem em nova aba).
- **Tabela (⊞)** — 2×3 editável; Tab navega células (na última, cria linha); com o cursor numa célula aparece o botão **✎ Tabela** ao lado do ⊞, com o menu de operações: ＋/− linha e coluna, mover linha ↑/↓ e coluna ←/→, excluir a tabela.

### 🆕 Adicionado — aba Listas
- **Grupos por mês de criação** — as listas ficam em caixas recolhíveis ("Julho/2026"); clique para abrir; o app lembra quais meses você deixou abertos; o mês de uma lista nova já abre expandido.
- **Título + (data de criação)** em cada lista; dentro do mês, ordenadas por data (mais recente primeiro).
- **Busca 🔍** por título da lista ou texto dos itens (a busca expande os grupos).
- **Tags #hashtag** no título/itens com chips de filtro (igual à aba Notas).
- O arrastar para reordenar **listas** saiu (a ordem agora é por data); reordenar **itens** dentro da lista continua.

### 🐛 Corrigido — editor de notas (o "parece que não funciona")
- Toolbar da aba Notas ganha **estado ativo** nos botões (B/I/U/listas/alinhamento acendem).
- Formatação com o cursor **no meio de uma palavra** aplica à palavra inteira (estilo Word) — antes o clique "não fazia nada" visível ou agia no fim da nota.
- **Criar checklist/lista não "engole" mais a tabela** acima do cursor — converte só a linha atual; com o cursor dentro de uma tabela, a lista nasce logo abaixo dela.
- **Desfazer (Ctrl+Z) preservado** ao criar listas (comando nativo primeiro; o manual só entra quando o navegador falha — Safari).
- **Marca-texto no Safari** — fallback `backColor` (o `hiliteColor` não é suportado lá).
- **Esvaziar uma nota agora salva o vazio** — o conteúdo antigo não "volta" mais ao reabrir.

### 🔧 Infra
- Smoke-test ampliado para 65 checagens (editor, checklist, tabela, tags, buscas, aba Listas).

---

## [2.4.0] — Julho 2026

Release de confiabilidade: auditoria completa do código + correção de tudo o que foi encontrado.

### 🐛 Corrigido — sincronização (o mais importante)
- **Eventos não se sobrescrevem mais entre dispositivos** — o sync de eventos agora mescla por `id` com tombstones (mesmo padrão que salvou as Listas na 2.3.1): um aparelho com estado antigo não apaga mais o que o outro criou; exclusões propagam sem "ressuscitar" eventos.
- **Fim das exclusões indevidas no Google Calendar** — um evento ausente no payload da nuvem não entra mais na fila de exclusão do Google; só exclusão explícita feita em outro dispositivo.
- **Corrida na abertura do app** — um save feito enquanto o primeiro pull da nuvem ainda estava em voo não empurra mais estado velho por cima de dados mais novos; o sync do Google espera o primeiro pull do Supabase.
- **Dedup do Google Calendar** passou a considerar o horário — dois eventos legítimos com o mesmo título no mesmo dia (ex.: "Reunião" 9h e 15h) não se apagam mais silenciosamente.

### 🐛 Corrigido — Google Calendar
- **Links do Meet em eventos recorrentes** agora carregam (o link das instâncias propaga ao evento-base) e o pull é **paginado** (mais de 500 eventos não são mais cortados).
- Horários importados são convertidos ao **fuso do aparelho**; evento de dia inteiro de 1 dia não vira mais barra de 2 dias; editar no Google **não zera mais** categoria/cor/tags locais; a descrição não duplica mais "Categoria:/Tags:" a cada sincronização.

### 🐛 Corrigido — geral
- **Backup completo (v7)**: exporta e restaura também notas avulsas, calendários, categorias e checks de rotinas (antes o restore perdia esses dados em silêncio); o import agora persiste as notas e reagenda os alertas.
- **Atualização do app controlada**: a nova versão só é aplicada ao clicar **Atualizar** no banner (elimina o estado quebrado no meio da sessão — provável causa do travamento no Safari/macOS ao atualizar); o app checa atualização a cada hora.
- **Alertas**: alerta atrasado há mais de 12h não dispara mais ao acordar o app; o adiar (+30min/+1h) não se perde mais.
- **Segurança**: escape de HTML nos pontos que faltavam (nomes de calendário, títulos em vários painéis) e link do Meet só aceita `https://`.
- **Exportação .ics**: eventos de vários dias exportam a data final correta; títulos com vírgula/ponto-e-vírgula não quebram mais o arquivo.
- Evento com data final anterior à inicial não "some" mais (ajuste automático com aviso); categorias (nomes/ícones) sincronizam entre dispositivos; notas de evento excluído são limpas (Desfazer restaura); toast de edição correto; e outras correções menores.

### 🔧 Infra
- Smoke-test automatizado (`tests/smoke.cjs`, 35 checagens) rodado antes de cada mudança.
- Deploy do site via GitHub Actions (sem o build legado do Jekyll); o commit diário de estatísticas não dispara mais deploy.

### ⚠️ Migração — quem sincroniza via Supabase (1x por conta)
Rode no **SQL Editor** do projeto Supabase **do calendário** (o mesmo do botão ☁️):
```sql
alter table cal_sync add column if not exists categories text;
```
Sem rodar, tudo continua funcionando — só as categorias ficam locais até o comando ser executado. Abra a **2.4.0 em todos os aparelhos**; enquanto um aparelho estiver na 2.3.x ele não lê o formato novo de eventos, mas **não há perda de dados** (ao atualizar, tudo aparece mesclado).

---

## [2.3.1] — Junho 2026

### 🐛 Corrigido
- **Listas desaparecendo entre dispositivos** — uma lista criada em um aparelho podia sumir quando o outro aparelho (ainda com a aba Listas vazia) sincronizava: o estado vazio sobrescrevia o da nuvem. Agora o sync **mescla item a item** em vez de substituir tudo — nenhum aparelho apaga o que outro criou. Excluir uma lista ou item continua se propagando para os outros aparelhos, e o **Desfazer** reverte normalmente.

### ⚠️ Para valer nos dois aparelhos
Abra a **2.3.1** em **todos** os dispositivos (pode ser preciso fechar e reabrir o app uma vez). **Não precisa mexer no Supabase.** Enquanto um aparelho continuar na 2.3.0, ele não exibe as listas no formato novo — mas **não há mais perda de dados**: ao atualizar, tudo reaparece.

---

## [2.3.0] — Junho 2026

### 🆕 Adicionado
- **Aba Listas** — listas nomeadas de tarefas **sem horário** (ex.: supermercado, viagem a trabalho, pendências). Crie a lista, adicione itens com a mesma praticidade do ✅ Tarefas de hoje (Enter/＋, dar check, excluir com **Desfazer**); contador `feitos/total` por lista; mesma aba **📋 Listas** no celular e no computador. Sincroniza via Supabase e entra no backup JSON.
- **Reordenar arrastando (drag & drop)** — reorganize as listas e os itens dentro de uma lista. No computador, arraste; no celular, **segure ~500ms** e arraste. Não atrapalha a captura: tocar para checar/excluir e **rolar** a lista continuam instantâneos.

### 🔧 Alterado
- Aba **"Próximos" / "Lista"** substituída pela nova **📋 Listas** — os próximos eventos continuam acessíveis pela aba **Mês** + mini-calendário da barra lateral.

### 🐛 Corrigido
- Drag das Listas no celular: o long-press deixou de disparar a seleção de texto/lupa do sistema, que travava o arrasto.

### ⚠️ Migração — quem sincroniza via Supabase
Rode **uma vez** no SQL Editor do seu Supabase do calendário:
```sql
alter table cal_sync add column if not exists lists text;
```
Sem isso, as listas funcionam, mas ficam **só no dispositivo** (o resto do sync não é afetado).

---

## [2.2.0] — Junho 2026

### 📱 Mobile — Experiência aprimorada

#### 🆕 Adicionado
- **Janela flutuante de dia** — ao tocar num dia na aba Mês, abre um card flutuante com visual polido (margens, cantos arredondados, sombra), listando todos os eventos do dia com horário e opção de ir para o dia completo
- **Ícone 📝 na janela flutuante** — eventos com notas exibem o ícone ao lado do título; toque abre o editor de notas diretamente, sem passar pelo menu de contexto
- **Drag & drop de notas no mobile** — reordene cards de notas com long press (400ms) + arrastamento; ghost visual com rotação durante o drag
- **Abas Mês/Semana visíveis no Stats** — o modal de estatísticas agora exibe as duas abas de período também no mobile (estavam ocultas)

#### 🆕 Adicionado
- **Histórico de tarefas** — botão 📋 no painel "Tarefas de hoje" abre modal com todas as tarefas de dias anteriores, agrupadas por data (mais recentes primeiro) com status ✅/⬜ e contagem de concluídas; purge automático de tarefas com mais de 90 dias

#### 🔧 Melhorado
- **FAB translúcido** — botão flutuante + no mobile agora tem fundo semitransparente (76% opacidade + backdrop-filter blur), permitindo ver o conteúdo por baixo; toque restaura opacidade total como feedback
- Formulário de evento no mobile alinha ao topo visível e rola automaticamente até o campo focado, evitando que o teclado cubra o conteúdo

---

### 🖥️ Desktop — Experiência aprimorada

#### 🆕 Adicionado
- **Janela flutuante de dia na aba Mês** — clicar num dia abre painel flutuante com lista de eventos, menu de contexto por clique direito e botão para abrir o dia completo
- **Menu de contexto no painel do dia** — clique direito nos eventos do day panel agora abre o menu de contexto (Editar, Notas, Pular, Excluir)
- **Ícone 📝 ao lado do título no painel do dia** — eventos com notas exibem o ícone 📝 (15px) ao lado do título; clique abre o editor de notas diretamente

---

### 🔄 Rotinas

#### 🆕 Adicionado
- **Dias de descanso em rotinas diárias** — rotinas com frequência "Todos os dias" podem ter dias de folga definidos; a sequência (streak) não é quebrada nos dias de descanso configurados
- **Dashboard de progresso na aba Rotinas** — heatmap anual de check-ins, métricas de streaks e barras de progresso por rotina
- **Ordenação por horário na aba Hoje** — rotinas do dia aparecem na ordem do horário definido (sem horário vão para o final)

#### 🔧 Melhorado
- **Ordenação por horário na aba Rotinas** — lista de rotinas agora também é ordenada por horário (igual à aba Hoje), em vez de ordem de criação
- Frequência simplificada: removida a opção "Personalizado" que era idêntica a "Dias da semana"; agora só duas opções claras: **Todos os dias** e **Dias da semana**
- A lista de rotinas exibe os dias selecionados explicitamente (ex: "Seg, Ter, Qui") em vez do genérico "Dias úteis"

---

### 🗂️ Categorias de Eventos

#### 🆕 Adicionado
- **Gerenciamento de categorias** — botão ⚙️ Gerenciar no formulário de evento permite criar categorias personalizadas (nome + emoji) e excluir as existentes; grid visual com 44 emojis para seleção rápida
- Ícones das categorias personalizadas aparecem automaticamente nas pílulas do calendário, aba Próximos, busca e notificações

---

### ✍️ Aba Revisão

#### 🔧 Melhorado
- **Cards de estatísticas padronizados** — Eventos, Rotinas e Tarefas agora têm layout idêntico: fração `X/Y` à esquerda, `%` à direita e barra de progresso na base, na cor do tema ativo
- Eventos agora exibem `concluídos/total` em vez de apenas o total

---

### 🎨 Densidade / Tema

#### 🆕 Adicionado
- **Nível de densidade "Grande"** — novo nível de espaçamento acima do Normal, para telas maiores ou preferência por mais espaço
- **Botão ativo destacado** — o botão da densidade em uso fica com borda e fundo na cor do tema (igual ao comportamento dos temas)

#### 🔧 Melhorado
- Densidade agora cobre todas as abas: Rotinas, Revisão, Notas, Busca e Sidebar — antes só funcionava em Mês, Hoje, Semana e Próximos

---

### 📝 Notas

#### 🆕 Adicionado
- **Drag & drop para reordenar notas** — arraste os cards na aba Notas para reorganizar a ordem manualmente (desktop e mobile)
- **Toast com Desfazer** — exclusão de eventos, notas, rotinas e tarefas exibe toast com botão "Desfazer" por alguns segundos

---

### 📊 Analytics

#### 🆕 Adicionado
- **Horas por categoria no modal Stats** — nova seção "⏱ Horas por categoria" exibe barras horizontais com o tempo total por categoria (horas + minutos) no período selecionado (Mês ou Semana); label inclui contagem de eventos entre parênteses; exibe mensagem quando não há eventos com horário definido no período

---

### 🎨 Cores de eventos por categoria

#### 🔧 Melhorado
- **Pílulas (Mês) e blocos (Semana) agora usam a cor da categoria** em vez da cor por tipo de recorrência; fundo da pílula: cor da categoria a ~13% de opacidade; texto: cor da categoria saturada; fundo do bloco semana: cor da categoria a ~9% de opacidade (nível mantido); borda esquerda permanece associada ao calendário em ambas as views; fallback: cor própria do evento → cor do calendário; `--pill-ev-color` atualizado para refletir categoria (mobile dots)

---

### 🔍 Busca — painel de detalhes do evento

#### 🆕 Adicionado
- **Search Result Panel** — clicar num resultado da busca abre painel flutuante com detalhes do evento em vez de abrir o formulário de edição diretamente; mostra: título (com riscado se concluído), data + hora, localização, calendário (se não Geral), tags, trecho da descrição (3 linhas) e indicador "📝 Tem anotações" se houver nota; para eventos recorrentes, exibe a próxima ocorrência a partir de hoje; rodapé com botões [📝 Notas] [✏️ Editar] [⋯ menu de contexto]; right-click no corpo (desktop) e long press (mobile) abrem o ctx menu; ações do ctx menu fecham o painel automaticamente; reutiliza CSS `.mds-sheet` / `.mds-overlay` sem HTML novo

---

### 🎓 Onboarding

#### 🆕 Adicionado
- **Guia rápido para novos usuários** — modal com 3 slides exibido automaticamente na primeira visita; apresenta os diferenciais do app (gratuito/offline/sem conta), as 7 visualizações e o campo de criação rápida; dots de progresso animados; botão "Pular" ou "Começar 🚀" no último slide; re-acessível via botão "📖 Guia rápido" no rodapé do sidebar; estado salvo em `cal_onboarding_done` no localStorage

---

### ⚡ Quick add

#### 🆕 Adicionado
- **Campo de criação rápida** — disponível no header (desktop) e como segundo row do header (mobile, com botão ⚡); cria o evento diretamente ao pressionar Enter ou ⚡, sem abrir formulário; parser extrai: hora (`14h`, `14h30`, `14:30`), data relativa (`hoje`, `amanhã`), dia da semana (`segunda`, `terça-feira`…), **categoria** (match pelo nome contra as categorias salvas) e **calendário** (match pelo nome); o restante vira o título; se a categoria tiver template, aplica duração configurada; fallback 60 min; local do template aplicado ao evento; toast com Desfazer por 5s; Esc limpa e desfoca

---

### 📋 Templates de categoria

#### 🆕 Adicionado
- **Duração e local padrão por categoria** — ao clicar em uma categoria no formulário de evento, a hora de fim é calculada automaticamente (início + duração configurada) e o local padrão é preenchido se estiver vazio; configuração via botão ⏱ no painel ⚙️ Gerenciar de cada categoria; templates salvos em `cal_cat_templates` no localStorage; não aplica ao editar evento existente

---

### ⌨️ Atalhos de teclado

#### 🆕 Adicionado
- **Atalhos globais de navegação** — `N` novo evento, `T` ir para hoje, `←` período anterior, `→` próximo período, `Esc` fechar modal aberto, `?` lista de atalhos; desativados enquanto o foco está em campo de texto ou modal aberto; lista de atalhos exibida em modal dedicado criado dinamicamente

---

### ⚡ Performance e Qualidade de Código

#### 🔧 Melhorado
- Memoização de `buildEvMap` — mapa de eventos não é reconstruído desnecessariamente a cada render
- Cache de referências DOM frequentes — reduz buscas no DOM em operações repetitivas
- Throttle no SW fetch — verificação de alertas limitada a 1× por 30s para não sobrecarregar em fetch intensivo
- Parser ICS mais robusto — suporte a line folding, DTEND multi-dia, UNTIL e COUNT; compatibilidade ampliada com exportações do Google Calendar e Apple Calendar

#### 🔒 Segurança
- Corrigidas vulnerabilidades de XSS em campos de entrada do formulário
- Tratamento correto do token OAuth do Google Calendar (não exposto em logs)
- Erros silenciosos (`catch` vazios) substituídos por tratamento explícito com feedback ao usuário

---

### 🐛 Correções

- **Régua de horas da aba Semana alinhada** — labels e slots desalinhados no mobile porque `todayCard` comprimia os slots (sem `flex-shrink:0`) enquanto os labels tinham `flex-shrink:0`; corrigido com `align-items:flex-start` e `flex-shrink:0` nos slots; altura das labels também ajustada por densidade
- **Rotina com dia de descanso aparecia na aba Hoje** — `getRoutinesForToday()` não verificava `restDays`; corrigido
- **Drag Top 3 não funcionava no desktop** — HTML5 drag API falha em containers `overflow:auto` (Chrome); substituído por custom mouse drag com `document.elementsFromPoint()` no desktop; mobile continua com HTML5 drag (funciona porque `todayCard` tem `overflow:visible`)
- **PWA instalável no desktop** — `manifest.json` atualizado: `orientation:any` (antes travava em retrato) e `display_override:window-controls-overlay`

---

---

### 🎨 Modos de Design — Classic / Lumina / Crystal

#### 🆕 Adicionado
- **3 modos de design** — Classic (padrão), ✨ Lumina (glass morphism) e 💎 Crystal (transparência máxima); selecionados via botão "Tema & Design" no header; estado salvo em `cal_design` no localStorage
- **Design Lumina** (antigo "Extra") — alternativa visual com glass morphism, aurora gradient e floating cards
- **Aurora gradient no fundo** — dois gradientes radiais sutis (azul e roxo) sobrepostos ao `var(--bg)` do tema ativo
- **Variável `--surface-glass`** por tema — light `rgba(255,255,255,.82)`; Aurora `rgba(26,29,46,.84)`; Ardósia `rgba(37,45,64,.84)` — usada em todos os floating cards
- **Header como floating card** — `backdrop-filter:blur(20px)` + `--surface-glass` + `border-radius:18px` + `margin:8px 12px 6px`; aurora visível nas margens
- **Sidebar com 4 cards flutuantes separados** — fundo transparente; cada seção (ano/nav, calendários, mini-calendários, rodapé) é um card glass independente com `backdrop-filter:blur(16px)` + borda + sombra
- **Aba Mês — card transparente** — `#monthCard` sem fundo, borda ou sombra; aurora visível entre os days; dias do mês com `background:var(--surface)` (card sólido); dias adjacentes sem fundo + borda ghost (efeito fantasma)
- **Aba Semana — colunas flutuantes** — `#weekCard` transparente; cada dia tem 2 cards separados: tag do dia (cor `--dow-bg` do tema, `border-radius:12px`, sombra) e coluna de eventos (glass `--surface-glass`, `backdrop-filter:blur(12px)`, `border-radius:12px`, separados por `margin-bottom:5px`); `column-gap:6px` entre colunas; coluna de horas transparente
- **Cal-footer glass card** — `backdrop-filter:blur(12px)` + `border-radius:12px!important` + `overflow:hidden`; standalone em todas as abas com footer visível
- **Labels `.dow`** (Dom/Seg/Ter no cabeçalho do mês) com `border-radius:8px` + padding
- **Tooltip nos slots da Semana** — hover em qualquer mini-bloco exibe caixa com intervalo de hora, dia da semana, data e CTA "Clique para agendar"

#### 🔧 Melhorado
- Todos os `color-mix()` substituídos por `rgba()`/`var()` — compatibilidade Chrome/Windows onde `color-mix()` falhava silenciosamente
- `backdrop-filter` removido de cards sem transparência real (sem ganho visual e sem custo de stacking context)
- `.week-time-spacer` transparente (eliminado bloquinho branco no canto da coluna de horas na aba Semana)

---

### 📋 Rodapé — simplificado (ambos os designs)

#### 🆕 Adicionado
- **Botão GitHub no rodapé** — ícone do GitHub (SVG inline) ao lado de Apoiar/Avaliações, abrindo o repositório do projeto em nova aba; ordem do rodapé padronizada para **GitHub → Apoiar → Avaliações → ©**

#### 🔧 Melhorado
- Removidas 7 tags de legenda por recorrência (Único/Diário/Semanal/Quinzenal/Mensal/Anual/Person.) — sistema migrou para cores por categoria; labels eram misleading
- Progresso `X/Y` exibido apenas na aba Mês; oculto em Semana e Próximos
- Label 🔄 Rotina exibida apenas na aba Mês; oculta nas demais
- Contagem bruta do banco (`62 eventos`) removida — sem contexto útil para o usuário

---

### 🐛 Correções

- **Pílula de feriado desproporcional** — `font-size` 8px → 9.5px; `padding` 1px 4px → 2px 5px; emoji 7px → 9px; agora proporcional às demais pílulas (ambos os designs)
- **Dias adjacentes na aba Mês (Design Extra)** — fundo era branco (herdado da base); corrigido para transparente; borda em força total via `border:1px solid var(--border)` sem `opacity`

---

### 💎 Design Crystal — Transparência máxima

#### 🆕 Adicionado
- **Design Crystal** (`body.design-extra.design-crystal`) — herda toda a estrutura do Lumina e sobrepõe backgrounds com opacidade mínima (`--surface-crystal` por tema: light `rgba(255,255,255,.12)`, Aurora `rgba(26,29,46,.18)`, Ardósia `rgba(37,45,64,.18)`) + blur mais intenso (22–28px)
- `--surface-crystal` definida em todos os 5 temas e no `:root` como fallback
- Header, 4 cards sidebar, cal-footer: `--surface-crystal` + `backdrop-filter:blur(28px/22px)`
- Aba Mês — dias do mês atual: `--surface-crystal` + `backdrop-filter:blur(8px)` (vidro fosco vs adjacentes transparentes) + `border:1.5px solid var(--muted)` para destaque; `border:2.5px solid var(--accent)` no dia atual com anel glow
- Aba Semana — tag do dia: perde cor sólida do tema → glass crystal; coluna de eventos: crystal
- Cal-cards (Hoje/Próximos/Rotinas/Revisão/Notas): `--surface-crystal` + `backdrop-filter`
- Cards internos (metric, stat, mood): `transparent` + só borda
- `--input-bg:var(--surface-crystal)` sobreposta — todos os campos de texto (tarefas, busca, textarea) ficam crystal automaticamente
- `.upcoming-ev`: crystal; `.now-line-time`: `--surface-glass` (legível); `.rv-filter-chip`: crystal
- Modais/popups/sheets: mantém `--surface-glass` para preservar leitura

---

### 🎨 Ajustes visuais gerais (todos os designs)

#### 🔧 Melhorado
- **Botões 🔔 e ☁️ (`hbtn-accent`)** — `background` igualado a `var(--surface2)` (mesmo fundo dos outros botões do header)
- **Efeito fantasma em pílulas de dias adjacentes** — `.day.other-month .ev-pill/.ev-more: opacity:.28 + pointer-events:none` aplicado no **Classic** (base CSS) e no **Lumina/Crystal** (já existia)
- **Dia atual aba Mês (Lumina)** — `border:2px solid var(--accent)` + `box-shadow:0 0 0 1px var(--accent)` — anel duplo na cor do tema
- **Eventos da semana** — `text-shadow` sutil adicionado no Lumina; mais intenso no Crystal — melhora leitura em temas escuros (Aurora/Ardósia)
- **`.mobile-qa-bar` (mobile)** — glass morphism completo com `border-radius:18px` + `margin:0 12px 6px` (alinhado ao header)
- **Rotação de tela (mobile)** — `"orientation"` removido do `manifest.json` (`"any"` ignorava o bloqueio do sistema); `screen.orientation.lock('portrait')` como fallback em PWA

#### 🐛 Corrigido
- Popup bloqueado no Chrome Android — `beforeinstallprompt handler` removido (causava o indicador "Sempre mostrar")

---

### ⚖️ Conformidade Legal Brasileira

#### 🆕 Adicionado
- **`PRIVACY.md`** — Aviso de Privacidade conforme **LGPD** (Lei 13.709/2018) com modelo de 3 camadas de responsabilidade, bases legais (Art. 7º), direitos do titular (Art. 18), tratamento ATPP conforme Resolução CD/ANPD nº 2/2022
- **`SECURITY.md`** — Política de Segurança e Plano de Resposta a Incidentes conforme Resolução CD/ANPD nº 15/2024; canal de update via banner + CHANGELOG como mecanismo de **culpa concorrente** (CC Art. 945 + CDC Art. 12 §3º + Lei 9.609 Art. 8º)
- **`ACCESSIBILITY.md`** — Declaração de Acessibilidade conforme **Lei 13.146/2015 (LBI Art. 63)** + WCAG 2.2 nível AA parcial + ABNT NBR 17225:2025
- **`DATA_INVENTORY.md`** — Inventário simplificado de tratamento conforme LGPD Art. 37 e Resolução ANPD 2/2022 Art. 7º (regime ATPP)
- **`TERMS.md` v2.0** — novas seções 6 (obrigações do usuário sobre atualizações + culpa concorrente), 8 (acessibilidade), 9 (uso por menores conforme ECA Digital — Lei 15.211/2025), 10 (matriz de conformidade legal)

#### Enquadramento legal aplicado
- **Agente:** Pessoa Natural (desenvolvedor independente)
- **Porte:** ATPP (Agente de Tratamento de Pequeno Porte) — Resolução CD/ANPD nº 2/2022 Art. 4º
- **Encarregado (DPO):** dispensado, mas canal de comunicação publicado
- **Sem tratamento de alto risco** — sem dados sensíveis em larga escala, sem profiling, sem decisões automatizadas

---

### 🔒 Hardening de Segurança — XSS, CSP e backend

#### 🐛 Corrigido (críticos)
- **XSS persistente em avaliações** (vetor um-para-muitos) — campos `r.name`, `r.comment` e `r.date` agora passam por `esc()` antes do `innerHTML`. Atacante podia injetar `<img src=x onerror=...>` em comment via Supabase compartilhado e roubar tokens OAuth de TODOS os usuários que abrissem o modal de avaliações. Severidade: 🟠 Alta
- **Ausência de Content-Security-Policy** — adicionada meta tag CSP no `<head>` com `script-src`, `connect-src`, `img-src`, `form-action`, `object-src` restritivos. Mesmo XSS futuro fica impossibilitado de exfiltrar dados para domínio externo (defesa em profundidade)

#### 🔧 Melhorado (XSS médios)
- **Select de calendários** — `esc()` em `c.id`, `c.name` e validação regex em `c.color` (previne CSS injection)
- **DOMPurify integrado** — biblioteca de sanitização de HTML rico carregada via CDN (`cdnjs/dompurify@3.0.8`); helper `safeHtml()` com fallback para `esc()` se CDN falhar
  - Aplicado no editor de notas por evento e notas standalone
  - Bloqueia XSS persistente via import de JSON malicioso com notas
- **Cards da aba Notas** — `esc()` em `n.title`, `n.id` e `preview(n.content)`; validação regex de `n.color`

#### 🛡️ Backend (Supabase compartilhado)
- **Constraints SQL na tabela `app_reviews`** — limites de tamanho (name ≤ 60, comment ≤ 1000), bloqueio de `<script>/<iframe>/javascript:/on*=` via CHECK constraints
- **Rate limit por trigger** — 5 minutos entre reviews do mesmo nome + project_id; previne flood/spam
- **Defesa em 4 camadas:** `esc()` (texto) + DOMPurify (HTML rico) + CSP (rede) + constraints SQL (banco)

---

### 🧹 Qualidade de Código — análise profunda

#### 🐛 Corrigido
- **Listener duplicado em `exportIcsBtn`** — clicar em "Exportar .ics" baixava o arquivo duas vezes e mostrava o toast em duplicidade (bloco idêntico repetido nas linhas 4917 e 4923)
- **TypeError no parser de .ics com `COUNT=N`** — `const d` reatribuído no loop quebrava import de eventos recorrentes do Google Calendar (formato `RRULE:FREQ=WEEKLY;COUNT=5`); corrigido para `let d`
- **Handler `transitionend` vazio** no `supabaseOverlay` — resíduo de debug que não fazia nada; removido

#### 🔒 Hardening de dependências externas
- **Versão Supabase pinada** — de `@supabase/supabase-js@2` (que resolvia para qualquer 2.x.x) para `@supabase/supabase-js@2.45.4` (versão fixa); previne atualizações inesperadas do CDN
- Comentário no bloco de `<script>` documentando processo de atualização manual

---

---

### 📅 Google Calendar — Link do Google Meet

#### 🆕 Adicionado
- **Link do Meet nos eventos sincronizados** — `hangoutLink` e `conferenceData` agora incluídos nos fields da API do Google Calendar; `meetLink` salvo em cada evento
- **Botão "🎥 Entrar no Google Meet"** — exibido no card do dia, popup do evento (pílula no modo mês), modal de edição e card de alerta
- **Botão 📋 copiar link** — ao lado do botão de entrar, em todos os pontos; muda para ✓ por 1,5s como feedback; permite abrir em qualquer navegador
- **Link no alerta** — quando o alerta OS notification dispara, mostra ação `[🎥 Abrir Meet]` que abre o Meet diretamente; útil quando o usuário está em outro app

---

### 🔔 Alertas — OS Notification

#### 🔧 Melhorado
- **Card in-app removido** — alerta agora é exclusivamente via OS notification do sistema (Windows/macOS/Android); card interno era redundante quando o usuário já está olhando o app
- **Ações dinâmicas por tipo de evento:**
  - Com Meet: `[🎥 Abrir Meet]` + `[+30 min]`
  - Sem Meet: `[+30 min]` + `[+1 hora]`
  - Clicar no corpo → abre o calendário
- **Notificações com app fechado** — timers internos no SW + heartbeat PING 25s mantêm SW ativo para disparar alertas mesmo com a janela fechada (desde que Chrome esteja rodando)

#### 🐛 Corrigido
- Alerta não re-disparava após testes — `firedAlerts` era marcado como fired mesmo sem o usuário ver; agora limpa ao salvar o evento editado
- OS notification duplicada — handler `MARK_FIRED` no SW evita que SW e main thread mostrem notificação ao mesmo tempo

---

### 🐛 Correções

- **Evento deletado voltava após sync Google Calendar** — ao receber payload do Supabase com evento removido, `gcalMarkDeleted()` agora é chamado automaticamente; impede que o Google Calendar reimporte o evento na próxima sync
- **Meet link não aparecia em eventos já sincronizados** — branch `else` do pull GCal atualiza `meetLink` independente do timestamp; painel do dia atualizado imediatamente após sync

---

## [2.1.0] — Abril 2026

### 📱 Mobile — Experiência aprimorada

#### 🆕 Adicionado
- **Bottom Navigation Bar** — barra fixa com 6 abas (Hoje, Mês, Semana, Lista, Rotinas, Revisão)
- **FAB flutuante (＋)** — botão de novo evento sempre acessível no mobile
- **Vista Semana mobile** — exibe 1 dia por vez com 7 chips de navegação no topo; swipe lateral troca o dia
- **Formulário de evento fullscreen** — sobe em tela cheia com animação; título e botões Salvar/Cancelar fixos (sticky)
- **Drum roll de hora** — seletor de hora e minuto com rolagem vertical (scroll snap) no lugar do picker nativo, evitando bugs de posicionamento no Chrome Android
- **Swipe lateral** no `calMain` para navegar entre meses e dias da semana
- **Long press** em eventos do painel do dia e vista semana → menu de contexto em pills
- **Opção "📅 Mover para…"** no menu de contexto — entra em modo de seleção de dia com banner e botão Cancelar
- **Backdrop invisível** no menu de contexto — toque fora fecha o menu sem propagar para o calendário
- **Botão "✕ Cancelar"** no menu de contexto
- **Vista Mês — dots coloridos** — pílulas viram pontos de 8px com cor do evento via `--pill-ev-color`

#### 🔧 Melhorado
- Header mobile simplificado — visíveis apenas Stats, Tema, Alertas e Nuvem; demais opções acessíveis pelo menu ⋯
- Clique em evento na grade do mês (mobile) redireciona para o painel do dia em vez de abrir edição direta (imprecisão de toque)
- Long press desabilitado nas pílulas da grade do mês no mobile (sem precisão suficiente); mantido no painel do dia e vista semana
- `user-select:none` e `touch-callout:none` em pílulas e menu de contexto — elimina seleção de texto indesejada no long press
- Campos de formulário com `font-size:16px` — evita zoom automático do iOS ao focar inputs
- Scroll corrigido no mobile: `body/app/main` com `height:auto` e `overflow:visible` em vez do layout fixo do desktop

#### 🗂 Categorias atualizadas
- Removidas dos atalhos rápidos: Rotina, Pessoal
- Adicionadas: **NAPNE, Pesquisa, Extensão, TCC, Viagem, Saúde**
- Rotina e Pessoal mantidas no mapa de ícones para compatibilidade com eventos existentes

---

## [2.0.0] — Abril 2026

### 🆕 Adicionado
- **Vista Hoje** — painel de foco diário com anel de progresso, Top 3 prioridades (drag & drop), compromissos do dia, rotinas e tarefas
- **Top 3 com Drag & Drop** — arraste eventos, rotinas ou tarefas para definir as 3 prioridades do dia; substituição por sobreposição
- **Rotinas** — sistema completo de hábitos com frequência diária/semanal/personalizada, dias da semana e check-in diário
- **Tarefas do dia** — lista leve de afazeres com adição inline
- **Revisão Diária** — reflexão guiada com avaliação por emoji, campos estruturados e histórico das últimas 7 revisões
- **Captura rápida** na barra lateral — texto vira tarefa; horário ou @ vira evento
- **Sistema de doações PIX** — QR Code gerado localmente (padrão EMV Banco Central), código Copia e Cola, fluxo de agradecimento personalizado
- **Sistema de avaliações** — usuários avaliam com estrelas e comentários; modal de visualização com ranking e distribuição
- **Sincronização Google Calendar** — OAuth2 bidirecional via Google Calendar API; importar e sincronizar
- **Termos de uso** (TERMS.md) — documento legal completo para o repositório GitHub
- Botões "☕ Apoiar" e "⭐ Avaliações" no rodapé
- Versão padrão de abertura alterada para **Vista Hoje**

### 🔧 Melhorado
- Vista Hoje como view padrão ao abrir o calendário
- Supabase sync expandido para incluir rotinas, tarefas, revisões e top3
- Backup JSON v5 incluindo todos os novos dados
- Atalhos de teclado expandidos: 0–5 para todas as vistas

### 🐛 Corrigido
- Bug crítico: `_cloudSaveTimer2` não declarado causava falha silenciosa ao salvar eventos com categoria+cor
- Handler do botão Salvar envolvido em try-catch para erros visíveis via toast

---

## [1.5.1] — Março 2026

### 🐛 Corrigido
- Erro de sintaxe JavaScript na linha 2367 (`}` faltando em `renderMonth`)
- Atalhos de teclado interferindo com bloco de notas (`contentEditable`)
- Dupla notificação de alerta corrigida com debounce em `scheduleAlerts`

---

## [1.5.0] — Março 2026

### 🆕 Adicionado
- **Bloco de Notas por evento** — editor rico com negrito, itálico, sublinhado, listas, alinhamento, tamanho de fonte, cor de texto, marca-texto; auto-save 800ms; ícone 📝 na pílula; incluído no backup JSON
- **Multi-calendário** — crie agendas com cores individuais; ocultar/mostrar; associar evento a calendário
- **Menu de contexto (botão direito)** — Editar, 📝 Notas, ⏭ Pular ocorrência, 🗑 Excluir
- **Pular ocorrência** — remove apenas uma data de uma série recorrente sem cancelar as demais
- **Check-in na vista Semana** — checkbox colorido nas pílulas semanais com estado tachado
- **Resize na vista Semana** — arraste borda inferior do evento para alterar duração (snap 15 min)
- **PDF Visual** — exporta mês atual como PDF A4 paisagem via html2canvas + jsPDF
- **Exportar/Importar .ics** — compatível com Google Calendar, Apple Calendar e Outlook
- **Responsivo para celular** — hamburger ☰, painel do dia deslizante, layout adaptado
- **Estatísticas Mês/Semana** — tabs com taxa de conclusão, horas, por categoria, dia da semana e turno

### 🔧 Melhorado
- Atalhos de teclado bloqueados em campos de texto e contenteditable
- Drag & Drop com flag `_dragId` para evitar click após dragend

---

## [1.4.0] — Fevereiro 2026

### 🆕 Adicionado
- **Sincronização Supabase** — botão ☁️, auto-sync ao abrir, debounce 1.5s, offline-first com localStorage
- Campo de seletor de calendário no formulário de eventos
- Barra de tags com filtro por clique
- Modal de configuração Supabase com teste de conexão

### 🔧 Melhorado
- Notificações reescritas com `setTimeout` agendado (não polling) — mais confiáveis em segundo plano
- Som de alerta com Web Audio API (chime C5–E5–G5)

---

## [1.3.0] — Janeiro 2026

### 🆕 Adicionado
- **Alertas com notificação do SO** — Windows Action Center / macOS Notification Center
- Soneca de alertas (+30 min, +1h, +3h, Amanhã)
- **Drag & Drop** entre dias na vista Mês com borda tracejada no destino
- **Heatmap** de densidade de eventos na grade do mês
- **Painel do Dia** com linha do tempo, check-in, botão de adicionar
- **Feriados nacionais** automáticos — fixos + móveis via algoritmo da Páscoa (válido para qualquer ano)
- **Contador regressivo** nas pílulas de eventos futuros

---

## [1.2.0] — Dezembro 2025

### 🆕 Adicionado
- **Vista Semana** com grade horária 6h–23h e linha do "agora"
- **Vista Próximos Eventos** — lista cronológica 60 dias
- **5 temas visuais** — Oceano, Sereno, Aurora, Marfim, Ardósia
- Modo compacto e normal
- **Barra lateral** com 12 mini-meses e pontinhos coloridos por evento
- Animação de slide ao navegar entre meses
- **Estatísticas básicas** do mês

---

## [1.1.0] — Novembro 2025

### 🆕 Adicionado
- Eventos recorrentes completos — RRULE: diário, semanal, quinzenal, mensal, anual e personalizado
- Check-in individual por ocorrência em eventos recorrentes
- Tags livres com filtro
- Detecção de conflitos de horário em tempo real
- Sugestão automática de horário livre
- Exportar backup JSON e importar
- Categoria de eventos com cores lembradas automaticamente

---

## [1.0.0] — Outubro 2025

### 🚀 Lançamento inicial
- Grade mensal navegável com eventos de um dia
- Formulário de criação/edição de eventos (título, categoria, cor, data, hora, local, descrição)
- Armazenamento em `localStorage`
- 5 categorias com ícones (Aula, Reunião, Rotina, Pessoal, CPA)
- Navegação por mês com atalho para Hoje
- Suporte a fuso horário America/Fortaleza (Maranhão)
- Impressão com CSS otimizado

---

*© 2026 MGC Dev — Marlon Gomes da Costa · Projeto pessoal e independente*
