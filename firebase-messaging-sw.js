/* Calendário MGC — firebase-messaging-sw.js (gerado automaticamente) */
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA-r8HZMSpVlMpGhFAv55uw_yfvXtohu18",
  authDomain: "calendario-mgc-web.firebaseapp.com",
  projectId: "calendario-mgc-web",
  messagingSenderId: "714535524539",
  appId: "1:714535524539:web:73b36ac142779746e6319e"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const notif = payload.notification || {};
  const data  = payload.data || {};
  const title = notif.title || data.title || '🔔 Calendário MGC';
  const body  = notif.body  || data.body  || 'Você tem um compromisso.';
  self.registration.showNotification(title, {
    body, icon: './icon-192.png', badge: './icon-192.png',
    tag: data.key || 'cal-mgc', requireInteraction: true,
    vibrate: [200,100,200], data,
    actions:[{action:'open',title:'📅 Abrir'},{action:'snooze30',title:'⏰ +30 min'}]
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const data = event.notification.data || {};
  if(event.action==='snooze30'){
    self.clients.matchAll({type:'window'}).then(cs=>cs.forEach(c=>c.postMessage({type:'FCM_SNOOZE',key:data.key,mins:30})));
    return;
  }
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
    for(const c of cs){if(c.url.includes('calendario_marlon')&&'focus' in c)return c.focus();}
    return self.clients.openWindow('./calendario_marlon.html');
  }));
});
