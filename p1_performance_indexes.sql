-- ==============================================================================
-- 🚀 ELANA ACADEMY — ÍNDICES DE PERFORMANCE E PAGINAÇÃO (FASE 2 / P1-4)
-- Execute este script no Supabase SQL Editor para:
-- 1. Otimizar a listagem e paginação da Comunidade (15 em 15 posts)
-- 2. Evitar Sequential Scans e manter consultas abaixo de 100ms
-- ==============================================================================

BEGIN;

-- Índice composto para listagem de posts por status e data
CREATE INDEX IF NOT EXISTS idx_community_posts_status_created 
  ON public.community_posts(status, created_at DESC);

-- Índice composto para listagem de comentários por status e data
CREATE INDEX IF NOT EXISTS idx_community_comments_status_created 
  ON public.community_comments(status, created_at DESC);

-- Índice para consultas rápidas de moderação de denúncias
CREATE INDEX IF NOT EXISTS idx_community_reports_content_id 
  ON public.community_reports(content_id);

COMMIT;
