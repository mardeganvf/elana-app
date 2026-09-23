-- ==============================================================================
-- 🛡️ PATCH CONSOLIDADO DE SEGURANÇA, FATURAMENTO E LGPD — ELANA ACADEMY
-- Data: 23 de Setembro de 2026
-- Execute este script no SQL Editor do Supabase Dashboard (Projeto mixedzmkjfzumeimfkfz)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABELA PROFILES: COLUNAS DE ASSINATURA STRIPE & ÍNDICES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS community_subscription_status text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS community_subscription_id text,
  ADD COLUMN IF NOT EXISTS community_access_expires_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
  ON public.profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_community_status 
  ON public.profiles(community_subscription_status);

-- ------------------------------------------------------------------------------
-- 1.1. FUNÇÃO DE CHECAGEM DE ADMIN E SERVICE_ROLE
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- 1. Service role (Edge Functions / Webhooks)
  IF COALESCE(auth.role(), auth.jwt() ->> 'role') = 'service_role' THEN
    RETURN TRUE;
  END IF;

  -- 2. Sessão direta CLI / Migrações Postgres (quando não há requisição HTTP/JWT)
  IF session_user = 'postgres' AND (auth.role() IS NULL OR auth.role() = '') THEN
    RETURN TRUE;
  END IF;

  -- 3. Usuários autenticados com role 'admin' ou 'Administrador'
  IF auth.uid() IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'Administrador')
    );
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 2. BLINDAGEM DE ROLE, BANIMENTO E ASSINATURA: TRIGGER protect_profile_role
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.role IS DISTINCT FROM 'user' AND NOT public.is_admin() THEN
      NEW.role := 'user';
    END IF;
    IF (NEW.is_banned IS TRUE OR NEW.banned_at IS NOT NULL) AND NOT public.is_admin() THEN
      NEW.is_banned := false;
      NEW.banned_at := NULL;
      NEW.banned_reason := NULL;
    END IF;
    -- Protege campos de faturamento na criação se não for admin
    IF NOT public.is_admin() THEN
      NEW.community_subscription_status := COALESCE(NEW.community_subscription_status, 'free');
      NEW.community_access_expires_at := NULL;
      NEW.stripe_customer_id := NULL;
      NEW.community_subscription_id := NULL;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
      NEW.role := OLD.role;
    END IF;
    IF (
      NEW.is_banned IS DISTINCT FROM OLD.is_banned 
      OR NEW.banned_at IS DISTINCT FROM OLD.banned_at 
      OR NEW.banned_reason IS DISTINCT FROM OLD.banned_reason
    ) AND NOT public.is_admin() THEN
      NEW.is_banned := OLD.is_banned;
      NEW.banned_at := OLD.banned_at;
      NEW.banned_reason := OLD.banned_reason;
    END IF;
    -- 🛡️ BLINDAGEM FINANCEIRA: Usuários comuns não podem ativar assinatura própria
    IF (
      NEW.community_subscription_status IS DISTINCT FROM OLD.community_subscription_status
      OR NEW.community_access_expires_at IS DISTINCT FROM OLD.community_access_expires_at
      OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
      OR NEW.community_subscription_id IS DISTINCT FROM OLD.community_subscription_id
    ) AND NOT public.is_admin() THEN
      NEW.community_subscription_status := OLD.community_subscription_status;
      NEW.community_access_expires_at := OLD.community_access_expires_at;
      NEW.stripe_customer_id := OLD.stripe_customer_id;
      NEW.community_subscription_id := OLD.community_subscription_id;
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
-- 2.1. BLINDAGEM DE PRIVACIDADE: RLS EM PROFILES E VIEW DE PERFIS PÚBLICOS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_auth" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;

CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE OR REPLACE VIEW public.public_profiles WITH (security_invoker = false) AS
SELECT 
  id,
  name,
  avatar_url,
  role,
  bio,
  parental_archetype,
  parental_secondary_archetype,
  parental_quiz_completed_at,
  xp_points,
  level_number,
  level_name,
  badges_count,
  streak_days,
  is_banned,
  created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- ------------------------------------------------------------------------------
-- 3. DIREITO AO ESQUECIMENTO / EXCLUSÃO DE CONTA (LGPD ART. 18 / APPLE 5.1.1)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- 1. Excluir reações (coluna correta é user_id)
  DELETE FROM public.community_reactions WHERE user_id = current_user_id;
  DELETE FROM public.community_reports WHERE reporter_id = current_user_id;
  DELETE FROM public.poll_votes WHERE profile_id = current_user_id;
  DELETE FROM public.community_comments WHERE author_id = current_user_id;
  DELETE FROM public.community_posts WHERE author_id = current_user_id;

  -- 2. Excluir checkins emocionais e chamados SOS
  DELETE FROM public.emotional_checkins WHERE profile_id = current_user_id;
  DELETE FROM public.sos_tickets WHERE profile_id = current_user_id;

  -- 3. Excluir dados de progresso e engajamento
  DELETE FROM public.user_lesson_notes WHERE profile_id = current_user_id;
  DELETE FROM public.user_completed_lessons WHERE profile_id = current_user_id;
  DELETE FROM public.user_badges WHERE profile_id = current_user_id;
  DELETE FROM public.family_members WHERE profile_id = current_user_id;
  DELETE FROM public.user_follows WHERE follower_id = current_user_id::text OR followed_id = current_user_id::text;
  DELETE FROM public.push_subscriptions WHERE profile_id = current_user_id;
  DELETE FROM public.journey_interests WHERE user_id = current_user_id;

  -- 4. Excluir compras de jornadas
  DELETE FROM public.user_purchased_journeys WHERE profile_id = current_user_id;

  -- 5. Excluir perfil público
  DELETE FROM public.profiles WHERE id = current_user_id;

  -- 6. Excluir registro do auth.users
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 4. BLINDAGEM DE ENQUETES: vote_on_poll & community_polls
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.vote_on_poll(
  p_poll_id    UUID,
  p_option_id  TEXT,
  p_profile_id UUID DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_voter_id UUID := auth.uid();
BEGIN
  IF v_voter_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Impede votar em nome de outrem a menos que seja admin
  IF p_profile_id IS NOT NULL AND p_profile_id <> v_voter_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Não autorizado a votar por outro usuário';
  END IF;

  IF EXISTS (SELECT 1 FROM public.poll_votes WHERE poll_id = p_poll_id AND profile_id = v_voter_id) THEN
    RETURN;
  END IF;

  INSERT INTO public.poll_votes (poll_id, profile_id, option_id, voted_at)
  VALUES (p_poll_id, v_voter_id, p_option_id, NOW())
  ON CONFLICT (poll_id, profile_id) DO NOTHING;

  IF FOUND THEN
    UPDATE public.community_polls
    SET total_votes = COALESCE(total_votes, 0) + 1
    WHERE id = p_poll_id;
  END IF;
END;
$$;

DROP POLICY IF EXISTS "polls_update_auth" ON public.community_polls;
DROP POLICY IF EXISTS "polls_update_admin" ON public.community_polls;
CREATE POLICY "polls_update_admin"
  ON public.community_polls FOR UPDATE
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. BLINDAGEM DE MODERAÇÃO IA (moderation_rejected_examples)
-- ------------------------------------------------------------------------------
ALTER TABLE public.moderation_rejected_examples ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on moderation_rejected_examples" ON public.moderation_rejected_examples;
DROP POLICY IF EXISTS "Allow public read on moderation_rejected_examples" ON public.moderation_rejected_examples;
DROP POLICY IF EXISTS "moderation_examples_select" ON public.moderation_rejected_examples;
DROP POLICY IF EXISTS "moderation_examples_admin" ON public.moderation_rejected_examples;

CREATE POLICY "moderation_examples_select" ON public.moderation_rejected_examples
  FOR SELECT USING (public.is_admin());

CREATE POLICY "moderation_examples_admin" ON public.moderation_rejected_examples
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. BLINDAGEM CONTRA SPOOFING E PAYWALL NA COMUNIDADE (POSTS, COMENTÁRIOS, REAÇÕES)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_post_in_community(p_user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = p_user_id
    AND (
      p.role IN ('admin', 'curadoria', 'guia')
      OR p.community_subscription_status = 'active'
      OR (p.community_access_expires_at IS NOT NULL AND p.community_access_expires_at > now())
    )
    AND p.is_banned = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS "Allow public insert community_posts" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_insert_auth" ON public.community_posts;
CREATE POLICY "community_posts_insert_auth" ON public.community_posts
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (is_anonymous = true OR author_id = auth.uid())
    AND public.can_post_in_community(auth.uid())
  );

DROP POLICY IF EXISTS "Allow public insert community_comments" ON public.community_comments;
DROP POLICY IF EXISTS "community_comments_insert_auth" ON public.community_comments;
CREATE POLICY "community_comments_insert_auth" ON public.community_comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (is_anonymous = true OR author_id = auth.uid())
    AND public.can_post_in_community(auth.uid())
  );

DROP POLICY IF EXISTS "community_reactions_insert_own" ON public.community_reactions;
CREATE POLICY "community_reactions_insert_own" ON public.community_reactions
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

-- ------------------------------------------------------------------------------
-- 7. BLINDAGEM DE CHAMADOS SOS (sos_tickets)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_sos_ticket_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.admin_reply := OLD.admin_reply;
    NEW.status := OLD.status;
    NEW.replied_at := OLD.replied_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_sos_ticket_update ON public.sos_tickets;
CREATE TRIGGER trg_protect_sos_ticket_update
  BEFORE UPDATE ON public.sos_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_sos_ticket_update();

-- ------------------------------------------------------------------------------
-- 8. BLINDAGEM LGPD: journey_interests, destaques, emotional_checkins & storage
-- ------------------------------------------------------------------------------
ALTER TABLE public.journey_interests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select on journey_interests" ON public.journey_interests;
DROP POLICY IF EXISTS "interests_select_admin" ON public.journey_interests;
CREATE POLICY "interests_select_admin" 
  ON public.journey_interests FOR SELECT 
  USING (public.is_admin() OR (auth.uid() IS NOT NULL AND auth.uid() = user_id));

ALTER TABLE public.destaques ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "destaques_select_public" ON public.destaques;
DROP POLICY IF EXISTS "destaques_insert_admin" ON public.destaques;
DROP POLICY IF EXISTS "destaques_update_admin" ON public.destaques;
DROP POLICY IF EXISTS "destaques_delete_admin" ON public.destaques;

CREATE POLICY "destaques_select_public" ON public.destaques FOR SELECT USING (true);
CREATE POLICY "destaques_insert_admin" ON public.destaques FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "destaques_update_admin" ON public.destaques FOR UPDATE USING (public.is_admin());
CREATE POLICY "destaques_delete_admin" ON public.destaques FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "checkins_select_own" ON public.emotional_checkins;
DROP POLICY IF EXISTS "checkins_select_auth" ON public.emotional_checkins;
CREATE POLICY "checkins_select_own"
  ON public.emotional_checkins FOR SELECT
  USING (auth.uid() = profile_id OR public.is_admin());

DROP POLICY IF EXISTS "storage_update_auth" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_auth" ON storage.objects;

CREATE POLICY "storage_update_auth"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'user-media' 
    AND (
      owner = auth.uid() 
      OR (storage.foldername(name))[1] = auth.uid()::text 
      OR public.is_admin()
    )
  );

CREATE POLICY "storage_delete_auth"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-media' 
    AND (
      owner = auth.uid() 
      OR (storage.foldername(name))[1] = auth.uid()::text 
      OR public.is_admin()
    )
  );

-- Limite de 10MB e restrição de tipos MIME permitidos no bucket user-media
UPDATE storage.buckets
SET file_size_limit = 10485760, -- 10 MB em bytes
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
WHERE id = 'user-media';

-- ------------------------------------------------------------------------------
-- 9. ÍNDICES DE PERFORMANCE PARA A COMUNIDADE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_community_posts_status_created ON public.community_posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_status_created ON public.community_comments(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_reports_content_id ON public.community_reports(content_id);

-- ------------------------------------------------------------------------------
-- 10. SINCRONIZAÇÃO AUTOMÁTICA DE ATIVIDADES PARA VISITAS DIÁRIAS (DIAS CONOSCO)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_activity_to_daily_visits()
RETURNS TRIGGER AS $$
DECLARE
  v_profile_id uuid;
  v_date date;
BEGIN
  IF TG_TABLE_NAME IN ('community_posts', 'community_comments') THEN
    v_profile_id := NEW.author_id;
  ELSE
    v_profile_id := NEW.profile_id;
  END IF;

  IF v_profile_id IS NOT NULL THEN
    v_date := (COALESCE(
      CASE WHEN TG_TABLE_NAME = 'user_completed_lessons' THEN NEW.completed_at END,
      CASE WHEN TG_TABLE_NAME = 'user_lesson_notes' THEN NEW.updated_at END,
      CASE WHEN TG_TABLE_NAME = 'emotional_checkins' THEN NEW.created_at END,
      CASE WHEN TG_TABLE_NAME IN ('community_posts', 'community_comments') THEN NEW.created_at END,
      NOW()
    ) AT TIME ZONE 'America/Sao_Paulo')::date;

    INSERT INTO public.user_daily_visits (profile_id, visit_date)
    VALUES (v_profile_id, v_date)
    ON CONFLICT (profile_id, visit_date) DO NOTHING;
    
    UPDATE public.profiles
    SET streak_days = (
      SELECT count(*) FROM public.user_daily_visits WHERE profile_id = v_profile_id
    )
    WHERE id = v_profile_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para registrar presença diária e atualizar contador de dias conosco
DROP TRIGGER IF EXISTS trg_sync_checkin_to_daily_visits ON public.emotional_checkins;
CREATE TRIGGER trg_sync_checkin_to_daily_visits
  AFTER INSERT ON public.emotional_checkins
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_activity_to_daily_visits();

DROP TRIGGER IF EXISTS trg_sync_completed_lessons_to_daily_visits ON public.user_completed_lessons;
CREATE TRIGGER trg_sync_completed_lessons_to_daily_visits
  AFTER INSERT OR UPDATE ON public.user_completed_lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_activity_to_daily_visits();

DROP TRIGGER IF EXISTS trg_sync_lesson_notes_to_daily_visits ON public.user_lesson_notes;
CREATE TRIGGER trg_sync_lesson_notes_to_daily_visits
  AFTER INSERT OR UPDATE ON public.user_lesson_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_activity_to_daily_visits();

DROP TRIGGER IF EXISTS trg_sync_community_posts_to_daily_visits ON public.community_posts;
CREATE TRIGGER trg_sync_community_posts_to_daily_visits
  AFTER INSERT ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_activity_to_daily_visits();

DROP TRIGGER IF EXISTS trg_sync_community_comments_to_daily_visits ON public.community_comments;
CREATE TRIGGER trg_sync_community_comments_to_daily_visits
  AFTER INSERT ON public.community_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_activity_to_daily_visits();

