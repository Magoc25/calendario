/* ═══════════════════════════════════════════════════════
   Calendário MGC — Firebase Messaging Service Worker v3
   Trata push diretamente sem SDK — mais confiável
═══════════════════════════════════════════════════════ */

self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', e  => e.waitUntil(clients.claim()));

// ── Push event — trata diretamente sem Firebase SDK ───
self.addEventListener('push', event => {
  console.log('[FCM SW] Push recebido!');

  event.waitUntil((async () => {
    let title = '🔔 Calendário MGC';
    let body  = 'Você tem um compromisso agora.';
    let tag   = 'cal-mgc-' + Date.now();
    let notifData = {};

    // Tenta extrair payload do push
    try {
      const text = event.data?.text();
      if (text) {
        const payload = JSON.parse(text);

        // FCM v1 formato
        const notif = payload?.notification || payload?.data?.notification || {};
        const data  = payload?.data || {};

        title = notif.title || data.title || title;
        body  = notif.body  || data.body  || body;
        tag   = data.key    || tag;
        notifData = data;
      }
    } catch(e) {
      console.warn('[FCM SW] Erro ao parsear payload:', e);
    }

    await self.registration.showNotification(title, {
      body,
      icon:               './icon-192.png',
      badge:              './icon-192.png',
      tag,
      requireInteraction: true,
      vibrate:            [200, 100, 200, 100, 200],
      data:               notifData,
      actions: [
        { action: 'open',     title: '📅 Abrir'   },
        { action: 'snooze30', title: '⏰ +30 min' },
      ]
    });
  })());
});

// ── Clique na notificação ──────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const data = event.notification.data || {};

  if (event.action === 'snooze30') {
    self.clients.matchAll({ type: 'window' }).then(cs => {
      cs.forEach(c => c.postMessage({ type: 'FCM_SNOOZE', key: data.key, mins: 30 }));
    });
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      for (const c of cs) {
        if (c.url.includes('calendario_marlon') && 'focus' in c) return c.focus();
      }
      return self.clients.openWindow('./calendario_marlon.html');
    })
  );
});

// ── Mensagens do app ───────────────────────────────────
self.addEventListener('message', event => {
  const { type } = event.data || {};
  if (type === 'PING') event.source?.postMessage({ type: 'PONG' });
});
