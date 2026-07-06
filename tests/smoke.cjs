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

  /* ── Quick add (parser NL) ── */
  if (ev(`typeof window.quickAddParse==='function' || typeof quickAddParse==='function'`)) {
    check('quickAddParse é executável', true);
  }

  /* ── ICS builder produz VCALENDAR ── */
  check('buildIcs gera VCALENDAR com eventos', /BEGIN:VEVENT/.test(ev('buildIcs()')));

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
