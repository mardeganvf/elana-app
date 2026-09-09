const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

Deno.serve(async (req) => {
  // Tratar preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string' || !text.trim()) {
      return new Response(
        JSON.stringify({ isFlagged: false, category: 'livre', reason: 'Texto vazio' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');

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

    // Chamar a API REST do Gemini com redundância multi-modelo
    const models = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.7-flash'];
    let lastError: any = null;
    let parsed: any = null;

    for (const model of models) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          signal: AbortSignal.timeout(8000),
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: SYSTEM_INSTRUCTION }]
            },
            contents: [
              {
                parts: [{ text: `Analise a seguinte mensagem postada na comunidade Elana:\n\n"${text.trim()}"` }]
              }
            ],
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.1
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

        // Se o próprio filtro de segurança nativo da IA bloqueou por conteúdo explícito/sexual/violência (ex: PROHIBITED_CONTENT, SAFETY)
        if (blockReason || finishReason === 'SAFETY' || finishReason === 'PROHIBITED_CONTENT' || data?.promptFeedback?.safetyRatings?.some((r: any) => r.blocked)) {
          parsed = {
            isFlagged: true,
            category: 'antijulgamento',
            reason: 'Conteúdo bloqueado por linguagem sexual explícita ou termos impróprios.',
            matchedContext: text.trim().slice(0, 100),
            suggestsCrisisSupport: false
          };
          break;
        }

        const candidateText = candidate?.content?.parts?.[0]?.text;
        if (candidateText) {
          try {
            parsed = JSON.parse(candidateText);
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
