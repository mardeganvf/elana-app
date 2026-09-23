// Configura flag de ambiente para testes do Deno antes de importar a função
Deno.env.set('DENO_TESTING', 'true');

import { assertEquals, assertExists } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import {
  handleRequest,
  evaluateRegexFallback,
  corsHeaders,
  type ModerationResult
} from './index.ts';

// ── TESTE 1: Classificação de Conteúdo Seguro (Livre) ───────────────────────
Deno.test('moderate-content: deve aprovar conteúdo seguro e acolhedor (livre)', async () => {
  const safeText = 'Hoje nosso bebê dormiu a noite toda pela primeira vez! Estamos radiantes e descansados.';
  
  // 1. Validação direta via Circuit Breaker / Regex
  const localResult = evaluateRegexFallback(safeText);
  assertEquals(localResult.isFlagged, false);
  assertEquals(localResult.category, 'livre');
  assertEquals(localResult.suggestsCrisisSupport, false);

  // 2. Validação simulando requisição HTTP via handleRequest com mock do Gemini
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes('generateContent')) {
        return new Response(JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      isFlagged: false,
                      category: 'livre',
                      reason: 'Relato positivo de rotina parental sem violações.',
                      matchedContext: '',
                      suggestsCrisisSupport: false
                    })
                  }
                ]
              }
            }
          ]
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response('{}', { status: 200 });
    };

    Deno.env.set('GEMINI_API_KEY', 'test-fake-key');

    const req = new Request('http://localhost:8000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: safeText })
    });

    const res = await handleRequest(req);
    assertEquals(res.status, 200);

    const body: ModerationResult = await res.json();
    assertEquals(body.isFlagged, false);
    assertEquals(body.category, 'livre');
    assertEquals(body.suggestsCrisisSupport, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ── TESTE 2: Detecção de Vulnerabilidade e Risco à Vida (Crise) ──────────────
Deno.test('moderate-content: deve sinalizar ideação de desaparecimento ou sofrimento extremo (vulnerabilidade)', async () => {
  const crisisText = 'Não estou aguentando mais essa pressão, cheguei ao meu limite e quero sumir para sempre.';

  // 1. Validação direta via Circuit Breaker / Regex
  const localResult = evaluateRegexFallback(crisisText);
  assertEquals(localResult.isFlagged, true);
  assertEquals(localResult.category, 'vulnerabilidade');
  assertEquals(localResult.suggestsCrisisSupport, true);
  assertExists(localResult.matchedContext);

  // 2. Validação via handleRequest com IA Gemini
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes('generateContent')) {
        return new Response(JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      isFlagged: true,
                      category: 'vulnerabilidade',
                      reason: 'Sinais de esgotamento extremo e ideação de desaparecimento.',
                      matchedContext: 'quero sumir para sempre',
                      suggestsCrisisSupport: true
                    })
                  }
                ]
              }
            }
          ]
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response('{}', { status: 200 });
    };

    Deno.env.set('GEMINI_API_KEY', 'test-fake-key');

    const req = new Request('http://localhost:8000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: crisisText })
    });

    const res = await handleRequest(req);
    assertEquals(res.status, 200);

    const body: ModerationResult = await res.json();
    assertEquals(body.isFlagged, true);
    assertEquals(body.category, 'vulnerabilidade');
    assertEquals(body.suggestsCrisisSupport, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ── TESTE 3: Detecção de Violação Antijulgamento (Mom-Shaming / Ofensa) ───────
Deno.test('moderate-content: deve sinalizar mom-shaming e hostilidade (antijulgamento)', async () => {
  const shamingText = 'Você é uma péssima mãe negligente e de merda, coitado do seu filho!';

  // 1. Validação direta via Circuit Breaker / Regex
  const localResult = evaluateRegexFallback(shamingText);
  assertEquals(localResult.isFlagged, true);
  assertEquals(localResult.category, 'antijulgamento');
  assertEquals(localResult.suggestsCrisisSupport, false);

  // 2. Validação via handleRequest
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes('generateContent')) {
        return new Response(JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      isFlagged: true,
                      category: 'antijulgamento',
                      reason: 'Ataque verbal destrutivo e mom-shaming agressivo.',
                      matchedContext: 'péssima mãe negligente',
                      suggestsCrisisSupport: false
                    })
                  }
                ]
              }
            }
          ]
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response('{}', { status: 200 });
    };

    Deno.env.set('GEMINI_API_KEY', 'test-fake-key');

    const req = new Request('http://localhost:8000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: shamingText })
    });

    const res = await handleRequest(req);
    assertEquals(res.status, 200);

    const body: ModerationResult = await res.json();
    assertEquals(body.isFlagged, true);
    assertEquals(body.category, 'antijulgamento');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ── TESTE 4: Fallback de Emergência em Caso de Falha de API (Circuit Breaker) ─
Deno.test('moderate-content: deve acionar circuit breaker de regex quando a API Google Gemini falhar (HTTP 500/404)', async () => {
  const originalFetch = globalThis.fetch;
  try {
    // Simula erro 404/500 da API Google
    globalThis.fetch = async () => {
      return new Response(JSON.stringify({
        error: { code: 500, message: 'Google Gemini Service Temporarily Unavailable' }
      }), { status: 500, statusText: 'Internal Server Error' });
    };

    Deno.env.set('GEMINI_API_KEY', 'test-fake-key');

    // Mensagem com ofensa evidente que o circuit breaker precisa capturar mesmo com a IA fora do ar
    const offensiveText = 'Cala a boca, você é obrigada a fazer o que eu mando!';
    const req = new Request('http://localhost:8000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: offensiveText })
    });

    const res = await handleRequest(req);
    assertEquals(res.status, 200);

    const body: ModerationResult = await res.json();
    // Confirma que o fallback foi ativado e interceptou com sucesso a ofensa
    assertEquals(body.fallbackApplied, true);
    assertEquals(body.provider, 'regex-circuit-breaker');
    assertEquals(body.isFlagged, true);
    assertEquals(body.category, 'antijulgamento');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ── TESTE 5: Validação de Métodos HTTP e Preflight CORS ──────────────────────
Deno.test('moderate-content: deve aceitar OPTIONS preflight e rejeitar métodos não-POST com HTTP 405', async () => {
  // Preflight OPTIONS
  const optionsReq = new Request('http://localhost:8000', {
    method: 'OPTIONS',
    headers: { Origin: 'https://elana.academy' }
  });
  const optionsRes = await handleRequest(optionsReq);
  assertEquals(optionsRes.status, 200);
  assertEquals(optionsRes.headers.get('Access-Control-Allow-Origin'), '*');
  assertEquals(optionsRes.headers.get('Access-Control-Allow-Methods'), corsHeaders['Access-Control-Allow-Methods']);

  // GET não permitido (405)
  const getReq = new Request('http://localhost:8000', {
    method: 'GET'
  });
  const getRes = await handleRequest(getReq);
  assertEquals(getRes.status, 405);
  const getBody = await getRes.json();
  assertEquals(getBody.error, 'METHOD_NOT_ALLOWED');
});

// ── TESTE 6: Validação de Payload Vazio ──────────────────────────────────────
Deno.test('moderate-content: deve tratar payloads vazios com status livre sem erros', async () => {
  const req = new Request('http://localhost:8000', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: '   ' })
  });

  const res = await handleRequest(req);
  assertEquals(res.status, 200);

  const body: ModerationResult = await res.json();
  assertEquals(body.isFlagged, false);
  assertEquals(body.category, 'livre');
});

// ── TESTE 7: Sanitização de Resposta com Markdown Fences (```json) ───────────
Deno.test('moderate-content: deve parsear com sucesso JSON retornado com markdown fences', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes('generateContent')) {
        return new Response(JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: '```json\n{\n  "isFlagged": false,\n  "category": "livre",\n  "reason": "Dúvida comum de amamentação",\n  "matchedContext": "",\n  "suggestsCrisisSupport": false\n}\n```'
                  }
                ]
              }
            }
          ]
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response('{}', { status: 200 });
    };

    Deno.env.set('GEMINI_API_KEY', 'test-fake-key');

    const req = new Request('http://localhost:8000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Como aliviar a apojadura nos primeiros dias?' })
    });

    const res = await handleRequest(req);
    assertEquals(res.status, 200);

    const body: ModerationResult = await res.json();
    assertEquals(body.isFlagged, false);
    assertEquals(body.category, 'livre');
    assertEquals(body.provider, 'gemini');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ── TESTE 8: Detecção de Risco Pediátrico e Violência Infantil ───────────────
Deno.test('moderate-content: circuit breaker deve sinalizar risco de botulismo por ingestão de mel em bebês', async () => {
  const pediatricRiskText = 'Minha avó disse para dar mel pro bebê de 2 meses para acalmar a tosse.';
  const localResult = evaluateRegexFallback(pediatricRiskText);
  assertEquals(localResult.isFlagged, true);
  assertEquals(localResult.category, 'antijulgamento');
  assertExists(localResult.matchedContext);
});

Deno.test('moderate-content: circuit breaker deve sinalizar agressão física contra bebê', async () => {
  const infantViolenceText = 'Perdi o controle e dei um soco no bebê.';
  const localResult = evaluateRegexFallback(infantViolenceText);
  assertEquals(localResult.isFlagged, true);
  assertEquals(localResult.category, 'antijulgamento');
  assertExists(localResult.matchedContext);
});

