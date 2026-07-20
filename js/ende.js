/* ============================================================
   ende.js — LÓGICA DO SIMULADOR ENDE (FILDA 2026)
   ------------------------------------------------------------
   Dados estáticos (categorias, tarifários, catálogo) foram
   movidos para ende-data.js — carregue esse arquivo ANTES deste
   no index.html.
   ============================================================ */

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
   ÍCONES DE APARELHOS ELÉTRICOS — flutuam no fundo como as
   partículas, mas são SVGs de eletrodomésticos (TV, lâmpada,
   frigorífico, ar condicionado, ferro, ventilador, etc.).
   São decorativos (pointer-events:none), gerados uma vez no
   arranque. A quantidade é moderada para não poluir visualmente.
   ============================================================ */
(function criarIconesAparelhos(){
  const camada = document.getElementById('icones-aparelhos');
  if(!camada) return;

  // Biblioteca interna de SVGs inline (paths simples, traço branco translúcido).
  // Cada ícone é desenhado a 24×24 viewBox; o tamanho final é controlado por CSS.
  const ICONES = [
    // Lâmpada
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2v1.3h6V16.7c0-.8.4-1.5 1-2A7 7 0 0 0 12 2Z"/></svg>',
    // Televisor
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="13" rx="2"/><path d="M8 21h8"/><path d="M12 18v3"/></svg>',
    // Frigorífico
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M5 10h14"/><path d="M8 6v1"/><path d="M8 14v1"/></svg>',
    // Ar condicionado (split)
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="9" rx="2"/><path d="M6 8h.01M9 8h.01M12 8h.01"/><path d="M6 17c0-1 .5-1.5 1.5-1.5S9 16 9 17"/><path d="M13 19c0-1 .5-1.5 1.5-1.5S16 18 16 19"/></svg>',
    // Ferro de engomar
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16h18l-2-4H6a3 3 0 0 0-3 3z"/><path d="M7 12V8a2 2 0 0 1 2-2h4"/><path d="M5 19h14"/></svg>',
    // Ventoinha
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 0-6-3-6-1 0-2 1-2 3 0 2 2 3 5 3Z"/><path d="M14 12c4 0 6 0 6-3 0-1-1-2-3-2-2 0-3 2-3 5Z"/><path d="M12 14c0 4 0 6 3 6 1 0 2-1 2-3 0-2-2-3-5-3Z"/><path d="M10 12c-4 0-6 0-6 3 0 1 1 2 3 2 2 0 3-2 3-5Z"/><path d="M12 14v6"/></svg>',
    // Tomada / plug
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v4"/><path d="M15 2v4"/><path d="M6 8h12v3a6 6 0 0 1-12 0Z"/><path d="M12 17v5"/></svg>',
    // Máquina de lavar
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="14" r="5"/><path d="M8 5h.01M11 5h.01"/></svg>',
    // Computador portátil
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="11" rx="1"/><path d="M2 19h20"/><path d="M9 19h6"/></svg>',
    // Telemóvel a carregar
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 6h2"/><path d="M12 10v4"/><path d="M10 12l2-2 2 2"/></svg>',
    // Micro-ondas
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><rect x="4" y="7" width="10" height="10" rx="1"/><path d="M17 9v.01M19 9v.01M17 12v.01M19 12v.01M17 15v.01M19 15v.01"/></svg>',
    // Bomba de água
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 9V5"/><path d="M9 12H5"/><path d="M15 12h4"/><path d="M12 15v4"/></svg>'
  ];

  // Quantidade moderada: 9 ícones dispersos (nem tantos assim, como pedido)
  const TOTAL_ICONES = 9;
  for(let i=0;i<TOTAL_ICONES;i++){
    const wrap = document.createElement('div');
    wrap.className = 'icone-aparelho';
    // cada ícone pode aparecer em vários tamanhos para dar profundidade
    const tamanho = 26 + Math.random()*22;            // 26-48px
    const opacidade = (0.10 + Math.random()*0.16);     // 10%-26% — discreto, não compete com a UI
    const duracao = 24 + Math.random()*22;             // 24-46s por ciclo (lento, hipnótico)
    const delay = -Math.random()*30;                   // negativo: arranca já em diferentes pontos do ciclo
    const drift = (Math.random()*60-30);               // -30 a +30vw de drift horizontal
    const escalaMax = 1 + Math.random()*0.15;          // ligeiro "respirar" (1.00-1.15)
    wrap.style.width  = tamanho + 'px';
    wrap.style.height = tamanho + 'px';
    wrap.style.left   = (Math.random()*92 + 2) + 'vw'; // 2vw a 94vw
    wrap.style.bottom = (-10 - Math.random()*40) + 'px';
    wrap.style.opacity = opacidade;
    wrap.style.setProperty('--drift-icone', drift + 'vw');
    wrap.style.setProperty('--escala-max', escalaMax);
    wrap.style.animationDuration = duracao + 's';
    wrap.style.animationDelay = delay + 's';
    wrap.innerHTML = ICONES[i % ICONES.length];
    // rotação inicial aleatória para não ficarem todos direitos
    const rot = (Math.random()*30 - 15);
    wrap.style.setProperty('--rot-ini', rot + 'deg');
    camada.appendChild(wrap);
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
  // só arranca o loop de voz se já tiver sido desbloqueado por um clique prévio
  // (autoplay policy do Chrome — ver desbloquearVoz())
  if(vozDesbloqueada){
    tocarLoopBoasVindas();
  }
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

// escolhe a melhor voz portuguesa MASCULINA disponível no dispositivo
let vozPortuguesa = null;

/* Volume global da voz do robô (0 a 1). Aplicado a cada SpeechSynthesisUtterance
   criada por falar(). É controlado pelo slider #volume-slider na Tela 1.
   Default a 0.8 (= 80%) — audível mas não agressivo num totem de feira. */
let volumeVoz = 0.8;

function carregarVozPortuguesa(){
  if(!('speechSynthesis' in window)) return null;
  const vozes = window.speechSynthesis.getVoices();
  
  // Lista de termos comuns para vozes masculinas nos principais sistemas operacionais
  const termosMasculinos = ['daniel', 'helio', 'ricardo', 'king', 'male', 'masculino', 'mancini'];

  // Função auxiliar para verificar se a voz é masculina com base no nome
  const esMasculino = v => termosMasculinos.some(termo => (v.name || '').toLowerCase().includes(termo));

  return (
    // 1. PT-PT Masculino
    vozes.find(v => v.lang === 'pt-PT' && esMasculino(v))
    || vozes.find(v => (v.lang||'').toLowerCase().startsWith('pt-pt') && esMasculino(v))
    
    // 2. PT-BR Masculino
    || vozes.find(v => v.lang === 'pt-BR' && esMasculino(v))
    || vozes.find(v => (v.lang||'').toLowerCase().startsWith('pt') && esMasculino(v))
    
    // 3. Fallback: Se não achar masculina, usa qualquer PT disponível (as tuas regras originais)
    || vozes.find(v => v.lang === 'pt-PT')
    || vozes.find(v => (v.lang||'').toLowerCase().startsWith('pt-pt'))
    || vozes.find(v => v.lang === 'pt-BR')
    || vozes.find(v => (v.lang||'').toLowerCase().startsWith('pt'))
    || null
  );
}

if('speechSynthesis' in window){
  vozPortuguesa = carregarVozPortuguesa();
  window.speechSynthesis.onvoiceschanged = ()=>{ vozPortuguesa = carregarVozPortuguesa(); };
}

// A tua função falar mantém-se exatamente igual
function falar(texto, aoTerminar, _retryCount){
  if(mudo || !('speechSynthesis' in window)){
    console.warn('[ENDE voz] falar() cancelado:', mudo ? 'mudo=true' : 'speechSynthesis indisponível');
    if(aoTerminar) aoTerminar();
    return;
  }
  _retryCount = _retryCount || 0;
  const utter = new SpeechSynthesisUtterance(texto);
  utter.lang = 'pt-PT';
  if(vozPortuguesa) utter.voice = vozPortuguesa;
  utter.rate = 0.98;
  utter.pitch = 0.90; // Dica: podes baixar para X se quisermos tornar o tom ligeiramente mais grave
  utter.volume = Math.max(0, Math.min(1, volumeVoz)); // applica o volume global, com clamp de segurança
  // logs de depuração — ajuda a perceber porque é que a voz pode não estar a funcionar
  console.info('[ENDE voz] falar() tentativa=' + (_retryCount + 1) + ' vozDesbloqueada=' + vozDesbloqueada + ' voz=' + (vozPortuguesa ? vozPortuguesa.name : 'nenhuma PT encontrada'));
  if(aoTerminar){
    utter.onend = aoTerminar;
  }
  // handler de erro: se for "not-allowed" (autoplay bloqueado) e a voz já
  // tiver sido desbloqueada por interação prévia, retentamos até 2 vezes.
  // Se ainda NÃO foi desbloqueada, NÃO retentamos — o loop será arrancado
  // pelo desbloquearVoz() quando o utilizador clicar.
  utter.onerror = (e)=>{
    console.error('[ENDE voz] erro:', e);
    if(e && e.error === 'not-allowed' && vozDesbloqueada && _retryCount < 2){
      console.warn('[ENDE voz] not-allowed — retentativa em 800ms (', _retryCount + 1, '/2 )');
      setTimeout(()=> falar(texto, aoTerminar, _retryCount + 1), 800);
    } else {
      if(aoTerminar) aoTerminar();
    }
  };
  window.speechSynthesis.speak(utter);
  //某些 Chrome versions需要 este "resume" para não pausar a voz
  if(window.speechSynthesis.paused) window.speechSynthesis.resume();
}

const GAP_LOOP_BOAS_VINDAS_MS = 4000; // "alguns tempinho" de silêncio entre repetições do loop
let loopBoasVindasTimeoutId = null;

function tocarLoopBoasVindas(){
  clearTimeout(loopBoasVindasTimeoutId);
  // SÓ arranca o loop se a voz já tiver sido desbloqueada por uma interação
  // prévia do utilizador (autoplay policy do Chrome). Se ainda não foi
  // desbloqueada, o desbloquearVoz() tratará de arrancar o loop no 1º clique.
  if(mudo || !('speechSynthesis' in window)) return;
  if(!vozDesbloqueada){
    console.info('[ENDE voz] Loop de boas-vindas adiado — à espera do 1º clique do utilizador (autoplay policy).');
    return;
  }
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
   chega a essa aba (ver switchTab). Inclui a categoria detectada (pelo Pc)
   e o valor da fatura mensal, como pedido pelo técnico da ENDE:
   "Você é do tipo X e vai pagar Y". */
function lerResumoResultados(){
  if(state.devices.length === 0) return; // nada para ler no estado vazio
  if(!clienteSelecionado()) return;       // sem categoria, não há custos para ler
  const t = totals();
  const v = validarCategoriaSelecionada(state.categoria, state.pc);
  const tInfo = TARIFARIOS[v.categoriaFinal];
  // mensagem final como o técnico pediu: "Você é do tipo X e vai pagar Y"
  const texto = `Você é do tipo ${tInfo.label}. `
    + `O valor estimado da sua fatura mensal é de ${fmt(t.kzMes,0)} kwanzas. `
    + `Consumo diário de ${fmt(t.kwhDia)} quilowatts-hora, e mensal de ${fmt(t.kwhMes)} quilowatts-hora. `
    + `Custo diário aproximado de ${fmt(t.kzDia,0)} kwanzas.`;
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
    // sincroniza também o botão do novo controlo de volume
    sincronizarControloVolume();
  }else{
    btnMudo.querySelector('i').className = 'fa-solid fa-volume-high';
    btnMudoLabel.textContent = 'Som ligado';
    btnMudo.setAttribute('aria-pressed','false');
    sincronizarControloVolume();
    if(estadoAtual === 'boas-vindas') tocarLoopBoasVindas();
  }
});

/* ============================================================
   CONTROLO DE VOLUME — slider + botão toggle dedicados na Tela 1
   ------------------------------------------------------------
   Funciona em conjunto com o botão "Som ligado/desligado" já existente:
     - O slider ajusta volumeVoz (0 a 1) em tempo real
     - Se o slider for para 0, marca mudo=true automaticamente
     - Se o slider for acima de 0 estando mudo, retoma a voz
     - O botão toggle do controlo de volume é um atalho para o mesmo mudo
   ============================================================ */
const volumeSlider     = document.getElementById('volume-slider');
const volumeValue      = document.getElementById('volume-value');
const volumeToggle     = document.getElementById('volume-toggle');
const volumeIcon       = document.getElementById('volume-icon');

/* Actualiza o ícone do botão consoante o nível de volume:
   - 0         → volume-xmark (mudo)
   - 1-33      → volume-off   (baixo)
   - 34-66     → volume-low   (médio)
   - 67-100    → volume-high  (alto)
   E mantém a consistência com o botão "Som ligado/desligado" principal. */
function sincronizarControloVolume(){
  if(!volumeIcon) return;
  const pct = Math.round(volumeVoz * 100);
  let icone = 'fa-volume-high';
  if(mudo || pct === 0)        icone = 'fa-volume-xmark';
  else if(pct <= 33)           icone = 'fa-volume-off';
  else if(pct <= 66)           icone = 'fa-volume-low';
  else                         icone = 'fa-volume-high';
  volumeIcon.className = 'fa-solid ' + icone;
  if(volumeToggle){
    volumeToggle.setAttribute('aria-pressed', mudo ? 'true' : 'false');
  }
  if(volumeValue){
    volumeValue.textContent = (mudo ? 0 : pct) + '%';
  }
  // sincroniza também o slider visualmente quando mudo via botão principal
  if(volumeSlider){
    volumeSlider.value = mudo ? 0 : pct;
    volumeSlider.setAttribute('aria-valuenow', mudo ? 0 : pct);
  }
}

if(volumeSlider){
  // carrega volume guardado (se existir) ou usa 80% como default
  try{
    const saved = localStorage.getItem('ende_totem_volume');
    if(saved !== null){
      const v = parseFloat(saved);
      if(!isNaN(v) && v >= 0 && v <= 1){ volumeVoz = v; }
    }
  }catch(e){}
  volumeSlider.value = Math.round(volumeVoz * 100);
  sincronizarControloVolume();

  volumeSlider.addEventListener('input', (e)=>{
    const pct = parseInt(e.target.value, 10);
    volumeVoz = pct / 100;
    // persiste para a próxima visita
    try{ localStorage.setItem('ende_totem_volume', String(volumeVoz)); }catch(e){}
    // se o utilizador mexeu no slider para >0, retoma a voz (desmarca mudo)
    if(pct > 0 && mudo){
      mudo = false;
      btnMudo.querySelector('i').className = 'fa-solid fa-volume-high';
      btnMudoLabel.textContent = 'Som ligado';
      btnMudo.setAttribute('aria-pressed','false');
      if(estadoAtual === 'boas-vindas') tocarLoopBoasVindas();
    } else if(pct === 0 && !mudo){
      // se baixou a 0, marca como mudo também
      mudo = true;
      if('speechSynthesis' in window) window.speechSynthesis.cancel();
      clearTimeout(loopBoasVindasTimeoutId);
      btnMudo.querySelector('i').className = 'fa-solid fa-volume-xmark';
      btnMudoLabel.textContent = 'Som desligado';
      btnMudo.setAttribute('aria-pressed','true');
    }
    sincronizarControloVolume();
    e.target.setAttribute('aria-valuenow', pct);
  });
}

if(volumeToggle){
  volumeToggle.addEventListener('click', ()=>{
    // atalho: actua como o botão "Som ligado/desligado" principal
    btnMudo.click();
  });
}

/* ============================================================
   BOTÃO "TESTAR VOZ" — depuração do problema da voz
   ------------------------------------------------------------
   Muitos navegadores (especialmente Chrome em ambientes kiosk)
   precisam de uma interacção explícita do utilizador antes de
   conseguirem reproduzir voz (política de autoplay).
   Este botão:
     1. Cancela qualquer voz em curso
     2. Carrega vozes PT (se ainda não estiverem carregadas)
     3. Toca uma frase de teste curta
     4. Mostra feedback visual ao utilizador (SweetAlert2)
   ============================================================ */
const btnTestarVoz = document.getElementById('btn-testar-voz');
if(btnTestarVoz){
  btnTestarVoz.addEventListener('click', ()=>{
    if(!('speechSynthesis' in window)){
      Swal.fire({
        title:'Voz não disponível',
        html:'<p>Este navegador não suporta a Web Speech API.</p><p style="margin-top:8px;font-size:0.9rem;color:#565B64;">Recomendado: Chrome ou Edge atualizados.</p>',
        icon:'error', confirmButtonColor:'#E85D04'
      });
      return;
    }
    // força carregamento das vozes (algumas browsers carregam tardiamente)
    if(!vozPortuguesa){
      vozPortuguesa = carregarVozPortuguesa();
    }
    window.speechSynthesis.cancel();
    // se estava mudo, retoma só para este teste (não altera o state global)
    const estavaMudo = mudo;
    if(estavaMudo){
      mudo = false;
    }
    const frase = 'Olá! Sou o assistente da ENDE. A voz está a funcionar correctamente.';
    console.info('[ENDE voz] Teste manual iniciado pelo utilizador. Vozes disponíveis:',
      window.speechSynthesis.getVoices().map(v=> v.lang + ' — ' + v.name));
    falar(frase, ()=>{
      if(estavaMudo) mudo = true; // restaura estado
      const vzs = window.speechSynthesis.getVoices();
      const ptVozes = vzs.filter(v=> (v.lang||'').toLowerCase().startsWith('pt'));
      Swal.fire({
        title: ptVozes.length > 0 ? 'Voz testada' : 'Voz testada (sem voz PT)',
        html: ptVozes.length > 0
          ? `<p>A voz tocou a frase de teste.</p>
             <p style="margin-top:8px;font-size:0.85rem;color:#565B64;">
               Vozes PT encontradas: <strong>${ptVozes.length}</strong>
               (${ptVozes.map(v=> escapeHtml(v.name)).slice(0,3).join(', ')}${ptVozes.length>3?'…':''})
             </p>
             <p style="margin-top:6px;font-size:0.85rem;color:#565B64;">
               Se não ouviu, verifique o volume do sistema operativo e do controlador acima.
             </p>`
          : `<p>A API de voz respondeu, mas <strong>não há vozes em português instaladas</strong> neste dispositivo.</p>
             <p style="margin-top:8px;font-size:0.85rem;color:#565B64;">
               No Chrome: vá a <code>chrome://settings/languages</code> e adicione "Português".<br>
               No Windows: vá a "Definições → Hora e Idioma → Idioma" e instale o pacote de voz PT.
             </p>`,
        icon: ptVozes.length > 0 ? 'success' : 'warning',
        confirmButtonColor: '#E85D04'
      });
    });
  });
}

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

/* ============================================================
   TARIFÁRIOS REAIS DA ENDE (Baixa/Média Tensão) — confirmados pelo
   técnico da ENDE. Nomes oficiais atualizados (só mudaram os nomes,
   os valores de BT-TI e MT-TCS e Indústria mantêm-se os mesmos de
   antes, quando ainda se chamavam BT-TS e MT-Comércio e Indústria).
   Fórmula geral: Custo = (TaxaFixa × Pc) + (Tarifa × Pi) + 14%
   Pc = Potência Contratada (kVA) · Pi = Potência/energia Instalada (kWh),
   diária OU mensal consoante quem chama a função (ver calcularCustoENDE).
   ============================================================ */
/* ============================================================
   TARIFÁRIOS OFICIAIS DA ENDE — 8 categorias (actualizado em
   2026-07, cruzado com a foto do tarifário enviada pelo técnico):
     1. BT Doméstico Social 1     — sem taxa fixa, 3,20 Kz/kWh (Smax ≤ 1,2 kVA)
     2. BT Doméstico Social 2     — 80 Kz/kVA, 8,33 Kz/kWh (1,2 < Smax ≤ 3 kVA)
     3. BT Doméstico Monofásico   — 117 Kz/kVA, 14,16 Kz/kWh (Pc fixo: 3,3/4,4/6,6/9,9)
     4. BT Doméstico Especial Trifásico — 117 Kz/kVA, 19,16 Kz/kWh (Pc: 13,2 a 49,9)
     5. BT Industrial             — 130 Kz/kVA, 19,17 Kz/kWh (M.F. e Trifásico)
     6. BT Comércio e Serviço     — 130 Kz/kVA, 16,67 Kz/kWh (M.F. e Trifásico)
     7. MT Indústria              — 239,20 Kz/kVA, 14,99 Kz/kWh
     8. AT Indústria              — idêntico ao MT-Ind na prática (confirmado
                                    pelo utilizador: "o item 8 é quase o mesmo
                                    com o 7"); valores replicados para não bloquear
                                    o fluxo, fica marcado para revisão se surgir
                                    o valor oficial em separado.
   Cada categoria pode trazer:
     - pcOptions: array de valores fixos (ex.: BT-Mono só aceita 4 potências)
     - pcMin/pcMax: limites para validação de Pc livre (ex.: BT-Trif 13,2 a 49,9)
     - semDados: categoria bloqueada (sem valores oficiais publicados)
   ============================================================ */

/* Ordem canónica de apresentação das 8 categorias (para a UI da nova tab). */

/* ============================================================
   DETECÇÃO AUTOMÁTICA DE CATEGORIA — "O Pc é quem manda"
   ------------------------------------------------------------
   O técnico da ENDE pediu: o sistema deve validar a categoria
   escolhida pelo cliente e CORRIGI-La se estiver errada, com base
   no valor da Potência Contratada (Pc).

   TABELA DE FAIXAS OFICIAIS:
     Pc ≤ 1,2                    → BT Social 1
     1,2 < Pc ≤ 3                → BT Social 2
     3,3 ≤ Pc ≤ 9,9              → BT Doméstico Monofásico
     13,2 ≤ Pc ≤ 49,9            → BT Doméstico Especial Trifásico
     Pc ≥ 50                     → Industrial (não dá para distinguir
                                   BT-Ind / BT-CS / MT-Ind / AT-Ind
                                   só pelo Pc — mantém-se a escolha)

   GAPS (intervalos não cobertos pela tabela oficial):
     3   < Pc < 3,3   → assumimos BT Mono (próximo) com alerta
     9,9 < Pc < 13,2  → assumimos BT Tri (próximo) com alerta
   ============================================================ */
function detectarCategoriaENDE(Pc){
  const pc = parseFloat(Pc);
  if(isNaN(pc) || pc <= 0) return null;

  if(pc <= 1.2)  return { cat:'bt-social1', gap:false };
  if(pc <= 3)    return { cat:'bt-social2', gap:false };
  if(pc < 3.3)   return { cat:'bt-mono',    gap:true };   // gap 3-3,3
  if(pc <= 9.9)  return { cat:'bt-mono',    gap:false };
  if(pc < 13.2)  return { cat:'bt-trif',    gap:true };   // gap 9,9-13,2
  if(pc <= 49.9) return { cat:'bt-trif',    gap:false };
  // Pc ≥ 50: industrial — não dá para distinguir, devolve null para manter a escolha
  return { cat:null, gap:false };
}

/* Categorias industriais — para Pc ≥ 50, o sistema confia na escolha do utilizador. */
const CATEGORIAS_INDUSTRIAIS = ['bt-ind','bt-cs','mt-ind','at-ind'];

/**
 * Valida a categoria seleccionada pelo cliente contra a categoria detectada pelo Pc.
 * @returns {{categoriaFinal:string, mudou:boolean, alerta:string|null, gap:boolean}}
 *   - categoriaFinal: a categoria a usar no cálculo (sempre a correcta)
 *   - mudou: true se a categoria detectada é diferente da escolhida
 *   - alerta: mensagem pronta a mostrar ao utilizador (null se não houver divergência)
 *   - gap: true se o Pc caiu num intervalo não coberto pela tabela oficial
 */
function validarCategoriaSelecionada(categoriaSelecionada, Pc){
  const dete = detectarCategoriaENDE(Pc);
  if(!dete || !dete.cat){
    // Pc ≥ 50 ou inválido: confiar na escolha do utilizador (industriais)
    return {
      categoriaFinal: categoriaSelecionada,
      mudou: false,
      alerta: null,
      gap: false
    };
  }
  const detectada = dete.cat;
  if(detectada === categoriaSelecionada){
    // categoria correcta — só alerta se caiu num gap
    return {
      categoriaFinal: detectada,
      mudou: false,
      alerta: dete.gap
        ? `Atenção: o Pc de ${fmt(parseFloat(Pc),1)} kVA está num intervalo não coberto pelos escalões oficiais. Usámos a categoria mais próxima: ${TARIFARIOS[detectada].label}.`
        : null,
      gap: dete.gap
    };
  }
  // divergência: o cliente escolheu uma categoria, mas o Pc diz outra
  return {
    categoriaFinal: detectada,
    mudou: true,
    alerta: `Pelo valor da tua Potência Contratada de ${fmt(parseFloat(Pc),1)} kVA, tu és do tipo: ${TARIFARIOS[detectada].label}. A categoria foi corrigida automaticamente.`,
    gap: dete.gap
  };
}

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

let state = {
  devices: [],
  categoria: null,        // null = ainda não escolheu o tipo de cliente (gate inicial)
  pc: null,               // null até a categoria ser escolhida (depois assume o pcDefault)
  tarifaOverride: null,
  advice: ''
};
let currentTab = 0;
let sheetMode = 'catalogo';
let activeCategoryFilter = null;
let chartConsumo = null;
let qrGerado = false;

/* Helper: o tipo de cliente já foi escolhido? Usado para o gate de navegação. */
function clienteSelecionado(){ return !!state.categoria && !!TARIFARIOS[state.categoria]; }

/* Helper: retorna o Pc por omissão adequado à categoria atual (ou null se não escolhida). */
function pcDefaultParaCategoria(cat){
  const t = TARIFARIOS[cat];
  if(!t) return null;
  return (typeof t.pcDefault === 'number') ? t.pcDefault : (t.pcOptions ? t.pcOptions[0] : 6.6);
}

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
      if(parsed && Array.isArray(parsed.devices)){
        state = Object.assign(state, parsed);
        // sanity check: se a categoria guardada deixou de existir nos TARIFARIOS, repesta
        if(state.categoria && !TARIFARIOS[state.categoria]){
          state.categoria = null; state.pc = null; state.tarifaOverride = null;
        }
        return;
      }
    }
  }catch(e){}
  // primeiro visitante do dia / sem dados guardados: SEM categoria selecionada.
  // O fluxo começa pela tab "Tipo de Cliente" e avança só depois de escolher.
  state.devices = [];
  state.categoria = null;
  state.pc = null;
  state.tarifaOverride = null;
  state.advice = '';
}
function mkDevice(base, qty, horas){
  return { id:'d'+Date.now()+Math.floor(Math.random()*10000), nome:base.nome, potencia:base.potencia, categoria:base.categoria, quantidade:qty, horas:horas, custom:!!base.custom };
}

/* Prepara o totem para o visitante seguinte: limpa a lista e repõe os valores por omissão */
function limparSimuladorParaProximoVisitante(){
  try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
  state = { devices:[], categoria:null, pc:null, tarifaOverride:null, advice:'' };
  grupoClienteActivo = null;   // volta a mostrar os 2 cards grandes na tab Tipo de Cliente
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

/* ============================================================
   NOVA REGRA — BT Doméstico Social 1 e Social 2: "Condicional Mensal"
   oficial da ENDE. A categoria só é válida se DUAS condições baterem
   ao mesmo tempo:
     1) Smax (Potência Aparente Estimada, calculada do Inventário)
     2) Consumo Mensal (kWh) — calculado a partir do Período de Uso
   O Pc continua a existir internamente (fixo em 1,2/3,0 kVA), só
   para a fórmula da fatura — o utilizador não precisa de o ver.
   Fórmulas: Smax (kVA) = Σ(Potência × Quantidade) / 0.8 / 1000
             Pi (Potência Instalada, kVA) = Σ(Potência × Quantidade) / 1000
   Tabela oficial:
     Social 1 → Smax ≤ 1,3 kVA  E  Consumo Mensal ≤ 120 kWh
     Social 2 → 1,2 < Smax ≤ 3,0 kVA  E  Consumo Mensal ≤ 20 kWh
   ============================================================ */
const CATEGORIAS_VALIDADAS_POR_SMAX = ['bt-social1', 'bt-social2'];
const REGRAS_SOCIAL = {
  'bt-social1': {
    smaxMin: 0,   smaxMax: 1.3,  consumoMax: 120,
    sugestaoSmaxAlto: 'Social 2',
    sugestaoConsumo:  'Social 2'
  },
  'bt-social2': {
    smaxMin: 1.2, smaxMax: 3.0,  consumoMax: 20,
    sugestaoSmaxBaixo: 'Social 1',
    sugestaoSmaxAlto:  'BT Doméstico Monofásico',
    sugestaoConsumo:   'BT Doméstico Monofásico'
  }
};

function calcularSmax(){
  const pInstaladaW = state.devices.reduce((s,d)=> s + (d.potencia * d.quantidade), 0);
  return pInstaladaW / 0.8 / 1000;
}

/* Pi = Potência Instalada, em kVA — soma simples das potências, SEM o
   factor 0.8 do Smax. Usada nas fórmulas de Monofásico/Trifásico. */
function calcularPotenciaInstalada(){
  const pInstaladaW = state.devices.reduce((s,d)=> s + (d.potencia * d.quantidade), 0);
  return pInstaladaW / 1000;
}

/**
 * Avalia se a categoria (Social 1 ou Social 2) actual cumpre as DUAS
 * condições oficiais: Smax e Consumo Mensal.
 * @returns {{dentro:boolean, motivo:('smax-baixo'|'smax-alto'|'consumo'|null), sugestao:string|null, smax:number, consumoMensal:number}}
 */
function avaliarCondicaoSocial(categoria){
  const regra = REGRAS_SOCIAL[categoria];
  const smax = calcularSmax();
  const consumoMensal = totals().kwhMes;
  if(!regra) return { dentro:true, motivo:null, sugestao:null, smax, consumoMensal };

  if(smax < regra.smaxMin){
    return { dentro:false, motivo:'smax-baixo', sugestao: regra.sugestaoSmaxBaixo || null, smax, consumoMensal };
  }
  if(smax > regra.smaxMax){
    return { dentro:false, motivo:'smax-alto', sugestao: regra.sugestaoSmaxAlto || null, smax, consumoMensal };
  }
  if(consumoMensal > regra.consumoMax){
    return { dentro:false, motivo:'consumo', sugestao: regra.sugestaoConsumo || null, smax, consumoMensal };
  }
  return { dentro:true, motivo:null, sugestao:null, smax, consumoMensal };
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* Cria/atualiza o card de Smax no topo do Inventário. Não mexe no HTML:
   o card é criado dinamicamente e inserido antes da lista de equipamentos.
   Válido para Social 1 e Social 2 — mostra alerta se Smax OU Consumo Mensal
   ultrapassarem o limite da categoria actual ("Condicional Mensal"). */
function renderSmaxCard(){
  let card = document.getElementById('smax-card');
  if(!card){
    card = document.createElement('div');
    card.id = 'smax-card';
    card.className = 'tariff-note';
    card.style.cssText = 'display:block;padding:10px 12px;border-radius:10px;margin-bottom:12px;font-size:.8rem;';
    listInv.parentNode.insertBefore(card, listInv);
  }
  const smax = calcularSmax();
  const nomeAtual = state.categoria === 'bt-social1' ? 'Social 1' : 'Social 2';
  const r = CATEGORIAS_VALIDADAS_POR_SMAX.includes(state.categoria) ? avaliarCondicaoSocial(state.categoria) : null;
  const foraDoLimite = !!(r && !r.dentro);

  card.style.background = foraDoLimite ? 'var(--red-pale)' : 'var(--red-pale-2)';
  card.style.color = foraDoLimite ? 'var(--red-dark)' : 'var(--slate)';

  let alerta = '';
  if(foraDoLimite){
    alerta = (r.motivo === 'consumo')
      ? `<br><i class="fa-solid fa-triangle-exclamation"></i> Pelo teu consumo de ${fmt(r.consumoMensal,0)} kWh, você não se enquadra no ${nomeAtual}.` + (r.sugestao ? ` Sugestão: ${r.sugestao}.` : '')
      : `<br><i class="fa-solid fa-triangle-exclamation"></i> Pela tua Potência Estimada de ${fmt(smax,2)} kVA, você não se enquadra no ${nomeAtual}.` + (r.sugestao ? ` Sugestão: ${r.sugestao}.` : '');
  }

  card.innerHTML = `<i class="fa-solid fa-bolt" style="color:var(--orange);"></i> Potência Estimada: <strong>${fmt(smax,2)}</strong> kVA` + alerta;
}

/* ---------- Render: Inventário ---------- */
function renderInventory(){
  listInv.innerHTML = '';
  emptyInv.classList.toggle('hidden', state.devices.length > 0);
  renderSmaxCard();
  state.devices.forEach(d=>{
    const cat = CATEGORIAS[d.categoria] || CATEGORIAS.personalizado;
    const row = document.createElement('div');
    row.className = 'device-row';
    // Tarefa 2: tooltip contextual em cada linha do inventário — explica o que é e como se calcula o total
    row.setAttribute('data-tooltip',
      `${d.nome} · ${cat.label} — Potência unitária ${fmt(d.potencia,0)} W × ${d.quantidade} un. = ${fmt(d.potencia*d.quantidade,0)} W instalados. Ajuste a potência ou a quantidade se necessário.`);
    row.innerHTML = `
      <div class="d-icon" data-tooltip="Categoria: ${cat.label}"><i class="fa-solid ${cat.icon}"></i></div>
      <div class="d-info">
        <div class="d-name"><span>${escapeHtml(d.nome)}</span>${d.custom ? '<span class="d-tag" data-tooltip="Equipamento adicionado manualmente via formulário Personalizado.">Personalizado</span>' : ''}</div>
        <div class="d-sub" data-tooltip="Cálculo: Quantidade × Potência unitária = Potência total instalada (em Watts).">${d.quantidade} × ${fmt(d.potencia,0)} W = <strong class="mono">${fmt(d.potencia*d.quantidade,0)} W</strong></div>
      </div>
      <div class="d-fields">
        <div class="field-mini" data-tooltip="Potência elétrica unitária do equipamento, em Watts (W). Edite se souber o valor exacto."><label>Watts</label><input type="number" min="1" value="${d.potencia}" data-id="${d.id}" data-field="potencia" aria-label="Potência em Watts de ${escapeHtml(d.nome)}"></div>
        <div class="field-mini wide" data-tooltip="Número de unidades idênticas deste equipamento (ex: 4 lâmpadas iguais)."><label>Qtd.</label><input type="number" min="1" value="${d.quantidade}" data-id="${d.id}" data-field="quantidade" aria-label="Quantidade de ${escapeHtml(d.nome)}"></div>
      </div>
      <button class="btn-remove" data-remove="${d.id}" aria-label="Remover ${escapeHtml(d.nome)}" data-tooltip="Remover este equipamento da lista."><i class="fa-solid fa-trash"></i></button>`;
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
    // Tarefa 2: tooltip contextual — explica o cálculo do consumo diário deste equipamento
    row.setAttribute('data-tooltip',
      `${d.nome} — ${fmt(d.potencia*d.quantidade,0)} W × ${fmt(d.horas,1)} h/dia = ${fmt(dailyKwh(d))} kWh/dia. Ajuste as horas para ver o impacto no custo.`);
    row.innerHTML = `
      <div class="d-icon"><i class="fa-solid ${cat.icon}"></i></div>
      <div class="d-info">
        <div class="d-name"><span>${escapeHtml(d.nome)}</span></div>
        <div class="d-sub" data-tooltip="Potência total instalada deste equipamento (Quantidade × Potência unitária).">${fmt(d.potencia*d.quantidade,0)} W instalados</div>
        <div class="hours-chips" data-tooltip="Toque num valor rápido para definir as horas de uso por dia, ou digite manualmente no campo à direita.">
          ${HOUR_PRESETS.map(h=>{
            const ativo = d.horas===h;
            // tooltip individual por chip: mostra o consumo estimado se escolher aquela duração
            const kwhSim = ((d.potencia*d.quantidade*h)/1000);
            return `<button type="button" class="chip ${ativo?'active':''}" data-hours="${h}" data-id="${d.id}" data-tooltip="Se ficar ${h}h/dia ligado → ${fmt(kwhSim)} kWh/dia." aria-pressed="${ativo?'true':'false'}">${h}h</button>`;
          }).join('')}
        </div>
      </div>
      <div class="d-fields"><div class="field-mini" data-tooltip="Horas por dia em que o equipamento fica ligado (0 a 24, em passos de 0,5)."><label>Horas/dia</label><input type="number" min="0" max="24" step="0.5" value="${d.horas}" data-id="${d.id}" data-field="horas" aria-label="Horas por dia de ${escapeHtml(d.nome)}"></div></div>
      <div class="kwh-readout mono" data-tooltip="Consumo diário estimado = Potência total (W) × Horas/dia ÷ 1000 (em kWh).">${fmt(dailyKwh(d))} kWh/d</div>`;
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

/* ---------- Banner "Você é do tipo X" (no painel de Resultados) ----------
   Mostra a categoria detectada pelo Pc — que pode diferir da escolhida
   pelo utilizador se ele tiver mexido no Pc manualmente. */
function actualizarCategoriaBanner(){
  const banner = $('categoria-banner');
  if(!banner) return;
  const nome = $('categoria-banner-nome');
  const sub  = $('categoria-banner-sub');

  if(!clienteSelecionado()){
    banner.classList.remove('corrigido', 'gap-alert');
    if(nome) nome.textContent = '—';
    if(sub)  sub.textContent  = 'Escolha um tipo de cliente para começar.';
    return;
  }
  // === Caso especial: Social 1 e Social 2 são validados pelo Smax, não pelo Pc ===
  if(CATEGORIAS_VALIDADAS_POR_SMAX.includes(state.categoria)){
    const r = avaliarCondicaoSocial(state.categoria);
    const tAtual = TARIFARIOS[state.categoria];
    const nomeAtual = state.categoria === 'bt-social1' ? 'Social 1' : 'Social 2';
    if(nome) nome.textContent = tAtual.label;
    if(sub){
      if(r.dentro){
        sub.innerHTML = `<i class="fa-solid fa-circle-check"></i> Confirmado pelo Smax de ${fmt(r.smax,2)} kVA e Consumo de ${fmt(r.consumoMensal,0)} kWh/mês · Taxa fixa ${fmt(tAtual.taxaFixa,2)} Kz/kVA · Tarifa ${fmt(tAtual.tarifaKwh,2)} Kz/kWh.`;
      } else if(r.motivo === 'consumo'){
        sub.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Pelo teu consumo de ${fmt(r.consumoMensal,0)} kWh, você não se enquadra no ${nomeAtual}.` + (r.sugestao ? ` Sugestão: ${r.sugestao}.` : '');
      } else {
        sub.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Pela tua Potência Estimada de ${fmt(r.smax,2)} kVA, você não se enquadra no ${nomeAtual}.` + (r.sugestao ? ` Sugestão: ${r.sugestao}.` : '');
      }
    }
    banner.classList.toggle('corrigido', !r.dentro);
    banner.classList.toggle('gap-alert', false);
    return;
  }

  // validar categoria actual contra o Pc actual
  const v = validarCategoriaSelecionada(state.categoria, state.pc);
  const tFinal = TARIFARIOS[v.categoriaFinal];
  if(nome) nome.textContent = tFinal.label;
  if(sub){
    const pcTxt = fmt(state.pc, 1) + ' kVA';
    if(v.mudou){
      sub.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Categoria original era <strong>${escapeHtml(TARIFARIOS[state.categoria]?.label || '—')}</strong>. Pelo teu Pc de ${escapeHtml(pcTxt)}, foste reclassificado.`;
    } else if(v.gap){
      sub.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Pc de ${escapeHtml(pcTxt)} está fora dos escalões oficiais — usámos a categoria mais próxima.`;
    } else {
      sub.innerHTML = `<i class="fa-solid fa-circle-check"></i> Confirmado pelo Pc de ${escapeHtml(pcTxt)} · Taxa fixa ${fmt(tFinal.taxaFixa,2)} Kz/kVA · Tarifa ${fmt(tFinal.tarifaKwh,2)} Kz/kWh.`;
    }
  }
  // estados visuais do banner
  banner.classList.toggle('corrigido', v.mudou);
  banner.classList.toggle('gap-alert', !v.mudou && v.gap);
}

/* ---------- Render: Resultados (estatísticas + gráfico Chart.js + QR) ---------- */
/* Cartão "Potência Contratada" no painel de Resultados.
   Para Social 1 e Social 2 o utilizador não vê o Pc (fixo internamente
   em 1,2/3,0 kVA só para a fatura) — vê a Potência Estimada da Casa
   (Smax), que é quem decide a categoria nessas duas. Nas restantes
   categorias o cartão continua a mostrar o Pc normalmente. */
function renderCardPotencia(){
  const pcEl = $('v-pc');
  if(!pcEl) return;
  const labelEl = document.querySelector('.stat-pc .stat-label');
  const cardEl = document.querySelector('.stat-pc');
  const hasCategoria = clienteSelecionado();
  const usaSmax = hasCategoria && CATEGORIAS_VALIDADAS_POR_SMAX.includes(state.categoria);

  if(labelEl) labelEl.innerHTML = usaSmax
    ? '<i class="fa-solid fa-bolt"></i>Potência Estimada da Casa'
    : '<i class="fa-solid fa-bolt"></i>Potência Contratada';
  if(cardEl) cardEl.setAttribute('data-tooltip', usaSmax
    ? 'Potência aparente estimada a partir do inventário (Σ Potência × Quantidade ÷ 0,8) — é ela que decide se você é Social 1 ou Social 2.'
    : 'Potência contratada com a ENDE — usada para calcular a taxa fixa (TaxaFixa × Pc) que compõe o custo mensal.');

  if(!hasCategoria){ pcEl.textContent = '—'; return; }
  pcEl.textContent = usaSmax ? fmt(calcularSmax(), 2) : fmt(state.pc, 1);
}

function renderResults(){
  const hasDevices = state.devices.length > 0;
  const hasCategoria = clienteSelecionado();
  // se ainda não escolheu categoria nem tem equipamentos, mostra empty state
  const podeMostrar = hasDevices && hasCategoria;
  emptyResults.classList.toggle('hidden', podeMostrar);
  resultsWrap.classList.toggle('hidden', !podeMostrar);

  // === Banner "Você é do tipo X" ===
  // Mostra a categoria detectada (que pode diferir da escolhida pelo utilizador).
  actualizarCategoriaBanner();

  if(!podeMostrar){
    // actualiza ainda assim o cartão de Potência (mostra "—" se não houver categoria)
    renderCardPotencia();
    const taxaFixaCardEl = $('v-taxa-fixa');
    if(taxaFixaCardEl) taxaFixaCardEl.textContent = hasCategoria ? fmt(tarifarioAtual().taxaFixa, 2) : '—';
    return;
  }

  const t = totals();
  // Tarefa 3: cartão de leitura da Potência Contratada (ou Potência Estimada, ver renderCardPotencia)
  renderCardPotencia();
  const taxaFixaCardEl = $('v-taxa-fixa');
  if(taxaFixaCardEl) taxaFixaCardEl.textContent = fmt(tarifarioAtual().taxaFixa, 2);

  $('v-kwh-dia').textContent = fmt(t.kwhDia);
  $('v-kwh-mes').textContent = fmt(t.kwhMes);
  $('v-kz-dia').textContent = fmt(t.kzDia, 2);
  $('v-kz-mes').textContent = fmt(t.kzMes, 0);

  const sorted = [...state.devices].sort((a,b)=> dailyKwh(b) - dailyKwh(a));
  const top = sorted[0];
  $('top-consumer-sub').textContent = top ? `Maior consumidor: ${top.nome}` : '—';

  const maxKwh = sorted.length ? dailyKwh(sorted[0]) : 1;
  $('breakdown-list').innerHTML = sorted.map((d,i)=>{
    const kwh = dailyKwh(d);
    const pct = maxKwh > 0 ? Math.max(4, (kwh/maxKwh)*100) : 4;
    const cost = kwh * tarifaAtual();
    // tooltip contextual por linha: ajuda a interpretar a barra
    const tooltip = `${escapeHtml(d.nome)} — ${d.quantidade} un. × ${fmt(d.potencia,0)} W × ${fmt(d.horas,1)} h/dia = ${fmt(kwh)} kWh/dia (${fmt(cost,0)} Kz/dia à tarifa atual).`;
    return `<div class="bk-row" data-tooltip="${escapeHtml(tooltip)}">
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
  renderTipoCliente();          // Tarefa: nova tab Tipo de Cliente
  updateProgress();
  updateTabsLockState();        // gate: bloqueia/desbloqueia tabs conforme tipo de cliente
}
function updateProgress(){
  document.querySelectorAll('.progress-seg').forEach((seg,i)=>{
    seg.classList.toggle('done', i < currentTab);
    seg.classList.toggle('current', i === currentTab);
  });
}

/* ---------- Abas (com gate de tipo de cliente) ----------
   Estrutura dos índices de tabs (4 tabs agora):
     0 = Tipo de Cliente  (sempre acessível)
     1 = Inventário       (bloqueada até state.categoria estar definida)
     2 = Período de Uso   (bloqueada até state.categoria estar definida)
     3 = Resultados       (bloqueada até state.categoria estar definida)
   ------------------------------------------------------- */
function updateTabsLockState(){
  const ok = clienteSelecionado();
  document.querySelectorAll('.tab').forEach(tab=>{
    const idx = +tab.getAttribute('data-tab');
    if(idx === 0){
      tab.classList.remove('locked');
    } else {
      tab.classList.toggle('locked', !ok);
    }
  });
}

function switchTab(idx){
  // gate: se ainda não escolheu tipo de cliente, só pode estar na tab 0
  if(idx !== 0 && !clienteSelecionado()){
    // feedback discreto: força a tab 0 e mostra um hint visual sem bloquear com alert
    document.querySelectorAll('.tab').forEach(t=> t.classList.toggle('active', +t.getAttribute('data-tab')===0));
    document.querySelectorAll('.panel').forEach((p,i)=> p.classList.toggle('active', i===0));
    currentTab = 0;
    updateProgress();
    // pisca a tab de Tipo de Cliente para sinalizar
    const tab0 = document.querySelector('.tab[data-tab="0"]');
    if(tab0){ tab0.classList.add('pulse-warn'); setTimeout(()=> tab0.classList.remove('pulse-warn'), 900); }
    return;
  }
  currentTab = idx;
  document.querySelectorAll('.tab').forEach(t=> t.classList.toggle('active', +t.getAttribute('data-tab')===idx));
  document.querySelectorAll('.panel').forEach((p,i)=> p.classList.toggle('active', i===idx));
  updateProgress();
  // idx === 3 agora é Resultados (era 2 antes); idx === 0 é Tipo de Cliente
  if(idx === 3){
    gerarQRInstagram(); // só gera o QR quando o visitante chega aos Resultados
    lerResumoResultados();
  }
}
document.querySelectorAll('.tab').forEach(t=> t.addEventListener('click', ()=> switchTab(+t.getAttribute('data-tab'))));

/* ============================================================
   TAB 0 — Tipo de Cliente (selecção inicial, gate do fluxo)
   ------------------------------------------------------------
   Estrutura em 2 níveis:
     Nível 1 (raiz): 2 cards grandes — Residencial / Empresarial
     Nível 2 (sub):  4 cartões de categoria cada (1-4 ou 5-8)

   GRUPOS_CATEGORIAS define quais categorias pertencem a cada grupo.
   ============================================================ */
const GRUPOS_CATEGORIAS = {
  residencial: {
    label: 'Residencial',
    icon: 'fa-house-chimney-window',
    categorias: ['bt-social1','bt-social2','bt-mono','bt-trif']
  },
  empresarial: {
    label: 'Empresarial / Industrial',
    icon: 'fa-industry',
    categorias: ['bt-ind','bt-cs','mt-ind','at-ind']
  }
};

/* Grupo actualmente aberto na tab Tipo de Cliente (null = mostra os 2 cards grandes). */
let grupoClienteActivo = null;

function renderTipoCliente(){
  const raiz = $('tipo-cliente-raiz');
  const sub  = $('tipo-cliente-sub');
  if(!raiz || !sub) return;

  // mostra o nível apropriado consoante grupoClienteActivo
  // (NÃO forçamos mais a abertura automática — o utilizador controla onde está)
  if(grupoClienteActivo){
    raiz.classList.add('hidden');
    sub.classList.remove('hidden');
    renderSubCategorias(grupoClienteActivo);
  } else {
    raiz.classList.remove('hidden');
    sub.classList.add('hidden');
    // marca qual grupo tem a categoria seleccionada (dica visual para o utilizador)
    document.querySelectorAll('.card-grande').forEach(card=>{
      const grupo = card.getAttribute('data-grupo');
      const temCat = state.categoria && GRUPOS_CATEGORIAS[grupo].categorias.includes(state.categoria);
      card.classList.toggle('seleccionado', !!temCat);
    });
  }
}

/* Renderiza os cartões de sub-categoria para o grupo escolhido. */
function renderSubCategorias(grupoKey){
  const wrap = $('tipo-cliente-grid');
  const titulo = $('sub-grupos-titulo');
  const grupo = GRUPOS_CATEGORIAS[grupoKey];
  if(!wrap || !grupo) return;

  if(titulo){
    titulo.innerHTML = `<i class="fa-solid ${grupo.icon}"></i> ${escapeHtml(grupo.label)} — escolha a categoria`;
  }

  // mapeia a chave da categoria para o número de ordem (1-8) para manter a numeração original
  const idxGlobal = (cat) => ORDEM_CATEGORIAS.indexOf(cat) + 1;

  let html = '';
  grupo.categorias.forEach((key)=>{
    const t = TARIFARIOS[key];
    if(!t) return;
    const isSelected = state.categoria === key;
    const num = idxGlobal(key);
    const pcHint = t.pcOptions
      ? ('Pc: ' + t.pcOptions.map(v=> fmt(v,1)+' kVA').join(' · '))
      : (t.pcMin && t.pcMax ? ('Pc: ' + fmt(t.pcMin,1) + ' a ' + fmt(t.pcMax,1) + ' kVA') : 'Pc: livre');
    const tooltip = `${t.label} — Taxa fixa: ${fmt(t.taxaFixa,2)} Kz/kVA · Tarifa: ${fmt(t.tarifaKwh,2)} Kz/kWh. ${t.descricao}`;
    html += `<button type="button" class="cat-card ${isSelected?'selected':''}" data-cat="${key}" data-tooltip="${escapeHtml(tooltip)}">
      <div class="cat-card-no">${num}</div>
      <div class="cat-card-body">
        <div class="cat-card-name">${escapeHtml(t.label)}</div>
        <div class="cat-card-meta">
          <span class="meta-pill taxa"><i class="fa-solid fa-bolt"></i> ${fmt(t.taxaFixa,2)} Kz/kVA</span>
          <span class="meta-pill tarifa"><i class="fa-solid fa-coins"></i> ${fmt(t.tarifaKwh,2)} Kz/kWh</span>
        </div>
        <div class="cat-card-pc"><i class="fa-solid fa-plug"></i> ${escapeHtml(pcHint)}</div>
        ${t.revisao ? '<div class="cat-card-revisao"><i class="fa-solid fa-triangle-exclamation"></i> Valores a confirmar</div>' : ''}
      </div>
      <div class="cat-card-check"><i class="fa-solid fa-circle-check"></i></div>
    </button>`;
  });
  wrap.innerHTML = html;
  wrap.querySelectorAll('.cat-card').forEach(card=>{
    card.addEventListener('click', ()=> selecionarTipoCliente(card.getAttribute('data-cat')));
  });
}

/* Handler dos 2 cards grandes (nível 1) — abre o grupo correspondente. */
function abrirGrupoCliente(grupoKey){
  if(!GRUPOS_CATEGORIAS[grupoKey]) return;
  grupoClienteActivo = grupoKey;
  renderTipoCliente();
}

/* Handler do botão "Voltar" — volta ao nível 1 (os 2 cards grandes). */
function voltarAosGrupos(){
  grupoClienteActivo = null;
  renderTipoCliente();
}

/* Event listeners para os 2 cards grandes e o botão Voltar.
   Usamos querySelectorAll com atributo data-grupo para suportar cliques em qualquer
   elemento dentro do card (ícone, texto, etc.) — o handler sobe até ao botão. */
document.addEventListener('click', (e)=>{
  // Procura o elemento com data-grupo mais próximo do alvo do clique
  const cardGrande = e.target.closest('[data-grupo]');
  if(cardGrande){
    abrirGrupoCliente(cardGrande.getAttribute('data-grupo'));
    return;
  }
  // Botão "Voltar" para os grupos
  if(e.target.closest('#btn-voltar-grupos')){
    voltarAosGrupos();
    return;
  }
});

function selecionarTipoCliente(cat){
  const t = TARIFARIOS[cat];
  if(!t) return;
  state.categoria = cat;
  state.pc = pcDefaultParaCategoria(cat);
  state.tarifaOverride = null;          // trocar de categoria => tarifa volta ao oficial
  // sincroniza campos legados (categoriaSelect, pcInput, tarifaInput) para manter consistência
  if(categoriaSelect) categoriaSelect.value = cat;
  if(pcInput) pcInput.value = state.pc;
  if(tarifaInput) tarifaInput.value = t.tarifaKwh || '';
  save();
  atualizarResumoTarifario();
  renderTipoCliente();
  renderResults();
  updateTabsLockState();

  // === Validação automática: "O Pc é quem manda" ===
  // Verificar se a categoria escolhida é compatível com o Pc default.
  // Como estamos a usar o Pc default da própria categoria, NÃO deve haver divergência
  // aqui — mas validamos à mesma para o caso de o utilizador ter mexido no Pc antes.
  const validacao = validarCategoriaSelecionada(cat, state.pc);
  if(validacao.alerta){
    // mostrar alerta (info, não erro) — sem bloquear o fluxo
    Swal.fire({
      title: validacao.mudou ? 'Categoria ajustada' : 'Atenção',
      html: `<p style="font-size:1.05rem;line-height:1.5;">${escapeHtml(validacao.alerta)}</p>`,
      icon: validacao.mudou ? 'info' : 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#E85D04',
      timer: validacao.mudou ? null : 4500,
      timerProgressBar: !validacao.mudou
    }).then(()=>{
      if(validacao.mudou){
        // se a categoria mudou, actualizar tudo
        state.categoria = validacao.categoriaFinal;
        state.pc = pcDefaultParaCategoria(validacao.categoriaFinal);
        state.tarifaOverride = null;
        if(categoriaSelect) categoriaSelect.value = state.categoria;
        if(pcInput) pcInput.value = state.pc;
        if(tarifaInput) tarifaInput.value = TARIFARIOS[state.categoria].tarifaKwh || '';
        save();
        atualizarResumoTarifario();
        renderTipoCliente();
        renderResults();
      }
      // avanço para Inventário só depois do utilizador fechar o alerta
      setTimeout(()=> switchTab(1), 250);
    });
  } else {
    // sem divergência: avanço automático para a próxima tab (Inventário) — UX kiosk
    setTimeout(()=> switchTab(1), 350);
  }
}

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
      // Tarefa 2: tooltip no item do catálogo — ajuda o visitante a perceber o que vai adicionar
      const consumo6h = ((it.potencia * 6) / 1000); // estimativa a 6h/dia (horaSugeridas pode variar)
      const tooltip = `${it.nome} · ${CATEGORIAS[it.categoria].label} — ${it.potencia} W. Sugestão de uso: ${it.horasSugeridas}h/dia (~${fmt(consumo6h,2)} kWh a 6h/dia). Toque para adicionar ao inventário.`;
      html += `<button type="button" class="catalog-item" data-add-catalog="${escapeHtml(it.nome)}" data-tooltip="${escapeHtml(tooltip)}">
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

/* ---------- Tarifário (categoria + Potência Contratada + tarifa editável) ----------
   Nota: a selecção principal de categoria faz-se na tab 0 "Tipo de Cliente".
   O <select id="categoria-select"> no painel de Resultados continua a funcionar
   como atalho para trocar de categoria sem voltar atrás, e usa o mesmo path
   de sincronização. */
function atualizarResumoTarifario(){
  const pcRow = pcInput ? pcInput.closest('.tariff-row') : null;
  if(!state.categoria){
    // ainda sem categoria: mostra estado vazio no header
    if(tariffHeader) tariffHeader.textContent = 'Tipo de cliente por seleccionar';
    if(taxaFixaAplicadaEl) taxaFixaAplicadaEl.textContent = '—';
    if(avisoGrandes) avisoGrandes.style.display = 'none';
    if(pcInput) pcInput.disabled = true;
    if(tarifaInput) tarifaInput.disabled = true;
    if(pcRow) pcRow.classList.remove('hidden');
    return;
  }
  const t = tarifarioAtual();
  if(taxaFixaAplicadaEl) taxaFixaAplicadaEl.textContent = fmt(t.taxaFixa, 2);
  if(tariffHeader) tariffHeader.textContent = t.short + ' · ' + fmt(tarifaAtual()) + ' Kz/kWh';
  if(avisoGrandes) avisoGrandes.style.display = t.semDados ? 'block' : 'none';
  if(pcInput) pcInput.disabled = !!t.semDados;
  if(tarifaInput) tarifaInput.disabled = !!t.semDados;

  // Social 1 e Social 2: o Pc é fixo internamente (1,2/3,0 kVA), usado só para
  // calcular a fatura — não é o utilizador quem o define, então o campo some.
  // A categoria correcta é validada pelo Smax (ver calcularSmax() / card no Inventário).
  const escondePc = CATEGORIAS_VALIDADAS_POR_SMAX.includes(state.categoria);
  if(pcRow) pcRow.classList.toggle('hidden', escondePc);
  if(pcInput) pcInput.disabled = pcInput.disabled || escondePc;
}

categoriaSelect.addEventListener('change', ()=>{
  // o select está escondido (a categoria é detectada pelo Pc), mas mantemos
  // o listener para o caso de ser accionado programaticamente.
  selecionarTipoCliente(categoriaSelect.value);
});

/* Handler do input de Pc — agora é a forma principal de influenciar a categoria.
   Ao mudar o Pc, validamos a categoria e mostramos um alerta se for diferente. */
let alertaPcEmCurso = false;  // evita alertas sobrepostos enquanto o utilizador ainda está a digitar
let debouncePcTimer = null;
pcInput.addEventListener('input', ()=>{
  const val = parseFloat(pcInput.value);
  state.pc = isNaN(val) ? 0 : val;
  save();
  // actualiza UI imediatamente (banner + cartões)
  actualizarCategoriaBanner();
  renderResults();
  // dispara validação com pequeno debounce (700ms) para não interromper a digitação
  // e evitar múltiplos alertas se o utilizador estiver a apagar e reescrever
  if(debouncePcTimer) clearTimeout(debouncePcTimer);
  debouncePcTimer = setTimeout(()=>{
    if(!state.categoria || alertaPcEmCurso) return;
    const v = validarCategoriaSelecionada(state.categoria, state.pc);
    if(v.alerta && v.mudou){
      alertaPcEmCurso = true;
      Swal.fire({
        title: 'Categoria reclassificada',
        html: `<p style="font-size:1.05rem;line-height:1.5;">${escapeHtml(v.alerta)}</p>
               <p style="margin-top:10px;font-size:0.95rem;color:#565B64;">
                 A categoria foi actualizada para <strong>${escapeHtml(TARIFARIOS[v.categoriaFinal].label)}</strong>.
               </p>`,
        icon: 'info',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#E85D04'
      }).then(()=>{
        // aplica a categoria detectada
        state.categoria = v.categoriaFinal;
        state.tarifaOverride = null;
        if(categoriaSelect) categoriaSelect.value = state.categoria;
        if(tarifaInput) tarifaInput.value = TARIFARIOS[state.categoria].tarifaKwh || '';
        save();
        atualizarResumoTarifario();
        actualizarCategoriaBanner();
        renderResults();
        alertaPcEmCurso = false;
      });
    }
  }, 700);
});

tarifaInput.addEventListener('input', ()=>{
  const val = parseFloat(tarifaInput.value);
  state.tarifaOverride = isNaN(val) ? null : val;
  save();
  atualizarResumoTarifario();
  renderResults();
});

/* ---------- Botão "Trocar" do banner de categoria ---------- */
const btnTrocarCat = $('categoria-banner-change');
if(btnTrocarCat){
  btnTrocarCat.addEventListener('click', ()=>{
    // volta à tab Tipo de Cliente sem limpar o que já foi preenchido
    switchTab(0);
  });
}

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
   EXPORTAR RELATÓRIO EM PDF
   ------------------------------------------------------------
   Gera um PDF com:
     - Cabeçalho ENDE · FILDA 2026
     - Data e hora
     - Categoria detectada + Pc
     - Tabela de equipamentos (nome, watts, qtd, horas, kWh/dia, Kz/dia)
     - Resumo (consumo diário/mensal, custo diário/mensal)
     - Gráfico de distribuição como imagem
     - Conselho do técnico (se preenchido)
     - Rodapé com branding
   Bibliotecas: jsPDF (geração) + html2canvas (converter o canvas
   do Chart.js para imagem PNG embutida no PDF)
   ============================================================ */
async function exportarRelatorioPDF(){
  // verifica que as bibliotecas estão carregadas
  if(typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF){
    Swal.fire({
      title:'Biblioteca indisponível',
      text:'Não foi possível carregar o jsPDF. Verifique a ligação à internet (o CDN pode estar bloqueado).',
      icon:'error', confirmButtonColor:'#E85D04'
    });
    return;
  }
  if(!state.devices.length){
    Swal.fire({
      title:'Sem dados',
      text:'Adicione pelo menos um equipamento antes de exportar o relatório.',
      icon:'warning', confirmButtonColor:'#E85D04'
    });
    return;
  }

  // mostra um loader
  Swal.fire({
    title:'A gerar relatório...',
    text:'Aguarde alguns segundos.',
    allowOutsideClick:false,
    didOpen: ()=> Swal.showLoading()
  });

  try{
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:'mm', format:'a4' });
    const W = 210; // largura A4 em mm
    const H = 297; // altura A4 em mm
    const M = 14;  // margem
    let y = 0;

    // === CABEÇALHO ===
    // faixa vermelha no topo
    doc.setFillColor(200, 16, 46);
    doc.rect(0, 0, W, 28, 'F');
    // título
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('ENDE — Simulador de Consumo', M, 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('FILDA 2026 · Literacia Energética', M, 20);
    // data no canto direito
    const agora = new Date();
    const dataStr = agora.toLocaleString('pt-PT', {
      day:'2-digit', month:'2-digit', year:'numeric',
      hour:'2-digit', minute:'2-digit'
    });
    doc.text('Emitido em: ' + dataStr, W - M, 20, { align:'right' });
    y = 36;

    // === IDENTIFICAÇÃO DO CLIENTE ===
    doc.setTextColor(11, 21, 32);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Identificação do Cliente', M, y);
    y += 5;
    doc.setDrawColor(228, 230, 235);
    doc.line(M, y, W - M, y);
    y += 5;

    const v = validarCategoriaSelecionada(state.categoria, state.pc);
    const tFinal = TARIFARIOS[v.categoriaFinal];
    const tInfo = TARIFARIOS[state.categoria] || {label:'—'};

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    let linhaCli1 = 'Categoria seleccionada: ' + tInfo.label;
    if(v.mudou){
      linhaCli1 += '  (reclassificada para: ' + tFinal.label + ')';
    }
    doc.text(linhaCli1, M, y); y += 5;
    doc.text('Categoria detectada pelo Pc: ' + tFinal.label, M, y); y += 5;
    doc.text('Potência Contratada (Pc): ' + fmt(state.pc, 2) + ' kVA', M, y); y += 5;
    doc.text('Taxa Fixa: ' + fmt(tFinal.taxaFixa, 2) + ' Kz/kVA    Tarifa: ' + fmt(tFinal.tarifaKwh, 2) + ' Kz/kWh', M, y); y += 9;

    // === TABELA DE EQUIPAMENTOS ===
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Equipamentos Simulados', M, y); y += 5;
    doc.line(M, y, W - M, y); y += 5;

    // cabeçalho da tabela
    const colX = [M, M+78, M+100, M+118, M+138, M+160, M+183];
    const colW = [78, 22, 18, 20, 22, 23, 0];
    const headers = ['Equipamento', 'Watts (un.)', 'Qtd.', 'Horas/dia', 'kWh/dia', 'Kz/dia', ''];
    doc.setFillColor(245, 246, 248);
    doc.rect(M, y-4, W-2*M, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(86, 91, 100);
    headers.forEach((h, i)=> doc.text(h, colX[i], y));
    y += 7;

    // linhas dos equipamentos
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(11, 21, 32);
    const tarifa = tarifaAtual();
    const sorted = [...state.devices].sort((a,b)=> dailyKwh(b) - dailyKwh(a));
    sorted.forEach((d, idx)=>{
      if(y > H - 30){
        doc.addPage();
        y = 20;
      }
      const kwh = dailyKwh(d);
      const kz = kwh * tarifa;
      // zebra
      if(idx % 2 === 0){
        doc.setFillColor(250, 251, 252);
        doc.rect(M, y-4, W-2*M, 6.5, 'F');
      }
      // nome (trunca se for muito comprido)
      let nome = d.nome;
      if(nome.length > 42) nome = nome.substring(0, 41) + '…';
      doc.text(nome, colX[0], y);
      doc.text(fmt(d.potencia, 0) + ' W', colX[1], y);
      doc.text(String(d.quantidade), colX[2], y);
      doc.text(fmt(d.horas, 1) + ' h', colX[3], y);
      doc.text(fmt(kwh, 3), colX[4], y);
      doc.text(fmt(kz, 0) + ' Kz', colX[5], y);
      y += 6.5;
    });
    y += 4;

    // === RESUMO ===
    if(y > H - 60){
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Resumo do Consumo e Custo', M, y); y += 5;
    doc.line(M, y, W - M, y); y += 6;

    const t = totals();
    // 2 colunas: esquerda = consumo, direita = custo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(86, 91, 100);
    doc.text('CONSUMO', M, y);
    doc.text('CUSTO ESTIMADO', W/2 + 5, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(11, 21, 32);
    doc.text('Diário:  ' + fmt(t.kwhDia) + ' kWh', M, y);
    doc.text('Diário:  ' + fmt(t.kzDia, 0) + ' Kz', W/2 + 5, y);
    y += 6;
    doc.text('Mensal: ' + fmt(t.kwhMes) + ' kWh', M, y);
    // custo mensal em destaque (vermelho)
    doc.setTextColor(200, 16, 46);
    doc.setFont('helvetica', 'bold');
    doc.text('Mensal: ' + fmt(t.kzMes, 0) + ' Kz', W/2 + 5, y);
    doc.setTextColor(11, 21, 32);
    doc.setFont('helvetica', 'normal');
    y += 6;

    // nota sobre o IVA
    doc.setFontSize(7.5);
    doc.setTextColor(138, 143, 152);
    doc.text('* Custos calculados com a fórmula oficial ENDE: (TaxaFixa × Pc + Tarifa × Consumo) × 1,14 (IVA 14%). Valores de referência — confirme com a categoria real do cliente.', M, y);
    y += 8;

    // === GRÁFICO ===
    if(y > H - 80){
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(11, 21, 32);
    doc.text('Distribuição do Consumo', M, y); y += 5;
    doc.line(M, y, W - M, y); y += 6;

    // capturar o canvas do Chart.js como imagem
    const canvas = document.getElementById('grafico-consumo');
    if(canvas && typeof html2canvas !== 'undefined'){
      try{
        // captura como imagem com fundo branco
        const imgCanvas = await html2canvas(canvas, {
          backgroundColor:'#ffffff',
          scale: 2, // alta resolução
          logging: false
        });
        const imgData = imgCanvas.toDataURL('image/png');
        // dimensões: 120mm de largura, altura proporcional
        const imgW = 120;
        const imgH = (imgCanvas.height * imgW) / imgCanvas.width;
        const imgX = (W - imgW) / 2; // centrado
        doc.addImage(imgData, 'PNG', imgX, y, imgW, Math.min(imgH, 80));
        y += Math.min(imgH, 80) + 6;
      }catch(e){
        console.warn('[ENDE PDF] Não foi possível capturar o gráfico:', e);
        doc.text('(Gráfico não disponível para exportação)', M, y);
        y += 6;
      }
    }

    // === MAIORES CONSUMIDORES ===
    if(y > H - 50){
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Maiores Consumidores', M, y); y += 5;
    doc.line(M, y, W - M, y); y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    sorted.slice(0, 5).forEach((d, i)=>{
      const kwh = dailyKwh(d);
      const pct = (kwh / t.kwhDia) * 100;
      let nm = d.nome;
      if(nm.length > 50) nm = nm.substring(0, 49) + '…';
      doc.text((i+1) + '. ' + nm + ' — ' + fmt(kwh) + ' kWh/dia (' + fmt(pct, 1) + '% do total)', M, y);
      y += 5;
    });
    y += 4;

    // === CONSELHO DO TÉCNICO ===
    if(state.advice && state.advice.trim()){
      if(y > H - 40){
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Conselho do Técnico ENDE', M, y); y += 5;
      doc.line(M, y, W - M, y); y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      // quebra o texto em linhas de ~90 caracteres
      const linhas = doc.splitTextToSize(state.advice, W - 2*M);
      linhas.forEach(linha => {
        if(y > H - 20){ doc.addPage(); y = 20; }
        doc.text(linha, M, y);
        y += 5;
      });
      y += 4;
    }

    // === RODAPÉ ===
    const totalPaginas = doc.internal.getNumberOfPages();
    for(let p = 1; p <= totalPaginas; p++){
      doc.setPage(p);
      // linha do rodapé
      doc.setDrawColor(228, 230, 235);
      doc.line(M, H - 12, W - M, H - 12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(138, 143, 152);
      doc.text('ENDE · FILDA 2026 — Simulador de Literacia Energética', M, H - 7);
      doc.text('Página ' + p + ' de ' + totalPaginas, W - M, H - 7, { align:'right' });
    }

    // === GUARDAR ===
    const nomeFicheiro = 'ENDE_Simulador_' + agora.toISOString().slice(0,10) + '.pdf';
    doc.save(nomeFicheiro);

    Swal.close();
    // feedback de sucesso
    Swal.fire({
      title:'Relatório gerado!',
      html:'<p>O ficheiro <strong>' + nomeFicheiro + '</strong> foi descarregado.</p><p style="margin-top:8px;font-size:0.85rem;color:#565B64;">Pode entregá-lo ao cliente como recordação da simulação.</p>',
      icon:'success',
      confirmButtonColor:'#E85D04',
      timer: 4000,
      timerProgressBar: true
    });
  }catch(err){
    console.error('[ENDE PDF] Erro ao gerar relatório:', err);
    Swal.fire({
      title:'Erro ao gerar PDF',
      html:'<p>Ocorreu um erro inesperado:</p><pre style="margin-top:8px;font-size:0.8rem;background:#f5f6f8;padding:8px;border-radius:6px;white-space:pre-wrap;">' + escapeHtml(String(err && err.message || err)) + '</pre>',
      icon:'error',
      confirmButtonColor:'#E85D04'
    });
  }
}

$('btn-exportar-pdf').addEventListener('click', exportarRelatorioPDF);

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
// sincroniza os campos legados do painel de Resultados com o state
categoriaSelect.value = state.categoria || '';
pcInput.value = (state.pc != null) ? state.pc : '';
tarifaInput.value = (typeof state.tarifaOverride === 'number')
  ? state.tarifaOverride
  : (state.categoria ? (tarifarioAtual().tarifaKwh || '') : '');
atualizarResumoTarifario();
adviceText.value = state.advice || '';
renderAll();
// começa sempre na tab 0 (Tipo de Cliente). Mesmo que já haja state guardado,
// o utilizador vê o tipo de cliente seleccionado e pode avançar ou trocar.
switchTab(0);
escreverTexto(document.getElementById('texto-boas-vindas'), TEXTO_BOAS_VINDAS, 26);

/* ============================================================
   DESBLOQUEIO DA VOZ (autoplay policy do Chrome)
   ------------------------------------------------------------
   O Chrome (e a maioria dos browsers modernos) bloqueia
   speechSynthesis.speak() até o utilizador interagir com a
   página (clique, toque, tecla). Por isso, NÃO arrancamos o
   loop de boas-vindas em load time — esperamos pelo primeiro
   gesto do utilizador.

   Quando ele clicar em qualquer sítio (ou tocar no ecrã), fazemos:
     1. Um "warm-up" silencioso com uma utterance vazia
        (algumas implementações só desbloqueiam depois da 1ª fala)
     2. Arrancamos o loop de boas-vindas normalmente
   ============================================================ */
let vozDesbloqueada = false;
function desbloquearVoz(){
  if(vozDesbloqueada) return;
  vozDesbloqueada = true;
  if(!('speechSynthesis' in window)) return;
  try{
    // warm-up: utterance vazia, volume 0 — apenas para "acordar" o motor
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    u.lang = 'pt-PT';
    if(vozPortuguesa) u.voice = vozPortuguesa;
    window.speechSynthesis.speak(u);
    console.info('[ENDE voz] Voz desbloqueada após interação do utilizador.');
  }catch(e){ console.warn('[ENDE voz] Erro no warm-up:', e); }
  // arranca o loop de boas-vindas se ainda estivermos na Tela 1
  if(estadoAtual === 'boas-vindas'){
    setTimeout(()=> tocarLoopBoasVindas(), 200);
  }
}
// escuta o PRIMEIRO clique/toque/tecla em todo o document
['click','touchstart','keydown'].forEach(evt=>{
  document.addEventListener(evt, desbloquearVoz, { once: true, passive: true });
});
// nota: não chamamos tocarLoopBoasVindas() no arranque — só depois do 1º clique.

/* ============================================================
   Tarefa 2 — MOTOR DE TOOLTIPS DE ACESSIBILIDADE
   ------------------------------------------------------------
   Um único tooltip global, partilhado por todos os elementos que
   tenham o atributo `data-tooltip`. Funciona com:
     - hover (rato) — segue o cursor dentro do elemento
     - focus (teclado) — aparece junto ao elemento focado
     - toque longo (touch) — para ecrãs táteis em modo kiosk
   Não bloqueia cliques nem interrompe o timer de inatividade.
   ============================================================ */
(function setupTooltips(){
  // elemento único, criado uma vez
  const tip = document.createElement('div');
  tip.className = 'ende-tooltip';
  tip.setAttribute('role', 'tooltip');
  tip.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tip);

  let hideTimer = null;
  let currentTarget = null;

  function show(target, text, x, y){
    if(!text || !text.trim()) return;
    currentTarget = target;
    tip.textContent = text;
    tip.classList.add('show');
    tip.setAttribute('aria-hidden', 'false');
    // posicionamento inteligente: respeita as bordas do viewport
    const rect = tip.getBoundingClientRect();
    const w = rect.width || 200;
    const h = rect.height || 40;
    let left = (typeof x === 'number') ? x : (target.getBoundingClientRect().left + target.getBoundingClientRect().width/2 - w/2);
    let top  = (typeof y === 'number') ? y + 14 : (target.getBoundingClientRect().bottom + 8);
    // clamp horizontal
    left = Math.max(10, Math.min(window.innerWidth - w - 10, left));
    // se passar do fundo, mostra acima do elemento
    if(top + h > window.innerHeight - 10){
      top = (typeof y === 'number') ? y - h - 14 : (target.getBoundingClientRect().top - h - 8);
    }
    tip.style.left = left + 'px';
    tip.style.top  = top  + 'px';
  }
  function hide(){
    tip.classList.remove('show');
    tip.setAttribute('aria-hidden', 'true');
    currentTarget = null;
  }

  // encontra o elemento "tooltipável" mais próximo (lida com nested elements)
  function findTooltipTarget(el){
    while(el && el !== document.body){
      if(el.dataset && el.dataset.tooltip) return el;
      el = el.parentElement;
    }
    return null;
  }

  // ---- rato: hover + seguimento do cursor ----
  document.addEventListener('mouseover', (e)=>{
    const t = findTooltipTarget(e.target);
    if(!t){ return; }
    clearTimeout(hideTimer);
    show(t, t.dataset.tooltip, e.clientX, e.clientY);
  });
  document.addEventListener('mousemove', (e)=>{
    if(!currentTarget) return;
    const t = findTooltipTarget(e.target);
    if(t !== currentTarget) return; // só segue enquanto estamos dentro do mesmo alvo
    tip.style.left = Math.max(10, Math.min(window.innerWidth - tip.offsetWidth - 10, e.clientX + 14)) + 'px';
    tip.style.top  = Math.max(10, Math.min(window.innerHeight - tip.offsetHeight - 10, e.clientY + 18)) + 'px';
  });
  document.addEventListener('mouseout', (e)=>{
    const t = findTooltipTarget(e.target);
    if(!t) return;
    const related = e.relatedTarget;
    // só esconde se saímos mesmo do alvo (não para um filho)
    if(!related || !t.contains(related)){
      hideTimer = setTimeout(hide, 80);
    }
  });

  // ---- teclado: focus / blur ----
  document.addEventListener('focusin', (e)=>{
    const t = findTooltipTarget(e.target);
    if(!t) return;
    clearTimeout(hideTimer);
    const r = t.getBoundingClientRect();
    show(t, t.dataset.tooltip, r.left, r.bottom);
  });
  document.addEventListener('focusout', (e)=>{
    const t = findTooltipTarget(e.target);
    if(!t) return;
    hideTimer = setTimeout(hide, 80);
  });

  // ---- toque (kiosk): toque curto mostra, toque noutro sítio esconde ----
  let touchHintTimer = null;
  document.addEventListener('touchstart', (e)=>{
    const t = findTooltipTarget(e.target);
    if(!t){ hide(); return; }
    clearTimeout(hideTimer);
    const touch = e.touches[0];
    show(t, t.dataset.tooltip, touch.clientX, touch.clientY);
    // esconde sozinho ao fim de 4s (para não acumular dicas soltas no kiosk)
    clearTimeout(touchHintTimer);
    touchHintTimer = setTimeout(hide, 4000);
  }, {passive:true});

  // ao scroll, esconde (evita tooltip "flutuante" deslocado)
  window.addEventListener('scroll', hide, true);
  window.addEventListener('resize', hide);
})();

})();