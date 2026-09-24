/**
 * 🏷️ Utilitário de Atribuição e Rastreamento de Marketing (Elana)
 * 
 * Captura, armazena e injeta parâmetros de campanhas (UTMs e Click IDs)
 * nas URLs de conversão/checkout do Stripe para permitir mensuração de ROI/ROAS
 * no Meta Ads, Google Ads e TikTok Ads.
 */

// Lista de parâmetros reconhecidos para atribuição de tráfego pago e orgânico
export const TRACKED_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',      // Meta / Facebook Click Identifier
  'gclid',       // Google Ads Click Identifier
  'ttclid',      // TikTok Click Identifier
  'src',         // Origem personalizada de links
  'sck',         // Sub-campanha / Afiliados
] as const;

export type TrackedParamKey = (typeof TRACKED_PARAMS)[number];

const SESSION_STORAGE_KEY = 'elana_tracking_params';
const LOCAL_STORAGE_KEY = 'elana_tracking_params_v1';
const ATTRIBUTION_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias de janela de atribuição

interface StoredTrackingData {
  params: Record<string, string>;
  capturedAt: number;
}

/**
 * Captura parâmetros de rastreamento da URL atual e persiste na sessão/localStorage.
 * Deve ser chamado na inicialização do aplicativo (App.tsx).
 */
export const captureTrackingParams = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const newParams: Record<string, string> = {};

    TRACKED_PARAMS.forEach((key) => {
      const value = urlParams.get(key);
      if (value && value.trim()) {
        newParams[key] = value.trim();
      }
    });

    // Se novos parâmetros foram encontrados nesta visita, salvar
    if (Object.keys(newParams).length > 0) {
      // 1. Session Storage (Last-touch da sessão atual)
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newParams));

      // 2. Local Storage (Persistente por até 30 dias para retorno)
      const storagePayload: StoredTrackingData = {
        params: newParams,
        capturedAt: Date.now()
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storagePayload));

      return newParams;
    }
  } catch (err) {
    console.warn('[Tracking] Falha ao capturar parâmetros de URL:', err);
  }

  return getStoredTrackingParams();
};

/**
 * Recupera os parâmetros de rastreamento armazenados (SessionStorage > LocalStorage > URL atual).
 */
export const getStoredTrackingParams = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};

  try {
    // 1. Prioridade: Parâmetros da sessão atual
    const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }

    // 2. Fallback: Parâmetros persistentes do LocalStorage (se dentro dos 30 dias)
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localData) {
      const parsed: StoredTrackingData = JSON.parse(localData);
      if (parsed && parsed.params && parsed.capturedAt) {
        const isFresh = Date.now() - parsed.capturedAt < ATTRIBUTION_WINDOW_MS;
        if (isFresh) {
          return parsed.params;
        } else {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    }

    // 3. Fallback: Ler direto da URL atual se ainda presentes
    const urlParams = new URLSearchParams(window.location.search);
    const fallbackParams: Record<string, string> = {};
    TRACKED_PARAMS.forEach((key) => {
      const val = urlParams.get(key);
      if (val) fallbackParams[key] = val.trim();
    });
    return fallbackParams;
  } catch {
    return {};
  }
};

/**
 * Constrói a URL final de checkout do Stripe enriquecida com:
 * 1. Dados do usuário (prefilled_email, client_reference_id)
 * 2. Parâmetros de marketing (UTMs, fbclid, gclid, etc.)
 */
export const buildCheckoutUrl = (
  baseUrl: string,
  user?: { id?: string; email?: string } | null
): string => {
  if (!baseUrl) return '';

  try {
    const url = new URL(baseUrl);

    // 1. Dados de usuário para identificação no Stripe e webhook
    if (user?.email) {
      url.searchParams.set('prefilled_email', user.email);
    }
    if (user?.id) {
      url.searchParams.set('client_reference_id', user.id);
    }

    // 2. Injeção de parâmetros de rastreamento / UTMs
    const tracking = getStoredTrackingParams();
    Object.entries(tracking).forEach(([key, value]) => {
      // Não sobrescreve se a baseUrl já tiver configurado explicitamente
      if (!url.searchParams.has(key) && value) {
        url.searchParams.set(key, value);
      }
    });

    return url.toString();
  } catch (err) {
    console.warn('[Tracking] Erro ao construir URL de checkout:', err);
    return baseUrl;
  }
};
