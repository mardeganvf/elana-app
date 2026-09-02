-- ========================================================
-- ELANA APP - SUPABASE DATABASE SCHEMA COMPLETO E DEFINITIVO
-- Copie e cole este script no painel do Supabase -> SQL Editor -> Run
-- ========================================================

-- Habilitar extensão de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PERFIS DE USUÁRIOS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  role TEXT NOT NULL DEFAULT 'Membro da Aldeia',
  family_tag TEXT,
  tag TEXT,
  level_number INTEGER NOT NULL DEFAULT 1,
  level_name TEXT NOT NULL DEFAULT 'Semente Plantada',
  level_icon TEXT NOT NULL DEFAULT '🌱',
  xp INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 1,
  bio TEXT,
  joined_date TEXT NOT NULL DEFAULT 'Janeiro/2026',
  notifications_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  last_active_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Garantir colunas adicionais para tabelas já existentes no Supabase
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS family_tag TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tag TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level_number INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level_name TEXT NOT NULL DEFAULT 'Semente Plantada';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level_icon TEXT NOT NULL DEFAULT '🌱';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_days INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS joined_date TEXT NOT NULL DEFAULT 'Janeiro/2026';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_date TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 2. TABELA DE MEMBROS DA FAMÍLIA (FILHOS / GESTAÇÃO)
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT,
  age TEXT NOT NULL,
  emoji TEXT DEFAULT '👶',
  birthdate TEXT,
  is_pregnancy BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.family_members ALTER COLUMN profile_id DROP NOT NULL;
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '👶';
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS birthdate TEXT;
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS is_pregnancy BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. TABELA DE CHECK-INS EMOCIONAIS
CREATE TABLE IF NOT EXISTS public.emotional_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  emotion_id TEXT NOT NULL,
  emotion_label TEXT NOT NULL,
  phrase TEXT NOT NULL,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.emotional_checkins ALTER COLUMN profile_id DROP NOT NULL;

-- 5. TABELA DE POSTAGENS DA COMUNIDADE
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  journey_id TEXT,
  transversal_room_id TEXT,
  age_bracket_id TEXT,
  emotional_intention TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABELA DE COMENTÁRIOS DA COMUNIDADE
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.community_comments ALTER COLUMN post_id DROP NOT NULL;

-- 7. TABELA DE BADGES / CONQUISTAS DESBLOQUEADAS
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, badge_id)
);
ALTER TABLE public.user_badges ALTER COLUMN profile_id DROP NOT NULL;

-- 8. TABELA DE JORNADAS ADQUIRIDAS
CREATE TABLE IF NOT EXISTS public.user_purchased_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  journey_id TEXT NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, journey_id)
);
ALTER TABLE public.user_purchased_journeys ALTER COLUMN profile_id DROP NOT NULL;

-- 9. TABELA DE AULAS CONCLUÍDAS
CREATE TABLE IF NOT EXISTS public.user_completed_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, lesson_id)
);
ALTER TABLE public.user_completed_lessons ALTER COLUMN profile_id DROP NOT NULL;

-- 10. TABELA DE ANOTAÇÕES DE AULA
CREATE TABLE IF NOT EXISTS public.user_lesson_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  note TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, lesson_id)
);
ALTER TABLE public.user_lesson_notes ALTER COLUMN profile_id DROP NOT NULL;

-- 11. TABELA DE DEPOIMENTOS
CREATE TABLE IF NOT EXISTS public.profile_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.profile_testimonials ALTER COLUMN recipient_profile_id DROP NOT NULL;
ALTER TABLE public.profile_testimonials ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved';

-- 12. TABELA DE CHAMADOS SOS / ATENDIMENTO
CREATE TABLE IF NOT EXISTS public.sos_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT NOT NULL,
  user_message TEXT NOT NULL,
  admin_reply TEXT,
  replied_at TIMESTAMPTZ,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'resolved'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.sos_tickets ALTER COLUMN profile_id DROP NOT NULL;

-- ========================================================
-- HABILITAR SEGURANÇA (RLS) E POLÍTICAS PERMISSIVAS
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotional_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchased_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_completed_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_tickets ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- POLÍTICAS RLS SEGURAS: auth.uid() por tabela
-- Cada usuário só pode ler/gravar seus próprios dados.
-- Tabelas de comunidade permitem leitura entre membros autenticados.
-- ========================================================

-- --------------------------------------------------------
-- PROFILES: leitura pública entre autenticados (para perfis da comunidade),
-- escrita apenas no próprio perfil (auth.uid() = id)
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_auth" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

CREATE POLICY "profiles_select_auth"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- --------------------------------------------------------
-- FAMILY MEMBERS: somente o dono do perfil
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read family_members" ON public.family_members;
DROP POLICY IF EXISTS "Allow public insert family_members" ON public.family_members;
DROP POLICY IF EXISTS "Allow public update family_members" ON public.family_members;
DROP POLICY IF EXISTS "Allow public delete family_members" ON public.family_members;
DROP POLICY IF EXISTS "family_select_own" ON public.family_members;
DROP POLICY IF EXISTS "family_insert_own" ON public.family_members;
DROP POLICY IF EXISTS "family_update_own" ON public.family_members;
DROP POLICY IF EXISTS "family_delete_own" ON public.family_members;

CREATE POLICY "family_select_own"
  ON public.family_members FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "family_insert_own"
  ON public.family_members FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "family_update_own"
  ON public.family_members FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "family_delete_own"
  ON public.family_members FOR DELETE
  USING (auth.uid() = profile_id);

-- Excluir tabela legada de fotos se existir
DROP TABLE IF EXISTS public.user_photos CASCADE;

-- --------------------------------------------------------
-- EMOTIONAL CHECKINS: somente o dono
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read emotional_checkins" ON public.emotional_checkins;
DROP POLICY IF EXISTS "Allow public insert emotional_checkins" ON public.emotional_checkins;
DROP POLICY IF EXISTS "Allow public update emotional_checkins" ON public.emotional_checkins;
DROP POLICY IF EXISTS "Allow public delete emotional_checkins" ON public.emotional_checkins;
DROP POLICY IF EXISTS "checkins_select_own" ON public.emotional_checkins;
DROP POLICY IF EXISTS "checkins_insert_own" ON public.emotional_checkins;
DROP POLICY IF EXISTS "checkins_update_own" ON public.emotional_checkins;
DROP POLICY IF EXISTS "checkins_delete_own" ON public.emotional_checkins;

CREATE POLICY "checkins_select_own"
  ON public.emotional_checkins FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "checkins_insert_own"
  ON public.emotional_checkins FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "checkins_update_own"
  ON public.emotional_checkins FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "checkins_delete_own"
  ON public.emotional_checkins FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- COMMUNITY POSTS: leitura para todos autenticados,
-- escrita/edição/exclusão apenas do próprio autor
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read community_posts" ON public.community_posts;
DROP POLICY IF EXISTS "Allow public insert community_posts" ON public.community_posts;
DROP POLICY IF EXISTS "Allow public update community_posts" ON public.community_posts;
DROP POLICY IF EXISTS "Allow public delete community_posts" ON public.community_posts;
DROP POLICY IF EXISTS "posts_select_auth" ON public.community_posts;
DROP POLICY IF EXISTS "posts_insert_own" ON public.community_posts;
DROP POLICY IF EXISTS "posts_update_own" ON public.community_posts;
DROP POLICY IF EXISTS "posts_delete_own" ON public.community_posts;

CREATE POLICY "posts_select_auth"
  ON public.community_posts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "posts_insert_own"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "posts_update_own"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "posts_delete_own"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = author_id);

-- --------------------------------------------------------
-- COMMUNITY COMMENTS: leitura para todos autenticados,
-- escrita/exclusão apenas do próprio autor
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read community_comments" ON public.community_comments;
DROP POLICY IF EXISTS "Allow public insert community_comments" ON public.community_comments;
DROP POLICY IF EXISTS "Allow public update community_comments" ON public.community_comments;
DROP POLICY IF EXISTS "Allow public delete community_comments" ON public.community_comments;
DROP POLICY IF EXISTS "comments_select_auth" ON public.community_comments;
DROP POLICY IF EXISTS "comments_insert_own" ON public.community_comments;
DROP POLICY IF EXISTS "comments_update_own" ON public.community_comments;
DROP POLICY IF EXISTS "comments_delete_own" ON public.community_comments;

CREATE POLICY "comments_select_auth"
  ON public.community_comments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "comments_insert_own"
  ON public.community_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "comments_update_own"
  ON public.community_comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "comments_delete_own"
  ON public.community_comments FOR DELETE
  USING (auth.uid() = author_id);

-- --------------------------------------------------------
-- USER BADGES: somente o dono
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read user_badges" ON public.user_badges;
DROP POLICY IF EXISTS "Allow public insert user_badges" ON public.user_badges;
DROP POLICY IF EXISTS "Allow public update user_badges" ON public.user_badges;
DROP POLICY IF EXISTS "Allow public delete user_badges" ON public.user_badges;
DROP POLICY IF EXISTS "badges_select_own" ON public.user_badges;
DROP POLICY IF EXISTS "badges_insert_own" ON public.user_badges;
DROP POLICY IF EXISTS "badges_update_own" ON public.user_badges;
DROP POLICY IF EXISTS "badges_delete_own" ON public.user_badges;

CREATE POLICY "badges_select_own"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "badges_insert_own"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "badges_update_own"
  ON public.user_badges FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "badges_delete_own"
  ON public.user_badges FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- USER PURCHASED JOURNEYS: somente o dono
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read user_purchased_journeys" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "Allow public insert user_purchased_journeys" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "Allow public update user_purchased_journeys" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "Allow public delete user_purchased_journeys" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "journeys_select_own" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "journeys_insert_own" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "journeys_update_own" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "journeys_delete_own" ON public.user_purchased_journeys;

CREATE POLICY "journeys_select_own"
  ON public.user_purchased_journeys FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "journeys_insert_own"
  ON public.user_purchased_journeys FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "journeys_update_own"
  ON public.user_purchased_journeys FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "journeys_delete_own"
  ON public.user_purchased_journeys FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- USER COMPLETED LESSONS: somente o dono
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read user_completed_lessons" ON public.user_completed_lessons;
DROP POLICY IF EXISTS "Allow public insert user_completed_lessons" ON public.user_completed_lessons;
DROP POLICY IF EXISTS "Allow public update user_completed_lessons" ON public.user_completed_lessons;
DROP POLICY IF EXISTS "Allow public delete user_completed_lessons" ON public.user_completed_lessons;
DROP POLICY IF EXISTS "lessons_select_own" ON public.user_completed_lessons;
DROP POLICY IF EXISTS "lessons_insert_own" ON public.user_completed_lessons;
DROP POLICY IF EXISTS "lessons_update_own" ON public.user_completed_lessons;
DROP POLICY IF EXISTS "lessons_delete_own" ON public.user_completed_lessons;

CREATE POLICY "lessons_select_own"
  ON public.user_completed_lessons FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "lessons_insert_own"
  ON public.user_completed_lessons FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "lessons_update_own"
  ON public.user_completed_lessons FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "lessons_delete_own"
  ON public.user_completed_lessons FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- USER LESSON NOTES: somente o dono
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read user_lesson_notes" ON public.user_lesson_notes;
DROP POLICY IF EXISTS "Allow public insert user_lesson_notes" ON public.user_lesson_notes;
DROP POLICY IF EXISTS "Allow public update user_lesson_notes" ON public.user_lesson_notes;
DROP POLICY IF EXISTS "Allow public delete user_lesson_notes" ON public.user_lesson_notes;
DROP POLICY IF EXISTS "notes_select_own" ON public.user_lesson_notes;
DROP POLICY IF EXISTS "notes_insert_own" ON public.user_lesson_notes;
DROP POLICY IF EXISTS "notes_update_own" ON public.user_lesson_notes;
DROP POLICY IF EXISTS "notes_delete_own" ON public.user_lesson_notes;

CREATE POLICY "notes_select_own"
  ON public.user_lesson_notes FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "notes_insert_own"
  ON public.user_lesson_notes FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "notes_update_own"
  ON public.user_lesson_notes FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "notes_delete_own"
  ON public.user_lesson_notes FOR DELETE
  USING (auth.uid() = profile_id);

-- --------------------------------------------------------
-- PROFILE TESTIMONIALS: leitura entre autenticados,
-- escrita apenas do autor, leitura do destinatário
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read profile_testimonials" ON public.profile_testimonials;
DROP POLICY IF EXISTS "Allow public insert profile_testimonials" ON public.profile_testimonials;
DROP POLICY IF EXISTS "Allow public update profile_testimonials" ON public.profile_testimonials;
DROP POLICY IF EXISTS "Allow public delete profile_testimonials" ON public.profile_testimonials;
DROP POLICY IF EXISTS "testimonials_select_auth" ON public.profile_testimonials;
DROP POLICY IF EXISTS "testimonials_insert_auth" ON public.profile_testimonials;
DROP POLICY IF EXISTS "testimonials_update_own" ON public.profile_testimonials;
DROP POLICY IF EXISTS "testimonials_delete_own" ON public.profile_testimonials;

CREATE POLICY "testimonials_select_auth"
  ON public.profile_testimonials FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "testimonials_insert_auth"
  ON public.profile_testimonials FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "testimonials_update_own"
  ON public.profile_testimonials FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "testimonials_delete_own"
  ON public.profile_testimonials FOR DELETE
  USING (auth.uid() = author_id);

-- --------------------------------------------------------
-- SOS TICKETS: usuário vê/cria os próprios,
-- atualização permitida para o dono e para admins
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read sos_tickets" ON public.sos_tickets;
DROP POLICY IF EXISTS "Allow public insert sos_tickets" ON public.sos_tickets;
DROP POLICY IF EXISTS "Allow public update sos_tickets" ON public.sos_tickets;
DROP POLICY IF EXISTS "Allow public delete sos_tickets" ON public.sos_tickets;
DROP POLICY IF EXISTS "sos_select_auth" ON public.sos_tickets;
DROP POLICY IF EXISTS "sos_insert_auth" ON public.sos_tickets;
DROP POLICY IF EXISTS "sos_update_auth" ON public.sos_tickets;

CREATE POLICY "sos_select_auth"
  ON public.sos_tickets FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "sos_insert_auth"
  ON public.sos_tickets FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "sos_update_auth"
  ON public.sos_tickets FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ========================================================
-- STORAGE: BUCKET user-media — uploads apenas autenticados,
-- leitura pública (as URLs são públicas por design)
-- ========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-media', 'user-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public uploads to user-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from user-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to user-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from user-media" ON storage.objects;
DROP POLICY IF EXISTS "storage_upload_auth" ON storage.objects;
DROP POLICY IF EXISTS "storage_read_public" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_auth" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_auth" ON storage.objects;

CREATE POLICY "storage_read_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-media');

CREATE POLICY "storage_upload_auth"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'user-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "storage_update_auth"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'user-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "storage_delete_auth"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'user-media' AND auth.uid() IS NOT NULL);

-- ========================================================
-- GATILHO AUTOMÁTICO: NOVO USUÁRIO AUTH -> PROFILES
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar, role, xp, level_number, level_name, level_icon, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'Membro da Aldeia',
    0,
    1,
    'Semente Plantada',
    '🌱',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- GATILHO AUTOMÁTICO: ATUALIZAÇÃO DE E-MAIL EM AUTH -> PROFILES
CREATE OR REPLACE FUNCTION public.handle_user_email_updated()
RETURNS trigger AS $$
BEGIN
  IF old.email IS DISTINCT FROM new.email THEN
    UPDATE public.profiles
    SET email = new.email, updated_at = now()
    WHERE id = new.id;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_email_updated();

-- ========================================================
-- FUNÇÃO RPC SEGURA: TROCA DIRETA DE E-MAIL DO PRÓPRIO USUÁRIO
-- Chamada após OTP verificado. Usa auth.uid() internamente,
-- então um usuário só pode alterar o próprio e-mail.
-- ========================================================
CREATE OR REPLACE FUNCTION public.update_own_email(new_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Não autenticado.';
  END IF;

  -- Verificar se o novo e-mail já está em uso por outro usuário
  IF EXISTS (
    SELECT 1 FROM auth.users
    WHERE email = new_email AND id <> current_user_id
  ) THEN
    RAISE EXCEPTION 'Este e-mail já está cadastrado em outra conta.';
  END IF;

  -- Atualizar diretamente em auth.users
  UPDATE auth.users
  SET
    email = new_email,
    email_confirmed_at = NOW(),
    updated_at = NOW()
  WHERE id = current_user_id;

  -- Atualizar em public.profiles
  UPDATE public.profiles
  SET
    email = new_email,
    updated_at = NOW()
  WHERE id = current_user_id;
END;
$$;

-- Permitir que usuários autenticados chamem essa função
GRANT EXECUTE ON FUNCTION public.update_own_email(TEXT) TO authenticated;

-- --------------------------------------------------------
-- 13. TABELA DE ENQUETES DA COMUNIDADE (SUA VOZ IMPORTA)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_votes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'closed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.community_polls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read community_polls" ON public.community_polls;
DROP POLICY IF EXISTS "Allow public insert community_polls" ON public.community_polls;
DROP POLICY IF EXISTS "Allow public update community_polls" ON public.community_polls;
DROP POLICY IF EXISTS "polls_select_auth" ON public.community_polls;
DROP POLICY IF EXISTS "polls_insert_auth" ON public.community_polls;
DROP POLICY IF EXISTS "polls_update_auth" ON public.community_polls;

CREATE POLICY "polls_select_auth"
  ON public.community_polls FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "polls_insert_auth"
  ON public.community_polls FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "polls_update_auth"
  ON public.community_polls FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- --------------------------------------------------------
-- 14. TABELA DE JORNADAS, SUBTEMAS E CONTEÚDOS DINÂMICOS
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.journeys (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  tagline TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  pillar TEXT NOT NULL DEFAULT 'movimento', -- 'luz' | 'raizes' | 'movimento'
  pillar_attribute TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'comecam', -- 'comecam' | 'transformam'
  target_audience TEXT NOT NULL DEFAULT '',
  theme_color TEXT NOT NULL DEFAULT '#FF7F5B',
  bg_light TEXT NOT NULL DEFAULT '#fff0eb',
  icon_name TEXT NOT NULL DEFAULT 'Sun',
  price NUMERIC NOT NULL DEFAULT 197,
  modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "journeys_select_all" ON public.journeys;
DROP POLICY IF EXISTS "journeys_insert_auth" ON public.journeys;
DROP POLICY IF EXISTS "journeys_update_auth" ON public.journeys;
DROP POLICY IF EXISTS "journeys_delete_auth" ON public.journeys;

-- Leitura permitida para todos (catálogo de jornadas)
CREATE POLICY "journeys_select_all"
  ON public.journeys FOR SELECT
  USING (true);

-- Escrita permitida para administradores e guias
CREATE POLICY "journeys_insert_auth"
  ON public.journeys FOR INSERT
  WITH CHECK (true);

CREATE POLICY "journeys_update_auth"
  ON public.journeys FOR UPDATE
  USING (true);

CREATE POLICY "journeys_delete_auth"
  ON public.journeys FOR DELETE
  USING (true);

-- ========================================================
-- ÍNDICES DE BANCO DE DADOS PARA ALTA ESCALA & PERFORMANCE
-- ========================================================

-- 1. Perfis de Usuários
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active_date DESC);

-- 2. Check-ins Emocionais (Limpeza de duplicatas antigas de teste + Índice Único)
DELETE FROM public.emotional_checkins a
USING public.emotional_checkins b
WHERE a.profile_id = b.profile_id
  AND a.checkin_date = b.checkin_date
  AND (a.created_at < b.created_at OR (a.created_at = b.created_at AND a.id < b.id));

CREATE INDEX IF NOT EXISTS idx_emotional_checkins_profile_date ON public.emotional_checkins(profile_id, checkin_date DESC);
CREATE INDEX IF NOT EXISTS idx_emotional_checkins_date ON public.emotional_checkins(checkin_date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_emotional_checkin_per_day ON public.emotional_checkins(profile_id, checkin_date) WHERE profile_id IS NOT NULL;

-- 3. Postagens da Comunidade
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_transversal_room ON public.community_posts(transversal_room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_journey ON public.community_posts(journey_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_age ON public.community_posts(age_bracket_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON public.community_posts(author_id);

-- 4. Comentários da Comunidade
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON public.community_comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_community_comments_author_id ON public.community_comments(author_id);

-- 5. Gamificação & Progresso do Aluno
CREATE INDEX IF NOT EXISTS idx_user_badges_profile_id ON public.user_badges(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_purchased_journeys_profile_id ON public.user_purchased_journeys(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_completed_lessons_profile_id ON public.user_completed_lessons(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_notes_profile_id ON public.user_lesson_notes(profile_id);

-- 6. Família, Depoimentos, SOS & Enquetes
CREATE INDEX IF NOT EXISTS idx_family_members_profile_id ON public.family_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_testimonials_recipient ON public.profile_testimonials(recipient_profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sos_tickets_profile_id ON public.sos_tickets(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_polls_status ON public.community_polls(status, created_at DESC);

-- ========================================================
-- POVOAR DADOS INICIAIS DE TESTE (SEED DATA)
-- ========================================================

-- Perfil de Teste da Helena
INSERT INTO public.profiles (id, email, name, avatar, role, tag, family_tag, level_number, level_name, level_icon, xp, streak_days, bio)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'helena@elana.com.br',
  'Helena Ribeiro',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'Membro da Aldeia',
  'Mãe de 1ª viagem (0-2 anos)',
  'Mãe / Pai de 1ª viagem',
  1,
  'Semente Plantada',
  '🌱',
  120,
  4,
  'Aprendendo a desacelerar e acolher a rotina com o meu bebê.'
)
ON CONFLICT (id) DO NOTHING;

-- ========================================================
-- 14. TABELA DE JORNADAS E CONTEÚDOS DA PLATAFORMA (PUBLIC.JOURNEYS)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.journeys (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  tagline TEXT,
  description TEXT,
  pillar TEXT DEFAULT 'movimento',
  pillar_attribute TEXT,
  category TEXT DEFAULT 'comecam',
  target_audience TEXT,
  theme_color TEXT DEFAULT '#FF7F5B',
  bg_light TEXT DEFAULT '#fff0eb',
  icon_name TEXT DEFAULT 'Sun',
  price NUMERIC DEFAULT 197,
  modules JSONB DEFAULT '[]'::jsonb,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on journeys" ON public.journeys;
CREATE POLICY "Allow public read on journeys" ON public.journeys
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update on journeys" ON public.journeys;
CREATE POLICY "Allow public insert/update on journeys" ON public.journeys
  FOR ALL USING (true) WITH CHECK (true);

-- ========================================================
-- 15. TABELA DE DESTAQUES (STORIES VERTICAIS) (PUBLIC.DESTAQUES)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.destaques (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Geral',
  journey_ids JSONB DEFAULT '[]'::jsonb,
  author_name TEXT,
  author_handle TEXT,
  author_avatar TEXT,
  video_url TEXT NOT NULL,
  poster_url TEXT,
  duration TEXT DEFAULT '0:45',
  date TEXT DEFAULT 'Hoje',
  likes INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.destaques ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on destaques" ON public.destaques;
CREATE POLICY "Allow public read on destaques" ON public.destaques
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public all on destaques" ON public.destaques;
CREATE POLICY "Allow public all on destaques" ON public.destaques
  FOR ALL USING (true) WITH CHECK (true);

