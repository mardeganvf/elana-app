-- =========================================================================
-- ELANA ACADEMY — SETUP DE PUSH NOTIFICATIONS
-- Execute este script no Supabase SQL Editor
-- =========================================================================

-- 1. TABELA DE ASSINATURAS PUSH (PUSH SUBSCRIPTIONS)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  endpoint    TEXT NOT NULL,
  p256dh      TEXT NOT NULL,
  auth_key    TEXT NOT NULL,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, endpoint)
);

-- Habilita RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DROP POLICY IF EXISTS "push_subscriptions_select_own" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_select_own"
  ON public.push_subscriptions FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "push_subscriptions_insert_own" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_insert_own"
  ON public.push_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "push_subscriptions_update_own" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_update_own"
  ON public.push_subscriptions FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "push_subscriptions_delete_own" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_delete_own"
  ON public.push_subscriptions FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_push_subs_profile_id ON public.push_subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint ON public.push_subscriptions(endpoint);

-- 2. FUNÇÃO E TRIGGER PARA DISPARAR PUSH AUTOMÁTICO QUANDO ADMIN RESPONDER TICKET SOS
-- Ativa a extensão pg_net caso ainda não esteja ativa
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.notify_sos_reply_push()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_supabase_url TEXT;
  v_service_key  TEXT;
BEGIN
  -- Dispara apenas quando admin_reply foi adicionado ou alterado e não está vazio
  IF (NEW.admin_reply IS NOT NULL AND NEW.admin_reply <> '' AND 
     (OLD.admin_reply IS NULL OR OLD.admin_reply <> NEW.admin_reply)) THEN
     
    -- Se o ticket tem um usuário associado
    IF NEW.profile_id IS NOT NULL THEN
      -- Chama a Edge Function via pg_net de forma assíncrona
      PERFORM extensions.http_post(
        url := 'https://mixedzmkjfzumeimfkfz.supabase.co/functions/v1/send-push-notification',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := jsonb_build_object(
          'profile_id', NEW.profile_id,
          'title', 'Elana — Resposta da sua equipe',
          'body', 'Sua mensagem de acolhimento recebeu uma resposta carinhosa. Toque para ver.',
          'url', '/sos'
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sos_reply_push ON public.sos_tickets;
CREATE TRIGGER trg_sos_reply_push
  AFTER UPDATE ON public.sos_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_sos_reply_push();
