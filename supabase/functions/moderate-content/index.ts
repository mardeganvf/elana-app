import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

// ── Tipos e Interfaces ───────────────────────────────────────────────────────
export type ModerationCategory = 'vulnerabilidade' | 'antijulgamento' | 'livre';

export interface ModerationResult {
  isFlagged: boolean;
  category: ModerationCategory;
  reason: string;
  matchedContext: string;
  suggestsCrisisSupport: boolean;
  provider?: 'gemini' | 'vector' | 'regex-circuit-breaker';
  fallbackApplied?: boolean;
  matchedByLearningBase?: boolean;
  _debug?: boolean;
  _errors?: unknown[];
}

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
export const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export const SYSTEM_INSTRUCTION = `Você é um especialista clínico em psicologia parental e moderador de segurança e acolhimento da comunidade Elana Academy.
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

// ── Circuit Breaker: Fallback por Regex no Servidor ──────────────────────────
export function normalizeText(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

const VULNERABILITY_PATTERNS = [
  { pattern: /\b(?:quer[ao]|vou|pensando\s+em|vontade\s+de)\s+(?:sumir|desaparecer|morrer|acabar\s+com\s+tudo|tirar\s+minha\s+vida)\b/i, reason: 'Ideação de desaparecimento ou morte' },
  { pattern: /\b(?:cansei\s+de\s+viver|cansei\s+da\s+vida|nao\s+quero\s+(?:mais\s+)?acordar|dormir\s+pra\s+sempre)\b/i, reason: 'Desistência existencial grave' },
  { pattern: /\b(?:nao\s+estou\s+aguentando\s+mais|cheguei\s+ao\s+meu\s+limite|estou\s+no\s+fundo\s+do\s+poco|em\s+desespero\s+total)\b/i, reason: 'Esgotamento emocional extremo' },
  { pattern: /\b(?:sou\s+um\s+(?:fardo|peso|estorvo)|estariam\s+melhor\s+sem\s+mim|minha\s+vida\s+nao\s+(?:vale\s+nada|tem\s+sentido))\b/i, reason: 'Sensação profunda de desvalia existencial' },
  { pattern: /\b(?:suicid[ií]o|me\s+matar|cortar\s+os\s+pulsos|enforcamento|overdose)\b/i, reason: 'Termos diretos de risco à integridade' },
];

const OFFENSIVE_PATTERNS = [
  { pattern: /\b(?:pessim[ao]|p[eé]ssim[ao]|horr[ií]vel|de\s+merda|lixo)\s+(?:m[aã]e|pai|esposa|marido|mulher)\b/i, reason: 'Depreciação agressiva ou shaming parental/conjugal' },
  { pattern: /\b(?:m[aã]e|pai|esposa|marido|mulher)\s+(?:pessim[ao]|p[eé]ssim[ao]|horr[ií]vel|de\s+merda|lixo)\b/i, reason: 'Depreciação agressiva ou shaming parental/conjugal' },
  { pattern: /\b(?:cala(?:r)?\s+(?:a\s+|sua\s+)?boca|engol(?:a|e)\s+(?:o\s+)?choro|cala\s+e\s+escuta)\b/i, reason: 'Tom impositivo e mandato de silenciamento' },
  { pattern: /\b(?:estupr[ao]|violencia\s+sexual|abuso\s+sexual|sexo\s+sem\s+consentimento)\b/i, reason: 'Violação grave: violência/abuso sexual' },
  { pattern: /\b(?:sexo|transar)\b.*?\b(?:dormindo|desacordad[ao]|inconsciente|apagad[ao]|dopad[ao])\b/i, reason: 'Ato sexual não consentido' },
  { pattern: /\b(?:dormindo|desacordad[ao]|inconsciente|apagad[ao]|dopad[ao])\b.*?\b(?:sexo|transar)\b/i, reason: 'Ato sexual não consentido' },
  { pattern: /\b(?:manda\s+(?:nudes|foto\s+pelada)|quero\s+te\s+pegar|vou\s+te\s+pegar|muito\s+gostosa)\b/i, reason: 'Assédio sexual e objetificação corporal' },
  { pattern: /\b(?:irresponsavel|negligente|vagabund[ao]|desgracad[ao]|imbecil|idiota)\b/i, reason: 'Ofensa direta ou humilhação' },
];

export function evaluateRegexFallback(text: string): ModerationResult {
  const normalized = normalizeText(text);

  // 1. Checagem de vulnerabilidade extrema (Acolhimento / Risco à vida)
  for (const item of VULNERABILITY_PATTERNS) {
    const match = normalized.match(item.pattern);
    if (match) {
      return {
        isFlagged: true,
        category: 'vulnerabilidade',
        reason: `Alerta de Acolhimento: ${item.reason}`,
        matchedContext: match[0],
        suggestsCrisisSupport: true,
        provider: 'regex-circuit-breaker',
        fallbackApplied: true,
      };
    }
  }

  // 2. Checagem antijulgamento (Mom-shaming, violência, ofensas)
  for (const item of OFFENSIVE_PATTERNS) {
    const match = normalized.match(item.pattern);
    if (match) {
      return {
        isFlagged: true,
        category: 'antijulgamento',
        reason: `Alerta Antijulgamento: ${item.reason}`,
        matchedContext: match[0],
        suggestsCrisisSupport: false,
        provider: 'regex-circuit-breaker',
        fallbackApplied: true,
      };
    }
  }

  return {
    isFlagged: false,
    category: 'livre',
    reason: 'Conteúdo aprovado via circuit breaker de moderação.',
    matchedContext: '',
    suggestsCrisisSupport: false,
    provider: 'regex-circuit-breaker',
    fallbackApplied: true,
  };
}

// ── Embedding: busca vetorial semântica ──────────────────────────────────────
async function getEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  const embeddingModels = ['gemini-embedding-001', 'text-embedding-004'];

  for (const model of embeddingModels) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;
      const res = await fetch(geminiUrl, {
        method: 'POST',
        signal: AbortSignal.timeout(3000),
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
        const err = await res.text();
        console.warn(`[Embedding] Modelo ${model} retornou status ${res.status}:`, err);
        continue;
      }

      const data = await res.json();
      if (data?.embedding?.values) {
        return data.embedding.values;
      }
    } catch (err: unknown) {
      console.warn(`[Embedding] Falha na chamada do modelo ${model}:`, err);
    }
  }

  return null;
}

// ── Caminho A: Busca vetorial (embedding + pgvector) ─────────────────────────
export async function runVectorSearch(text: string, apiKey: string): Promise<ModerationResult | null> {
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
        category: (topMatch.category as ModerationCategory) || 'antijulgamento',
        reason: `Similar a conteúdo banido pela curadoria: "${topMatch.reason}" (${similarityPercent}% similaridade)`,
        matchedContext: topMatch.original_text.slice(0, 120),
        suggestsCrisisSupport: topMatch.category === 'vulnerabilidade',
        matchedByLearningBase: true,
        provider: 'vector',
      };
    }
  } catch (err: unknown) {
    console.warn('[VectorSearch] Aviso na busca vetorial:', err);
  }
  return null;
}

// ── Caminho B: Gemini generateContent (Oficial gemini-1.5-flash) ─────────────
export async function runGeminiModeration(
  text: string,
  apiKey: string,
  modelOverride?: string
): Promise<ModerationResult> {
  const debugErrors: unknown[] = [];

  // 1. Carregar exemplos banidos do banco para enriquecer o prompt em few-shot
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
    } catch (fetchErr: unknown) {
      debugErrors.push({ step: 'few-shot-db', error: String(fetchErr) });
    }
  }

  // 2. Resolução da Lista de Modelos Oficiais Suportados
  const defaultModel = Deno.env.get('GEMINI_MODEL')?.trim() || 'gemini-1.5-flash';
  const candidateModels = [
    modelOverride || defaultModel,
    ...(modelOverride !== 'gemini-1.5-flash' && defaultModel !== 'gemini-1.5-flash' ? ['gemini-1.5-flash'] : []),
    'gemini-1.5-flash-8b',
    'gemini-2.0-flash'
  ];
  const models = Array.from(new Set(candidateModels));

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
            responseMimeType: 'application/json',
            response_mime_type: 'application/json',
            temperature: 0.1,
            maxOutputTokens: 1024
          }
        })
      });

      if (!geminiResponse.ok) {
        const errText = await geminiResponse.text();
        console.error(
          `[Gemini Moderation] Erro na API Google Gemini (${geminiResponse.status} ${geminiResponse.statusText}) no modelo "${model}":`,
          errText
        );
        debugErrors.push({
          model,
          status: geminiResponse.status,
          statusText: geminiResponse.statusText,
          payload: errText.slice(0, 500)
        });
        continue;
      }

      const data = await geminiResponse.json();
      const candidate = data?.candidates?.[0];
      const finishReason = candidate?.finishReason;
      const blockReason = data?.promptFeedback?.blockReason;

      // Se o filtro nativo da Google bloqueou o conteúdo
      if (
        blockReason ||
        finishReason === 'SAFETY' ||
        finishReason === 'PROHIBITED_CONTENT' ||
        data?.promptFeedback?.safetyRatings?.some((r: any) => r.blocked)
      ) {
        return {
          isFlagged: true,
          category: 'antijulgamento',
          reason: 'Conteúdo bloqueado por filtros de segurança da IA (linguagem explícita ou imprópria).',
          matchedContext: text.trim().slice(0, 100),
          suggestsCrisisSupport: false,
          provider: 'gemini'
        };
      }

      const parts = candidate?.content?.parts || [];
      const nonThoughtPart = parts.find((p: any) => !p.thought && p.text) || parts[parts.length - 1];
      const candidateText = nonThoughtPart?.text;

      if (candidateText) {
        try {
          const parsed = JSON.parse(candidateText.trim());
          return {
            isFlagged: Boolean(parsed.isFlagged),
            category: (parsed.category as ModerationCategory) || 'livre',
            reason: String(parsed.reason || ''),
            matchedContext: String(parsed.matchedContext || ''),
            suggestsCrisisSupport: Boolean(parsed.suggestsCrisisSupport),
            provider: 'gemini'
          };
        } catch (jsonErr: any) {
          console.error(
            `[Gemini Moderation] Falha no parse JSON retornado pelo modelo "${model}":`,
            jsonErr?.message,
            candidateText
          );
          debugErrors.push({
            model,
            step: 'json-parse',
            error: jsonErr?.message,
            rawText: candidateText.slice(0, 200)
          });
        }
      }
    } catch (e: any) {
      console.error(`[Gemini Moderation] Exceção de rede ao requisitar modelo "${model}":`, e?.message || e);
      debugErrors.push({ model, step: 'fetch', error: e?.message || String(e), name: e?.name });
    }
  }

  // Falha em todos os modelos Gemini disponíveis
  return {
    _debug: true,
    _errors: debugErrors,
    isFlagged: false,
    category: 'livre',
    reason: 'Modelos de IA indisponíveis.',
    matchedContext: '',
    suggestsCrisisSupport: false,
  };
}

// ── Handler Principal da Edge Function ──────────────────────────────────────
export async function handleRequest(req: Request): Promise<Response> {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Validação estrita de método
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'METHOD_NOT_ALLOWED', message: 'Apenas requisições POST são aceitas.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'moderate';
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    // Validador de autorização de administrador
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
    // AÇÃO 2: Resolver denúncias e aprovar conteúdo
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
        await supabase
          .from('community_reports')
          .delete()
          .eq('content_id', contentId);

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
    // AÇÃO 3: Moderação de Mensagem
    // ──────────────────────────────────────────────────────────────────────────
    const text = body.text;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return new Response(
        JSON.stringify({ isFlagged: false, category: 'livre', reason: 'Texto vazio' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Se a chave Gemini não estiver configurada, acionar imediatamente o Circuit Breaker
    if (!apiKey) {
      console.warn('[Gemini Moderation] GEMINI_API_KEY ausente. Ativando fallback de emergência por Regex (Circuit Breaker).');
      const fallbackResult = evaluateRegexFallback(text.trim());
      return new Response(
        JSON.stringify({
          ...fallbackResult,
          fallbackRequired: true,
          notice: 'GEMINI_API_KEY_NOT_CONFIGURED',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Executar Gemini e Busca Vetorial em paralelo
    const [geminiResult, vectorResult] = await Promise.allSettled([
      runGeminiModeration(text.trim(), apiKey),
      runVectorSearch(text.trim(), apiKey)
    ]);

    // Prioridade 1: Match por pgvector em exemplo banido pela curadoria humana
    if (vectorResult.status === 'fulfilled' && vectorResult.value?.isFlagged) {
      return new Response(
        JSON.stringify(vectorResult.value),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prioridade 2: Gemini classificou com sucesso
    if (geminiResult.status === 'fulfilled' && geminiResult.value && !geminiResult.value._debug) {
      const parsed = geminiResult.value;
      return new Response(
        JSON.stringify({
          isFlagged: !!parsed.isFlagged,
          category: parsed.category || 'livre',
          reason: parsed.reason || '',
          matchedContext: parsed.matchedContext || '',
          suggestsCrisisSupport: !!parsed.suggestsCrisisSupport,
          provider: 'gemini'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prioridade 3: Circuit Breaker de Emergência (Fallback por Regex no Servidor)
    console.warn('[Gemini Moderation] Ativando fallback de emergência por Regex (Circuit Breaker) devido à indisponibilidade da IA.');
    const regexResult = evaluateRegexFallback(text.trim());
    const allErrors = [
      ...(geminiResult.status === 'fulfilled' ? geminiResult.value?._errors || [] : [{ error: String((geminiResult as any).reason) }]),
      ...(vectorResult.status === 'rejected' ? [{ vectorError: String((vectorResult as any).reason) }] : [])
    ];

    return new Response(
      JSON.stringify({
        ...regexResult,
        provider: 'regex-circuit-breaker',
        fallbackApplied: true,
        debugErrors: allErrors
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[Gemini Moderation] Erro crítico não tratado na Edge Function moderate-content:', err);
    const textFallback = typeof (await req.clone().json().catch(() => ({})))?.text === 'string'
      ? (await req.clone().json().catch(() => ({}))).text
      : '';
    const safeRegexResult = evaluateRegexFallback(textFallback || '');

    return new Response(
      JSON.stringify({
        ...safeRegexResult,
        provider: 'regex-circuit-breaker',
        fallbackApplied: true,
        error: err?.message || 'INTERNAL_ERROR',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// ── Inicialização do Servidor Deno ──────────────────────────────────────────
// Se não estiver em ambiente de teste automatizado, inicia o servidor normalmente
if (typeof Deno !== 'undefined' && typeof Deno.serve === 'function') {
  if (!Deno.env.get('DENO_TESTING')) {
    Deno.serve(handleRequest);
  }
}
