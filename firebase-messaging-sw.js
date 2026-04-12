/* ═══════════════════════════════════════════════════════
   Calendário MGC — Firebase Messaging Service Worker
   Lida com notificações push em segundo plano / app fechado
═══════════════════════════════════════════════════════ */

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase config — será substituído pelo usuário
// Estas variáveis são preenchidas dinamicamente pelo calendário
// via postMessage após inicialização
let messaging = null;
let firebaseConfig = null;

// Recebe config do app principal
self.addEventListener('message', event => {
  if (event.data?.type === 'FIREBASE_CONFIG') {
    firebaseConfig = event.data.config;
    initFirebase();
  }
});

function initFirebase() {
  if (!firebaseConfig || messaging) return;
  try {
    const app = firebase.initializeApp(firebaseConfig);
    messaging = firebase.messaging(app);

    // Handle background messages (app fechado ou minimizado)
    messaging.onBackgroundMessage(payload => {
      console.log('[FCM SW] Mensagem recebida em background:', payload);

      const { title, body, icon, tag, data } = payload.notification || {};
      const notifData = payload.data || {};

      self.registration.showNotification(title || '🔔 Calendário MGC', {
        body: body || 'Você tem um compromisso agora.',
        icon: './icon-192.png',
        badge: './icon-192.png',
        tag: tag || notifData.key || 'cal-mgc-alert',
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
        data: notifData,
        actions: [
          { action: 'open',     title: '📅 Abrir'    },
          { action: 'snooze30', title: '⏰ +30 min'  },
        ]
      });
    });

    console.log('[FCM SW] Firebase Messaging inicializado');
  } catch (err) {
    console.error('[FCM SW] Erro ao inicializar Firebase:', err);
  }
}

// Clique na notificação
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const data = event.notification.data || {};

  if (event.action === 'snooze30') {
    // Sinaliza para o app principal fazer o snooze
    self.clients.matchAll({ type: 'window' }).then(cs => {
      cs.forEach(c => c.postMessage({ type: 'FCM_SNOOZE', key: data.key, mins: 30 }));
    });
    return;
  }

  // Abre ou foca o app
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      for (const c of cs) {
        if (c.url.includes('calendario_marlon') && 'focus' in c) return c.focus();
      }
      return self.clients.openWindow('./calendario_marlon.html');
    })
  );
});
