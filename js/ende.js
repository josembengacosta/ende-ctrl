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
  if('speechSynthesis' in window) window.speechSynthesis.cancel();
  clearTimeout(idleTimeoutId);
  clearTimeout(selfieTimeoutId);
  mostrarTela('boas-vindas');
  // o texto do robô é "escrito" de novo sempre que o totem volta ao início,
  // para parecer que está a cumprimentar cada novo visitante
  escreverTexto(document.getElementById('texto-boas-vindas'), TEXTO_BOAS_VINDAS, 26);
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
  img.src = '';
  document.getElementById('robo-placeholder-selfie').classList.add('hidden');
  document.getElementById('selfie-legenda').textContent = TEXTO_SORRIA;
  document.getElementById('btn-selfie-pronto').classList.remove('hidden');
  // a locução "Sorria..." toca uma única vez, só ao entrar neste ecrã —
  // se o visitante voltar aqui por ter clicado "Ainda não", esta função
  // não é chamada de novo, por isso não se repete (como pedido)
  falar(TEXTO_SORRIA);
  iniciarTemporizadorSelfie();
}

/* ============================================================
   VOZ DO NAVEGADOR (Web Speech API) — usada em todos os ecrãs:
   - Tela 1: lê o texto de boas-vindas em loop, com pausa entre repetições,
     até o visitante tocar em "Iniciar Simulação"
   - Tela 2 (aba Resultados): lê um resumo dos valores dos cartões assim
     que o visitante chega a esta aba
   - Tela 3: lê "Sorria..." ao entrar, e o agradecimento quando o
     visitante confirma que já tirou a foto
   ============================================================ */
let mudo = false; // controlado pelo botão "Som ligado/Som desligado"

// escolhe a melhor voz portuguesa disponível no dispositivo (Portugal > Brasil > qualquer "pt")
let vozPortuguesa = null;
function carregarVozPortuguesa(){
  if(!('speechSynthesis' in window)) return null;
  const vozes = window.speechSynthesis.getVoices();
  return vozes.find(v=> v.lang === 'pt-PT')
      || vozes.find(v=> (v.lang||'').toLowerCase().startsWith('pt-pt'))
      || vozes.find(v=> v.lang === 'pt-BR')
      || vozes.find(v=> (v.lang||'').toLowerCase().startsWith('pt'))
      || null;
}
if('speechSynthesis' in window){
  vozPortuguesa = carregarVozPortuguesa();
  window.speechSynthesis.onvoiceschanged = ()=>{ vozPortuguesa = carregarVozPortuguesa(); };
}

// fala um texto uma única vez; "aoTerminar" (opcional) corre quando a fala acaba (ou falha/está muda)
function falar(texto, aoTerminar){
  if(mudo || !('speechSynthesis' in window)){ if(aoTerminar) aoTerminar(); return; }
  const utter = new SpeechSynthesisUtterance(texto);
  utter.lang = 'pt-PT';
  if(vozPortuguesa) utter.voice = vozPortuguesa;
  utter.rate = 1.50;
  utter.pitch = 1.02;
  if(aoTerminar){ utter.onend = aoTerminar; utter.onerror = aoTerminar; }
  window.speechSynthesis.speak(utter);
}

const GAP_LOOP_BOAS_VINDAS_MS = 4000; // "alguns tempinho" de silêncio entre repetições do loop
let loopBoasVindasTimeoutId = null;

function tocarLoopBoasVindas(){
  clearTimeout(loopBoasVindasTimeoutId);
  if(mudo || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  falar(TEXTO_BOAS_VINDAS, ()=>{
    loopBoasVindasTimeoutId = setTimeout(()=>{
      if(estadoAtual === 'boas-vindas') tocarLoopBoasVindas();
    }, GAP_LOOP_BOAS_VINDAS_MS);
  });
}
function pararLoopBoasVindas(){
  clearTimeout(loopBoasVindasTimeoutId);
  if('speechSynthesis' in window) window.speechSynthesis.cancel();
}

/* Lê um resumo dos cartões da aba Resultados — chamado quando o visitante
   chega a essa aba (ver switchTab). Só os números-resumo, sem os detalhes
   do gráfico, anomalia ou conselho do técnico. */
function lerResumoResultados(){
  if(state.devices.length === 0) return; // nada para ler no estado vazio
  const t = totals();
  const texto = `Aqui estão os seus resultados. Consumo diário de ${fmt(t.kwhDia)} quilowatts-hora. `
    + `Consumo mensal de ${fmt(t.kwhMes)} quilowatts-hora. `
    + `Custo diário de ${fmt(t.kzDia,0)} kwanzas. `
    + `Custo mensal de ${fmt(t.kzMes,0)} kwanzas.`;
  if('speechSynthesis' in window) window.speechSynthesis.cancel();
  falar(texto);
}

/* Botão "Som ligado / Som desligado" — silencia ou retoma a voz em qualquer ecrã */
const btnMudo = document.getElementById('btn-mudo');
const btnMudoLabel = document.getElementById('btn-mudo-label');
btnMudo.addEventListener('click', function(){
  mudo = !mudo;
  if(mudo){
    if('speechSynthesis' in window) window.speechSynthesis.cancel();
    clearTimeout(loopBoasVindasTimeoutId);
    btnMudo.querySelector('i').className = 'fa-solid fa-volume-xmark';
    btnMudoLabel.textContent = 'Som desligado';
    btnMudo.setAttribute('aria-pressed','true');
  }else{
    btnMudo.querySelector('i').className = 'fa-solid fa-volume-high';
    btnMudoLabel.textContent = 'Som ligado';
    btnMudo.setAttribute('aria-pressed','false');
    if(estadoAtual === 'boas-vindas') tocarLoopBoasVindas();
  }
});

/* ============================================================
   TELA 1 — texto do robô (efeito de escrita, sincronizado com o áudio)
   ============================================================ */
const TEXTO_BOAS_VINDAS = 'Olá! Bem-vindo à FILDA 2026. Sou o assistente de Literacia Energética da ENDE. Queres testar o nosso simulador inteligente ou aprender a poupar energia?';
const TEXTO_SORRIA = 'Sorria! Tire uma fotografia com o robô da ENDE para recordar a FILDA 2026.';
const TEXTO_AGRADECIMENTO = 'A ENDE agradece a sua visita! Ajude-nos a iluminar Angola com consumo consciente.';

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
   TARIFÁRIOS REAIS DA ENDE (Baixa/Média Tensão) — confirmados pelo
   técnico da ENDE. Nomes oficiais atualizados (só mudaram os nomes,
   os valores de BT-TI e MT-TCS e Indústria mantêm-se os mesmos de
   antes, quando ainda se chamavam BT-TS e MT-Comércio e Indústria).
   Fórmula geral: Custo = (TaxaFixa × Pc) + (Tarifa × Pi) + 14%
   Pc = Potência Contratada (kVA) · Pi = Potência/energia Instalada (kWh),
   diária OU mensal consoante quem chama a função (ver calcularCustoENDE).
   ============================================================ */
const TARIFARIOS = {
  'bt-mono':   { label:'BT-Monofásico',           short:'BT-Mono',    taxaFixa:117,    tarifaKwh:14.16 },
  'bt-trif':   { label:'BT-Doméstico Trifásico',  short:'BT-Trif',    taxaFixa:117,    tarifaKwh:19.16 },
  'bt-ti':     { label:'BT-TI',                    short:'BT-TI',      taxaFixa:130,    tarifaKwh:19.17 },
  'mt-tcsind': { label:'MT-TCS e Indústria',       short:'MT-TCS/Ind', taxaFixa:239.20, tarifaKwh:14.99 },
  'grandes':   { label:'Grandes Clientes',         short:'Grandes',    taxaFixa:0,      tarifaKwh:0,     semDados:true }
};

/**
 * Calcula o custo de energia segundo as fórmulas oficiais da ENDE.
 * Função pura (não lê nem escreve em "state") para poder ser reutilizada
 * tanto para o custo diário como para o custo mensal — quem chama decide
 * se "pi" é a potência/energia instalada diária ou mensal.
 * @param {string} categoria - chave da categoria tarifária (ver TARIFARIOS)
 * @param {number} pc - Potência Contratada, em kVA
 * @param {number} pi - Potência/energia Instalada, em kWh (diária ou mensal)
 * @param {number} tarifa - tarifa a aplicar, em Kz/kWh
 * @returns {number} custo total já com 14% de imposto, arredondado a 2 casas decimais
 */
function calcularCustoENDE(categoria, pc, pi, tarifa){
  const t = TARIFARIOS[categoria] || TARIFARIOS['bt-mono'];
  if(t.semDados) return 0; // "Grandes Clientes" ainda não tem tarifário público confirmado
  const subtotal = (t.taxaFixa * pc) + (tarifa * pi);
  const comImposto = subtotal * 1.14;
  return Math.round(comImposto * 100) / 100;
}


const CATALOGO = [
  { nome:'Lâmpada LED 9W',                 potencia:9,    categoria:'iluminacao',   horasSugeridas:6  },
  { nome:'Lâmpada LED 10W',                potencia:10,   categoria:'iluminacao',   horasSugeridas:6  },
  { nome:'Lâmpada LED 12W',                potencia:12,   categoria:'iluminacao',   horasSugeridas:6  },
  { nome:'Lâmpada Incandescente 60W',      potencia:60,   categoria:'iluminacao',   horasSugeridas:6  },
  { nome:'Lâmpada Incandescente 100W',     potencia:100,  categoria:'iluminacao',   horasSugeridas:6  },
  { nome:'Lâmpada Fluorescente Compacta',  potencia:15,   categoria:'iluminacao',   horasSugeridas:6  },
  { nome:'Candeeiro de Mesa',              potencia:40,   categoria:'iluminacao',   horasSugeridas:3  },
  { nome:'Frigorífico 150L',               potencia:120,  categoria:'refrigeracao', horasSugeridas:24 },
  { nome:'Frigorífico 200L',               potencia:200,  categoria:'refrigeracao', horasSugeridas:24 },
  { nome:'Frigorífico Duplex / Side-by-Side', potencia:350, categoria:'refrigeracao', horasSugeridas:24 },
  { nome:'Arca Congeladora 300L',          potencia:250,  categoria:'refrigeracao', horasSugeridas:24 },
  { nome:'Geleira Pequena / Mini-bar',     potencia:90,   categoria:'refrigeracao', horasSugeridas:24 },
  { nome:'Ventoinha de Mesa',              potencia:55,   categoria:'climatizacao', horasSugeridas:6  },
  { nome:'Ventilador de Tecto',            potencia:75,   categoria:'climatizacao', horasSugeridas:6  },
  { nome:'Ar Condicionado 9000 BTU (Convencional)',  potencia:865,  categoria:'climatizacao', horasSugeridas:6 },
  { nome:'Ar Condicionado 9000 BTU (Inverter)',      potencia:621,  categoria:'climatizacao', horasSugeridas:6 },
  { nome:'Ar Condicionado 12000 BTU (Convencional)', potencia:1153, categoria:'climatizacao', horasSugeridas:6 },
  { nome:'Ar Condicionado 12000 BTU (Inverter)',     potencia:808,  categoria:'climatizacao', horasSugeridas:6 },
  { nome:'Ar Condicionado 18000 BTU (Convencional)', potencia:1702, categoria:'climatizacao', horasSugeridas:5 },
  { nome:'Ar Condicionado 18000 BTU (Inverter)',     potencia:1241, categoria:'climatizacao', horasSugeridas:5 },
  { nome:'Ar Condicionado 24000 BTU (Convencional)', potencia:2233, categoria:'climatizacao', horasSugeridas:5 },
  { nome:'Ar Condicionado 24000 BTU (Inverter)',     potencia:1716, categoria:'climatizacao', horasSugeridas:5 },
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
  { nome:'Televisor Plasma 42"',           potencia:250,  categoria:'eletronica',   horasSugeridas:4  },
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

let state = { devices: [], categoria: 'bt-mono', pc: 6.6, tarifaOverride: null, advice: '' };
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
const tarifaInput = $('tarifa-input');
const taxaFixaAplicadaEl = $('taxa-fixa-aplicada');
const avisoGrandes = $('aviso-grandes');
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
    mkDevice({ nome:'Lâmpada LED 10W', potencia:10, categoria:'iluminacao' }, 6, 6),
    mkDevice({ nome:'Frigorífico 200L', potencia:200, categoria:'refrigeracao' }, 1, 24)
  ];
}
function mkDevice(base, qty, horas){
  return { id:'d'+Date.now()+Math.floor(Math.random()*10000), nome:base.nome, potencia:base.potencia, categoria:base.categoria, quantidade:qty, horas:horas, custom:!!base.custom };
}

/* Prepara o totem para o visitante seguinte: limpa a lista e repõe os valores por omissão */
function limparSimuladorParaProximoVisitante(){
  try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
  state = { devices:[], categoria:'bt-mono', pc:6.6, tarifaOverride:null, advice:'' };
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
   FÓRMULA OFICIAL DE CÁLCULO — confirmada pelo técnico da ENDE:
   Consumo diário (kWh) = Potência (W) × Quantidade × Horas/dia ÷ 1000
   Consumo mensal (kWh)  = Consumo diário × 30
   Custo diário (Kz)     = calcularCustoENDE(categoria, Pc, Pi_diário, tarifa)
   Custo mensal (Kz)      = calcularCustoENDE(categoria, Pc, Pi_mensal, tarifa)
   — é a MESMA fórmula (TaxaFixa × Pc + Tarifa × Pi) × 1,14 nos dois casos;
   só muda se "Pi" é o consumo diário ou mensal, consoante pedido pelo técnico.
   ============================================================ */
function dailyKwh(d){
  return (d.potencia * d.quantidade * d.horas) / 1000;
}
function tarifarioAtual(){
  return TARIFARIOS[state.categoria] || TARIFARIOS['bt-mono'];
}
// tarifa efetivamente aplicada: o valor oficial da categoria, a não ser que
// o utilizador a tenha substituído manualmente no campo "Tarifa (Kz/kWh)"
function tarifaAtual(){
  const t = tarifarioAtual();
  if(t.semDados) return 0;
  return (typeof state.tarifaOverride === 'number' && !isNaN(state.tarifaOverride)) ? state.tarifaOverride : t.tarifaKwh;
}
function totals(){
  const kwhDia = state.devices.reduce((s,d)=> s + dailyKwh(d), 0);
  const kwhMes = kwhDia * 30;
  const tarifa = tarifaAtual();
  const kzDia = calcularCustoENDE(state.categoria, state.pc, kwhDia, tarifa);
  const kzMes = calcularCustoENDE(state.categoria, state.pc, kwhMes, tarifa);
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
    const cost = kwh * tarifaAtual();
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
  if(idx === 2){
    gerarQRInstagram(); // só gera o QR quando o visitante chega aos Resultados
    lerResumoResultados();
  }
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

/* ============================================================
   CONVERSOR DE UNIDADES → WATTS (formulário "Personalizado")
   Muitos aparelhos em Angola não vêm etiquetados em Watts:
   - Ar Condicionado: normalmente só tem BTU/h (capacidade de arrefecimento,
     que NÃO é a potência elétrica — é preciso dividir pelo COP do aparelho)
   - Bombas de água, geleiras antigas: às vezes só têm Amperes + Volts
   - Bombas, motores: às vezes vêm em cv (cavalo-vapor)
   Não existe um COP fixo (depende de marca/modelo/tecnologia), por isso
   usamos aqui um COP médio representativo — o campo "Potência (W)" fica
   sempre editável a seguir, para quem souber o valor exacto do aparelho.
   ============================================================ */
const COP_MEDIO = { convencional: 3.0, inverter: 4.2 };

function converterBtuParaWatts(btu, tipo){
  const capacidadeTermica = btu * 0.293071; // 1 BTU/h ≈ 0,293071 W (conversão térmica)
  const cop = COP_MEDIO[tipo] || COP_MEDIO.convencional;
  return capacidadeTermica / cop; // potência elétrica real = capacidade térmica ÷ COP
}
function converterAVParaWatts(amperes, volts){
  return amperes * volts;
}
function converterCvParaWatts(cv){
  return cv * 735.5;
}

const customUnit = $('custom-unit');
const convBtu = $('conv-btu');
const convAv = $('conv-av');
const convCv = $('conv-cv');
const convResultadoNota = $('conv-resultado-nota');
const convResultadoW = $('conv-resultado-w');
const customWattsInput = $('custom-watts');

customUnit.addEventListener('change', ()=>{
  const modo = customUnit.value;
  convBtu.classList.toggle('hidden', modo !== 'btu');
  convAv.classList.toggle('hidden', modo !== 'av');
  convCv.classList.toggle('hidden', modo !== 'cv');
  convResultadoNota.classList.toggle('hidden', modo === 'w');
  if(modo === 'w'){ customWattsInput.value = ''; customWattsInput.focus(); }
});

function recalcularConversao(){
  const modo = customUnit.value;
  let watts = null;
  if(modo === 'btu'){
    const btu = parseFloat($('conv-btu-valor').value);
    if(btu > 0) watts = converterBtuParaWatts(btu, $('conv-btu-tipo').value);
  }else if(modo === 'av'){
    const a = parseFloat($('conv-av-a').value);
    const v = parseFloat($('conv-av-v').value);
    if(a > 0 && v > 0) watts = converterAVParaWatts(a, v);
  }else if(modo === 'cv'){
    const cv = parseFloat($('conv-cv-valor').value);
    if(cv > 0) watts = converterCvParaWatts(cv);
  }
  if(watts !== null){
    const arredondado = Math.round(watts);
    convResultadoW.textContent = arredondado;
    customWattsInput.value = arredondado;
  }
}
['conv-btu-valor','conv-btu-tipo','conv-av-a','conv-av-v','conv-cv-valor'].forEach(id=>{
  $(id).addEventListener('input', recalcularConversao);
  $(id).addEventListener('change', recalcularConversao);
});

$('btn-add-custom').addEventListener('click', ()=>{
  const nome = $('custom-name').value.trim();
  const watts = parseFloat($('custom-watts').value);
  const qty = Math.max(1, parseInt($('custom-qty').value) || 1);
  if(!nome){ $('custom-name').focus(); return; }
  if(!watts || watts <= 0){ $('custom-watts').focus(); return; }
  state.devices.push(mkDevice({ nome, potencia:watts, categoria:'personalizado', custom:true }, qty, 3));
  save();
  $('custom-name').value = ''; $('custom-watts').value = ''; $('custom-qty').value = '1';
  // repõe o conversor de unidades para a próxima vez que o formulário for aberto
  customUnit.value = 'w';
  convBtu.classList.add('hidden');
  convAv.classList.add('hidden');
  convCv.classList.add('hidden');
  convResultadoNota.classList.add('hidden');
  $('conv-btu-valor').value = ''; $('conv-av-a').value = ''; $('conv-cv-valor').value = '';
  renderAll();
  closeSheet();
});

/* ---------- Tarifário (categoria + Potência Contratada + tarifa editável) ---------- */
function atualizarResumoTarifario(){
  const t = tarifarioAtual();
  taxaFixaAplicadaEl.textContent = fmt(t.taxaFixa, 2);
  tariffHeader.textContent = t.short + ' · ' + fmt(tarifaAtual()) + ' Kz/kWh';
  avisoGrandes.style.display = t.semDados ? 'block' : 'none';
  pcInput.disabled = !!t.semDados;
  tarifaInput.disabled = !!t.semDados;
}

categoriaSelect.addEventListener('change', ()=>{
  state.categoria = categoriaSelect.value;
  // ao trocar de categoria, a tarifa volta ao valor oficial dessa categoria
  // (o utilizador pode voltar a editá-la manualmente se precisar)
  state.tarifaOverride = null;
  tarifaInput.value = tarifarioAtual().tarifaKwh || '';
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

tarifaInput.addEventListener('input', ()=>{
  const val = parseFloat(tarifaInput.value);
  state.tarifaOverride = isNaN(val) ? null : val;
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
  const extraKzMes = (anomKwhMes - normalKwhMes) * tarifaAtual() * 1.14;
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
function iniciarTemporizadorSelfie(){
  clearTimeout(selfieTimeoutId);
  // temporizador invisível: o visitante não vê contagem, só a pergunta ao fim de 30s
  selfieTimeoutId = setTimeout(perguntarSeTirouFoto, 30000);
}
$('btn-selfie-pronto').addEventListener('click', ()=>{
  clearTimeout(selfieTimeoutId);
  if('speechSynthesis' in window) window.speechSynthesis.cancel(); // evita sobrepor "Sorria..." com o diálogo
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
      // SIM — o robô muda de pose para saudar, agradece a visita e fala por voz do navegador
      if('speechSynthesis' in window) window.speechSynthesis.cancel();
      const img = $('robo-img-selfie');
      img.classList.remove('hidden');
      img.src = '';
      $('robo-placeholder-selfie').classList.add('hidden');
      $('robo-placeholder-selfie').querySelector('i').className = 'fa-solid fa-hand-peace';
      $('selfie-legenda').textContent = TEXTO_AGRADECIMENTO;
      $('btn-selfie-pronto').classList.add('hidden');

      // volta ao início assim que a voz terminar de falar (com um pequeno
      // respiro de 1,2s); se a voz falhar, "falar()" já chama aoTerminar na hora
      falar(TEXTO_AGRADECIMENTO, ()=>{
        setTimeout(()=>{
          limparSimuladorParaProximoVisitante();
          irParaBoasVindas();
        }, 1200);
      });
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
tarifaInput.value = (typeof state.tarifaOverride === 'number') ? state.tarifaOverride : (tarifarioAtual().tarifaKwh || '');
atualizarResumoTarifario();
adviceText.value = state.advice || '';
renderAll();
escreverTexto(document.getElementById('texto-boas-vindas'), TEXTO_BOAS_VINDAS, 26);
tocarLoopBoasVindas(); // arranca o loop logo na primeira visita (fica à espera do 1º toque se o navegador bloquear o autoplay)

})();