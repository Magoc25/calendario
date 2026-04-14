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

### Integração e Export
- **Sincronização Supabase** — dados em nuvem, automática entre dispositivos
- **Google Calendar** — sincronização bidirecional com OAuth2
- **Exportar .ics** — compatível com Google Calendar, Apple Calendar e Outlook
- **Importar .ics** — importe eventos de outras agendas
- **Backup JSON** — exporta e importa todos os dados (eventos, notas, rotinas, revisões)
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
1. Baixe `calendario_marlon.html`
2. Abra no Chrome ou Edge
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
 📅 Google Agenda ◄──────────────────────────────►  📅 Calendário MGC
                        (bidirecional)
```

**Passos:**
1. Complete o Cenário 3
2. Configure a Google Calendar API — veja [Configurar Google Calendar](#configurar-google-calendar)
3. Clique em 📆 Google → Conectar com Google → autorize

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
  updated_at timestamptz default now()
);

alter table cal_sync enable row level security;

create policy "Allow all operations" on cal_sync
  for all using (true) with check (true);
```

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

#### 1. Google Cloud Console
1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. **Novo projeto** → Nome: `Calendario MGC` → Criar
3. **APIs e serviços → Biblioteca** → buscar `Google Calendar API` → **Ativar**

#### 2. Tela de consentimento OAuth
1. **APIs e serviços → Tela de consentimento OAuth**
2. Tipo: **Externo** → Criar
3. Nome do app: `Calendario MGC` · E-mail: seu e-mail
4. **Salvar e continuar** em todas as telas
5. Em **Usuários de teste**: adicione seu próprio e-mail
6. Clique em **Voltar ao painel**

#### 3. Criar credencial OAuth
1. **APIs e serviços → Credenciais → + Criar credenciais → ID do cliente OAuth**
2. Tipo: **Aplicativo da Web**
3. Nome: `Calendario MGC Web`
4. **Origens JavaScript autorizadas** → adicione sua URL do GitHub Pages: `https://seunome.github.io`
5. Clique em **Criar** → copie o **Client ID**

#### 4. Configurar no calendário
1. Clique em 📆 Google → cole o **Client ID**
2. Selecione o fuso horário
3. Clique em **🔑 Conectar com Google**
4. Na janela pop-up: selecione sua conta → Avançado → Ir para Calendario MGC → autorize

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

O Calendário MGC é gratuito. Se ele foi útil para você, considere apoiar o desenvolvimento:

Clique em **☕ Apoiar** no rodapé do calendário para fazer uma contribuição via PIX.

**Chave PIX:** `4c6086a2-4bb8-474b-a4cf-ced8c8d82189` · MGC Dev

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
