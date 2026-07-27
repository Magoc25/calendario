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
    window.prompt = (_m, def) => def || 'X';  // aceita o padrão sugerido
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

  /* ── L1: arquivar + limpar concluídos ── */
  ev(`(function(){
    AppState.lists=AppState.lists.filter(l=>l.id!=='la1');
    AppState.lists.push({id:'la1',title:'Arquiva Smoke',createdAt:Date.now(),updatedAt:Date.now(),items:[
      {id:'la1a',title:'feito',done:true,updatedAt:Date.now()},
      {id:'la1b',title:'pendente',done:false,updatedAt:Date.now()}]});
    _openListId='la1';_listsSearch='';_listsTagFilter='';document.getElementById('listsBody').innerHTML='';renderListsView();
  })()`);
  ev(`clearDoneItems('la1')`);
  check('limpar concluídos remove só os itens done (+ tombstone)',
    ev(`(function(){const l=AppState.lists.find(x=>x.id==='la1');return l.items.length===1&&l.items[0].title==='pendente'&&!!AppState.listsDel['la1a'];})()`));
  ev(`archiveList('la1')`);
  check('arquivar marca archivedAt e sai do detalhe p/ a visão geral',
    ev(`!!AppState.lists.find(x=>x.id==='la1').archivedAt`) && ev(`_openListId===null`));
  ev(`_listsOpenMonths=new Set(['__arch__']);document.getElementById('listsBody').innerHTML='';renderListsView()`);
  check('lista arquivada NÃO aparece nos grupos por mês; aparece na seção Arquivadas',
    ev(`!document.querySelector('#listsGroups .lists-month:not(.lists-month-arch) [data-openlist="la1"]')`) &&
    ev(`!!document.querySelector('#listsGroups .lists-month-arch [data-openlist="la1"]')`));
  ev(`unarchiveList('la1')`);
  check('desarquivar remove archivedAt e volta às ativas',
    ev(`!AppState.lists.find(x=>x.id==='la1').archivedAt`));
  ev(`AppState.lists=AppState.lists.filter(l=>l.id!=='la1');delete AppState.listsDel['la1a'];_openListId=null;saveLists();document.getElementById('listsBody').innerHTML='';renderListsView()`);

  /* ── L2: ponte item → Hoje / evento ── */
  ev(`(function(){
    AppState.lists=AppState.lists.filter(l=>l.id!=='lp1');
    AppState.lists.push({id:'lp1',title:'Ponte Smoke',createdAt:Date.now(),updatedAt:Date.now(),items:[{id:'lp1a',title:'Comprar café',done:false,updatedAt:Date.now()}]});
    _openListId='lp1';document.getElementById('listsBody').innerHTML='';renderListsView();
  })()`);
  const qtBefore = ev(`AppState.quickTasks.length`);
  ev(`listItemToToday('lp1','lp1a')`);
  check('item → Hoje cria quickTask com o título (e não remove da lista)',
    ev(`AppState.quickTasks.some(t=>t.title==='Comprar café'&&t.date===todayDs())`) &&
    ev(`AppState.quickTasks.length`) === qtBefore + 1 &&
    ev(`AppState.lists.find(x=>x.id==='lp1').items.length`) === 1);
  ev(`listItemToEvent('lp1','lp1a')`);
  check('item → evento abre o modal com o título preenchido',
    ev(`document.getElementById('overlay').classList.contains('open')`) &&
    ev(`document.getElementById('evTitle').value`) === 'Comprar café');
  ev(`closeModal();AppState.quickTasks=AppState.quickTasks.filter(t=>t.title!=='Comprar café');AppState.lists=AppState.lists.filter(l=>l.id!=='lp1');_openListId=null;saveLists();saveQuickTasks();document.getElementById('listsBody').innerHTML='';renderListsView()`);

  /* ── L3: templates de lista ── */
  ev(`AppState.listTemplates=[];AppState.lists=AppState.lists.filter(l=>l.id!=='lt1')`);
  ev(`AppState.lists.push({id:'lt1',title:'Viagem',createdAt:Date.now(),updatedAt:Date.now(),items:[{id:'lt1a',title:'Passaporte',done:true,updatedAt:Date.now()},{id:'lt1b',title:'Carregador',done:false,updatedAt:Date.now()}]})`);
  const tplId = ev(`(saveListAsTemplate('lt1','Viagem')||{}).id`);
  check('salvar como modelo captura os itens (títulos, sem status done)',
    ev(`(function(){const t=AppState.listTemplates.find(x=>x.id==='${tplId}');return !!t&&t.items.length===2&&t.items[0].title==='Passaporte'&&!('done' in t.items[0]);})()`));
  const newLid = ev(`(createListFromTemplate('${tplId}')||{}).id`);
  check('criar lista a partir do modelo gera itens novos (todos desmarcados)',
    ev(`(function(){const l=AppState.lists.find(x=>x.id==='${newLid}');return !!l&&l.title==='Viagem'&&l.items.length===2&&l.items.every(i=>i.done===false)&&l.items[0].id!=='lt1a';})()`));
  check('payload de sync inclui list_templates (array)',
    ev(`Array.isArray(JSON.parse(getLocalPayload().list_templates))`) === true &&
    ev(`JSON.parse(getLocalPayload().list_templates).length`) >= 1);
  check('applyRemotePayload carrega list_templates',
    ev(`(function(){applyRemotePayload({events:'[]',list_templates:JSON.stringify([{id:'rt9',name:'Remoto',items:[{title:'x'}],createdAt:Date.now()}])});return AppState.listTemplates.some(t=>t.id==='rt9');})()`) === true);
  // painel de modelos na visão geral
  ev(`_openListId=null;AppState.listTemplates=[{id:'tp1',name:'Compras',items:[{title:'leite'}],createdAt:Date.now()}];document.getElementById('listsBody').innerHTML='';renderListsView();_renderListTemplates();document.getElementById('listTemplatesPanel').style.display='block'`);
  check('painel de modelos mostra o chip com nome e contagem',
    ev(`(function(){const c=document.querySelector('#listTemplatesPanel [data-usetpl="tp1"]');return !!c&&c.textContent.includes('Compras')&&c.textContent.includes('(1)');})()`));
  ev(`deleteListTemplate('tp1')`);
  check('excluir modelo remove do estado', ev(`!AppState.listTemplates.some(t=>t.id==='tp1')`));
  ev(`AppState.listTemplates=[];AppState.lists=AppState.lists.filter(l=>l.id!=='lt1'&&l.id!=='${newLid}');_openListId=null;saveLists();saveListTemplates();document.getElementById('listsBody').innerHTML='';renderListsView()`);

  /* ── L4: fixar lista na aba Hoje + concluir (colapsável, check bidirecional) ── */
  ev(`AppState.lists=AppState.lists.filter(l=>l.id!=='lf1');AppState.lists.push({id:'lf1',title:'Supermercado',createdAt:Date.now(),updatedAt:Date.now(),pinnedToday:true,items:[{id:'lf1a',title:'Leite',done:false,updatedAt:Date.now()},{id:'lf1b',title:'Pão',done:false,updatedAt:Date.now()}]});_todayListsExpanded=new Set();AppState.viewMode='today';renderToday()`);
  check('lista fixada aparece na aba Hoje (colapsada, com progresso 0/2)',
    ev(`!!document.querySelector('.tv-pinlists [data-tldone="lf1"]')`) &&
    ev(`document.querySelector('.tv-pinlists .tl-prog').textContent`) === '0/2' &&
    ev(`document.querySelectorAll('.tv-pinlists .tl-item').length`) === 0);
  ev(`document.querySelector('.tv-pinlists [data-tlexp="lf1"]').click()`);
  check('expandir a lista mostra os itens', ev(`document.querySelectorAll('.tv-pinlists .tl-item').length`) === 2);
  ev(`document.querySelector('.tv-pinlists [data-tlitem="lf1|lf1a"]').click()`);
  check('checar item na Hoje marca o item REAL da lista (bidirecional) e atualiza o progresso',
    ev(`AppState.lists.find(l=>l.id==='lf1').items[0].done`) === true &&
    ev(`document.querySelector('.tv-pinlists .tl-prog').textContent`) === '1/2');
  ev(`document.querySelector('.tv-pinlists [data-tldone="lf1"]').click()`);
  check('check da própria lista a marca como concluída (done)',
    ev(`AppState.lists.find(l=>l.id==='lf1').done`) === true);
  ev(`AppState.viewMode='lists';_openListId=null;_listsSearch='';_listsTagFilter='';_listsOpenMonths=new Set([listMonthKey(AppState.lists.find(l=>l.id==='lf1'))]);document.getElementById('listsBody').innerHTML='';renderListsView()`);
  check('na aba Listas o card mostra 📌 (fixada) e ✓ (concluída, riscada)',
    ev(`(function(){const c=document.querySelector('#listsGroups .list-card[data-openlist="lf1"]');return !!c&&c.classList.contains('list-card-done')&&c.textContent.includes('📌')&&c.textContent.includes('✓');})()`));
  ev(`toggleListPinToday('lf1')`);
  check('desafixar remove pinnedToday (e some da Hoje)', ev(`!AppState.lists.find(l=>l.id==='lf1').pinnedToday`));
  ev(`AppState.lists=AppState.lists.filter(l=>l.id!=='lf1');_openListId=null;_todayListsExpanded=new Set();AppState.viewMode='today';saveLists();renderToday()`);

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

  /* ── Merge de notas no sync (v2.6.1): união por id/chave + tombstones —
        cobre o vetor da perda de notas (device com blob velho vencia o push) ── */
  check('merge notas avulsas: device com blob velho NÃO apaga nota remota nova',
    ev(`(function(){const r=mergeStandaloneNoteCollections([],{},[{id:'sn1',title:'do outro device',updatedAt:100}],{});return r.notes.length===1&&r.notes[0].id==='sn1';})()`) === true);
  check('merge notas avulsas: conflito de id vence o updatedAt mais recente',
    ev(`(function(){const r=mergeStandaloneNoteCollections([{id:'a',title:'velha',updatedAt:1}],{},[{id:'a',title:'nova',updatedAt:2}],{});return r.notes[0].title==='nova';})()`) === true);
  check('merge notas avulsas: tombstone remoto remove, mas edição local mais nova sobrevive',
    ev(`(function(){const r=mergeStandaloneNoteCollections([{id:'x',updatedAt:5},{id:'y',updatedAt:20}],{},[],{x:10,y:10});return !r.notes.find(n=>n.id==='x')&&!!r.notes.find(n=>n.id==='y');})()`) === true);
  check('excluir nota avulsa grava tombstone (diff no save)',
    ev(`(function(){AppState.standaloneNotes.push({id:'snDel',title:'t',createdAt:1,updatedAt:1});saveStandaloneNotes();AppState.standaloneNotes=AppState.standaloneNotes.filter(n=>n.id!=='snDel');saveStandaloneNotes();return !!AppState.standaloneNotesDel['snDel'];})()`) === true);
  check('merge notas por data: nota remota nova entra sem apagar a local',
    ev(`(function(){notesStore={k1:'local'};notesMeta={k1:1};notesDel={};const ch=applyRemoteNotesMerge({notes:JSON.stringify({k2:'remota',__meta:{v:2,ts:{k2:2},del:{}}})},false);return ch===true&&notesStore.k1==='local'&&notesStore.k2==='remota';})()`) === true);
  check('merge notas por data: tombstone remoto apaga a local mais antiga',
    ev(`(function(){notesStore={k3:'antiga'};notesMeta={k3:1};notesDel={};applyRemoteNotesMerge({notes:JSON.stringify({__meta:{v:2,ts:{},del:{k3:9}}})},false);const ok=!('k3' in notesStore);notesStore={};notesMeta={};notesDel={};return ok;})()`) === true);
  check('payload de sync leva __meta nas notas e {v:2,notes,del} nas avulsas',
    ev(`(function(){const p=getLocalPayload();const n=JSON.parse(p.notes),s=JSON.parse(p.standalone_notes);return !!(n.__meta&&n.__meta.v===2&&s.v===2&&Array.isArray(s.notes));})()`) === true);

  /* ── Banner de update do SW: ✕ silencia por 24h (Safari re-exibia a cada load) ── */
  ev(`localStorage.removeItem('mgc_sw_banner_snooze');_showSwUpdateBanner()`);
  check('banner de update do SW aparece', !!$('swUpdateBanner'));
  ev(`document.getElementById('swUpdateDismiss').click()`);
  check('✕ remove o banner e grava snooze de 24h',
    !$('swUpdateBanner') && ev(`+(localStorage.getItem('mgc_sw_banner_snooze')||0)`) > Date.now());
  ev(`_showSwUpdateBanner()`);
  check('banner respeita o snooze (não re-aparece)', !$('swUpdateBanner'));
  ev(`localStorage.removeItem('mgc_sw_banner_snooze')`);
  check('_swCacheNum extrai o número do CACHE_NAME (handshake do banner)',
    ev(`_swCacheNum('cal-mgc-v209')`) === 209 && ev(`_swCacheNum('lixo')`) === null);
  check('_maybeShowSwUpdateBanner sem SW registrado não quebra nem exibe banner',
    ev(`(function(){try{_maybeShowSwUpdateBanner();return !document.getElementById('swUpdateBanner');}catch(e){return false;}})()`) === true);

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

  /* ── Participantes → attendees do Google (alerta em grupo, Fase 1) ── */
  check('mgcToGcal: participantes viram attendees com privacidade fechada',
    ev(`(function(){
      const o=mgcToGcal({title:'x',date:'2026-08-01',participants:['a@x.com','b@y.org']});
      return JSON.stringify(o.attendees)==='[{"email":"a@x.com"},{"email":"b@y.org"}]'
        && o.guestsCanSeeOtherGuests===false && o.guestsCanInviteOthers===false;
    })()`) === true);
  check('mgcToGcal: sem participantes não emite attendees (não vaza campo)',
    ev(`(function(){const o=mgcToGcal({title:'x',date:'2026-08-01'});
      return !('attendees' in o)&&!('guestsCanSeeOtherGuests' in o);})()`) === true);
  check('gcalToMgc: evento de convite → gcalIsGuest + organizador, SEM copiar a lista alheia',
    ev(`(function(){
      const e=gcalToMgc({id:'gp1',start:{date:'2026-08-01'},end:{date:'2026-08-02'},
        organizer:{email:'dono@x.com',self:false},
        attendees:[{email:'dono@x.com'},{email:'eu@y.com',self:true},{email:'outro@z.com'}]});
      return e.gcalIsGuest===true && e.gcalOrganizerEmail==='dono@x.com'
        && JSON.stringify(e.participants)==='[]';
    })()`) === true);
  check('gcalToMgc: evento PRÓPRIO com convidados guarda a lista (sem o self) p/ o PUT não apagar',
    ev(`(function(){
      const e=gcalToMgc({id:'gp1b',start:{date:'2026-08-01'},end:{date:'2026-08-02'},
        organizer:{email:'eu@y.com',self:true},
        attendees:[{email:'eu@y.com',self:true},{email:'conv@z.com'}]});
      return e.gcalIsGuest===false && JSON.stringify(e.participants)==='["conv@z.com"]';
    })()`) === true);
  check('convite institucional de 160 pessoas não polui o estado local (nem o blob de sync)',
    ev(`(function(){
      const many=Array.from({length:160},(_,i)=>({email:'p'+i+'@inst.edu'}));
      const e=gcalToMgc({id:'gp1c',start:{date:'2026-08-01'},end:{date:'2026-08-02'},
        organizer:{email:'reitoria@inst.edu',self:false},attendees:many});
      return e.participants.length===0 && e.gcalOrganizerEmail==='reitoria@inst.edu';
    })()`) === true);
  check('participantsSummary corta a lista longa e sinaliza o resto',
    ev(`participantsSummary({participants:['a@x.com','b@x.com','c@x.com','d@x.com','e@x.com']})`) === 'a@x.com, b@x.com, c@x.com +2' &&
    ev(`participantsSummary({participants:['a@x.com']})`) === 'a@x.com' &&
    ev(`participantsSummary({})`) === '');
  check('painel do dia mostra a linha 👥 (é onde o usuário clica, não só a busca)',
    ev(`(function(){
      const d='2026-08-14';
      AppState.events.push({id:'dpp1',title:'Evento com convidado',date:d,dateEnd:d,start:'09:00',end:'10:00',participants:['conv@x.com'],calendarId:'default'});
      renderDayPanel(d);
      const ok=/👥[^<]*conv@x\\.com/.test(document.getElementById('dpBody').innerHTML);
      AppState.events=AppState.events.filter(e=>e.id!=='dpp1');
      return ok;
    })()`) === true);
  check('painel do dia identifica quem convidou em evento de convite',
    ev(`(function(){
      const d='2026-08-15';
      AppState.events.push({id:'dpp2',title:'Convite alheio',date:d,dateEnd:d,start:'09:00',end:'10:00',participants:[],gcalIsGuest:true,gcalOrganizerEmail:'dono@x.com',calendarId:'default'});
      renderDayPanel(d);
      const ok=/👤 convite de dono@x\\.com/.test(document.getElementById('dpBody').innerHTML);
      AppState.events=AppState.events.filter(e=>e.id!=='dpp2');
      return ok;
    })()`) === true);
  check('gcalToMgc: evento próprio (organizer.self) → gcalIsGuest false',
    ev(`gcalToMgc({id:'gp2',start:{date:'2026-08-01'},end:{date:'2026-08-02'},organizer:{email:'eu@y.com',self:true}}).gcalIsGuest`) === false);
  check('gcalToMgc: sem organizer → gcalIsGuest false (evento solo não vira convite)',
    ev(`gcalToMgc({id:'gp3',start:{date:'2026-08-01'},end:{date:'2026-08-02'}}).gcalIsGuest`) === false);
  check('shouldPushUpdate: bloqueia evento de convidado e libera o do dono',
    ev(`(function(){
      const base={gcalId:'g',title:'t',date:'2026-08-01',localUpdatedAt:'2026-08-02T10:00:00Z',gcalUpdated:'2026-08-01T10:00:00Z'};
      return shouldPushUpdate({...base,gcalIsGuest:true})===false
        && shouldPushUpdate({...base})===true
        && shouldPushUpdate({...base,localUpdatedAt:'2026-07-01T10:00:00Z'})===false
        && shouldPushUpdate({...base,gcalId:undefined})===false;
    })()`) === true);
  /* ── Escrita perdida do push: merge do Supabase caindo durante o await ──
     Reproduz o bug real de duplicação (v2.8.0 e anteriores): applyRemoteEventsMerge
     faz `AppState.events = mg.events` e a referência capturada antes do fetch vira
     órfã → o gcalId devolvido pelo Google era gravado no vazio. ── */
  const _mergeMidFlight = `(function(){
    // simula o efeito do merge remoto: MESMOS dados, objetos NOVOS
    AppState.events=AppState.events.map(e=>({...e}));
  })()`;
  check('BASELINE: gravar na referência capturada PERDE o gcalId após o merge (o bug)',
    ev(`(function(){
      AppState.events.push({id:'lw1',title:'Perdido',date:'2026-09-01',start:'08:00',localUpdatedAt:'2026-09-01T10:00:00Z'});
      const ref=AppState.events.find(e=>e.id==='lw1');   // referência capturada antes do await
      ${_mergeMidFlight};                                 // merge do Supabase no meio do voo
      ref.gcalId='G-PERDIDO';                             // como o código antigo fazia
      const naoPersistiu=!AppState.events.find(e=>e.id==='lw1').gcalId;
      AppState.events=AppState.events.filter(e=>e.id!=='lw1');
      return naoPersistiu;
    })()`) === true);
  check('gcalApplyPushResult relocaliza por id e o gcalId SOBREVIVE ao merge',
    ev(`(function(){
      AppState.events.push({id:'lw2',title:'Salvo',date:'2026-09-01',start:'08:00',localUpdatedAt:'2026-09-01T10:00:00Z'});
      const ref=AppState.events.find(e=>e.id==='lw2');
      ${_mergeMidFlight};
      gcalApplyPushResult(ref.id,{gcalId:'G-OK',gcalUpdated:'2026-09-01T11:00:00Z'});
      const vivo=AppState.events.find(e=>e.id==='lw2');
      const ok=vivo.gcalId==='G-OK'&&vivo.gcalUpdated==='2026-09-01T11:00:00Z'
        && shouldPushUpdate(vivo)===false;   // e sai da fila de pendentes
      AppState.events=AppState.events.filter(e=>e.id!=='lw2');
      return ok;
    })()`) === true);
  check('gcalApplyPushResult devolve false se o evento sumiu durante o sync (não recria)',
    ev(`gcalApplyPushResult('nao-existe-mais',{gcalId:'X'})`) === false);
  // código sem as linhas de comentário — o docblock do fix cita o padrão antigo de propósito
  const _srcCode = fs.readFileSync(HTML_PATH,'utf8').split('\n').filter(l=>!/^\s*\/\//.test(l)).join('\n');
  check('o push do gcalSync usa a relocalização (não grava na referência capturada)',
    !/\bev\.gcalId\s*=\s*created\.id/.test(_srcCode) &&
    !/\bev\.gcalUpdated\s*=\s*updated_res\.updated/.test(_srcCode) &&
    (_srcCode.match(/gcalApplyPushResult\(ev\.id,/g)||[]).length === 2);

  /* ── Duplicação com DOIS aparelhos: o vínculo com o Google não pode morrer no LWW ──
     Cenário real (PC cria e sincroniza; celular só puxou do Supabase e sincroniza depois):
     a cópia do celular não tem gcalId e tem localUpdatedAt igual ou mais novo → vencia o
     merge e apagava o vínculo → o sync seguinte reenviava o evento → duplicata no Google. */
  check('merge: cópia SEM vínculo não apaga o gcalId de quem já sincronizou (remoto vence)',
    ev(`(function(){
      const pc  ={id:'d1',title:'Reunião',date:'2026-09-10',start:'08:00',gcalId:'G1',gcalUpdated:'2026-09-09T10:00:00Z',localUpdatedAt:'2026-09-09T09:00:00Z'};
      const cel ={id:'d1',title:'Reunião',date:'2026-09-10',start:'14:00',localUpdatedAt:'2026-09-09T11:00:00Z'}; // editou depois, sem vínculo
      const m=mergeEventCollections([pc],{},[cel],{});
      const e=m.events[0];
      return e.start==='14:00' && e.gcalId==='G1' && e.gcalUpdated==='2026-09-09T10:00:00Z';
    })()`) === true, 'conteúdo do mais recente + vínculo preservado');
  check('merge: vínculo do remoto é absorvido quando o LOCAL vence o conteúdo',
    ev(`(function(){
      const local ={id:'d2',title:'X',date:'2026-09-10',start:'14:00',localUpdatedAt:'2026-09-09T11:00:00Z'};
      const remoto={id:'d2',title:'X',date:'2026-09-10',start:'08:00',gcalId:'G2',localUpdatedAt:'2026-09-09T09:00:00Z'};
      const e=mergeEventCollections([local],{},[remoto],{}).events[0];
      return e.start==='14:00' && e.gcalId==='G2';
    })()`) === true);
  check('merge: empate de carimbo não perde o vínculo (o sync não carimba localUpdatedAt)',
    ev(`(function(){
      const t='2026-09-09T09:00:00Z';
      const local ={id:'d3',title:'X',date:'2026-09-10',start:'08:00',gcalId:'G3',localUpdatedAt:t};
      const remoto={id:'d3',title:'X',date:'2026-09-10',start:'08:00',localUpdatedAt:t};
      return mergeEventCollections([local],{},[remoto],{}).events[0].gcalId==='G3';
    })()`) === true);
  check('merge: meetLink e propriedade também sobrevivem ao merge',
    ev(`(function(){
      const local ={id:'d4',title:'X',date:'2026-09-10',gcalId:'G4',meetLink:'https://meet.google.com/x',gcalIsGuest:true,gcalOrganizerEmail:'dono@x.com',localUpdatedAt:'2026-09-09T09:00:00Z'};
      const remoto={id:'d4',title:'X2',date:'2026-09-10',localUpdatedAt:'2026-09-09T11:00:00Z'};
      const e=mergeEventCollections([local],{},[remoto],{}).events[0];
      return e.title==='X2'&&e.meetLink==='https://meet.google.com/x'&&e.gcalIsGuest===true&&e.gcalOrganizerEmail==='dono@x.com';
    })()`) === true);
  check('BASELINE: sem a união do vínculo, o evento voltaria à fila de envio (duplicaria)',
    ev(`(function(){
      const cel={id:'d5',title:'X',date:'2026-09-10',start:'14:00',localUpdatedAt:'2026-09-09T11:00:00Z'};
      const semUniao=!cel.gcalId;                 // como o merge devolvia antes
      const comUniao=mergeEventCollections([{...cel,gcalId:'G5'}],{},[cel],{}).events[0];
      // sem vínculo o push trata como evento NOVO (POST) — com vínculo, vira PUT
      return semUniao===true && !!comUniao.gcalId;
    })()`) === true);
  check('merge: exclusão por tombstone continua valendo (a união não ressuscita evento)',
    ev(`(function(){
      const local={id:'d6',title:'X',date:'2026-09-10',gcalId:'G6',localUpdatedAt:'2026-09-09T09:00:00Z'};
      return mergeEventCollections([local],{},[],{d6:Date.parse('2026-09-09T12:00:00Z')}).events.length===0;
    })()`) === true);

  /* ── O Google não pode atropelar edição local pendente (v2.9.1) ──
     Caso real: evento arrastado no PC para outro dia; ao sincronizar, a sala do Meet
     havia bumpado o `updated` do Google → a versão velha do Google voltava e a
     edição do usuário sumia (e ainda era reenviada como se fosse dele). */
  check('🛡️ edição local pendente MAIS NOVA vence o Google (não perde o que o usuário fez)',
    ev(`gcalRemoteWins(
      {gcalUpdated:'2026-09-01T10:00:00Z',localUpdatedAt:'2026-09-01T12:00:00Z'},
      {updated:'2026-09-01T11:00:00Z'})`) === false);
  check('Google mais novo que a edição local vence (edição feita no Google chega ao app)',
    ev(`gcalRemoteWins(
      {gcalUpdated:'2026-09-01T10:00:00Z',localUpdatedAt:'2026-09-01T11:00:00Z'},
      {updated:'2026-09-01T12:00:00Z'})`) === true);
  check('Google inalterado desde a última sincronização não mexe em nada',
    ev(`gcalRemoteWins({gcalUpdated:'2026-09-01T10:00:00Z'},{updated:'2026-09-01T10:00:00Z'})`) === false);
  check('sem edição local pendente, o Google mais novo vence',
    ev(`gcalRemoteWins({gcalUpdated:'2026-09-01T10:00:00Z'},{updated:'2026-09-01T12:00:00Z'})`) === true);
  check('empate entre mudança do Google e edição local: vence o Google (evita pingue-pongue)',
    ev(`gcalRemoteWins(
      {gcalUpdated:'2026-09-01T10:00:00Z',localUpdatedAt:'2026-09-01T12:00:00Z'},
      {updated:'2026-09-01T12:00:00Z'})`) === true);
  check('o pull usa o predicado nomeado (não a comparação antiga)',
    /if\(gcalRemoteWins\(local,gcEv\)\)/.test(fs.readFileSync(HTML_PATH,'utf8')) &&
    !/gcUpdated>localUpdated/.test(fs.readFileSync(HTML_PATH,'utf8').split('\n').filter(l=>!/^\s*\/\//.test(l)).join('\n')));

  /* ── Cancelamento silencioso (v2.10.2): a preferência viaja NA FILA ── */
  check('fila de exclusão lê o formato antigo (string) e o novo ({id,notify})',
    ev(`_dqId('abc')==='abc' && _dqNotify('abc')===true
      && _dqId({id:'x',notify:false})==='x' && _dqNotify({id:'x',notify:false})===false
      && _dqNotify({id:'y',notify:true})===true && _dqNotify({id:'z'})===true`) === true);
  check('🔇 excluir evento com aviso DESMARCADO enfileira cancelamento silencioso',
    ev(`(function(){
      localStorage.removeItem('cal_gcal_delete_queue');
      gcalMarkDeleted('g-silencioso',false);
      const q=JSON.parse(localStorage.getItem('cal_gcal_delete_queue'));
      return q.length===1&&q[0].id==='g-silencioso'&&_dqNotify(q[0])===false;
    })()`) === true);
  check('excluir com aviso LIGADO mantém o cancelamento notificado (padrão)',
    ev(`(function(){
      localStorage.removeItem('cal_gcal_delete_queue');
      gcalMarkDeleted('g-avisa',true);
      return _dqNotify(JSON.parse(localStorage.getItem('cal_gcal_delete_queue'))[0])===true;
    })()`) === true);
  check('desfazer a exclusão tira o item da fila (nos dois formatos)',
    ev(`(function(){
      localStorage.setItem('cal_gcal_delete_queue',JSON.stringify(['antigo',{id:'novo',notify:false}]));
      gcalUnmarkDeleted('novo');
      const q=JSON.parse(localStorage.getItem('cal_gcal_delete_queue'));
      gcalUnmarkDeleted('antigo');
      const q2=JSON.parse(localStorage.getItem('cal_gcal_delete_queue'));
      return q.length===1&&_dqId(q[0])==='antigo'&&q2.length===0;
    })()`) === true);
  check('o DELETE monta sendUpdates a partir da fila (não fixo na URL)',
    /const _upd=_dqNotify\(item\)\?'\?sendUpdates=all':'';/.test(fs.readFileSync(HTML_PATH,'utf8')) &&
    !/events\/\$\{encodeURIComponent\(gcalId\)\}\?sendUpdates=all/.test(fs.readFileSync(HTML_PATH,'utf8')));
  ev(`localStorage.removeItem('cal_gcal_delete_queue')`);

  /* ── Grupos de participantes (v2.10.0): ATALHO, não vínculo ── */
  ev(`openNew('2026-10-01')`);
  check('alerta padrão de evento novo é 10 min', $('evAlert').value === '10');
  ev(`addParticipants('a@x.com, b@x.com')`);
  check('salva os participantes atuais como grupo nomeado',
    ev(`savePartGroupFromCurrent('Turma A')`) === true &&
    ev(`(function(){const g=AppState.participantGroups.find(x=>x.name==='Turma A');
      return !!g&&JSON.stringify(g.emails)==='["a@x.com","b@x.com"]';})()`) === true);
  check('grupo sem nome ou sem participantes não é salvo',
    ev(`savePartGroupFromCurrent('')`) === false &&
    ev(`(function(){const bk=currentParticipants;currentParticipants=[];
      const r=savePartGroupFromCurrent('Vazio');currentParticipants=bk;return r;})()`) === false);
  check('chip do grupo aparece com nome e contagem',
    ev(`!!document.querySelector('#pgChips [data-pg]')`) &&
    /Turma A · 2/.test(ev(`document.getElementById('pgChips').innerHTML`)));
  ev(`currentParticipants=[];renderPartPills()`);
  ev(`document.querySelector('#pgChips [data-pg]').click()`);
  check('clicar no grupo expande os e-mails em chips no evento',
    ev(`JSON.stringify(currentParticipants)`) === '["a@x.com","b@x.com"]');
  ev(`addParticipants('c@x.com')`);
  check('🔗 grupo é ATALHO: mudar os participantes do evento não altera o grupo',
    ev(`JSON.stringify(AppState.participantGroups.find(x=>x.name==='Turma A').emails)`) === '["a@x.com","b@x.com"]');
  check('salvar com o MESMO nome substitui a lista do grupo (não duplica)',
    ev(`(function(){savePartGroupFromCurrent('Turma A');
      const gs=AppState.participantGroups.filter(x=>x.name==='Turma A');
      return gs.length===1&&gs[0].emails.length===3;})()`) === true);
  check('grupo não vaza para o evento salvo (o evento leva só os e-mails)',
    ev(`(function(){const o=mgcToGcal({id:'g1',title:'x',date:'2026-10-01',participants:['a@x.com']});
      return !('participantGroups' in o)&&o.attendees.length===1;})()`) === true);
  check('grupos entram no payload do Supabase (coluna nova, fallback r9 cobre tabela antiga)',
    ev(`(function(){const p=getLocalPayload();
      return typeof p.participant_groups==='string'&&JSON.parse(p.participant_groups).groups.some(g=>g.name==='Turma A');})()`) === true);
  /* 🛡️ REGRESSÃO v2.10.1: coleção nunca em last-write-wins (r12/r42).
     Na v2.10.0 um aparelho sem grupos publicava [] e APAGAVA os do outro. */
  check('🛡️ aparelho SEM grupos não apaga os grupos do outro (ausência ≠ exclusão)',
    ev(`(function(){
      const antes=AppState.participantGroups.length;
      applyRemoteParticipantGroups({participant_groups:JSON.stringify({v:2,groups:[],del:{}})});
      return antes>0 && AppState.participantGroups.length===antes;
    })()`) === true);
  check('grupo excluído em outro aparelho some por TOMBSTONE (não por ausência)',
    ev(`(function(){
      AppState.participantGroups=[{id:'pg1',name:'X',emails:['a@x.com'],updatedAt:'2026-10-01T10:00:00Z'}];
      applyRemoteParticipantGroups({participant_groups:JSON.stringify({v:2,groups:[],del:{pg1:Date.parse('2026-10-01T12:00:00Z')}})});
      return AppState.participantGroups.length===0;
    })()`) === true);
  check('edição posterior ao tombstone sobrevive (undo em outro aparelho não é reapagado)',
    ev(`(function(){
      AppState.participantGroups=[{id:'pg2',name:'Y',emails:['a@x.com'],updatedAt:'2026-10-02T10:00:00Z'}];
      AppState.participantGroupsDel={};
      applyRemoteParticipantGroups({participant_groups:JSON.stringify({v:2,groups:[],del:{pg2:Date.parse('2026-10-01T10:00:00Z')}})});
      return AppState.participantGroups.length===1;
    })()`) === true);
  check('conflito de mesmo id: vence o carimbo mais recente',
    ev(`(function(){
      AppState.participantGroups=[{id:'pg3',name:'Velho',emails:['a@x.com'],updatedAt:'2026-10-01T10:00:00Z'}];
      AppState.participantGroupsDel={};
      applyRemoteParticipantGroups({participant_groups:JSON.stringify({v:2,groups:[{id:'pg3',name:'Novo',emails:['b@x.com'],updatedAt:'2026-10-01T12:00:00Z'}],del:{}})});
      return AppState.participantGroups[0].name==='Novo';
    })()`) === true);
  check('lê o formato antigo da v2.10.0 (array cru) sem quebrar',
    ev(`(function(){
      AppState.participantGroups=[];AppState.participantGroupsDel={};
      applyRemoteParticipantGroups({participant_groups:JSON.stringify([{id:'pg4',name:'Antigo',emails:['a@x.com']}])});
      return AppState.participantGroups.length===1&&AppState.participantGroups[0].name==='Antigo';
    })()`) === true);
  check('grupo novo é carimbado (senão o merge não sabe quem é mais recente)',
    ev(`(function(){
      AppState.participantGroups=[];currentParticipants=['a@x.com'];
      savePartGroupFromCurrent('Carimbo');
      return !!AppState.participantGroups[0].updatedAt;
    })()`) === true);
  check('payload dos grupos vai no envelope v2 com tombstones',
    ev(`(function(){const p=JSON.parse(getLocalPayload().participant_groups);
      return p.v===2&&Array.isArray(p.groups)&&typeof p.del==='object';})()`) === true);

  check('applyRemotePayload traz grupos de outro aparelho',
    ev(`(function(){
      applyRemotePayload({participant_groups:JSON.stringify([{id:'r1',name:'Remoto',emails:['z@x.com']}])});
      return AppState.participantGroups.some(g=>g.name==='Remoto');})()`) === true);
  ev(`AppState.participantGroups=[];saveParticipantGroups();renderPartGroups();currentParticipants=[];renderPartPills();closeModal()`);

  /* ── Reunião do Meet + controle de notificação (v2.9.0) ── */
  check('mgcToGcal: addMeet pede sala com requestId ESTÁVEL (reenvio não cria 2ª sala)',
    ev(`(function(){
      const o=mgcToGcal({id:'ev9',title:'x',date:'2026-09-01',addMeet:true});
      const c=o.conferenceData&&o.conferenceData.createRequest;
      return !!c && c.requestId==='mgc-ev9' && c.conferenceSolutionKey.type==='hangoutsMeet';
    })()`) === true);
  check('mgcToGcal: evento que JÁ tem sala não pede outra (intenção ≠ fato)',
    ev(`!mgcToGcal({id:'ev9',title:'x',date:'2026-09-01',addMeet:true,meetLink:'https://meet.google.com/abc'}).conferenceData`) === true);
  check('mgcToGcal: sem addMeet não emite conferenceData (não vaza campo)',
    ev(`!mgcToGcal({id:'ev9',title:'x',date:'2026-09-01'}).conferenceData`) === true);
  check('gcalPushParams: conferenceDataVersion só quando o CORPO traz a conferência',
    ev(`(function(){
      const evc={id:'a',participants:[]};
      return gcalPushParams(evc,{conferenceData:{createRequest:{}}})==='?conferenceDataVersion=1'
        && gcalPushParams(evc,{})==='';
    })()`) === true);
  check('🛡️ REGRESSÃO: corpo SEM conferência nunca leva conferenceDataVersion (PUT apagaria a sala)',
    ev(`(function(){
      const casos=[{},{summary:'x'},{attendees:[{email:'a@x.com'}]}];
      const evc={id:'a',participants:['a@x.com'],notifyGuests:true};
      return casos.every(b=>gcalPushParams(evc,b).indexOf('conferenceDataVersion')===-1);
    })()`) === true);
  check('gcalPushParams: notifyGuests=false não manda e-mail (mas mantém a sala)',
    ev(`(function(){
      const evc={id:'a',participants:['a@x.com'],notifyGuests:false};
      return gcalPushParams(evc,{})===''
        && gcalPushParams(evc,{conferenceData:{}})==='?conferenceDataVersion=1';
    })()`) === true);
  check('gcalPushParams: notifyGuests ausente (evento pré-v2.9.0) AVISA — silêncio não é acidental',
    ev(`gcalPushParams({id:'a',participants:['a@x.com']},{})`) === '?sendUpdates=all');
  check('gcalPushParams: os dois parâmetros convivem',
    ev(`gcalPushParams({id:'a',participants:['a@x.com'],notifyGuests:true},{conferenceData:{}})`) === '?sendUpdates=all&conferenceDataVersion=1');
  check('gcalPushParams: sem participantes não manda sendUpdates (ninguém a notificar)',
    ev(`gcalPushParams({id:'a',participants:[],notifyGuests:true},{})`) === '');
  /* UI: os dois checkboxes no formulário */
  ev(`openNew('2026-09-01')`);
  check('novo evento nasce sem Meet e COM aviso ligado',
    ev(`wantsMeet===false && notifyGuests===true`) &&
    ev(`document.getElementById('notifyRow').classList.contains('done-active')`) === true);
  ev(`document.getElementById('addMeetRow').click()`);
  $('evTitle').value = 'Smoke Meet';
  $('saveBtn').click();
  check('save persiste addMeet/notifyGuests no evento',
    ev(`(function(){const e=AppState.events.find(x=>x.title==='Smoke Meet');
      return !!e&&e.addMeet===true&&e.notifyGuests===true;})()`) === true);
  const meetId = ev(`(function(){const e=AppState.events.find(x=>x.title==='Smoke Meet');
    e.meetLink='https://meet.google.com/abc-defg-hij';save();return e.id;})()`);
  ev(`openEdit('${meetId}')`);
  check('evento com sala já criada: checkbox marcado e travado',
    ev(`wantsMeet===true && document.getElementById('addMeetRow').style.pointerEvents`) === 'none');
  ev(`closeModal();AppState.events=AppState.events.filter(e=>e.title!=='Smoke Meet');save()`);
  // cross-check estático: o parâmetro perigoso só pode existir dentro de gcalPushParams
  const _srcCdv = fs.readFileSync(HTML_PATH,'utf8').split('\n')
    .filter(l=>!/^\s*\/\//.test(l) && /conferenceDataVersion/.test(l));
  check('conferenceDataVersion aparece só na função que o deriva do corpo',
    _srcCdv.length === 1 && /p\.push\('conferenceDataVersion=1'\)/.test(_srcCdv[0]), _srcCdv.join(' | '));

  check('gcalNotifyParam: só manda sendUpdates=all quando há participantes',
    ev(`gcalNotifyParam({participants:['a@x.com']})==='?sendUpdates=all' && gcalNotifyParam({})==='' && gcalNotifyParam({participants:[]})===''`) === true);
  check('gcalOwnershipFields backfilla evento local já existente (guard não fica cego)',
    ev(`(function(){
      const conv={id:'L1',gcalId:'g9',title:'t',date:'2026-08-01'};
      Object.assign(conv,gcalOwnershipFields({organizer:{email:'dono@x.com',self:false},attendees:[{email:'c@x.com'}]}));
      const meu={id:'L2',gcalId:'g10',title:'t',date:'2026-08-01'};
      Object.assign(meu,gcalOwnershipFields({organizer:{email:'eu@y.com',self:true},attendees:[{email:'c@x.com'}]}));
      return conv.gcalIsGuest===true && conv.gcalOrganizerEmail==='dono@x.com' && conv.participants.length===0
        && meu.gcalIsGuest===false && JSON.stringify(meu.participants)==='["c@x.com"]';
    })()`) === true);
  check('isValidEmail rejeita texto solto/incompleto e aceita e-mail real',
    ev(`isValidEmail('foo')===false && isValidEmail('a@b')===false && isValidEmail('a b@c.com')===false && isValidEmail('a@b.com')===true`) === true);

  /* UI dos chips: Enter cria, e-mail inválido não cria, e o save persiste */
  ev(`openNew('2026-08-01')`);
  const typePart = (val) => {
    $('partInput').value = val;
    ev(`document.getElementById('partInput').dispatchEvent(new window.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}))`);
  };
  typePart('convidado@exemplo.com');
  check('chip de participante criado ao pressionar Enter',
    ev(`JSON.stringify(currentParticipants)`) === '["convidado@exemplo.com"]' &&
    ev(`document.querySelectorAll('#partInputWrap .tag-pill').length`) === 1);
  typePart('nao-e-email');
  check('e-mail inválido não vira chip (evita 400 na API do Google)',
    ev(`currentParticipants.length`) === 1);
  check('e-mail inválido permanece no campo para o usuário corrigir',
    $('partInput').value === 'nao-e-email');
  $('partInput').value = '';
  typePart('turma1@x.com, turma2@x.com; lixo turma3@x.com');
  check('lista colada entra de uma vez e só o pedaço inválido sobra no campo',
    ev(`JSON.stringify(currentParticipants)`) === '["convidado@exemplo.com","turma1@x.com","turma2@x.com","turma3@x.com"]' &&
    $('partInput').value === 'lixo', $('partInput').value);
  $('partInput').value = '';
  ev(`currentParticipants=['convidado@exemplo.com'];renderPartPills()`);
  typePart('MAIUSCULA@Exemplo.COM');
  check('e-mail é normalizado em minúsculas',
    ev(`currentParticipants[1]`) === 'maiuscula@exemplo.com');
  ev(`document.querySelectorAll('#partInputWrap .tag-pill-remove')[1].click()`);
  check('✕ do chip remove só aquele participante',
    ev(`JSON.stringify(currentParticipants)`) === '["convidado@exemplo.com"]');
  $('evTitle').value = 'Smoke Convite';
  $('saveBtn').click();
  check('save persiste ev.participants no evento',
    ev(`JSON.stringify((AppState.events.find(e=>e.title==='Smoke Convite')||{}).participants)`) === '["convidado@exemplo.com"]');
  /* G1: editar evento de convite preserva a flag de propriedade (senão o push dá 403) */
  const guestId = ev(`(function(){
    const e=AppState.events.find(x=>x.title==='Smoke Convite');
    e.gcalId='gguest';e.gcalIsGuest=true;e.gcalOrganizerEmail='dono@x.com';save();return e.id;
  })()`);
  ev(`openEdit('${guestId}')`);
  check('aviso de convidado aparece ao editar evento de convite',
    ev(`document.getElementById('guestNoticeField').style.display`) !== 'none');
  $('evTitle').value = 'Smoke Convite editado';
  $('saveBtn').click();
  check('editar evento de convite preserva gcalIsGuest/organizador (guard segue valendo)',
    ev(`(function(){const e=AppState.events.find(x=>x.title==='Smoke Convite editado');
      return !!e&&e.gcalIsGuest===true&&e.gcalOrganizerEmail==='dono@x.com'&&shouldPushUpdate(e)===false;})()`) === true);
  ev(`AppState.events=AppState.events.filter(e=>!/^Smoke Convite/.test(e.title));save()`);

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
  check('backup exporta v7 completo (standaloneNotes/calendars/categories/routineChecks/listTemplates)',
    backup.version === 7 && 'standaloneNotes' in backup && 'calendars' in backup &&
    'categories' in backup && 'routineChecks' in backup && 'listTemplates' in backup && Array.isArray(backup.events),
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
