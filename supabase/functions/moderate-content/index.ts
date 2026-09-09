const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_INSTRUCTION = `Você é um especialista clínico em psicologia parental e moderador de segurança e acolhimento da comunidade Elana Academy.
Sua missão é avaliar a mensagem submetida por uma mãe, pai ou cuidador e classificá-la contextualmente para acolhimento preventivo ou moderação de segurança.

Avalie com sensibilidade humana, compreendendo metáforas, desabafos implícitos, dores ocultas, ironias e julgamentos disfarçados.

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

3. "livre":
   - Desabafos comuns e saudáveis da rotina materna/paterna ("meu bebê não dormiu nada hoje e estou exausta", "preciso de ajuda com a cólica", "estou cansada de limpar a casa").
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

    // Chamar a API REST oficial do Gemini 2.5 Flash
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
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
      console.error('Erro na API do Gemini:', geminiResponse.status, errText);
      return new Response(
        JSON.stringify({
          error: 'GEMINI_API_ERROR',
          status: geminiResponse.status,
          fallbackRequired: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await geminiResponse.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return new Response(
        JSON.stringify({ isFlagged: false, category: 'livre', fallbackRequired: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parsed = JSON.parse(candidateText);

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
