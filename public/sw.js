const CACHE_NAME = 'elana-v6';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Never intercept non-GET requests (POST, PUT, DELETE, PATCH, etc.)
  // The Cache API strictly throws: TypeError: Request method 'POST' is not supported
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  
  // 🛡️ SEGURANÇA & PRIVACIDADE: Nunca armazenar em cache respostas autenticadas de API (Supabase)
  if (url.origin.includes('supabase.co')) {
    return; // Passa direto para a rede nativa do navegador
  }

  // 🌐 SPA Navigation: App Shell Fallback para rotas internas (/comunidade, /aula, /quiz, etc.)
  // Quando offline, entrega /index.html já cacheado para o React inicializar sem tela de erro do navegador
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/index.html', clonedResponse);
            }).catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          const cachedIndex = await caches.match('/index.html');
          if (cachedIndex) {
            return cachedIndex;
          }
          return caches.match('/');
        })
    );
    return;
  }
  
  // Cache-first for static assets
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/i) ||
    url.pathname.match(/\.(woff|woff2|ttf|otf|eot)$/i)
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clonedResponse);
            }).catch(() => {});
          }
          return response;
        });
      })
    );
    return;
  }
  
  // Default to network-first for other requests
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// 🔔 Push Notification Event Listener
self.addEventListener('push', (event) => {
  let data = {
    title: 'Elana Academy',
    body: 'Você tem uma nova mensagem de acolhimento.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    url: '/'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 🔔 Push Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já houver uma aba aberta, foca nela
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if (targetUrl && client.navigate) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Se não, abre uma nova janela
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
