
/* Fallback visual: se "robo-*.png" ainda não existir, mostra um ícone em vez de uma imagem partida.
   Basta substituir os ficheiros PNG na mesma pasta do HTML — nada no código precisa de mudar. */
function handleRoboError(img, placeholderId){
  img.classList.add('hidden');
  const ph = document.getElementById(placeholderId);
  if(ph) ph.classList.remove('hidden');
}

(function(){
"use strict";

/* ============================================================
   PARTÍCULAS AMBIENTE — geradas uma vez, decorativas, sem estado
   ============================================================ */
(function criarParticulas(){
  const camada = document.getElementById('particulas');
  const total = 16;
  for(let i=0;i<total;i++){
    const p = document.createElement('span');
    p.className = 'particula';
    const tamanho = 3 + Math.random()*5;
    p.style.width = tamanho + 'px';
    p.style.height = tamanho + 'px';
    p.style.left = (Math.random()*100) + 'vw';
    p.style.setProperty('--drift', (Math.random()*80-40) + 'px');
    p.style.animationDuration = (10 + Math.random()*10) + 's';
    p.style.animationDelay = (Math.random()*14) + 's';
    camada.appendChild(p);
  }
})();

/* ============================================================
   MÁQUINA DE ESTADOS DO TOTEM
   estadoAtual: 'boas-vindas' | 'simulador' | 'selfie'
   ============================================================ */
let estadoAtual = 'boas-vindas';

function mostrarTela(nome){
  document.querySelectorAll('.tela').forEach(t=> t.classList.add('hidden'));
  document.querySelector(`.tela[data-tela="${nome}"]`).classList.remove('hidden');
  estadoAtual = nome;
}

/* ---------- TRANSIÇÃO: qualquer ecrã → TELA 1 (Boas-vindas) ---------- */
function irParaBoasVindas(){
  // pára qualquer locução e temporizador pendente de outros ecrãs antes de trocar
  audioSorria.pause();
  audioAgradecimento.pause();
  clearTimeout(idleTimeoutId);
  clearTimeout(selfieTimeoutId);
  clearTimeout(agradecimentoFallbackId);
  mostrarTela('boas-vindas');
  // o texto do robô é "escrito" de novo sempre que o totem volta ao início,
  // para parecer que está a cumprimentar cada novo visitante
  escreverTexto(document.getElementById('texto-boas-vindas'), TEXTO_BOAS_VINDAS, 50);
  tocarLoopBoasVindas();
}

/* ---------- TRANSIÇÃO: TELA 1 → TELA 2 (Simulador) ---------- */
function irParaSimulador(){
  pararLoopBoasVindas();
  mostrarTela('simulador');
  switchTab(0);
  renderAll();
  reiniciarIdleTimer(); // recomeça a contagem de inactividade só dentro do simulador
}

/* ---------- TRANSIÇÃO: TELA 2 → TELA 3 (Selfie) ---------- */
function irParaSelfie(){
  clearTimeout(idleTimeoutId); // não há sentido em "expulsar por inactividade" durante a selfie
  mostrarTela('selfie');
  // repõe sempre a pose de sorriso e a legenda inicial ao entrar neste ecrã
  const img = document.getElementById('robo-img-selfie');
  img.classList.remove('hidden');
  img.src = 'robo-sorriso.png';
  document.getElementById('robo-placeholder-selfie').classList.add('hidden');
  document.getElementById('selfie-legenda').textContent = 'Sorria! Tire uma fotografia com o robô da ENDE para recordar a FILDA 2026.';
  document.getElementById('btn-selfie-pronto').classList.remove('hidden');
  // locução "Sorria..." toca uma única vez, só ao entrar neste ecrã —
  // se o visitante voltar aqui por ter clicado "Ainda não", esta função
  // não é chamada de novo, por isso o áudio não se repete (como pedido)
  if(!mudo){ audioSorria.currentTime = 0; audioSorria.play().catch(()=>{}); }
  iniciarTemporizadorSelfie();
}

/* ============================================================
   LOCUÇÕES GRAVADAS (áudio humano, substitui a Web Speech API)
   3 ficheiros, cada um tratado de forma diferente:
   - audio-boas-vindas: toca em loop infinito na Tela 1, com uma pequena
     pausa entre repetições, até o visitante tocar em "Iniciar Simulação"
   - audio-sorria: toca uma única vez ao entrar na Tela 3
   - audio-agradecimento: toca uma única vez quando o visitante confirma
     "Sim" (já tirou a foto), sincronizado com a troca de pose do robô
   ============================================================ */
const audioBoasVindas = document.getElementById('audio-boas-vindas');
const audioSorria = document.getElementById('audio-sorria');
const audioAgradecimento = document.getElementById('audio-agradecimento');

const GAP_LOOP_BOAS_VINDAS_MS = 4000; // "alguns tempinho" de silêncio entre repetições do loop
let mudo = false;                      // controlado pelo botão "Som ligado/Som desligado"
let loopBoasVindasTimeoutId = null;
let primeiroGestoPendente = false;     // true se o autoplay foi bloqueado e falta um toque do utilizador

audioBoasVindas.onended = function(){
  loopBoasVindasTimeoutId = setTimeout(()=>{
    if(estadoAtual === 'boas-vindas' && !mudo) audioBoasVindas.play().catch(()=>{});
  }, GAP_LOOP_BOAS_VINDAS_MS);
};

function tocarLoopBoasVindas(){
  clearTimeout(loopBoasVindasTimeoutId);
  if(mudo) return;
  audioBoasVindas.currentTime = 0;
  const promessa = audioBoasVindas.play();
  if(promessa && promessa.catch){
    promessa.catch(()=>{
      // a maioria dos navegadores bloqueia áudio com som antes do 1º toque do utilizador;
      // fica à espera do primeiro toque no ecrã para arrancar o loop automaticamente
      primeiroGestoPendente = true;
    });
  }
}
function pararLoopBoasVindas(){
  clearTimeout(loopBoasVindasTimeoutId);
  audioBoasVindas.pause();
}
// assim que houver o primeiro toque em qualquer parte do ecrã, destrava o autoplay do totem
document.addEventListener('touchstart', desbloquearAutoplay, {passive:true, once:true});
document.addEventListener('click', desbloquearAutoplay, {once:true});
function desbloquearAutoplay(){
  if(primeiroGestoPendente && estadoAtual === 'boas-vindas' && !mudo){
    audioBoasVindas.play().catch(()=>{});
  }
  primeiroGestoPendente = false;
}

/* Botão "Som ligado / Som desligado" — silencia ou retoma o loop da Tela 1 */
const btnMudo = document.getElementById('btn-mudo');
const btnMudoLabel = document.getElementById('btn-mudo-label');
btnMudo.addEventListener('click', function(){
  mudo = !mudo;
  if(mudo){
    pararLoopBoasVindas();
    btnMudo.querySelector('i').className = 'fa-solid fa-volume-xmark';
    btnMudoLabel.textContent = 'Som desligado';
    btnMudo.setAttribute('aria-pressed','true');
  }else{
    btnMudo.querySelector('i').className = 'fa-solid fa-volume-high';
    btnMudoLabel.textContent = 'Som ligado';
    btnMudo.setAttribute('aria-pressed','false');
    tocarLoopBoasVindas();
  }
});

/* ============================================================
   TELA 1 — texto do robô (efeito de escrita, sincronizado com o áudio)
   ============================================================ */
const TEXTO_BOAS_VINDAS = 'Olá! Bem-vindo à FILDA 2026. Sou o assistente de Literacia Energética da ENDE. Queres testar o nosso simulador inteligente ou aprender a poupar energia?';

function escreverTexto(el, texto, velocidade){
  el.textContent = '';
  let i = 0;
  (function passo(){
    if(i <= texto.length){
      el.textContent = texto.slice(0, i);
      i++;
      setTimeout(passo, velocidade);
    }
  })();
}

// efeito "ripple" tátil no botão gigante — feedback imediato ao toque
function aplicarRipple(e, botao){
  const r = document.createElement('span');
  r.className = 'ripple';
  const rect = botao.getBoundingClientRect();
  const tamanho = Math.max(rect.width, rect.height);
  r.style.width = r.style.height = tamanho + 'px';
  const origemX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left - tamanho/2;
  const origemY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top - tamanho/2;
  r.style.left = origemX + 'px';
  r.style.top = origemY + 'px';
  botao.appendChild(r);
  setTimeout(()=> r.remove(), 650);
}
const btnIniciar = document.getElementById('btn-iniciar');
btnIniciar.addEventListener('click', (e)=>{ aplicarRipple(e, btnIniciar); irParaSimulador(); });

/* ============================================================
   TEMPORIZADOR DE INACTIVIDADE (só durante a TELA 2)
   Devolve o totem ao ecrã de boas-vindas para o próximo visitante
   caso ninguém toque no ecrã durante 90 segundos.
   ============================================================ */
const LIMITE_INACTIVIDADE_MS = 90000;
let idleTimeoutId = null;
function reiniciarIdleTimer(){
  clearTimeout(idleTimeoutId);
  if(estadoAtual !== 'simulador') return;
  idleTimeoutId = setTimeout(irParaBoasVindas, LIMITE_INACTIVIDADE_MS);
}
['click','touchstart','input'].forEach(evt=> document.addEventListener(evt, reiniciarIdleTimer, {passive:true}));


/* ============================================================
   CATÁLOGO E ESTADO DO SIMULADOR (TELA 2)
   ============================================================ */
const STORAGE_KEY = 'ende_totem_filda2026';

const CATEGORIAS = {
  iluminacao:   { label:'Iluminação',          icon:'fa-lightbulb'  },
  refrigeracao: { label:'Refrigeração',        icon:'fa-snowflake'  },
  climatizacao: { label:'Climatização',        icon:'fa-wind'       },
  cozinha:      { label:'Cozinha',             icon:'fa-utensils'   },
  lavandaria:   { label:'Lavandaria',          icon:'fa-shirt'      },
  eletronica:   { label:'Eletrónica & Lazer',  icon:'fa-tv'         },
  escritorio:   { label:'Escritório & Estudo', icon:'fa-laptop'     },
  bombagem:     { label:'Bombagem & Outros',   icon:'fa-water'      },
  personalizado:{ label:'Personalizado',       icon:'fa-plug'       }
};

/* ============================================================
   TARIFÁRIOS REAIS DA ENDE (Baixa/Média Tensão)
   Fórmula geral confirmada: F = (TaxaFixa × PC + TarifaKwh × W) × 1,14
   PC = Potência Contratada (kVA) · W = consumo mensal (kWh)
   "fixaEditavel: true" no BT-Trif porque a taxa fixa ainda não foi
   confirmada — fica como campo editável na interface até termos o valor certo.
   ============================================================ */
const TARIFARIOS = {
  'bt-mono':   { label:'BT-Mono (Monofásica)',            short:'BT-Mono',   taxaFixa:117,    tarifaKwh:14.16, fixaEditavel:false },
  'bt-trif':   { label:'BT-Trif (Trifásica)',             short:'BT-Trif',   taxaFixa:null,   tarifaKwh:19.16, fixaEditavel:true  },
  'bt-ts':     { label:'BT-TS',                            short:'BT-TS',     taxaFixa:130,    tarifaKwh:19.17, fixaEditavel:false },
  'mt-comind': { label:'MT-Comércio e Indústria',          short:'MT-Com/Ind',taxaFixa:239.20, tarifaKwh:14.99, fixaEditavel:false }
};

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

let state = { devices: [], categoria: 'bt-mono', pc: 6.6, taxaFixaTrif: null, advice: '' };
let currentTab = 0;
let sheetMode = 'catalogo';
let activeCategoryFilter = null;
let chartConsumo = null;
let qrGerado = false;

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
const categoriaSelect = $('categoria-select');
const pcInput = $('pc-input');
const taxaFixaTrifRow = $('taxa-fixa-trif-row');
const taxaFixaTrifInput = $('taxa-fixa-trif-input');
const tarifaKwhAplicadaEl = $('tarifa-kwh-aplicada');
const taxaFixaAplicadaEl = $('taxa-fixa-aplicada');
const avisoTrif = $('aviso-trif');
const tariffHeader = $('tariff-display-header');
const anomalySelect = $('anomaly-select');
const anomalyResult = $('anomaly-result');
const adviceText = $('advice-text');
const presetAdvice = $('preset-advice');

/* ---------- Persistência (localStorage) ---------- */
function save(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){}
}
function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      if(parsed && Array.isArray(parsed.devices)){ state = Object.assign(state, parsed); return; }
    }
  }catch(e){}
  // primeiro visitante do dia / sem dados guardados: exemplo mínimo para demonstrar o simulador
  state.devices = [
    mkDevice({ nome:'Lâmpada LED 12W', potencia:12, categoria:'iluminacao' }, 6, 6),
    mkDevice({ nome:'Frigorífico 200L', potencia:200, categoria:'refrigeracao' }, 1, 24)
  ];
}
function mkDevice(base, qty, horas){
  return { id:'d'+Date.now()+Math.floor(Math.random()*10000), nome:base.nome, potencia:base.potencia, categoria:base.categoria, quantidade:qty, horas:horas, custom:!!base.custom };
}

/* Prepara o totem para o visitante seguinte: limpa a lista e repõe os valores por omissão */
function limparSimuladorParaProximoVisitante(){
  try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
  state = { devices:[], categoria:'bt-mono', pc:6.6, taxaFixaTrif:null, advice:'' };
  load();
  qrGerado = false; // o QR é estático, mas garante que o gráfico/lista voltam a desenhar-se do zero
}

function fmt(n, dec){
  dec = (dec===undefined) ? 2 : dec;
  const v = isFinite(n) ? n : 0;
  try{ return v.toLocaleString('pt-PT',{minimumFractionDigits:dec,maximumFractionDigits:dec}); }
  catch(e){ return v.toFixed(dec); }
}

/* ============================================================
   FÓRMULA OFICIAL DE CÁLCULO — fatura real da ENDE (Baixa/Média Tensão):
   Consumo diário (kWh) = Potência (W) × Quantidade × Horas/dia ÷ 1000
   Consumo mensal (kWh)  = Consumo diário × 30
   Custo diário (Kz)     = Consumo diário × Tarifa/kWh  (só energia — a
                            taxa fixa é uma cobrança mensal, não diária)
   Custo mensal (Kz)     = (TaxaFixa × PC + Tarifa/kWh × Consumo mensal) × 1,14
   PC = Potência Contratada (kVA) · 1,14 = imposto de 14%
   ============================================================ */
function dailyKwh(d){
  return (d.potencia * d.quantidade * d.horas) / 1000;
}
function tarifarioAtual(){
  return TARIFARIOS[state.categoria] || TARIFARIOS['bt-mono'];
}
function taxaFixaAtual(){
  const t = tarifarioAtual();
  if(t.fixaEditavel) return (typeof state.taxaFixaTrif === 'number' && !isNaN(state.taxaFixaTrif)) ? state.taxaFixaTrif : 0;
  return t.taxaFixa;
}
function totals(){
  const kwhDia = state.devices.reduce((s,d)=> s + dailyKwh(d), 0);
  const kwhMes = kwhDia * 30;
  const t = tarifarioAtual();
  const taxaFixa = taxaFixaAtual();
  const kzDia = kwhDia * t.tarifaKwh;
  const kzMes = (taxaFixa * state.pc + t.tarifaKwh * kwhMes) * 1.14;
  return { kwhDia, kwhMes, kzDia, kzMes };
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ---------- Render: Inventário ---------- */
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
        <div class="field-mini"><label>Watts</label><input type="number" min="1" value="${d.potencia}" data-id="${d.id}" data-field="potencia"></div>
        <div class="field-mini wide"><label>Qtd.</label><input type="number" min="1" value="${d.quantidade}" data-id="${d.id}" data-field="quantidade"></div>
      </div>
      <button class="btn-remove" data-remove="${d.id}" aria-label="Remover"><i class="fa-solid fa-trash"></i></button>`;
    listInv.appendChild(row);
  });
  listInv.querySelectorAll('input').forEach(inp=> inp.addEventListener('input', onFieldChange));
  listInv.querySelectorAll('[data-remove]').forEach(btn=> btn.addEventListener('click', ()=> removeDevice(btn.getAttribute('data-remove'))));
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
  renderAll();
}
function removeDevice(id){
  state.devices = state.devices.filter(d=> d.id !== id);
  save();
  renderAll();
}

/* ---------- Render: Período de Uso ---------- */
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
        <div class="hours-chips">
          ${HOUR_PRESETS.map(h=>`<button type="button" class="chip ${d.horas===h?'active':''}" data-hours="${h}" data-id="${d.id}">${h}h</button>`).join('')}
        </div>
      </div>
      <div class="d-fields"><div class="field-mini"><label>Horas/dia</label><input type="number" min="0" max="24" step="0.5" value="${d.horas}" data-id="${d.id}" data-field="horas"></div></div>
      <div class="kwh-readout mono">${fmt(dailyKwh(d))} kWh/d</div>`;
    listHours.appendChild(row);
  });
  listHours.querySelectorAll('input[data-field="horas"]').forEach(inp=>{
    inp.addEventListener('input', (e)=>{
      const val = Math.max(0, Math.min(24, parseFloat(e.target.value) || 0));
      const dev = state.devices.find(d=> d.id === e.target.getAttribute('data-id'));
      if(dev){ dev.horas = val; save(); renderAll(); }
    });
  });
  listHours.querySelectorAll('[data-hours]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const dev = state.devices.find(d=> d.id === btn.getAttribute('data-id'));
      if(dev){ dev.horas = parseFloat(btn.getAttribute('data-hours')); save(); renderAll(); }
    });
  });
}

/* ---------- Render: Resultados (estatísticas + gráfico Chart.js + QR) ---------- */
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
  $('breakdown-list').innerHTML = sorted.map((d,i)=>{
    const kwh = dailyKwh(d);
    const pct = maxKwh > 0 ? Math.max(4, (kwh/maxKwh)*100) : 4;
    const cost = kwh * tarifarioAtual().tarifaKwh;
    return `<div class="bk-row">
      <div class="bk-top"><div class="bk-name"><span class="bk-rank">${i+1}</span><span>${escapeHtml(d.nome)}</span></div>
      <div class="bk-val">${fmt(kwh)} kWh/d · ${fmt(cost,0)} Kz/d</div></div>
      <div class="bk-track"><div class="bk-fill" style="width:${pct}%"></div></div></div>`;
  }).join('');

  renderizarGrafico(sorted);

  const prevSelected = anomalySelect.value;
  anomalySelect.innerHTML = '<option value="">-- Seleccionar equipamento --</option>' +
    state.devices.map(d=> `<option value="${d.id}">${escapeHtml(d.nome)}</option>`).join('');
  if(state.devices.some(d=> d.id === prevSelected)) anomalySelect.value = prevSelected;
}

/* Gráfico de rosca (Chart.js) — distribuição do consumo diário por equipamento,
   agrupando os equipamentos além do 5º em "Outros" para manter a legenda legível. */
function renderizarGrafico(sortedDevices){
  const canvas = $('grafico-consumo');
  if(!canvas || typeof Chart === 'undefined') return;
  const top5 = sortedDevices.slice(0,5);
  const resto = sortedDevices.slice(5);
  const labels = top5.map(d=> d.nome);
  const valores = top5.map(d=> dailyKwh(d));
  if(resto.length){
    labels.push('Outros');
    valores.push(resto.reduce((s,d)=> s + dailyKwh(d), 0));
  }
  const cores = ['#FF7A1A','#FFC93C','#1D63AC','#0F3460','#E85D04','#8797A8'];
  if(chartConsumo){ chartConsumo.destroy(); }
  chartConsumo = new Chart(canvas, {
    type:'doughnut',
    data:{ labels, datasets:[{ data:valores, backgroundColor:cores.slice(0,labels.length), borderWidth:0 }] },
    options:{
      maintainAspectRatio:true,
      plugins:{ legend:{ position:'bottom', labels:{ boxWidth:11, font:{ family:'Inter', size:11 } } } },
      cutout:'62%'
    }
  });
}

/* Gera o QR Code do Instagram oficial da ENDE apenas uma vez (conteúdo estático) */
function gerarQRInstagram(){
  if(qrGerado) return;
  const alvo = $('qr-instagram');
  if(!alvo || typeof QRCode === 'undefined') return;
  alvo.innerHTML = '';
  new QRCode(alvo, {
    text:'https://www.instagram.com/ende_oficial/',
    width:118, height:118,
    colorDark:'#0B2547', colorLight:'#FFFFFF',
    correctLevel: QRCode.CorrectLevel.M
  });
  qrGerado = true;
}

function renderAll(){
  renderInventory();
  renderHours();
  renderResults();
  updateProgress();
}
function updateProgress(){
  document.querySelectorAll('.progress-seg').forEach((seg,i)=>{
    seg.classList.toggle('done', i < currentTab);
    seg.classList.toggle('current', i === currentTab);
  });
}

/* ---------- Abas ---------- */
function switchTab(idx){
  currentTab = idx;
  document.querySelectorAll('.tab').forEach(t=> t.classList.toggle('active', +t.getAttribute('data-tab')===idx));
  document.querySelectorAll('.panel').forEach((p,i)=> p.classList.toggle('active', i===idx));
  updateProgress();
  if(idx === 2) gerarQRInstagram(); // só gera o QR quando o visitante chega aos Resultados
}
document.querySelectorAll('.tab').forEach(t=> t.addEventListener('click', ()=> switchTab(+t.getAttribute('data-tab'))));

/* ---------- Sheet: adicionar equipamento ---------- */
function openSheet(){
  overlay.classList.add('open');
  sheet.classList.add('open');
  renderCatChips();
  renderCatalog();
  setTimeout(()=> catalogSearch.focus(), 250);
}
function closeSheet(){
  overlay.classList.remove('open');
  sheet.classList.remove('open');
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
    catalogResults.innerHTML = '<div class="no-results">Nenhum equipamento encontrado.<br>Experimente "Personalizado".</div>';
    return;
  }
  const groups = {};
  items.forEach(it=>{ (groups[it.categoria] = groups[it.categoria] || []).push(it); });
  let html = '';
  Object.keys(groups).forEach(catKey=>{
    html += `<div class="catalog-group-label">${CATEGORIAS[catKey].label}</div>`;
    groups[catKey].forEach(it=>{
      html += `<button type="button" class="catalog-item" data-add-catalog="${it.nome}">
        <div class="d-icon"><i class="fa-solid ${CATEGORIAS[it.categoria].icon}"></i></div>
        <div><div class="ci-name">${escapeHtml(it.nome)}</div><div class="ci-watt">${it.potencia} W</div></div>
        <i class="fa-solid fa-circle-plus ci-add"></i></button>`;
    });
  });
  catalogResults.innerHTML = html;
  catalogResults.querySelectorAll('[data-add-catalog]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const item = CATALOGO.find(c=> c.nome === btn.getAttribute('data-add-catalog'));
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
  $('custom-name').value = ''; $('custom-watts').value = ''; $('custom-qty').value = '1';
  renderAll();
  closeSheet();
});

/* ---------- Tarifário (categoria + Potência Contratada + taxa fixa BT-Trif) ---------- */
function atualizarResumoTarifario(){
  const t = tarifarioAtual();
  const taxaFixa = taxaFixaAtual();
  tarifaKwhAplicadaEl.textContent = fmt(t.tarifaKwh);
  taxaFixaAplicadaEl.textContent = fmt(taxaFixa);
  tariffHeader.textContent = t.short + ' · ' + fmt(t.tarifaKwh) + ' Kz/kWh';
  // aviso só aparece quando a categoria é BT-Trif e a taxa fixa ainda não foi preenchida
  avisoTrif.style.display = (t.fixaEditavel && !taxaFixa) ? 'block' : 'none';
}

categoriaSelect.addEventListener('change', ()=>{
  state.categoria = categoriaSelect.value;
  const t = tarifarioAtual();
  taxaFixaTrifRow.style.display = t.fixaEditavel ? 'flex' : 'none';
  save();
  atualizarResumoTarifario();
  renderResults();
});

pcInput.addEventListener('input', ()=>{
  const val = parseFloat(pcInput.value);
  state.pc = isNaN(val) ? 0 : val;
  save();
  renderResults();
});

taxaFixaTrifInput.addEventListener('input', ()=>{
  const val = parseFloat(taxaFixaTrifInput.value);
  state.taxaFixaTrif = isNaN(val) ? null : val;
  save();
  atualizarResumoTarifario();
  renderResults();
});

/* ---------- Anomalia ---------- */
$('btn-anomaly').addEventListener('click', ()=>{
  const dev = state.devices.find(d=> d.id === anomalySelect.value);
  if(!dev){ anomalyResult.classList.remove('show'); return; }
  const normalKwhMes = dailyKwh(dev) * 30;
  const anomKwhDia = (dev.potencia * dev.quantidade * 24) / 1000;
  const anomKwhMes = anomKwhDia * 30;
  const extraKzMes = (anomKwhMes - normalKwhMes) * tarifarioAtual().tarifaKwh * 1.14;
  anomalyResult.innerHTML = `Se <strong>${escapeHtml(dev.nome)}</strong> ficar ligado <strong>24h/dia</strong> em vez de <strong>${fmt(dev.horas,1)}h/dia</strong>, o consumo mensal passa de <strong>${fmt(normalKwhMes)} kWh</strong> para <strong>${fmt(anomKwhMes)} kWh</strong> — um custo extra estimado de <strong>${fmt(extraKzMes,0)} Kz/mês</strong>.`;
  anomalyResult.classList.add('show');
});
anomalySelect.addEventListener('change', ()=> anomalyResult.classList.remove('show'));

/* ---------- Conselho do técnico ---------- */
adviceText.addEventListener('input', ()=>{ state.advice = adviceText.value; save(); });
presetAdvice.addEventListener('change', ()=>{
  const val = presetAdvice.value;
  if(!val) return;
  adviceText.value = adviceText.value.trim() ? (adviceText.value.trim() + '\n- ' + val) : val;
  state.advice = adviceText.value;
  save();
  presetAdvice.value = '';
});

/* ---------- Recomeçar (dentro do simulador) ---------- */
$('btn-reset').addEventListener('click', ()=>{
  Swal.fire({
    title:'Recomeçar simulação?',
    text:'Todos os equipamentos adicionados serão apagados.',
    icon:'warning', showCancelButton:true,
    confirmButtonText:'Sim, recomeçar', cancelButtonText:'Cancelar',
    confirmButtonColor:'#E85D04', cancelButtonColor:'#0F3460'
  }).then(res=>{
    if(!res.isConfirmed) return;
    limparSimuladorParaProximoVisitante();
    switchTab(0);
    renderAll();
  });
});

/* ============================================================
   FINALIZAR SIMULAÇÃO → convite para a selfie (SweetAlert2)
   ============================================================ */
$('btn-finalizar').addEventListener('click', ()=>{
  Swal.fire({
    title:'Obrigado por simular!',
    text:'O nosso robô quer tirar uma selfie contigo para recordar a FILDA 2026. Aceitas?',
    icon:'success', showCancelButton:true,
    confirmButtonText:'Sim, vamos lá!', cancelButtonText:'Agora não',
    confirmButtonColor:'#E85D04', cancelButtonColor:'#0F3460'
  }).then(res=>{
    if(res.isConfirmed) irParaSelfie();
  });
});

/* ============================================================
   TELA 3 — SELFIE: temporizador de 30s + diálogo SweetAlert2
   ============================================================ */
let selfieTimeoutId = null;
let agradecimentoFallbackId = null;
function iniciarTemporizadorSelfie(){
  clearTimeout(selfieTimeoutId);
  // temporizador invisível: o visitante não vê contagem, só a pergunta ao fim de 30s
  selfieTimeoutId = setTimeout(perguntarSeTirouFoto, 30000);
}
$('btn-selfie-pronto').addEventListener('click', ()=>{
  clearTimeout(selfieTimeoutId);
  audioSorria.pause(); // evita sobrepor a locução "Sorria..." com o diálogo de confirmação
  perguntarSeTirouFoto();
});
function perguntarSeTirouFoto(){
  Swal.fire({
    title:'Já tirou a foto com o robô?',
    icon:'question', showCancelButton:true,
    confirmButtonText:'Sim', cancelButtonText:'Ainda não',
    confirmButtonColor:'#E85D04', cancelButtonColor:'#0F3460',
    allowOutsideClick:false
  }).then(res=>{
    if(res.isConfirmed){
      // SIM — o robô muda de pose para saudar, agradece a visita e toca a locução gravada
      audioSorria.pause();
      const img = $('robo-img-selfie');
      img.classList.remove('hidden');
      img.src = 'robo-sauda.png';
      $('robo-placeholder-selfie').classList.add('hidden');
      $('robo-placeholder-selfie').querySelector('i').className = 'fa-solid fa-hand-peace';
      $('selfie-legenda').textContent = 'A ENDE agradece a sua visita! Ajude-nos a iluminar Angola com consumo consciente.';
      $('btn-selfie-pronto').classList.add('hidden');

      // volta ao início assim que a locução de agradecimento terminar de tocar
      // (com um pequeno respiro de 1,2s), mas nunca fica "presa": se o áudio
      // falhar ou ainda não existir, um temporizador de segurança de 8s garante
      // que o totem continua o ciclo na mesma
      clearTimeout(agradecimentoFallbackId);
      function voltarAoInicio(){
        clearTimeout(agradecimentoFallbackId);
        limparSimuladorParaProximoVisitante();
        irParaBoasVindas();
      }
      audioAgradecimento.onended = ()=> setTimeout(voltarAoInicio, 1200);
      if(!mudo){
        audioAgradecimento.currentTime = 0;
        audioAgradecimento.play().catch(voltarAoInicioComAtraso);
      }else{
        voltarAoInicioComAtraso();
      }
      function voltarAoInicioComAtraso(){ setTimeout(voltarAoInicio, 5000); }
      agradecimentoFallbackId = setTimeout(voltarAoInicio, 8000);
    }else{
      // NÃO — devolve mais 30 segundos de sorriso para repetir a fotografia,
      // sem repetir a locução "Sorria..." (como pedido)
      iniciarTemporizadorSelfie();
    }
  });
}

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
load();
categoriaSelect.value = state.categoria;
pcInput.value = state.pc;
taxaFixaTrifRow.style.display = tarifarioAtual().fixaEditavel ? 'flex' : 'none';
if(typeof state.taxaFixaTrif === 'number') taxaFixaTrifInput.value = state.taxaFixaTrif;
atualizarResumoTarifario();
adviceText.value = state.advice || '';
renderAll();
escreverTexto(document.getElementById('texto-boas-vindas'), TEXTO_BOAS_VINDAS, 50);
tocarLoopBoasVindas(); // arranca o loop logo na primeira visita (fica à espera do 1º toque se o navegador bloquear o autoplay)

})();