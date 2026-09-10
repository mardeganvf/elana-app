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
   - Xingamentos, agressões verbais ou baixo calão hostil.
   - Tom exageradamente impositivo, autoritário ou mandatos de silenciamento ("cala a boca", "você é obrigada", "engole o choro", "não tem direito de reclamar").
   - Violação de consentimento, violência sexual, abuso ou estupro (inclusive conjugal ou de vulnerável), como manter relações sexuais ou toques íntimos com pessoa dormindo, desacordada, inconsciente, sob efeito de substâncias, sem consentimento mútuo ou contra sua vontade expressa ou tácita.
   - Pressão sexual, coerção conjugal ou insistência contra o consentimento e limites do parceiro ou da parceira (ex: "como convencer a fazer sexo", insistir em práticas íntimas ou sexo anal que o parceiro não deseja, desrespeito à autonomia e recusa da esposa/marido).
   - Conteúdo sexualmente explícito, vocabulário pornográfico, assédio ou descrições íntimas inadequadas para uma comunidade de apoio parental.

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

async function getEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  const models = ['gemini-embedding-001', 'text-embedding-004'];
  for (const model of models) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;
      const res = await fetch(geminiUrl, {
        method: 'POST',
        signal: AbortSignal.timeout(2500),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${model}`,
          content: {
            parts: [{ text: text.trim().slice(0, 1000) }]
          },
          outputDimensionality: 768
        })
      });
      if (!res.ok) {
        const txt = await res.text();
        console.warn(`Falha embedding (${model}):`, res.status, txt);
        continue;
      }
      const data = await res.json();
      if (data?.embedding?.values) {
        return data.embedding.values;
      }
    } catch (err) {
      console.warn(`Erro ao requisitar embedding (${model}):`, err);
    }
  }
  return null;
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

    // ──────────────────────────────────────────────────────────────────────────
    // AÇÃO 1: Treinar / Adicionar Exemplo Banido (Active Learning Human-in-the-Loop)
    // ──────────────────────────────────────────────────────────────────────────
    if (action === 'train_example') {
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
    // AÇÃO 2: Moderação de Mensagem (com Busca Semântica + Few-Shot)
    // ──────────────────────────────────────────────────────────────────────────
    const text = body.text;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return new Response(
        JSON.stringify({ isFlagged: false, category: 'livre', reason: 'Texto vazio' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. CAMADA VETORIAL (pgvector): Buscar similaridade semântica com conteúdos banidos
    if (supabase && apiKey) {
      try {
        const queryEmbedding = await getEmbedding(text, apiKey);
        if (queryEmbedding) {
          const { data: matches, error: rpcError } = await supabase.rpc('match_rejected_examples', {
            query_embedding: queryEmbedding,
            match_threshold: 0.82,
            match_count: 1
          });

          if (!rpcError && matches && matches.length > 0) {
            const topMatch = matches[0];
            const similarityPercent = Math.round(Number(topMatch.similarity || 0) * 100);
            return new Response(
              JSON.stringify({
                isFlagged: true,
                category: topMatch.category || 'antijulgamento',
                reason: `Similar a conteúdo banido pela curadoria: "${topMatch.reason}" (${similarityPercent}% similaridade)`,
                matchedContext: topMatch.original_text.slice(0, 120),
                suggestsCrisisSupport: topMatch.category === 'vulnerabilidade',
                matchedByLearningBase: true
              }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch (embErr) {
        console.warn('Aviso na busca vetorial por similaridade:', embErr);
      }
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

    // 2. CAMADA CONTEXTUAL DINÂMICA (Few-Shot Learning):
    // Injetar os últimos exemplos banidos da moderação humana na instrução do Gemini
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
      } catch (fetchErr) {
        console.warn('Aviso ao carregar exemplos dinâmicos:', fetchErr);
      }
    }

    // Chamar com prioridade o gemini-3.5-flash-lite e fallback para gemini-2.5-flash / gemini-3.7-flash
    const models = ['gemini-3.5-flash-lite', 'gemini-2.5-flash', 'gemini-3.7-flash'];
    let lastError: any = null;
    let parsed: any = null;
    let usedModel: string = '';

    for (const model of models) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          signal: AbortSignal.timeout(3500),
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
              max_output_tokens: 140
            }
          })
        });

        if (!geminiResponse.ok) {
          const errText = await geminiResponse.text();
          console.warn(`Aviso na API do Gemini (${model}):`, geminiResponse.status, errText);
          lastError = { model, status: geminiResponse.status, message: errText };
          continue;
        }

        const data = await geminiResponse.json();
        const candidate = data?.candidates?.[0];
        const finishReason = candidate?.finishReason;
        const blockReason = data?.promptFeedback?.blockReason;

        // Se o próprio filtro de segurança nativo da IA bloqueou por conteúdo explícito/sexual/violência
        if (blockReason || finishReason === 'SAFETY' || finishReason === 'PROHIBITED_CONTENT' || data?.promptFeedback?.safetyRatings?.some((r: any) => r.blocked)) {
          parsed = {
            isFlagged: true,
            category: 'antijulgamento',
            reason: 'Conteúdo bloqueado por linguagem explícita ou termos impróprios.',
            matchedContext: text.trim().slice(0, 100),
            suggestsCrisisSupport: false
          };
          usedModel = model;
          break;
        }

        const candidateText = candidate?.content?.parts?.[0]?.text;
        if (candidateText) {
          try {
            parsed = JSON.parse(candidateText);
            usedModel = model;
            break;
          } catch (jsonErr: any) {
            console.warn('Erro ao parsear resposta JSON do Gemini:', jsonErr);
          }
        }
      } catch (e: any) {
        lastError = { model, message: e?.message || String(e), name: e?.name };
      }
    }

    if (!parsed) {
      return new Response(
        JSON.stringify({
          error: 'GEMINI_MODELS_UNAVAILABLE',
          lastError,
          fallbackRequired: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
