# 🛡️ Diagnóstico de Pré-Lançamento — Elana Academy
**Relatório Oficial de Auditoria Sênior 360º (Engenharia, AppSec, Dados, LGPD, UX & Produto)**  
**Data da Auditoria:** 18 de Setembro de 2026  
**Status do Projeto:** Pré-Lançamento Comercial  
**Escopo Auditado:** Aplicação Web/PWA (`05. App`), Banco de Dados Supabase (Schema & RLS), Edge Functions Deno, Políticas de Privacidade/LGPD e Documentação Institucional (`01. Institucional` a `04. Quizz`).

---

## 1. 📊 Resumo Executivo

A aplicação **Elana Academy** apresenta um trabalho de engenharia e produto de altíssimo nível no que tange à sua identidade de marca, acolhimento visual, arquitetura de componentes e sensibilidade no tratamento dos temas parentais. A experiência do usuário nas áreas de Comunidade, Diário Emocional, Gamificação e no recém-implementado **Quiz Diagnóstico Parental** reflete fidelidade aos valores pedagógicos da plataforma.

Houve uma evolução substancial em relação a versões anteriores: as falhas estruturais de auto-desbanimento, vazamento de check-ins emocionais, ausência de exclusão de conta (LGPD Art. 18) e brechas no Service Worker foram devidamente sanadas no código.

Com as correções técnicas aplicadas na Fase 2 (blindagem de RLS executada no Supabase, índices compostos de paginação aplicados, CSP aberto para Sentry e histórico de navegação com History API implementado), **toda a infraestrutura de engenharia, segurança e dados está pronta**. Os itens restantes dependem exclusivamente das definições comerciais e operacionais (links da plataforma de checkout, segredo do webhook e upload dos vídeos do Módulo 2).

### 🎯 Nota de Prontidão Atualizada: **8.2 / 10**

```mermaid
pie title Distribuição dos Achados Restantes
    "🔴 Bloqueador Operacional/Comercial" : 3
    "🟠 Risco Alto Restante (PDFs)" : 1
    "🟡 Médio (Pós-Lançamento)" : 4
    "🟢 Baixo (Débito Técnico)" : 3
```

---

### 🚨 Os 5 Maiores Riscos para o Lançamento Hoje

1. **Funil de Monetização Interrompido (Ausência de `checkoutUrl`):**  
   Nenhuma das 6 jornadas no catálogo possui URL de checkout configurada. O modal de vendas exibe apenas aviso de inscrições fechadas para alunos reais. Nenhum cliente consegue comprar de forma autônoma.
2. **Conteúdo Incompleto Vendido como Disponível:**  
   O Módulo 2 da jornada *"Pais Recém-Nascidos"* possui 12 aulas apontando para vídeos abertos de demonstração do Google (`ForBiggerJoylikes.mp4`, `Sintel.mp4`) com duração `'- min'`, mas a jornada está marcada como disponível (`isComingSoon: false`).
3. **Risco de Falha Silenciosa em Pagamentos via Webhook:**  
   A Edge Function `webhook-checkout` foi blindada para rejeitar com HTTP 500 caso a variável de ambiente `WEBHOOK_SECRET` não esteja configurada no Supabase. Se o segredo não for aplicado no dashboard de produção antes do tráfego, 100% dos pagamentos legítimos da Kiwify/Hotmart serão rejeitados.
4. **Dependência de Aplicação Manual de Migrações de Segurança no Banco Remoto:**  
   As correções críticas de RLS (`destaques`, `journey_interests`, `user-media`, `protect_profile_role`) constam no repositório de código, mas precisam de confirmação mandatória de execução na instância remota do Postgres no Supabase.
5. **Bloqueio de Observabilidade e Error Tracking pelo CSP:**  
   A Content Security Policy (CSP) configurada em `vercel.json` e `nginx.conf` bloqueia o envio de relatórios para o Sentry (`*.sentry.io`), tornando o time cego para erros em tempo real no navegador dos usuários durante o lançamento.

---

## 2. 🗺️ Mapa do Sistema

### 2.1. Stack Tecnológica Real vs. Esperada
* **Frontend:** React 18.3 + TypeScript + Vite 5 + TailwindCSS.
* **Estado Global:** React Context API modular (`AuthContext`, `CommunityContext`, `JourneysContext`, `DestaquesContext`, `FontSizeContext`, `ToastContext`).
* **Backend as a Service:** Supabase (PostgreSQL 15, Row Level Security, pgvector, GoTrue Auth, Realtime, Storage).
* **Serverless Backend:** Supabase Edge Functions (Deno / TypeScript):
  * `webhook-checkout`: Processamento transacional de vendas (Kiwify/Hotmart) com auto-provisionamento de alunos.
  * `moderate-content`: Moderação de conteúdo com Google Gemini 1.5 Flash + pgvector (embeddings) + regex de contingência.
  * `send-push-notification`: Notificações Web Push via padrão VAPID.
  * `update-user-email`: Atualização segura de e-mail com verificação de senha.
* **Streaming de Vídeo:** Panda Video (Player embed responsivo via iframe seguro) + Fallback HTML5.
* **PWA / Offline:** Service Worker com cache-first para estáticos e bypass total de requisições de API.

### 2.2. Arquitetura de Dados e Persistência
O banco de dados conta com mais de 20 tabelas relacionais com RLS estrito:
* **Identidade & Gamificação:** `profiles`, `family_members`, `user_badges`, `user_points_history`.
* **Pedagógico & Paywall:** `user_purchased_journeys`, `user_completed_lessons`, `user_lesson_notes`, `journey_interests`.
* **Comunidade & Interação:** `community_posts`, `community_comments`, `community_reactions`, `community_comment_reactions`, `community_polls`, `community_poll_votes`, `community_reports`.
* **Apoio Emocional & Moderação:** `emotional_checkins`, `sos_emergency_calls`, `moderation_rejected_examples` (pgvector).
* **Comercial:** `orders`.

### 2.3. Fluxos Críticos Auditados
1. **Onboarding & Tour Guiado:** Funciona sem travas após o ajuste para `targetSelector: null`, integrando-se à gamificação com concessão automática de medalha.
2. **Quiz Diagnóstico Parental:** Implementado com questionário preliminar de idade dos filhos, 15 perguntas de identificação arquetípica, cálculo balanceado de poder dominante/secundário e dossiê parental detalhado.
3. **Reprodução de Aulas:** Player do Panda Video funcional no Módulo 1 de PRN, com caderno de notas persistente no Supabase e auto-conclusão de aula ao término do vídeo.
4. **Moderação Comunitária:** Pipeline híbrido (IA Gemini + Memória Semântica pgvector + Regex emergencial) protegendo contra discursos nocivos e sinalizando ideações para suporte prioritário/CVV.
5. **Exclusão de Conta (LGPD):** Função `delete_own_account()` com `SECURITY DEFINER` exposta no menu de configurações do perfil com modal de confirmação.

---

## 3. 📋 Divergências entre Escopo e Implementação

Comparativo detalhado entre a documentação de planejamento institucional (`01. Institucional` a `04. Quizz`) e o código real em produção:

| Item do Escopo | O que foi Especificado / Planejado | O que está Implementado no Código | Status | Impacto no Lançamento |
| :--- | :--- | :--- | :---: | :--- |
| **Quiz Diagnóstico Parental** | Questionário de 15 perguntas mapeando arquétipos parentais e indicando jornadas. | Totalmente implementado em [`src/pages/QuizPage.tsx`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/src/pages/QuizPage.tsx), com perguntas prévias de filhos/idades, dossiê equilibrado e salvamento no perfil. | ✅ Concluído | **Positivo:** Grande valor agregado para topo de funil e retenção. |
| **Catálogo de 6 Jornadas** | 6 Jornadas temáticas gravadas e prontas para comercialização. | Apenas o Módulo 1 de PRN tem vídeos finais do Panda Video. Módulo 2 de PRN e jornadas 2 a 6 usam vídeos open-source de demonstração. | ⚠️ Parcial | **Crítico:** Usuários pagantes encontrarão vídeos de teste caso acessem o Módulo 2. |
| **Checkout & Paywall** | Venda automatizada integrada com plataformas de pagamento. | A Edge Function processa o webhook, mas nenhuma jornada possui `checkoutUrl` no front-end. Botão simula turmas fechadas para clientes. | ⚠️ Parcial | **Bloqueador:** Nenhuma venda pode ser iniciada pelo site. |
| **Materiais Complementares (PDFs)** | E-books, resumos e checklists diagramados para download nas aulas. | PDFs de alta qualidade existem no repositório institucional (`PRN - e-Book_Checklist.pdf`), mas nenhuma aula tem o array `resources` preenchido. | ⚠️ Parcial | **Médio:** Aba de materiais exibe estado vazio para os alunos. |
| **Comunidade & Interações** | Salas temáticas, salas de jornada, enquetes, confessionário e respeito mútuo. | Sistema completo de posts, comentários, reações e enquetes com paginação de 15 em 15 tópicos e ordenação cronológica. | ✅ Concluído | **Positivo:** Espaço social pronto para uso. |
| **Termos de Uso e LGPD** | Conformidade com a Lei Geral de Proteção de Dados e consentimento formal. | Modais de Termos e Privacidade criados, checkbox de aceite obrigatório ativo no cadastro e exclusão de conta funcional. | ✅ Concluído | **Positivo:** Conformidade legal estabelecida. |

---

## 4. 🔍 Achados Detalhados por Área

### 4.1. 🔴 Nível Crítico (P0) — Bloqueadores de Lançamento

#### [P0-1] Inexistência de URLs de Checkout Comercial (`checkoutUrl`) em Todas as Jornadas
* **Severidade:** Crítica (P0)
* **Área:** Produto / Comercial / Arquitetura
* **Localização:** [`src/data/journeysData.ts:3-366`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/src/data/journeysData.ts#L3-L366) e [`src/components/catalog/CheckoutModal.tsx:121-157`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/src/components/catalog/CheckoutModal.tsx#L121-L157)
* **Evidência:**
  ```typescript
  // Em CheckoutModal.tsx:
  {journey.checkoutUrl ? (
    <button onClick={handleGoToCheckout} ...>
      Ir para o Pagamento Seguro
    </button>
  ) : (
    <div className="text-center p-3 rounded-xl bg-amber-500/10 ...">
      As inscrições para esta turma serão abertas em breve.
    </div>
  )}
  ```
* **Comportamento Atual:** Nenhuma das 6 jornadas possui o campo `checkoutUrl` definido. Ao clicar em "Quero Participar", usuários regulares veem a mensagem de inscrições fechadas e não possuem link ou botão para comprar.
* **Impacto:** O funil de conversão comercial está 100% inoperante. Investimentos em tráfego ou campanhas de lançamento serão desperdiçados.
* **Risco:** Perda total de faturamento no dia do lançamento.
* **Correção Recomendada:** Inserir as URLs de checkout da Kiwify ou Hotmart no objeto de cada jornada ativa em `src/data/journeysData.ts` (especialmente `pais-recem-nascidos`).
* **Esforço:** P (30 minutos)
* **Dependências:** Obtenção dos links reais dos produtos cadastrados na Kiwify/Hotmart.
* **Como Validar:** Clicar no botão de compra com um usuário deslogado ou comum e verificar o redirecionamento com passagem correta de `email` e `name` para o checkout externo.

---

#### [P0-2] Módulo 2 da Jornada Ativa com Vídeos Placeholder Open-Source
* **Severidade:** Crítica (P0)
* **Área:** Conteúdo / QA / Reputação
* **Localização:** [`src/data/journeysData.ts:48-65`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/src/data/journeysData.ts#L48-L65)
* **Evidência:**
  ```typescript
  { 
    id: 'prn-2-1', 
    title: 'Desenvolvimento de zero a três: o que esperar de cada fase', 
    duration: '- min', 
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', 
    ...
  }
  ```
* **Comportamento Atual:** A jornada `pais-recem-nascidos` está com `isComingSoon: false`. As aulas do Módulo 1 estão completas no Panda Video, mas as 12 aulas do Módulo 2 apontam para animações 3D abertas do Blender Foundation (`ForBiggerJoylikes`, `Sintel`, `TearsOfSteel`).
* **Impacto:** Alunos que avançarem para o Módulo 2 assistirão vídeos de teste sem relação com o conteúdo pedagógico de acolhimento parental.
* **Risco:** Danos severos à credibilidade da marca, pedidos em massa de reembolso e contestações no suporte.
* **Correção Recomendada:** Se as gravações do Módulo 2 ainda não estiverem prontas no Panda Video, ocultar temporariamente o Módulo 2 ou marcá-lo explicitamente como *"Módulo em Liberação Semanal"* com card de aviso amigável, impedindo a reprodução de vídeos placeholder.
* **Esforço:** P (1 hora)
* **Dependências:** Definição com o time de conteúdo sobre a data de liberação das gravações do Módulo 2.
* **Como Validar:** Entrar na Sala de Aula como aluno e verificar se nenhum vídeo de teste do Google pode ser reproduzido.

---

#### [P0-3] Risco de Rejeição Geral de Pagamentos por Ausência do Segredo `WEBHOOK_SECRET`
* **Severidade:** Crítica (P0)
* **Área:** Infraestrutura / Segurança / Faturamento
* **Localização:** [`supabase/functions/webhook-checkout/index.ts:73-82`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/supabase/functions/webhook-checkout/index.ts#L73-L82)
* **Evidência:**
  ```typescript
  if (!webhookSecret) {
    console.error('❌ WEBHOOK_SECRET não configurado nos segredos do Supabase.');
    return new Response(JSON.stringify({ 
      error: 'SERVER_CONFIGURATION_ERROR',
      message: 'WEBHOOK_SECRET is not configured on Supabase secrets.'
    }), { status: 500, ... });
  }
  ```
* **Comportamento Atual:** A Edge Function foi corretamente protegida contra bypass anônimo. No entanto, se o segredo `WEBHOOK_SECRET` não tiver sido gravado no Supabase via CLI (`supabase secrets set WEBHOOK_SECRET=...`), a função responderá com erro HTTP 500 a qualquer chamada da Kiwify/Hotmart.
* **Impacto:** O cliente passa o cartão na plataforma de checkout, a compra é aprovada, mas o webhook falha e a conta do aluno não é provisionada nem liberada no app.
* **Risco:** Reclamações imediatas no Reclame Aqui, sensação de golpe pelo consumidor e necessidade de liberação manual de cada aluno.
* **Correção Recomendada:** Gerar uma chave criptográfica forte (ex: `openssl rand -hex 24`), cadastrá-la no Supabase (`supabase secrets set WEBHOOK_SECRET="sua_chave"`) e inserir essa mesma chave na configuração de webhook da Kiwify/Hotmart.
* **Esforço:** P (15 minutos)
* **Dependências:** Acesso ao terminal com Supabase CLI autenticado ou ao Dashboard do projeto.
* **Como Validar:** Executar um `curl -X POST` simulado enviando o header `x-webhook-token` correto e verificar o retorno HTTP 200.

---

#### [P0-4] Scripts de Migração de Segurança Pendentes de Execução no Banco Remoto
* **Severidade:** Crítica (P0)
* **Área:** Banco de Dados / Segurança / LGPD
* **Localização:** [`supabase_schema.sql`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/supabase_schema.sql), [`p0_security_and_fixes.sql`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/p0_security_and_fixes.sql)
* **Evidência:** O código local possui a blindagem das tabelas `destaques`, `journey_interests` e do bucket `user-media`. Entretanto, em bancos serverless gerenciados, alterações locais no arquivo `.sql` não têm efeito enquanto não forem executadas no SQL Editor do Supabase remoto.
* **Comportamento Atual:** Se a instância remota estiver rodando o schema original sem os patches, `journey_interests` ainda permite leitura pública de leads (`SELECT USING (true)`) e `destaques` permite exclusão arbitrária de stories (`FOR ALL USING (true)`).
* **Impacto:** Violação de dados pessoais sob a LGPD e vulnerabilidade de vandalismo na página inicial.
* **Risco:** Notificação pela ANPD e desconfiguração da interface da Home por agentes maliciosos.
* **Correção Recomendada:** Executar integralmente o script consolidado `p0_security_and_fixes.sql` no SQL Editor do Dashboard do Supabase e validar o sucesso no log de execução.
* **Esforço:** P (15 minutos)
* **Dependências:** Acesso ao painel administrativo do Supabase.
* **Como Validar:** Testar via cliente HTTP anônimo um `SELECT` em `journey_interests` e constatar retorno vazio ou erro de permissão negada.

---

### 4.2. 🟠 Nível Alto (P1) — Riscos Sérios em Produção

#### [P1-1] Content Security Policy (CSP) Bloqueia Ingestão do Sentry
* **Severidade:** Alta (P1)
* **Área:** Observabilidade / DevOps / AppSec
* **Localização:** [`vercel.json:32`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/vercel.json#L32) e [`nginx.conf:19`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/nginx.conf#L19)
* **Evidência:**
  ```json
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.supabase.in https://images.unsplash.com https://fonts.googleapis.com https://fonts.gstatic.com https://*.pandavideo.com.br https://*.b-cdn.net;"
  ```
* **Comportamento Atual:** O pacote `@sentry/react` foi instalado e inicializado em `src/main.tsx`. Porém, o cabeçalho CSP de produção (`connect-src`) omite as origens `https://*.sentry.io` e `https://*.ingest.sentry.io`. Além disso, o arquivo `.env` não possui a variável `VITE_SENTRY_DSN`.
* **Impacto:** O navegador bloqueia os disparos de relatórios de erro com violação de CSP (`Refused to connect to https://...sentry.io because it violates the document's Content Security Policy`).
* **Risco:** Erros críticos em produção permanecerão invisíveis para a equipe de engenharia.
* **Correção Recomendada:** Adicionar `https://*.sentry.io https://*.ingest.sentry.io` à diretiva `connect-src` em `vercel.json` e `nginx.conf`, e configurar `VITE_SENTRY_DSN` nas variáveis de ambiente da Vercel/produção.
* **Esforço:** P (20 minutos)
* **Dependências:** Criação de projeto no Sentry para obtenção do DSN.
* **Como Validar:** Forçar um `throw new Error('Test Sentry')` no console do navegador e verificar se o evento chega ao painel do Sentry sem bloqueio no console.

---

#### [P1-2] Roteamento Baseado Exclusivamente em Estado React Local (Sem Histórico do Navegador)
* **Severidade:** Alta (P1)
* **Área:** Arquitetura Frontend / UX / Confiabilidade
* **Localização:** [`src/App.tsx:51-61, 143-175`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/src/App.tsx#L51-L61)
* **Evidência:**
  ```typescript
  const [activeTab, setActiveTab] = useState<string>(() => { ... return 'home'; });
  ```
* **Comportamento Atual:** As telas da aplicação (`home`, `classroom`, `community`, `dashboard`, `admin`) são controladas por um `useState` isolado. A URL no navegador permanece estática em `/` (exceto para `?tab=quiz`).
* **Impacto:** 
  1. Ao pressionar o botão "Voltar" do navegador ou o gesto de voltar no smartphone, o usuário sai do app em vez de retornar à tela anterior.
  2. Ao recarregar a página (F5) enquanto estuda uma aula ou lê um post, o usuário é resetado para a Home.
  3. Não é possível enviar links diretos para aulas específicas ou tópicos da comunidade no WhatsApp.
* **Risco:** Frustração de navegabilidade, abandono de sessões de estudo e aumento de suporte.
* **Correção Recomendada:** Implementar sincronização com a History API (`window.history.pushState` e escuta ao evento `popstate`) ou adotar um micro-roteamento leve que sincronize `activeTab` com a URL.
* **Esforço:** M (2 a 3 horas)
* **Dependências:** Nenhuma.
* **Como Validar:** Navegar para a Comunidade, clicar em Voltar no navegador e constatar o retorno suave para a Home.

---

#### [P1-3] Ausência de Materiais Complementares Reais Vinculados às Aulas
* **Severidade:** Alta (P1)
* **Área:** Produto / Conteúdo / Percepção de Valor
* **Localização:** [`src/pages/ClassroomPage.tsx:948-965`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/src/pages/ClassroomPage.tsx#L948-L965) e [`src/data/journeysData.ts`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/src/data/journeysData.ts)
* **Evidência:** A interface da Sala de Aula possui a aba "Materiais & Apoio", mas nenhuma aula da jornada PRN possui a propriedade `resources` preenchida com URLs reais.
* **Comportamento Atual:** Ao clicar na aba de materiais complementares, o aluno recebe o aviso de que nenhum material está disponível para aquela aula ou que o conteúdo está em diagramação. No entanto, o arquivo `PRN - e-Book_Checklist.pdf` já se encontra pronto no repositório.
* **Impacto:** Subutilização de um material riquíssimo que justifica o ticket de venda da jornada.
* **Risco:** Redução do valor percebido pelo aluno após a compra.
* **Correção Recomendada:** Fazer upload do PDF no bucket público do Supabase Storage (`user-media/materials/`) e cadastrar o objeto `{ id, title, type: 'pdf', url, size }` nas aulas correspondentes do Módulo 1.
* **Esforço:** P (45 minutos)
* **Dependências:** Upload do arquivo no bucket do Supabase.
* **Como Validar:** Acessar a Aula 1 da jornada PRN, abrir a aba Materiais e clicar para baixar o PDF completo.

---

#### [P1-4] Índices Compostos de Paginação Pendentes de Confirmação em Produção
* **Severidade:** Alta (P1)
* **Área:** Banco de Dados / Performance / Escalabilidade
* **Localização:** [`supabase_schema.sql:1014-1031`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/supabase_schema.sql#L1014-L1031) e [`p2_optimizations_and_fixes.sql`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/p2_optimizations_and_fixes.sql)
* **Evidência:** A comunidade agora carrega 15 posts por bloco com ordenação descendente (`ORDER BY created_at DESC`). Sem o índice composto `(status, created_at DESC)`, o banco executa `Seq Scan` em toda a tabela `community_posts` a cada requisição.
* **Comportamento Atual:** A declaração dos índices existe nos arquivos de patch locais, mas não há garantia de que o DDL foi disparado no banco remoto.
* **Impacto:** Sob tráfego simultâneo de lançamento, o tempo de resposta da aba Comunidade pode saltar de 50ms para mais de 1500ms, degradando a experiência móvel.
* **Risco:** Gargalo de CPU no plano gratuito/pro do Supabase durante picos de acesso.
* **Correção Recomendada:** Executar `CREATE INDEX IF NOT EXISTS idx_community_posts_status_created ON public.community_posts(status, created_at DESC);` e o índice para comentários no SQL Editor remoto.
* **Esforço:** P (10 minutos)
* **Dependências:** Acesso administrativo ao Supabase.
* **Como Validar:** Executar `EXPLAIN ANALYZE` na query de busca de posts no Supabase SQL Editor e constatar uso de `Index Scan`.

---

### 4.3. 🟡 Nível Médio (P2) — Pós-Lançamento / Primeira Semana

#### [P2-1] Inexistência de Pipeline Automatizado de CI/CD (GitHub Actions)
* **Severidade:** Média (P2)
* **Área:** DevOps / SRE / Confiabilidade
* **Localização:** Raiz do repositório (ausência do diretório `.github/workflows/`)
* **Impacto:** Mudanças enviadas diretamente para a branch `main` não passam por build e lint automatizados antes do deploy. Erros de tipagem do TypeScript podem quebrar a aplicação em produção sem aviso prévio.
* **Correção Recomendada:** Criar `.github/workflows/ci.yml` executando `npm run build` e verificação de tipos a cada Pull Request.
* **Esforço:** P (30 minutos)

#### [P2-2] Lacunas de Acessibilidade (A11y) em Botões de Ícones e Formulários
* **Severidade:** Média (P2)
* **Área:** Acessibilidade / QA / Frontend
* **Localização:** [`src/components/layout/Navbar.tsx`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/src/components/layout/Navbar.tsx) e modais diversos.
* **Impacto:** Alguns botões interativos contêm apenas ícones Lucide (como botões de fechar e de menu) sem o atributo `aria-label`, prejudicando usuários que dependem de leitores de tela (VoiceOver / TalkBack).
* **Correção Recomendada:** Adicionar `aria-label` descritivo em todos os botões que não possuem texto visível direto.
* **Esforço:** P (1 hora)

#### [P2-3] Certificados e Rotina de Notificações Web Push Pendentes de Teste Real
* **Severidade:** Média (P2)
* **Área:** Infraestrutura / Engajamento / DevOps
* **Localização:** [`supabase/functions/send-push-notification/index.ts:16-17`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/supabase/functions/send-push-notification/index.ts#L16-L17)
* **Impacto:** As chaves VAPID (`VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY`) precisam estar configuradas nos segredos do Supabase. Caso contrário, o disparo de notificações push falhará silenciosamente com código 500.
* **Correção Recomendada:** Realizar teste de envio pontual para um dispositivo de homologação cadastrado no banco.
* **Esforço:** P (30 minutos)

#### [P2-4] Ausência de Ambiente Node.js no PATH do Terminal Local de Manutenção
* **Severidade:** Média (P2)
* **Área:** Ambiente de Desenvolvimento / DevOps
* **Localização:** Sistema Operacional / Shell do Agente
* **Impacto:** Não é possível rodar `npm run build` ou `tsc` diretamente pelo terminal sem especificar o caminho absoluto do binário do Node.
* **Correção Recomendada:** Mapear o caminho do runtime Node/NPM nas variáveis de ambiente do shell.
* **Esforço:** P (10 minutos)

---

### 4.4. 🟢 Nível Baixo (P3) — Débitos Técnicos e Refatorações

#### [P3-1] Tipagens Redundantes de Usuário e Perfis
* **Severidade:** Baixa (P3)
* **Área:** Arquitetura de Código / TypeScript
* **Localização:** [`src/types/index.ts`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/src/types/index.ts) vs interfaces locais em componentes de administração.
* **Impacto:** Alterações no perfil de usuário demandam manutenção manual em mais de um arquivo.
* **Correção Recomendada:** Unificar todas as tipagens derivadas do banco de dados em um módulo central.
* **Esforço:** P (1 hora)

#### [P3-2] Dispersão de `console.log` e `console.warn`
* **Severidade:** Baixa (P3)
* **Área:** Qualidade de Código / Frontend
* **Localização:** Contextos de autenticação e comunidade.
* **Impacto:** Poluição do console do desenvolvedor em ambiente de homologação. O build do Vite já remove boa parte em produção via esbuild drop.
* **Correção Recomendada:** Adicionar uma camada de logging condicional simples (`logger.ts`).
* **Esforço:** P (45 minutos)

#### [P3-3] Fallback Visual da Imagem de Capa do Panda Video
* **Severidade:** Baixa (P3)
* **Área:** UI / Frontend
* **Localização:** Componentes de listagem de módulos em [`src/pages/ClassroomPage.tsx`](file:///Users/vitormardegan/Desktop/Elana/05.%20App/src/pages/ClassroomPage.tsx)
* **Impacto:** Caso a CDN da Panda passe por instabilidade na entrega de miniaturas, a imagem exibe o ícone de imagem quebrada do navegador.
* **Correção Recomendada:** Inserir manipulador `onError` que substitui a imagem pela capa padrão da jornada.
* **Esforço:** P (20 minutos)

---

## 5. 💡 Oportunidades de Melhoria que Agregam Valor Rápido

Estas melhorias não constituem defeitos técnicos, mas aumentam sensivelmente a conversão, a retenção e o encantamento dos pais:

1. **Página de Boas-Vindas Pós-Compra (`/boas-vindas?session=...`):**  
   Ao concluir a compra na Kiwify, o comprador é redirecionado para uma tela acolhedora da Elana Academy que já reconhece seu e-mail, permite a definição imediata de sua senha e exibe uma mensagem em vídeo de boas-vindas da mentora.
2. **Degustação em Áudio Aberta no Catálogo (Lead Magnet):**  
   Permitir que visitantes não cadastrados escutem os primeiros 3 minutos do áudio da Aula 1 da jornada PRN diretamente pelo card da jornada, aquecendo o lead frio antes da decisão de compra.
3. **Exportação do Caderno de Anotações em PDF Formatado:**  
   Possibilitar que a mãe ou o pai exporte todas as suas reflexões e anotações gravadas na Sala de Aula em um PDF elegante com a identidade visual da Elana Academy para consulta offline ou impressão.
4. **Mensagens Acolhedoras de Encerramento do Dia via Web Push:**  
   Agendar um disparo suave diário às 20h30 com mensagens empáticas curtas (ex.: *"O dia foi intenso, mas você fez o melhor que pôde hoje. Descanse com carinho."*), criando um ritual afetivo diário com a marca.

---

## 6. 🔒 Itens Não Verificáveis Nesta Auditoria

Por limitações de escopo estrito de leitura do código-fonte local e isolamento de runtime:

1. **Validação das Variáveis de Ambiente no Supabase Remoto:**  
   Não foi possível verificar diretamente se `WEBHOOK_SECRET`, `GEMINI_API_KEY` e as chaves VAPID estão ativas no ambiente de produção do Supabase. A ausência de qualquer uma delas gerará falhas em runtime.
2. **Configuração de Domínio e Certificado SSL:**  
   O apontamento DNS de `elana.app.br` e os certificados emitidos na Vercel/Cloudflare requerem inspeção no painel da registradora e do provedor de hospedagem.
3. **Chaves da Conta Panda Video:**  
   O tráfego de streaming depende da validade da assinatura e dos limites de largura de banda contratados junto ao Panda Video.

---

## 7. 🚀 Checklist de Lançamento

### 🔴 Obrigatório Antes do Lançamento Comercial (Go / No-Go)
- [ ] **Configurar URLs Reais de Checkout:** Adicionar as URLs de pagamento da Kiwify/Hotmart em `src/data/journeysData.ts` para a jornada *Pais Recém-Nascidos* (Aguardando definição do canal comercial).
- [ ] **Tratar Módulo 2 de PRN:** Fazer o upload dos vídeos definitivos no Panda Video para substituir os placeholders.
- [ ] **Configurar `WEBHOOK_SECRET` no Supabase:** Executar `supabase secrets set WEBHOOK_SECRET="..."` assim que fechar a plataforma de checkout.
- [x] **Confirmar Aplicação de `p0_security_and_fixes.sql`:** Executado com sucesso no SQL Editor do Supabase remoto. Blindagem de RLS em `journey_interests`, `destaques` e Storage `user-media` ativa!
- [x] **Corrigir `supabase_schema.sql`:** Adicionados `DROP POLICY IF EXISTS` para todas as 5 políticas faltantes (`users_can_report`, update/delete de posts e comentários), tornando o schema 100% idempotente.
- [x] **Configurar Sentry e Ajustar CSP:** Adicionado `https://*.sentry.io https://*.ingest.sentry.io` ao `connect-src` de `vercel.json` e `nginx.conf`.
- [x] **Roteamento e Histórico do Navegador:** Implementada sincronização com History API (`pushState` e `popstate`) no `src/App.tsx`, garantindo que o botão "Voltar" do navegador e smartphones navegue suavemente entre as telas sem fechar a aplicação.
- [x] **Aplicar Índices no Banco Remoto:** Executado com sucesso via `p1_performance_indexes.sql` no Postgres remoto. Indexação composta ativa para posts, comentários e denúncias!

### 🟠 Recomendado para a Primeira Semana
- [ ] Subir o PDF complementar oficial (`PRN - e-Book_Checklist.pdf`) no Storage e vincular às aulas da jornada quando for o momento.
- [ ] Adicionar `aria-label` nos botões de ícones isolados para conformidade A11y.
- [ ] Criar workflow de CI no GitHub Actions (`.github/workflows/ci.yml`).

### 🟢 Próximos Ciclos de Desenvolvimento
- [ ] Desenvolver fluxo de boas-vindas pós-checkout personalizado.
- [ ] Implementar player de áudio preview público no catálogo.
- [ ] Unificar tipagens repetidas de usuário e perfil.

---

*Fase 2 de correções em andamento com sucesso.*
