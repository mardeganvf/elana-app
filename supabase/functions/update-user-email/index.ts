import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { new_email } = await req.json()

    if (!new_email || !new_email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'E-mail inválido.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar cliente admin com service role (nunca exposto ao cliente)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Verificar o JWT do usuário para obter o ID com segurança
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token)

    if (userErr || !user) {
      return new Response(
        JSON.stringify({ error: 'Sessão inválida. Por favor, faça login novamente.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se o novo e-mail já existe em outra conta
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', new_email.toLowerCase().trim())
      .neq('id', user.id)
      .maybeSingle()

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'Este e-mail já está cadastrado em outra conta.' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Atualizar e-mail diretamente em auth.users via API Admin
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email: new_email.toLowerCase().trim(),
      email_confirm: true
    })

    if (updateErr) {
      return new Response(
        JSON.stringify({ error: updateErr.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Atualizar também em public.profiles
    await supabaseAdmin
      .from('profiles')
      .update({ email: new_email.toLowerCase().trim(), updated_at: new Date().toISOString() })
      .eq('id', user.id)

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Erro interno.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
