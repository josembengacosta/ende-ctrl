/* ============================================================
   ende-data.js — DADOS DO SIMULADOR ENDE (FILDA 2026)
   ------------------------------------------------------------
   Este arquivo contém APENAS dados estáticos: categorias de
   equipamento, tarifários oficiais e o catálogo de aparelhos.
   Não tem lógica — pode ser editado por alguém não-dev (ex.: o
   técnico da ENDE) para atualizar tarifas ou o catálogo, sem
   mexer em ende.js.
   Precisa carregar ANTES de ende.js no index.html.
   ============================================================ */

const CATEGORIAS = {
  iluminacao:   { label:'Iluminação',          icon:'fa-lightbulb'  },
  refrigeracao: { label:'Refrigeração',        icon:'fa-snowflake'  },
  climatizacao: { label:'Climatização',        icon:'fa-wind'       },
  cozinha:      { label:'Cozinha',             icon:'fa-utensils'   },
  lavandaria:   { label:'Lavandaria',          icon:'fa-shirt'      },
  eletronica:   { label:'Eletrónica & Lazer',  icon:'fa-tv'         },
  escritorio:   { label:'Escritório & Estudo', icon:'fa-laptop'     },
  bombagem:     { label:'Bombagem & Outros',   icon:'fa-water'      },
  seguranca:    { label:'Segurança & Vigilância', icon:'fa-shield' },
  banho:        { label:'Banho & Aquecimento', icon:'fa-bath'       },
  personalizado:{ label:'Personalizado',       icon:'fa-plug'       }
};

/* ------------------------------------------------------------
   Tarifário oficial — Despacho n.º 3133/25 de 5 de Maio de 2025,
   em vigor desde 5 de Junho de 2025. Todas as fórmulas somam
   +14% de IVA no final (aplicado em calcularCustoENDE, em ende.js).
   F = taxaFixa × Pc + tarifaKwh × W   (W = consumo em kWh)
   Social 1/2: taxaFixa = 0 (fórmula é só tarifaKwh × W, sem Pc).
   ------------------------------------------------------------ */
const TARIFARIOS = {
  'bt-social1': { label:'BT Doméstico Social 1',     short:'BT-Social1',  taxaFixa:0,    tarifaKwh:3.20,
                  descricao:'Tarifa social para consumos muito baixos. Smax ≤ 1,3 kVA · consumo mensal ≤ 120 kWh.' },
  'bt-social2': { label:'BT Doméstico Social 2',     short:'BT-Social2',  taxaFixa:0,    tarifaKwh:8.33,
                  descricao:'Tarifa social para consumos baixos. 1,3 < Smax ≤ 3,0 kVA · consumo mensal ≤ 200 kWh.' },
  'bt-mono':    { label:'BT Doméstico Monofásico',   short:'BT-Mono',     taxaFixa:117.00,  tarifaKwh:14.16,
                  descricao:'Cliente doméstico monofásico. Potência Contratada livre: 3 < Pc ≤ 9,9 kVA.',
                  pcMin:3, pcMax:9.9, pcDefault:6.6 },
  'bt-trif':    { label:'BT Doméstico Especial Trifásico', short:'BT-Trif',  taxaFixa:130.00, tarifaKwh:19.16,
                  descricao:'Cliente doméstico trifásico especial. Potência Contratada livre: Pc > 9,9 kVA.',
                  pcMin:9.9, pcMax:49.9, pcDefault:13.2 },
  'bt-ind':     { label:'BT Indústria',               short:'BT-Ind',      taxaFixa:130.00,  tarifaKwh:16.67,
                  descricao:'Cliente industrial em baixa tensão. Categoria escolhida manualmente (sem cascata automática).',
                  pcMin:3, pcMax:49.9, pcDefault:6.6 },
  'bt-cs':      { label:'BT Comércio e Serviços',     short:'BT-Com/Serv', taxaFixa:130.00,  tarifaKwh:19.16,
                  descricao:'Cliente de comércio e serviços em baixa tensão. Categoria escolhida manualmente.',
                  pcMin:3, pcMax:49.9, pcDefault:6.6 },
  // TODO: confirmar com técnico ENDE o que é "Ponta Tomada" (P) no PDF oficial —
  // assumido = Pc (Potência Contratada), o mesmo campo usado nas restantes categorias.
  'mt-ind':     { label:'MT Indústria',               short:'MT-Ind',      taxaFixa:208.00, tarifaKwh:12.49,
                  descricao:'Cliente industrial em média tensão. Categoria escolhida manualmente. (Pc = "Ponta Tomada" do PDF, a confirmar com a ENDE.)',
                  pcMin:50, pcMax:9999, pcDefault:100 },
  // TODO: confirmar com técnico ENDE o que é "Ponta Tomada" (P) no PDF oficial —
  // assumido = Pc (Potência Contratada), o mesmo campo usado nas restantes categorias.
  'at-ind':     { label:'AT Indústria',               short:'AT-Ind',      taxaFixa:149.50, tarifaKwh:10.23,
                  descricao:'Cliente industrial em alta tensão. Categoria escolhida manualmente. (Pc = "Ponta Tomada" do PDF, a confirmar com a ENDE.)',
                  pcMin:50, pcMax:99999, pcDefault:1000 },
  // Não confirmadas para implementação nesta ronda — deixadas como referência, fora da cascata e do banner.
  'at-com':     { label:'AT Comercializadores',       short:'AT-Com',      taxaFixa:0,      tarifaKwh:10.23,
                  descricao:'Comercializadores em alta tensão. Não incluída na cascata automática nem no banner.',
                  pcMin:50, pcMax:99999, pcDefault:1000 }
};

const ORDEM_CATEGORIAS = ['bt-social1','bt-social2','bt-mono','bt-trif','bt-ind','bt-cs','mt-ind','at-ind'];

const CATALOGO = [
  // ILUMINAÇÃO (Horas sugeridas: 6h)
  { nome: 'Lâmpada LED 9W', potencia: 9, categoria: 'iluminacao', horasSugeridas: 6 },
  { nome: 'Lâmpada LED 10W', potencia: 10, categoria: 'iluminacao', horasSugeridas: 6 },
  { nome: 'Lâmpada LED 12W', potencia: 12, categoria: 'iluminacao', horasSugeridas: 6 },
  { nome: 'Lâmpada Incandescente 60W', potencia: 60, categoria: 'iluminacao', horasSugeridas: 6 },
  { nome: 'Lâmpada Incandescente 100W', potencia: 100, categoria: 'iluminacao', horasSugeridas: 6 },
  { nome: 'Lâmpada Fluorescente Compacta', potencia: 15, categoria: 'iluminacao', horasSugeridas: 6 },
  { nome: 'Candeeiro de Mesa', potencia: 40, categoria: 'iluminacao', horasSugeridas: 3 },

  // REFRIGERAÇÃO (Funcionamento contínuo: 24h)
  { nome: 'Frigorífico 150L', potencia: 120, categoria: 'refrigeracao', horasSugeridas: 24 },
  { nome: 'Frigorífico 200L', potencia: 200, categoria: 'refrigeracao', horasSugeridas: 24 },
  { nome: 'Frigorífico Duplex / Side-by-Side', potencia: 350, categoria: 'refrigeracao', horasSugeridas: 24 },
  { nome: 'Arca Congeladora 300L', potencia: 250, categoria: 'refrigeracao', horasSugeridas: 24 },
  { nome: 'Geleira Pequena / Mini-bar', potencia: 90, categoria: 'refrigeracao', horasSugeridas: 24 },
  { nome: 'Arca Vertical / Expositor de Bebidas', potencia: 300, categoria: 'refrigeracao', horasSugeridas: 24 }, // ADICIONADO (Comum no comércio local)
{ nome:'Geleira Vertical Expositora (Cantinas)', potencia:380, categoria:'refrigeracao', horasSugeridas:24 },
{ nome:'Arca Congeladora Horizontal Grande', potencia:350, categoria:'refrigeracao', horasSugeridas:24 },

  // CLIMATIZAÇÃO
  { nome: 'Ventoinha de Mesa', potencia: 55, categoria: 'climatizacao', horasSugeridas: 6 },
  { nome: 'Ventilador de Tecto', potencia: 75, categoria: 'climatizacao', horasSugeridas: 6 },
  { nome: 'Ar Condicionado 9000 BTU (Convencional)', potencia: 865, categoria: 'climatizacao', horasSugeridas: 6 },
  { nome: 'Ar Condicionado 9000 BTU (Inverter)', potencia: 621, categoria: 'climatizacao', horasSugeridas: 6 },
  { nome: 'Ar Condicionado 12000 BTU (Convencional)', potencia: 1153, categoria: 'climatizacao', horasSugeridas: 6 },
  { nome: 'Ar Condicionado 12000 BTU (Inverter)', potencia: 808, categoria: 'climatizacao', horasSugeridas: 6 },
  { nome: 'Ar Condicionado 18000 BTU (Convencional)', potencia: 1702, categoria: 'climatizacao', horasSugeridas: 5 },
  { nome: 'Ar Condicionado 18000 BTU (Inverter)', potencia: 1241, categoria: 'climatizacao', horasSugeridas: 5 },
  { nome: 'Ar Condicionado 24000 BTU (Convencional)', potencia: 2233, categoria: 'climatizacao', horasSugeridas: 5 },
  { nome: 'Ar Condicionado 24000 BTU (Inverter)', potencia: 1716, categoria: 'climatizacao', horasSugeridas: 5 },
  { nome: 'Aquecedor Eléctrico', potencia: 1500, categoria: 'climatizacao', horasSugeridas: 2 },

  // BANHO (Nova categoria essencial para o uso de Termoacumuladores em Angola)
  { nome: 'Termoacumulador 50L / 80L', potencia: 1500, categoria: 'banho', horasSugeridas: 3 }, // ADICIONADO
  { nome: 'Termoacumulador 100L', potencia: 2000, categoria: 'banho', horasSugeridas: 4 }, // ADICIONADO

  // COZINHA
  { nome: 'Micro-ondas', potencia: 1000, categoria: 'cozinha', horasSugeridas: 0.5 },
  { nome: 'Fogão / Placa de Indução', potencia: 2000, categoria: 'cozinha', horasSugeridas: 1 },
  { nome: 'Liquidificador', potencia: 400, categoria: 'cozinha', horasSugeridas: 0.3 },
  { nome: 'Chaleira Eléctrica', potencia: 1500, categoria: 'cozinha', horasSugeridas: 0.5 },
  { nome: 'Torradeira', potencia: 800, categoria: 'cozinha', horasSugeridas: 0.2 },
  { nome: 'Air Fryer', potencia: 1400, categoria: 'cozinha', horasSugeridas: 0.5 },
  { nome:'Máquina de Lavar Loiça', potencia:1200, categoria:'cozinha', horasSugeridas:1 },
{ nome:'Fritadeira Elétrica Industrial (Pequena)', potencia:2500, categoria:'cozinha', horasSugeridas:2 },

  // LAVANDARIA
  { nome: 'Máquina de Lavar Roupa', potencia: 500, categoria: 'lavandaria', horasSugeridas: 1 },
  { nome: 'Ferro de Engomar', potencia: 1200, categoria: 'lavandaria', horasSugeridas: 0.7 },

  // ELETRÓNICA
  { nome: 'Televisor LED 32"', potencia: 60, categoria: 'eletronica', horasSugeridas: 4 },
  { nome: 'Televisor Plasma 42"', potencia: 250, categoria: 'eletronica', horasSugeridas: 4 },
  { nome: 'Televisor LED 43"', potencia: 90, categoria: 'eletronica', horasSugeridas: 4 },
  { nome: 'Televisor LED 55"', potencia: 120, categoria: 'eletronica', horasSugeridas: 4 },
  { nome: 'Descodificador / TV Box (ZAP/DSTV)', potencia: 15, categoria: 'eletronica', horasSugeridas: 5 },
  { nome: 'Aparelhagem / Coluna de Som', potencia: 80, categoria: 'eletronica', horasSugeridas: 2 },
  { nome: 'Router Wi-Fi', potencia: 10, categoria: 'eletronica', horasSugeridas: 24 },
  { nome: 'Consola de Jogos', potencia: 150, categoria: 'eletronica', horasSugeridas: 2 },
  { nome: 'Estabilizador de Tensão (Sugo/Regulador)', potencia: 30, categoria: 'eletronica', horasSugeridas: 24 }, // ADICIONADO (Consumo próprio do aparelho)
  { nome:'Sistema de Som com Subwoofer (Grandes)', potencia:300, categoria:'eletronica', horasSugeridas:3 },
  { nome:'Projetor de Vídeo / Datashow', potencia:280, categoria:'eletronica', horasSugeridas:3 },

  // ESCRITÓRIO
  { nome: 'Computador de Secretária', potencia: 250, categoria: 'escritorio', horasSugeridas: 6 },
  { nome: 'Computador Portátil', potencia: 65, categoria: 'escritorio', horasSugeridas: 6 },
  { nome: 'Impressora', potencia: 30, categoria: 'escritorio', horasSugeridas: 0.3 },
  { nome: 'Carregador de Telemóvel', potencia: 5, categoria: 'escritorio', horasSugeridas: 3 },

  // BOMBAGEM DE ÁGUA (Essencial para tanques e girafas)
  { nome: 'Bomba de Água 0.5 HP', potencia: 370, categoria: 'bombagem', horasSugeridas: 2 },
  { nome: 'Bomba de Água 1 HP', potencia: 750, categoria: 'bombagem', horasSugeridas: 2 },
  { nome: 'Bomba de Água 1.5 HP', potencia: 1100, categoria: 'bombagem', horasSugeridas: 2 }, // ADICIONADO
  { nome: 'Bomba de Água 2 HP', potencia: 1500, categoria: 'bombagem', horasSugeridas: 1.5 }, // ADICIONADO
  { nome:'Eletrobomba Submersível (Furo de Água)', potencia:1100, categoria:'bombagem', horasSugeridas:2 },

  // SEGURANÇA (Nova categoria correta para vigilância)
  { nome: 'Câmara de Vigilância (CCTV)', potencia: 10, categoria: 'seguranca', horasSugeridas: 24 },
  { nome:'Cerca Elétrica (Central de Choque)', potencia:20, categoria:'seguranca', horasSugeridas:24 },
  { nome:'Motor de Portão Automático', potencia:350, categoria:'seguranca', horasSugeridas:0.1 },

  { nome:'Secador de Cabelo (Salão / Casa)', potencia:1800, categoria:'personalizado', horasSugeridas:0.5 }
];
