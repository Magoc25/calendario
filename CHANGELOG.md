# Changelog — Calendário MGC

Todas as mudanças notáveis neste projeto estão documentadas aqui.  
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

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
