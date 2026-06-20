# Calendário MGC — Termos de Uso e Isenção de Responsabilidade

**Versão:** 2.0  
**Data:** Maio de 2026  
**Desenvolvedor:** Marlon Gomes da Costa (MGC Dev)

> 📋 **Documentos complementares (leitura recomendada):**
> - [`PRIVACY.md`](./PRIVACY.md) — Aviso de Privacidade (LGPD)
> - [`SECURITY.md`](./SECURITY.md) — Política de Segurança e Resposta a Incidentes
> - [`ACCESSIBILITY.md`](./ACCESSIBILITY.md) — Declaração de Acessibilidade
> - [`DATA_INVENTORY.md`](./DATA_INVENTORY.md) — Inventário de tratamento de dados

> ⚠️ **Este é um projeto pessoal e independente.** O Calendário MGC não é produto, serviço ou iniciativa do IFMA (Instituto Federal do Maranhão) ou de qualquer outra instituição. O desenvolvedor é professor do IFMA, mas atua aqui exclusivamente em capacidade pessoal.

---

## 1. Natureza do Software

O **Calendário MGC** é um software de uso pessoal distribuído gratuitamente como arquivo HTML de código aberto. Sua finalidade é auxiliar no gerenciamento de agenda, compromissos e produtividade pessoal.

O software é fornecido **"no estado em que se encontra"** (*as is*), sem garantias de qualquer natureza, expressas ou implícitas.

---

## 2. Aceitação dos Termos

Ao baixar, instalar, copiar ou utilizar o Calendário MGC em qualquer forma, o usuário declara que:

- Leu e compreendeu estes termos;
- Concorda integralmente com as condições aqui estabelecidas;
- Tem capacidade legal para celebrar este acordo.

**Caso não concorde com estes termos, não utilize o software.**

---

## 3. Isenção de Responsabilidade

### 3.1 Uso por conta e risco do usuário

O uso do Calendário MGC é de **exclusiva responsabilidade do usuário**. O desenvolvedor (MGC Dev / Marlon Gomes da Costa) não se responsabiliza por:

- Perda, corrupção ou indisponibilidade de dados armazenados;
- Falhas de sincronização com serviços de terceiros (Supabase, Google Agenda);
- Erros ou imprecisões no cálculo de datas, feriados ou alertas;
- Interrupções no funcionamento por atualizações de navegadores, sistemas operacionais ou APIs de terceiros;
- Danos diretos, indiretos, incidentais, especiais ou consequenciais decorrentes do uso ou impossibilidade de uso do software;
- Decisões tomadas pelo usuário com base em informações exibidas no aplicativo.

### 3.2 Dados pessoais e privacidade

- **Os dados de agenda ficam armazenados localmente** no navegador do usuário (`localStorage`), exceto quando o usuário configura voluntariamente a sincronização via Supabase;
- O desenvolvedor **não tem acesso** aos dados de agenda do usuário;
- O usuário é **inteiramente responsável** por configurar corretamente os serviços de terceiros (Supabase, Google Cloud) e por proteger suas credenciais de acesso;
- A integração com serviços externos (Supabase, Google Calendar API) é opcional e de responsabilidade exclusiva do usuário ao configurá-la;
- O app envia **um ping anônimo por dia** ao Supabase do autor para contagem de dispositivos ativos. O ping contém apenas: nome do app, versão, data e um identificador aleatório gerado no dispositivo (sem vínculo com dados pessoais). Não é possível identificar o usuário a partir deste dado.

### 3.3 Serviços de terceiros

O Calendário MGC pode se integrar com:
- **Supabase** (supabase.com) — banco de dados em nuvem;
- **Google Calendar API** (developers.google.com) — sincronização de agenda;
- **GitHub Pages** (pages.github.com) — hospedagem.

O desenvolvedor não é responsável por falhas, mudanças de política, interrupções ou custos decorrentes do uso desses serviços. O usuário deve consultar os termos de serviço de cada plataforma separadamente.

---

## 4. Licença de Uso

O Calendário MGC é distribuído sob os seguintes termos:

### 4.1 Uso pessoal e educacional — **Gratuito e livre**

✅ Você pode usar, copiar e modificar para uso pessoal;  
✅ Você pode utilizar em ambiente educacional;  
✅ Você pode adaptar para suas necessidades;  
✅ Você pode compartilhar com outros, mantendo a autoria original.

### 4.2 Uso comercial — **Restrito**

❌ **É proibido** comercializar o software, total ou parcialmente, sem autorização expressa do autor;  
❌ **É proibido** remover ou alterar os créditos de autoria (© MGC);  
❌ **É proibido** redistribuir como produto próprio sem mencionar a obra original;  
❌ **É proibido** usar o código-base para criar produtos comerciais concorrentes sem acordo prévio.

Para licenciamento comercial, entre em contato com o desenvolvedor.

---

## 5. Doações (PIX)

O botão "☕ Apoiar" dentro do aplicativo é uma forma **voluntária e não obrigatória** de contribuição financeira. As doações:

- São **exclusivamente voluntárias** — não geram qualquer obrigação de suporte, customização ou garantia adicional;
- **Não implicam** em vínculo empregatício, societário ou contratual de qualquer natureza;
- Podem ser realizadas anonimamente;
- Não são reembolsáveis, salvo erro operacional comprovado.

As avaliações enviadas através da funcionalidade de apoio são de responsabilidade do usuário que as publicou.

---

## 6. Obrigações do usuário sobre atualizações de segurança

### 6.1 Mecanismo de notificação de atualizações

Quando uma nova versão do Calendário MGC é publicada, o usuário é notificado através de:

1. **Banner de atualização** no app (para usuários com Supabase configurado, via `app_config`)
2. **Histórico no [CHANGELOG.md](./CHANGELOG.md)** com identificação clara de **correções de segurança** marcadas com `🔒 Security`
3. **Releases no repositório GitHub**

### 6.2 Diligência exigida do usuário

Ao receber notificação de atualização, é **obrigação do usuário**:

- ✅ Consultar o [`CHANGELOG.md`](./CHANGELOG.md) para identificar o conteúdo da atualização
- ✅ Aplicar correções marcadas com `🔒 Security` em **prazo razoável**
- ✅ Manter o navegador e sistema operacional atualizados (dependências da Camada 2)

### 6.3 Culpa concorrente e exoneração de responsabilidade

Conforme o **Art. 945 do Código Civil** e o **Art. 12, §3º do CDC**, o desenvolvedor **não responde** por danos decorrentes de vulnerabilidades que:

- ✅ Foram **corrigidas e publicadas** com correção disponível;
- ✅ Foram **notificadas pelos canais oficiais** (CHANGELOG.md + banner);
- ✅ E o usuário **não aplicou a atualização** em prazo razoável.

Este mecanismo está alinhado com o **Art. 8º da Lei 9.609/1998** (dever do autor de comunicar correções) e a **Resolução CD/ANPD nº 15/2024** (canal estabelecido de comunicação).

---

## 7. Backups e Responsabilidade pelos Dados

O usuário é **inteiramente responsável** por realizar backups regulares dos seus dados. Recomenda-se:

- Exportar o arquivo JSON regularmente via **💾 Backup → Exportar JSON**;
- Manter cópia do arquivo HTML em local seguro;
- Não depender exclusivamente da sincronização em nuvem como único backup.

**O desenvolvedor não poderá ser responsabilizado por perda de dados** decorrente de falha do navegador, formatação do computador, expiração de conta em serviços terceiros ou qualquer outro evento.

---

## 8. Acessibilidade

O Calendário MGC adota as **Diretrizes WCAG 2.2 nível AA** (em conformidade parcial) e a **norma ABNT NBR 17225:2025**, em atendimento ao **Art. 63 da Lei 13.146/2015 (LBI)**.

Detalhes completos, limitações conhecidas e canal para reportar problemas estão em [`ACCESSIBILITY.md`](./ACCESSIBILITY.md).

---

## 9. Uso por menores de idade

O Calendário MGC **não é destinado a menores de 18 anos** sem supervisão de pais ou responsáveis. Conforme **Lei 15.211/2025 (ECA Digital)**:

- Não há coleta de dados pessoais identificáveis de menores na infraestrutura do desenvolvedor (Camada 1);
- Pais/responsáveis devem supervisionar o uso por menores;
- Em caso de identificação de uso indevido por menor, dados serão removidos.

---

## 10. Conformidade Legal

Este projeto é desenvolvido em conformidade com a legislação brasileira aplicável:

| Lei / Regulamento | Conformidade |
|---|---|
| Lei 13.709/2018 (LGPD) | [`PRIVACY.md`](./PRIVACY.md) + [`DATA_INVENTORY.md`](./DATA_INVENTORY.md) |
| Lei 12.965/2014 (Marco Civil) | Direitos do usuário garantidos |
| Lei 15.211/2025 (ECA Digital) | Seção 9 deste documento + privacy by default |
| Lei 13.146/2015 (LBI) | [`ACCESSIBILITY.md`](./ACCESSIBILITY.md) |
| Lei 12.737/2012 (Cibersegurança) | [`SECURITY.md`](./SECURITY.md) |
| Lei 9.609/1998 (Software) | [`LICENSE.md`](./LICENSE.md) |
| Resolução CD/ANPD nº 2/2022 (ATPP) | Enquadramento aplicado |
| Resolução CD/ANPD nº 15/2024 (incidentes) | [`SECURITY.md`](./SECURITY.md) Seção 4 |

Fontes oficiais consultadas: [Planalto](https://www.planalto.gov.br/), [Autoridade Nacional de Proteção de Dados (ANPD)](https://www.gov.br/anpd/), [Ministério da Justiça e Segurança Pública](https://www.gov.br/mj/).

---

## 11. Modificações nos Termos

O desenvolvedor reserva-se o direito de modificar estes termos a qualquer momento, publicando a versão atualizada neste repositório. **Mudanças materiais** (que alterem direitos ou obrigações substancialmente) terão aviso prévio de **30 dias** antes da vigência. O uso continuado do software após publicação de novos termos implica aceitação dos mesmos.

---

## 12. Disposições Finais

- Este documento rege-se pelas leis brasileiras;
- Eventuais disputas serão resolvidas no foro da comarca de São Raimundo das Mangabeiras — MA, Brasil;
- O IFMA e demais instituições não são partes neste acordo e não respondem por este software;
- Caso qualquer disposição seja considerada inválida, as demais permanecem em vigor;
- Dúvidas podem ser encaminhadas através das *Issues* do repositório no GitHub.

---

**© 2026 MGC Dev — Marlon Gomes da Costa**  
*Desenvolvedor independente — projeto pessoal, sem vínculo institucional*

---

## Histórico de versões

| Versão | Data | Mudanças |
|---|---|---|
| 2.0 | 2026-05-16 | Adequação à legislação brasileira: novas seções 6 (atualizações + culpa concorrente), 8 (acessibilidade), 9 (menores/ECA Digital), 10 (conformidade legal). Referências aos documentos PRIVACY.md, SECURITY.md, ACCESSIBILITY.md, DATA_INVENTORY.md |
| 1.0 | 2026-04 | Versão inicial |

---

> *"Software bom é aquele que serve as pessoas, não o contrário."*
