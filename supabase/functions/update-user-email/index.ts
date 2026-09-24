import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  // Tratar preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { new_email, current_password, otp_code } = body

    if (!new_email || typeof new_email !== 'string' || !new_email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Endereço de e-mail inválido.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const cleanNewEmail = new_email.toLowerCase().trim()

    // 1. Obter e validar o JWT da sessão do usuário
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado. Sessão ausente.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim()
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token de autenticação inválido.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || req.headers.get('apikey') || ''

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !user || !user.email) {
      return new Response(
        JSON.stringify({ error: 'Sessão inválida ou expirada. Por favor, faça login novamente.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Não permitir alterar para o mesmo e-mail atual
    if (cleanNewEmail === user.email.toLowerCase().trim()) {
      return new Response(
        JSON.stringify({ error: 'O novo e-mail deve ser diferente do e-mail atual cadastrado.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Verificar se o novo e-mail já existe em outra conta
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', cleanNewEmail)
      .neq('id', user.id)
      .maybeSingle()

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: 'Este e-mail já está cadastrado em outra conta.' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. [DEFESA CONTRA ATO - SEC-EDGE-01]: Re-autenticação com Senha Atual
    // Se o usuário possui credenciais de e-mail/senha, a confirmação de senha é estritamente obrigatória.
    const isEmailUser = user.app_metadata?.provider === 'email' ||
      (user.identities && user.identities.some((i: any) => i.provider === 'email')) ||
      (!user.app_metadata?.provider && user.email)

    if (isEmailUser) {
      if (!current_password || typeof current_password !== 'string' || !current_password.trim()) {
        return new Response(
          JSON.stringify({ error: 'Por favor, informe sua senha atual para autorizar a alteração de e-mail.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      })

      const { error: signInErr } = await anonClient.auth.signInWithPassword({
        email: user.email,
        password: current_password
      })

      if (signInErr) {
        return new Response(
          JSON.stringify({ error: 'Senha atual incorreta. A confirmação da senha é obrigatória por segurança.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // 5. [DEFESA CONTRA ATO - SEC-EDGE-01]: Validação Criptográfica do Token OTP
    // O código OTP enviado para cleanNewEmail é obrigatório para provar posse do novo e-mail.
    if (!otp_code || typeof otp_code !== 'string' || otp_code.trim().length < 6) {
      return new Response(
        JSON.stringify({ error: 'Código de confirmação de e-mail é obrigatório.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } }
    })

    let isOtpValid = false
    const cleanToken = otp_code.trim()

    const { error: changeErr } = await userAuthClient.auth.verifyOtp({
      email: cleanNewEmail,
      token: cleanToken,
      type: 'email_change'
    })

    if (!changeErr) {
      isOtpValid = true
    } else {
      // Fallback caso o OTP tenha sido despachado como type: 'email'
      const { error: emailErr } = await userAuthClient.auth.verifyOtp({
        email: cleanNewEmail,
        token: cleanToken,
        type: 'email'
      })
      if (!emailErr) {
        isOtpValid = true
      }
    }

    if (!isOtpValid) {
      return new Response(
        JSON.stringify({ error: 'Código de verificação inválido ou expirado. Verifique os dígitos e tente novamente.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6. Atualização Segura no Auth e Profiles após TODAS as validações (Senha + OTP)
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email: cleanNewEmail,
      email_confirm: true
    })

    if (updateErr) {
      return new Response(
        JSON.stringify({ error: updateErr.message || 'Erro ao atualizar dados de autenticação.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sincronizar em public.profiles
    await supabaseAdmin
      .from('profiles')
      .update({ email: cleanNewEmail, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    console.log(`[Security Audit] Alteração de e-mail concluída com sucesso para o usuário ${user.id} (${user.email} -> ${cleanNewEmail}).`)

    return new Response(
      JSON.stringify({ success: true, message: 'E-mail atualizado com sucesso.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err: any) {
    console.error('[update-user-email] Erro inesperado:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Erro interno do servidor.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
