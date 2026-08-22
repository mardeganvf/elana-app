-- ========================================================
-- ELANA APP - SUPABASE DATABASE SCHEMA (COM DADOS DE TESTE INICIAIS)
-- Copie e cole este script no painel do Supabase -> SQL Editor
-- ========================================================

-- Habilitar extensão de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PERFIS DE USUÁRIOS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  role TEXT NOT NULL DEFAULT 'membro',
  tag TEXT,
  level_number INTEGER NOT NULL DEFAULT 1,
  level_name TEXT NOT NULL DEFAULT 'Semente Plantada',
  level_icon TEXT NOT NULL DEFAULT '🌱',
  xp INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 1,
  bio TEXT,
  joined_date TEXT NOT NULL DEFAULT 'Janeiro/2026',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABELA DE MEMBROS DA FAMÍLIA
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT,
  age TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.family_members ALTER COLUMN profile_id DROP NOT NULL;

-- 3. TABELA DE FOTOS DO ÁLBUM DA FAMÍLIA
CREATE TABLE IF NOT EXISTS public.user_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.user_photos ALTER COLUMN profile_id DROP NOT NULL;

-- 4. TABELA DE CHECK-INS EMOCIONAIS
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
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.user_badges ALTER COLUMN profile_id DROP NOT NULL;

-- 8. TABELA DE JORNADAS ADQUIRIDAS
CREATE TABLE IF NOT EXISTS public.user_purchased_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  journey_id TEXT NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.user_purchased_journeys ALTER COLUMN profile_id DROP NOT NULL;

-- 9. TABELA DE DEPOIMENTOS
CREATE TABLE IF NOT EXISTS public.profile_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.profile_testimonials ALTER COLUMN recipient_profile_id DROP NOT NULL;

-- HABILITAR SEGURANÇA (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotional_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchased_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_testimonials ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE PERMISSÃO REEXECUTÁVEIS
DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update profiles" ON public.profiles;
CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update profiles" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public read family_members" ON public.family_members;
DROP POLICY IF EXISTS "Allow public insert family_members" ON public.family_members;
CREATE POLICY "Allow public read family_members" ON public.family_members FOR SELECT USING (true);
CREATE POLICY "Allow public insert family_members" ON public.family_members FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read user_photos" ON public.user_photos;
DROP POLICY IF EXISTS "Allow public insert user_photos" ON public.user_photos;
CREATE POLICY "Allow public read user_photos" ON public.user_photos FOR SELECT USING (true);
CREATE POLICY "Allow public insert user_photos" ON public.user_photos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read emotional_checkins" ON public.emotional_checkins;
DROP POLICY IF EXISTS "Allow public insert emotional_checkins" ON public.emotional_checkins;
CREATE POLICY "Allow public read emotional_checkins" ON public.emotional_checkins FOR SELECT USING (true);
CREATE POLICY "Allow public insert emotional_checkins" ON public.emotional_checkins FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read community_posts" ON public.community_posts;
DROP POLICY IF EXISTS "Allow public insert community_posts" ON public.community_posts;
DROP POLICY IF EXISTS "Allow public update community_posts" ON public.community_posts;
CREATE POLICY "Allow public read community_posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Allow public insert community_posts" ON public.community_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update community_posts" ON public.community_posts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public read community_comments" ON public.community_comments;
DROP POLICY IF EXISTS "Allow public insert community_comments" ON public.community_comments;
CREATE POLICY "Allow public read community_comments" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert community_comments" ON public.community_comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read user_badges" ON public.user_badges;
DROP POLICY IF EXISTS "Allow public insert user_badges" ON public.user_badges;
CREATE POLICY "Allow public read user_badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Allow public insert user_badges" ON public.user_badges FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read user_purchased_journeys" ON public.user_purchased_journeys;
DROP POLICY IF EXISTS "Allow public insert user_purchased_journeys" ON public.user_purchased_journeys;
CREATE POLICY "Allow public read user_purchased_journeys" ON public.user_purchased_journeys FOR SELECT USING (true);
CREATE POLICY "Allow public insert user_purchased_journeys" ON public.user_purchased_journeys FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read profile_testimonials" ON public.profile_testimonials;
DROP POLICY IF EXISTS "Allow public insert profile_testimonials" ON public.profile_testimonials;
CREATE POLICY "Allow public read profile_testimonials" ON public.profile_testimonials FOR SELECT USING (true);
CREATE POLICY "Allow public insert profile_testimonials" ON public.profile_testimonials FOR INSERT WITH CHECK (true);

-- ========================================================
-- POVOAR DADOS INICIAIS DE TESTE (SEED DATA)
-- ========================================================

-- Perfil de Teste
INSERT INTO public.profiles (id, name, avatar, role, tag, level_number, level_name, level_icon, xp, streak_days, bio)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Helena Ribeiro',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'Mãe de 1ª viagem',
  'Mãe de 1ª viagem (0-2 anos)',
  1,
  'Aprendiz Acolhedor',
  '🌱',
  120,
  4,
  'Aprendendo a desacelerar e acolher a rotina com o meu bebê.'
)
ON CONFLICT (id) DO NOTHING;

-- Post da Comunidade de Teste
INSERT INTO public.community_posts (id, author_id, author_name, author_avatar, title, content, transversal_room_id, is_anonymous, likes_count, comments_count)
VALUES (
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Helena Ribeiro',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'Primeiros meses: Como encontrar tempo para o autocuidado?',
  'Meninas, ultimamente tem sido desafiador conciliar a rotina da casa com o bebê. Como vocês conseguem pequenas pausas ao longo do dia?',
  'cantinho-mel',
  false,
  12,
  4
)
ON CONFLICT (id) DO NOTHING;

-- Check-in Emocional de Teste
INSERT INTO public.emotional_checkins (id, profile_id, emotion_id, emotion_label, phrase, checkin_date)
VALUES (
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'esperanca',
  'Com Esperança',
  'Um dia de esperança rende mais do que parece.',
  CURRENT_DATE
)
ON CONFLICT (id) DO NOTHING;
