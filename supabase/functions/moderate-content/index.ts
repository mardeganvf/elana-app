import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const SYSTEM_INSTRUCTION = `Você é um especialista clínico em psicologia parental e moderador de segurança e acolhimento da comunidade Elana Academy.
Sua missão é avaliar a mensagem submetida por uma mãe, pai ou cuidador e classificá-la contextualmente para acolhimento preventivo ou moderação de segurança.

Avalie com sensibilidade humana, compreendendo metáforas, desabafos implícitos, dores ocultas, ironias, coerções e julgamentos disfarçados.

Categorias de classificação:
1. "vulnerabilidade":
   - Sinais de risco à vida ou ideação suicida (direta ou velada/metafórica).
   - Menções a sumir, desaparecer, morrer, não querer acordar, apagar para sempre, acabar com tudo.
   - Sentimentos profundos de desvalia existencial e de ser um fardo ("minha vida não importa", "não sou importante", "ninguém precisa de mim", "sou um peso/estorvo", "estariam melhor sem mim", "não faço falta ou diferença").
   - Esgotamento extremo e incapacidade ("não dou conta", "não estou aguentando mais", "cheguei ao meu limite", "não vejo saída", "em desespero").
   - Desistência da vida ou de lutar ("cansei de tudo", "cansei da vida", "chega de tudo", "perdi o sentido").

2. "antijulgamento":
   - Crítica pesada, humilhação ou mom-shaming ("péssima mãe", "mãe de merda", "irresponsável", "negligente", "coitado do seu bebê", "deveria ter vergonha").
   - Depreciação destrutiva, ataques conjugais ou desqualificação agressiva do cônjuge/parceiro(a) ("minha mulher é péssima", "meu marido é inútil", "péssima esposa", "não sabe o que faz", "não sabe fritar um ovo").
   - Qualquer forma de discriminação, preconceito, intolerância ou discurso de ódio — seja por motivos de:
     * Raça ou etnia (racismo, injúria racial, estereótipos depreciativos).
     * Orientação sexual ou identidade de gênero (homofobia, transfobia, bifobia, rejeição ou lamentação sobre a orientação de filhos/parentes, discriminação contra famílias homoafetivas/diversas).
     * Nacionalidade, origem regional ou etnia (xenofobia, preconceito contra imigrantes, refugiados, estrangeiros ou preconceito regional).
     * Religião ou crença (intolerância religiosa, hostilidade de fé).
     * Capacitismo e neurodivergência (preconceito contra pessoas ou crianças com deficiência, autismo, TDAH, atrasos no desenvolvimento, síndromes).
     * Condição física ou social (gordofobia, aporofobia, elitismo).
   - Xingamentos, agressões verbais ou baixo calão hostil.
   - Tom exageradamente impositivo, autoritário ou mandatos de silenciamento ("cala a boca", "você é obrigada", "engole o choro", "não tem direito de reclamar").
   - Violação de consentimento, violência sexual, abuso ou estupro (inclusive conjugal ou de vulnerável), como manter relações sexuais ou toques íntimos com pessoa dormindo, desacordada, inconsciente, sob efeito de substâncias, sem consentimento mútuo ou contra sua vontade expressa ou tácita.
   - Pressão sexual, coerção conjugal ou insistência contra o consentimento e limites do parceiro ou da parceira (ex: "como convencer a fazer sexo", insistir em práticas íntimas ou sexo anal que o parceiro não deseja, desrespeito à autonomia e recusa da esposa/marido).
   - Conteúdo sexualmente explícito, vocabulário pornográfico, assédio ou descrições íntimas inadequadas para uma comunidade de apoio parental.
   - Assédio sexual, cantadas invasivas ou inoportunas, investidas de teor sexual, importunação ou objetificação corporal de membros da comunidade (ex: "gostosa", "quero te pegar", "delícia", "vem cá", "vou te pegar", investidas amorosas ou sexuais direcionadas a participantes da comunidade).

3. "livre":
   - Desabafos comuns e saudáveis da rotina materna/paterna ("meu bebê não dormiu nada hoje e estou exausta", "preciso de ajuda com a cólica", "estou cansada de limpar a casa").
   - Reflexões sobre a vida a dois com respeito mútuo, carinho e diálogo saudável, sem coerção sexual (ex: falta de tempo para namorar após a chegada dos filhos, reconectar o casal com afeto).
   - Dúvidas, trocas de experiências, celebrações e conversas normais.

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "isFlagged": boolean,
  "category": "vulnerabilidade" | "antijulgamento" | "livre",
  "reason": string (resumo empático de no máximo 15 palavras explicando a classificação para a moderação),
  "matchedContext": string (o trecho ou sentimento chave identificado),
  "suggestsCrisisSupport": boolean (true se houver risco ou ideação que demande apoio prioritário/CVV)
}`;

// ── Embedding: usa apenas o modelo que funciona ──────────────────────────────
async function getEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;
    const res = await fetch(geminiUrl, {
      method: 'POST',
      signal: AbortSignal.timeout(2000),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: {
          parts: [{ text: text.trim().slice(0, 1000) }]
        },
        outputDimensionality: 768
      })
    });
    if (!res.ok) {
      console.warn('Falha embedding:', res.status);
      return null;
    }
    const data = await res.json();
    return data?.embedding?.values || null;
  } catch (err) {
    console.warn('Erro embedding:', err);
    return null;
  }
}

// ── Caminho A: Busca vetorial (embedding + pgvector) ─────────────────────────
async function runVectorSearch(text: string, apiKey: string): Promise<any | null> {
  if (!supabase) return null;
  try {
    const queryEmbedding = await getEmbedding(text, apiKey);
    if (!queryEmbedding) return null;

    const { data: matches, error: rpcError } = await supabase.rpc('match_rejected_examples', {
      query_embedding: queryEmbedding,
      match_threshold: 0.82,
      match_count: 1
    });

    if (!rpcError && matches && matches.length > 0) {
      const topMatch = matches[0];
      const similarityPercent = Math.round(Number(topMatch.similarity || 0) * 100);
      return {
        isFlagged: true,
        category: topMatch.category || 'antijulgamento',
        reason: `Similar a conteúdo banido pela curadoria: "${topMatch.reason}" (${similarityPercent}% similaridade)`,
        matchedContext: topMatch.original_text.slice(0, 120),
        suggestsCrisisSupport: topMatch.category === 'vulnerabilidade',
        matchedByLearningBase: true
      };
    }
  } catch (err) {
    console.warn('Aviso na busca vetorial:', err);
  }
  return null;
}

// ── Caminho B: Gemini generateContent (few-shot + classificação) ─────────────
async function runGeminiModeration(text: string, apiKey: string): Promise<any | null> {
  const debugErrors: any[] = [];

  // 1. Carregar exemplos banidos do banco para enriquecer o prompt (paralelo-friendly, ~300ms)
  let dynamicSystemInstruction = SYSTEM_INSTRUCTION;
  if (supabase) {
    try {
      const { data: recentExamples } = await supabase
        .from('moderation_rejected_examples')
        .select('original_text, reason, category')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (recentExamples && recentExamples.length > 0) {
        const examplesText = recentExamples
          .map((ex: any, idx: number) => `${idx + 1}. "${ex.original_text.replace(/\s+/g, ' ').slice(0, 160)}" -> Motivo do banimento: ${ex.reason} [${ex.category}]`)
          .join('\n');

        dynamicSystemInstruction += `\n\n4. EXEMPLOS REAIS RECENTEMENTE BANIDOS PELA CURADORIA HUMANA DA ELANA (DIRETRIZES ATIVAS):\n${examplesText}\n\nIMPORTANTE: Se a mensagem avaliada compartilhar tom de coação, insistência, desrespeito, abuso ou intenção semelhante a qualquer um destes exemplos banidos acima, classifique OBRIGATORIAMENTE com isFlagged: true e a respectiva categoria.`;
      }
    } catch (fetchErr: any) {
      debugErrors.push({ step: 'few-shot-db', error: fetchErr?.message || String(fetchErr) });
    }
  }

  // 2. Chamar Gemini (gemini-3.5-flash-lite ultrarrápido + gemini-3.6-flash)
  const models = ['gemini-3.5-flash-lite', 'gemini-3.6-flash'];

  for (const model of models) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        signal: AbortSignal.timeout(6000),
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: dynamicSystemInstruction }]
          },
          contents: [
            {
              parts: [{ text: `Analise a seguinte mensagem postada na comunidade Elana:\n\n"${text.trim()}"` }]
            }
          ],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.1,
            max_output_tokens: 1024
          }
        })
      });

      if (!geminiResponse.ok) {
        const errText = await geminiResponse.text();
        console.warn(`Gemini model ${model} failed (${geminiResponse.status}):`, errText);
        debugErrors.push({ model, status: geminiResponse.status, message: errText.slice(0, 300) });
        continue;
      }

      const data = await geminiResponse.json();
      const candidate = data?.candidates?.[0];
      const finishReason = candidate?.finishReason;
      const blockReason = data?.promptFeedback?.blockReason;

      // Se o filtro de segurança nativo da IA bloqueou
      if (blockReason || finishReason === 'SAFETY' || finishReason === 'PROHIBITED_CONTENT' || data?.promptFeedback?.safetyRatings?.some((r: any) => r.blocked)) {
        return {
          isFlagged: true,
          category: 'antijulgamento',
          reason: 'Conteúdo bloqueado por linguagem explícita ou termos impróprios.',
          matchedContext: text.trim().slice(0, 100),
          suggestsCrisisSupport: false
        };
      }

      // Em modelos Gemini 3.x com thinking, buscar o part que NÃO é pensamento (thought)
      const parts = candidate?.content?.parts || [];
      const nonThoughtPart = parts.find((p: any) => !p.thought && p.text) || parts[parts.length - 1];
      const candidateText = nonThoughtPart?.text;

      if (candidateText) {
        try {
          return JSON.parse(candidateText.trim());
        } catch (jsonErr: any) {
          debugErrors.push({ model, step: 'json-parse', error: jsonErr?.message, rawText: candidateText.slice(0, 100) });
        }
      }
    } catch (e: any) {
      debugErrors.push({ model, step: 'fetch', error: e?.message || String(e), name: e?.name });
    }
  }

  // Retornar debug info quando todos os modelos falharem
  return { _debug: true, _errors: debugErrors, isFlagged: false };
}

Deno.serve(async (req) => {
  // Tratar preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'moderate';
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    // 🛡️ Validação de autorização de administrador
    async function verifyIsAdmin(request: Request): Promise<boolean> {
      if (!supabase) return false;
      const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
      if (!authHeader) return false;
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (!token) return false;

      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (userError || !user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = (profile?.role || '').toLowerCase().trim();
      return role === 'admin' || role === 'administrador';
    }

    // ──────────────────────────────────────────────────────────────────────────
    // AÇÃO 1: Treinar / Adicionar Exemplo Banido (Active Learning Human-in-the-Loop)
    // ──────────────────────────────────────────────────────────────────────────
    if (action === 'train_example') {
      const isAdmin = await verifyIsAdmin(req);
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'UNAUTHORIZED_ADMIN_ACTION', message: 'Acesso restrito a administradores.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { text, category, reason, adminNotes } = body;
      if (!text || typeof text !== 'string' || !text.trim()) {
        return new Response(
          JSON.stringify({ error: 'Texto não fornecido para aprendizado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let embedding: number[] | null = null;
      if (apiKey) {
        embedding = await getEmbedding(text, apiKey);
      }

      if (supabase) {
        const { data: inserted, error: insertError } = await supabase
          .from('moderation_rejected_examples')
          .insert({
            original_text: text.trim(),
            category: category || 'antijulgamento',
            reason: reason || 'Conteúdo rejeitado pela curadoria humana',
            admin_notes: adminNotes || null,
            embedding: embedding,
            is_active: true
          })
          .select()
          .single();

        if (insertError) {
          console.warn('Erro ao inserir exemplo na base de aprendizado:', insertError);
          return new Response(
            JSON.stringify({ error: insertError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, item: inserted, hasEmbedding: !!embedding }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'SUPABASE_CLIENT_NOT_AVAILABLE' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // AÇÃO 2: Resolver denúncias e aprovar conteúdo (Admin Bypass RLS)
    // ──────────────────────────────────────────────────────────────────────────
    if (action === 'resolve_reports') {
      const isAdmin = await verifyIsAdmin(req);
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'UNAUTHORIZED_ADMIN_ACTION', message: 'Acesso restrito a administradores.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { contentId, contentType } = body;
      if (!contentId) {
        return new Response(
          JSON.stringify({ error: 'contentId é obrigatório' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (supabase) {
        // 1. Limpar denúncias
        await supabase
          .from('community_reports')
          .delete()
          .eq('content_id', contentId);

        // 2. Atualizar status e zerar contagem
        const table = contentType === 'comment' ? 'community_comments' : 'community_posts';
        await supabase
          .from(table)
          .update({
            report_count: 0,
            status: 'aprovado',
            ...(contentType !== 'comment' ? { category: 'aprovado' } : {})
          })
          .eq('id', contentId);

        return new Response(
          JSON.stringify({ success: true, resolvedContentId: contentId }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'SUPABASE_CLIENT_NOT_AVAILABLE' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // AÇÃO 3: Moderação de Mensagem (Gemini + Busca Vetorial em PARALELO)
    // ──────────────────────────────────────────────────────────────────────────
    const text = body.text;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return new Response(
        JSON.stringify({ isFlagged: false, category: 'livre', reason: 'Texto vazio' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!apiKey) {
      console.warn('GEMINI_API_KEY não configurada nos secrets do Supabase.');
      return new Response(
        JSON.stringify({
          error: 'GEMINI_API_KEY_NOT_SET',
          isFlagged: false,
          fallbackRequired: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Executar ambos os caminhos em PARALELO ───────────────────────────────
    // Caminho A (Gemini): DB query few-shot (~300ms) → generateContent (~2s) ≈ 2.3s
    // Caminho B (Vetor):  Embedding (~1.5s) → pgvector RPC (~0.5s)           ≈ 2s
    // Total paralelo: ~2.3s (max dos dois), em vez dos ~6-10s sequenciais
    const [geminiResult, vectorResult] = await Promise.allSettled([
      runGeminiModeration(text.trim(), apiKey),
      runVectorSearch(text.trim(), apiKey)
    ]);

    // Prioridade 1: Busca vetorial encontrou match com conteúdo banido (curadoria humana)
    if (vectorResult.status === 'fulfilled' && vectorResult.value?.isFlagged) {
      return new Response(
        JSON.stringify(vectorResult.value),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prioridade 2: Gemini classificou com sucesso (não é debug/fallback)
    if (geminiResult.status === 'fulfilled' && geminiResult.value && !geminiResult.value._debug) {
      const parsed = geminiResult.value;
      return new Response(
        JSON.stringify({
          isFlagged: !!parsed.isFlagged,
          category: parsed.category || 'livre',
          reason: parsed.reason || '',
          matchedContext: parsed.matchedContext || '',
          suggestsCrisisSupport: !!parsed.suggestsCrisisSupport
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback: Nenhum caminho retornou resultado válido
    const allErrors = [
      ...(geminiResult.status === 'fulfilled' ? geminiResult.value?._errors || [] : [{ error: String((geminiResult as any).reason) }]),
      ...(vectorResult.status === 'rejected' ? [{ vectorError: String((vectorResult as any).reason) }] : [])
    ];
    return new Response(
      JSON.stringify({
        error: 'GEMINI_MODELS_UNAVAILABLE',
        debugErrors: allErrors,
        fallbackRequired: true
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Erro interno na Edge Function moderate-content:', err);
    return new Response(
      JSON.stringify({
        error: err.message || 'INTERNAL_ERROR',
        fallbackRequired: true
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
