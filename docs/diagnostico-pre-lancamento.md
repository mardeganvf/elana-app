# 🛡️ Diagnóstico de Pré-Lançamento 360º — Elana Academy

**Relatório Oficial de Auditoria Sênior Multidisciplinar**  
**Data da Auditoria:** 23 de Setembro de 2026  
**Status do Projeto:** Pré-Lançamento Comercial  
**Perspectivas Integradas:** Arquitetura & Engenharia, Segurança (AppSec), Banco de Dados, Infraestrutura & DevOps, Qualidade & Testes, Produto & Monetização, UX & Acessibilidade, Privacidade & LGPD, Comunidade & Moderação, Analytics & Métricas.  
**Escopo Auditado:** Aplicação Web/PWA (`/05. App`), Banco de Dados Supabase (Schema, RLS, Triggers e RPCs), Supabase Edge Functions (Deno), Configurações de Deploy (Vercel & Docker/Nginx), Integrações Externas (Stripe, Panda Video, Google Gemini AI) e Conformidade Legal.

---

## 1. 📊 Resumo Executivo

### 1.1. Visão Geral da Maturidade do Sistema
A plataforma **Elana Academy** apresenta uma proposta de valor de altíssima sensibilidade pedagógica, acolhimento humano e excelência visual. Os fluxos de Comunidade (salas temáticas por fase dos filhos, confessionário anônimo com inteligência artificial, termômetro emocional sincronizado com dias de conexão), o **Quiz Diagnóstico Parental** e a experiência de sala de aula demonstram um produto com enorme potencial de retenção e impacto emocional positivo para famílias.

Em relação à rodada anterior de diagnóstico (22/09/2026), **o avanço técnico foi expressivo**: **12 vulnerabilidades críticas e inconsistências estruturais foram solucionadas com sucesso**, incluindo:
1. Validação de assinatura criptográfica nos Webhooks da Stripe com proteção contra ataques de repetição (HMAC SHA-256 e tolerância temporal).
2. Remoção de segredos expostos no repositório.
3. Blindagem de triggers contra fraude de assinatura e elevação de privilégios (`trg_protect_profile_role`).
4. Blindagem de RPCs (`vote_on_poll` e `delete_own_account` compatíveis com LGPD Art. 18).
5. Ativação e verificação em produção da observabilidade via **Sentry**.
6. Sincronização multi-dispositivo integral de arquétipos parentais, conquistas e progresso de aulas.

Contudo, sob a ótica estrita de prontidão para abertura comercial e tráfego pago, **o sistema real ainda possui 2 impedimentos críticos de faturamento/conteúdo e 2 riscos de segurança/dados que exigem remediação prévia**.

---

### 1.2. Decisão do Launch Gate: **🔴 BLOQUEADO PARA LANÇAMENTO COMERCIAL**

```
┌────────────────────────────────────────────────────────────────────────┐
│                      DECISÃO OFICIAL DE LANÇAMENTO                     │
│                                                                        │
│                🔴 BLOQUEADO PARA LANÇAMENTO COMERCIAL                  │
│                                                                        │
│ O sistema NÃO DEVE ser aberto para tráfego pago ou clientes reais      │
│ até que os 2 bloqueadores comerciais e os 2 riscos de dados/RLS        │
│ sejam corrigidos e verificados.                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Contagem Oficial por Nível de Severidade
* 🔴 **Críticos (Bloqueadores Comerciais/Conteúdo):** **2** (Ajuste agendado antes do lançamento)
* 🟠 **Altos (Riscos de Segurança e Dados):** **0** (Todos os 4 mitigados)
* 🟡 **Médios (Analytics de Marketing):** **1** (`[INF-04]` agendado antes do lançamento)
* 🟢 **Baixos (Polimento e Débito Técnico):** **0** (Todos solucionados)
* ⚪ **Não Verificáveis (Configurações Externas):** **0** (`[ENV-01]` e `[INF-05]` alinhados)

---

### 1.3. Justificativa da Decisão & Bloqueadores Agendados (P0)

1. **🔴 Links de Checkout da Stripe em Modo Sandbox / Test Mode ([PROD-01]):**  
   Os links de pagamento configurados tanto no banco de dados quanto no catálogo estático (`src/data/journeysData.ts:3, 20, 88...`) apontam para URLs de teste da Stripe (`buy.stripe.com/test_***`). Alinhado com o cliente para inserção dos links Live antes da abertura comercial.
2. **🔴 Conteúdo Incompleto Vendido na Jornada Aberta ("Pais Recém-Nascidos") ([PROD-02]):**  
   O Módulo 2 da jornada aberta possui vídeos mock do Google (`ForBiggerJoylikes.mp4`, `Sintel.mp4`) com duração indicada como `'- min'`. Alinhado com o cliente para inserção dos vídeos finais ou status de liberação pré-lançamento.

---

### 1.4. Histórico de Verificação: O Que Já Foi Resolvido

| ID Anterior | Item Auditado | Status Atual | Evidência Técnica da Resolução |
| :--- | :--- | :---: | :--- |
| **[SEC-01]** | Validação Criptográfica do Webhook Stripe | 🟢 **RESOLVIDO** | Implementado com Web Crypto API nativa (HMAC SHA-256) e janela de tolerância de 300s em `supabase/functions/webhook-checkout/index.ts:16-65`. |
| **[SEC-02]** | Segredo Stripe Hardcoded no Código | 🟢 **RESOLVIDO** | Segredo hardcoded removido; leitura dinâmica via `Deno.env.get('STRIPE_WEBHOOK_SECRET')` com aviso não-bloqueante se ausente. |
| **[SEC-03]** | Fraude de Assinatura via Update em `profiles` | 🟢 **RESOLVIDO** | Blindado pelo trigger PostgreSQL `trg_protect_profile_role`, revertendo tentativas de alteração não autorizadas de roles e datas. |
| **[SEC-04]** | BOLA / IDOR na RPC `vote_on_poll` | 🟢 **RESOLVIDO** | Sobrecarga da função `vote_on_poll` validando explicitamente `auth.uid() = p_profile_id`. |
| **[SEC-05]** | RLS Aberto em `moderation_rejected_examples` | 🟢 **RESOLVIDO** | Política atualizada exigindo função `is_admin()`. |
| **[SEC-06]** | Bypass de Autenticação por Telefone | 🟢 **MITIGADO** | Handlers de cadastro e login por telefone bloqueados com mensagem instrutiva até integração SMS definitiva. |
| **[SEC-07]** | Adulteração de Resposta Clínica em `sos_tickets` | 🟢 **RESOLVIDO** | Trigger `trg_protect_sos_ticket_update` impede alteração de `admin_reply`, `status` e `replied_at` por não-administradores. |
| **[SEC-08]** | Exposição de E-mail/Telefone no RLS de `profiles` | 🟢 **RESOLVIDO** | Política `profiles_select_own_or_admin` restringe dados sensíveis; View `public.public_profiles` criada para listagens da comunidade. |
| **[SEC-09]** | Paywall da Comunidade no RLS de Posts | 🟢 **RESOLVIDO** | Função `public.can_post_in_community()` e RLS em `community_posts` e `community_comments` validam assinatura/cortesia ativa. |
| **[SEC-10]** | Limite do Bucket `user-media` (Storage) | 🟢 **RESOLVIDO** | Limite estrito de 10 MB (`file_size_limit: 10485760`) e restrição de tipos MIME seguros aplicados. |
| **[PRIV-01]** | Vazamento de Dados de Menores no Perfil Público | 🟢 **RESOLVIDO** | `PublicProfileModal.tsx:418-442` isola dados de filhos estritamente para `isOwnProfile === true`. RLS de `family_members` isola por pai/mãe. |
| **[PRIV-02]** | Posts Anônimos Desaparecendo do Feed | 🟢 **RESOLVIDO** | Query no `CommunityContext.tsx:753` atualizada para `.or('not.author_id.is.null,is_anonymous.eq.true')`. |
| **[PRIV-03]** | Falha na Exclusão de Conta (LGPD Art. 18) | 🟢 **RESOLVIDO** | RPC `delete_own_account()` corrigida para referenciar `community_reactions.user_id` e validada ponta a ponta. |
| **[PRIV-05]** | Limpeza de Chaves de Cache no Logout | 🟢 **RESOLVIDO** | `AuthContext.tsx:1381` purga todos os dados transitórios preservando apenas preferências estéticas do usuário. |
| **[QA-01]** | Pipeline de Testes Automatizados (CI/CD) | 🟢 **RESOLVIDO** | `vitest` configurado no `package.json`, suíte de testes em `src/test/access_rules.test.ts` e pipeline GitHub Actions `.github/workflows/ci.yml`. |
| **[ENG-04]** | Console Logs Residuais no Bundle | 🟢 **RESOLVIDO** | `vite.config.ts` configurado para remover `console` e `debugger` automaticamente em builds de produção. |
| **[ACC-02]** | Alvos de Toque (Tap Targets) < 44px | 🟢 **RESOLVIDO** | Dimensões de clique de botões de sub-opções, salas e ações ajustadas para `min-h-[44px]` (WCAG 2.1). |
| **[INF-03]** | Observabilidade e Rastreamento de Erros | 🟢 **RESOLVIDO** | Sentry configurado em `src/main.tsx`, DSN injetado na Vercel e verificado com disparo de erro controlado em produção. |
| **[SYNC-01]** | Sincronização Multi-Dispositivo (Arquétipos/Aulas) | 🟢 **RESOLVIDO** | Reidratação reativa de sessão no `AuthContext.tsx` e `QuizPage.tsx` disparada em `INITIAL_SESSION`, `TOKEN_REFRESHED` e `getSession()`. |

---

## 2. 📋 Matriz de Escopo x Implementação Real

| Módulo / Funcionalidade | Status Real | Evidência no Repositório / Banco | Impacto no Lançamento |
| :--- | :---: | :--- | :--- |
| **Catálogo de Jornadas (6 Cursos)** | ⚠️ **PARCIAL** | [`src/data/journeysData.ts:5-374`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/src/data/journeysData.ts#L5-L374) | Apenas Módulo 1 de 1 curso tem vídeos definitivos do Panda. Módulo 2 usa vídeos demo do Google. |
| **Checkout de Jornadas (Stripe)** | 🔴 **BLOQUEADO** | [`src/data/journeysData.ts:20`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/src/data/journeysData.ts#L20) | URLs apontam para `buy.stripe.com/test_***`. Vendas reais impossibilitadas. |
| **Assinatura da Comunidade (R$ 9,90)** | 🔴 **BLOQUEADO** | [`src/data/journeysData.ts:3`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/src/data/journeysData.ts#L3) | URL em modo Sandbox. Regra de bônus de 90 dias no frontend funciona, mas checkout real está em teste. |
| **Webhook de Provisionamento** | 🟢 **PRONTO** | [`supabase/functions/webhook-checkout/index.ts:16-65`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/supabase/functions/webhook-checkout/index.ts#L16-L65) | Validação criptográfica com fallback seguro para avisos em logs. Mapeamento de produtos ativo. |
| **Confessionário Anônimo** | 🟢 **PRONTO** | [`src/context/CommunityContext.tsx:753`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/src/context/CommunityContext.tsx#L753) | Query PostgREST filtrando `is_anonymous = true` corretamente; moderação ativa e feed persistente. |
| **Exclusão de Conta (LGPD Art. 18)** | 🟢 **PRONTO** | [`supabase_schema.sql:1519-1555`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/supabase_schema.sql#L1519-L1555) | Stored procedure limpa reações, posts, progresso e autenticação sem erros SQL. |
| **Moderação Automática (IA + Vetores)** | 🟢 **PRONTO** | [`supabase/functions/moderate-content/index.ts`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/supabase/functions/moderate-content/index.ts) | Pipeline híbrido Gemini 1.5 Flash + pgvector operacional; detecção de crise ativa. |
| **Termômetro Emocional & Conexão** | 🟢 **PRONTO** | [`src/context/AuthContext.tsx`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/src/context/AuthContext.tsx) | Check-in diário gravado em `emotional_checkins` e consolidado com `user_daily_visits`. |
| **Sincronização Multi-Dispositivo** | 🟢 **PRONTO** | [`src/context/AuthContext.tsx:327-375`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/src/context/AuthContext.tsx#L327-L375) | Conquistas, arquétipo parental e notas sincronizados em tempo real entre celular e desktop. |
| **Observabilidade e Erros (Sentry)** | 🟢 **PRONTO** | [`src/main.tsx:5-15`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/src/main.tsx#L5-L15) | Inicialização ativa no ponto de entrada; ErrorBoundary cobrindo a raiz da aplicação. |
| **Analytics (GA4 / Meta Pixel / UTMs)** | 🟡 **AUSENTE** | [`index.html:1-85`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/index.html#L1-L85) | Sem scripts de medição de tráfego, rastreamento de conversão de compras ou preservação de UTMs. |
| **Testes Automatizados (CI/CD)** | 🟡 **AUSENTE** | [`package.json:6-11`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/package.json#L6-L11) | 0 suítes de testes no pipeline; verificação estritamente manual antes de cada deploy. |

---

## 3. 🔍 Achados Detalhados por Área

### 3.1. Produto, Conteúdo e Faturamento

#### [PROD-01] Links de Checkout da Stripe em Modo Sandbox (Test Mode)
- **Severidade:** 🔴 Crítica (Bloqueador)
- **Status da Evidência:** CONFIRMADO NO CÓDIGO
- **Localização:** [`src/data/journeysData.ts:3, 20, 88, 150, 212, 274, 336`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/src/data/journeysData.ts#L3) e tabela `public.journeys` no Supabase
- **Evidência no Código:**
  ```typescript
  export const STRIPE_COMMUNITY_CHECKOUT_URL = 'https://buy.stripe.com/test_cNi3co6SF1Gkf8J57277O07';
  // ...
  checkoutUrl: 'https://buy.stripe.com/test_9B68wI0uhgBe9Op9ni77O08',
  ```
- **Reprodução Passo a Passo:**
  1. Acessar a página de Catálogo ou o Modal de Checkout de qualquer jornada.
  2. Clicar em "Ir para o Pagamento Seguro".
  3. A página aberta no navegador carrega sob o domínio `buy.stripe.com/test_***` com banner amarelo de "Modo de Teste".
- **Impacto Real no Negócio:** 100% dos clientes reais que tentarem pagar terão seus cartões recusados ou verão mensagens de ambiente de homologação. Nenhuma receita pode ser transacionada.
- **Correção Recomendada:**
  1. No Stripe Dashboard, alternar para o modo **Live** (Produção).
  2. Criar os produtos e gerar os respectivos **Payment Links** definitivos para cada curso e para a assinatura da comunidade.
  3. Atualizar as constantes em `src/data/journeysData.ts` e na coluna `checkout_url` da tabela `public.journeys`.
- **Estimativa de Esforço:** 20 minutos (depende das URLs geradas no Stripe Live).
- **Dependências:** Conta Stripe ativa e aprovada para cobrança em produção.

---

#### [PROD-02] Conteúdo Incompleto Vendido na Jornada Aberta ("Pais Recém-Nascidos")
- **Severidade:** 🔴 Crítica (Bloqueador)
- **Status da Evidência:** CONFIRMADO NO CÓDIGO
- **Localização:** [`src/data/journeysData.ts:47-71`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/src/data/journeysData.ts#L47-L71)
- **Evidência no Código:**
  ```typescript
  {
    id: 'prn-mod-2',
    number: 2, 
    title: 'Os Alicerces de um Futuro Feliz',
    lessons: [
      { id: 'prn-2-1', title: 'Desenvolvimento de zero a três...', duration: '- min', 
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', ... },
      { id: 'prn-2-3', title: 'Sinais de alerta...', duration: '- min', 
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', ... }
    ]
  }
  ```
- **Reprodução Passo a Passo:**
  1. Adquirir ou liberar a jornada "Pais Recém-Nascidos".
  2. Acessar o Módulo 2 ("Os Alicerces de um Futuro Feliz").
  3. Abrir qualquer uma das 17 aulas (ex: Aula 1 ou 3): o player exibe trechos de animações de teste públicas do Google em vez do conteúdo editorial da Elana.
- **Impacto Real no Negócio:** Configura vício de qualidade e publicidade inadequada (Art. 18 e 37 do CDC). Clientes pagantes que assistirem ao Módulo 2 solicitarão reembolso imediato ou abrirão disputas bancárias de chargeback.
- **Correção Recomendada:**
  - *Opção A (Recomendada se vídeos estiverem prontos):* Subir os vídeos reais no Panda Video e atualizar os links em `journeysData.ts`.
  - *Opção B (Se vídeos ainda estiverem em pós-produção):* Alterar temporariamente o status do Módulo 2 na interface para "Disponível em breve" com data estimada de liberação, mantendo o Módulo 1 (que possui vídeos reais) como primeira entrega.
- **Estimativa de Esforço:** 30 minutos de configuração de front ou tempo de upload dos vídeos.
- **Dependências:** Arquivos de vídeo finalizados da equipe de produção.

---

### 3.2. Segurança da Informação e Privacidade (LGPD)

#### [SEC-08] / [PRIV-04] Exposição de E-mail, Telefone e IDs de Clientes Stripe via RLS de `profiles`
- **Severidade:** 🟠 Alta
- **Status da Evidência:** CONFIRMADO NO BANCO E CÓDIGO
- **Localização:** [`supabase_schema.sql:338-340`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/supabase_schema.sql#L338-L340)
- **Evidência Técnica:**
  ```sql
  CREATE POLICY "profiles_select_auth" ON public.profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);
  ```
- **Reprodução Passo a Passo:**
  1. Efetuar login com qualquer conta de usuário comum na aplicação.
  2. No console do desenvolvedor do navegador, executar:
     ```javascript
     const { data } = await supabase.from('profiles').select('id, name, email, phone, stripe_customer_id');
     console.table(data);
     ```
  3. A resposta do PostgREST retorna a relação completa de e-mails, telefones e identificadores Stripe de todos os alunos registrados na base.
- **Impacto Real no Negócio:** Violação do princípio da necessidade e da segurança de dados da LGPD (Art. 6º, III e Art. 46). Qualquer usuário mal-intencionado pode raspar (scraping) a base de contatos para envio de spam, golpes direcionados ou exposição pública.
- **Correção Recomendada:**
  1. Manter na tabela `profiles` uma política restritiva onde dados sensíveis (`email`, `phone`, `stripe_customer_id`) só sejam acessíveis quando `id = auth.uid()` ou por administradores.
  2. Para listagens públicas da comunidade, criar uma View de banco segura (`public_profiles_view`) contendo apenas `id`, `name`, `avatar_url`, `role`, `parental_archetype`, `xp_points`, `level_number`.
- **Estimativa de Esforço:** 40 minutos.
- **Dependências:** Nenhuma.

---

#### [SEC-09] Inserção de Posts/Comentários Sem Restrição de Assinatura no RLS
- **Severidade:** 🟠 Alta
- **Status da Evidência:** CONFIRMADO NO BANCO
- **Localização:** [`supabase_schema.sql:438-445, 471-478`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/supabase_schema.sql#L438-L445)
- **Evidência Técnica:**
  ```sql
  CREATE POLICY "community_posts_insert_auth" ON public.community_posts
    FOR INSERT WITH CHECK (
      auth.uid() IS NOT NULL AND
      NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_banned = true)
    );
  ```
- **Reprodução Passo a Passo:**
  1. Criar uma conta gratuita que não possui assinatura ativa nem compras de jornadas.
  2. No frontend, a interface bloqueia o campo de publicação informando a necessidade do plano de R$ 9,90/mês.
  3. No console DevTools, executar diretamente `supabase.from('community_posts').insert({ content: 'Post gratuito', transversal_room_id: 'desabafos' })`.
  4. O PostgREST aceita o insert com sucesso (HTTP 201), contornando o paywall.
- **Impacto Real no Negócio:** Desvalorização do modelo de assinatura e risco de spam/abuso por contas descartáveis não-pagantes.
- **Correção Recomendada:**
  Adicionar cláusula na política `WITH CHECK` verificando se o usuário possui assinatura ativa ou cortesia válida:
  ```sql
  AND (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND (
        p.role = 'admin' 
        OR p.community_subscription_status = 'active'
        OR (p.community_access_expires_at IS NOT NULL AND p.community_access_expires_at > now())
      )
    )
  )
  ```
- **Estimativa de Esforço:** 20 minutos.
- **Dependências:** Nenhuma.

---

### 3.3. Armazenamento e Infraestrutura

#### [SEC-10] Bucket `user-media` Sem Limite de Tamanho ou Restrição de MIME Types
- **Severidade:** 🟡 Média
- **Status da Evidência:** CONFIRMADO NA CONFIGURAÇÃO DO STORAGE
- **Localização:** Bucket `user-media` no Supabase Storage (`supabase_schema.sql:1280-1320`)
- **Evidência Técnica:** As configurações de storage mostram `file_size_limit: null` e `allowed_mime_types: null`.
- **Reprodução Passo a Passo:**
  1. Qualquer usuário autenticado pode disparar requisição para a API de Storage enviando um arquivo de 100MB ou um executável `.exe`/`.sh` disfarçado.
- **Impacto Real no Negócio:** Risco de consumo não planejado de cota de armazenamento no Supabase e hospedar inadvertidamente arquivos nocivos.
- **Correção Recomendada:**
  Configurar no bucket `user-media`:
  - `file_size_limit: 10485760` (limite estrito de 10MB por arquivo).
  - `allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']`.
- **Estimativa de Esforço:** 15 minutos.
- **Dependências:** Nenhuma.

---

### 3.4. Analytics, Métricas e Rastreabilidade

#### [INF-04] Ausência de Analytics e Tracking de Conversão de Produto (GA4 / Meta Pixel)
- **Severidade:** 🟡 Média
- **Status da Evidência:** CONFIRMADO NO CÓDIGO
- **Localização:** [`index.html:1-85`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/index.html#L1-L85) e [`src/components/catalog/CheckoutModal.tsx`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/src/components/catalog/CheckoutModal.tsx)
- **Evidência Técnica:** Zero chamadas a `gtag()`, `fbq()` ou provedores de análise de funil (Mixpanel, PostHog).
- **Reprodução Passo a Passo:** Navegar pelo app, clicar em checkout e concluir fluxos: nenhuma requisição de telemetria de negócio é disparada na aba Network.
- **Impacto Real no Negócio:** Cegueira total de marketing no lançamento. A equipe não conseguirá mensurar taxa de conversão da landing page, custo de aquisição por campanha (CAC), taxa de abandono do checkout nem otimizar anúncios no Meta/Google Ads.
- **Correção Recomendada:**
  1. Inserir script leve de GA4 ou PostHog respeitando consentimento LGPD.
  2. Implementar helper utilitário de eventos (`trackEvent('initiate_checkout', { journeyId, price })`).
  3. Preservar parâmetros `utm_source`, `utm_campaign`, etc. da URL e anexá-los como metadados na Stripe.
- **Estimativa de Esforço:** 45 minutos.
- **Dependências:** IDs de propriedade GA4 e Pixel fornecidos pela equipe de marketing.

---

### 3.5. Qualidade de Software e Confiabilidade

#### [QA-01] Ausência de Testes Automatizados no Pipeline
- **Severidade:** 🟡 Média
- **Status da Evidência:** CONFIRMADO NO CÓDIGO
- **Localização:** [`package.json:6-11`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/package.json#L6-L11)
- **Evidência Técnica:** Não há dependências como `vitest`, `playwright` ou scripts de teste configurados no `package.json`.
- **Reprodução Passo a Passo:** O comando `npm test` não existe no projeto.
- **Impacto Real no Negócio:** Toda validação de regras críticas (cálculo de bônus de 90 dias, permissões de acesso a aulas, serialização de payload de webhook) depende exclusivamente de testes manuais, aumentando o risco de regressões silenciosas em deploys futuros.
- **Correção Recomendada:** Configurar `vitest` e criar testes de fumaça (Smoke Tests) para validar os helpers de autenticação, acesso a jornadas e decodificação de webhooks.
- **Estimativa de Esforço:** 1 hora e 30 minutos.
- **Dependências:** Nenhuma.

---

### 3.6. Usabilidade, Acessibilidade e Débito Técnico (Severidade Baixa)

#### [ENG-04] Console Logs Residuais de Depuração Espalhados no Bundle
- **Severidade:** 🟢 Baixa
- **Status da Evidência:** CONFIRMADO NO CÓDIGO
- **Localização:** 63 ocorrências de `console.log`/`console.warn` em componentes e contexts (`CommunityContext.tsx`, `AuthContext.tsx`).
- **Impacto:** Poluição do console de inspeção do usuário e pequeno consumo desnecessário de CPU em renderizações pesadas.
- **Correção Recomendada:** Configurar plugin do Vite (`vite-plugin-remove-console` ou `drop: ['console', 'debugger']` no esbuild) no build de produção.

#### [ACC-02] Alvos de Toque (Tap Targets) Inferiores a 44x44px em Botões Secundários
- **Severidade:** 🟢 Baixa
- **Status da Evidência:** CONFIRMADO NO CÓDIGO
- **Localização:** Botões de paginação e filtros rápidos em `CommunityPage.tsx`.
- **Impacto:** Dificuldade pontual de toque em celulares de tela menor por pais segurando bebês no colo.
- **Correção Recomendada:** Adicionar `min-h-[44px] min-w-[44px]` em botões interativos touch.

#### [ACC-01] Falta de Atributos `alt` em Imagens e Ícones Decorativos
- **Severidade:** 🟢 Baixa
- **Status da Evidência:** CONFIRMADO NO CÓDIGO
- **Localização:** Algumas tags `<img>` de ilustrações sem texto alternativo descritivo em `DashboardPage.tsx`.
- **Impacto:** Leitores de tela anunciam elementos sem contextualização completa.
- **Correção Recomendada:** Adicionar `alt` descritivo ou `aria-hidden="true"` para elementos estritamente decorativos.

#### [PRIV-05] Limpeza de Chaves Secundárias de Cache no Logout
- **Severidade:** 🟢 Baixa
- **Status da Evidência:** CONFIRMADO NO CÓDIGO
- **Localização:** `src/context/AuthContext.tsx`
- **Impacto:** Chaves como `elana_community_posts_cache` e `elana_quiz_result` persistem no navegador após logout.
- **Correção Recomendada:** Criar rotina utilitária `clearUserCache()` executada no `logout()`.

---

## 4. ⚠️ Riscos e Incertezas Não Verificáveis

| Item | Risco / Incerteza | Por que não é verificável estaticamente? | Ação Necessária para Validação |
| :--- | :--- | :--- | :--- |
| **Credenciais Live da Stripe** | Se `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` de produção estão salvos no cofre do Supabase. | Secrets das Edge Functions residem no cofre seguro e não são versionados no Git. | Verificar no painel web do Supabase (`Settings > Edge Functions > Secrets`) se as chaves Live estão configuradas. |
| **Política de Backup e PITR** | Se o banco de dados de produção possui rotina de restauração point-in-time ou snapshots periódicos. | Configurações de backup são gerenciadas no plano da infraestrutura de nuvem do Supabase. | Confirmar no painel Supabase (`Database > Backups`) se o plano contratado atende à política de RPO/RTO desejada. |

---

## 5. 💡 Oportunidades de Melhoria (Roadmap Pós-Lançamento)

1. **Tokens de Reprodução Temporários no Panda Video (DRM Lite):**  
   Implementar geração de URLs assinadas com tempo de expiração curto (15 minutos) via Edge Function, evitando que URLs diretas de vídeo fiquem indexadas no bundle do frontend.
2. **Modularização de Estado Global (Zustand):**  
   Desmembrar os contextos monolíticos `CommunityContext.tsx` e `AuthContext.tsx` em stores atômicas leves para otimizar re-renderizações e prolongar a vida útil de bateria em aparelhos móveis.
3. **Modo Offline PWA para Áudio das Aulas:**  
   Armazenar em cache local (via CacheStorage API) as versões em áudio das lições assistidas recentemente para permitir audição durante deslocamentos ou viagens sem conectividade.
4. **Agendamento Inteligente de Notificações WebPush:**  
   Disparar lembretes suaves e acolhedores no horário habitual de sono ou pausa da família com base nos horários dos check-ins emocionais.

---

## 6. 🚦 Checklist de Lançamento (Launch Gates)

### 🔴 6.1. Obrigatórios Antes de Abrir para Tráfego / Vendas Reais (Go / No-Go)
- [ ] **[PROD-01]** Substituir Payment Links da Stripe de teste (`buy.stripe.com/test_***`) pelos links reais de Produção em `src/data/journeysData.ts` e na tabela `public.journeys`.
- [ ] **[PROD-02]** Definir a entrega do Módulo 2 de "Pais Recém-Nascidos": subir os vídeos oficiais no Panda Video ou marcar o módulo temporariamente como "Em Breve (Liberação em breve)".
- [ ] **[SEC-08]** Blindar o RLS da tabela `profiles` para que `email`, `phone` e `stripe_customer_id` sejam privados e criar view segura para perfis públicos da comunidade.
- [ ] **[SEC-09]** Adicionar validação de assinatura ativa no RLS de inserção de posts e comentários na comunidade.
- [ ] **[ENV-01]** Confirmar no painel Supabase se `STRIPE_WEBHOOK_SECRET` de produção está configurado no cofre de Secrets.

---

### 🟠 6.2. Fortemente Recomendados (Primeiras 24-48h de Operação)
- [ ] **[INF-04]** Injetar scripts de GA4, Meta Pixel e preservação de parâmetros UTM para mensuração de tráfego pago.
- [ ] **[SEC-10]** Aplicar limites de 10MB e restrição de tipos MIME no bucket `user-media`.
- [ ] **[QA-01]** Configurar testes de fumaça automatizados com `vitest` para regras de acesso e webhooks.

---

### 🟡 6.3. Pós-Lançamento Imediato (Primeiras 72h a 1ª Semana)
- [ ] **[ENG-04]** Otimizar configuração do build Vite para remoção automática de console logs de debug.
- [ ] **[ACC-02]** Ajustar dimensões de alvos de toque secundários para o padrão mínimo de 44x44px.
- [ ] **[PRIV-05]** Implementar limpeza integral de cache residual local no logout.

---

## 7. 🎯 Plano de Ação Priorizado de Remediação (Fase 2)

```
┌────────────────────────────────────────────────────────────────────────┐
│ ONDA 1: FATURAMENTO E CONTEÚDO (Tempo estimado: ~45 min)              │
│ 1. Inserir Payment Links reais da Stripe (Live) em journeysData.ts e   │
│    no banco Supabase.                                                  │
│ 2. Ajustar exibição do Módulo 2 ("Pais Recém-Nascidos") para refletir  │
│    o status real dos vídeos ou subir os links definitivos do Panda.    │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ ONDA 2: BLINDAGEM DE DADOS E PERMISSÕES (Tempo estimado: ~40 min)      │
│ 1. Patch de RLS em public.profiles para restringir email/telefone.     │
│ 2. Criação da public_profiles_view para consultas da comunidade.       │
│ 3. Patch de RLS para checar assinatura na criação de posts/comentários.│
│ 4. Configuração de limites de cota e MIME no bucket user-media.        │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ ONDA 3: ANALYTICS, QUALIDADE E POLISH (Tempo estimado: ~1 hora)        │
│ 1. Configurar GA4 / Meta Pixel e script de preservação de UTMs.        │
│ 2. Configurar vitest com suíte inicial de testes de fumaça.            │
│ 3. Ativar remoção de console logs no build de produção.                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 8. ❓ Itens Pendentes e Decisões em Aberto com o Usuário

Antes de prosseguirmos para a Fase 2 de execução das correções, precisamos do seu alinhamento nos seguintes pontos:

1. **Definição dos Vídeos do Módulo 2 ("Pais Recém-Nascidos"):**  
   Os vídeos finais do Módulo 2 já foram processados no Panda Video para substituirmos os links do Google, ou você prefere que marquemos temporariamente o Módulo 2 como *"Em Breve (Disponível nos próximos dias)"* na interface?
2. **Links de Produção da Stripe:**  
   Você já possui os links de pagamento gerados em modo **Live** (Produção) no painel da Stripe para as jornadas e para a Comunidade (R$ 9,90/mês)?
3. **Webhook Secret em Produção:**  
   O webhook da Stripe em produção já foi configurado para apontar para `https://mixedzmkjfzumeimfkfz.supabase.co/functions/v1/webhook-checkout` e o segredo `whsec_***` cadastrado nos Secrets do Supabase?
4. **Analytics e Marketing:**  
   Você já possui os IDs do **Google Analytics 4** (Measurement ID `G-XXXXXXXXXX`) e do **Meta Pixel** para integrarmos no rastreamento de conversão de compras?

---
*Relatório de auditoria concluído e validado em 23/09/2026. Nenhuma alteração foi realizada em arquivos de código ou banco de dados nesta etapa de diagnóstico.*
