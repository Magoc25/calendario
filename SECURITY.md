# Política de Segurança e Resposta a Incidentes — Calendário MGC

**Versão:** 1.0 · **Última atualização:** 2026-05-16

> Este documento atende a:
> - **LGPD Art. 46-49** (segurança e prevenção)
> - **Resolução CD/ANPD nº 15/2024** (Comunicação de Incidente de Segurança — RCIS)
> - **Lei 9.609/1998 Art. 8º** (dever do autor de comunicar defeitos do software)
> - **Lei 12.737/2012** (Carolina Dieckmann — boas práticas contra invasão)
> - **Marco Civil Art. 13-15** (guarda de logs)

---

## 1. Escopo da responsabilidade — três camadas

A responsabilidade pela segurança no Calendário MGC é **distribuída** conforme o modelo de operação:

| Camada | Quem é responsável | O que cobre |
|---|---|---|
| **1 — Infraestrutura do desenvolvedor** | 🔴 **Marlon (MGC Dev)** | Supabase compartilhado, versão hospedada `magoc25.github.io`, código distribuído |
| **2 — Dispositivo do usuário** | 🟡 **Usuário** | localStorage, navegador, sistema operacional, antivírus |
| **3 — Infraestrutura do usuário** | 🟡 **Usuário** | Supabase próprio, Google Calendar, GitHub Pages forkado |

**Este documento detalha:**
- O que **o desenvolvedor** faz em cada camada
- O que **o usuário** precisa fazer nas Camadas 2 e 3

---

## 2. Compromissos de segurança do desenvolvedor (Camada 1)

### 2.1 Medidas técnicas em vigor

- 🔒 **HTTPS/TLS 1.3** obrigatório em todos os endpoints
- 🔒 **Content Security Policy (CSP)** no Service Worker
- 🔒 **Sanitização de inputs** para prevenir XSS
- 🔒 **Tokens OAuth tratados em escopo restrito** (não logados, não expostos)
- 🔒 **Criptografia em repouso** AES-256 no Supabase
- 🔒 **Autenticação multifator (2FA)** no GitHub e Supabase administrativos
- 🔒 **Princípio do menor privilégio** nas chaves anônimas do Supabase compartilhado
- 🔒 **Auditoria de dependências** (sem dependências externas em runtime — single-file HTML)

### 2.2 Medidas administrativas

- 📋 Acesso administrativo restrito ao desenvolvedor
- 📋 Auditoria periódica de segurança e revisão de dependências
- 📋 Backups regulares do Supabase (configuração padrão)
- 📋 Monitoramento de tentativas de acesso anômalo via logs do Supabase

---

## 3. Reportar vulnerabilidades (Responsible Disclosure)

### 3.1 Como reportar

Se você é pesquisador de segurança ou usuário e identificou uma vulnerabilidade:

**Canal preferencial:** marlongc25@protonmail.com
**Assunto:** `[SECURITY] <descrição breve>`

**Inclua:**
- Descrição da vulnerabilidade
- Passos para reproduzir
- Impacto potencial
- Versão afetada (LOCAL_VERSION no `calendario-mgc.html`)
- Se desejar crédito público após correção

### 3.2 Compromisso do desenvolvedor

- 🤝 **Acuso de recebimento em 5 dias úteis**
- 🤝 **Avaliação inicial em 15 dias úteis**
- 🤝 **Correção priorizada por severidade** (ver Seção 6)
- 🤝 **Crédito ao pesquisador** após correção publicada (se autorizar)
- 🤝 **Não tomarei ações legais** contra pesquisadores que sigam o procedimento (responsible disclosure)

### 3.3 O que você NÃO deve fazer

- ❌ Divulgar publicamente antes da correção (CVE prematuro)
- ❌ Acessar dados de outros usuários
- ❌ Testar em produção de outros usuários
- ❌ Engenharia social contra o desenvolvedor ou terceiros

---

## 4. Plano de resposta a incidentes — Camada 1

### 4.1 Definição de "incidente reportável"

Conforme **Resolução CD/ANPD nº 15/2024 Art. 4º**, um incidente é reportável quando "pode causar risco ou dano relevante aos titulares". Para o Calendário MGC, isso inclui:

| Cenário | Reportável à ANPD? |
|---|---|
| Vazamento de `app_reviews` (contém texto livre) | ✅ Sim (potencialmente identificável) |
| Vazamento de `app_pings` (anonimizado) | ⚠️ Avaliar caso a caso |
| Vazamento de `app_config` (sem dados pessoais) | ❌ Não |
| Comprometimento da versão hospedada (XSS no HTML) | ✅ Sim (afeta usuários ativos) |
| Tokens OAuth dos usuários expostos | ✅ Sim (alto risco) |

### 4.2 Procedimento de 6 etapas

```
ETAPA 1 — DETECÇÃO (T+0)
├─ Quem detectou? Como?
├─ Registrar timestamp UTC
├─ Preservar evidências (logs, screenshots)
└─ Acionar responsável (Marlon)

ETAPA 2 — CONTENÇÃO (T+0 a T+24h)
├─ Isolar sistema afetado
├─ Revogar credenciais/tokens comprometidos
├─ Bloquear vetor de ataque (firewall, RLS no Supabase)
└─ Se necessário: tirar app do ar temporariamente

ETAPA 3 — AVALIAÇÃO (T+24h a T+72h)
├─ Quais dados foram expostos?
├─ Quantos titulares afetados?
├─ Há "risco ou dano relevante"? (Res. ANPD 15/2024)
└─ SE SIM → ir para ETAPA 4
    SE NÃO → documentar internamente e ir para ETAPA 5

ETAPA 4 — COMUNICAÇÃO (até 6 dias úteis para ATPP)
├─ ANPD: formulário CIS em gov.br/anpd
├─ Titulares afetados:
│   ├─ Banner público no app (via app_config)
│   ├─ Aviso no README.md
│   └─ Tag de versão com prefixo [SECURITY] no GitHub
└─ Manter registro de todas as comunicações

ETAPA 5 — REMEDIAÇÃO
├─ Publicar correção no GitHub
├─ Atualizar CACHE_NAME no sw.js (força refresh)
├─ Atualizar app_config.version (notifica usuários)
├─ Documentar correção no CHANGELOG.md com tag 🔒 Security
└─ Atualizar LOCAL_VERSION

ETAPA 6 — PÓS-INCIDENTE
├─ Relatório completo (uso interno)
├─ Análise de causa raiz
├─ Atualizar este SECURITY.md se necessário
└─ Implementar controles preventivos
```

### 4.3 Prazos legais aplicáveis

- **Comunicação à ANPD:** até **6 dias úteis** (ATPP — Resolução 15/2024)
- **Comunicação preliminar:** se faltarem informações, comunicar em 6 dias úteis e complementar em 20 dias
- **Comunicação aos titulares:** mesmo prazo (3 dias úteis padrão, 6 para ATPP)

---

## 5. Canal de comunicação de correções aos usuários

### 5.1 Mecanismo padrão (4 canais simultâneos)

```
1. CORREÇÃO PUBLICADA NO GITHUB
        ↓
2. CHANGELOG.md ATUALIZADO (com tag 🔒 Security se for segurança)
        ↓
3. CACHE_NAME do sw.js INCREMENTADO (força refresh)
        ↓
4. app_config.version ATUALIZADA NO SUPABASE COMPARTILHADO
        ↓
5. USUÁRIOS COM SUPABASE CONFIGURADO RECEBEM BANNER
   "Nova versão disponível — clique para atualizar"
```

### 5.2 Para usuários sem Supabase configurado

- Banner do app **não aparece** automaticamente
- Atualização manual: visitar repositório e baixar nova versão
- Recomendação: **assinar notificações** do repositório GitHub para receber alertas

### 5.3 Obrigação do usuário (culpa concorrente)

> ⚠️ **Importante:** ao receber notificação de atualização, é **sua obrigação** verificar o [`CHANGELOG.md`](./CHANGELOG.md) e identificar se há correção de segurança (marcador `🔒 Security`). Aplicar atualizações de segurança em prazo razoável é parte do uso responsável conforme [`TERMS.md`](./TERMS.md) Seção 6.
>
> Conforme princípio da **culpa concorrente** previsto no art. 945 do Código Civil e art. 12, §3º do CDC, o desenvolvedor não responde por danos causados por vulnerabilidades **já corrigidas e devidamente notificadas** quando o usuário deixou de aplicar a atualização disponível.

---

## 6. Severidade e prazos de correção

| Severidade | Critério | Prazo de correção | Comunicação |
|---|---|---|---|
| 🔴 **Crítica** | RCE, vazamento massivo, comprometimento de tokens | **48 horas** | Imediata (multicanal) |
| 🟠 **Alta** | XSS armazenado, escalonamento de privilégio | **7 dias** | Banner + CHANGELOG |
| 🟡 **Média** | XSS refletido, exposição de dados não-sensíveis | **30 dias** | CHANGELOG na próxima release |
| 🟢 **Baixa** | Hardening, melhorias defensivas | **90 dias** | CHANGELOG na próxima release |

### Exemplo prático

**Cenário:** Pesquisador reporta XSS em campo de notas que poderia roubar token OAuth do Google Calendar.

**Classificação:** 🟠 Alta (afeta usuários com integração Google ativa)

**Resposta esperada:**
1. **Dia 1:** acuse recebimento ao pesquisador
2. **Dia 3:** reproduzir e confirmar
3. **Dia 5:** desenvolver correção
4. **Dia 7:** publicar correção + bump LOCAL_VERSION + tag `🔒 Security` no CHANGELOG.md
5. **Dia 7:** atualizar `app_config.version` (banner aparece)
6. **Dia 7:** comunicação à ANPD se houver evidência de exploração ativa
7. **Dia 14:** verificar que usuários ativos atualizaram (via métrica de pings)

---

## 7. Responsabilidades do usuário — Camadas 2 e 3

### 7.1 Camada 2 — Dispositivo

Você é responsável por:

- ✅ Manter o navegador atualizado
- ✅ Não desativar HTTPS forçado
- ✅ Não instalar extensões maliciosas que possam injetar código
- ✅ Backup regular dos dados (exportar JSON via 💾 Backup)
- ✅ Antivírus e sistema operacional atualizados
- ✅ Não compartilhar o dispositivo sem cuidados (bloqueio de tela)

### 7.2 Camada 3 — Infraestrutura própria

Se você configurou Supabase próprio ou Google Calendar:

- ✅ Use credenciais fortes e únicas
- ✅ Ative 2FA nessas contas
- ✅ Não compartilhe chaves API
- ✅ Revogue acessos não usados
- ✅ Monitore os logs dessas plataformas
- ✅ Configure Row Level Security (RLS) no Supabase próprio

**Se houver incidente na sua infraestrutura:**
- **Você é o controlador** desses dados
- **Você deve comunicar a ANPD** em 3 dias úteis (ou 6 dias se for ATPP)
- O desenvolvedor pode ajudar tecnicamente, mas não responde pelos seus dados

---

## 8. Limitações de responsabilidade

O desenvolvedor **NÃO se responsabiliza por**:

- ❌ Incidentes na infraestrutura do usuário (Camadas 2 e 3)
- ❌ Mudanças unilaterais de políticas pelo Google, Supabase ou GitHub
- ❌ Vulnerabilidades de dependências de terceiros (navegador, OS)
- ❌ Configurações inseguras feitas pelo usuário
- ❌ Vulnerabilidades em **versões modificadas/forkadas** por terceiros
- ❌ Danos consequenciais por **não aplicar atualizações** já disponibilizadas
- ❌ Perda de dados por falta de backup

---

## 9. Guarda de logs (Marco Civil Art. 15)

Para a versão hospedada em `magoc25.github.io/calendario/`:

- **Logs de acesso** são mantidos pelo GitHub Pages (provedor de hospedagem) por período padrão
- **Logs do Supabase** (queries, conexões) são mantidos por **6 meses** conforme Marco Civil
- Acesso aos logs requer **ordem judicial específica** ou solicitação do próprio titular sobre seus dados

---

## 10. Recursos e referências

### Para reportar incidentes
- 📧 **Email do desenvolvedor:** marlongc25@protonmail.com
- 🇧🇷 **ANPD — Canal de comunicação de incidentes:** https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis

### Documentação relacionada
- [`PRIVACY.md`](./PRIVACY.md) — Aviso de Privacidade
- [`TERMS.md`](./TERMS.md) — Termos de Uso (Seção 6 — obrigações do usuário sobre atualizações)
- [`CHANGELOG.md`](./CHANGELOG.md) — Histórico de versões com marcadores de segurança

### Base legal
- [LGPD — Arts. 46-49](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [Resolução CD/ANPD nº 15/2024 — RCIS](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-aprova-o-regulamento-de-comunicacao-de-incidente-de-seguranca)
- [Lei 9.609/1998 — Lei do Software](https://www.planalto.gov.br/ccivil_03/leis/l9609.htm)
- [Lei 12.737/2012 — Carolina Dieckmann](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12737.htm)

---

## 11. Histórico de versões

| Versão | Data | Mudanças |
|---|---|---|
| 1.0 | 2026-05-16 | Versão inicial — Resolução ANPD 15/2024, modelo de 3 camadas, canal de update + CHANGELOG como mecanismo de diligência continuada |

---

**© 2026 MGC Dev — Marlon Gomes da Costa**

> 🔒 *Segurança é responsabilidade compartilhada. O desenvolvedor cuida da Camada 1, você cuida das Camadas 2 e 3 — juntos mantemos o ecossistema seguro.*
