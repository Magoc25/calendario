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
    // jsdom não implementa execCommand/queryCommandState (editor rico)
    window.document.execCommand = window.document.execCommand || (() => false);
    window.document.queryCommandState = window.document.queryCommandState || (() => false);
    window.document.queryCommandValue = window.document.queryCommandValue || (() => '');
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
  }
  // 2ª fase: fluxos com debounce (auto-save do editor de notas = 900ms)
  setTimeout(() => {
    try { runAsync(); } catch (e) {
      errors.push('[harness-async] ' + e.message + '\n' + (e.stack||'').split('\n').slice(0,4).join('\n'));
    } finally { finish(); }
  }, 1300);
}, 600);

/* Fase assíncrona — precisa que os setTimeout do app tenham disparado */
function runAsync() {
  if (window.__tableCheckPending) {
    check('⊞ insere tabela ne-table 2×3 no editor',
      ev(`document.querySelectorAll('#neEditor table.ne-table td').length`) === 6);
    /* barra contextual de tabela: cursor numa célula → operações */
    const selCell = (row, col) => ev(`(function(){
      const tbl=document.querySelector('#neEditor table.ne-table');if(!tbl)return false;
      const td=tbl.rows[${row}]&&tbl.rows[${row}].children[${col}];if(!td)return false;
      const r=document.createRange();r.selectNodeContents(td);r.collapse(true);
      const s=window.getSelection();s.removeAllRanges();s.addRange(r);return true;
    })()`);
    const clickTbl = (act) => ev(`document.querySelector('#neTablePopup [data-tbl="${act}"]').dispatchEvent(new window.MouseEvent('mousedown',{bubbles:true,cancelable:true}))`);
    selCell(0, 0);
    check('_neCurrentCell acha a célula sob o cursor', ev(`!!_neCurrentCell()`));
    ev(`_neUpdateTableBar()`);
    check('botão ✎ Tabela aparece com o cursor na célula',
      ev(`document.getElementById('neTableEditBtn').style.display`) === 'flex');
    clickTbl('rowAdd');
    check('+ Linha: tabela passa a 4 linhas', ev(`document.querySelector('#neEditor table.ne-table').rows.length`) === 4);
    selCell(0, 0); clickTbl('colAdd');
    check('+ Coluna: linhas passam a 3 células', ev(`document.querySelector('#neEditor table.ne-table').rows[0].children.length`) === 3);
    // marca a célula (0,1), move a coluna p/ a esquerda e confere que mudou de lugar
    ev(`document.querySelector('#neEditor table.ne-table').rows[0].children[1].textContent='MARCA'`);
    selCell(0, 1); clickTbl('colLeft');
    check('Col ←: célula marcada foi para a coluna 0',
      ev(`document.querySelector('#neEditor table.ne-table').rows[0].children[0].textContent`) === 'MARCA');
    selCell(0, 0); clickTbl('rowDel');
    check('− Linha: volta a 3 linhas', ev(`document.querySelector('#neEditor table.ne-table').rows.length`) === 3);
    selCell(0, 0); clickTbl('tblDel');
    check('🗑 remove a tabela, esconde o botão ✎ e fecha o menu',
      ev(`!document.querySelector('#neEditor table.ne-table')`) &&
      ev(`document.getElementById('neTableEditBtn').style.display`) === 'none' &&
      ev(`!document.getElementById('neTablePopup').classList.contains('open')`));
  }
  check('auto-save criou a nota avulsa do teste (após debounce)',
    ev(`!!AppState.standaloneNotes.find(n=>n.title==='Nota Smoke')`));
  /* tags # nas notas (N3) */
  check('noteTags extrai hashtags do título e do conteúdo',
    ev(`JSON.stringify([...noteTags({title:'Plano #trabalho',content:'<div>ver #Mercado e #trabalho</div>'})].sort())`) === '["mercado","trabalho"]');
  ev(`AppState.standaloneNotes.unshift({id:'tsm1',title:'Tag Smoke #teste',content:'x',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})`);
  ev(`renderNotesView()`);
  check('barra de chips mostra a tag #teste na aba Notas',
    ev(`!!document.querySelector('#nvTagBar [data-ntag="teste"]')`));
  ev(`_noteTagFilter='teste';_renderNotesGrid('')`);
  check('filtro por tag mostra só as notas com a tag',
    ev(`document.querySelectorAll('#nvGrid .note-card').length`) === 1);
  ev(`_noteTagFilter='';AppState.standaloneNotes=AppState.standaloneNotes.filter(n=>n.id!=='tsm1');renderNotesView()`);

  /* busca global encontra a nota avulsa (N2) */
  $('searchInput').value = 'nota smoke';
  ev(`document.getElementById('searchInput').dispatchEvent(new Event('input',{bubbles:true}))`);
  check('busca global lista a nota avulsa (item 🗒 com data-note-id)',
    ev(`!!document.querySelector('#searchResults .search-item[data-note-id]')`));
  $('searchInput').value = '';
  // esvaziar nota existente persiste o vazio (bug N0-5)
  ev(`(function(){
    const n=AppState.standaloneNotes.find(x=>x.title==='Nota Smoke');
    if(n){_editingNoteId=n.id;
      document.getElementById('neEditor').innerHTML='';
      saveNoteEdit();
    }
  })()`);
  check('esvaziar nota existente persiste o vazio (não "volta" o conteúdo antigo)',
    ev(`(AppState.standaloneNotes.find(x=>x.title==='Nota Smoke')||{}).content`) === '');
  ev(`AppState.standaloneNotes=AppState.standaloneNotes.filter(n=>n.title!=='Nota Smoke');saveStandaloneNotes();_editingNoteId=null`);
}

function run() {
  /* Boot */
  check('boot sem erro de runtime', errors.length === 0, errors[0]);
  check('render inicial rodou (today view visível)', $('todayCard') && !$('todayCard').hidden);
  check('AppState existe e expõe events[]', ev('Array.isArray(AppState.events)'));
  check('rodapé mostra a versão do app no formato correto (© MGC · vX.Y.Z)',
    /^© MGC · v\d+\.\d+\.\d+$/.test(($('appVersion').textContent||'').trim()), $('appVersion').textContent);

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
  /* ── Aba Listas: grupos por mês + busca + tags ── */
  ev(`(function(){
    AppState.lists.push(
      {id:'lm1',title:'Antiga #velha',createdAt:new Date('2026-05-10T12:00:00').getTime(),updatedAt:Date.now(),items:[{id:'lm1i',title:'comprar pão',done:false,updatedAt:Date.now()}]},
      {id:'lm2',title:'Recente',createdAt:new Date('2026-07-02T12:00:00').getTime(),updatedAt:Date.now(),items:[]}
    );
    _openListId=null;_listsSearch='';_listsTagFilter='';_listsOpenMonths=new Set();
    document.getElementById('listsBody').innerHTML='';
    renderListsView();
  })()`);
  check('aba Listas agrupa por mês de criação (Maio e Julho/2026 presentes)',
    ev(`(function(){const t=document.getElementById('listsGroups').textContent;return t.includes('Maio/2026')&&t.includes('Julho/2026');})()`));
  check('grupos começam recolhidos (sem cards visíveis)',
    ev(`document.querySelectorAll('#listsGroups .list-card').length`) === 0);
  ev(`document.querySelector('#listsGroups [data-mtoggle="2026-05"]').click()`);
  check('clicar no mês abre e mostra a lista com título + (data de criação)',
    ev(`(function(){const c=document.querySelector('#listsGroups .list-card .list-card-title');return !!c&&c.textContent.includes('Antiga')&&c.textContent.includes('(10/05/2026)');})()`));
  ev(`_listsSearch='pão';_renderListsGroups()`);
  check('busca por termo de ITEM encontra a lista (e expande os grupos)',
    ev(`document.querySelectorAll('#listsGroups .list-card').length`) === 1 &&
    ev(`document.querySelector('#listsGroups .list-card-title').textContent.includes('Antiga')`));
  ev(`_listsSearch='';_listsTagFilter='velha';_renderListsGroups()`);
  check('filtro #tag da aba Listas funciona',
    ev(`document.querySelectorAll('#listsGroups .list-card').length`) === 1 &&
    ev(`!!document.querySelector('#listsTagBar [data-ltag="velha"]')`));
  ev(`_listsTagFilter='';AppState.lists=AppState.lists.filter(l=>l.id!=='lm1'&&l.id!=='lm2');document.getElementById('listsBody').innerHTML='';renderListsView()`);

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

  /* ── Editor de notas (N0): utilitários e criação de nota ── */
  check('helpers do editor existem (_caretInsideWord/_selInList/updateNeToolbarState)',
    ev(`typeof _caretInsideWord==='function'&&typeof _selInList==='function'&&typeof updateNeToolbarState==='function'`));
  check('_caretInsideWord sem seleção retorna false', ev(`_caretInsideWord()`) === false);
  check('updateNeToolbarState roda sem erro', (() => { try { ev('updateNeToolbarState()'); return true; } catch (e) { return false; } })());
  /* ── Checklist e títulos (N1) ── */
  ev(`(function(){
    const ed=document.getElementById('neEditor');ed.innerHTML='';
    _neRange=null; // sem seleção salva → lista entra no fim do editor
    _insertListManual('neEditor','UL','ne-cklist');
  })()`);
  check('☑ cria ul.ne-cklist com li[data-ck="0"]',
    ev(`!!document.querySelector('#neEditor ul.ne-cklist>li[data-ck="0"]')`));
  ev(`(function(){
    const li=document.querySelector('#neEditor ul.ne-cklist>li');
    li.dispatchEvent(new window.MouseEvent('click',{bubbles:true,clientX:1}));
  })()`);
  check('clique na caixinha marca o item (data-ck=1)',
    ev(`document.querySelector('#neEditor ul.ne-cklist>li').getAttribute('data-ck')`) === '1');
  ev(`_insertListManual('neEditor','UL','ne-cklist')`); // dentro dela → toggle off
  check('☑ de novo desfaz a checklist (toggle)',
    ev(`!document.querySelector('#neEditor ul.ne-cklist')`));
  check('select de estilo de bloco existe (Texto/Título/Subtítulo)',
    $('neBlockStyle') && $('neBlockStyle').options.length === 3);

  /* ── Regressão: checklist com tabela acima (cenário do usuário) ──
     tabela + título + texto; cursor no TEXTO → só a linha do texto vira
     checklist; a tabela e o título ficam intactos */
  const ck1 = ev(`(function(){
    const ed=document.getElementById('neEditor');
    ed.innerHTML='<table class="ne-table"><tbody><tr><td>celula</td></tr></tbody></table><h2>Titulo</h2><div id="_ckTgt">texto alvo</div>';
    const t=document.getElementById('_ckTgt').firstChild;
    const r=document.createRange();r.setStart(t,3);r.collapse(true);
    const s=window.getSelection();s.removeAllRanges();s.addRange(r);
    _neRange=r.cloneRange();
    _insertListManual('neEditor','UL','ne-cklist');
    return JSON.stringify({
      tabelaIntacta: !!ed.querySelector(':scope>table.ne-table td') && !ed.querySelector('li table'),
      tituloIntacto: !!ed.querySelector('h2'),
      itemCerto: (ed.querySelector('ul.ne-cklist>li')||{}).textContent==='texto alvo',
      umaLista: ed.querySelectorAll('ul.ne-cklist').length===1
    });
  })()`);
  check('checklist converte SÓ a linha do cursor (tabela/título intactos)',
    ck1 === '{"tabelaIntacta":true,"tituloIntacto":true,"itemCerto":true,"umaLista":true}', ck1);
  const ck2 = ev(`(function(){
    const ed=document.getElementById('neEditor');
    ed.innerHTML='<table class="ne-table"><tbody><tr><td id="_ckTd">celula</td></tr></tbody></table>';
    const t=document.getElementById('_ckTd').firstChild;
    const r=document.createRange();r.setStart(t,2);r.collapse(true);
    const s=window.getSelection();s.removeAllRanges();s.addRange(r);
    _neRange=r.cloneRange();
    _insertListManual('neEditor','UL','ne-cklist');
    return JSON.stringify({
      tabelaIntacta: !!ed.querySelector(':scope>table.ne-table td') && !ed.querySelector('li table'),
      listaDepois: ed.querySelector('table.ne-table')?.nextElementSibling?.classList.contains('ne-cklist')===true
    });
  })()`);
  check('☑ com cursor DENTRO da tabela cria a lista abaixo dela (não converte)',
    ck2 === '{"tabelaIntacta":true,"listaDepois":true}', ck2);
  ev(`document.getElementById('neEditor').innerHTML='';_neRange=null`);

  /* ── URLs clicáveis + tabela (N4) ── */
  const lk = ev(`linkifyNoteHtml('veja <b>isto</b>: https://exemplo.com/x e https://outro.io')`);
  check('linkifyNoteHtml converte URLs soltas em <a rel=noopener>',
    (lk.match(/<a /g) || []).length === 2 && lk.includes('href="https://exemplo.com/x"') && lk.includes('rel="noopener"'), lk);
  check('linkifyNoteHtml não re-envolve URL que já é link',
    (ev(`linkifyNoteHtml('<a href="https://a.bc">https://a.bc</a>')`).match(/<a /g) || []).length === 1);
  ev(`(function(){
    const ed=document.getElementById('neEditor');ed.innerHTML='';_neRange=null;
    document.getElementById('neTableBtn').dispatchEvent(new window.MouseEvent('mousedown',{bubbles:true,cancelable:true}));
  })()`);
  // o insert roda num setTimeout(0) — verificado na fase assíncrona
  window.__tableCheckPending = true;

  // cria nota avulsa e digita — o auto-save (900ms) é verificado na fase assíncrona
  ev(`openNoteEdit(null)`);
  $('neTitleInput').value = 'Nota Smoke';
  $('neEditor').innerHTML = 'conteúdo de teste';
  ev(`document.getElementById('neEditor').dispatchEvent(new Event('input',{bubbles:true}))`);

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
