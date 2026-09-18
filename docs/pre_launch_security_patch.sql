-- ==============================================================================
-- 🛡️ PATCH DE SEGURANÇA E PRÉ-LANÇAMENTO — ELANA ACADEMY
-- Data: 18 de Setembro de 2026
-- Execute este script no SQL Editor do Supabase Dashboard (Projeto mixedzmkjfzumeimfkfz)
-- ==============================================================================

-- 1. BLINDAGEM LGPD: journey_interests (Leads e interessados restritos)
ALTER TABLE public.journey_interests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select on journey_interests" ON public.journey_interests;
DROP POLICY IF EXISTS "interests_select_admin" ON public.journey_interests;

CREATE POLICY "interests_select_admin" 
  ON public.journey_interests FOR SELECT 
  USING (public.is_admin() OR (auth.uid() IS NOT NULL AND auth.uid() = user_id));

-- 2. BLINDAGEM: destaques (Stories da Home protegidos contra edição pública)
ALTER TABLE public.destaques ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on destaques" ON public.destaques;
DROP POLICY IF EXISTS "Allow public all on destaques" ON public.destaques;
DROP POLICY IF EXISTS "destaques_select_public" ON public.destaques;
DROP POLICY IF EXISTS "destaques_insert_admin" ON public.destaques;
DROP POLICY IF EXISTS "destaques_update_admin" ON public.destaques;
DROP POLICY IF EXISTS "destaques_delete_admin" ON public.destaques;

CREATE POLICY "destaques_select_public" ON public.destaques
  FOR SELECT USING (true);

CREATE POLICY "destaques_insert_admin" ON public.destaques
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "destaques_update_admin" ON public.destaques
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "destaques_delete_admin" ON public.destaques
  FOR DELETE USING (public.is_admin());

-- 3. BLINDAGEM LGPD: emotional_checkins (Diário e sentimentos protegidos)
DROP POLICY IF EXISTS "checkins_select_own" ON public.emotional_checkins;
DROP POLICY IF EXISTS "checkins_select_auth" ON public.emotional_checkins;

CREATE POLICY "checkins_select_own"
  ON public.emotional_checkins FOR SELECT
  USING (auth.uid() = profile_id OR public.is_admin());

-- 4. BLINDAGEM DE STORAGE: user-media (Apenas o proprietário ou admin pode alterar/deletar)
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

-- 5. BLINDAGEM CONTRA AUTO-DESBANIMENTO: gatilho protect_profile_role
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
      NEW.ban_reason := NULL;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
      NEW.role := OLD.role;
    END IF;
    IF (
      NEW.is_banned IS DISTINCT FROM OLD.is_banned 
      OR NEW.banned_at IS DISTINCT FROM OLD.banned_at 
      OR NEW.ban_reason IS DISTINCT FROM OLD.ban_reason
    ) AND NOT public.is_admin() THEN
      NEW.is_banned := OLD.is_banned;
      NEW.banned_at := OLD.banned_at;
      NEW.ban_reason := OLD.ban_reason;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ÍNDICES DE PERFORMANCE PARA A COMUNIDADE
CREATE INDEX IF NOT EXISTS idx_community_posts_status_created ON public.community_posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_status_created ON public.community_comments(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_reports_content_id ON public.community_reports(content_id);

-- 7. DIREITO AO ESQUECIMENTO / EXCLUSÃO DE CONTA (LGPD ART. 18 / APPLE GUIDELINE 5.1.1)
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- 1. Excluir dados da comunidade
  DELETE FROM public.community_reactions WHERE profile_id = current_user_id;
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
  DELETE FROM public.user_follows WHERE follower_id = current_user_id OR followed_id = current_user_id;
  DELETE FROM public.push_subscriptions WHERE profile_id = current_user_id;
  DELETE FROM public.journey_interests WHERE user_id = current_user_id;

  -- 4. Excluir perfil público
  DELETE FROM public.profiles WHERE id = current_user_id;

  -- 5. Excluir registro do auth.users
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

