import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || Deno.env.get('VITE_VAPID_PUBLIC_KEY') || 'BE2PXd_maQ142gLFDJAybKQ7zXSp3py0U7Jqq72laxy0uuxa0h2nNg4qFoymgpGSDqzVt9ErIiS4LAfwU9WkYWM';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || 'YyoE38NcILWR4DM3vP_gLUDnOMZpNdmGN2Px1NDrpaI';
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:contato@elana.app.br';

webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { profile_id, title, body, url, icon } = await req.json();

    if (!profile_id) {
      return new Response(JSON.stringify({ error: 'profile_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!supabase) {
      return new Response(JSON.stringify({ error: 'Supabase client not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Busca todas as subscriptions ativas deste perfil
    const { data: subscriptions, error: fetchErr } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('profile_id', profile_id);

    if (fetchErr) {
      throw fetchErr;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscriptions found for user', sentCount: 0 }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = JSON.stringify({
      title: title || 'Elana Academy',
      body: body || 'Nova mensagem de acolhimento para você',
      url: url || '/',
      icon: icon || '/icon-192.png'
    });

    let sentCount = 0;
    const expiredEndpoints: string[] = [];

    // 2. Dispara notificação para cada dispositivo registrado
    await Promise.all(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth_key
          }
        };

        try {
          await webpush.sendNotification(pushSubscription, payload);
          sentCount++;
        } catch (err: any) {
          console.warn('Erro ao enviar push para endpoint:', sub.endpoint, err?.statusCode || err?.message);
          // Se a subscription expirou ou foi cancelada no dispositivo (HTTP 410 ou 404)
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            expiredEndpoints.push(sub.endpoint);
          }
        }
      })
    );

    // 3. Limpeza automática de endpoints expirados
    if (expiredEndpoints.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints);
    }

    return new Response(
      JSON.stringify({ success: true, sentCount, totalSubs: subscriptions.length }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Erro na função send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
