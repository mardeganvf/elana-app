-- ==============================================================================
-- 🛡️ ELANA ACADEMY — SCRIPT DE VENDAS E SEGURANÇA (FASE 2 / P1)
-- Execute este script no Supabase SQL Editor para:
-- 1. Criar a infraestrutura de vendas (tabela orders)
-- 2. Fechar as políticas abertas (USING true) em relatórios, reações, follows e visitas
-- 3. Ocultar posts e comentários sob moderação da API REST pública
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. INFRAESTRUTURA DE VENDAS: TABELA ORDERS (KIWIFY / HOTMART / STRIPE)
-- Armazena histórico financeiro, auditoria e status de acesso de cada aluno.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'kiwify' | 'hotmart' | 'eduzz' | 'stripe' | 'generic'
  buyer_email TEXT NOT NULL,
  buyer_name TEXT,
  buyer_phone TEXT,
  product_id TEXT NOT NULL,
  journey_id TEXT NOT NULL,
  amount NUMERIC(10,2),
  status TEXT NOT NULL, -- 'approved', 'refunded', 'chargedback', 'canceled', 'pending'
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(platform, external_id, status)
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_admin_or_buyer" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_admin" ON public.orders;
DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;
DROP POLICY IF EXISTS "orders_delete_admin" ON public.orders;

-- Administradores consultam todos os pedidos; alunos autenticados consultam suas compras
CREATE POLICY "orders_select_admin_or_buyer"
  ON public.orders FOR SELECT
  USING (
    public.is_admin()
    OR (auth.jwt()->>'email' IS NOT NULL AND LOWER(auth.jwt()->>'email') = LOWER(buyer_email))
  );

CREATE POLICY "orders_insert_admin"
  ON public.orders FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "orders_delete_admin"
  ON public.orders FOR DELETE
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON public.orders(buyer_email);
CREATE INDEX IF NOT EXISTS idx_orders_external_id ON public.orders(external_id);
CREATE INDEX IF NOT EXISTS idx_orders_journey_id ON public.orders(journey_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- ------------------------------------------------------------------------------
-- 2. BLINDAGEM DE DENÚNCIAS: community_reports
-- Apenas administradores podem ler denúncias de terceiros ou excluí-las.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "admins_can_read_reports" ON public.community_reports;
DROP POLICY IF EXISTS "reports_select_admin" ON public.community_reports;
DROP POLICY IF EXISTS "reports_delete_all" ON public.community_reports;

CREATE POLICY "admins_can_read_reports" ON public.community_reports
  FOR SELECT USING (public.is_admin());

CREATE POLICY "reports_delete_all" ON public.community_reports
  FOR DELETE USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. BLINDAGEM DE SEGUIDORES: user_follows
-- Apenas o próprio seguidor ou admin pode deixar de seguir.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id TEXT NOT NULL,
  followed_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, followed_id)
);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de follows" ON public.user_follows;
DROP POLICY IF EXISTS "Permitir insercao de follows" ON public.user_follows;
DROP POLICY IF EXISTS "Permitir remocao de follows" ON public.user_follows;

CREATE POLICY "Permitir leitura de follows" ON public.user_follows
  FOR SELECT USING (true);

CREATE POLICY "Permitir insercao de follows" ON public.user_follows
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Permitir remocao de follows" ON public.user_follows
  FOR DELETE USING (auth.uid()::text = follower_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. BLINDAGEM DE REAÇÕES: community_reactions
-- Impede que terceiros excluam ou alterem reações de outros membros.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "reactions_update_all" ON public.community_reactions;
DROP POLICY IF EXISTS "reactions_delete_all" ON public.community_reactions;

CREATE POLICY "reactions_update_all"
  ON public.community_reactions FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "reactions_delete_all"
  ON public.community_reactions FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. BLINDAGEM DE HISTÓRICO DE ACESSO: user_daily_visits
-- Apenas o próprio usuário ou admin podem ler suas presenças; exclusão apenas admin.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "visits_select_all" ON public.user_daily_visits;
DROP POLICY IF EXISTS "visits_insert_all" ON public.user_daily_visits;
DROP POLICY IF EXISTS "visits_update_all" ON public.user_daily_visits;
DROP POLICY IF EXISTS "visits_delete_all" ON public.user_daily_visits;

CREATE POLICY "visits_select_all" ON public.user_daily_visits FOR SELECT USING (auth.uid() = profile_id OR public.is_admin());
CREATE POLICY "visits_insert_all" ON public.user_daily_visits FOR INSERT WITH CHECK (auth.uid() = profile_id OR public.is_admin());
CREATE POLICY "visits_update_all" ON public.user_daily_visits FOR UPDATE USING (auth.uid() = profile_id OR public.is_admin());
CREATE POLICY "visits_delete_all" ON public.user_daily_visits FOR DELETE USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. BLINDAGEM DE PAPÉIS E PERMISSÕES: role_permissions
-- Leitura pública; inserção, atualização e exclusão restritas exclusivamente a admins.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role TEXT PRIMARY KEY, -- 'membro', 'guia', 'admin'
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "role_permissions_select_all" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_insert_all" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_update_all" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_delete_all" ON public.role_permissions;

CREATE POLICY "role_permissions_select_all"
  ON public.role_permissions FOR SELECT
  USING (true);

CREATE POLICY "role_permissions_insert_all"
  ON public.role_permissions FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "role_permissions_update_all"
  ON public.role_permissions FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "role_permissions_delete_all"
  ON public.role_permissions FOR DELETE
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. OCULTAÇÃO DE POSTS E COMENTÁRIOS SOB MODERAÇÃO NA API REST
-- Posts com status 'sob_moderacao' ficam visíveis apenas para o autor e admins.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read community_posts" ON public.community_posts;
DROP POLICY IF EXISTS "Allow public delete community_posts" ON public.community_posts;
DROP POLICY IF EXISTS "Allow public update community_posts" ON public.community_posts;
CREATE POLICY "Allow public read community_posts" ON public.community_posts FOR SELECT
  USING (
    status = 'aprovado'
    OR status IS NULL
    OR (auth.uid() IS NOT NULL AND auth.uid() = author_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Allow public read community_comments" ON public.community_comments;
DROP POLICY IF EXISTS "Allow public delete community_comments" ON public.community_comments;
DROP POLICY IF EXISTS "Allow public update community_comments" ON public.community_comments;
CREATE POLICY "Allow public read community_comments" ON public.community_comments FOR SELECT
  USING (
    status = 'aprovado'
    OR status IS NULL
    OR (auth.uid() IS NOT NULL AND auth.uid() = author_id)
    OR public.is_admin()
  );

COMMIT;
