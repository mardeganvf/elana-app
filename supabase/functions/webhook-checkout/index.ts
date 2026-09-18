import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-token, x-kiwify-token, stripe-signature',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const webhookSecret = Deno.env.get('WEBHOOK_SECRET') || Deno.env.get('STRIPE_WEBHOOK_SECRET') || 'whsec_qaDlbh91DLVQfJYf5wvprW3ZwALnhkeQ';

const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Mapeamento padrão de produtos (ID ou slug da plataforma para o journey_id do Elana App)
const PRODUCT_JOURNEY_MAP: Record<string, string> = {
  'pais-recem-nascidos': 'pais-recem-nascidos',
  'construindo-pontes': 'construindo-pontes',
  'singular': 'singular',
  'amor-escolhido': 'amor-escolhido',
  'novos-caminhos': 'novos-caminhos',
  'depois-do-silencio': 'depois-do-silencio'
};

Deno.serve(async (req) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (!supabaseAdmin) {
    return new Response(JSON.stringify({ error: 'SUPABASE_ADMIN_UNAVAILABLE' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(req.url);
    const queryToken = url.searchParams.get('token') || url.searchParams.get('secret');
    const queryJourneyId = url.searchParams.get('journey_id') || url.searchParams.get('journey');

    const rawBody = await req.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      const params = new URLSearchParams(rawBody);
      body = Object.fromEntries(params.entries());
    }

    // ── 1. Validação de Segurança do Webhook ──
    const stripeSignature = req.headers.get('stripe-signature');
    const headerToken = req.headers.get('x-webhook-token') 
      || req.headers.get('x-kiwify-token') 
      || req.headers.get('hottok');
    const bodyToken = body.token || body.signature || body.hottok;
    const isStripe = Boolean(stripeSignature || body.object === 'event' || body.type?.startsWith('checkout.') || body.type?.startsWith('customer.') || body.type?.startsWith('invoice.'));

    if (!isStripe) {
      const providedToken = queryToken || headerToken || bodyToken;
      if (webhookSecret && (!providedToken || providedToken !== webhookSecret)) {
        console.warn('⚠️ Webhook rejeitado: Token inválido ou ausente.');
        return new Response(JSON.stringify({ error: 'UNAUTHORIZED_WEBHOOK_TOKEN' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // ── 2. Identificação da Plataforma e Extração dos Dados ──
    let platform = 'generic';
    let externalId = '';
    let status = 'approved';
    let buyerEmail = '';
    let buyerName = '';
    let buyerPhone = '';
    let productId = '';
    let amount: number | null = null;
    let mappedJourneyId = queryJourneyId || '';
    let isCommunitySubscription = false;
    let stripeCustomerId = '';
    let stripeSubscriptionId = '';

    // 🔹 DETECÇÃO STRIPE
    if (isStripe) {
      platform = 'stripe';
      const eventType = String(body.type || '');
      const dataObj = body.data?.object || {};
      externalId = String(dataObj.id || body.id || '');

      console.log(`⚡ [STRIPE EVENT] ${eventType} (ID: ${externalId})`);

      if (eventType === 'checkout.session.completed') {
        status = 'approved';
        buyerEmail = dataObj.customer_details?.email || dataObj.customer_email || '';
        buyerName = dataObj.customer_details?.name || '';
        buyerPhone = dataObj.customer_details?.phone || '';
        amount = dataObj.amount_total ? Number(dataObj.amount_total) / 100 : null;
        stripeCustomerId = String(dataObj.customer || '');
        stripeSubscriptionId = String(dataObj.subscription || '');

        const metaType = dataObj.metadata?.type || '';
        const metaJourney = dataObj.metadata?.journey_id || '';

        if (metaType === 'community_subscription' || dataObj.mode === 'subscription') {
          isCommunitySubscription = true;
          productId = 'comunidade-elana';
        } else {
          mappedJourneyId = metaJourney || queryJourneyId || 'pais-recem-nascidos';
          productId = mappedJourneyId;
        }

      } else if (eventType === 'invoice.payment_succeeded') {
        // Renovação mensal da comunidade
        status = 'approved';
        buyerEmail = dataObj.customer_email || '';
        amount = dataObj.amount_paid ? Number(dataObj.amount_paid) / 100 : null;
        stripeCustomerId = String(dataObj.customer || '');
        stripeSubscriptionId = String(dataObj.subscription || '');
        isCommunitySubscription = true;
        productId = 'comunidade-elana';

      } else if (eventType === 'customer.subscription.deleted') {
        // Cancelamento da assinatura da comunidade
        status = 'canceled';
        stripeCustomerId = String(dataObj.customer || '');
        stripeSubscriptionId = String(dataObj.id || '');
        isCommunitySubscription = true;
        productId = 'comunidade-elana';

        // Busca o email pelo stripe_customer_id
        if (stripeCustomerId) {
          const { data: customerProfile } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .eq('stripe_customer_id', stripeCustomerId)
            .maybeSingle();
          if (customerProfile?.email) {
            buyerEmail = customerProfile.email;
          }
        }

      } else {
        // Evento informativo não-bloqueante
        return new Response(JSON.stringify({ received: true, event: eventType }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    // 🔹 DETECÇÃO KIWIFY
    else if (body.order_id || body.order_status) {
      platform = 'kiwify';
      externalId = String(body.order_id || body.order_ref || '');
      const rawStatus = (body.order_status || '').toLowerCase().trim();
      
      if (rawStatus === 'paid' || rawStatus === 'approved') {
        status = 'approved';
      } else if (rawStatus === 'refunded') {
        status = 'refunded';
      } else if (rawStatus === 'chargedback') {
        status = 'chargedback';
      } else if (rawStatus === 'canceled' || rawStatus === 'cancelled') {
        status = 'canceled';
      } else {
        status = 'pending';
      }

      buyerEmail = body.Customer?.email || body.customer?.email || '';
      buyerName = body.Customer?.full_name || body.Customer?.first_name || body.customer?.full_name || '';
      buyerPhone = body.Customer?.mobile || body.customer?.mobile || '';
      productId = String(body.Product?.product_id || body.product_id || '');
      amount = body.order_amount ? Number(body.order_amount) / 100 : null;
      
      if (!mappedJourneyId) {
        mappedJourneyId = body.custom_fields?.journey_id || PRODUCT_JOURNEY_MAP[productId] || productId || 'pais-recem-nascidos';
      }
    }
    // 🔹 DETECÇÃO HOTMART
    else if (body.event || body.data?.purchase || body.hottok) {
      platform = 'hotmart';
      externalId = String(body.data?.purchase?.transaction || body.transaction || '');
      const rawEvent = (body.event || '').toUpperCase().trim();

      if (rawEvent.includes('APPROVED') || rawEvent.includes('COMPLETE')) {
        status = 'approved';
      } else if (rawEvent.includes('REFUNDED')) {
        status = 'refunded';
      } else if (rawEvent.includes('CHARGEBACK')) {
        status = 'chargedback';
      } else if (rawEvent.includes('CANCELED')) {
        status = 'canceled';
      } else {
        status = 'pending';
      }

      buyerEmail = body.data?.buyer?.email || body.buyer?.email || '';
      buyerName = body.data?.buyer?.name || body.buyer?.name || '';
      buyerPhone = body.data?.buyer?.checkout_phone || body.buyer?.phone || '';
      productId = String(body.data?.product?.id || body.product?.id || '');
      amount = body.data?.purchase?.price?.value ? Number(body.data.purchase.price.value) : null;

      if (!mappedJourneyId) {
        mappedJourneyId = body.data?.purchase?.custom_fields?.journey_id || PRODUCT_JOURNEY_MAP[productId] || productId || 'pais-recem-nascidos';
      }
    }
    // 🔹 FORMATO GENÉRICO
    else {
      platform = body.platform || 'generic';
      externalId = String(body.orderId || body.id || `gen-${Date.now()}`);
      status = (body.status || 'approved').toLowerCase();
      buyerEmail = body.email || body.buyerEmail || '';
      buyerName = body.name || body.buyerName || '';
      buyerPhone = body.phone || body.buyerPhone || '';
      productId = String(body.productId || body.journeyId || '');
      amount = body.amount ? Number(body.amount) : null;
      mappedJourneyId = mappedJourneyId || body.journeyId || body.journey_id || 'pais-recem-nascidos';
    }

    buyerEmail = buyerEmail.toLowerCase().trim();

    if (!buyerEmail && status !== 'canceled') {
      return new Response(JSON.stringify({ error: 'BUYER_EMAIL_REQUIRED', message: 'E-mail do comprador não encontrado no payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📦 [Webhook ${platform.toUpperCase()}] Pedido: ${externalId} | Status: ${status} | E-mail: ${buyerEmail} | Produto: ${productId}`);

    // ── 3. Gravar na Tabela public.orders (Auditoria Financeira) ──
    const { data: savedOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .upsert({
        external_id: externalId,
        platform: platform,
        buyer_email: buyerEmail,
        buyer_name: buyerName || null,
        buyer_phone: buyerPhone || null,
        product_id: productId || mappedJourneyId,
        journey_id: mappedJourneyId || null,
        amount: amount,
        status: status,
        payload: body,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'platform, external_id, status'
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('Erro ao salvar pedido em public.orders:', orderError);
    }

    // ── 4. Processamento de Status: Aprovação vs Cancelamento ──
    let autoProvisioned = false;
    let userId: string | null = null;

    if (status === 'approved') {
      // 4.1. Localizar perfil existente por e-mail
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, name, community_access_expires_at, community_subscription_status')
        .ilike('email', buyerEmail)
        .maybeSingle();

      if (existingProfile?.id) {
        userId = existingProfile.id;
      } else {
        // 4.2. AUTO-PROVISIONAMENTO DE NOVO ALUNO
        const { data: newAuthUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
          email: buyerEmail,
          email_confirm: true,
          user_metadata: {
            full_name: buyerName || 'Membro Elana',
            phone: buyerPhone || null,
            created_via: `webhook_${platform}`
          }
        });

        if (newAuthUser?.user?.id) {
          userId = newAuthUser.user.id;
          autoProvisioned = true;
          console.log(`👤 Novo aluno provisionado automaticamente: ID ${userId} (${buyerEmail})`);
        } else {
          // Busca paginando se o usuário já existia no Auth
          let page = 1;
          let foundUser = false;
          while (!foundUser && page <= 10) {
            const { data: paged } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 100 });
            const match = paged?.users?.find(u => u.email?.toLowerCase() === buyerEmail.toLowerCase());
            if (match?.id) {
              userId = match.id;
              foundUser = true;
              break;
            }
            if (!paged?.users || paged.users.length < 100) break;
            page++;
          }
        }

        // Garante a existência em public.profiles
        if (userId) {
          await supabaseAdmin.from('profiles').upsert({
            id: userId,
            email: buyerEmail,
            name: buyerName || 'Membro Elana',
            phone: buyerPhone || null,
            role: 'user',
            avatar_url: `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(buyerEmail)}`,
            created_at: new Date().toISOString()
          }, { onConflict: 'id' });
        }
      }

      if (!userId) {
        throw new Error('Não foi possível identificar ou provisionar o usuário.');
      }

      // 4.3. SE FOR ASSINATURA DA COMUNIDADE (R$ 9,90/MÊS)
      if (isCommunitySubscription) {
        await supabaseAdmin.from('profiles').update({
          community_subscription_status: 'active',
          stripe_customer_id: stripeCustomerId || undefined,
          community_subscription_id: stripeSubscriptionId || undefined,
          community_access_expires_at: null // Assinatura recorrente ativa
        }).eq('id', userId);

        console.log(`🌿 Assinatura da Comunidade ATIVADA para ${buyerEmail}!`);
      } 
      // 4.4. SE FOR COMPRA DE JORNADA AVULSA (COM REGRA DE 90 DIAS DE BÔNUS!)
      else if (mappedJourneyId) {
        // Concede a jornada vitalícia
        const { error: journeyError } = await supabaseAdmin
          .from('user_purchased_journeys')
          .upsert({
            profile_id: userId,
            journey_id: mappedJourneyId
          }, {
            onConflict: 'profile_id, journey_id'
          });

        if (journeyError) {
          console.error('Erro ao conceder jornada:', journeyError);
        } else {
          console.log(`✨ Jornada '${mappedJourneyId}' liberada para ${buyerEmail}!`);
        }

        // 🎁 REGRA DOS 90 DIAS DE COMUNIDADE GRÁTIS
        // Calcula a nova data de expiração (90 dias a partir de hoje ou adiciona 90 dias se já tinha bônus futuro)
        const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
        let baseDate = Date.now();

        if (existingProfile?.community_access_expires_at) {
          const currentExp = new Date(existingProfile.community_access_expires_at).getTime();
          if (currentExp > baseDate) {
            baseDate = currentExp; // Estende os dias restantes!
          }
        }

        const newExpiresAt = new Date(baseDate + ninetyDaysMs).toISOString();

        // Atualiza o perfil com o bônus de 90 dias (sem sobrescrever se o usuário já for assinante mensal ativo)
        const currentStatus = existingProfile?.community_subscription_status;
        const newStatus = currentStatus === 'active' ? 'active' : 'trial_bonus';

        await supabaseAdmin.from('profiles').update({
          community_subscription_status: newStatus,
          community_access_expires_at: newExpiresAt,
          stripe_customer_id: stripeCustomerId || undefined
        }).eq('id', userId);

        console.log(`🎁 Bônus de 90 dias de Comunidade concedido até ${newExpiresAt} para ${buyerEmail}!`);
      }

      // 4.5. Magic Link de Boas-Vindas para novo aluno
      if (autoProvisioned) {
        try {
          await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: buyerEmail
          });
        } catch (e) {
          console.warn('Aviso: envio de magic link automático:', e);
        }
      }

    } else if (status === 'canceled') {
      // 4.6. Cancelamento da Assinatura da Comunidade (mantém jornadas intactas!)
      if (isCommunitySubscription && stripeCustomerId) {
        await supabaseAdmin.from('profiles').update({
          community_subscription_status: 'canceled'
        }).eq('stripe_customer_id', stripeCustomerId);

        console.log(`🔒 Assinatura da Comunidade CANCELADA para o cliente ${stripeCustomerId}. As jornadas continuam salvas.`);
      }
    } else if (status === 'refunded' || status === 'chargedback') {
      // 4.7. Reembolso: Revogar acesso à jornada específica
      const { data: profileToRevoke } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .ilike('email', buyerEmail)
        .maybeSingle();

      if (profileToRevoke?.id && mappedJourneyId) {
        await supabaseAdmin
          .from('user_purchased_journeys')
          .delete()
          .eq('profile_id', profileToRevoke.id)
          .eq('journey_id', mappedJourneyId);

        console.log(`🔒 Acesso revogado: Jornada '${mappedJourneyId}' removida de ${buyerEmail} por ${status}.`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      platform: platform,
      order_id: externalId,
      status: status,
      buyer_email: buyerEmail,
      journey_id: mappedJourneyId || null,
      auto_provisioned: autoProvisioned,
      is_community_subscription: isCommunitySubscription
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Exceção no Webhook de Checkout:', error);
    return new Response(JSON.stringify({
      error: 'WEBHOOK_INTERNAL_ERROR',
      message: error.message || 'Erro interno ao processar webhook'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
