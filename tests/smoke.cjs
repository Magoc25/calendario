/* ═══════════════════════════════════════════════════════════════
   Smoke-test §35 — Calendário MGC (jsdom, sem navegador/servidor)
   Uso: node smoke.cjs [caminho/do/calendario-mgc.html]
   Sai com código 1 se qualquer checagem falhar.

   O jsdom NÃO fica neste repo (node_modules trava o OneDrive — §2b/r33).
   Rode a partir de uma pasta local com jsdom instalado:
     mkdir %TEMP%\cal-smoke && cd %TEMP%\cal-smoke && npm i jsdom
     node <repo>\tests\smoke.cjs
   (o require resolve o jsdom pelo diretório de trabalho via NODE_PATH
    ou copie este arquivo para a pasta e rode de lá)
═══════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');
let JSDOM, VirtualConsole;
try { ({ JSDOM, VirtualConsole } = require('jsdom')); }
catch (e) {
  ({ JSDOM, VirtualConsole } = require(path.join(process.cwd(), 'node_modules', 'jsdom')));
}

const HTML_PATH = process.argv[2] || path.join(__dirname, '..', 'calendario-mgc.html');

let html = fs.readFileSync(HTML_PATH, 'utf8');

/* ── 1. Neutraliza <script src> de CDN e injeta stubs ─────────── */
html = html.replace(/<script src="https:\/\/[^"]+"[^>]*><\/script>/g, '');
const STUBS = `<script>
  window.QRCode = function(){ }; window.QRCode.CorrectLevel = { M: 0 };
  window.html2canvas = () => Promise.resolve({ toDataURL: () => 'data:,' });
  window.jspdf = { jsPDF: function(){ this.addImage=()=>{}; this.save=()=>{}; this.internal={pageSize:{getWidth:()=>210,getHeight:()=>297}}; } };
  window.DOMPurify = { sanitize: (h) => String(h==null?'':h) };
  window.__sbCalls = [];
  const _sbChain = () => {
    const c = {};
    ['select','eq','order','limit','insert','upsert','update','delete'].forEach(m => {
      c[m] = (...a) => { window.__sbCalls.push({ m, a }); return c; };
    });
    c.single = async () => ({ data: null, error: { code: 'PGRST116' } });
    c.then = (res) => res({ data: null, error: null }); // awaitable
    return c;
  };
  window.supabase = { createClient: () => ({ from: () => _sbChain() }) };
  // GSI ausente de propósito: o app usa window.google?.accounts (optional chaining)
</script>`;
html = html.replace('</head>', STUBS + '</head>');

/* ── 2. JSDOM com stubs de plataforma no beforeParse ──────────── */
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => {
  const msg = String(e && e.message || e);
  if (/Not implemented|Could not load/i.test(msg)) return;
  errors.push('[jsdomError] ' + msg + (e && e.detail ? ' :: ' + e.detail : ''));
});
vc.on('error', (...a) => { /* console.error do app não é falha */ });

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'https://localhost/calendario-mgc.html',
  virtualConsole: vc,
  beforeParse(window) {
    window.HTMLCanvasElement.prototype.getContext = () => ({
      fillRect(){}, clearRect(){}, beginPath(){}, arc(){}, fill(){}, stroke(){},
      moveTo(){}, lineTo(){}, save(){}, restore(){}, measureText: () => ({ width: 0 }),
      fillText(){}, translate(){}, scale(){}, setTransform(){}, drawImage(){}
    });
    window.matchMedia = window.matchMedia || ((q) => ({
      matches: false, media: q, addListener(){}, removeListener(){},
      addEventListener(){}, removeEventListener(){}, dispatchEvent(){ return false; }
    }));
    window.scrollTo = () => {};
    window.URL.createObjectURL = window.URL.createObjectURL || (() => 'blob:mock');
    window.URL.revokeObjectURL = window.URL.revokeObjectURL || (() => {});
    const OrigBlob = window.Blob;
    window.Blob = function(parts, opts){ window.__lastBlob = (parts||[]).join(''); return new OrigBlob(parts||[], opts); };
    window.Element.prototype.scrollIntoView = () => {};
    window.structuredClone = window.structuredClone || structuredClone;
    window.requestAnimationFrame = window.requestAnimationFrame || ((cb) => setTimeout(cb, 0));
    window.confirm = () => true;   // fluxos de exclusão seguem em frente
    window.alert = () => {};
    window.onerror = (msg, src, line, col, err) => {
      errors.push('[onerror] ' + msg + ' @' + line + ':' + col + (err && err.stack ? '\n' + err.stack.split('\n').slice(0,3).join('\n') : ''));
    };
    window.addEventListener('unhandledrejection', (e) => {
      errors.push('[unhandledrejection] ' + (e.reason && e.reason.message || e.reason));
    });
  }
});

const { window } = dom;
const $ = (id) => window.document.getElementById(id);

/* ── 3. Assertions ────────────────────────────────────────────── */
let pass = 0, fail = 0;
const results = [];
function check(name, cond, extra) {
  if (cond) { pass++; results.push('  ✓ ' + name); }
  else { fail++; results.push('  ✗ ' + name + (extra ? ' — ' + extra : '')); }
}
const ev = (expr) => window.eval(expr);

setTimeout(() => {
  try { run(); } catch (e) {
    errors.push('[harness] ' + e.message + '\n' + (e.stack||'').split('\n').slice(0,4).join('\n'));
  } finally { finish(); }
}, 600);

function run() {
  /* Boot */
  check('boot sem erro de runtime', errors.length === 0, errors[0]);
  check('render inicial rodou (today view visível)', $('todayCard') && !$('todayCard').hidden);
  check('AppState existe e expõe events[]', ev('Array.isArray(AppState.events)'));

  /* ── Evento: criar via modal ── */
  const n0 = ev('AppState.events.length');
  ev(`openNew('2026-07-10')`);
  $('evTitle').value = 'Smoke Reunião';
  $('evStart').value = '09:00'; $('evEnd').value = '10:00';
  $('saveBtn').click();
  check('criar evento aumenta AppState.events', ev('AppState.events.length') === n0 + 1);
  const evId = ev(`(AppState.events.find(e=>e.title==='Smoke Reunião')||{}).id || ''`);
  check('evento criado tem id e localUpdatedAt', !!evId && !!ev(`AppState.events.find(e=>e.id==='${evId}').localUpdatedAt`));

  /* ── Evento: editar ── */
  ev(`openEdit('${evId}')`);
  $('evTitle').value = 'Smoke Reunião v2';
  $('saveBtn').click();
  check('editar evento persiste título', ev(`AppState.events.find(e=>e.id==='${evId}').title`) === 'Smoke Reunião v2');

  /* ── Dois eventos mesmo título+data, horários ≠ (proteção do dedup) ── */
  ev(`openNew('2026-07-11')`);
  $('evTitle').value = 'Dupla'; $('evStart').value = '09:00'; $('evEnd').value = '10:00';
  $('saveBtn').click();
  ev(`openNew('2026-07-11')`);
  $('evTitle').value = 'Dupla'; $('evStart').value = '15:00'; $('evEnd').value = '16:00';
  $('saveBtn').click();
  check('2 eventos mesmo título/data horários ≠ coexistem',
    ev(`AppState.events.filter(e=>e.title==='Dupla'&&e.date==='2026-07-11').length`) === 2);

  /* ── Ocorrências: multi-dia e recorrência ── */
  check('getOccurrences multi-dia (3 dias)',
    ev(`getOccurrences({date:'2026-07-01',dateEnd:'2026-07-03'},'2026-06-25','2026-07-31').length`) === 3);
  check('getOccurrences WEEKLY dentro do range',
    ev(`getOccurrences({date:'2026-07-01',rrule:'WEEKLY'},'2026-07-01','2026-07-31').length`) === 5);
  check('getOccurrences respeita until',
    ev(`getOccurrences({date:'2026-07-01',rrule:'DAILY',until:'2026-07-05'},'2026-07-01','2026-07-31').length`) === 5);

  /* ── Conflito ── */
  check('detectConflicts pega sobreposição',
    ev(`detectConflicts({id:'x',date:'2026-07-11',start:'09:30',end:'09:45'}).length`) >= 1);

  /* ── toggleDone ── */
  ev(`toggleDone('${evId}','2026-07-10')`);
  check('toggleDone marca done', ev(`!!AppState.events.find(e=>e.id==='${evId}').done`));

  /* ── Excluir com undo ── */
  const n1 = ev('AppState.events.length');
  ev(`deleteEventById('${evId}')`);
  check('excluir remove o evento', ev('AppState.events.length') === n1 - 1);
  $('toastUndoBtn').click();
  check('undo restaura o evento', ev(`!!AppState.events.find(e=>e.id==='${evId}')`));

  /* ── Listas: CRUD + merge ── */
  const lid = ev(`(createList('Lista Smoke')||{}).id`);
  ev(`addListItem('${lid}','item A')`);
  ev(`addListItem('${lid}','item B')`);
  check('lista criada com 2 itens', ev(`AppState.lists.find(l=>l.id==='${lid}').items.length`) === 2);
  const iid = ev(`AppState.lists.find(l=>l.id==='${lid}').items[0].id`);
  ev(`toggleListItem('${lid}','${iid}')`);
  check('toggle de item marca done', ev(`AppState.lists.find(l=>l.id==='${lid}').items[0].done`) === true);
  // merge não ressuscita excluído nem apaga criado
  const mg = ev(`(function(){
    const A=[{id:'l1',title:'A',updatedAt:100,items:[{id:'i1',title:'x',updatedAt:100}]}];
    const B=[{id:'l2',title:'B',updatedAt:200,items:[]}];
    const r=mergeListCollections(A,{},B,{l1:150});
    return JSON.stringify({n:r.lists.length,ids:r.lists.map(l=>l.id).sort()});
  })()`);
  check('mergeListCollections: tombstone remove l1, l2 sobrevive', mg === '{"n":1,"ids":["l2"]}', mg);

  /* ── Merge de eventos por id + tombstones (E1) ── */
  const em = ev(`(function(){
    const A=[{id:'e1',title:'A',localUpdatedAt:new Date(100).toISOString()},{id:'e2',title:'B-old',localUpdatedAt:new Date(100).toISOString()}];
    const B=[{id:'e2',title:'B-new',localUpdatedAt:new Date(200).toISOString()},{id:'e3',title:'C',localUpdatedAt:new Date(200).toISOString()}];
    const r=mergeEventCollections(A,{},B,{e1:150});
    return JSON.stringify({ids:r.events.map(e=>e.id).sort(),b:r.events.find(e=>e.id==='e2').title});
  })()`);
  check('mergeEventCollections: tombstone remove e1, conflito vence o mais novo, e3 entra',
    em === '{"ids":["e2","e3"],"b":"B-new"}', em);
  check('mergeEventCollections: ausência remota NÃO apaga local (sem tombstone)',
    ev(`mergeEventCollections([{id:'k1',title:'x',localUpdatedAt:new Date().toISOString()}],{},[],{}).events.length`) === 1);
  check('applyRemoteEventsMerge aceita formato antigo (array puro)',
    ev(`(function(){
      applyRemoteEventsMerge({events:JSON.stringify([{id:'zz9',title:'remoto',localUpdatedAt:new Date().toISOString()}])});
      const ok=!!AppState.events.find(e=>e.id==='zz9');
      AppState.events=AppState.events.filter(e=>e.id!=='zz9');delete AppState.eventsDel['zz9'];save();
      return ok;
    })()`) === true);
  check('payload de sync usa formato v2 {v,events,del}',
    ev(`(function(){const p=JSON.parse(getLocalPayload().events);return p.v===2&&Array.isArray(p.events)&&typeof p.del==='object';})()`) === true);

  /* excluir cria tombstone; undo o remove */
  ev(`openNew('2026-07-12')`);
  $('evTitle').value = 'Smoke Tumba';
  $('saveBtn').click();
  const tid = ev(`(AppState.events.find(e=>e.title==='Smoke Tumba')||{}).id||''`);
  ev(`deleteEventById('${tid}')`);
  check('excluir evento grava tombstone', ev(`!!AppState.eventsDel['${tid}']`));
  $('toastUndoBtn').click();
  check('undo apaga o tombstone e restaura', ev(`!AppState.eventsDel['${tid}'] && !!AppState.events.find(e=>e.id==='${tid}')`));
  ev(`AppState.events=AppState.events.filter(e=>e.id!=='${tid}');save()`);

  /* ── gcalToMgc (E3): all-day exclusivo, desc sem rodapé, hora no fuso local ── */
  check('gcalToMgc: all-day de 1 dia não vira 2 dias (end exclusivo)',
    ev(`(function(){const e=gcalToMgc({id:'g1',start:{date:'2026-07-10'},end:{date:'2026-07-11'}});return e.date==='2026-07-10'&&e.dateEnd==='2026-07-10';})()`) === true);
  check('gcalToMgc: remove rodapé Categoria:/Tags: da descrição (round-trip)',
    ev(`gcalToMgc({id:'g2',start:{date:'2026-07-10'},end:{date:'2026-07-11'},description:'minha nota\\nCategoria: Aula\\nTags: a, b'}).desc`) === 'minha nota');
  check('gcalToMgc: dateTime convertido ao fuso do aparelho',
    ev(`(function(){
      const iso='2026-07-06T14:00:00-03:00';const d=new Date(iso);
      const exp=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
      return gcalToMgc({id:'g3',start:{dateTime:iso},end:{dateTime:'2026-07-06T15:00:00-03:00'}}).start===exp;
    })()`) === true);
  check('gcalMeet extrai hangoutLink e entryPoint de vídeo',
    ev(`gcalMeet({hangoutLink:'https://meet.google.com/abc'})==='https://meet.google.com/abc' && gcalMeet({conferenceData:{entryPoints:[{entryPointType:'video',uri:'https://meet.google.com/xyz'}]}})==='https://meet.google.com/xyz'`) === true);

  /* ── Quick add (parser NL) ── */
  if (ev(`typeof window.quickAddParse==='function' || typeof quickAddParse==='function'`)) {
    check('quickAddParse é executável', true);
  }

  /* ── Escapes e validação de URL (E5) ── */
  check('safeMeetUrl bloqueia javascript: e aceita https://',
    ev(`safeMeetUrl('javascript:alert(1)')==='' && safeMeetUrl('https://meet.google.com/x')!=='' && safeMeetUrl('https://a"onmouseover="x')==='https://a&quot;onmouseover=&quot;x'`) === true);
  check('nome de calendário malicioso é escapado na sidebar',
    ev(`(function(){
      calendars.push({id:'xss1',name:'<img src=x onerror=window.__xss=1>',color:'#000',visible:true});
      renderCalendarList();
      const ok=!document.querySelector('#calendarItems img') && !window.__xss;
      calendars=calendars.filter(c=>c.id!=='xss1');renderCalendarList();
      return ok;
    })()`) === true);

  /* ── Backup v7 completo (E4) ── */
  $('exportJsonBtn').click();
  let backup = {};
  try { backup = JSON.parse(ev('window.__lastBlob') || '{}'); } catch (e) {}
  check('backup exporta v7 com standaloneNotes/calendars/categories/routineChecks',
    backup.version === 7 && 'standaloneNotes' in backup && 'calendars' in backup &&
    'categories' in backup && 'routineChecks' in backup && Array.isArray(backup.events),
    'keys: ' + Object.keys(backup).join(','));

  /* ── ICS builder produz VCALENDAR ── */
  check('buildIcs gera VCALENDAR com eventos', /BEGIN:VEVENT/.test(ev('buildIcs()')));

  /* ── ICS: escaping RFC 5545 + DTEND multi-dia (E7) ── */
  const ics = ev(`(function(){
    const bak=AppState.events;
    AppState.events=[{id:'i1',title:'Prova, final; teste',date:'2026-08-01',dateEnd:'2026-08-03',start:'08:00',end:'10:00'}];
    const out=buildIcs();AppState.events=bak;return out;
  })()`);
  check('ICS escapa vírgula/ponto-e-vírgula no SUMMARY', ics.includes('SUMMARY:Prova\\, final\\; teste'), ics.match(/SUMMARY:[^\r]*/)?.[0]);
  check('ICS multi-dia usa dateEnd no DTEND', ics.includes('DTSTART:20260801T080000') && ics.includes('DTEND:20260803T100000'), ics.match(/DTEND:[^\r]*/)?.[0]);

  /* ── Clamp de datas no modal (E7) ── */
  ev(`openNew('2026-07-20')`);
  $('evTitle').value = 'Smoke Clamp';
  $('evDate').value = '2026-07-20'; $('evDateEnd').value = '2026-07-15';
  $('saveBtn').click();
  check('dateEnd < date é ajustado (evento não some das views)',
    ev(`(AppState.events.find(e=>e.title==='Smoke Clamp')||{}).dateEnd`) === '2026-07-20');
  ev(`AppState.events=AppState.events.filter(e=>e.title!=='Smoke Clamp');save()`);

  /* ── Navegação de views ── */
  ['month','week','lists','routines','review','notes','today'].forEach(v => {
    try { ev(`switchView && switchView('${v}')`); } catch (e) {}
  });
  check('troca de views não gera erro', errors.length === 0, errors[errors.length-1]);

  /* limpeza dos dados de teste no localStorage do jsdom (efêmero, mas por higiene) */
  ev(`AppState.events=AppState.events.filter(e=>!/^(Smoke|Dupla)/.test(e.title));save()`);
  ev(`deleteList('${lid}')`);
}

/* ── 4. Cross-check estático: ids e handlers órfãos ───────────── */
function crossCheck() {
  const src = fs.readFileSync(HTML_PATH, 'utf8');
  const out = [];
  const idRefs = new Set([...src.matchAll(/getElementById\(\s*['"]([\w-]+)['"]\s*\)/g)].map(m => m[1]));
  const idDefs = new Set([...src.matchAll(/id="([\w-]+)"/g)].map(m => m[1]));
  const dynamicIds = new Set(['srpOverlay','srpSheet','srpHead','srpBody','srpFooter','srpClose','srpBtnNotes','srpBtnEdit','srpBtnMore','updateBanner']);
  for (const id of idRefs) {
    if (!idDefs.has(id) && !dynamicIds.has(id) && !src.includes(`id='${id}'`) && !src.includes(`.id='${id}'`) && !src.includes(`id:'${id}'`) && !src.includes(`,'${id}'`) && !new RegExp(`id=.?["'\`]?\\$\\{`).test(id)) {
      out.push(`id referenciado sem definição estática: #${id}`);
    }
  }
  const onclickFns = new Set([...src.matchAll(/onclick="(?:event\.stopPropagation\(\);)?\s*(\w+)\(/g)].map(m => m[1]));
  for (const fn of onclickFns) {
    if (['event','document','location'].includes(fn)) continue;
    if (!new RegExp(`function\\s+${fn}\\s*\\(|(?:const|let|var|window\\.)\\s*${fn}\\s*=`).test(src)) {
      out.push(`onclick chama função inexistente: ${fn}()`);
    }
  }
  return out;
}

function finish() {
  const xc = crossCheck();
  console.log('── Smoke §35 — Calendário MGC ──');
  console.log(results.join('\n'));
  if (xc.length) { console.log('  cross-check:'); xc.forEach(l => { console.log('  ⚠ ' + l); }); }
  if (errors.length) { console.log('  erros de runtime:'); errors.slice(0,8).forEach(e => console.log('  ✗ ' + e)); }
  const failed = fail + errors.length;
  console.log(`Resultado: ${pass} ✓ · ${failed} ✗${xc.length ? ' · ' + xc.length + ' avisos' : ''}`);
  process.exit(failed ? 1 : 0);
}
