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
ALTER TABLE public.user_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotional_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchased_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_completed_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_tickets ENABLE ROW LEVEL SECURITY;

-- Políticas para Profiles
DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public delete profiles" ON public.profiles;
CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow public delete profiles" ON public.profiles FOR DELETE USING (true);

-- Políticas para Family Members
DROP POLICY IF EXISTS "Allow public read family_members" ON public.family_members;
DROP POLICY IF EXISTS "Allow public insert family_members" ON public.family_members;
DROP POLICY IF EXISTS "Allow public update family_members" ON public.family_members;
DROP POLICY IF EXISTS "Allow public delete family_members" ON public.family_members;
CREATE POLICY "Allow public read family_members" ON public.family_members FOR SELECT USING (true);
CREATE POLICY "Allow public insert family_members" ON public.family_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update family_members" ON public.family_members FOR UPDATE USING (true);
CREATE POLICY "Allow public delete family_members" ON public.family_members FOR DELETE USING (true);

-- Excluir tabela legada de fotos se existir
DROP TABLE IF EXISTS public.user_photos CASCADE;

-- Políticas para Emotional Checkins
DROP POLICY IF EXISTS "Allow public read emotional_checkins" ON public.emotional_checkins;
DROP POLICY IF EXISTS "Allow public insert emotional_checkins" ON public.emotional_checkins;
DROP POLICY IF EXISTS "Allow public update emotional_checkins" ON public.emotional_checkins;
CREATE POLICY "Allow public read emotional_checkins" ON public.emotional_checkins FOR SELECT USING (true);
CREATE POLICY "Allow public insert emotional_checkins" ON public.emotional_checkins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update emotional_checkins" ON public.emotional_checkins FOR UPDATE USING (true);

-- Políticas para Community Posts
DROP POLICY IF EXISTS "Allow public read community_posts" ON public.community_posts;
DROP POLICY IF EXISTS "Allow public insert community_posts" ON public.community_posts;
DROP POLICY IF EXISTS "Allow public update community_posts" ON public.community_posts;
DROP POLICY IF EXISTS "Allow public delete community_posts" ON public.community_posts;
CREATE POLICY "Allow public read community_posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Allow public insert community_posts" ON public.community_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update community_posts" ON public.community_posts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete community_posts" ON public.community_posts FOR DELETE USING (true);

-- Políticas para Community Comments
DROP POLICY IF EXISTS "Allow public read community_comments" ON public.community_comments;
DROP POLICY IF EXISTS "Allow public insert community_comments" ON public.community_comments;
DROP POLICY IF EXISTS "Allow public update community_comments" ON public.community_comments;
DROP POLICY IF EXISTS "Allow public delete community_comments" ON public.community_comments;
CREATE POLICY "Allow public read community_comments" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert community_comments" ON public.community_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update community_comments" ON public.community_comments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete community_comments" ON public.community_comments FOR DELETE USING (true);

-- Políticas para User Badges
DROP POLICY IF EXISTS "Allow public read user_badges" ON public.user_badges;
DROP POLICY IF EXISTS "Allow public insert user_badges" ON public.user_badges;
DROP POLICY IF EXISTS "Allow public update user_badges" ON public.user_badges;
DROP POLICY IF EXISTS "Allow public delete user_badges" ON public.user_badges;
CREATE POLICY "Allow public read user_badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Allow public insert user_badges" ON public.user_badges FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update user_badges" ON public.user_badges FOR UPDATE USING (true);
CREATE POLICY "Allow public delete user_badges" ON public.user_badges FOR DELETE USING (true);

-- Políticas para User Purchased Journeys
DROP POLICY IF EXISTS "Allow public read user_purchased_journeys" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "Allow public insert user_purchased_journeys" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "Allow public update user_purchased_journeys" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "Allow public delete user_purchased_journeys" ON public.user_purchased_journeys;
CREATE POLICY "Allow public read user_purchased_journeys" ON public.user_purchased_journeys FOR SELECT USING (true);
CREATE POLICY "Allow public insert user_purchased_journeys" ON public.user_purchased_journeys FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update user_purchased_journeys" ON public.user_purchased_journeys FOR UPDATE USING (true);
CREATE POLICY "Allow public delete user_purchased_journeys" ON public.user_purchased_journeys FOR DELETE USING (true);

-- Políticas para User Completed Lessons
DROP POLICY IF EXISTS "Allow public read user_completed_lessons" ON public.user_completed_lessons;
DROP POLICY IF EXISTS "Allow public insert user_completed_lessons" ON public.user_completed_lessons;
DROP POLICY IF EXISTS "Allow public update user_completed_lessons" ON public.user_completed_lessons;
DROP POLICY IF EXISTS "Allow public delete user_completed_lessons" ON public.user_completed_lessons;
CREATE POLICY "Allow public read user_completed_lessons" ON public.user_completed_lessons FOR SELECT USING (true);
CREATE POLICY "Allow public insert user_completed_lessons" ON public.user_completed_lessons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update user_completed_lessons" ON public.user_completed_lessons FOR UPDATE USING (true);
CREATE POLICY "Allow public delete user_completed_lessons" ON public.user_completed_lessons FOR DELETE USING (true);

-- Políticas para User Lesson Notes
DROP POLICY IF EXISTS "Allow public read user_lesson_notes" ON public.user_lesson_notes;
DROP POLICY IF EXISTS "Allow public insert user_lesson_notes" ON public.user_lesson_notes;
DROP POLICY IF EXISTS "Allow public update user_lesson_notes" ON public.user_lesson_notes;
DROP POLICY IF EXISTS "Allow public delete user_lesson_notes" ON public.user_lesson_notes;
CREATE POLICY "Allow public read user_lesson_notes" ON public.user_lesson_notes FOR SELECT USING (true);
CREATE POLICY "Allow public insert user_lesson_notes" ON public.user_lesson_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update user_lesson_notes" ON public.user_lesson_notes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete user_lesson_notes" ON public.user_lesson_notes FOR DELETE USING (true);

-- Políticas para Profile Testimonials
DROP POLICY IF EXISTS "Allow public read profile_testimonials" ON public.profile_testimonials;
DROP POLICY IF EXISTS "Allow public insert profile_testimonials" ON public.profile_testimonials;
DROP POLICY IF EXISTS "Allow public update profile_testimonials" ON public.profile_testimonials;
DROP POLICY IF EXISTS "Allow public delete profile_testimonials" ON public.profile_testimonials;
CREATE POLICY "Allow public read profile_testimonials" ON public.profile_testimonials FOR SELECT USING (true);
CREATE POLICY "Allow public insert profile_testimonials" ON public.profile_testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update profile_testimonials" ON public.profile_testimonials FOR UPDATE USING (true);
CREATE POLICY "Allow public delete profile_testimonials" ON public.profile_testimonials FOR DELETE USING (true);

-- Políticas para SOS Tickets
DROP POLICY IF EXISTS "Allow public read sos_tickets" ON public.sos_tickets;
DROP POLICY IF EXISTS "Allow public insert sos_tickets" ON public.sos_tickets;
DROP POLICY IF EXISTS "Allow public update sos_tickets" ON public.sos_tickets;
DROP POLICY IF EXISTS "Allow public delete sos_tickets" ON public.sos_tickets;
CREATE POLICY "Allow public read sos_tickets" ON public.sos_tickets FOR SELECT USING (true);
CREATE POLICY "Allow public insert sos_tickets" ON public.sos_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update sos_tickets" ON public.sos_tickets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete sos_tickets" ON public.sos_tickets FOR DELETE USING (true);

-- ========================================================
-- STORAGE: CONFIGURAÇÃO DE BUCKET PÚBLICO PARA MÍDIAS
-- ========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-media', 'user-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public uploads to user-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from user-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to user-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from user-media" ON storage.objects;

CREATE POLICY "Allow public uploads to user-media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'user-media');
CREATE POLICY "Allow public reads from user-media" ON storage.objects FOR SELECT USING (bucket_id = 'user-media');
CREATE POLICY "Allow public updates to user-media" ON storage.objects FOR UPDATE USING (bucket_id = 'user-media');
CREATE POLICY "Allow public deletes from user-media" ON storage.objects FOR DELETE USING (bucket_id = 'user-media');

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
