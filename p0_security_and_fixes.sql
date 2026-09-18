-- ==============================================================================
-- 🛡️ ELANA ACADEMY — SCRIPT DE CORREÇÃO DE SEGURANÇA E INTEGRIDADE (P0)
-- Execute este script no Supabase SQL Editor para aplicar todas as correções de
-- banco de dados necessárias antes do lançamento comercial e integração de vendas.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. CORREÇÃO: PRIVACIDADE E LGPD EM CHAMADOS SOS (sos_tickets)
-- Restringe a leitura, inserção e atualização apenas ao autor da crise e admins.
-- Apenas administradores podem excluir chamados.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read sos_tickets" ON public.sos_tickets;
DROP POLICY IF EXISTS "Allow public insert sos_tickets" ON public.sos_tickets;
DROP POLICY IF EXISTS "Allow public update sos_tickets" ON public.sos_tickets;
DROP POLICY IF EXISTS "Allow public delete sos_tickets" ON public.sos_tickets;
DROP POLICY IF EXISTS "sos_select_auth" ON public.sos_tickets;
DROP POLICY IF EXISTS "sos_insert_auth" ON public.sos_tickets;
DROP POLICY IF EXISTS "sos_update_auth" ON public.sos_tickets;
DROP POLICY IF EXISTS "sos_delete_auth" ON public.sos_tickets;

CREATE POLICY "sos_select_auth"
  ON public.sos_tickets FOR SELECT
  USING (auth.uid() = profile_id OR public.is_admin());

CREATE POLICY "sos_insert_auth"
  ON public.sos_tickets FOR INSERT
  WITH CHECK (auth.uid() = profile_id OR public.is_admin());

CREATE POLICY "sos_update_auth"
  ON public.sos_tickets FOR UPDATE
  USING (auth.uid() = profile_id OR public.is_admin());

CREATE POLICY "sos_delete_auth"
  ON public.sos_tickets FOR DELETE
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 2. CORREÇÃO: BLINDAGEM CONTRA AUTO-ELEVAÇÃO DE ADMIN (profiles)
-- Impede que usuários comuns alterem seu próprio campo 'role' para 'admin'.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.role IS DISTINCT FROM 'user' AND NOT public.is_admin() THEN
      NEW.role := 'user';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role();

-- ------------------------------------------------------------------------------
-- 3. CORREÇÃO: BLINDAGEM DE PAYWALL (user_purchased_journeys)
-- Revoga inserção direta pelo cliente via DevTools.
-- Apenas administradores e service_role (Webhooks Kiwify/Hotmart) podem inserir.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read user_purchased_journeys" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "Allow public insert user_purchased_journeys" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "Allow public update user_purchased_journeys" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "Allow public delete user_purchased_journeys" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "journeys_select_own" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "journeys_insert_own" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "journeys_update_own" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "journeys_delete_own" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "journeys_insert_admin_or_service" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "journeys_update_admin_or_service" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "journeys_delete_admin_or_service" ON public.user_purchased_journeys;

CREATE POLICY "journeys_select_own"
  ON public.user_purchased_journeys FOR SELECT
  USING (auth.uid() = profile_id OR public.is_admin());

CREATE POLICY "journeys_insert_admin_or_service"
  ON public.user_purchased_journeys FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "journeys_update_admin_or_service"
  ON public.user_purchased_journeys FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "journeys_delete_admin_or_service"
  ON public.user_purchased_journeys FOR DELETE
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. CORREÇÃO: PRIVACIDADE DO CONFESSIONÁRIO ANÔNIMO (community_posts/comments)
-- Força author_id = NULL em registros anônimos no banco de dados.
-- Sanitiza retroativamente postagens antigas com anonimato.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sanitize_anonymous_posts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_anonymous = TRUE THEN
    NEW.author_id := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sanitize_anonymous_posts ON public.community_posts;
CREATE TRIGGER trg_sanitize_anonymous_posts
  BEFORE INSERT OR UPDATE ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_anonymous_posts();

DROP TRIGGER IF EXISTS trg_sanitize_anonymous_comments ON public.community_comments;
CREATE TRIGGER trg_sanitize_anonymous_comments
  BEFORE INSERT OR UPDATE ON public.community_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_anonymous_posts();

-- Sanitização retroativa de posts e comentários já gravados
UPDATE public.community_posts SET author_id = NULL WHERE is_anonymous = TRUE;
UPDATE public.community_comments SET author_id = NULL WHERE is_anonymous = TRUE;

-- Protege community_posts contra exclusão indevida por terceiros
DROP POLICY IF EXISTS "Allow author or admin update community_posts" ON public.community_posts;
DROP POLICY IF EXISTS "Allow author or admin delete community_posts" ON public.community_posts;
CREATE POLICY "Allow author or admin update community_posts" ON public.community_posts FOR UPDATE USING (auth.uid() = author_id OR public.is_admin());
CREATE POLICY "Allow author or admin delete community_posts" ON public.community_posts FOR DELETE USING (auth.uid() = author_id OR public.is_admin());

-- Protege community_comments contra exclusão indevida por terceiros
DROP POLICY IF EXISTS "Allow author or admin update community_comments" ON public.community_comments;
DROP POLICY IF EXISTS "Allow author or admin delete community_comments" ON public.community_comments;
CREATE POLICY "Allow author or admin update community_comments" ON public.community_comments FOR UPDATE USING (auth.uid() = author_id OR public.is_admin());
CREATE POLICY "Allow author or admin delete community_comments" ON public.community_comments FOR DELETE USING (auth.uid() = author_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. CORREÇÃO: RPC ATÔMICA DE VOTAÇÃO EM ENQUETES (vote_on_poll)
-- Registra voto do usuário em poll_votes e incrementa options e total_votes.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.vote_on_poll(
  p_poll_id    UUID,
  p_option_id  TEXT,
  p_profile_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Guard idempotente: se o usuário já votou, ignora
  IF EXISTS (
    SELECT 1 FROM public.poll_votes
    WHERE poll_id = p_poll_id AND profile_id = p_profile_id
  ) THEN
    RETURN;
  END IF;

  -- 2. Registra o voto na tabela poll_votes (fonte da verdade)
  INSERT INTO public.poll_votes (poll_id, profile_id, option_id, voted_at)
  VALUES (p_poll_id, p_profile_id, p_option_id, NOW())
  ON CONFLICT (poll_id, profile_id) DO NOTHING;

  -- 3. Incremento atômico no JSONB e total_votes
  UPDATE public.community_polls
  SET
    total_votes = total_votes + 1,
    options = (
      SELECT jsonb_agg(
        CASE
          WHEN (opt->>'id') = p_option_id
          THEN jsonb_set(opt, '{votesCount}', to_jsonb(COALESCE((opt->>'votesCount')::int, 0) + 1))
          ELSE opt
        END
      )
      FROM jsonb_array_elements(options) AS opt
    )
  WHERE id = p_poll_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.vote_on_poll(UUID, TEXT, UUID) TO authenticated;

COMMIT;
