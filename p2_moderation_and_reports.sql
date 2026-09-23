-- ========================================================
-- ELANA ACADEMY — SCRIPT P2: PERSISTÊNCIA DE MODERAÇÃO IA & TRIGGER DE DENÚNCIAS
-- ========================================================

-- 1. ADICIONAR COLUNAS DE METADADOS DE MODERAÇÃO EM POSTS
ALTER TABLE public.community_posts 
  ADD COLUMN IF NOT EXISTS flag_reason TEXT,
  ADD COLUMN IF NOT EXISTS flag_type TEXT,
  ADD COLUMN IF NOT EXISTS suggests_crisis_support BOOLEAN DEFAULT FALSE;

-- 2. ADICIONAR COLUNAS DE METADADOS DE MODERAÇÃO EM COMENTÁRIOS
ALTER TABLE public.community_comments 
  ADD COLUMN IF NOT EXISTS flag_reason TEXT,
  ADD COLUMN IF NOT EXISTS flag_type TEXT;

-- 3. TRIGGER AUTOMÁTICA DE DENÚNCIAS COM SECURITY DEFINER
-- Previne a falha de RLS onde o usuário denunciante não podia atualizar o post de outro usuário
CREATE OR REPLACE FUNCTION public.handle_community_report_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_total_reports INT;
BEGIN
  -- Conta o total de denúncias ativas para o conteúdo denunciado
  SELECT count(*) INTO v_total_reports 
  FROM public.community_reports 
  WHERE content_type = NEW.content_type AND content_id = NEW.content_id;

  -- Se for postagem
  IF NEW.content_type = 'post' THEN
    UPDATE public.community_posts
    SET 
      report_count = v_total_reports,
      status = CASE WHEN v_total_reports >= 3 THEN 'sob_moderacao' ELSE status END,
      category = CASE WHEN v_total_reports >= 3 THEN 'sob_moderacao' ELSE category END,
      flag_reason = CASE WHEN v_total_reports >= 3 THEN 'Retido preventivamente por acúmulo de denúncias da comunidade' ELSE flag_reason END
    WHERE id = NEW.content_id;

  -- Se for comentário
  ELSIF NEW.content_type = 'comment' THEN
    UPDATE public.community_comments
    SET 
      report_count = v_total_reports,
      status = CASE WHEN v_total_reports >= 3 THEN 'sob_moderacao' ELSE status END,
      flag_reason = CASE WHEN v_total_reports >= 3 THEN 'Retido preventivamente por acúmulo de denúncias da comunidade' ELSE flag_reason END
    WHERE id = NEW.content_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove versão anterior se existir
DROP TRIGGER IF EXISTS trg_on_community_report_insert ON public.community_reports;

-- Cria a trigger para disparar a cada nova denúncia inserida
CREATE TRIGGER trg_on_community_report_insert
  AFTER INSERT ON public.community_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_community_report_insert();

-- 4. ÍNDICES DE PERFORMANCE PARA MODERAÇÃO E DENÚNCIAS
CREATE INDEX IF NOT EXISTS idx_community_posts_flag_type ON public.community_posts(flag_type) WHERE status = 'sob_moderacao';
CREATE INDEX IF NOT EXISTS idx_community_posts_crisis ON public.community_posts(suggests_crisis_support) WHERE suggests_crisis_support = TRUE;
