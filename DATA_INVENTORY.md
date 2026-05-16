# Inventário de Tratamento de Dados Pessoais — Calendário MGC

**Versão:** 1.0 · **Última atualização:** 2026-05-16

> Este documento atende ao **Art. 37 da LGPD** em formato **simplificado para Agentes de Tratamento de Pequeno Porte (ATPP)**, conforme **Resolução CD/ANPD nº 2/2022 Art. 7º**.

---

## 1. Identificação do Agente

| Campo | Valor |
|---|---|
| **Nome / Razão social** | Marlon Gomes da Costa |
| **Natureza** | Pessoa Natural — desenvolvedor independente |
| **Enquadramento** | Agente de Tratamento de Pequeno Porte (ATPP) |
| **Base legal do enquadramento** | Art. 4º da Resolução CD/ANPD nº 2/2022 |
| **Realiza tratamento de alto risco?** | ❌ Não (sem dados sensíveis em larga escala, sem profiling, sem decisões automatizadas com efeitos jurídicos) |
| **Encarregado (DPO) formal?** | ❌ Dispensado conforme Art. 11 da Resolução |
| **Canal de comunicação LGPD** | marlongc25@protonmail.com |
| **Endereço** | São Raimundo das Mangabeiras — MA, Brasil |

---

## 2. Sistema/Projeto sob inventário

| Campo | Valor |
|---|---|
| **Nome** | Calendário MGC |
| **Versão atual** | 2.1.0 (v2.2.0 em preparação) |
| **Repositório** | https://github.com/Magoc25/calendario |
| **URL pública** | https://magoc25.github.io/calendario/calendario-mgc.html |
| **Modelo** | PWA (Progressive Web App) — arquivo HTML único + Service Worker |
| **Finalidade geral** | Calendário pessoal/produtividade — código aberto |
| **Modelo de distribuição** | Open-source, gratuito, sem fins comerciais |

---

## 3. Operações de tratamento — Camada 1 (responsabilidade do desenvolvedor)

### Operação 001 — Contagem de dispositivos ativos (`app_pings`)

| Campo | Detalhe |
|---|---|
| **Categoria do dado** | Identificador técnico anonimizado |
| **Dado específico** | `device_id` (UUID v4 aleatório), `ping_date` (YYYY-MM-DD), `app_name` |
| **Origem** | Dispositivo do usuário (gerado localmente) |
| **Finalidade** | Estimar número de instalações ativas (estatística agregada) para badge do README e tomada de decisão sobre roadmap |
| **Base legal (Art. 7º)** | IX — Legítimo interesse (entender alcance do projeto open-source) |
| **Categorias de titulares** | Usuários do app (não identificados) |
| **Volume estimado** | ~2 dispositivos ativos em janela de 30 dias (maio/2026) |
| **Compartilhamento** | Apenas com Supabase (hospedagem) |
| **Transferência internacional** | 🇺🇸 EUA (Supabase) — base legal Art. 33, II (garantias contratuais) |
| **Retenção** | 30 dias rolantes (registros mais antigos são purgados automaticamente) |
| **Forma de eliminação** | Job automático no Supabase |
| **Medidas de segurança** | HTTPS, RLS (Row Level Security), chave anon-key com permissão write-only |
| **Status de proteção** | Anonimizado (não permite identificação direta ou indireta) |
| **Risco para o titular** | 🟢 Baixíssimo |

### Operação 002 — Coleta de avaliações (`app_reviews`)

| Campo | Detalhe |
|---|---|
| **Categoria do dado** | Conteúdo textual livre + nota numérica |
| **Dado específico** | `rating` (1-5), `comment` (texto livre), `ts` (timestamp) |
| **Origem** | Usuário voluntariamente, via funcionalidade ⭐ Avaliações |
| **Finalidade** | Coletar feedback agregado da comunidade de usuários |
| **Base legal (Art. 7º)** | I — Consentimento (ato de enviar) + IX — Legítimo interesse |
| **Categorias de titulares** | Usuários do app que escolherem enviar avaliação |
| **Volume estimado** | Esporádico (poucas avaliações) |
| **Compartilhamento** | Apenas com Supabase (hospedagem) — exibido publicamente no app |
| **Transferência internacional** | 🇺🇸 EUA (Supabase) — base legal Art. 33, II |
| **Retenção** | Indeterminada, até solicitação de remoção pelo titular |
| **Forma de eliminação** | Mediante solicitação via email LGPD (canal Art. 18) |
| **Medidas de segurança** | HTTPS, RLS |
| **Status de proteção** | Pode conter dado pessoal se o usuário incluir voluntariamente (alerta no formulário) |
| **Risco para o titular** | 🟡 Médio (depende do conteúdo que o usuário inclui) |

### Operação 003 — Banner de atualização (`app_config`)

| Campo | Detalhe |
|---|---|
| **Categoria do dado** | Configuração técnica (não-pessoal) |
| **Dado específico** | `key` (ex: "version"), `value` (ex: "2.2.0") |
| **Origem** | Desenvolvedor (escreve manualmente após release) |
| **Finalidade** | Notificar usuários de novas versões disponíveis |
| **Base legal (Art. 7º)** | IX — Legítimo interesse (cumprir dever de informar correções — Lei 9.609 Art. 8º) |
| **Categorias de titulares** | N/A (não envolve dados pessoais) |
| **Volume** | ~10 registros |
| **Compartilhamento** | Apenas Supabase |
| **Transferência internacional** | 🇺🇸 EUA |
| **Retenção** | Permanente (sobrescrito a cada release) |
| **Medidas de segurança** | RLS — read-only para anon-key |
| **Risco para o titular** | 🟢 Nenhum (sem dados pessoais) |

---

## 4. Operações de NÃO-tratamento pelo desenvolvedor — Camadas 2 e 3

Estas operações **não constam neste inventário** porque o desenvolvedor **não é o controlador**:

| Operação | Camada | Controlador |
|---|---|---|
| Armazenamento de eventos no `localStorage` | 2 — Dispositivo | Usuário final |
| Alertas armazenados em IndexedDB do Service Worker | 2 — Dispositivo | Usuário final |
| Sincronização via Supabase próprio do usuário (`cal_sync`) | 3 — Infra usuário | Usuário final |
| Sincronização via Google Calendar (OAuth) | 3 — Infra usuário | Usuário final + Google |
| Hospedagem em GitHub Pages forkado pelo usuário | 3 — Infra usuário | Usuário final + GitHub |

> 📌 **Esclarecimento legal:** o desenvolvedor distribui o código-fonte como software open-source. Cada usuário, ao operar o software em sua infraestrutura, **torna-se controlador dos próprios dados** conforme LGPD Art. 5º, VI.

---

## 5. Operadores (sub-processadores)

| Operador | Função | Tratamento | DPA disponível |
|---|---|---|---|
| **Supabase Inc.** | Hospedagem do banco de dados compartilhado | Armazenar `app_pings`, `app_reviews`, `app_config` | https://supabase.com/dpa |
| **GitHub Inc. (Microsoft)** | Hospedagem do código-fonte e versão web | Servir arquivos estáticos do PWA | https://docs.github.com/en/site-policy/privacy-policies/github-data-protection-agreement |

---

## 6. Direitos dos titulares — como atendemos

Conforme [`PRIVACY.md`](./PRIVACY.md) Seção 8, todos os direitos do **Art. 18 da LGPD** são atendidos via canal único:

📧 **marlongc25@protonmail.com**

| Direito | Procedimento interno |
|---|---|
| Confirmação de tratamento | Consultar Supabase pelo `device_id` (se titular fornecer) ou texto da avaliação |
| Acesso | Exportar registros relevantes em JSON |
| Correção | Aplicar UPDATE no Supabase |
| Eliminação | Aplicar DELETE no Supabase |
| Portabilidade | Exportar JSON estruturado |
| Anonimização | Remover campos identificáveis |
| Informação sobre compartilhamento | Apontar para Seção 3 deste documento |

**Prazo de resposta:** 30 dias (ATPP — Resolução 2/2022 Art. 5º, §3º)

---

## 7. Plano de retenção e descarte

| Dado | Política de retenção | Mecanismo de descarte |
|---|---|---|
| `app_pings` | 30 dias rolantes | Job automático |
| `app_reviews` | Até solicitação | Manual via canal LGPD |
| `app_config` | Permanente (sobrescrito) | N/A |
| Logs de acesso (Supabase) | 6 meses (Marco Civil Art. 15) | Política padrão Supabase |
| Logs de auditoria deste inventário | 5 anos | Manual |

---

## 8. Avaliação de Risco simplificada

| Risco | Probabilidade | Impacto | Medidas mitigatórias |
|---|---|---|---|
| Vazamento de `app_pings` | Baixa | Baixíssimo (anonimizado) | RLS + HTTPS |
| Vazamento de `app_reviews` | Baixa | Médio (depende do conteúdo) | RLS + monitoramento + procedimento de remoção rápida |
| Comprometimento da versão hospedada (XSS) | Baixa | Alto (afeta tokens OAuth dos usuários) | CSP, sanitização, plano de incidente (SECURITY.md) |
| Indisponibilidade do Supabase | Média | Baixo (app local-first funciona offline) | Documentação clara, app local-first |
| Comprometimento de credenciais admin | Baixa | Alto | 2FA, senhas únicas, rotação periódica |

**Avaliação geral:** projeto de **baixo risco** sob a LGPD.

---

## 9. Revisão e atualização deste inventário

### Frequência: semestral

### Gatilhos para revisão fora do ciclo:
- Nova operação de tratamento adicionada
- Mudança de operador (ex: trocar Supabase por outro provedor)
- Mudança em base legal
- Nova versão major do app (ex: v3.0)
- Incidente de segurança
- Mudança na regulamentação ANPD

---

## 10. Histórico de revisões

| Versão | Data | Mudanças | Responsável |
|---|---|---|---|
| 1.0 | 2026-05-16 | Versão inicial — formato simplificado ATPP, modelo de 3 camadas | Marlon Gomes da Costa |

---

## 11. Base legal e referências

- [LGPD Art. 37](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) — Obrigação de registro
- [Resolução CD/ANPD nº 2/2022](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022) — Regime simplificado ATPP
- [Modelo de registro simplificado ANPD](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-divulga-modelo-de-registro-simplificado-de-operacoes-com-dados-pessoais-para-agentes-de-tratamento-de-pequeno-porte-atpp)

---

**© 2026 MGC Dev — Marlon Gomes da Costa**

📄 Documentos relacionados:
- [PRIVACY.md](./PRIVACY.md) — Aviso de Privacidade (versão pública)
- [SECURITY.md](./SECURITY.md) — Plano de Segurança
- [TERMS.md](./TERMS.md) — Termos de Uso
