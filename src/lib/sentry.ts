import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || 'https://6a3b7eb05f2d6bbdf9557b0cbf79563b@o4512137236643840.ingest.us.sentry.io/4512137240576000';

export function initSentry() {
  if (!SENTRY_DSN) {
    if (import.meta.env.DEV) {
      console.info('[Sentry] VITE_SENTRY_DSN não configurado. Monitoramento em modo desativado.');
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: 'elana-academy@1.0.0',
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    // Tracing sample rate (10% em produção para economia de cota)
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    // LGPD & Privacidade: sanitiza requisições antes de enviar
    beforeSend(event, hint) {
      // Ignora erros comuns de cancelamento de requisição ou extensões de terceiros
      const error = hint?.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const msg = String((error as any).message).toLowerCase();
        if (
          msg.includes('aborterror') ||
          msg.includes('network request failed') ||
          msg.includes('resizeobserver loop') ||
          msg.includes('chrome-extension://')
        ) {
          return null;
        }
      }

      // LGPD: remover IP e dados confidenciais
      if (event.user) {
        delete (event.user as any).ip_address;
      }
      if (event.request?.headers) {
        delete (event.request.headers as any)['Authorization'];
      }
      if (event.request?.url) {
        try {
          const url = new URL(event.request.url);
          url.searchParams.delete('token');
          url.searchParams.delete('code');
          url.searchParams.delete('access_token');
          event.request.url = url.toString();
        } catch {
          // Ignora parsing se URL for caminho relativo
        }
      }

      return event;
    },
  });
}

export function captureException(error: unknown, context?: Record<string, any>) {
  if (SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  } else if (import.meta.env.DEV) {
    console.error('[Sentry Local Fallback]', error, context);
  }
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  }
}

export function setSentryUser(user: { id: string; email?: string; role?: string } | null) {
  if (!SENTRY_DSN) return;
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      segment: user.role || 'aluno',
    });
  } else {
    Sentry.setUser(null);
  }
}
