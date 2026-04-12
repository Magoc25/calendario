/* ═══════════════════════════════════════════════════════
   Calendário MGC — Firebase Messaging Service Worker
   v2.1 — config lida do IndexedDB (funciona com app fechado)
═══════════════════════════════════════════════════════ */

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const DB_NAME = 'cal-mgc-fcm';
const STORE   = 'config';

// ── Ler config do IndexedDB ────────────────────────────
function readConfig() {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = e => {
        e.target.result.createObjectStore(STORE, { keyPath: 'k' });
      };
      req.onsuccess = e => {
        const db = e.target.result;
        const tx = db.transaction(STORE, 'readonly');
        const get = tx.objectStore(STORE).get('firebase_config');
        get.onsuccess = () => resolve(get.result?.v || null);
        get.onerror   = () => resolve(null);
      };
      req.onerror = () => resolve(null);
    } catch(e) { resolve(null); }
  });
}

// ── Salvar config no IndexedDB ─────────────────────────
function saveConfig(cfg) {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = e => {
        e.target.result.createObjectStore(STORE, { keyPath: 'k' });
      };
      req.onsuccess = e => {
        const db = e.target.result;
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put({ k: 'firebase_config', v: cfg });
        tx.oncomplete = () => resolve(true);
        tx.onerror    = () => resolve(false);
      };
      req.onerror = () => resolve(false);
    } catch(e) { resolve(false); }
  });
}

// ── Inicializar Firebase ───────────────────────────────
let messaging = null;
let initialized = false;

async function initFirebase() {
  if (initialized) return !!messaging;
  const cfg = await readConfig();
  if (!cfg) {
    console.warn('[FCM SW] Sem config no IndexedDB');
    return false;
  }
  try {
    let app;
    try { app = firebase.app(); }
    catch(e) { app = firebase.initializeApp(cfg); }
    messaging = firebase.messaging(app);
    initialized = true;
    console.log('[FCM SW] Firebase inicializado com sucesso');

    // Handler para mensagens em background (app fechado/minimizado)
    messaging.onBackgroundMessage(payload => {
      console.log('[FCM SW] Mensagem background recebida:', payload);
      const { title, body } = payload.notification || {};
      const data = payload.data || {};
      self.registration.showNotification(title || '🔔 Calendário MGC', {
        body: body || 'Você tem um compromisso.',
        icon: './icon-192.png',
        badge: './icon-192.png',
        tag: data.key || 'cal-mgc-alert',
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data,
        actions: [
          { action: 'open',     title: '📅 Abrir'   },
          { action: 'snooze30', title: '⏰ +30 min' },
        ]
      });
    });

    return true;
  } catch(err) {
    console.error('[FCM SW] Erro ao inicializar:', err);
    return false;
  }
}

// ── Install / Activate ─────────────────────────────────
self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', e  => e.waitUntil(clients.claim()));

// ── Push event (chegada do push do servidor FCM) ───────
self.addEventListener('push', async event => {
  console.log('[FCM SW] Push recebido!', event.data?.text());
  event.waitUntil((async () => {
    const ok = await initFirebase();
    // Se Firebase não inicializou, mostra notificação manual
    if (!ok) {
      let title = '🔔 Calendário MGC';
      let body  = 'Você tem um compromisso.';
      try {
        const payload = event.data?.json();
        title = payload?.notification?.title || title;
        body  = payload?.notification?.body  || body;
      } catch(e) {}
      await self.registration.showNotification(title, {
        body, icon: './icon-192.png', badge: './icon-192.png',
        requireInteraction: true, vibrate: [200, 100, 200],
      });
    }
    // Se Firebase inicializou, o onBackgroundMessage já cuida
  })());
});

// ── Mensagens do app principal ─────────────────────────
self.addEventListener('message', async event => {
  const { type, data } = event.data || {};

  if (type === 'FIREBASE_CONFIG') {
    // Salva config no IndexedDB para persistir entre sessões
    await saveConfig(data);
    initialized = false; // força reinicialização com nova config
    messaging = null;
    await initFirebase();
    console.log('[FCM SW] Config salva e Firebase reinicializado');
  }

  if (type === 'PING') {
    event.source?.postMessage({ type: 'PONG' });
  }
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

// Inicializar ao carregar o SW
initFirebase();
