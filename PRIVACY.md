# Aviso de Privacidade — Calendário MGC

**Versão:** 1.0 · **Última atualização:** 2026-05-16
**Vigência:** a partir desta data até nova versão publicada

> ⚠️ Este é um documento exigido pela **Lei nº 13.709/2018 (LGPD)**, redigido conforme orientações da Autoridade Nacional de Proteção de Dados (ANPD) e considerando o regime simplificado aplicável a **Agentes de Tratamento de Pequeno Porte (ATPP)** — Resolução CD/ANPD nº 2/2022.

---

## 1. Quem somos e contato

**Controlador dos dados:** Marlon Gomes da Costa (pessoa natural)
**Nome do projeto:** Calendário MGC
**Identidade jurídica:** desenvolvedor independente, atuando como **Agente de Tratamento de Pequeno Porte (ATPP)** conforme Art. 4º da Resolução CD/ANPD nº 2/2022
**Canal de privacidade (Encarregado / Contato LGPD):** marlongc25@protonmail.com
**Foro:** São Raimundo das Mangabeiras — MA, Brasil

> ℹ️ Como ATPP, estou dispensado de designar Encarregado formal, mas mantenho **canal de comunicação direto** para tratar de questões de privacidade conforme o Art. 11 da mesma Resolução.

---

## 2. Arquitetura de tratamento de dados — três camadas

O Calendário MGC tem um modelo de distribuição **descentralizado** que afeta diretamente quem é responsável por seus dados:

```
┌─────────────────────────────────────────────────────────────┐
│ CAMADA 1 — Infraestrutura do desenvolvedor                  │
│ (Marlon é controlador)                                      │
│ • Versão hospedada em magoc25.github.io/calendario/         │
│ • Supabase compartilhado:                                   │
│   - app_pings (contagem anônima de dispositivos)            │
│   - app_reviews (avaliações enviadas pelo usuário)          │
│   - app_config (banner de atualização)                      │
│ • Código-fonte distribuído (autor)                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CAMADA 2 — Dispositivo do usuário                           │
│ (Usuário é controlador exclusivo)                           │
│ • localStorage (dados de agenda, notas, rotinas)            │
│ • Service Worker rodando localmente                         │
│ • Notificações do sistema operacional                       │
│ → O desenvolvedor NÃO TEM ACESSO a esses dados              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CAMADA 3 — Infraestrutura própria do usuário (opcional)     │
│ (Usuário é controlador exclusivo)                           │
│ • Conta Supabase configurada pelo próprio usuário           │
│ • Google Calendar do próprio usuário (via OAuth dele)       │
│ • GitHub Pages se o usuário hospedar versão própria         │
│ → O desenvolvedor NÃO TEM ACESSO a esses dados              │
└─────────────────────────────────────────────────────────────┘
```

**Este Aviso de Privacidade cobre EXCLUSIVAMENTE os dados da Camada 1.** As Camadas 2 e 3 são controladas por você, e você é o **agente de tratamento** desses dados.

---

## 3. Dados pessoais que coletamos (Camada 1)

### 3.1 Tabela `app_pings` (contagem anônima de dispositivos ativos)

| Campo | Conteúdo | Identifica o usuário? |
|---|---|---|
| `app_name` | Nome do app (constante: "Calendário MGC") | ❌ Não |
| `device_id` | UUID aleatório gerado no dispositivo | ❌ Não (anônimo) |
| `ping_date` | Data (YYYY-MM-DD) sem horário | ❌ Não |

**Frequência:** 1 ping por dia por dispositivo
**Status sob a LGPD:** dado **anonimizado** (Art. 5º, III) — não permite identificação direta ou indireta do titular usando meios técnicos razoáveis

### 3.2 Tabela `app_reviews` (avaliações enviadas pelo usuário)

| Campo | Conteúdo | Identifica o usuário? |
|---|---|---|
| `rating` | Nota de 1 a 5 estrelas | ❌ Não |
| `comment` | Texto livre escrito pelo usuário | ⚠️ Potencialmente (depende do conteúdo) |
| `ts` | Timestamp do envio | ❌ Não |

**Aviso importante:** se o usuário incluir voluntariamente nome, email, telefone ou qualquer informação identificável no comentário, esse conteúdo se torna **dado pessoal** sob a LGPD. O usuário pode solicitar a remoção a qualquer momento.

### 3.3 Tabela `app_config` (banner de atualização)

| Campo | Conteúdo | Identifica o usuário? |
|---|---|---|
| `key` | Chave (ex: "version") | ❌ Não |
| `value` | Valor (ex: "2.2.0") | ❌ Não |

**Operação:** read-only para usuários. Apenas o desenvolvedor escreve.
**Status sob a LGPD:** não contém dados pessoais

### 3.4 O que NÃO coletamos

- ❌ Nome do usuário
- ❌ Email
- ❌ Telefone, CPF, ou qualquer documento
- ❌ Endereço IP (não armazenamos)
- ❌ Localização (GPS, geolocalização)
- ❌ Conteúdo dos eventos do calendário do usuário
- ❌ Cookies de rastreamento ou publicidade
- ❌ Identificadores publicitários (IDFA, GAID)
- ❌ Dados biométricos
- ❌ Dados sensíveis (saúde, religião, política, etc.)

---

## 4. Finalidades do tratamento e bases legais (LGPD Art. 7º)

| Dado | Finalidade | Base legal | Período de retenção |
|---|---|---|---|
| `app_pings.device_id` | Contar dispositivos ativos (estatística agregada) | Art. 7º, IX — **legítimo interesse** (entender alcance do projeto) | 30 dias rolantes |
| `app_pings.ping_date` | Calcular janela de 30 dias para "ativos" | Art. 7º, IX — **legítimo interesse** | 30 dias rolantes |
| `app_reviews.rating` | Coletar feedback agregado da comunidade | Art. 7º, IX — **legítimo interesse** | Indefinida (até remoção solicitada) |
| `app_reviews.comment` | Exibir avaliações para outros usuários | Art. 7º, IX — **legítimo interesse** + I (**consentimento** pelo ato de enviar) | Indefinida (até remoção solicitada) |
| `app_config.value` | Notificar usuários de novas versões | Art. 7º, IX — **legítimo interesse** | Permanente (sobrescrito a cada release) |

### Por que legítimo interesse?

- **Não há dados sensíveis**
- **Não há prática comercial** (projeto gratuito sem fins lucrativos)
- **Há ponderação favorável ao titular**: dados mínimos, anonimizados, finalidade legítima (manter um projeto open-source ativo)
- **O titular tem expectativas razoáveis**: ao usar um app open-source distribuído pelo autor, há expectativa de comunicação com o autor

> 📚 Conforme **Guia Orientativo sobre Legítimo Interesse** publicado pela ANPD, o controlador realizou avaliação de balanceamento e considerou que os interesses legítimos não violam direitos e liberdades fundamentais do titular.

---

## 5. Compartilhamento de dados

### Não compartilhamos dados pessoais com terceiros, exceto:

| Destinatário | Dados | Finalidade | País |
|---|---|---|---|
| **Supabase** (infraestrutura) | Todos os dados das tabelas | Hospedar banco de dados | 🇺🇸 EUA |
| **GitHub** (hospedagem) | Apenas código-fonte público | Hospedar o app web | 🇺🇸 EUA |

### Não compartilhamos com:

- ❌ Anunciantes
- ❌ Brokers de dados
- ❌ Empresas de marketing
- ❌ Outras empresas de tecnologia (sem ser as listadas acima)

---

## 6. Transferência internacional de dados (LGPD Art. 33)

Os dados da Camada 1 são armazenados em servidores nos **Estados Unidos** (Supabase e GitHub).

**Base legal para transferência:** Art. 33, II — garantias específicas via:
- Termos de uso e acordos de processamento de dados do Supabase (DPA) que incluem cláusulas contratuais padrão
- GitHub possui programa de adequação para LGPD/GDPR

**Garantias adicionais:**
- Dados em trânsito são criptografados (TLS 1.3)
- Dados em repouso no Supabase usam criptografia AES-256
- Acesso administrativo é restrito ao desenvolvedor com autenticação multifator

---

## 7. Tratamento de dados das Camadas 2 e 3 (suas responsabilidades)

### Camada 2 — Seus dados locais
- Ficam **exclusivamente no seu dispositivo** (localStorage do navegador)
- O desenvolvedor **não tem acesso, não recebe cópia, não pode recuperar**
- **Você é o controlador exclusivo desses dados**
- **Você é responsável por:** backups, segurança do dispositivo, criptografia

### Camada 3 — Sua infraestrutura opcional

Se você configurar sincronização via **Supabase próprio** ou **Google Calendar**:

- Você cria contas em seu nome nesses serviços
- Você autoriza a integração (OAuth ou inserção de chaves)
- **Você é o controlador desses dados**
- **Você é responsável por:** termos de uso desses serviços, configuração de segurança, gerenciamento de credenciais

> ℹ️ Recomendamos que você leia:
> - [Política de Privacidade do Supabase](https://supabase.com/privacy)
> - [Política de Privacidade do Google](https://policies.google.com/privacy)

---

## 8. Seus direitos como titular (LGPD Art. 18)

Você tem direito a, **sobre os dados da Camada 1** (os únicos que controlamos):

| Direito | Como exercer | Prazo de resposta |
|---|---|---|
| **I — Confirmação de tratamento** | Enviar email para marlongc25@protonmail.com | 30 dias (ATPP) |
| **II — Acesso aos dados** | Solicitar via email | 30 dias |
| **III — Correção** | Solicitar via email | 30 dias |
| **IV — Anonimização / bloqueio / eliminação** | Solicitar via email | 30 dias |
| **V — Portabilidade** | Solicitar via email (formato JSON) | 30 dias |
| **VI — Eliminação de dados consentidos** | Solicitar via email | 30 dias |
| **VII — Informação sobre compartilhamento** | Consultar Seção 5 deste documento OU email | Imediato / 30 dias |
| **VIII — Informação sobre consequências de não consentir** | Consultar este documento OU email | Imediato / 30 dias |
| **IX — Revogação do consentimento** | Para avaliações: solicitar remoção via email | 30 dias |

**Solicitação simplificada:**
- Envie email para **marlongc25@protonmail.com**
- Assunto: `[LGPD] Solicitação - <direito desejado>`
- Inclua: identificador relevante (UUID do device se aplicável, texto da avaliação, etc.)
- Não exigimos comprovação de identidade que envolva mais dados pessoais

**Negativa fundamentada:** caso o pedido não possa ser atendido (ex: dado já anonimizado e não recuperável), responderemos por escrito explicando o motivo.

**Sem custos:** o atendimento é gratuito, conforme o Art. 18, §5º da LGPD.

---

## 9. Segurança dos dados

### Medidas técnicas
- 🔒 HTTPS/TLS 1.3 em todas as conexões
- 🔒 Criptografia AES-256 em repouso (Supabase)
- 🔒 Autenticação multifator no console administrativo do Supabase e GitHub
- 🔒 Service Worker com Content Security Policy
- 🔒 Anonimização do `device_id` por UUID v4 (não derivado de hardware)

### Medidas administrativas
- 📋 Política de senhas fortes
- 📋 Acesso restrito ao desenvolvedor
- 📋 Auditoria periódica conforme princípios da LGPD (Art. 6º, X — responsabilização e prestação de contas)
- 📋 Plano de resposta a incidentes documentado em [`SECURITY.md`](./SECURITY.md)

---

## 10. Tratamento de dados de crianças e adolescentes

O Calendário MGC **não é destinado a menores de 18 anos** sem supervisão de pais ou responsáveis. Não há funcionalidade que solicite ou retenha dados de menores na Camada 1 (todos os dados são anônimos).

Para uso por menores:
- Pais/responsáveis devem supervisionar o uso
- Conforme a **Lei 15.211/2025 (ECA Digital)**, recomenda-se que apps usados por menores tenham configurações de privacidade protetivas por padrão — e este já é nosso caso (privacy by design)

Se identificarmos uso indevido envolvendo dados de menores, removeremos os dados imediatamente.

---

## 11. Cookies e tecnologias similares

### O Calendário MGC **não usa cookies** no sentido estrito.

### Tecnologias similares utilizadas:

| Tecnologia | Onde | Finalidade | LGPD se aplica? |
|---|---|---|---|
| **localStorage** | No seu navegador | Salvar configurações, eventos, notas | ✅ Sim (Guia ANPD 2025) |
| **IndexedDB** | No seu navegador (Service Worker) | Alertas pendentes | ✅ Sim |
| **Service Worker Cache** | No seu navegador | Funcionamento offline | ✅ Sim |

**Você pode limpar todos esses dados a qualquer momento via:**
- Configurações do navegador → Limpar dados do site
- Desinstalando o PWA (no caso de instalação)

Conforme o **Guia Orientativo de Cookies e Proteção de Dados Pessoais** da ANPD (2025), localStorage e tecnologias similares são tratados sob as mesmas regras de cookies quando relacionados a dados pessoais.

> ✅ O Calendário MGC usa essas tecnologias **estritamente necessárias** para funcionamento — não há cookies/storage de análise, publicidade ou rastreamento.

---

## 12. Canal de comunicação de mudanças

Mudanças neste Aviso de Privacidade são comunicadas por **três canais simultâneos**:

1. **Histórico de versões público** no repositório GitHub (commit + data)
2. **Banner de atualização no app** (via `app_config` no Supabase compartilhado — alcança usuários com Supabase configurado)
3. **CHANGELOG.md** — documentado com marcação `📋 Privacy` para mudanças nesta política

> ⚠️ **Sua obrigação como usuário:** ao receber notificação de atualização no app, verifique o [`CHANGELOG.md`](./CHANGELOG.md) para entender o que mudou. Esta diligência é parte do uso responsável do software conforme [`TERMS.md`](./TERMS.md).

**Mudanças materiais** (que ampliam coleta, mudam finalidade ou compartilhamento) terão:
- Aviso prévio de **30 dias** antes da entrada em vigor
- Banner com chamada específica para revisão da política
- Versão anterior preservada no histórico do repositório

---

## 13. Reclamação à ANPD

Você tem direito de apresentar reclamação à **Autoridade Nacional de Proteção de Dados (ANPD)** caso considere que seus direitos não foram atendidos.

- **Portal:** https://www.gov.br/anpd/
- **Canal de denúncias:** https://www.gov.br/anpd/pt-br/canais_atendimento/cidadao

---

## 14. Disposições finais

- Este Aviso é regido pelas leis brasileiras
- Foro: São Raimundo das Mangabeiras — MA, Brasil
- Em caso de divergência entre versão local (offline) e versão online (GitHub), prevalece a **versão online mais recente**
- Para questões técnicas, use as Issues do repositório
- Para questões de privacidade, use o email do canal LGPD

---

## 15. Histórico de versões

| Versão | Data | Mudanças |
|---|---|---|
| 1.0 | 2026-05-16 | Versão inicial — adequação à LGPD, ANPD Res. 2/2022 (ATPP), ANPD Res. 15/2024, Guia de Cookies ANPD 2025, ECA Digital (Lei 15.211/2025) |

---

**© 2026 MGC Dev — Marlon Gomes da Costa**

📄 Documentos relacionados:
- [TERMS.md](./TERMS.md) — Termos de Uso
- [SECURITY.md](./SECURITY.md) — Plano de Segurança e Resposta a Incidentes
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) — Declaração de Acessibilidade
- [DATA_INVENTORY.md](./DATA_INVENTORY.md) — Inventário simplificado de tratamento
