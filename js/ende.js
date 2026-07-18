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
function falar(texto, aoTerminar){
  if(mudo || !('speechSynthesis' in window)){
    console.warn('[ENDE voz] falar() cancelado:', mudo ? 'mudo=true' : 'speechSynthesis indisponível');
    if(aoTerminar) aoTerminar();
    return;
  }
  const utter = new SpeechSynthesisUtterance(texto);
  utter.lang = 'pt-PT';
  if(vozPortuguesa) utter.voice = vozPortuguesa;
  utter.rate = 0.98;
  utter.pitch = 0.90; // Dica: podes baixar para X se quisermos tornar o tom ligeiramente mais grave
  utter.volume = Math.max(0, Math.min(1, volumeVoz)); // applica o volume global, com clamp de segurança
  // logs de depuração — ajuda a perceber porque é que a voz pode não estar a funcionar
  console.info('[ENDE voz] falar():', {
    texto: texto.substring(0, 80) + (texto.length > 80 ? '...' : ''),
    volume: utter.volume,
    voz: vozPortuguesa ? (vozPortuguesa.name + ' / ' + vozPortuguesa.lang) : 'nenhuma PT encontrada',
    vozesDisponiveis: window.speechSynthesis.getVoices().length,
    estadoAnterior: window.speechSynthesis.speaking ? 'a falar' : 'parado'
  });
  if(aoTerminar){ utter.onend = aoTerminar; utter.onerror = (e)=>{ console.error('[ENDE voz] erro:', e); if(aoTerminar) aoTerminar(); }; }
  window.speechSynthesis.speak(utter);
  //某些 Chrome versions需要 este "resume" para não pausar a voz
  if(window.speechSynthesis.paused) window.speechSynthesis.resume();
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
const TARIFARIOS = {
  'bt-social1': { label:'BT Doméstico Social 1',     short:'BT-Social1',  taxaFixa:0,    tarifaKwh:3.20,
                  descricao:'Tarifa social para consumos muito baixos. Smax ≤ 1,2 kVA · consumo ≤ 120 kWh/mês.',
                  pcOptions:[1.2], pcDefault:1.2 },
  'bt-social2': { label:'BT Doméstico Social 2',     short:'BT-Social2',  taxaFixa:80,   tarifaKwh:8.33,
                  descricao:'Tarifa social para consumos baixos. 1,2 < Smax ≤ 3 kVA · consumo ≤ 20 kWh/mês (limite a confirmar).',
                  pcOptions:[1.2, 2.3, 3.0], pcDefault:2.3, pcMin:1.2, pcMax:3.0 },
  'bt-mono':    { label:'BT Doméstico Monofásico',   short:'BT-Mono',     taxaFixa:117,  tarifaKwh:14.16,
                  descricao:'Cliente doméstico monofásico standard. Potência contratada fixa em 4 escalões.',
                  pcOptions:[3.3, 4.4, 6.6, 9.9], pcDefault:6.6 },
  'bt-trif':    { label:'BT Doméstico Especial Trifásico', short:'BT-Trif',  taxaFixa:117, tarifaKwh:19.16,
                  descricao:'Cliente doméstico trifásico especial. Pc entre 13,2 e 49,9 kVA.',
                  pcMin:13.2, pcMax:49.9, pcDefault:13.2 },
  'bt-ind':     { label:'BT Industrial',              short:'BT-Ind',      taxaFixa:130,  tarifaKwh:19.17,
                  descricao:'Cliente industrial em baixa tensão (monofásico ou trifásico).',
                  pcMin:1, pcMax:999, pcDefault:13.2 },
  'bt-cs':      { label:'BT Comércio e Serviço',      short:'BT-Com/Serv', taxaFixa:130,  tarifaKwh:16.67,
                  descricao:'Cliente de comércio e serviços em baixa tensão (monofásico ou trifásico).',
                  pcMin:1, pcMax:999, pcDefault:13.2 },
  'mt-ind':     { label:'MT Indústria',               short:'MT-Ind',      taxaFixa:239.20, tarifaKwh:14.99,
                  descricao:'Cliente industrial em média tensão.',
                  pcMin:1, pcMax:9999, pcDefault:100 },
  'at-ind':     { label:'AT Indústria',                short:'AT-Ind',      taxaFixa:239.20, tarifaKwh:14.99,
                  descricao:'Cliente industrial em alta tensão. Valores replicados do MT-Ind (a confirmar o oficial).',
                  pcMin:1, pcMax:99999, pcDefault:1000, revisao:true }
};

/* Ordem canónica de apresentação das 8 categorias (para a UI da nova tab). */
const ORDEM_CATEGORIAS = ['bt-social1','bt-social2','bt-mono','bt-trif','bt-ind','bt-cs','mt-ind','at-ind'];

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
    // actualiza ainda assim o cartão de PC (mostra "—" se não houver categoria)
    const pcEl = $('v-pc');
    if(pcEl) pcEl.textContent = hasCategoria ? fmt(state.pc, 1) : '—';
    const taxaFixaCardEl = $('v-taxa-fixa');
    if(taxaFixaCardEl) taxaFixaCardEl.textContent = hasCategoria ? fmt(tarifarioAtual().taxaFixa, 2) : '—';
    return;
  }

  const t = totals();
  // Tarefa 3: cartão de leitura da Potência Contratada
  const pcEl = $('v-pc');
  if(pcEl) pcEl.textContent = fmt(state.pc, 1);
  const taxaFixaCardEl = $('v-taxa-fixa');
  if(taxaFixaCardEl) taxaFixaCardEl.textContent = fmt(tarifarioAtual().taxaFixa, 2);

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
   ============================================================ */
function renderTipoCliente(){
  const wrap = $('tipo-cliente-grid');
  if(!wrap) return;
  // (re)desenha os cartões só se a grid estiver vazia — evita flicker e perda de focus
  if(wrap.children.length) {
    // apenas actualiza o estado "selected" dos cartões existentes
    wrap.querySelectorAll('.cat-card').forEach(c=>{
      c.classList.toggle('selected', c.getAttribute('data-cat') === state.categoria);
    });
    return;
  }
  let html = '';
  ORDEM_CATEGORIAS.forEach((key, i)=>{
    const t = TARIFARIOS[key];
    const isSelected = state.categoria === key;
    const pcHint = t.pcOptions
      ? ('Pc: ' + t.pcOptions.map(v=> fmt(v,1)+' kVA').join(' · '))
      : (t.pcMin && t.pcMax ? ('Pc: ' + fmt(t.pcMin,1) + ' a ' + fmt(t.pcMax,1) + ' kVA') : 'Pc: livre');
    const tooltip = `${t.label} — Taxa fixa: ${fmt(t.taxaFixa,2)} Kz/kVA · Tarifa: ${fmt(t.tarifaKwh,2)} Kz/kWh. ${t.descricao}`;
    html += `<button type="button" class="cat-card ${isSelected?'selected':''}" data-cat="${key}" data-tooltip="${escapeHtml(tooltip)}">
      <div class="cat-card-no">${i+1}</div>
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
  if(!state.categoria){
    // ainda sem categoria: mostra estado vazio no header
    if(tariffHeader) tariffHeader.textContent = 'Tipo de cliente por seleccionar';
    if(taxaFixaAplicadaEl) taxaFixaAplicadaEl.textContent = '—';
    if(avisoGrandes) avisoGrandes.style.display = 'none';
    if(pcInput) pcInput.disabled = true;
    if(tarifaInput) tarifaInput.disabled = true;
    return;
  }
  const t = tarifarioAtual();
  if(taxaFixaAplicadaEl) taxaFixaAplicadaEl.textContent = fmt(t.taxaFixa, 2);
  if(tariffHeader) tariffHeader.textContent = t.short + ' · ' + fmt(tarifaAtual()) + ' Kz/kWh';
  if(avisoGrandes) avisoGrandes.style.display = t.semDados ? 'block' : 'none';
  if(pcInput) pcInput.disabled = !!t.semDados;
  if(tarifaInput) tarifaInput.disabled = !!t.semDados;
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
tocarLoopBoasVindas(); // arranca o loop logo na primeira visita (fica à espera do 1º toque se o navegador bloquear o autoplay)

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