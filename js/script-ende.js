(function(){
"use strict";

/* ============================================================
   CONFIGURAÇÃO
   ============================================================ */
const STORAGE_KEY = 'ende_sim_v2';

const CATEGORIAS = {
  iluminacao:   { label:'Iluminação',          icon:'fa-lightbulb'   },
  refrigeracao: { label:'Refrigeração',        icon:'fa-snowflake'   },
  climatizacao: { label:'Climatização',        icon:'fa-wind'        },
  cozinha:      { label:'Cozinha',             icon:'fa-utensils'    },
  lavandaria:   { label:'Lavandaria',          icon:'fa-shirt'       },
  eletronica:   { label:'Eletrónica & Lazer',  icon:'fa-tv'          },
  escritorio:   { label:'Escritório & Estudo', icon:'fa-laptop'      },
  bombagem:     { label:'Bombagem & Outros',   icon:'fa-water'       },
  personalizado:{ label:'Personalizado',       icon:'fa-plug'        }
};

// horasSugeridas = valor de arranque, sempre editável no passo 2
const CATALOGO = [
  { nome:'Lâmpada LED 9W',                 potencia:9,    categoria:'iluminacao',   horasSugeridas:6  },
  { nome:'Lâmpada LED 12W',                potencia:12,   categoria:'iluminacao',   horasSugeridas:6  },
  { nome:'Lâmpada Incandescente 60W',      potencia:60,   categoria:'iluminacao',   horasSugeridas:6  },
  { nome:'Lâmpada Fluorescente Compacta',  potencia:15,   categoria:'iluminacao',   horasSugeridas:6  },
  { nome:'Candeeiro de Mesa',              potencia:40,   categoria:'iluminacao',   horasSugeridas:3  },

  { nome:'Frigorífico 150L',               potencia:120,  categoria:'refrigeracao', horasSugeridas:24 },
  { nome:'Frigorífico 200L',               potencia:200,  categoria:'refrigeracao', horasSugeridas:24 },
  { nome:'Frigorífico Duplex / Side-by-Side', potencia:350, categoria:'refrigeracao', horasSugeridas:24 },
  { nome:'Arca Congeladora 300L',          potencia:250,  categoria:'refrigeracao', horasSugeridas:24 },
  { nome:'Geleira Pequena / Mini-bar',     potencia:90,   categoria:'refrigeracao', horasSugeridas:24 },

  { nome:'Ventoinha de Mesa',              potencia:55,   categoria:'climatizacao', horasSugeridas:6  },
  { nome:'Ventilador de Tecto',            potencia:75,   categoria:'climatizacao', horasSugeridas:6  },
  { nome:'Ar Condicionado 9000 BTU',       potencia:900,  categoria:'climatizacao', horasSugeridas:6  },
  { nome:'Ar Condicionado 12000 BTU',      potencia:1200, categoria:'climatizacao', horasSugeridas:6  },
  { nome:'Ar Condicionado 18000 BTU',      potencia:1800, categoria:'climatizacao', horasSugeridas:5  },
  { nome:'Aquecedor Eléctrico',            potencia:1500, categoria:'climatizacao', horasSugeridas:2  },

  { nome:'Micro-ondas',                    potencia:1000, categoria:'cozinha',      horasSugeridas:0.5},
  { nome:'Fogão / Placa de Indução',       potencia:2000, categoria:'cozinha',      horasSugeridas:1  },
  { nome:'Liquidificador',                 potencia:400,  categoria:'cozinha',      horasSugeridas:0.3},
  { nome:'Chaleira Eléctrica',             potencia:1500, categoria:'cozinha',      horasSugeridas:0.5},
  { nome:'Torradeira',                     potencia:800,  categoria:'cozinha',      horasSugeridas:0.2},
  { nome:'Air Fryer',                      potencia:1400, categoria:'cozinha',      horasSugeridas:0.5},

  { nome:'Máquina de Lavar Roupa',         potencia:500,  categoria:'lavandaria',   horasSugeridas:1  },
  { nome:'Ferro de Engomar',               potencia:1200, categoria:'lavandaria',   horasSugeridas:0.7},

  { nome:'Televisor LED 32"',              potencia:60,   categoria:'eletronica',   horasSugeridas:4  },
  { nome:'Televisor LED 43"',              potencia:90,   categoria:'eletronica',   horasSugeridas:4  },
  { nome:'Televisor LED 55"',              potencia:120,  categoria:'eletronica',   horasSugeridas:4  },
  { nome:'Descodificador / TV Box',        potencia:15,   categoria:'eletronica',   horasSugeridas:5  },
  { nome:'Aparelhagem / Coluna de Som',    potencia:80,   categoria:'eletronica',   horasSugeridas:2  },
  { nome:'Router Wi-Fi',                   potencia:10,   categoria:'eletronica',   horasSugeridas:24 },
  { nome:'Consola de Jogos',               potencia:150,  categoria:'eletronica',   horasSugeridas:2  },

  { nome:'Computador de Secretária',       potencia:250,  categoria:'escritorio',   horasSugeridas:6  },
  { nome:'Computador Portátil',            potencia:65,   categoria:'escritorio',   horasSugeridas:6  },
  { nome:'Impressora',                     potencia:30,   categoria:'escritorio',   horasSugeridas:0.3},
  { nome:'Carregador de Telemóvel',        potencia:5,    categoria:'escritorio',   horasSugeridas:3  },

  { nome:'Bomba de Água 0.5 HP',           potencia:370,  categoria:'bombagem',     horasSugeridas:2  },
  { nome:'Bomba de Água 1 HP',             potencia:750,  categoria:'bombagem',     horasSugeridas:2  },
  { nome:'Câmara de Vigilância',           potencia:10,   categoria:'bombagem',     horasSugeridas:24 }
];

/* ============================================================
   ESTADO
   ============================================================ */
let state = {
  devices: [],
  tariff: 14.30,
  advice: ''
};
let currentTab = 0;
let sheetMode = 'catalogo';
let activeCategoryFilter = null;

/* ============================================================
   REFS DOM
   ============================================================ */
const $ = (id) => document.getElementById(id);
const listInv = $('device-list-inv');
const listHours = $('device-list-hours');
const emptyInv = $('empty-inv');
const emptyHours = $('empty-hours');
const emptyResults = $('empty-results');
const resultsWrap = $('results-wrap');
const overlay = $('overlay');
const sheet = $('add-sheet');
const catalogResults = $('catalog-results');
const catChips = $('cat-chips');
const catalogSearch = $('catalog-search');
const tariffInput = $('tariff-input');
const tariffHeader = $('tariff-display-header');
const anomalySelect = $('anomaly-select');
const anomalyResult = $('anomaly-result');
const adviceText = $('advice-text');
const presetAdvice = $('preset-advice');

/* ============================================================
   PERSISTÊNCIA
   ============================================================ */
function save(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){}
}
function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      if(parsed && Array.isArray(parsed.devices)) state = Object.assign(state, parsed);
      return;
    }
  }catch(e){}
  // primeira visita: exemplo mínimo para demonstrar o simulador
  state.devices = [
    mkDevice({ nome:'Lâmpada LED 12W', potencia:12, categoria:'iluminacao' }, 6, 6),
    mkDevice({ nome:'Frigorífico 200L', potencia:200, categoria:'refrigeracao' }, 1, 24)
  ];
}

function mkDevice(base, qty, horas){
  return {
    id: 'd' + Date.now() + Math.floor(Math.random()*10000),
    nome: base.nome,
    potencia: base.potencia,
    categoria: base.categoria,
    quantidade: qty,
    horas: horas,
    custom: !!base.custom
  };
}

/* ============================================================
   FORMATAÇÃO
   ============================================================ */
function fmt(n, dec){
  dec = (dec === undefined) ? 2 : dec;
  const v = isFinite(n) ? n : 0;
  try{
    return v.toLocaleString('pt-PT', {minimumFractionDigits:dec, maximumFractionDigits:dec});
  }catch(e){
    return v.toFixed(dec);
  }
}

/* ============================================================
   CÁLCULOS
   ============================================================ */
function dailyKwh(d){
  return (d.potencia * d.quantidade * d.horas) / 1000;
}
function totals(){
  const kwhDia = state.devices.reduce((s,d)=> s + dailyKwh(d), 0);
  const kwhMes = kwhDia * 30;
  const kzDia = kwhDia * state.tariff;
  const kzMes = kwhMes * state.tariff;
  return { kwhDia, kwhMes, kzDia, kzMes };
}

/* ============================================================
   RENDER — INVENTÁRIO
   ============================================================ */
function renderInventory(){
  listInv.innerHTML = '';
  emptyInv.classList.toggle('hidden', state.devices.length > 0);
  state.devices.forEach(d=>{
    const cat = CATEGORIAS[d.categoria] || CATEGORIAS.personalizado;
    const row = document.createElement('div');
    row.className = 'device-row';
    row.innerHTML = `
      <div class="d-icon"><i class="fa-solid ${cat.icon}"></i></div>
      <div class="d-info">
        <div class="d-name"><span>${escapeHtml(d.nome)}</span>${d.custom ? '<span class="d-tag">Personalizado</span>' : ''}</div>
        <div class="d-sub">${d.quantidade} × ${fmt(d.potencia,0)} W = <strong class="mono">${fmt(d.potencia*d.quantidade,0)} W</strong></div>
      </div>
      <div class="d-fields">
        <div class="field-mini">
          <label>Watts</label>
          <input type="number" min="1" value="${d.potencia}" data-id="${d.id}" data-field="potencia">
        </div>
        <div class="field-mini wide">
          <label>Qtd.</label>
          <input type="number" min="1" value="${d.quantidade}" data-id="${d.id}" data-field="quantidade">
        </div>
      </div>
      <button class="btn-remove" data-remove="${d.id}" title="Eliminar" aria-label="Remover"><i class="fa-solid fa-trash"></i></button>
    `;
    listInv.appendChild(row);
  });

  listInv.querySelectorAll('input').forEach(inp=>{
    inp.addEventListener('input', onFieldChange);
  });
  listInv.querySelectorAll('[data-remove]').forEach(btn=>{
    btn.addEventListener('click', ()=> removeDevice(btn.getAttribute('data-remove')));
  });
}

function onFieldChange(e){
  const id = e.target.getAttribute('data-id');
  const field = e.target.getAttribute('data-field');
  let val = parseFloat(e.target.value);
  if(isNaN(val) || val < 0) val = 0;
  const dev = state.devices.find(d=> d.id === id);
  if(!dev) return;
  dev[field] = val;
  save();
  renderAll(true);
}

function removeDevice(id){
  state.devices = state.devices.filter(d=> d.id !== id);
  save();
  renderAll();
}

/* ============================================================
   RENDER — PERÍODO DE USO
   ============================================================ */
const HOUR_PRESETS = [1,2,4,6,8,12,24];

function renderHours(){
  listHours.innerHTML = '';
  emptyHours.classList.toggle('hidden', state.devices.length > 0);
  state.devices.forEach(d=>{
    const cat = CATEGORIAS[d.categoria] || CATEGORIAS.personalizado;
    const row = document.createElement('div');
    row.className = 'device-row';
    row.style.flexWrap = 'wrap';
    row.innerHTML = `
      <div class="d-icon"><i class="fa-solid ${cat.icon}"></i></div>
      <div class="d-info">
        <div class="d-name"><span>${escapeHtml(d.nome)}</span></div>
        <div class="d-sub">${fmt(d.potencia*d.quantidade,0)} W instalados</div>
        <div class="hours-chips" data-chips="${d.id}">
          ${HOUR_PRESETS.map(h=>`<button type="button" class="chip ${d.horas===h?'active':''}" data-hours="${h}" data-id="${d.id}">${h}h</button>`).join('')}
        </div>
      </div>
      <div class="d-fields">
        <div class="field-mini">
          <label>Horas/dia</label>
          <input type="number" min="0" max="24" step="0.5" value="${d.horas}" data-id="${d.id}" data-field="horas">
        </div>
      </div>
      <div class="kwh-readout mono">${fmt(dailyKwh(d))} kWh/d</div>
    `;
    listHours.appendChild(row);
  });

  listHours.querySelectorAll('input[data-field="horas"]').forEach(inp=>{
    inp.addEventListener('input', (e)=>{
      const val = Math.max(0, Math.min(24, parseFloat(e.target.value) || 0));
      const dev = state.devices.find(d=> d.id === e.target.getAttribute('data-id'));
      if(dev){ dev.horas = val; save(); renderAll(true); }
    });
  });
  listHours.querySelectorAll('[data-hours]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const dev = state.devices.find(d=> d.id === btn.getAttribute('data-id'));
      if(dev){ dev.horas = parseFloat(btn.getAttribute('data-hours')); save(); renderAll(); }
    });
  });
}

/* ============================================================
   RENDER — RESULTADOS
   ============================================================ */
function renderResults(){
  const hasDevices = state.devices.length > 0;
  emptyResults.classList.toggle('hidden', hasDevices);
  resultsWrap.classList.toggle('hidden', !hasDevices);
  if(!hasDevices) return;

  const t = totals();
  $('v-kwh-dia').textContent = fmt(t.kwhDia);
  $('v-kwh-mes').textContent = fmt(t.kwhMes);
  $('v-kz-dia').textContent = fmt(t.kzDia, 0);
  $('v-kz-mes').textContent = fmt(t.kzMes, 0);

  const sorted = [...state.devices].sort((a,b)=> dailyKwh(b) - dailyKwh(a));
  const top = sorted[0];
  $('top-consumer-sub').textContent = top ? `Maior consumidor: ${top.nome}` : '—';

  const maxKwh = sorted.length ? dailyKwh(sorted[0]) : 1;
  const bkList = $('breakdown-list');
  bkList.innerHTML = sorted.map((d,i)=>{
    const kwh = dailyKwh(d);
    const pct = maxKwh > 0 ? Math.max(4, (kwh/maxKwh)*100) : 4;
    const cost = kwh * state.tariff;
    return `
      <div class="bk-row">
        <div class="bk-top">
          <div class="bk-name"><span class="bk-rank">${i+1}</span><span>${escapeHtml(d.nome)}</span></div>
          <div class="bk-val">${fmt(kwh)} kWh/d · ${fmt(cost,0)} Kz/d</div>
        </div>
        <div class="bk-track"><div class="bk-fill" style="width:${pct}%"></div></div>
      </div>`;
  }).join('');

  // popular select da anomalia
  const prevSelected = anomalySelect.value;
  anomalySelect.innerHTML = '<option value="">-- Seleccionar equipamento --</option>' +
    state.devices.map(d=> `<option value="${d.id}">${escapeHtml(d.nome)}</option>`).join('');
  if(state.devices.some(d=> d.id === prevSelected)) anomalySelect.value = prevSelected;
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ============================================================
   RENDER GERAL
   ============================================================ */
function renderAll(skipHeavy){
  renderInventory();
  renderHours();
  renderResults();
  updateProgress();
  if(!skipHeavy){ /* reservado para futuras optimizações */ }
}

function updateProgress(){
  document.querySelectorAll('.progress-seg').forEach((seg,i)=>{
    seg.classList.toggle('done', i < currentTab);
    seg.classList.toggle('current', i === currentTab);
  });
}

/* ============================================================
   TABS
   ============================================================ */
function switchTab(idx){
  currentTab = idx;
  document.querySelectorAll('.tab').forEach(t=> t.classList.toggle('active', +t.getAttribute('data-tab')===idx));
  document.querySelectorAll('.panel').forEach((p,i)=> p.classList.toggle('active', i===idx));
  updateProgress();
  window.scrollTo({top:0, behavior:'smooth'});
}
document.querySelectorAll('.tab').forEach(t=>{
  t.addEventListener('click', ()=> switchTab(+t.getAttribute('data-tab')));
});

/* ============================================================
   SHEET — Adicionar equipamento
   ============================================================ */
function openSheet(){
  overlay.classList.add('open');
  sheet.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCatChips();
  renderCatalog();
  setTimeout(()=> catalogSearch.focus(), 250);
}
function closeSheet(){
  overlay.classList.remove('open');
  sheet.classList.remove('open');
  document.body.style.overflow = '';
}
$('btn-open-sheet').addEventListener('click', openSheet);
$('sheet-close').addEventListener('click', closeSheet);
overlay.addEventListener('click', closeSheet);

document.querySelectorAll('.mode-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    sheetMode = btn.getAttribute('data-mode');
    document.querySelectorAll('.mode-btn').forEach(b=> b.classList.toggle('active', b===btn));
    $('mode-catalogo').classList.toggle('hidden', sheetMode !== 'catalogo');
    $('mode-personalizado').classList.toggle('hidden', sheetMode !== 'personalizado');
  });
});

function renderCatChips(){
  const cats = Object.keys(CATEGORIAS).filter(k=> k !== 'personalizado');
  catChips.innerHTML = '<button class="cat-chip active" data-cat="">Todos</button>' +
    cats.map(k=> `<button class="cat-chip" data-cat="${k}">${CATEGORIAS[k].label}</button>`).join('');
  catChips.querySelectorAll('.cat-chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      activeCategoryFilter = chip.getAttribute('data-cat') || null;
      catChips.querySelectorAll('.cat-chip').forEach(c=> c.classList.toggle('active', c===chip));
      renderCatalog();
    });
  });
}

function renderCatalog(){
  const q = catalogSearch.value.trim().toLowerCase();
  let items = CATALOGO.filter(item=>{
    const matchesQuery = !q || item.nome.toLowerCase().includes(q);
    const matchesCat = !activeCategoryFilter || item.categoria === activeCategoryFilter;
    return matchesQuery && matchesCat;
  });

  if(items.length === 0){
    catalogResults.innerHTML = '<div class="no-results"><i class="fa-solid fa-magnifying-glass" style="display:block;font-size:1.4rem;margin-bottom:8px;color:var(--line);"></i>Nenhum equipamento encontrado.<br>Experimente "Personalizado" para o adicionar manualmente.</div>';
    return;
  }

  // agrupar por categoria mantendo ordem do catálogo
  const groups = {};
  items.forEach(it=>{
    if(!groups[it.categoria]) groups[it.categoria] = [];
    groups[it.categoria].push(it);
  });

  let html = '';
  Object.keys(groups).forEach(catKey=>{
    html += `<div class="catalog-group-label">${CATEGORIAS[catKey].label}</div>`;
    groups[catKey].forEach(it=>{
      html += `
        <button type="button" class="catalog-item" data-add-catalog="${it.nome}">
          <div class="d-icon"><i class="fa-solid ${CATEGORIAS[it.categoria].icon}"></i></div>
          <div>
            <div class="ci-name">${escapeHtml(it.nome)}</div>
            <div class="ci-watt">${it.potencia} W</div>
          </div>
          <i class="fa-solid fa-circle-plus ci-add"></i>
        </button>`;
    });
  });
  catalogResults.innerHTML = html;

  catalogResults.querySelectorAll('[data-add-catalog]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const nome = btn.getAttribute('data-add-catalog');
      const item = CATALOGO.find(c=> c.nome === nome);
      if(!item) return;
      state.devices.push(mkDevice(item, 1, item.horasSugeridas));
      save();
      renderAll();
      closeSheet();
    });
  });
}
catalogSearch.addEventListener('input', renderCatalog);

$('btn-add-custom').addEventListener('click', ()=>{
  const nome = $('custom-name').value.trim();
  const watts = parseFloat($('custom-watts').value);
  const qty = Math.max(1, parseInt($('custom-qty').value) || 1);
  if(!nome){ $('custom-name').focus(); return; }
  if(!watts || watts <= 0){ $('custom-watts').focus(); return; }
  state.devices.push(mkDevice({ nome, potencia:watts, categoria:'personalizado', custom:true }, qty, 3));
  save();
  $('custom-name').value = '';
  $('custom-watts').value = '';
  $('custom-qty').value = '1';
  renderAll();
  closeSheet();
});

/* ============================================================
   TARIFA
   ============================================================ */
tariffInput.addEventListener('input', ()=>{
  const val = parseFloat(tariffInput.value);
  state.tariff = isNaN(val) ? 0 : val;
  tariffHeader.textContent = fmt(state.tariff) + ' Kz/kWh';
  save();
  renderResults();
});

/* ============================================================
   ANOMALIA
   ============================================================ */
$('btn-anomaly').addEventListener('click', ()=>{
  const id = anomalySelect.value;
  const dev = state.devices.find(d=> d.id === id);
  if(!dev){
    anomalyResult.classList.remove('show');
    return;
  }
  const normalKwhMes = dailyKwh(dev) * 30;
  const anomKwhDia = (dev.potencia * dev.quantidade * 24) / 1000;
  const anomKwhMes = anomKwhDia * 30;
  const extraKwhMes = anomKwhMes - normalKwhMes;
  const extraKzMes = extraKwhMes * state.tariff;

  anomalyResult.innerHTML = `Se <strong>${escapeHtml(dev.nome)}</strong> ficar ligado <strong>24h/dia</strong> em vez de <strong>${fmt(dev.horas,1)}h/dia</strong>, o consumo mensal deste equipamento passa de <strong>${fmt(normalKwhMes)} kWh</strong> para <strong>${fmt(anomKwhMes)} kWh</strong> — um custo extra estimado de <strong>${fmt(extraKzMes,0)} Kz/mês</strong>.`;
  anomalyResult.classList.add('show');
});
anomalySelect.addEventListener('change', ()=> anomalyResult.classList.remove('show'));

/* ============================================================
   CONSELHO DO TÉCNICO
   ============================================================ */
adviceText.addEventListener('input', ()=>{
  state.advice = adviceText.value;
  save();
});
presetAdvice.addEventListener('change', ()=>{
  const val = presetAdvice.value;
  if(!val) return;
  adviceText.value = adviceText.value.trim() ? (adviceText.value.trim() + '\n- ' + val) : val;
  state.advice = adviceText.value;
  save();
  presetAdvice.value = '';
});

/* ============================================================
   IMPRIMIR / REINICIAR
   ============================================================ */
$('btn-print').addEventListener('click', ()=> window.print());

$('btn-reset').addEventListener('click', ()=>{
  if(!confirm('Tem a certeza que deseja reiniciar o simulador? Todos os equipamentos e dados serão apagados.')) return;
  try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
  state = { devices:[], tariff:14.30, advice:'' };
  adviceText.value = '';
  tariffInput.value = '14.30';
  tariffHeader.textContent = '14,30 Kz/kWh';
  anomalyResult.classList.remove('show');
  switchTab(0);
  renderAll();
});

/* ============================================================
   INIT
   ============================================================ */
load();
tariffInput.value = state.tariff;
tariffHeader.textContent = fmt(state.tariff) + ' Kz/kWh';
adviceText.value = state.advice || '';
renderAll();

})();