# 📅 Calendário MGC

> **Calendário pessoal completo, gratuito e open-source — sem instalação, sem servidor obrigatório.**

Desenvolvido por **Marlon Gomes da Costa (MGC Dev)**

> ⚠️ **Este é um projeto pessoal**, desenvolvido de forma independente pelo autor. Não representa, não é financiado e não tem vínculo institucional com o IFMA ou qualquer outra organização. O autor é professor do IFMA Campus São Raimundo das Mangabeiras, mas o Calendário MGC é uma iniciativa exclusivamente pessoal.

[![Versão](https://img.shields.io/badge/versão-2.1.0-blue)](#changelog)
[![Licença](https://img.shields.io/badge/licença-uso%20pessoal%20livre-green)](#licença)
[![PIX](https://img.shields.io/badge/apoie-PIX-brightgreen)](#apoiar)

---

## ✨ O que é

O Calendário MGC é um **arquivo HTML único** que roda direto no navegador — Chrome, Edge, Firefox ou Safari. Não precisa instalar nada, não precisa de servidor e funciona offline. Seus dados ficam no próprio computador.

Quando quiser sincronizar entre computadores ou acessar pelo celular, basta configurar o Supabase (gratuito) e opcionalmente o GitHub Pages.

---

## 🚀 Funcionalidades

### Agenda
- **Vista Hoje** — painel de foco diário com Top 3 prioridades (drag & drop), compromissos, rotinas e tarefas
- **Vista Mês** — grade completa com heatmap de densidade, feriados nacionais automáticos e drag & drop
- **Vista Semana** — grade horária 6h–23h com linha do "agora", resize de eventos e check-in
- **Vista Próximos Eventos** — lista cronológica dos próximos 60 dias
- Eventos únicos, multi-dia e recorrentes (diário, semanal, quinzenal, mensal, anual, personalizado)
- Pular ocorrência específica de evento recorrente
- Drag & Drop entre dias na vista Mês
- Detecção de conflitos de horário em tempo real
- Sugestão automática de horário livre

### Organização
- **Multi-calendário** — crie agendas separadas (IFMA, Pessoal, CPA…) com cores individuais
- **Rotinas** — gerencie hábitos e compromissos fixos com check-in diário
- **Bloco de Notas por evento** — editor rico com negrito, itálico, listas, cores, marca-texto
- **Tags livres** com filtro instantâneo
- **Busca em tempo real** por título, categoria, local e tags
- **Categorias** com ícone automático (Aula, Reunião, Rotina, Pessoal, CPA)

### Produtividade
- **Top 3 prioridades do dia** — arraste eventos, rotinas ou tarefas para definir o foco
- **Tarefas do dia** — lista leve de afazeres com adição rápida
- **Captura rápida** na barra lateral — qualquer texto vira tarefa; com horário, vira evento
- **Revisão diária** — avaliação por emoji, "o que foi bem", "o que melhorar", histórico
- **Estatísticas** Mês e Semana — taxa de conclusão, horas, por categoria, dia da semana e turno
- **Anel de progresso** diário em tempo real

### Alertas
- Notificações do sistema operacional (Windows Action Center / macOS Notification Center)
- Som de chime ao disparar
- Soneca (+30 min, +1h, +3h, Amanhã)
- Funciona mesmo com o navegador minimizado
- **Toggle ativar/desativar** — clique no 🔔 para ligar (verde) ou desligar (vermelho) os alertas sem revogar a permissão do navegador

### Integração e Export
- **Sincronização Supabase** — dados em nuvem, automática entre dispositivos
- **Google Calendar** — sincronização bidirecional com OAuth2; basta conectar em um dispositivo, os demais recebem via Supabase
- **Exportar .ics** — compatível com Google Calendar, Apple Calendar e Outlook
- **Importar .ics** — importe eventos de outras agendas
- **Backup JSON** — exporta e importa todos os dados (eventos, notas, rotinas, revisões)
- **🧹 Limpar duplicados** — remove em massa eventos com mesmo nome e horário (útil após primeira sync com Google)
- **PDF visual** do mês atual
- **Impressão** com CSS otimizado

### Interface
- 5 temas visuais: Oceano, Sereno, Aurora, Marfim, Ardósia
- Modo compacto e normal
- Atalhos de teclado (0–5, ←/→, T, N, S, F)
- Feriados nacionais brasileiros automáticos (fixos + móveis via algoritmo da Páscoa)

### Mobile
- **Bottom Navigation Bar** — 6 abas fixas na base (Hoje, Mês, Semana, Lista, Rotinas, Revisão)
- **FAB flutuante (＋)** — novo evento com um toque, sempre visível
- **Vista Mês** — eventos como dots coloridos; toque no dia abre painel de eventos abaixo
- **Vista Semana** — 1 dia por vez com chips de navegação e swipe lateral
- **Swipe lateral** para navegar entre meses e dias
- **Long press** em evento → menu de contexto (Editar, Notas, Mover, Pular, Excluir)
- **Mover evento** — seleciona o dia destino diretamente na grade do mês
- **Formulário fullscreen** — sobe em tela cheia com seletor de hora em drum roll (roda de rolagem)
- **Teclado virtual** — formulário ajusta altura automaticamente ao teclado, mantendo campos visíveis
- **Drag Top 3** — ao arrastar para o Top 3, a página rola automaticamente ao chegar nas bordas
- **Backup mobile** — menu ⋯ → Backup abre modal com todas as opções (Exportar/Importar JSON e .ics)
- **Limpar duplicados mobile** — menu ⋯ → Duplicados abre ferramenta de limpeza em massa

---

## 📦 Como usar — 4 cenários

### Cenário 1 — Uso local simples _(sem nuvem)_

**Ideal para:** usuário de um único computador que não precisa de acesso remoto.

```
┌─────────────────────────────┐
│  Seu computador             │
│  ┌───────────────────────┐  │
│  │ calendario_marlon.html│  │
│  │  + localStorage       │  │
│  └───────────────────────┘  │
│   Dados ficam no navegador  │
└─────────────────────────────┘
```

**Passos:**
1. Baixe `calendario_marlon.html` e `sw.js` para a mesma pasta
2. Abra o `calendario_marlon.html` no Chrome, Edge ou Safari
3. Pronto — use normalmente

**Backup:** clique em 💾 Backup → Exportar JSON regularmente e guarde o arquivo.

---

### Cenário 2 — Dois computadores com sincronização _(Supabase, sem GitHub)_

**Ideal para:** quem usa o calendário em 2 ou mais PCs e quer dados sempre atualizados, sem expor nada na internet.

```
┌──────────────┐    ☁️ Supabase    ┌──────────────┐
│   PC Casa    │ ◄──────────────► │  PC Trabalho │
│  .html local │    (privado)     │  .html local │
└──────────────┘                  └──────────────┘
```

**Passos:**
1. Crie conta no Supabase (gratuito) — veja [Configurar Supabase](#configurar-supabase)
2. Copie o arquivo HTML para cada computador (pendrive, e-mail, etc.)
3. Em cada PC, clique em ☁️ → configure as chaves → Salvar e sincronizar
4. Os dados sincronizam automaticamente entre os PCs

**Segurança:** dados nunca ficam em repositório público. Só quem tem as chaves do Supabase acessa.

---

### Cenário 3 — Acesso de qualquer lugar pela URL _(Supabase + GitHub Pages)_

**Ideal para:** quem quer abrir o calendário pelo celular, tablet ou qualquer computador sem precisar do arquivo.

```
             ☁️ Supabase (dados)
                    ▲
                    │
 🌐 GitHub Pages ───┤
 https://seu.github.io/calendario
                    │
      ┌─────────────┼─────────────┐
   💻 PC         📱 Celular    💻 PC 2
```

**Passos:**
1. Configure o Supabase (Cenário 2)
2. Crie repositório no GitHub e ative GitHub Pages — veja [Configurar GitHub Pages](#configurar-github-pages)
3. Acesse pela URL em qualquer dispositivo
4. Em cada dispositivo, configure as chaves Supabase (uma vez só)

> ⚠️ **Nota sobre repositório público:** o arquivo HTML não contém seus dados nem suas chaves. As chaves ficam salvas no `localStorage` do navegador. Um repositório público expõe apenas o código do calendário — seus eventos, notas e credenciais são privados.

---

### Cenário 4 — Integração completa com Google Agenda _(Cenário 3 + Google Calendar)_

**Ideal para:** quem já usa o Google Agenda e quer sincronização bidirecional.

```
 📅 Google Agenda
        ↕ (sync manual)
 📅 Calendário MGC  ◄──►  ☁️ Supabase  ◄──►  📱 Celular / outros dispositivos
   (1 dispositivo)              (automático)
```

> 💡 **Você só precisa conectar o Google em um dispositivo.** Os eventos sincronizados chegam automaticamente nos outros via Supabase. O celular não precisa ter conta Google configurada.

**Passos:**
1. Complete o Cenário 3
2. Configure a Google Calendar API — veja [Configurar Google Calendar](#configurar-google-calendar)
3. Clique em 📆 Google → Conectar com Google → autorize
4. Clique em **Sincronizar agora** — eventos do Google chegam ao app e vão para o Supabase
5. Os outros dispositivos recebem automaticamente via Supabase

---

## 🪜 Evolua no seu ritmo — Do básico ao completo

> Não precisa configurar tudo de uma vez. O Calendário MGC funciona bem em qualquer nível — use o básico hoje e avance quando sentir necessidade.

---

### Nível 1 — Só o arquivo no navegador _(zero configuração)_

**Como começar:** baixe `calendario_marlon.html` e abra no Chrome ou Edge. É só isso.

| ✅ O que você tem | ❌ O que ainda não tem |
|---|---|
| Agenda completa com todos os recursos | Acesso pelo celular ou outros computadores |
| Alertas e notificações | Sincronização automática entre dispositivos |
| PDF, impressão, exportar .ics | Atualização automática do app |
| Backup local (exportar/importar JSON) | Integração com Google Agenda |

**Backup importante:** exporte o JSON regularmente (💾 Backup → Exportar JSON) e guarde em lugar seguro. Se o navegador for limpo ou o PC formatado, seus dados podem ser perdidos.

**Quando avançar para o Nível 2?** Quando quiser acessar o calendário pelo celular ou em outro computador.

---

### Nível 2 — Supabase + GitHub Pages _(app no celular, sync automático)_

**O que muda:** seus dados vão para a nuvem (Supabase) e o calendário fica acessível por uma URL pública do GitHub Pages — de qualquer dispositivo, a qualquer hora.

> 🔒 **Sua agenda não fica visível para ninguém.** A URL pública abre o calendário vazio para qualquer pessoa que acessar. Seus eventos, notas e rotinas ficam no `localStorage` do seu navegador e nas suas chaves privadas do Supabase — que ninguém conhece a não ser você. Repositório público não significa dados públicos.

| ✅ O que você ganha | ❌ O que ainda não tem |
|---|---|
| URL permanente acessível de qualquer lugar | Integração com Google Agenda |
| Sync automático entre todos os dispositivos | — |
| App instalável no celular (Android e iOS) | — |
| Atualizações automáticas ao atualizar o arquivo no GitHub | — |

#### Instalar como app no celular

Depois de configurar o GitHub Pages e acessar a URL pelo celular:

**Android (Chrome):**
1. Abra a URL no Chrome
2. Menu (⋮) → **Adicionar à tela inicial**
3. Confirme — o ícone do app aparece na tela inicial

**iPhone / iPad (Safari):**
1. Abra a URL no Safari *(não funciona no Chrome no iOS)*
2. Toque no botão **Compartilhar** (ícone de seta para cima)
3. Role para baixo → **Adicionar à tela de início**
4. Confirme — o app aparece na tela inicial

> 💡 Após instalar, o app abre em tela cheia, sem barra de endereços, como um aplicativo nativo.

#### Instalar como app no desktop (Windows e macOS)

O Calendário MGC também pode ser instalado como aplicativo no computador, sem precisar do navegador aberto.

**Windows / macOS — Chrome ou Edge:**
1. Acesse a URL do app no Chrome ou Edge
2. Procure o ícone de instalar na **barra de endereços** (ícone de monitor com seta para baixo, no canto direito)
3. Clique em **Instalar** → confirme
4. O app abre em janela própria, sem abas ou barra de endereços, como um programa instalado

> 💡 Se o ícone não aparecer na barra de endereços, acesse pelo menu: **⋮ → Converter site em app** (Edge) ou **⋮ → Salvar e compartilhar → Instalar página como app** (Chrome).

> 💡 Após instalar, o app aparece no menu Iniciar (Windows) ou no Launchpad (macOS) e pode ser aberto como qualquer outro programa.

**Quando avançar para o Nível 3?** Quando quiser que o Google Agenda e o Calendário MGC fiquem sincronizados automaticamente — criar um evento em um aparece no outro.

---

### Nível 3 — + Google Calendar _(integração total)_

**O que muda:** sincronização bidirecional com o Google Agenda. Eventos criados no Google aparecem no MGC; eventos criados no MGC são enviados ao Google. Mover um evento no MGC atualiza automaticamente no Google.

| ✅ O que você ganha |
|---|
| Sync bidirecional com Google Agenda |
| Auto-sync ao abrir o app e a cada 30 minutos |
| Mover evento no MGC atualiza o Google em segundos |
| Basta conectar em um dispositivo — os demais recebem via Supabase |
| Alertas dos eventos funcionam sem o app aberto, mesmo com a tela bloqueada |

> ⚠️ Este nível exige a configuração mais trabalhosa (Google Cloud Console), mas é feita **uma única vez**, em um único dispositivo. Veja o passo a passo completo em [Configurar Google Calendar](#configurar-google-calendar).

#### 🔄 Como usar o Google Agenda no dia a dia

> ⚠️ **Regra fundamental:** se você usa sincronização com Google Agenda, **não use o arquivo local** (`calendario_marlon.html` aberto direto no PC). Use sempre o **link do GitHub Pages** ou o **app no celular**. O Google bloqueia autenticação OAuth em arquivos locais (`file://`).

**Comportamento por plataforma:**

| Plataforma | Quando sincroniza com Google | Observação |
|---|---|---|
| Link GitHub (desktop) | Ao carregar/atualizar a página + a cada 30 min | Pode pedir login novamente após longa inatividade |
| App mobile (celular) | Sempre ao abrir o app | Feche e reabra para forçar atualização |
| Arquivo local | ❌ Nunca | Google bloqueia OAuth em `file://` |

**O que fazer após cada ação:**

| Ação | Desktop (link GitHub) | Mobile (app) |
|---|---|---|
| Criar / editar / excluir evento | Aguardar até 30 min ou atualizar a página | Fechar e reabrir o app |
| Ver eventos novos vindos do Google | Atualizar a página | Fechar e reabrir o app |
| Mover evento (drag & drop) | Sincroniza automaticamente em segundos | Sincroniza automaticamente em segundos |

**O que acontece automaticamente (sem ação necessária):**
- Sincronização a cada 30 min com o app aberto (desktop e mobile)
- Drag & drop sincroniza com o Google em segundos
- Ao reabrir o app no celular, a sincronização ocorre imediatamente
- Apenas **um dispositivo** precisa ter o Google conectado — os outros recebem os eventos via Supabase

---

## 🔧 Guias de Configuração

### Configurar Supabase

#### 1. Criar conta e projeto
1. Acesse [supabase.com](https://supabase.com) → **Start your project**
2. Login com GitHub (ou e-mail)
3. Clique em **New Project**
4. Nome: `calendario-mgc` · Região: **South America (São Paulo)**
5. Crie uma senha forte para o banco de dados
6. Aguarde ~2 minutos

#### 2. Criar a tabela (SQL Editor)
No menu lateral → **SQL Editor** → **New query** → cole e execute:

```sql
create table cal_sync (
  id text primary key,
  events text,
  notes text,
  category_colors text,
  calendars text,
  theme text,
  routines text,
  quick_tasks text,
  reviews text,
  top3 text,
  standalone_notes text,
  routine_checks text,
  updated_at timestamptz default now()
);

alter table cal_sync enable row level security;

create policy "Allow all operations" on cal_sync
  for all using (true) with check (true);
```

> ⚠️ **Se já criou a tabela antes** e quer adicionar as colunas que faltam, rode no SQL Editor:
> ```sql
> alter table cal_sync add column if not exists standalone_notes text;
> alter table cal_sync add column if not exists routine_checks text;
> ```

> ⚠️ **Se criou a tabela sem ativar o RLS** (via interface do Supabase ou SQL anterior), rode:
> ```sql
> alter table cal_sync enable row level security;
>
> create policy "Allow all operations" on cal_sync
>   for all using (true) with check (true);
> ```
> Se aparecer o erro `policy already exists`, rode apenas a linha `alter table`:
> ```sql
> alter table cal_sync enable row level security;
> ```

> ✅ **Como confirmar que o RLS está ativo:** no Table Editor, clique na tabela `cal_sync` — deve aparecer um botão **"1 RLS policy"** acima das colunas. Você também pode confirmar via SQL: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'cal_sync';` — o resultado `rowsecurity = true` confirma.

#### 3. Copiar as chaves
Vá em **Settings → Data API**:
- **Project URL** — `https://xxxx.supabase.co` (role para cima para encontrar)
- **Publishable key** — começa com `sb_publis...` (aba "Publishable and secret API keys")

> ⚠️ **Nunca use a Secret key no calendário.** Somente a Publishable key.

#### 4. Configurar no calendário
1. Abra o calendário → clique em ☁️
2. Cole a **Project URL** e a **Publishable key**
3. Clique em **🔍 Testar conexão** → deve aparecer "✓ Conexão bem-sucedida"
4. Clique em **Salvar e sincronizar**

---

### Configurar GitHub Pages

#### 1. Criar repositório
1. Acesse [github.com](https://github.com) → **+** → **New repository**
2. Nome: `calendario`
3. Visibilidade: **Public** (necessário para GitHub Pages gratuito)
4. Marque **Add a README file**
5. Clique em **Create repository**

#### 2. Upload dos arquivos
No repositório → **Add file → Upload files** → arraste os arquivos:
- `calendario_marlon.html`
- `README.md`
- `TERMS.md`
- `CHANGELOG.md`

Clique em **Commit changes**.

#### 3. Ativar GitHub Pages
1. No repositório → **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** · Pasta: **/ (root)**
4. Clique em **Save** → aguarde ~2 min

#### 4. Sua URL
```
https://seunome.github.io/calendario/calendario_marlon.html
```
> ⚠️ **Importante:** a URL base (`/calendario/`) abre erro 404. Sempre use a URL com o nome do arquivo no final.

---

### Configurar Google Calendar

> **Pré-requisito:** tenha o Cenário 3 (GitHub Pages) funcionando antes de configurar o Google Calendar, pois você vai precisar da URL do seu GitHub Pages.

#### 1. Criar projeto no Google Cloud Console
1. Acesse [console.cloud.google.com](https://console.cloud.google.com) com sua conta Google
2. No seletor de projetos (topo da página) → clique em **Novo projeto**
3. Nome: `Calendario MGC` → clique em **Criar**
4. Aguarde a criação e certifique-se que o novo projeto está selecionado no seletor de projetos

#### 2. Ativar a Google Calendar API
1. No menu lateral → **APIs e serviços → Biblioteca**
2. Na barra de busca, digite `Google Calendar API`
3. Clique no resultado → clique em **Ativar**

#### 3. Configurar a Tela de Consentimento OAuth (Branding)
> ⚠️ A interface do Google Cloud Console foi atualizada. O fluxo agora é diferente das versões anteriores.

1. No menu lateral → **APIs e serviços → Tela de permissão OAuth** (ou **OAuth consent screen**)
2. Clique em **Vamos começar** (ou **Get started**)
3. Preencha os campos:
   - **Nome do app:** `Calendario MGC`
   - **E-mail de suporte ao usuário:** seu e-mail Google (o mesmo que usa no Google Agenda)
4. Clique em **Próximo**
5. Em **Público-alvo**, selecione **Externo** → clique em **Próximo**
6. Em **Informações de contato**, preencha:
   - **Endereço de e-mail:** seu e-mail Google (mesmo da conta usada)
7. Clique em **Próximo** → marque que concorda com os termos → clique em **Continuar**

> 💡 **Sobre os e-mails solicitados:** tanto o e-mail de suporte quanto o de contato devem ser o mesmo e-mail da conta Google que você está usando. Não há problema em usar o mesmo endereço nos dois campos.

#### 4. Criar a Credencial OAuth (Client ID)
1. Ainda em **APIs e serviços → Tela de permissão OAuth**, clique na aba **Clientes** (no topo da página)
2. Clique em **Criar cliente** (ou **+ Create client**)
3. Em **Tipo de aplicativo**, selecione **Aplicativo da Web**
4. Em **Nome**, coloque: `Calendario MGC`
5. Em **Origens JavaScript autorizadas**, clique em **+ Adicionar URI** e insira:
   ```
   https://seunome.github.io
   ```
   > ⚠️ Substitua `seunome` pelo seu username real do GitHub. Use **apenas a origem** (sem `/calendario/` no final).
6. Clique em **Criar**
7. Uma janela aparecerá com o **Client ID** — copie-o (é uma string longa terminando em `.apps.googleusercontent.com`)

> 💡 **O Client ID pode ser exposto no código front-end** — ele foi projetado para isso. O que nunca deve ser exposto é o Client Secret, mas para aplicativos web o Google não o utiliza.

#### 5. Adicionar usuários de teste
Como o app está em modo **Externo** e não verificado pelo Google, apenas contas na lista de testes podem autorizar o login:

1. Em **APIs e serviços → Tela de permissão OAuth**, clique na aba **Público-alvo** (ou **Audience**)
2. Em **Usuários de teste**, clique em **+ Adicionar usuários**
3. Adicione **todas as contas Google** que vão usar o app (ex: conta principal e Gmail secundário)
4. Clique em **Adicionar**

> ⚠️ Se aparecer **"Acesso bloqueado"** ao tentar conectar, é porque a conta usada no login não está nessa lista. Adicione-a e tente novamente.

> 💡 A lista controla **quais contas têm permissão** para autorizar — não define qual será usada automaticamente. A escolha acontece no momento do login.

#### 6. Configurar no Calendário MGC
1. Abra o calendário → clique em **📆 Google**
2. Cole o **Client ID** no campo indicado
3. No campo **E-mail da conta Google** (opcional), insira o e-mail que deseja usar — isso faz o login ir direto para a conta correta, sem mostrar seletor
4. Selecione o **fuso horário**:
   - Use **America/Sao_Paulo** (funciona para todo o Brasil, incluindo regiões que não adotam horário de verão)
   - ⚠️ Evite **America/Fortaleza** — pode causar erros na API
5. Clique em **🔑 Conectar com Google**
6. Na janela pop-up que abrir:
   - Selecione sua conta Google
   - Se aparecer aviso "Google não verificou este app" → clique em **Avançado** → **Ir para Calendario MGC (não seguro)**
   - Clique em **Continuar** para autorizar
7. Após autorizar, selecione **qual agenda** deseja sincronizar (geralmente é o seu e-mail principal)
8. Clique em **Sincronizar agora**

> 💡 **Você só precisa conectar o Google em um dispositivo.** Os eventos sincronizados vão para o Supabase e chegam automaticamente nos outros dispositivos. O celular não precisa ter conta Google configurada.

#### 7. Resultado esperado na primeira sincronização
```
Sync concluído: X importados · Y atualizados · Z enviados · W erro(s)
```
- **Importados** — eventos do Google Agenda trazidos para o Calendário MGC
- **Enviados** — eventos do Calendário MGC enviados para o Google Agenda
- **Erros** — eventos que não puderam ser sincronizados (datas inválidas, campos obrigatórios ausentes, etc.)

> 💡 Alguns erros na primeira sync são normais. Clique em **Sincronizar agora** novamente se necessário.

#### 8. Limpeza de duplicados (se necessário)
Na primeira sincronização, eventos recorrentes podem gerar cópias. Para remover em massa:

1. Clique em **🧹** no header (desktop) ou menu **⋯ → Duplicados** (mobile)
2. O modal lista grupos de eventos com mesmo nome e horário
3. Clique em **Selecionar tudo** → **🗑 Excluir selecionados**

#### 9. Troubleshooting

| Erro | Causa | Solução |
|---|---|---|
| Acesso bloqueado | Conta não está na lista de usuários de teste | Adicionar o e-mail em Público-alvo → Usuários de teste |
| Error 401 | Client ID inválido ou origem não autorizada | Verificar se `https://seunome.github.io` está em Origens JavaScript autorizadas |
| Login vai para conta errada | Navegador tem múltiplas contas Google | Preencher o campo **E-mail da conta Google** no painel 📆 |
| Eventos duplicados | Primeira sync importou ocorrências de séries recorrentes | Usar **🧹 Limpar duplicados** |

---

## 🗂️ Estrutura dos arquivos

| Arquivo | Função | Cenário |
|---|---|---|
| `calendario_marlon.html` | Arquivo principal do app — interface, lógica e estilos | Todos |
| `sw.js` | Service Worker — cache offline, alertas e notificações em segundo plano | Todos |
| `manifest.json` | Define o app como PWA: nome, ícones e modo de exibição ao instalar no celular, Windows e macOS | Cenários 2, 3 e 4 |
| `icon-192.png` / `icon-512.png` | Ícones do app usados na tela inicial do celular e em notificações | Cenários 2, 3 e 4 |
| `.github/workflows/keep-alive.yml` | Ping diário no Supabase para manter o banco ativo (configure com suas próprias chaves) | Cenários 2, 3 e 4 |

---

## 🔒 Segurança — Perguntas frequentes

### "Meus eventos ficam expostos no GitHub?"
**Não.** O GitHub armazena apenas o código HTML do calendário. Seus eventos, notas e rotinas ficam no `localStorage` do seu navegador — ninguém tem acesso a eles a não ser você.

### "As chaves do Supabase ficam no código?"
**Não.** As chaves são inseridas pela interface do calendário e salvas no `localStorage` do seu navegador. O código HTML no GitHub não contém suas chaves.

### "A Publishable key do Supabase é segura para usar?"
**Sim.** Ela foi projetada para ficar exposta no navegador. A segurança real é garantida pelas **Row Level Security policies** do Supabase, que controlam o que pode ser lido e escrito. A Secret key (que nunca usamos) é a que não deve ser exposta.

### "E se alguém acessar a URL do meu GitHub Pages?"
A pessoa verá o calendário vazio, sem nenhum dado. Para ver seus dados, precisaria também das suas chaves do Supabase — que não estão em nenhum lugar público.

### "O Google pode ver meus eventos?"
Quando você ativa a integração Google Calendar, o Google tem acesso às informações dos eventos que você sincroniza — isso é esperado e necessário para o serviço funcionar. Você pode revogar o acesso a qualquer momento em [myaccount.google.com/permissions](https://myaccount.google.com/permissions).

### "O que acontece se fechar a conta do Supabase?"
Você perde a sincronização em nuvem, mas seus dados continuam locais no `localStorage`. Faça backup JSON regularmente: 💾 Backup → Exportar JSON.

### Recomendação de segurança por cenário

| Cenário | Nível de segurança | Recomendação |
|---|---|---|
| Só arquivo local | 🟢 Máximo | Ideal para dados sensíveis |
| Local + Supabase | 🟢 Alto | Padrão recomendado |
| GitHub Pages Public | 🟡 Bom | Código exposto, dados não |
| + Google Calendar | 🟡 Bom | Google acessa eventos sincronizados |

---

## ⌨️ Atalhos de Teclado

| Tecla | Ação |
|---|---|
| `0` | Vista Hoje |
| `1` | Vista Mês |
| `2` | Vista Semana |
| `3` | Vista Próximos Eventos |
| `4` | Rotinas |
| `5` | Revisão Diária |
| `←` ou `J` | Mês/semana anterior |
| `→` ou `K` | Próximo mês/semana |
| `T` | Ir para Hoje |
| `N` | Novo evento |
| `S` | Estatísticas |
| `F` | Focar na busca |
| `ESC` | Fechar menu de contexto |

---

## 💾 Backup Recomendado

Faça backup semanalmente: **💾 Backup → Exportar JSON**

O arquivo JSON inclui: eventos, notas, rotinas, tarefas, revisões, avaliações, configurações e temas.

---

## ☕ Apoiar o Projeto

O Calendário MGC é gratuito e de código aberto. Se ele foi útil para você, considere apoiar o desenvolvimento:

Clique em **☕ Apoiar** no rodapé do calendário para fazer uma contribuição via PIX.

**Chave PIX:** `4c6086a2-4bb8-474b-a4cf-ced8c8d82189` · MGC Dev

### ⭐ Avaliações compartilhadas

Após apoiar, você pode deixar uma avaliação com estrelas e comentário. As avaliações são **compartilhadas entre todos os usuários** — qualquer pessoa que abrir o app verá os comentários acumulados da comunidade.

Para ver as avaliações, clique em **⭐ Avaliações** no rodapé do calendário.

### 👑 Badges de apoiador

O sistema reconhece automaticamente a lealdade de quem apoia ao longo do tempo, com base no número de **meses distintos** em que fez uma contribuição:

| Badge | Meses de apoio |
|---|---|
| ☕ Apoiador | 1 mês |
| ⭐ Fã | 2–3 meses |
| 🔥 Dedicado | 4–6 meses |
| 👑 Patrono | 7+ meses |

O badge aparece automaticamente ao lado do seu nome nos comentários. A partir de 🔥 Dedicado, seu nome entra na seção **🏆 Apoiadores em Destaque** no topo do modal de avaliações.

> 💡 Use sempre o mesmo nome ao avaliar para acumular meses de apoio corretamente.

---

## 📄 Licença

Este software é de uso **pessoal e educacional livre**. Uso comercial requer autorização do autor.
Consulte [TERMS.md](TERMS.md) para os termos completos.

---

## 👤 Autor

**Marlon Gomes da Costa**  
Desenvolvedor independente · MGC Dev  

_Profissionalmente, professor do IFMA Campus São Raimundo das Mangabeiras,_  
_mas este projeto é uma iniciativa pessoal, sem vínculo institucional._

---

*© 2026 MGC Dev — Feito com ☕ no Maranhão*
