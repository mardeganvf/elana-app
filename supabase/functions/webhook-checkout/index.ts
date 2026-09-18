import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-token, x-kiwify-token',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const webhookSecret = Deno.env.get('WEBHOOK_SECRET') || '';

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
  'pais-primeira-viagem': 'pais-primeira-viagem',
  'desenvolvimento-infantil': 'desenvolvimento-infantil',
  'sono-rotina': 'sono-rotina',
  'alimentacao-introducao': 'alimentacao-introducao',
  'emocoes-comportamento': 'emocoes-comportamento'
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
      // Se for formato application/x-www-form-urlencoded
      const params = new URLSearchParams(rawBody);
      body = Object.fromEntries(params.entries());
    }

    // ── 1. Validação de Segurança do Webhook ──
    const headerToken = req.headers.get('x-webhook-token') 
      || req.headers.get('x-kiwify-token') 
      || req.headers.get('hottok');
    const bodyToken = body.token || body.signature || body.hottok;
    const providedToken = queryToken || headerToken || bodyToken;

    if (webhookSecret && providedToken !== webhookSecret) {
      console.warn('⚠️ Webhook rejeitado: Token inválido ou ausente.');
      return new Response(JSON.stringify({ error: 'UNAUTHORIZED_WEBHOOK_TOKEN' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
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

    // Detecção Kiwify
    if (body.order_id || body.order_status) {
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
      amount = body.order_amount ? Number(body.order_amount) / 100 : (body.Commissions?.my_commission ? Number(body.Commissions.my_commission) / 100 : null);
      
      if (!mappedJourneyId) {
        mappedJourneyId = body.custom_fields?.journey_id || PRODUCT_JOURNEY_MAP[productId] || productId || 'pais-recem-nascidos';
      }
    }
    // Detecção Hotmart
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
    // Formato Direto / Genérico
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

    if (!buyerEmail) {
      return new Response(JSON.stringify({ error: 'BUYER_EMAIL_REQUIRED', message: 'E-mail do comprador não encontrado no payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📦 [Webhook ${platform.toUpperCase()}] Pedido: ${externalId} | Status: ${status} | E-mail: ${buyerEmail} | Jornada: ${mappedJourneyId}`);

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
        journey_id: mappedJourneyId,
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

    // ── 4. Processamento de Status: Aprovação vs Reembolso ──
    let autoProvisioned = false;
    let userId: string | null = null;

    if (status === 'approved') {
      // 4.1. Localizar perfil existente por e-mail
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, name')
        .ilike('email', buyerEmail)
        .maybeSingle();

      if (existingProfile?.id) {
        userId = existingProfile.id;
      } else {
        // 4.2. Localizar no Supabase Auth caso o perfil não exista
        const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
        const foundAuthUser = usersList?.users?.find(u => u.email?.toLowerCase() === buyerEmail);

        if (foundAuthUser?.id) {
          userId = foundAuthUser.id;
        } else {
          // 4.3. 🚀 AUTO-PROVISIONAMENTO: Cria novo usuário no Supabase Auth
          const { data: newAuthUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
            email: buyerEmail,
            email_confirm: true,
            user_metadata: {
              full_name: buyerName || 'Membro Elana',
              phone: buyerPhone || null,
              created_via: `webhook_${platform}`
            }
          });

          if (createAuthError || !newAuthUser?.user?.id) {
            console.error('Falha ao auto-provisionar usuário no Auth:', createAuthError);
            throw new Error(`Falha no auto-provisionamento: ${createAuthError?.message}`);
          }

          userId = newAuthUser.user.id;
          autoProvisioned = true;
          console.log(`👤 Novo aluno provisionado automaticamente: ID ${userId} (${buyerEmail})`);
        }

        // Garante que o profile existe no banco
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

      // 4.4. Conceder a Jornada Adquirida ao Aluno
      if (userId && mappedJourneyId) {
        const { error: journeyError } = await supabaseAdmin
          .from('user_purchased_journeys')
          .upsert({
            profile_id: userId,
            journey_id: mappedJourneyId
          }, {
            onConflict: 'profile_id, journey_id'
          });

        if (journeyError) {
          console.error('Erro ao conceder jornada ao usuário:', journeyError);
        } else {
          console.log(`✨ Jornada '${mappedJourneyId}' liberada com sucesso para o aluno ${buyerEmail}!`);
        }
      }

      // 4.5. Se o aluno foi auto-provisionado, gerar link de acesso / boas-vindas
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

    } else if (status === 'refunded' || status === 'chargedback') {
      // 4.6. Reembolso ou Chargeback: Revogar acesso à jornada
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

        console.log(`🔒 Acesso revogado: Jornada '${mappedJourneyId}' removida do usuário ${buyerEmail} devido a ${status}.`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      platform: platform,
      order_id: externalId,
      status: status,
      buyer_email: buyerEmail,
      journey_id: mappedJourneyId,
      auto_provisioned: autoProvisioned,
      order_db_id: savedOrder?.id || null
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Exceção no Webhook de Checkout:', error);
    return new Response(JSON.stringify({
      error: 'WEBHOOK_INTERNAL_ERROR',
      message: error.message || 'Erro interno ao processar webhook de vendas'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
