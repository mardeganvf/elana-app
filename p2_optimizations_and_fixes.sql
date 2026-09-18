-- ==============================================================================
-- 🚀 ELANA ACADEMY — SCRIPT DE OTIMIZAÇÃO, REAÇÕES E MODERAÇÃO (FASE 3 / P2)
-- Execute este script no Supabase SQL Editor ou via Supabase CLI para:
-- 1. Suporte a persistência de reações em comentários (community_reactions)
-- 2. Campos de banimento de usuários abusivos em profiles
-- 3. Blindagem de RLS para impedir postagens/comentários de contas banidas
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. PERSISTÊNCIA DE REAÇÕES EM COMENTÁRIOS (PUBLIC.COMMUNITY_REACTIONS)
-- ------------------------------------------------------------------------------
-- Adicionar comment_id e tornar post_id anulável
ALTER TABLE public.community_reactions
  ADD COLUMN IF NOT EXISTS comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE;

ALTER TABLE public.community_reactions
  ALTER COLUMN post_id DROP NOT NULL;

-- Índice para busca rápida de reações por comentário
CREATE INDEX IF NOT EXISTS idx_community_reactions_comment ON public.community_reactions(comment_id);

-- Índice único: 1 reação por comentário por usuário
CREATE UNIQUE INDEX IF NOT EXISTS idx_community_reactions_comment_user
  ON public.community_reactions(comment_id, user_id)
  WHERE comment_id IS NOT NULL;

-- Restrição de integridade: a reação pertence OU a um post OU a um comentário
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_reaction_target'
  ) THEN
    ALTER TABLE public.community_reactions
      ADD CONSTRAINT check_reaction_target
      CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
      );
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. MODERAÇÃO ADMINISTRATIVA: BANIMENTO DE USUÁRIOS (PUBLIC.PROFILES)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS banned_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON public.profiles(is_banned) WHERE is_banned = true;

-- ------------------------------------------------------------------------------
-- 3. BLINDAGEM DE RLS: BLOQUEIO DE AÇÕES PARA USUÁRIOS BANIDOS
-- ------------------------------------------------------------------------------
-- Impedir postagens na comunidade se o perfil estiver banido
DROP POLICY IF EXISTS "Allow public insert community_posts" ON public.community_posts;
CREATE POLICY "Allow public insert community_posts" ON public.community_posts
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_banned = true
    )
  );

-- Impedir comentários na comunidade se o perfil estiver banido
DROP POLICY IF EXISTS "Allow public insert community_comments" ON public.community_comments;
CREATE POLICY "Allow public insert community_comments" ON public.community_comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_banned = true
    )
  );

-- Impedir novas reações se o perfil estiver banido
DROP POLICY IF EXISTS "reactions_insert_all" ON public.community_reactions;
CREATE POLICY "reactions_insert_all" ON public.community_reactions
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_banned = true
    )
  );

COMMIT;
