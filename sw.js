/* ═══════════════════════════════════════════════════════
   Rumo (antes "Calendário MGC") — Service Worker v2.7.0
   Responsável por:
   1. Cache offline (arquivos do app)
   2. Notificações de alertas em segundo plano
   3. Periodic Background Sync (Android Chrome)
═══════════════════════════════════════════════════════ */

const CACHE_NAME = 'cal-mgc-v213';
const DB_NAME = 'cal-mgc-sw';
const DB_VERSION = 1;
const STORE_ALERTS = 'pending_alerts';
const STORE_FIRED  = 'fired_alerts';

// Ícones de categoria — populados pelo app via postMessage (STORE_ALERTS)
// Fallback hardcoded caso o SW dispare antes do app enviar os ícones
let catIcons = { 'Aula':'📚','Reunião':'👥','Rotina':'🔄','Pessoal':'👤','CPA':'📋' };

// Throttle para checkAndFireAlerts via fetch (evita checar a cada request)
let _lastFetchCheck = 0;
const FETCH_CHECK_INTERVAL = 30000; // 30s

// ── Install ────────────────────────────────────────────
// Sem skipWaiting automático: o SW novo fica em "waiting" até o app mandar
// SKIP_WAITING (botão Atualizar). Ativar no meio de uma sessão apagava o cache
// antigo enquanto a página velha ainda o usava — janela de estados quebrados
// no reload (suspeito do travamento no Safari/macOS durante updates).
self.addEventListener('install', event => {});

// ── Activate: limpa caches antigos e assume controle ───
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

// ── Fetch: serve from cache when offline + check alerts ──
self.addEventListener('fetch', event => {
  // Every fetch wakes the SW — throttle alert check to once per 30s
  const now = Date.now();
  if (now - _lastFetchCheck >= FETCH_CHECK_INTERVAL) {
    _lastFetchCheck = now;
    checkAndFireAlerts('fetch').catch(()=>{});
  }

  // Only cache same-origin GET requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (event.request.url.includes('calendario-mgc.html') ||
            event.request.url.includes('manifest.json') ||
            event.request.url.includes('icon-')) {
          const clone = response.clone();
          // waitUntil: sem ele o SW podia ser encerrado antes do put concluir
          event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone)));
        }
        return response;
      }).catch(() => cached || new Response('Offline', { status: 503 }));
    })
  );
});

// ── Periodic Background Sync ───────────────────────────
// Fires periodically on Android Chrome even when app is closed
self.addEventListener('periodicsync', event => {
  if (event.tag === 'cal-mgc-alerts') {
    event.waitUntil(checkAndFireAlerts('periodicsync'));
  }
});

// ── Messages from main thread ──────────────────────────
self.addEventListener('message', async event => {
  const { type, data } = event.data || {};

  if (type === 'SKIP_WAITING') {
    // App pediu p/ aplicar a atualização (botão Atualizar) — ativa o SW novo;
    // a página escuta controllerchange e recarrega uma única vez.
    self.skipWaiting();
    return;
  }

  if (type === 'GET_VERSION') {
    // Handshake do banner de update: a página pergunta a versão a um worker
    // específico (ativo E em waiting) p/ só oferecer o update quando o waiting
    // for realmente mais novo — o Safari ressuscita um waiting idêntico ao
    // ativo a cada abertura fria, e sem isto o banner voltava sempre.
    event.source?.postMessage({ type: 'SW_VERSION', cache: CACHE_NAME, tag: data?.tag });
    return;
  }

  if (type === 'STORE_ALERTS') {
    // Main thread sends upcoming alerts for SW to monitor
    if (data.catIcons) catIcons = { ...catIcons, ...data.catIcons };
    await storeAlerts(data.alerts);
    _swScheduleTimers(data.alerts); // agenda timers internos para manter SW ativo
    await checkAndFireAlerts('message');
  }

  if (type === 'CLEAR_FIRED') {
    await clearFiredForDate(data.date);
  }

  if (type === 'MARK_FIRED') {
    if (data?.key) { await markFired(data.key); await removeAlert(data.key); }
  }

  if (type === 'CLEAR_FIRED_EVENT') {
    // Limpa entradas de STORE_FIRED e STORE_ALERTS cujo evId bate com o evento editado
    if (data?.evId) {
      const db = await openDB();
      for (const store of [STORE_FIRED, STORE_ALERTS]) {
        await new Promise((res, rej) => {
          const tx = db.transaction(store, 'readwrite');
          const st = tx.objectStore(store);
          const req = st.getAll();
          req.onsuccess = () => {
            (req.result || []).filter(r => r.key && r.key.startsWith(data.evId + '|')).forEach(r => st.delete(r.key));
            tx.oncomplete = res; tx.onerror = rej;
          };
          req.onerror = rej;
        });
      }
    }
  }

  if (type === 'CLEAR_ALL_ALERTS') {
    const db = await openDB();
    const tx = db.transaction(STORE_ALERTS, 'readwrite');
    tx.objectStore(STORE_ALERTS).clear();
  }

  if (type === 'PING') {
    // App just opened — check for any missed alerts
    await checkAndFireAlerts('ping');
    event.source?.postMessage({ type: 'PONG' });
  }
});

// ── Notification click handler ─────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const data = event.notification.data || {};

  if (event.action === 'open_meet') {
    if (data.meetLink) event.waitUntil(clients.openWindow(data.meetLink));
    return;
  }

  if (event.action === 'snooze30' || event.action === 'snooze60') {
    const mins = event.action === 'snooze30' ? 30 : 60;
    const snoozeAlert = {
      ...data,
      fireAt: Date.now() + mins * 60 * 1000,
      key: data.key + '_snooze_' + Date.now()
    };
    // waitUntil: sem ele o SW podia ser encerrado antes do write no IndexedDB
    // e o snooze se perdia em silêncio
    event.waitUntil(storeAlerts([snoozeAlert]).then(() => _swScheduleTimers([snoozeAlert])));
    return;
  }

  // Default: focus or open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      for (const c of cs) {
        if (c.url.includes('calendario-mgc') && 'focus' in c) return c.focus();
      }
      return clients.openWindow(self.registration.scope + 'calendario-mgc.html');
    })
  );
});

// ══════════════════════════════════════════════════════
// IndexedDB helpers
// ══════════════════════════════════════════════════════

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_ALERTS)) {
        db.createObjectStore(STORE_ALERTS, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_FIRED)) {
        db.createObjectStore(STORE_FIRED, { keyPath: 'key' });
      }
    };
    req.onsuccess  = e => resolve(e.target.result);
    req.onerror    = e => reject(e.target.error);
  });
}

async function storeAlerts(alerts) {
  if (!alerts || !alerts.length) return;
  const db = await openDB();
  const tx = db.transaction(STORE_ALERTS, 'readwrite');
  const store = tx.objectStore(STORE_ALERTS);
  for (const alert of alerts) {
    store.put(alert);
  }
  return new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
}

async function getAllAlerts() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE_ALERTS, 'readonly');
    const req = tx.objectStore(STORE_ALERTS).getAll();
    req.onsuccess = () => res(req.result || []);
    req.onerror   = () => rej(req.error);
  });
}

async function removeAlert(key) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE_ALERTS, 'readwrite');
    tx.objectStore(STORE_ALERTS).delete(key);
    tx.oncomplete = res; tx.onerror = rej;
  });
}

async function isFired(key) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE_FIRED, 'readonly');
    const req = tx.objectStore(STORE_FIRED).get(key);
    req.onsuccess = () => res(!!req.result);
    req.onerror   = () => res(false);
  });
}

async function markFired(key) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE_FIRED, 'readwrite');
    tx.objectStore(STORE_FIRED).put({ key, ts: Date.now() });
    tx.oncomplete = res; tx.onerror = rej;
  });
}

async function clearFiredForDate(date) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE_FIRED, 'readwrite');
    const store = tx.objectStore(STORE_FIRED);
    const req = store.getAll();
    req.onsuccess = () => {
      (req.result || []).filter(r => r.key.includes(date)).forEach(r => store.delete(r.key));
    };
    req.onerror = rej;
    tx.oncomplete = res; tx.onerror = rej; // aguarda a transação (antes era fire-and-forget)
  });
}

// Agenda timers internos no SW para alertas futuros.
// Chrome mantém o SW vivo enquanto houver timers pendentes,
// permitindo notificações mesmo com o app fechado (desde que o Chrome esteja rodando).
// Dedup por key: era chamado a cada checkAndFireAlerts (fetch a cada 30s) e
// acumulava dezenas de timers repetidos para o mesmo alerta.
const _swTimers = new Map(); // key → timeout id
function _swScheduleTimers(alerts) {
  const now = Date.now();
  for (const a of alerts) {
    const delay = a.fireAt - now;
    if (delay > 0 && delay <= 4 * 60 * 60 * 1000 && !_swTimers.has(a.key)) { // até 4h à frente
      const t = setTimeout(() => {
        _swTimers.delete(a.key);
        checkAndFireAlerts('sw-timer').catch(() => {});
      }, delay + 500);
      _swTimers.set(a.key, t);
    }
  }
}

// ══════════════════════════════════════════════════════
// Core: check and fire pending alerts
// ══════════════════════════════════════════════════════
async function checkAndFireAlerts(source) {
  try {
    const now = Date.now();
    const alerts = await getAllAlerts();
    // Atrasado demais (>12h) não dispara — remove ANTES do loop de disparo.
    // (Antes, um alerta de dias atrás ainda notificava ao acordar o SW,
    // porque a limpeza de stale rodava só DEPOIS do disparo.)
    const STALE_MS = 12 * 60 * 60 * 1000;
    const staleNow = alerts.filter(a => a.fireAt && a.fireAt < now - STALE_MS);
    for (const a of staleNow) await removeAlert(a.key);
    const toFire = alerts.filter(a => a.fireAt && a.fireAt <= now + 30000 && a.fireAt >= now - STALE_MS); // within 30s

    for (const alert of toFire) {
      const alreadyFired = await isFired(alert.key);
      if (alreadyFired) {
        await removeAlert(alert.key);
        continue;
      }

      // Show notification (catIcons populado pelo app via STORE_ALERTS)
      const icon = catIcons[alert.category] || '🔔';
      const meetLink = alert.meetLink || '';
      const bodyParts = [];
      if (alert.time) bodyParts.push('às ' + alert.time);
      if (alert.category) bodyParts.push(alert.category);
      if (alert.location) bodyParts.push('📍 ' + alert.location);
      if (meetLink) bodyParts.push('🎥 Meet disponível');

      const actions = meetLink
        ? [{ action: 'open_meet', title: '🎥 Abrir Meet' }, { action: 'snooze30', title: '+30 min' }]
        : [{ action: 'snooze30', title: '+30 min' }, { action: 'snooze60', title: '+1 hora' }];

      await self.registration.showNotification(
        `${icon} ${alert.title}`,
        {
          body: bodyParts.join('  ') || 'Lembrete de evento',
          icon: self.registration.scope + 'icon-192.png',
          badge: self.registration.scope + 'icon-192.png',
          tag: alert.key,
          requireInteraction: true,
          vibrate: [200, 100, 200],
          data: { ...alert, meetLink },
          actions
        }
      );

      await markFired(alert.key);
      await removeAlert(alert.key);

      // Notify main thread if open
      const cs = await clients.matchAll({ type: 'window' });
      for (const c of cs) {
        c.postMessage({ type: 'ALERT_FIRED', key: alert.key });
      }
    }

    // Agenda timers internos para alertas futuros ainda pendentes
    const future = alerts.filter(a => a.fireAt && a.fireAt > now + 30000);
    if (future.length) _swScheduleTimers(future);
    // (limpeza de alertas velhos já feita no topo, antes do disparo)

  } catch (err) {
    console.error('[SW] checkAndFireAlerts error:', err);
  }
}
