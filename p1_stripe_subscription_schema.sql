-- ==============================================================================
-- 💳 P1 STRIPE & ASSINATURA DA COMUNIDADE (ELANA ACADEMY)
-- Adiciona colunas para Stripe Customer, status de assinatura e regra de 90 dias
-- ==============================================================================

-- 1. Colunas de Assinatura e Bônus na tabela profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS community_subscription_status text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS community_subscription_id text,
  ADD COLUMN IF NOT EXISTS community_access_expires_at timestamptz;

-- 2. Índices para consultas de alta performance
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
  ON public.profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_community_status 
  ON public.profiles(community_subscription_status);

CREATE INDEX IF NOT EXISTS idx_profiles_community_expires 
  ON public.profiles(community_access_expires_at);

-- 3. Função auxiliar para verificar se o usuário tem acesso à Comunidade
CREATE OR REPLACE FUNCTION public.user_has_community_access(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role text;
  v_status text;
  v_expires timestamptz;
BEGIN
  SELECT role, community_subscription_status, community_access_expires_at
  INTO v_role, v_status, v_expires
  FROM public.profiles
  WHERE id = check_user_id;

  -- Admin sempre tem acesso
  IF v_role = 'admin' OR v_role = 'Administrador' THEN
    RETURN true;
  END IF;

  -- Assinante ativo (R$ 9,90/mês)
  IF v_status = 'active' THEN
    RETURN true;
  END IF;

  -- Bônus de 90 dias da compra de jornada ou degustação ativa
  IF v_expires IS NOT NULL AND v_expires > now() THEN
    RETURN true;
  END IF;

  -- Cortesia para alunos que já possuem jornada adquirida
  IF EXISTS (SELECT 1 FROM public.user_purchased_journeys WHERE profile_id = check_user_id) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;
