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
  personalizado:{ label:'Personalizado',       icon:'fa-plug'       }
};

const TARIFARIOS = {
  'bt-social1': { label:'BT Doméstico Social 1',     short:'BT-Social1',  taxaFixa:0,    tarifaKwh:3.20,
                  descricao:'Tarifa social para consumos muito baixos. Smax ≤ 1,3 kVA · consumo ≤ 120 kWh/mês.',
                  pcOptions:[1.2], pcDefault:1.2 },
  'bt-social2': { label:'BT Doméstico Social 2',     short:'BT-Social2',  taxaFixa:80,   tarifaKwh:8.33,
                  descricao:'Tarifa social para consumos baixos. 1,2 < Smax ≤ 3 kVA · consumo ≤ 200 kWh/mês.',
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

const ORDEM_CATEGORIAS = ['bt-social1','bt-social2','bt-mono','bt-trif','bt-ind','bt-cs','mt-ind','at-ind'];

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