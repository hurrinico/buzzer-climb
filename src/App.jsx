import { useState, useEffect } from "react";


// ============================================================
// DATABASE v2 — CLAN SYSTEM
// ============================================================
const RACES = {
  HUMAN: { name: "Umani", emoji: "👤", color: "#7B9EC4" },
  ORC: { name: "Orchi", emoji: "💀", color: "#C45B5B" },
  INSECTOID: { name: "Insettidi", emoji: "🐛", color: "#5BC47B" },
  FELINE: { name: "Felidi", emoji: "🐱", color: "#C4A85B" },
  GOLEM: { name: "Cristallini", emoji: "💎", color: "#7BB8C4" },
  PHANTOM: { name: "Ombre", emoji: "👻", color: "#A07BC4" },
};
const RARITIES = {
  COMMON: { name: "Comune", die: 4, color: "#5a5a68", label: "d4", buy: 3, sell: 1 },
  UNCOMMON: { name: "Non Comune", die: 6, color: "#7B9EC4", label: "d6", buy: 5, sell: 2 },
  RARE: { name: "Rara", die: 8, color: "#9B7BC4", label: "d8", buy: 8, sell: 4 },
  EPIC: { name: "Epica", die: 10, color: "#C4A85B", label: "d10", buy: 12, sell: 6 },
  LEGENDARY: { name: "Leggendaria", die: 12, color: "#C45B5B", label: "d12", buy: 18, sell: 9 },
};

// Floor rarity weights
const FLOOR_RARITY = {
  1: { COMMON:100, UNCOMMON:0,  RARE:0,  LEGENDARY:0 },
  2: { COMMON:70,  UNCOMMON:25, RARE:5,  LEGENDARY:0 },
  3: { COMMON:50,  UNCOMMON:35, RARE:15, LEGENDARY:0 },
  4: { COMMON:30,  UNCOMMON:40, RARE:30, LEGENDARY:0 },
  5: { COMMON:15,  UNCOMMON:30, RARE:40, LEGENDARY:15 },
  6: { COMMON:5,   UNCOMMON:20, RARE:40, LEGENDARY:35 },
};

// Shop drops: ~1 piano avanti rispetto ai boss
const SHOP_RARITY = {
  1: { COMMON:65,  UNCOMMON:28, RARE:7,  LEGENDARY:0 },
  2: { COMMON:45,  UNCOMMON:35, RARE:18, LEGENDARY:2 },
  3: { COMMON:28,  UNCOMMON:38, RARE:28, LEGENDARY:6 },
  4: { COMMON:15,  UNCOMMON:33, RARE:38, LEGENDARY:14 },
  5: { COMMON:8,   UNCOMMON:22, RARE:42, LEGENDARY:28 },
  6: { COMMON:3,   UNCOMMON:15, RARE:40, LEGENDARY:42 },
};

const pickRarity = (floor) => {
  const w = FLOOR_RARITY[floor] || FLOOR_RARITY[1];
  const tot = Object.values(w).reduce((a, b) => a + b, 0);
  let r = Math.random() * tot;
  for (const [k, v] of Object.entries(w)) { r -= v; if (r <= 0) return k; }
  return "COMMON";
};

const pickShopRarity = (floor) => {
  const w = SHOP_RARITY[floor] || SHOP_RARITY[1];
  const tot = Object.values(w).reduce((a, b) => a + b, 0);
  let r = Math.random() * tot;
  for (const [k, v] of Object.entries(w)) { r -= v; if (r <= 0) return k; }
  return "COMMON";
};

// ============================================================
// HUMAN PLAYERS (player's starting pool — always available)
// ============================================================
const HUMAN_PLAYERS = [
  { id:"h1", name:"Marcus", race:"HUMAN", trait1:"Leader", trait2:"Uomo Di Squadra", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:7 },
  { id:"h2", name:"Davis", race:"HUMAN", trait1:"Tiratore Scelto", trait2:"Uomo Di Squadra", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:6 },
  { id:"h3", name:"Santos", race:"HUMAN", trait1:"Velocista", trait2:"Leader", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:5 },
  { id:"h4", name:"Park", race:"HUMAN", trait1:"Difensore", trait2:"Astuto", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:6 },
  { id:"h5", name:"Okafor", race:"HUMAN", trait1:"Acrobata", trait2:"Implacabile", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:5 },
  { id:"h6", name:"Elena", race:"HUMAN", trait1:"Tiratore Scelto", trait2:"Astuto", atkDie:"UNCOMMON", defDie:"COMMON", rarity:"UNCOMMON", loyalty:6 },
  { id:"h7", name:"Jin", race:"HUMAN", trait1:"Velocista", trait2:"Acrobata", atkDie:"COMMON", defDie:"UNCOMMON", rarity:"UNCOMMON", loyalty:5 },
  { id:"h8", name:"Captain Rex", race:"HUMAN", trait1:"Leader", trait2:"Difensore", atkDie:"RARE", defDie:"RARE", rarity:"RARE", loyalty:9 },
  { id:"h9", name:"Nova", race:"HUMAN", trait1:"Astuto", trait2:"Telepate", atkDie:"RARE", defDie:"UNCOMMON", rarity:"RARE", loyalty:6 },
  { id:"h10", name:"Commissioner", race:"HUMAN", trait1:"Leader", trait2:"Astuto", atkDie:"LEGENDARY", defDie:"RARE", rarity:"LEGENDARY", loyalty:10 },
];

const HUMAN_ATK = [
  { id:"ha1", name:"Pick & Roll", race:"HUMAN", passCount:1, bonusBase:2, bonusRace:1, rarity:"COMMON", desc:"1 pass. Base +2, +1/Umano campo" },
  { id:"ha2", name:"Flex Offense", race:"HUMAN", passCount:1, bonusBase:2, bonusRace:1, rarity:"COMMON", desc:"1 pass. Base +2, +1/Umano campo" },
  { id:"ha3", name:"Give and Go", race:"HUMAN", passCount:1, bonusBase:3, bonusRace:1, rarity:"UNCOMMON", desc:"1 pass. Base +3, +1/Umano campo" },
  { id:"ha4", name:"Motion Offense", race:"HUMAN", passCount:2, bonusBase:1, bonusRace:1, rarity:"UNCOMMON", desc:"2 pass. Base +1, +1/Umano campo" },
  { id:"ha5", name:"Princeton", race:"HUMAN", passCount:2, bonusBase:2, bonusRace:2, rarity:"RARE", desc:"2 pass. Base +2, +2/Umano campo" },
];
const HUMAN_DEF = [
  { id:"hd1", name:"Uomo a Uomo", race:"HUMAN", bonusBase:1, bonusRace:1, rarity:"COMMON", desc:"Base +1, +1/Umano campo" },
  { id:"hd2", name:"Cambio", race:"HUMAN", bonusBase:0, bonusRace:1, rarity:"COMMON", desc:"Base +0, +1/Umano campo" },
  { id:"hd3", name:"Box and One", race:"HUMAN", bonusBase:1, bonusRace:1, mechanic:"box_one", rarity:"UNCOMMON", desc:"Focus tiratore. Base +1, +1/Umano" },
  { id:"hd4", name:"Help Defense", race:"HUMAN", bonusBase:1, bonusRace:1, mechanic:"help", rarity:"UNCOMMON", desc:"Se ATK segna: 2° tentativo con d4. Base +1, +1/Umano" },
  { id:"hd5", name:"Difesa Adattiva", race:"HUMAN", bonusBase:2, bonusRace:1, rarity:"RARE", desc:"Base +2, +1/Umano campo" },
];

// ============================================================
// CLAN DATA — 5 alien clans, each with full card sets + 2 bosses
// ============================================================
const CLAN_DATA = {
  ORC: {
    bosses: [
      { name:"Warboss Krug", quote:"Non passerai.", desc:"Stratega brutale. Difesa fisica.", signatureStrat:"oa_sig1" },
      { name:"Skullcrusher", quote:"Le ossa si spezzano.", desc:"Forza pura. Attacco devastante.", signatureStrat:"oa_sig2" },
    ],
    players: [
      { id:"o1", name:"Gronk", trait1:"Berserk", trait2:"Uomo Di Squadra", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:5 },
      { id:"o2", name:"Smok", trait1:"Difensore", trait2:"Corazzato", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:6 },
      { id:"o3", name:"Throk", trait1:"Berserk", trait2:"Implacabile", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:4 },
      { id:"o4", name:"Urga", trait1:"Uomo Di Squadra", trait2:"Difensore", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:6 },
      { id:"o5", name:"Basha", trait1:"Implacabile", trait2:"Berserk", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:4 },
      { id:"o6", name:"Brakka", trait1:"Berserk", trait2:"Implacabile", atkDie:"UNCOMMON", defDie:"COMMON", rarity:"UNCOMMON", loyalty:4 },
      { id:"o7", name:"Thud", trait1:"Difensore", trait2:"Corazzato", atkDie:"COMMON", defDie:"UNCOMMON", rarity:"UNCOMMON", loyalty:6 },
      { id:"o8", name:"Krull", trait1:"Berserk", trait2:"Leader", atkDie:"UNCOMMON", defDie:"COMMON", rarity:"UNCOMMON", loyalty:5 },
      { id:"o9", name:"Grogna", trait1:"Implacabile", trait2:"Corazzato", atkDie:"UNCOMMON", defDie:"UNCOMMON", rarity:"UNCOMMON", loyalty:5 },
      { id:"o10", name:"Murka", trait1:"Leader", trait2:"Uomo Di Squadra", atkDie:"COMMON", defDie:"UNCOMMON", rarity:"UNCOMMON", loyalty:7 },
      { id:"o11", name:"Fangorn", trait1:"Berserk", trait2:"Difensore", atkDie:"RARE", defDie:"UNCOMMON", rarity:"RARE", loyalty:6 },
      { id:"o12", name:"Iron Tusk", trait1:"Corazzato", trait2:"Implacabile", atkDie:"UNCOMMON", defDie:"RARE", rarity:"RARE", loyalty:7 },
      { id:"o13", name:"Magra", trait1:"Berserk", trait2:"Berserk", atkDie:"RARE", defDie:"COMMON", rarity:"RARE", loyalty:3 },
      { id:"o14", name:"Warlord Drek", trait1:"Leader", trait2:"Corazzato", atkDie:"RARE", defDie:"RARE", rarity:"RARE", loyalty:8 },
      { id:"o15", name:"Bloodfist", trait1:"Implacabile", trait2:"Berserk", atkDie:"RARE", defDie:"UNCOMMON", rarity:"RARE", loyalty:4 },
      { id:"o16", name:"Gorn il Devastatore", trait1:"Berserk", trait2:"Corazzato", atkDie:"LEGENDARY", defDie:"RARE", rarity:"LEGENDARY", loyalty:5 },
    ],
    atkStrategies: [
      { id:"oa1", name:"Post-Up", passCount:0, bonusBase:2, bonusRace:1, rarity:"COMMON", desc:"0 pass. Base +2, +1/Orco campo" },
      { id:"oa2", name:"Sfondamento", passCount:0, bonusBase:2, bonusRace:1, rarity:"COMMON", desc:"0 pass. Base +2, +1/Orco campo" },
      { id:"oa3", name:"Schiacciata Brutale", passCount:0, bonusBase:3, bonusRace:1, rarity:"COMMON", desc:"0 pass. Base +3, +1/Orco campo" },
      { id:"oa_sig1", name:"Carica Orchesca", passCount:0, bonusBase:2, bonusRace:2, extraDice:1, rarity:"UNCOMMON", desc:"FIRMA. 0 pass. +1 dado ATK. Base +2, +2/Orco" },
      { id:"oa_sig2", name:"Pugno di Ferro", passCount:0, bonusBase:4, bonusRace:1, rarity:"UNCOMMON", desc:"FIRMA. 0 pass. Base +4, +1/Orco campo" },
      { id:"oa4", name:"Lob City", passCount:1, bonusBase:2, bonusRace:2, rarity:"UNCOMMON", desc:"1 pass. Base +2, +2/Orco campo" },
      { id:"oa5", name:"Martello", passCount:0, bonusBase:3, bonusRace:2, rarity:"UNCOMMON", desc:"0 pass. Base +3, +2/Orco campo" },
      { id:"oa6", name:"Orda Verde", passCount:0, bonusBase:2, bonusRace:2, rarity:"UNCOMMON", desc:"0 pass. Base +2, +2/Orco campo" },
      { id:"oa7", name:"Bulldozer", passCount:0, bonusBase:4, bonusRace:2, rarity:"RARE", desc:"0 pass. Base +4, +2/Orco campo" },
      { id:"oa8", name:"Furia Cieca", passCount:0, bonusBase:3, bonusRace:2, extraDice:1, rarity:"RARE", desc:"0 pass. +1 dado ATK. Base +3, +2/Orco" },
      { id:"oa9", name:"Intimidazione", passCount:0, bonusBase:0, bonusRace:1, mechanic:"corruption", rarity:"RARE", desc:"CORRUZIONE. 2d6+sinergia vs Lealtà×2" },
      { id:"oa10", name:"Apocalisse Verde", passCount:0, bonusBase:5, bonusRace:3, extraDice:1, rarity:"LEGENDARY", desc:"0 pass. +1 dado ATK. Base +5, +3/Orco" },
    ],
    defStrategies: [
      { id:"od1", name:"Intimidazione Def", bonusBase:1, bonusRace:1, rarity:"COMMON", desc:"Base +1, +1/Orco campo" },
      { id:"od2", name:"Muro di Carne", bonusBase:1, bonusRace:1, rarity:"COMMON", desc:"Base +1, +1/Orco campo" },
      { id:"od3", name:"Muro Interno", bonusBase:1, bonusRace:1, mechanic:"wall", rarity:"UNCOMMON", desc:"+2 DEF se ATK usa pass, -1 se 0 pass. Base +1, +1/Orco" },
      { id:"od4", name:"Raddoppio", bonusBase:0, bonusRace:1, mechanic:"double_team", rarity:"UNCOMMON", desc:"+1 dado DEF sul tiro. Base +0, +1/Orco" },
      { id:"od5", name:"Pressione Fisica", bonusBase:1, bonusRace:2, rarity:"UNCOMMON", desc:"Base +1, +2/Orco campo" },
      { id:"od6", name:"Difesa Fisica", bonusBase:1, bonusRace:1, mechanic:"physical", rarity:"RARE", desc:"Se DEF vince con margine ≥8: infortunio. Base +1, +1/Orco" },
      { id:"od7", name:"Fortezza", bonusBase:2, bonusRace:2, rarity:"RARE", desc:"Base +2, +2/Orco campo" },
      { id:"od8", name:"Bastione Orchesco", bonusBase:3, bonusRace:2, mechanic:"wall", rarity:"LEGENDARY", desc:"+3 DEF se pass, +1 se 0 pass. Base +3, +2/Orco" },
    ],
    gear: [
      { id:"og1", name:"Tirapugni Orchesco", rarity:"COMMON", desc:"+1 ATK", effect:"atkFlat", value:1 },
      { id:"og2", name:"Schinieri Osso", rarity:"COMMON", desc:"+1 DEF", effect:"defFlat", value:1 },
      { id:"og3", name:"Fascia da Guerra", rarity:"UNCOMMON", desc:"+2 ATK", effect:"atkFlat", value:2 },
      { id:"og4", name:"Corazza Tribale", rarity:"UNCOMMON", desc:"+2 DEF", effect:"defFlat", value:2 },
      { id:"og5", name:"Martello d'Osso", rarity:"RARE", desc:"+1 dado ATK", effect:"atkDice", value:1 },
      { id:"og6", name:"Scudo Teschio", rarity:"RARE", desc:"+3 DEF", effect:"defFlat", value:3 },
      { id:"og7", name:"Zanne del Warboss", rarity:"LEGENDARY", desc:"Infortunio DEF≥6", effect:"injuryOnDef", value:6 },
    ],
  },

  INSECTOID: {
    bosses: [
      { name:"Queen Vex", quote:"Noi siamo molti. Tu sei solo.", desc:"Mente alveare. Passaggi perfetti.", signatureStrat:"ia_sig1" },
      { name:"Swarm Prime", quote:"Il singolo è nulla. L'insieme è tutto.", desc:"Sciame inarrestabile.", signatureStrat:"ia_sig2" },
    ],
    players: [
      { id:"i1", name:"Zix", trait1:"Velocista", trait2:"Astuto", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:6 },
      { id:"i2", name:"Tkk", trait1:"Uomo Di Squadra", trait2:"Velocista", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:7 },
      { id:"i3", name:"Vrinn", trait1:"Telepate", trait2:"Uomo Di Squadra", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:8 },
      { id:"i4", name:"Skrill", trait1:"Velocista", trait2:"Furtivo", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:5 },
      { id:"i5", name:"Bzzt", trait1:"Uomo Di Squadra", trait2:"Astuto", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:7 },
      { id:"i6", name:"Chitter", trait1:"Uomo Di Squadra", trait2:"Telepate", atkDie:"COMMON", defDie:"UNCOMMON", rarity:"UNCOMMON", loyalty:8 },
      { id:"i7", name:"Mara", trait1:"Tiratore Scelto", trait2:"Solitario", atkDie:"UNCOMMON", defDie:"COMMON", rarity:"UNCOMMON", loyalty:3 },
      { id:"i8", name:"Drona", trait1:"Telepate", trait2:"Velocista", atkDie:"UNCOMMON", defDie:"UNCOMMON", rarity:"UNCOMMON", loyalty:7 },
      { id:"i9", name:"Klixxa", trait1:"Uomo Di Squadra", trait2:"Astuto", atkDie:"COMMON", defDie:"UNCOMMON", rarity:"UNCOMMON", loyalty:8 },
      { id:"i10", name:"Shrk", trait1:"Velocista", trait2:"Telepate", atkDie:"UNCOMMON", defDie:"COMMON", rarity:"UNCOMMON", loyalty:6 },
      { id:"i11", name:"Mantis Alpha", trait1:"Leader", trait2:"Telepate", atkDie:"RARE", defDie:"UNCOMMON", rarity:"RARE", loyalty:7 },
      { id:"i12", name:"Weaver", trait1:"Uomo Di Squadra", trait2:"Astuto", atkDie:"UNCOMMON", defDie:"RARE", rarity:"RARE", loyalty:9 },
      { id:"i13", name:"Hive Node", trait1:"Telepate", trait2:"Uomo Di Squadra", atkDie:"RARE", defDie:"RARE", rarity:"RARE", loyalty:9 },
      { id:"i14", name:"Brood Mother", trait1:"Leader", trait2:"Uomo Di Squadra", atkDie:"RARE", defDie:"UNCOMMON", rarity:"RARE", loyalty:8 },
      { id:"i15", name:"Nexus", trait1:"Telepate", trait2:"Velocista", atkDie:"RARE", defDie:"RARE", rarity:"RARE", loyalty:7 },
      { id:"i16", name:"L'Alveare", trait1:"Telepate", trait2:"Uomo Di Squadra", atkDie:"LEGENDARY", defDie:"LEGENDARY", rarity:"LEGENDARY", loyalty:10 },
    ],
    atkStrategies: [
      { id:"ia1", name:"Scarico e Tiro", passCount:1, bonusBase:2, bonusRace:1, rarity:"COMMON", desc:"1 pass. Base +2, +1/Insettide campo" },
      { id:"ia2", name:"Catena Rapida", passCount:1, bonusBase:1, bonusRace:1, rarity:"COMMON", desc:"1 pass. Base +1, +1/Insettide campo" },
      { id:"ia3", name:"Passaggio Feromone", passCount:2, bonusBase:1, bonusRace:1, rarity:"COMMON", desc:"2 pass. Base +1, +1/Insettide campo" },
      { id:"ia_sig1", name:"Rete Passaggi", passCount:2, bonusBase:1, bonusRace:2, passBonus:2, rarity:"UNCOMMON", desc:"FIRMA. 2 pass. +2 ATK per pass ok. Base +1, +2/Insettide" },
      { id:"ia_sig2", name:"Sciame Totale", passCount:2, bonusBase:2, bonusRace:3, rarity:"UNCOMMON", desc:"FIRMA. 2 pass. Base +2, +3/Insettide campo" },
      { id:"ia4", name:"Dai e Vai", passCount:2, bonusBase:1, bonusRace:2, passBonus:1, rarity:"UNCOMMON", desc:"2 pass. +1 ATK per pass ok. Base +1, +2/Insettide" },
      { id:"ia5", name:"Flusso Alveare", passCount:2, bonusBase:2, bonusRace:2, rarity:"UNCOMMON", desc:"2 pass. Base +2, +2/Insettide campo" },
      { id:"ia6", name:"Sincronizzazione", passCount:1, bonusBase:2, bonusRace:2, rarity:"UNCOMMON", desc:"1 pass. Base +2, +2/Insettide campo" },
      { id:"ia7", name:"Sciame Perfetto", passCount:2, bonusBase:3, bonusRace:3, passBonus:1, rarity:"RARE", desc:"2 pass. +1/pass. Base +3, +3/Insettide" },
      { id:"ia8", name:"Sussurro", passCount:0, bonusBase:0, bonusRace:2, mechanic:"corruption", rarity:"RARE", desc:"CORRUZIONE. 2d6+sinergia vs Lealtà×2" },
      { id:"ia9", name:"Mente Collettiva", passCount:2, bonusBase:2, bonusRace:2, passBonus:2, rarity:"RARE", desc:"2 pass. +2/pass. Base +2, +2/Insettide" },
      { id:"ia10", name:"Singolarità Alveare", passCount:2, bonusBase:4, bonusRace:3, passBonus:2, rarity:"LEGENDARY", desc:"2 pass. +2/pass. Base +4, +3/Insettide" },
    ],
    defStrategies: [
      { id:"id1", name:"Sciame Def", bonusBase:1, bonusRace:1, rarity:"COMMON", desc:"Base +1, +1/Insettide campo" },
      { id:"id2", name:"Rete Psichica", bonusBase:1, bonusRace:1, rarity:"COMMON", desc:"Base +1, +1/Insettide campo" },
      { id:"id3", name:"Trappola", bonusBase:0, bonusRace:1, mechanic:"trap", rarity:"UNCOMMON", desc:"+3 DEF se 2+ pass, -1 se 0. Base +0, +1/Insettide" },
      { id:"id4", name:"Negazione Pass", bonusBase:0, bonusRace:1, mechanic:"deny", rarity:"UNCOMMON", desc:"+2 a tiri intercetto. Base +0, +1/Insettide" },
      { id:"id5", name:"Muro Psichico", bonusBase:1, bonusRace:2, rarity:"UNCOMMON", desc:"Base +1, +2/Insettide campo" },
      { id:"id6", name:"Scramble", bonusBase:1, bonusRace:1, mechanic:"deny", rarity:"RARE", desc:"+2 intercetto + 2° tentativo. Base +1, +1/Insettide" },
      { id:"id7", name:"Predizione Alveare", bonusBase:2, bonusRace:2, mechanic:"trap", rarity:"RARE", desc:"+3 se 2+ pass. Base +2, +2/Insettide" },
      { id:"id8", name:"Coscienza Collettiva", bonusBase:3, bonusRace:3, mechanic:"deny", rarity:"LEGENDARY", desc:"+3 intercetto. Base +3, +3/Insettide" },
    ],
    gear: [
      { id:"ig1", name:"Esoscheletro Chitinico", rarity:"COMMON", desc:"+1 DEF", effect:"defFlat", value:1 },
      { id:"ig2", name:"Antenne Potenziate", rarity:"COMMON", desc:"+1 ATK", effect:"atkFlat", value:1 },
      { id:"ig3", name:"Feromone Rallentante", rarity:"UNCOMMON", desc:"+2 DEF", effect:"defFlat", value:2 },
      { id:"ig4", name:"Ali Rinforzate", rarity:"UNCOMMON", desc:"+2 ATK", effect:"atkFlat", value:2 },
      { id:"ig5", name:"Mandibole Affilate", rarity:"RARE", desc:"+3 ATK", effect:"atkFlat", value:3 },
      { id:"ig6", name:"Bozzolo Protettivo", rarity:"RARE", desc:"+1 dado DEF", effect:"defDice", value:1 },
      { id:"ig7", name:"Nucleo Telepatico", rarity:"LEGENDARY", desc:"+1d ATK +2", effect:"atkDicePlus", value:1 },
    ],
  },

  FELINE: {
    bosses: [
      { name:"Pantera Nera", quote:"La preda non ci vede arrivare.", desc:"Velocità letale. Nessun errore.", signatureStrat:"fa_sig1" },
      { name:"Re Leone", quote:"Il trono si prende, non si chiede.", desc:"Leader assoluto. Carisma e forza.", signatureStrat:"fa_sig2" },
    ],
    players: [
      { id:"f1", name:"Whisker", trait1:"Velocista", trait2:"Furtivo", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:4 },
      { id:"f2", name:"Pounce", trait1:"Acrobata", trait2:"Velocista", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:4 },
      { id:"f3", name:"Scratch", trait1:"Furtivo", trait2:"Implacabile", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:3 },
      { id:"f4", name:"Nyx", trait1:"Acrobata", trait2:"Astuto", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:5 },
      { id:"f5", name:"Dash", trait1:"Velocista", trait2:"Acrobata", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:4 },
      { id:"f6", name:"Claw", trait1:"Acrobata", trait2:"Berserk", atkDie:"UNCOMMON", defDie:"COMMON", rarity:"UNCOMMON", loyalty:3 },
      { id:"f7", name:"Shadow", trait1:"Furtivo", trait2:"Astuto", atkDie:"COMMON", defDie:"UNCOMMON", rarity:"UNCOMMON", loyalty:5 },
      { id:"f8", name:"Lynx", trait1:"Velocista", trait2:"Furtivo", atkDie:"UNCOMMON", defDie:"UNCOMMON", rarity:"UNCOMMON", loyalty:4 },
      { id:"f9", name:"Prowl", trait1:"Furtivo", trait2:"Acrobata", atkDie:"UNCOMMON", defDie:"COMMON", rarity:"UNCOMMON", loyalty:3 },
      { id:"f10", name:"Sable", trait1:"Astuto", trait2:"Leader", atkDie:"COMMON", defDie:"UNCOMMON", rarity:"UNCOMMON", loyalty:6 },
      { id:"f11", name:"Tigre Astrale", trait1:"Furtivo", trait2:"Implacabile", atkDie:"RARE", defDie:"UNCOMMON", rarity:"RARE", loyalty:4 },
      { id:"f12", name:"Ocelot", trait1:"Acrobata", trait2:"Velocista", atkDie:"RARE", defDie:"RARE", rarity:"RARE", loyalty:5 },
      { id:"f13", name:"Jaguar", trait1:"Berserk", trait2:"Furtivo", atkDie:"RARE", defDie:"UNCOMMON", rarity:"RARE", loyalty:3 },
      { id:"f14", name:"Sphinx", trait1:"Astuto", trait2:"Leader", atkDie:"UNCOMMON", defDie:"RARE", rarity:"RARE", loyalty:7 },
      { id:"f15", name:"Caracal", trait1:"Velocista", trait2:"Acrobata", atkDie:"RARE", defDie:"RARE", rarity:"RARE", loyalty:5 },
      { id:"f16", name:"Nemesis Felina", trait1:"Leader", trait2:"Acrobata", atkDie:"LEGENDARY", defDie:"RARE", rarity:"LEGENDARY", loyalty:8 },
    ],
    atkStrategies: [
      { id:"fa1", name:"Tiro Rapido", passCount:0, bonusBase:2, bonusRace:1, rarity:"COMMON", desc:"0 pass. Base +2, +1/Felide campo" },
      { id:"fa2", name:"Scatto Felino", passCount:0, bonusBase:2, bonusRace:1, rarity:"COMMON", desc:"0 pass. Base +2, +1/Felide campo" },
      { id:"fa3", name:"Artiglio", passCount:0, bonusBase:3, bonusRace:1, rarity:"COMMON", desc:"0 pass. Base +3, +1/Felide campo" },
      { id:"fa_sig1", name:"Euro Step", passCount:0, bonusBase:3, bonusRace:2, rarity:"UNCOMMON", desc:"FIRMA. 0 pass. Base +3, +2/Felide campo" },
      { id:"fa_sig2", name:"Ruggito del Re", passCount:1, bonusBase:3, bonusRace:2, rarity:"UNCOMMON", desc:"FIRMA. 1 pass. Base +3, +2/Felide campo" },
      { id:"fa4", name:"Transizione", passCount:0, bonusBase:2, bonusRace:2, rarity:"UNCOMMON", desc:"0 pass. Base +2, +2/Felide campo" },
      { id:"fa5", name:"Backdoor Cut", passCount:1, bonusBase:2, bonusRace:2, rarity:"UNCOMMON", desc:"1 pass. Base +2, +2/Felide campo" },
      { id:"fa6", name:"Finta Mortale", passCount:0, bonusBase:3, bonusRace:2, rarity:"UNCOMMON", desc:"0 pass. Base +3, +2/Felide campo" },
      { id:"fa7", name:"Caccia Notturna", passCount:0, bonusBase:4, bonusRace:2, rarity:"RARE", desc:"0 pass. Base +4, +2/Felide campo" },
      { id:"fa8", name:"Caccia Felina", passCount:0, bonusBase:0, bonusRace:1, mechanic:"corruption", rarity:"RARE", desc:"CORRUZIONE. 2d6+sinergia vs Lealtà×2" },
      { id:"fa9", name:"Passo d'Ombra", passCount:0, bonusBase:3, bonusRace:2, extraDice:1, rarity:"RARE", desc:"0 pass. +1 dado ATK. Base +3, +2/Felide" },
      { id:"fa10", name:"Furia della Savana", passCount:0, bonusBase:5, bonusRace:3, extraDice:1, rarity:"LEGENDARY", desc:"0 pass. +1 dado. Base +5, +3/Felide" },
    ],
    defStrategies: [
      { id:"fd1", name:"Contrattacco", bonusBase:0, bonusRace:1, rarity:"COMMON", desc:"Base +0, +1/Felide campo" },
      { id:"fd2", name:"Agguato", bonusBase:0, bonusRace:2, mechanic:"ambush", rarity:"COMMON", desc:"+2 DEF se 0 pass, -1 se pass. +2/Felide" },
      { id:"fd3", name:"Pressing", bonusBase:0, bonusRace:1, mechanic:"press", rarity:"UNCOMMON", desc:"+2 intercetto. Base +0, +1/Felide" },
      { id:"fd4", name:"Blitz", bonusBase:0, bonusRace:1, mechanic:"blitz", rarity:"UNCOMMON", desc:"Rubata pre-azione. Se fallisce -1. Base +0, +1/Felide" },
      { id:"fd5", name:"Riflessi Felini", bonusBase:1, bonusRace:2, rarity:"UNCOMMON", desc:"Base +1, +2/Felide campo" },
      { id:"fd6", name:"Deny Ball", bonusBase:0, bonusRace:1, mechanic:"deny_first", rarity:"RARE", desc:"+3 intercetto solo 1° pass. Base +0, +1/Felide" },
      { id:"fd7", name:"Predatore Supremo", bonusBase:1, bonusRace:2, mechanic:"ambush", rarity:"RARE", desc:"+2 se 0 pass. Base +1, +2/Felide" },
      { id:"fd8", name:"Istinto Letale", bonusBase:2, bonusRace:3, mechanic:"blitz", rarity:"LEGENDARY", desc:"Rubata potenziata. Base +2, +3/Felide" },
    ],
    gear: [
      { id:"fg1", name:"Artigli Affilati", rarity:"COMMON", desc:"+1 ATK", effect:"atkFlat", value:1 },
      { id:"fg2", name:"Stivali Silenziosi", rarity:"COMMON", desc:"+1 DEF", effect:"defFlat", value:1 },
      { id:"fg3", name:"Guanti Rampicanti", rarity:"UNCOMMON", desc:"+2 ATK", effect:"atkFlat", value:2 },
      { id:"fg4", name:"Mantello d'Ombra", rarity:"UNCOMMON", desc:"+2 DEF", effect:"defFlat", value:2 },
      { id:"fg5", name:"Occhi di Gatto", rarity:"RARE", desc:"+3 ATK", effect:"atkFlat", value:3 },
      { id:"fg6", name:"Riflessi d'Argento", rarity:"RARE", desc:"+1 dado DEF", effect:"defDice", value:1 },
      { id:"fg7", name:"Nove Vite", rarity:"LEGENDARY", desc:"Immune corruzione", effect:"loyaltyImmune", value:1 },
    ],
  },

  GOLEM: {
    bosses: [
      { name:"Monolith", quote:"La montagna non si muove.", desc:"Difesa impenetrabile. Pazienza infinita.", signatureStrat:"ga_sig1" },
      { name:"Crystal Prime", quote:"Il cristallo ricorda ogni colpo.", desc:"Adattamento costante. Diventa più forte.", signatureStrat:"ga_sig2" },
    ],
    players: [
      { id:"g1", name:"Pebble", trait1:"Difensore", trait2:"Corazzato", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:8 },
      { id:"g2", name:"Shard", trait1:"Corazzato", trait2:"Uomo Di Squadra", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:7 },
      { id:"g3", name:"Rubble", trait1:"Difensore", trait2:"Implacabile", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:7 },
      { id:"g4", name:"Slate", trait1:"Uomo Di Squadra", trait2:"Difensore", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:8 },
      { id:"g5", name:"Gravel", trait1:"Corazzato", trait2:"Difensore", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:9 },
      { id:"g6", name:"Quartz", trait1:"Difensore", trait2:"Astuto", atkDie:"COMMON", defDie:"UNCOMMON", rarity:"UNCOMMON", loyalty:8 },
      { id:"g7", name:"Granite", trait1:"Corazzato", trait2:"Implacabile", atkDie:"UNCOMMON", defDie:"UNCOMMON", rarity:"UNCOMMON", loyalty:7 },
      { id:"g8", name:"Basalt", trait1:"Difensore", trait2:"Leader", atkDie:"COMMON", defDie:"UNCOMMON", rarity:"UNCOMMON", loyalty:9 },
      { id:"g9", name:"Marble", trait1:"Uomo Di Squadra", trait2:"Corazzato", atkDie:"UNCOMMON", defDie:"COMMON", rarity:"UNCOMMON", loyalty:8 },
      { id:"g10", name:"Flint", trait1:"Implacabile", trait2:"Corazzato", atkDie:"UNCOMMON", defDie:"UNCOMMON", rarity:"UNCOMMON", loyalty:6 },
      { id:"g11", name:"Obsidian", trait1:"Difensore", trait2:"Corazzato", atkDie:"UNCOMMON", defDie:"RARE", rarity:"RARE", loyalty:9 },
      { id:"g12", name:"Opal", trait1:"Astuto", trait2:"Leader", atkDie:"RARE", defDie:"RARE", rarity:"RARE", loyalty:8 },
      { id:"g13", name:"Diamond Guard", trait1:"Corazzato", trait2:"Difensore", atkDie:"RARE", defDie:"RARE", rarity:"RARE", loyalty:10 },
      { id:"g14", name:"Emerald Fist", trait1:"Implacabile", trait2:"Corazzato", atkDie:"RARE", defDie:"UNCOMMON", rarity:"RARE", loyalty:7 },
      { id:"g15", name:"Ruby Core", trait1:"Leader", trait2:"Difensore", atkDie:"UNCOMMON", defDie:"RARE", rarity:"RARE", loyalty:9 },
      { id:"g16", name:"Titan Cristallino", trait1:"Leader", trait2:"Corazzato", atkDie:"RARE", defDie:"LEGENDARY", rarity:"LEGENDARY", loyalty:10 },
    ],
    atkStrategies: [
      { id:"ga1", name:"Impatto", passCount:0, bonusBase:2, bonusRace:1, rarity:"COMMON", desc:"0 pass. Base +2, +1/Cristallino campo" },
      { id:"ga2", name:"Lancio Macigno", passCount:0, bonusBase:3, bonusRace:1, rarity:"COMMON", desc:"0 pass. Base +3, +1/Cristallino campo" },
      { id:"ga3", name:"Carica Tettonica", passCount:0, bonusBase:2, bonusRace:1, rarity:"COMMON", desc:"0 pass. Base +2, +1/Cristallino campo" },
      { id:"ga_sig1", name:"Valanga", passCount:0, bonusBase:3, bonusRace:2, extraDice:1, rarity:"UNCOMMON", desc:"FIRMA. 0 pass. +1 dado ATK. Base +3, +2/Crist." },
      { id:"ga_sig2", name:"Prisma di Forza", passCount:0, bonusBase:4, bonusRace:2, rarity:"UNCOMMON", desc:"FIRMA. 0 pass. Base +4, +2/Cristallino campo" },
      { id:"ga4", name:"Frana", passCount:0, bonusBase:3, bonusRace:2, rarity:"UNCOMMON", desc:"0 pass. Base +3, +2/Cristallino campo" },
      { id:"ga5", name:"Terremoto", passCount:0, bonusBase:2, bonusRace:2, rarity:"UNCOMMON", desc:"0 pass. Base +2, +2/Cristallino campo" },
      { id:"ga6", name:"Pugno Cristallino", passCount:0, bonusBase:3, bonusRace:2, extraDice:1, rarity:"UNCOMMON", desc:"0 pass. +1 dado. Base +3, +2/Crist." },
      { id:"ga7", name:"Eruzione", passCount:0, bonusBase:4, bonusRace:2, extraDice:1, rarity:"RARE", desc:"0 pass. +1 dado. Base +4, +2/Crist." },
      { id:"ga8", name:"Schiacciamento", passCount:0, bonusBase:5, bonusRace:2, rarity:"RARE", desc:"0 pass. Base +5, +2/Cristallino campo" },
      { id:"ga9", name:"Risonanza", passCount:0, bonusBase:0, bonusRace:2, mechanic:"corruption", rarity:"RARE", desc:"CORRUZIONE. 2d6+sinergia vs Lealtà×2" },
      { id:"ga10", name:"Cataclisma", passCount:0, bonusBase:6, bonusRace:3, extraDice:1, rarity:"LEGENDARY", desc:"0 pass. +1 dado. Base +6, +3/Crist." },
    ],
    defStrategies: [
      { id:"gd1", name:"Muro di Pietra", bonusBase:2, bonusRace:1, rarity:"COMMON", desc:"Base +2, +1/Cristallino campo" },
      { id:"gd2", name:"Scudo Minerale", bonusBase:1, bonusRace:1, rarity:"COMMON", desc:"Base +1, +1/Cristallino campo" },
      { id:"gd3", name:"Barriera Cristallina", bonusBase:2, bonusRace:1, mechanic:"wall", rarity:"UNCOMMON", desc:"+2 se pass, -1 se 0. Base +2, +1/Crist." },
      { id:"gd4", name:"Assorbimento", bonusBase:1, bonusRace:2, mechanic:"double_team", rarity:"UNCOMMON", desc:"+1 dado DEF. Base +1, +2/Crist." },
      { id:"gd5", name:"Riflesso Prisma", bonusBase:2, bonusRace:2, rarity:"UNCOMMON", desc:"Base +2, +2/Cristallino campo" },
      { id:"gd6", name:"Fortezza Cristallina", bonusBase:3, bonusRace:2, rarity:"RARE", desc:"Base +3, +2/Cristallino campo" },
      { id:"gd7", name:"Rigenerazione", bonusBase:2, bonusRace:2, mechanic:"physical", rarity:"RARE", desc:"Infortunio se ≥8. Base +2, +2/Crist." },
      { id:"gd8", name:"Diamante Eterno", bonusBase:4, bonusRace:3, mechanic:"wall", rarity:"LEGENDARY", desc:"+3 se pass, +1 se 0. Base +4, +3/Crist." },
    ],
    gear: [
      { id:"gg1", name:"Frammento di Quarzo", rarity:"COMMON", desc:"+1 DEF", effect:"defFlat", value:1 },
      { id:"gg2", name:"Pugno di Granito", rarity:"COMMON", desc:"+1 ATK", effect:"atkFlat", value:1 },
      { id:"gg3", name:"Corazza Minerale", rarity:"UNCOMMON", desc:"+2 DEF", effect:"defFlat", value:2 },
      { id:"gg4", name:"Cristallo Energetico", rarity:"UNCOMMON", desc:"+2 ATK", effect:"atkFlat", value:2 },
      { id:"gg5", name:"Nucleo di Diamante", rarity:"RARE", desc:"+1 dado DEF", effect:"defDice", value:1 },
      { id:"gg6", name:"Lama Ossidiana", rarity:"RARE", desc:"+3 ATK", effect:"atkFlat", value:3 },
      { id:"gg7", name:"Cuore della Montagna", rarity:"LEGENDARY", desc:"+4 DEF", effect:"defFlat", value:4 },
    ],
  },

  PHANTOM: {
    bosses: [
      { name:"Void", quote:"L'oscurità è solo l'inizio.", desc:"Evasione pura. Colpisce e svanisce.", signatureStrat:"pa_sig1" },
      { name:"Nightmare", quote:"Sogna pure. È il mio territorio.", desc:"Corruzione e paura. Attacca la mente.", signatureStrat:"pa_sig2" },
    ],
    players: [
      { id:"ph1", name:"Wisp", trait1:"Furtivo", trait2:"Velocista", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:4 },
      { id:"ph2", name:"Shade", trait1:"Furtivo", trait2:"Astuto", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:5 },
      { id:"ph3", name:"Gloom", trait1:"Telepate", trait2:"Furtivo", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:5 },
      { id:"ph4", name:"Mist", trait1:"Velocista", trait2:"Furtivo", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:4 },
      { id:"ph5", name:"Echo", trait1:"Telepate", trait2:"Astuto", atkDie:"COMMON", defDie:"COMMON", rarity:"COMMON", loyalty:6 },
      { id:"ph6", name:"Wraith", trait1:"Furtivo", trait2:"Implacabile", atkDie:"UNCOMMON", defDie:"COMMON", rarity:"UNCOMMON", loyalty:3 },
      { id:"ph7", name:"Specter", trait1:"Telepate", trait2:"Velocista", atkDie:"COMMON", defDie:"UNCOMMON", rarity:"UNCOMMON", loyalty:5 },
      { id:"ph8", name:"Dusk", trait1:"Furtivo", trait2:"Astuto", atkDie:"UNCOMMON", defDie:"UNCOMMON", rarity:"UNCOMMON", loyalty:4 },
      { id:"ph9", name:"Penumbra", trait1:"Telepate", trait2:"Furtivo", atkDie:"UNCOMMON", defDie:"COMMON", rarity:"UNCOMMON", loyalty:5 },
      { id:"ph10", name:"Umbra", trait1:"Astuto", trait2:"Leader", atkDie:"COMMON", defDie:"UNCOMMON", rarity:"UNCOMMON", loyalty:6 },
      { id:"ph11", name:"Revenant", trait1:"Implacabile", trait2:"Furtivo", atkDie:"RARE", defDie:"UNCOMMON", rarity:"RARE", loyalty:3 },
      { id:"ph12", name:"Phantom Lord", trait1:"Leader", trait2:"Telepate", atkDie:"RARE", defDie:"RARE", rarity:"RARE", loyalty:7 },
      { id:"ph13", name:"Banshee", trait1:"Telepate", trait2:"Implacabile", atkDie:"UNCOMMON", defDie:"RARE", rarity:"RARE", loyalty:5 },
      { id:"ph14", name:"Shade Walker", trait1:"Furtivo", trait2:"Velocista", atkDie:"RARE", defDie:"RARE", rarity:"RARE", loyalty:4 },
      { id:"ph15", name:"Nyx Eternal", trait1:"Astuto", trait2:"Telepate", atkDie:"RARE", defDie:"UNCOMMON", rarity:"RARE", loyalty:6 },
      { id:"ph16", name:"Oblivion", trait1:"Telepate", trait2:"Furtivo", atkDie:"LEGENDARY", defDie:"RARE", rarity:"LEGENDARY", loyalty:6 },
    ],
    atkStrategies: [
      { id:"pa1", name:"Tocco Spettrale", passCount:1, bonusBase:2, bonusRace:1, rarity:"COMMON", desc:"1 pass. Base +2, +1/Ombra campo" },
      { id:"pa2", name:"Dissolvenza", passCount:0, bonusBase:2, bonusRace:1, rarity:"COMMON", desc:"0 pass. Base +2, +1/Ombra campo" },
      { id:"pa3", name:"Lama d'Ombra", passCount:0, bonusBase:3, bonusRace:1, rarity:"COMMON", desc:"0 pass. Base +3, +1/Ombra campo" },
      { id:"pa_sig1", name:"Fase Spettrale", passCount:1, bonusBase:3, bonusRace:2, rarity:"UNCOMMON", desc:"FIRMA. 1 pass. Base +3, +2/Ombra campo" },
      { id:"pa_sig2", name:"Incubo", passCount:0, bonusBase:0, bonusRace:2, mechanic:"corruption", rarity:"UNCOMMON", desc:"FIRMA. CORRUZIONE. 2d6+sinergia vs Lealtà×2" },
      { id:"pa4", name:"Teletrasporto", passCount:1, bonusBase:2, bonusRace:2, rarity:"UNCOMMON", desc:"1 pass. Base +2, +2/Ombra campo" },
      { id:"pa5", name:"Vuoto Tattico", passCount:0, bonusBase:3, bonusRace:2, rarity:"UNCOMMON", desc:"0 pass. Base +3, +2/Ombra campo" },
      { id:"pa6", name:"Passaggio Etereo", passCount:1, bonusBase:3, bonusRace:2, rarity:"UNCOMMON", desc:"1 pass. Base +3, +2/Ombra campo" },
      { id:"pa7", name:"Terrore Notturno", passCount:0, bonusBase:0, bonusRace:2, mechanic:"corruption", rarity:"RARE", desc:"CORRUZIONE. 2d6+sinergia vs Lealtà×2" },
      { id:"pa8", name:"Colpo Dimensionale", passCount:1, bonusBase:4, bonusRace:2, rarity:"RARE", desc:"1 pass. Base +4, +2/Ombra campo" },
      { id:"pa9", name:"Eclissi", passCount:0, bonusBase:4, bonusRace:2, extraDice:1, rarity:"RARE", desc:"0 pass. +1 dado. Base +4, +2/Ombra" },
      { id:"pa10", name:"Oblio Totale", passCount:0, bonusBase:0, bonusRace:3, mechanic:"corruption", rarity:"LEGENDARY", desc:"CORRUZIONE potenziata. 3d6+sinergia vs Lealtà×2" },
    ],
    defStrategies: [
      { id:"pd1", name:"Nebbia", bonusBase:0, bonusRace:1, rarity:"COMMON", desc:"Base +0, +1/Ombra campo" },
      { id:"pd2", name:"Evasione Spettrale", bonusBase:0, bonusRace:2, mechanic:"ambush", rarity:"COMMON", desc:"+2 se 0 pass, -1 se pass. +2/Ombra" },
      { id:"pd3", name:"Distorsione", bonusBase:0, bonusRace:1, mechanic:"blitz", rarity:"UNCOMMON", desc:"Rubata pre-azione. Se fallisce -1. +1/Ombra" },
      { id:"pd4", name:"Muro di Nebbia", bonusBase:1, bonusRace:2, mechanic:"deny", rarity:"UNCOMMON", desc:"+2 intercetto. Base +1, +2/Ombra" },
      { id:"pd5", name:"Sfasamento", bonusBase:1, bonusRace:2, rarity:"UNCOMMON", desc:"Base +1, +2/Ombra campo" },
      { id:"pd6", name:"Vuoto Difensivo", bonusBase:1, bonusRace:2, mechanic:"deny_first", rarity:"RARE", desc:"+3 su 1° pass. Base +1, +2/Ombra" },
      { id:"pd7", name:"Paradosso", bonusBase:2, bonusRace:2, mechanic:"blitz", rarity:"RARE", desc:"Rubata potenziata. Base +2, +2/Ombra" },
      { id:"pd8", name:"Cancellazione", bonusBase:2, bonusRace:3, mechanic:"deny", rarity:"LEGENDARY", desc:"+3 intercetto. Base +2, +3/Ombra" },
    ],
    gear: [
      { id:"pg1", name:"Velo d'Ombra", rarity:"COMMON", desc:"+1 DEF", effect:"defFlat", value:1 },
      { id:"pg2", name:"Lama Eterica", rarity:"COMMON", desc:"+1 ATK", effect:"atkFlat", value:1 },
      { id:"pg3", name:"Mantello del Vuoto", rarity:"UNCOMMON", desc:"+2 DEF", effect:"defFlat", value:2 },
      { id:"pg4", name:"Guanti Spettrali", rarity:"UNCOMMON", desc:"+2 ATK", effect:"atkFlat", value:2 },
      { id:"pg5", name:"Anello d'Ombra", rarity:"RARE", desc:"Immune corruzione", effect:"loyaltyImmune", value:1 },
      { id:"pg6", name:"Falce del Vuoto", rarity:"RARE", desc:"+1 dado ATK", effect:"atkDice", value:1 },
      { id:"pg7", name:"Essenza del Nulla", rarity:"LEGENDARY", desc:"+1d ATK +2", effect:"atkDicePlus", value:1 },
    ],
  },
};

// Add race to all clan cards
for (const [race, clan] of Object.entries(CLAN_DATA)) {
  clan.players.forEach(p => p.race = race);
  clan.atkStrategies.forEach(s => s.race = race);
  clan.defStrategies.forEach(s => s.race = race);
}

// ============================================================
// BOSS & SHOP v2 — CLAN-BASED
// ============================================================
function initRun() {
  // Pick 3 random clans
  const allClans = Object.keys(CLAN_DATA);
  const shuffled = allClans.sort(() => Math.random() - 0.5);
  const activeClans = shuffled.slice(0, 3);

  // Generate 6 bosses: 2 per clan, shuffled
  const bossList = [];
  for (const clanKey of activeClans) {
    const clan = CLAN_DATA[clanKey];
    for (const boss of clan.bosses) {
      bossList.push({ ...boss, clan: clanKey });
    }
  }
  const bossOrder = bossList.sort(() => Math.random() - 0.5);

  // Player starting roster: 5 common humans
  const hc = HUMAN_PLAYERS.filter(p => p.rarity === "COMMON");
  const sp = hc.sort(() => Math.random() - 0.5).slice(0, 5).map(p => ({ ...p, equippedGear: [] }));

  // Starting strategies: common human
  const aS = HUMAN_ATK.filter(s => s.rarity === "COMMON").sort(() => Math.random() - 0.5).slice(0, 5);
  while (aS.length < 5) aS.push({ ...HUMAN_ATK[0], id: HUMAN_ATK[0].id + "_" + aS.length });
  const dS = HUMAN_DEF.filter(s => s.rarity === "COMMON").sort(() => Math.random() - 0.5).slice(0, 5);
  while (dS.length < 5) dS.push({ ...HUMAN_DEF[0], id: HUMAN_DEF[0].id + "_" + dS.length });

  const shops = { gym: genShop("gym", 1, activeClans), gear: genShop("gear", 1, activeClans), strategies: genShop("strategies", 1, activeClans) };
  const clanNames = activeClans.map(c => RACES[c].emoji + " " + RACES[c].name).join(", ");

  return { floor: 1, gold: 3, phase: "explore", roster: sp, field: sp.slice(0, 3), bench: sp.slice(3, 5),
    atkStrategies: aS, defStrategies: dS,
    shops, shopType: null, boss: null, matchResult: null,
    activeClans, bossOrder,
    log: [`La torre ti attende, Coach Vega.`, `Clan attivi: ${clanNames}`] };
}

function genBoss(floor, gameState) {
  const bossInfo = gameState.bossOrder[floor - 1];
  const clan = CLAN_DATA[bossInfo.clan];
  const clanRace = bossInfo.clan;

  // Pick players from clan pool based on floor rarity
  const pool = [...clan.players];
  const pickPlayer = () => {
    const r = pickRarity(floor);
    const candidates = pool.filter(p => p.rarity === r);
    const pick = candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : pool[Math.floor(Math.random() * pool.length)];
    pool.splice(pool.indexOf(pick), 1);
    return { ...pick, equippedGear: [] };
  };
  const field = [pickPlayer(), pickPlayer(), pickPlayer()];
  const bench = [pickPlayer(), pickPlayer()];

  // Pick strategies — signature always in slot 0
  const sigId = bossInfo.signatureStrat;
  const sigAtk = clan.atkStrategies.find(s => s.id === sigId);
  const sigDef = clan.defStrategies.find(s => s.id === sigId);

  const pickStrats = (stratPool, count, exclude) => {
    const available = stratPool.filter(s => s.id !== exclude);
    const picked = [];
    for (let i = 0; i < count; i++) {
      const r = pickRarity(floor);
      const candidates = available.filter(s => s.rarity === r && !picked.find(p => p.id === s.id));
      const s = candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : available.filter(s2 => !picked.find(p => p.id === s2.id))[0];
      if (s) picked.push(s);
    }
    // Fill with commons if needed
    while (picked.length < count) {
      const fill = stratPool.find(s => !picked.find(p => p.id === s.id) && s.rarity === "COMMON") || stratPool[0];
      picked.push(fill);
    }
    return picked;
  };

  let atkStrats, defStrats;
  if (sigAtk) {
    atkStrats = [sigAtk, ...pickStrats(clan.atkStrategies, 4, sigId)];
    defStrats = pickStrats(clan.defStrategies, 5, null);
  } else {
    atkStrats = pickStrats(clan.atkStrategies, 5, null);
    defStrats = sigDef ? [sigDef, ...pickStrats(clan.defStrategies, 4, sigId)] : pickStrats(clan.defStrategies, 5, null);
  }

  // Equip some gear on higher floors
  if (floor >= 3) {
    const gearPool = [...clan.gear].sort(() => Math.random() - 0.5);
    const gearCount = Math.min(floor - 2, 3);
    for (let i = 0; i < gearCount && i < gearPool.length; i++) {
      const target = field[i % field.length];
      target.equippedGear = [...(target.equippedGear || []), gearPool[i]];
    }
  }

  return {
    label: bossInfo.name,
    desc: bossInfo.desc,
    quote: bossInfo.quote,
    clan: clanRace,
    field, bench,
    atkStrategies: atkStrats.slice(0, 5),
    defStrategies: defStrats.slice(0, 5),
  };
}

function genShop(type, floor, activeClans) {
  const n = 3 + Math.min(floor, 3);
  const items = [];

  if (type === "gym") {
    // Pool: human players + all active clan players
    const pool = [...HUMAN_PLAYERS];
    for (const ck of activeClans) pool.push(...CLAN_DATA[ck].players);
    const shuffled = pool.sort(() => Math.random() - 0.5);
    for (let i = 0; i < n && i < shuffled.length; i++) {
      const r = pickShopRarity(floor);
      const m = shuffled.find(p => p.rarity === r && !items.find(x => x.id === p.id)) || shuffled.find(p => !items.find(x => x.id === p.id));
      if (m && !items.find(x => x.id === m.id)) items.push({ ...m, equippedGear: [], price: RARITIES[m.rarity].buy });
    }
  } else if (type === "gear") {
    const pool = [];
    for (const ck of activeClans) pool.push(...CLAN_DATA[ck].gear);
    const shuffled = pool.sort(() => Math.random() - 0.5);
    for (let i = 0; i < n && i < shuffled.length; i++) {
      const r = pickShopRarity(floor);
      const m = shuffled.find(g => g.rarity === r && !items.find(x => x.id === g.id)) || shuffled.find(g => !items.find(x => x.id === g.id));
      if (m && !items.find(x => x.id === m.id)) items.push({ ...m, price: RARITIES[m.rarity].buy });
    }
  } else {
    // Strategies: human + all active clans
    const allAtk = [...HUMAN_ATK]; const allDef = [...HUMAN_DEF];
    for (const ck of activeClans) { allAtk.push(...CLAN_DATA[ck].atkStrategies); allDef.push(...CLAN_DATA[ck].defStrategies); }
    const all = [...allAtk.map(s => ({ ...s, stratType: "atk" })), ...allDef.map(s => ({ ...s, stratType: "def" }))].sort(() => Math.random() - 0.5);
    // Filter out boss signature strats from shop
    const filtered = all.filter(s => !s.id.includes("_sig"));
    for (let i = 0; i < n && i < filtered.length; i++) {
      const r = pickShopRarity(floor);
      const m = filtered.find(s => s.rarity === r && !items.find(x => x.id === s.id)) || filtered.find(s => !items.find(x => x.id === s.id));
      if (m && !items.find(x => x.id === m.id)) items.push({ ...m, price: RARITIES[m.rarity].buy });
    }
  }
  return items;
}

// ============================================================
// ENGINE (balanced v0.2)
// ============================================================
const roll = (s) => Math.floor(Math.random() * s) + 1;
const die = (p, t) => RARITIES[t === "atk" ? p.atkDie : p.defDie].die;
const syn = (f, b, st) => st.bonusBase + f.filter(p => p.race === st.race).length * st.bonusRace + Math.floor(b.filter(p => p.race === st.race).length * st.bonusRace * 0.5);
const dsyn = (f, b, st) => st.bonusBase + f.filter(p => p.race === st.race).length * st.bonusRace;
const gearB = (p) => {
  const g = p.equippedGear || []; let af = 0, df = 0, ad = 0, dd = 0;
  for (const x of g) { if (x.effect === "atkFlat") af += x.value; if (x.effect === "defFlat") df += x.value; if (x.effect === "atkDice") ad += x.value; if (x.effect === "defDice") dd += x.value; if (x.effect === "atkDicePlus") { ad += 1; af += 2; } }
  return { af, df, ad, dd };
};

function simRound(aT, dT, aS, dS) {
  const log = []; const as = syn(aT.field, aT.bench, aS); const ds = dsyn(dT.field, dT.bench, dS);
  log.push(`${aS.name} [+${as}] vs ${dS.name} [+${ds}]`);
  if (aS.mechanic === "corruption") {
    const t = [...dT.field].sort((a, b) => a.loyalty - b.loyalty)[0];
    const pw = roll(6) + roll(6) + as; const rs = t.loyalty * 2;
    log.push(`Corruzione: ${t.name} (L${t.loyalty}) — ${pw} vs ${rs}`);
    if (pw > rs) { log.push(`${t.name} corrotto`); return { scored: false, log, corruption: t }; }
    log.push(`${t.name} resiste`); return { scored: false, log };
  }
  const pc = Math.min(aS.passCount || 0, aT.field.length - 1); let pb = 0; const pbn = aS.passBonus || 0;
  if (dS.mechanic === "blitz") {
    const br = roll(die(dT.field[0], "def")); const ar = roll(die(aT.field[0], "atk"));
    log.push(`Blitz: ${dT.field[0].name}(${br}) vs ${aT.field[0].name}(${ar})`);
    if (br > ar) { log.push(`Rubata`); return { scored: false, log }; } log.push(`Blitz fallito`);
  }
  const bf = dS.mechanic === "blitz"; let inter = false;
  for (let i = 0; i < pc; i++) {
    const ps = aT.field[i]; const rv = aT.field[i + 1]; const mk = dT.field[Math.min(i + 1, dT.field.length - 1)];
    const gb = gearB(ps); const pr = roll(die(ps, "atk")) + as + gb.af;
    let ib = 0; if (dS.mechanic === "deny") ib += 2; if (dS.mechanic === "deny_first" && i === 0) ib += 3; if (dS.mechanic === "press") ib += 2;
    const ir = roll(die(mk, "def")) + ib;
    log.push(`${ps.name}(${pr}) → ${rv.name} vs ${mk.name}(${ir})`);
    if (ir >= pr) { log.push(`Intercetto`); inter = true; break; }
    log.push(`Pass completato`); pb += pbn;
  }
  if (inter) return { scored: false, log };
  const si = Math.min(pc, aT.field.length - 1); const sh = aT.field[si]; const df = dT.field[Math.min(si, dT.field.length - 1)];
  const sg = gearB(sh); const dg = gearB(df);
  let adc = 1 + sg.ad + (aS.extraDice || 0); let afl = as + pb + sg.af;
  let ddc = 1 + dg.dd; let dfl = ds + dg.df;
  if (dS.mechanic === "wall" && pc > 0) dfl += 2; if (dS.mechanic === "wall" && pc === 0) dfl -= 1;
  if (dS.mechanic === "double_team") ddc += 1;
  if (dS.mechanic === "trap" && pc >= 2) dfl += 3; if (dS.mechanic === "trap" && pc === 0) dfl -= 1;
  if (dS.mechanic === "ambush" && pc === 0) dfl += 2; if (dS.mechanic === "ambush" && pc > 0) dfl -= 1;
  if (bf) dfl -= 1; dfl = Math.max(0, dfl);
  let at = afl; const ar = []; for (let i = 0; i < adc; i++) { const r = roll(die(sh, "atk")); ar.push(r); at += r; }
  let dt = dfl; const dr = []; for (let i = 0; i < ddc; i++) { const r = roll(die(df, "def")); dr.push(r); dt += r; }
  log.push(`${sh.name}: ${adc}d${die(sh, "atk")}[${ar}]+${afl} = ${at}`);
  log.push(`${df.name}: ${ddc}d${die(df, "def")}[${dr}]+${dfl} = ${dt}`);
  let scored = at > dt;
  if (scored) log.push(`PUNTO (+${at - dt})`);
  else { const m = dt - at; log.push(`Difeso (+${m})`); if (dS.mechanic === "physical" && m >= 8) { log.push(`${sh.name} infortunato`); return { scored: false, log, injury: sh }; } }
  if (scored && dS.mechanic === "help") { const hr = roll(4) + ds; log.push(`Help: ${hr} vs ${at}`); if (hr >= at) { log.push(`Help salva`); return { scored: false, log }; } }
  return { scored, log };
}

function simMatch(t1, t2) {
  const rounds = []; let s1 = 0, s2 = 0;
  for (let i = 0; i < 5; i++) {
    const r1 = simRound(t1, t2, t1.atkStrategies[i], t2.defStrategies[i]); if (r1.scored) s1++; rounds.push({ attacker: 1, ...r1 });
    const r2 = simRound(t2, t1, t2.atkStrategies[i], t1.defStrategies[i]); if (r2.scored) s2++; rounds.push({ attacker: 2, ...r2 });
  }
  let sd = false;
  if (s1 === s2) { sd = true; const r = simRound(t1, t2, t1.atkStrategies[0], t2.defStrategies[0]); if (r.scored) s1++; rounds.push({ attacker: 1, suddenDeath: true, ...r });
    if (s1 === s2) { const r2 = simRound(t2, t1, t2.atkStrategies[0], t1.defStrategies[0]); if (r2.scored) s2++; rounds.push({ attacker: 2, suddenDeath: true, ...r2 }); } }
  let ge = 0; for (const r of rounds) { if (r.attacker === 1 && r.scored) ge++; if (r.attacker === 2 && !r.scored && !r.corruption) ge++; }
  return { score1: s1, score2: s2, rounds, suddenDeath: sd, winner: s1 > s2 ? 1 : s2 > s1 ? 2 : 0, goldEarned: ge };
}


const IMAGES = {
  logo: "/BuzzerClimbLogo.png",
  floor1: "/LowerLevel.png",
  floor2: "/influezebrutali.png",
  floor3: "/Corridoio_Organico.png",
  floor4: "/CorridoioVerticale.png",
  floor5: "/Penultimo_Piano.png",
  floor6: "/SalaTrono.png",
  bg: "/Background.png",
};
const FLOOR_BG = { 1: IMAGES.floor1, 2: IMAGES.floor2, 3: IMAGES.floor3, 4: IMAGES.floor4, 5: IMAGES.floor5, 6: IMAGES.floor6 };

// ============================================================
// NOIR STYLE — DESKTOP 1920×1080
// ============================================================
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Mono:wght@400;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#06060c;--sf:#0b0b14;--cd:#0f0f1a;--bd:#16162a;--bdh:#222240;--tx:#b8b8c8;--txd:#555568;--txf:#2e2e42;--gd:#C9A84C;--gdd:#7a6530;--rd:#8B3A3A;--rb:#C45B5B;--bl:#3A5A8B;--gn:#3A8B5A;--pp:#7B5BA0}
html,body,#root{width:100%;height:100%;overflow:hidden}
@keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes fiL{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes fiR{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@keyframes glow{0%,100%{text-shadow:0 0 10px #C9A84C44}50%{text-shadow:0 0 24px #C9A84C88}}
@keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
.fi{animation:fi .4s ease both}
.fiL{animation:fiL .5s ease both}
.fiR{animation:fiR .5s ease both}
.btn-hover:hover{filter:brightness(1.3);transform:translateY(-1px)}
.btn-hover:active{transform:translateY(1px);filter:brightness(0.9)}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--bd);border-radius:2px}
::-webkit-scrollbar-thumb:hover{background:var(--bdh)}
`;

const s = {
  // Core layout
  viewport: { width: "100vw", height: "100vh", background: "var(--bg)", color: "var(--tx)", fontFamily: "'Space Mono',monospace", fontSize: 13, position: "relative", overflow: "hidden" },
  bgImg: (src) => ({ position: "absolute", inset: 0, backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.4) saturate(0.7)", zIndex: 0 }),
  overlay: { position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(6,6,12,0.6) 0%, rgba(6,6,12,0.92) 70%)", zIndex: 1 },
  grain: { position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5, opacity: .05, background: "repeating-conic-gradient(#fff 0 25%,transparent 0 50%) 0 0/3px 3px" },
  scanline: { position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5, overflow: "hidden" },
  content: { position: "relative", zIndex: 2, width: "100%", height: "100%", display: "flex", flexDirection: "column" },

  // Header bar
  hdr: { padding: "10px 32px", display: "flex", alignItems: "center", gap: 20, background: "linear-gradient(180deg, rgba(11,11,20,0.95) 0%, transparent 100%)", flexShrink: 0, zIndex: 3 },
  hdrBtn: (active, color) => ({
    padding: "8px 20px", borderRadius: 4, border: `1px solid ${active ? color : "var(--bd)"}`,
    background: active ? `${color}18` : "transparent", color: active ? color : "var(--txd)",
    cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Space Mono',monospace", letterSpacing: 1,
    transition: "all .25s", textTransform: "uppercase",
  }),

  // Panel
  panel: { background: "rgba(11,11,20,0.92)", border: "1px solid var(--bd)", borderRadius: 8, backdropFilter: "blur(8px)" },
  panelGlow: (c) => ({ boxShadow: `0 0 30px ${c}11, inset 0 1px 0 ${c}22` }),

  // Cards
  card: (c) => ({ background: "var(--cd)", border: `1px solid ${c || "var(--bd)"}`, borderRadius: 6, padding: 12, transition: "all .25s" }),
  cardHover: { cursor: "pointer" },

  // Typography
  orb: (sz) => ({ fontFamily: "'Orbitron',sans-serif", fontSize: sz, fontWeight: 900, letterSpacing: 2 }),
  lbl: { fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "var(--txd)", marginBottom: 8, display: "block" },
  gd: { color: "var(--gd)" }, rd: { color: "var(--rb)" }, dm: { color: "var(--txd)" }, ft: { color: "var(--txf)" },

  // Buttons
  btn: (on, c) => ({
    padding: "10px 20px", borderRadius: 4, border: `1px solid ${on ? c || "var(--gd)" : "var(--bd)"}`,
    background: on ? `${c || "var(--gd)"}15` : "transparent", color: on ? c || "var(--gd)" : "var(--txd)",
    cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Space Mono',monospace", letterSpacing: .5, transition: "all .25s",
  }),
  btnBig: (c) => ({
    padding: "16px 40px", borderRadius: 6, border: `2px solid ${c}`,
    background: `linear-gradient(180deg, ${c}22 0%, ${c}08 100%)`,
    color: c, cursor: "pointer", fontSize: 16, fontWeight: 900, fontFamily: "'Orbitron',sans-serif",
    letterSpacing: 3, textTransform: "uppercase", transition: "all .3s", textShadow: `0 0 20px ${c}44`,
  }),
  dis: { padding: "10px 20px", borderRadius: 4, border: "1px solid var(--bd)", background: "transparent", color: "var(--txf)", cursor: "not-allowed", fontSize: 12, fontFamily: "'Space Mono',monospace", opacity: .35 },
};

// ============================================================
// COMPONENTS — DESKTOP
// ============================================================
function PC({ p, mini, onClick, selected }) {
  const rc = RACES[p.race]; const ra = RARITIES[p.rarity];
  return (<div onClick={onClick} className="btn-hover" style={{
    ...s.card(selected ? "var(--gd)" : ra.color + "55"),
    minWidth: mini ? 140 : 200, maxWidth: mini ? 180 : 280,
    cursor: onClick ? "pointer" : "default",
    boxShadow: selected ? "0 0 12px var(--gd)33" : "none",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
      <span style={{ fontWeight: 700, fontSize: mini ? 11 : 14, color: "#d0d0d8" }}>{rc.emoji} {p.name}</span>
      <span style={{ fontSize: 9, color: ra.color, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{ra.name}</span>
    </div>
    <div style={{ fontSize: 10, color: rc.color, marginBottom: 2 }}>{rc.name}</div>
    <div style={{ fontSize: 10, color: "var(--txf)" }}>{p.trait1} · {p.trait2}</div>
    <div style={{ display: "flex", gap: 10, fontSize: 11, marginTop: 5 }}>
      <span style={s.rd}>ATK {RARITIES[p.atkDie].label}</span>
      <span style={{ color: "var(--bl)" }}>DEF {RARITIES[p.defDie].label}</span>
      <span style={s.dm}>L{p.loyalty}</span>
    </div>
    {p.equippedGear?.length > 0 && <div style={{ marginTop: 5, display: "flex", gap: 3, flexWrap: "wrap" }}>
      {p.equippedGear.map((g, i) => <span key={i} style={{ fontSize: 9, background: "var(--bl)22", border: "1px solid var(--bl)33", borderRadius: 3, padding: "1px 6px", color: "#7B9EC4" }}>{g.name}</span>)}
    </div>}
  </div>);
}

function SC({ st, tp, mini, extra }) {
  const rc = RACES[st.race]; const cor = st.mechanic === "corruption";
  const ac = cor ? "var(--rd)" : tp === "atk" ? "var(--rb)" : "var(--bl)";
  const isSig = st.desc?.startsWith("FIRMA");
  return (<div style={{ ...s.card(ac + "55"), minWidth: mini ? 130 : 200, maxWidth: mini ? 180 : 300, position: "relative" }}>
    {isSig && <div style={{ position: "absolute", top: 4, right: 6, fontSize: 8, color: "var(--gd)", letterSpacing: 1 }}>★ FIRMA</div>}
    <div style={{ fontWeight: 700, fontSize: mini ? 10 : 13, color: cor ? "var(--rb)" : "#c0c0c8" }}>{cor ? "◆" : tp === "atk" ? "▸" : "◂"} {st.name}</div>
    <div style={{ fontSize: 9, color: rc?.color || "var(--txd)" }}>{rc?.emoji} {rc?.name} <span style={{ color: RARITIES[st.rarity]?.color || "var(--txd)", marginLeft: 6 }}>{RARITIES[st.rarity]?.name || ""}</span></div>
    <div style={{ fontSize: 9, color: "var(--txd)", marginTop: 3, lineHeight: 1.5 }}>{st.desc}</div>
    {extra}
  </div>);
}

function GearCard({ g: gear }) {
  const ra = RARITIES[gear.rarity];
  return (<div style={{ ...s.card(ra.color + "44"), minWidth: 160 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
      <span style={{ fontWeight: 700, fontSize: 13, color: ra.color }}>{gear.name}</span>
      <span style={{ fontSize: 9, color: ra.color, letterSpacing: 1, textTransform: "uppercase" }}>{ra.name}</span>
    </div>
    <div style={{ fontSize: 11, color: "var(--txd)" }}>{gear.desc}</div>
  </div>);
}

// ============================================================
// MAIN — DESKTOP LAYOUT
// ============================================================
export default function App() {
  const [g, setG] = useState(() => ({ ...initRun(), phase: "home" }));
  const [oR, setOR] = useState(null);
  const [gT, setGT] = useState(null);
  const [subView, setSubView] = useState(null); // "team" | "strategy" | "shops" | null
  const [shopTab, setShopTab] = useState("gym");
  const up = (c) => setG(p => ({ ...p, ...c }));
  const log = (m) => setG(p => ({ ...p, log: [...p.log.slice(-40), m] }));

  const enterShop = (tp) => { setShopTab(tp); setSubView("shops"); };
  const buyPlayer = (it) => { if (g.gold < it.price || g.roster.length >= 8) return; const np = { ...it, equippedGear: [] }; const nr = [...g.roster, np]; log(`+ ${it.name} [-${it.price}◆]`); const ns = { ...g.shops, gym: g.shops.gym.filter(i => i.id !== it.id) }; up({ gold: g.gold - it.price, roster: nr, bench: nr.filter(r => !g.field.find(f => f.id === r.id)), shops: ns }); };
  const buyGear = (it) => { if (g.gold < it.price) return; setGT({ gear: it }); log(`+ ${it.name} [-${it.price}◆]`); const ns = { ...g.shops, gear: g.shops.gear.filter(i => i.id !== it.id) }; up({ gold: g.gold - it.price, shops: ns }); };
  const equipTo = (pi) => { if (!gT) return; const mx = { COMMON: 2, UNCOMMON: 2, RARE: 3, EPIC: 3, LEGENDARY: 4 }; const p = g.roster[pi]; if ((p.equippedGear?.length || 0) >= mx[p.rarity]) return; const nr = [...g.roster]; nr[pi] = { ...p, equippedGear: [...(p.equippedGear || []), gT.gear] }; const nf = g.field.map(x => nr.find(r => r.id === x.id) || x); const nb = g.bench.map(x => nr.find(r => r.id === x.id) || x); log(`${gT.gear.name} → ${p.name}`); up({ roster: nr, field: nf, bench: nb }); setGT(null); };
  const buySt = (it) => { if (g.gold < it.price) return; log(`+ ${it.name} [-${it.price}◆]`); const ns = { ...g.shops, strategies: g.shops.strategies.filter(i => i.id !== it.id) };
    if (it.stratType === "atk") { up({ gold: g.gold - it.price, shops: ns, atkStrategies: [...g.atkStrategies, it] }); }
    else { up({ gold: g.gold - it.price, shops: ns, defStrategies: [...g.defStrategies, it] }); } };
  const swapStrat = (type, i, d) => { const arr = type === "atk" ? [...g.atkStrategies] : [...g.defStrategies]; const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; up(type === "atk" ? { atkStrategies: arr } : { defStrategies: arr }); };
  const removeStrat = (type, i) => { const arr = type === "atk" ? [...g.atkStrategies] : [...g.defStrategies]; if (arr.length <= 5) return; arr.splice(i, 1); up(type === "atk" ? { atkStrategies: arr } : { defStrategies: arr }); };
  const sellP = (pi) => { const p = g.roster[pi]; if (g.roster.length <= 3) return; const sp = RARITIES[p.rarity].sell; const nr = g.roster.filter((_, i) => i !== pi); let nf = g.field.filter(f => f.id !== p.id); if (nf.length < 3) { const av = nr.find(r => !nf.find(f => f.id === r.id)); if (av) nf.push(av); } nf = nf.slice(0, 3); log(`- ${p.name} [+${sp}◆]`); up({ roster: nr, field: nf, bench: nr.filter(r => !nf.find(f => f.id === r.id)), gold: g.gold + sp }); };
  const toField = (pid) => { const p = g.roster.find(r => r.id === pid); if (!p || g.field.length >= 3 || g.field.find(f => f.id === p.id)) return; const nf = [...g.field, p]; up({ field: nf.slice(0, 3), bench: g.roster.filter(r => !nf.slice(0, 3).find(f => f.id === r.id)) }); };
  const toBench = (fi) => { if (g.field.length <= 1) return; const nf = g.field.filter((_, i) => i !== fi); up({ field: nf, bench: g.roster.filter(r => !nf.find(f => f.id === r.id)) }); };
  const swap = (i, d) => { const j = i + d; if (j < 0 || j >= g.field.length) return; const nf = [...g.field]; [nf[i], nf[j]] = [nf[j], nf[i]]; up({ field: nf }); };
  const startBoss = () => { const boss = genBoss(g.floor, g); setSubView(null); up({ phase: "prematch", boss }); log(`— ${boss.label} (${RACES[boss.clan]?.emoji || ""})`); };
  const play = () => { const r = simMatch({ field: g.field, bench: g.bench, atkStrategies: g.atkStrategies.slice(0, 5), defStrategies: g.defStrategies.slice(0, 5) }, g.boss); up({ phase: "result", matchResult: r }); setOR(null); log(r.winner === 1 ? `Vittoria ${r.score1}-${r.score2} [+${r.goldEarned}◆]` : `Sconfitta ${r.score1}-${r.score2}`); };
  const after = () => { const r = g.matchResult; if (r.winner === 1) { const ng = g.gold + r.goldEarned; const nf = g.floor + 1; if (g.floor >= 6) up({ phase: "victory", gold: ng }); else { const ns = { gym: genShop("gym", nf, g.activeClans), gear: genShop("gear", nf, g.activeClans), strategies: genShop("strategies", nf, g.activeClans) }; up({ phase: "explore", floor: nf, gold: ng, matchResult: null, boss: null, shops: ns }); setSubView(null); log(`▲ Piano ${nf}`); } } else up({ phase: "gameover" }); };
  const newRun = () => { setG({ ...initRun(), phase: "home" }); setOR(null); setGT(null); setSubView(null); };
  const startRun = () => { up({ phase: "explore" }); setSubView(null); };

  const bgSrc = FLOOR_BG[g.floor] || IMAGES.bg;

  // ─── RENDER ───
  return (
    <div style={s.viewport}>
      <style>{CSS}</style>
      <div style={s.bgImg(bgSrc)} />
      <div style={s.overlay} />
      <div style={s.grain} />

      <div style={s.content}>

        {/* ═══════════ HOME SCREEN ═══════════ */}
        {g.phase === "home" && <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
          {/* Logo image as full background */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${IMAGES.logo})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 0%, transparent 35%, rgba(6,6,12,0.6) 55%, rgba(6,6,12,0.92) 75%, rgba(6,6,12,0.98) 100%)" }} />

          {/* Content over background */}
          <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 80 }}>

            {/* Clan badges */}
            <div className="fi" style={{ marginBottom: 36, animationDelay: ".15s" }}>
              <div style={{ ...s.orb(9), color: "var(--txd)", letterSpacing: 4, textTransform: "uppercase", textAlign: "center", marginBottom: 12, textShadow: "0 2px 6px rgba(0,0,0,0.9)" }}>Clan di questa run</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
                {g.activeClans?.map((c, i) => (
                  <div key={c} className="fiL" style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 20px",
                    border: `1px solid ${RACES[c]?.color}55`, borderRadius: 8,
                    background: `linear-gradient(135deg, ${RACES[c]?.color}18 0%, rgba(6,6,12,0.7) 100%)`,
                    backdropFilter: "blur(8px)", animationDelay: `${i * .1}s`,
                  }}>
                    <span style={{ fontSize: 28 }}>{RACES[c]?.emoji}</span>
                    <div style={{ fontWeight: 700, fontSize: 15, color: RACES[c]?.color, textShadow: `0 0 12px ${RACES[c]?.color}44` }}>{RACES[c]?.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="fi" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, animationDelay: ".3s" }}>
              <button className="btn-hover" style={{ ...s.btn(0, "var(--bl)"), opacity: 0.4, pointerEvents: "none", backdropFilter: "blur(4px)" }}>
                Guardaroba — Prossimamente
              </button>
              <button className="btn-hover" onClick={startRun} style={{ ...s.btnBig("var(--gd)"), backdropFilter: "blur(4px)", boxShadow: "0 0 40px rgba(201,168,76,0.15)" }}>
                Inizia Run
              </button>
            </div>
          </div>
        </div>}

        {/* ═══════════ GAMEOVER ═══════════ */}
        {g.phase === "gameover" && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <div className="fi" style={{ ...s.panel, padding: "60px 80px", textAlign: "center", maxWidth: 600, ...s.panelGlow("var(--rb)") }}>
            <div style={{ ...s.orb(36), color: "var(--rb)", marginBottom: 12 }}>SCONFITTA</div>
            <div style={{ ...s.dm, marginBottom: 8, fontSize: 14 }}>Eliminato al Piano {g.floor}</div>
            <div style={{ ...s.ft, fontSize: 12, fontStyle: "italic", marginBottom: 36, lineHeight: 1.6 }}>
              "Il buzzer suona. Le luci si spengono.<br/>Vega torna nell'ombra."
            </div>
            <button className="btn-hover" onClick={newRun} style={s.btnBig("var(--rb)")}>Nuova Run</button>
          </div>
        </div>}

        {/* ═══════════ VICTORY ═══════════ */}
        {g.phase === "victory" && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <div className="fi" style={{ ...s.panel, padding: "60px 80px", textAlign: "center", maxWidth: 600, ...s.panelGlow("var(--gd)") }}>
            <div style={{ ...s.orb(36), color: "var(--gd)", marginBottom: 12, animation: "glow 2s infinite" }}>VITTORIA</div>
            <div style={{ ...s.dm, marginBottom: 8, fontSize: 14 }}>La torre è conquistata.</div>
            <div style={{ ...s.ft, fontSize: 12, fontStyle: "italic", marginBottom: 36, lineHeight: 1.6 }}>
              "Drava applaude lentamente. Il pubblico urla.<br/>Ma domani... il Buzzer Climb ricomincia."
            </div>
            <button className="btn-hover" onClick={newRun} style={s.btnBig("var(--gd)")}>Ricomincia</button>
          </div>
        </div>}

        {/* ═══════════ FLOOR EXPLORE ═══════════ */}
        {g.phase === "explore" && <>
          {/* Header bar */}
          <div style={s.hdr}>
            <img src={IMAGES.logo} alt="Buzzer Climb" style={{ height: 36, objectFit: "contain" }} />
            <div style={{ flex: 1 }} />
            <span style={{ ...s.orb(12), color: "var(--gd)" }}>◆ {g.gold}</span>
            <span style={{ ...s.orb(11), color: "var(--txd)" }}>Piano {g.floor}/6</span>
            <div style={{ borderLeft: "1px solid var(--bd)", height: 20, margin: "0 8px" }} />
            {g.activeClans?.map(c => <span key={c} title={RACES[c]?.name} style={{ fontSize: 18, opacity: 0.7 }}>{RACES[c]?.emoji}</span>)}
          </div>

          {/* Main content area */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 40px", overflow: "hidden" }}>

            {/* ── No subview: Floor Hub ── */}
            {!subView && <div className="fi" style={{ display: "flex", gap: 30, alignItems: "stretch", maxWidth: 1200, width: "100%" }}>

              {/* Left: Boss preview */}
              <div className="fiL" style={{ ...s.panel, ...s.panelGlow("var(--rb)"), flex: 1, padding: 30, display: "flex", flexDirection: "column" }}>
                <div style={s.lbl}>Prossimo avversario</div>
                <div style={{ ...s.orb(20), color: "var(--rb)", marginBottom: 6 }}>{g.bossOrder?.[g.floor - 1]?.name}</div>
                <div style={{ fontSize: 14, color: RACES[g.bossOrder?.[g.floor - 1]?.clan]?.color, marginBottom: 4 }}>
                  {RACES[g.bossOrder?.[g.floor - 1]?.clan]?.emoji} {RACES[g.bossOrder?.[g.floor - 1]?.clan]?.name}
                </div>
                <div style={{ ...s.ft, fontSize: 12, fontStyle: "italic", marginBottom: 20, lineHeight: 1.5 }}>"{g.bossOrder?.[g.floor - 1]?.quote}"</div>
                <div style={{ ...s.ft, fontSize: 11, marginBottom: 30 }}>{g.bossOrder?.[g.floor - 1]?.desc}</div>
                <div style={{ flex: 1 }} />
                <button className="btn-hover" onClick={startBoss} style={s.btnBig("var(--rb)")}>
                  Affronta il Boss
                </button>
              </div>

              {/* Right: Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, maxWidth: 400 }}>
                <button className="btn-hover fiR" onClick={() => setSubView("team")} style={{
                  ...s.panel, padding: "24px 30px", border: "1px solid var(--gn)44", cursor: "pointer", textAlign: "left",
                  background: "linear-gradient(135deg, rgba(58,139,90,0.08) 0%, transparent 100%)",
                }}>
                  <div style={{ ...s.orb(14), color: "var(--gn)", marginBottom: 6 }}>Il Mio Team</div>
                  <div style={{ fontSize: 11, color: "var(--txd)" }}>Campo: {g.field.map(p => p.name).join(", ")}</div>
                  <div style={{ fontSize: 10, color: "var(--txf)", marginTop: 2 }}>Panchina: {g.bench.length > 0 ? g.bench.map(p => p.name).join(", ") : "—"}</div>
                </button>

                <button className="btn-hover fiR" onClick={() => enterShop("gym")} style={{
                  ...s.panel, padding: "20px 30px", border: "1px solid var(--gd)33", cursor: "pointer", textAlign: "left",
                  background: "linear-gradient(135deg, rgba(201,168,76,0.06) 0%, transparent 100%)", animationDelay: ".1s",
                }}>
                  <div style={{ ...s.orb(12), color: "var(--gd)", marginBottom: 4 }}>Shops</div>
                  <div style={{ fontSize: 10, color: "var(--txd)" }}>Gym · Negozio Vestiti · Coach Training</div>
                </button>

                {/* Log */}
                <div className="fiR" style={{ ...s.panel, padding: 16, flex: 1, overflow: "hidden", animationDelay: ".2s", borderColor: "var(--bd)", minHeight: 80 }}>
                  <div style={s.lbl}>Log</div>
                  <div style={{ maxHeight: 120, overflowY: "auto" }}>
                    {g.log.slice(-8).map((l, i) => <div key={i} style={{ fontSize: 10, color: "var(--txf)", marginBottom: 2 }}>{l}</div>)}
                  </div>
                </div>
              </div>
            </div>}

            {/* ── TEAM subview ── */}
            {subView === "team" && <div className="fi" style={{ display: "flex", gap: 24, width: "100%", maxWidth: 1400, maxHeight: "calc(100vh - 100px)", overflow: "hidden" }}>
              {/* Left: Field & Bench */}
              <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", padding: "0 4px 4px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ ...s.orb(16), color: "var(--gn)" }}>Il Mio Team</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-hover" onClick={() => setSubView("strategy")} style={s.hdrBtn(false, "var(--pp)")}>
                      Strategie
                    </button>
                    <button className="btn-hover" onClick={() => setSubView(null)} style={s.btn(0)}>← Piano</button>
                  </div>
                </div>

                <div style={s.lbl}>Campo (3)</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {g.field.map((p, i) => (
                    <div key={p.id} className="fi" style={{ display: "flex", alignItems: "center", gap: 10, animationDelay: `${i * .06}s` }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <button className="btn-hover" onClick={() => swap(i, -1)} disabled={i === 0} style={i === 0 ? { ...s.dis, padding: "2px 8px", fontSize: 10 } : { ...s.btn(0), padding: "2px 8px", fontSize: 10 }}>▲</button>
                        <button className="btn-hover" onClick={() => swap(i, 1)} disabled={i === g.field.length - 1} style={i === g.field.length - 1 ? { ...s.dis, padding: "2px 8px", fontSize: 10 } : { ...s.btn(0), padding: "2px 8px", fontSize: 10 }}>▼</button>
                      </div>
                      <span style={{ ...s.ft, ...s.orb(12), minWidth: 24 }}>#{i + 1}</span>
                      <div style={{ flex: 1 }}><PC p={p} /></div>
                      <button className="btn-hover" onClick={() => toBench(i)} disabled={g.field.length <= 1} style={g.field.length <= 1 ? { ...s.dis, padding: "4px 10px" } : { ...s.btn(0, "var(--rb)"), padding: "4px 10px" }}>✕</button>
                    </div>
                  ))}
                </div>

                <div style={s.lbl}>Panchina ({g.bench.length})</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {g.bench.map(p => <PC key={p.id} p={p} mini onClick={() => toField(p.id)} />)}
                  {g.bench.length === 0 && <span style={s.ft}>Vuota</span>}
                </div>

                {/* Sell section */}
                <div style={{ marginTop: 8 }}>
                  <div style={s.lbl}>Vendi</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {g.roster.map((p, i) => (
                      <button key={p.id} className="btn-hover" onClick={() => sellP(i)} disabled={g.roster.length <= 3}
                        style={g.roster.length <= 3 ? { ...s.dis, fontSize: 10, padding: "4px 10px" } : { ...s.btn(0, "var(--gd)"), fontSize: 10, padding: "4px 10px" }}>
                        {p.name} +{RARITIES[p.rarity].sell}◆
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>}

            {/* ── STRATEGY subview ── */}
            {subView === "strategy" && <div className="fi" style={{ width: "100%", maxWidth: 1400, maxHeight: "calc(100vh - 100px)", overflow: "auto", padding: "0 4px 4px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ ...s.orb(16), color: "var(--pp)" }}>Strategie</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-hover" onClick={() => setSubView("team")} style={s.btn(0)}>← Team</button>
                  <button className="btn-hover" onClick={() => setSubView(null)} style={s.btn(0)}>← Piano</button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 24 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ ...s.lbl, color: "var(--rb)" }}>Attacco ({g.atkStrategies.length}) — prime 5 attive</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {g.atkStrategies.map((st, i) => (
                      <div key={st.id + "ea" + i} className="fi" style={{ display: "flex", alignItems: "center", gap: 6, opacity: i >= 5 ? 0.4 : 1, animationDelay: `${i * .04}s` }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <button className="btn-hover" onClick={() => swapStrat("atk", i, -1)} disabled={i === 0} style={i === 0 ? { ...s.dis, padding: "1px 6px", fontSize: 9 } : { ...s.btn(0), padding: "1px 6px", fontSize: 9 }}>▲</button>
                          <button className="btn-hover" onClick={() => swapStrat("atk", i, 1)} disabled={i === g.atkStrategies.length - 1} style={i === g.atkStrategies.length - 1 ? { ...s.dis, padding: "1px 6px", fontSize: 9 } : { ...s.btn(0), padding: "1px 6px", fontSize: 9 }}>▼</button>
                        </div>
                        <span style={{ ...s.ft, ...s.orb(10), minWidth: 18 }}>{i < 5 ? `${i + 1}` : "·"}</span>
                        <div style={{ flex: 1 }}><SC st={st} tp="atk" /></div>
                        {g.atkStrategies.length > 5 && <button className="btn-hover" onClick={() => removeStrat("atk", i)} style={{ ...s.btn(0, "var(--rb)"), padding: "2px 8px", fontSize: 9 }}>✕</button>}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ ...s.lbl, color: "var(--bl)" }}>Difesa ({g.defStrategies.length}) — prime 5 attive</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {g.defStrategies.map((st, i) => (
                      <div key={st.id + "ed" + i} className="fi" style={{ display: "flex", alignItems: "center", gap: 6, opacity: i >= 5 ? 0.4 : 1, animationDelay: `${i * .04}s` }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <button className="btn-hover" onClick={() => swapStrat("def", i, -1)} disabled={i === 0} style={i === 0 ? { ...s.dis, padding: "1px 6px", fontSize: 9 } : { ...s.btn(0), padding: "1px 6px", fontSize: 9 }}>▲</button>
                          <button className="btn-hover" onClick={() => swapStrat("def", i, 1)} disabled={i === g.defStrategies.length - 1} style={i === g.defStrategies.length - 1 ? { ...s.dis, padding: "1px 6px", fontSize: 9 } : { ...s.btn(0), padding: "1px 6px", fontSize: 9 }}>▼</button>
                        </div>
                        <span style={{ ...s.ft, ...s.orb(10), minWidth: 18 }}>{i < 5 ? `${i + 1}` : "·"}</span>
                        <div style={{ flex: 1 }}><SC st={st} tp="def" /></div>
                        {g.defStrategies.length > 5 && <button className="btn-hover" onClick={() => removeStrat("def", i)} style={{ ...s.btn(0, "var(--bl)"), padding: "2px 8px", fontSize: 9 }}>✕</button>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>}

            {/* ── SHOPS subview ── */}
            {subView === "shops" && <div className="fi" style={{ width: "100%", maxWidth: 1200, maxHeight: "calc(100vh - 100px)", overflow: "auto", padding: "0 4px 4px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ ...s.orb(16), color: shopTab === "gym" ? "var(--gn)" : shopTab === "gear" ? "var(--bl)" : "var(--pp)" }}>
                  {shopTab === "gym" ? "Gym — Giocatori" : shopTab === "gear" ? "Negozio Vestiti" : "Coach Training"}
                </div>
                <button className="btn-hover" onClick={() => { setSubView(null); setGT(null); }} style={s.btn(0)}>← Piano</button>
              </div>

              {/* Shop tabs */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <button className="btn-hover" onClick={() => { setShopTab("gym"); setGT(null); }} style={s.hdrBtn(shopTab === "gym", "var(--gn)")}>Gym</button>
                <button className="btn-hover" onClick={() => { setShopTab("gear"); setGT(null); }} style={s.hdrBtn(shopTab === "gear", "var(--bl)")}>Negozio</button>
                <button className="btn-hover" onClick={() => { setShopTab("strategies"); setGT(null); }} style={s.hdrBtn(shopTab === "strategies", "var(--pp)")}>Coach</button>
              </div>

              {/* Equip prompt */}
              {gT && <div style={{ ...s.panel, padding: 16, marginBottom: 16, borderColor: "var(--bl)" }}>
                <span style={{ ...s.lbl, color: "var(--bl)" }}>Equipaggia {gT.gear.name}</span>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {g.roster.map((p, i) => <button key={p.id} className="btn-hover" onClick={() => equipTo(i)} style={s.btn(0, "var(--bl)")}>{p.name} ({p.equippedGear?.length || 0}g)</button>)}
                  <button className="btn-hover" onClick={() => setGT(null)} style={s.btn(0)}>✕ Annulla</button>
                </div>
              </div>}

              {/* Shop items grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
                {(g.shops?.[shopTab] || []).map((it, i) => (
                  <div key={it.id + i} className="fi" style={{ ...s.panel, padding: 16, display: "flex", flexDirection: "column", gap: 8, animationDelay: `${i * .05}s` }}>
                    <div style={{ flex: 1 }}>
                      {shopTab === "gym" ? <PC p={it} mini /> : shopTab === "gear" ? <GearCard g={it} /> : <SC st={it} tp={it.stratType} />}
                    </div>
                    <button className="btn-hover"
                      onClick={() => shopTab === "gym" ? buyPlayer(it) : shopTab === "gear" ? buyGear(it) : buySt(it)}
                      disabled={g.gold < it.price}
                      style={g.gold < it.price ? { ...s.dis, width: "100%" } : { ...s.btn(1), width: "100%" }}>
                      Compra — {it.price}◆
                    </button>
                  </div>
                ))}
              </div>
            </div>}
          </div>
        </>}

        {/* ═══════════ PREMATCH ═══════════ */}
        {g.phase === "prematch" && <>
          <div style={s.hdr}>
            <img src={IMAGES.logo} alt="" style={{ height: 36, objectFit: "contain" }} />
            <div style={{ flex: 1 }} />
            <span style={{ ...s.orb(12), color: "var(--gd)" }}>◆ {g.gold}</span>
            <span style={{ ...s.orb(11), color: "var(--txd)" }}>Piano {g.floor}/6</span>
          </div>
          <div style={{ flex: 1, display: "flex", gap: 24, padding: "20px 40px", overflow: "hidden" }}>
            {/* Left: Enemy */}
            <div className="fiL" style={{ flex: 1, ...s.panel, ...s.panelGlow("var(--rb)"), padding: 24, overflowY: "auto" }}>
              <div style={{ ...s.orb(18), color: "var(--rb)", marginBottom: 4 }}>{g.boss.label}</div>
              <div style={{ fontSize: 12, color: RACES[g.boss.clan]?.color, marginBottom: 4 }}>{RACES[g.boss.clan]?.emoji} {RACES[g.boss.clan]?.name}</div>
              <div style={{ ...s.ft, fontSize: 11, fontStyle: "italic", marginBottom: 16 }}>"{g.boss.quote}"</div>
              <div style={s.lbl}>Campo avversario</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>{g.boss.field.map(p => <PC key={p.id} p={p} mini />)}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{g.boss.bench.map(p => <PC key={p.id} p={p} mini />)}</div>
              <div style={{ ...s.ft, fontSize: 10, fontStyle: "italic", marginTop: 12 }}>Strategie nascoste...</div>
            </div>

            {/* Right: Your team */}
            <div className="fiR" style={{ flex: 1, ...s.panel, ...s.panelGlow("var(--gd)"), padding: 24, overflowY: "auto", display: "flex", flexDirection: "column" }}>
              <div style={{ ...s.orb(16), color: "var(--gd)", marginBottom: 12 }}>Coach Vega</div>
              <div style={s.lbl}>Campo</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {g.field.map((p, i) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <button className="btn-hover" onClick={() => swap(i, -1)} disabled={i === 0} style={i === 0 ? { ...s.dis, padding: "1px 6px", fontSize: 9 } : { ...s.btn(0), padding: "1px 6px", fontSize: 9 }}>▲</button>
                      <button className="btn-hover" onClick={() => swap(i, 1)} disabled={i === g.field.length - 1} style={i === g.field.length - 1 ? { ...s.dis, padding: "1px 6px", fontSize: 9 } : { ...s.btn(0), padding: "1px 6px", fontSize: 9 }}>▼</button>
                    </div>
                    <span style={{ ...s.ft, ...s.orb(11), minWidth: 20 }}>#{i + 1}</span>
                    <div style={{ flex: 1 }}><PC p={p} /></div>
                    <button className="btn-hover" onClick={() => toBench(i)} disabled={g.field.length <= 1} style={g.field.length <= 1 ? { ...s.dis, padding: "3px 8px" } : { ...s.btn(0, "var(--rb)"), padding: "3px 8px" }}>✕</button>
                  </div>
                ))}
              </div>
              <div style={s.lbl}>Panchina</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                {g.bench.map(p => <PC key={p.id} p={p} mini onClick={() => toField(p.id)} />)}
                {g.bench.length === 0 && <span style={s.ft}>—</span>}
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-hover" onClick={() => up({ phase: "explore", boss: null })} style={s.btn(0)}>← Piano</button>
                <button className="btn-hover" onClick={play} disabled={g.field.length < 3}
                  style={g.field.length < 3 ? { ...s.dis, flex: 1 } : { ...s.btnBig("var(--gd)"), flex: 1 }}>
                  GIOCA
                </button>
              </div>
            </div>
          </div>
        </>}

        {/* ═══════════ RESULT ═══════════ */}
        {g.phase === "result" && g.matchResult && <>
          <div style={s.hdr}>
            <img src={IMAGES.logo} alt="" style={{ height: 36, objectFit: "contain" }} />
            <div style={{ flex: 1 }} />
            <span style={{ ...s.orb(12), color: "var(--gd)" }}>◆ {g.gold}</span>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 40px", overflow: "auto" }}>
            {/* Scoreboard */}
            <div className="fi" style={{ ...s.panel, ...s.panelGlow(g.matchResult.winner === 1 ? "var(--gd)" : "var(--rb)"), display: "flex", alignItems: "center", gap: 40, padding: "30px 60px", marginBottom: 20 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ ...s.lbl, color: "var(--gd)" }}>Coach Vega</div>
                <div style={{ ...s.orb(54), color: g.matchResult.winner === 1 ? "var(--gd)" : "var(--txf)" }}>{g.matchResult.score1}</div>
              </div>
              <div style={{ ...s.ft, fontSize: 24, ...s.orb(24) }}>—</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ ...s.lbl, color: "var(--rb)" }}>Boss</div>
                <div style={{ ...s.orb(54), color: g.matchResult.winner === 2 ? "var(--rb)" : "var(--txf)" }}>{g.matchResult.score2}</div>
              </div>
            </div>

            {g.matchResult.suddenDeath && <div style={{ ...s.gd, ...s.orb(12), letterSpacing: 4, marginBottom: 8 }}>SUDDEN DEATH</div>}
            <div style={{ ...s.orb(20), letterSpacing: 4, marginBottom: 8, color: g.matchResult.winner === 1 ? "var(--gd)" : "var(--rb)" }}>
              {g.matchResult.winner === 1 ? "VITTORIA" : "SCONFITTA"}
            </div>
            {g.matchResult.winner === 1 && <div style={{ ...s.gd, fontSize: 14, marginBottom: 16 }}>+{g.matchResult.goldEarned}◆</div>}

            {/* Rounds */}
            <div style={{ width: "100%", maxWidth: 800, marginBottom: 20 }}>
              {g.matchResult.rounds.map((r, i) => (
                <div key={i} className="fi" style={{ marginBottom: 3, borderRadius: 4, overflow: "hidden", border: "1px solid var(--bd)", animationDelay: `${i * .04}s` }}>
                  <div onClick={() => setOR(oR === i ? null : i)} style={{
                    padding: "8px 16px", cursor: "pointer", fontSize: 11, display: "flex", justifyContent: "space-between",
                    background: r.scored ? (r.attacker === 1 ? "rgba(201,168,76,0.06)" : "rgba(196,91,91,0.06)") : "transparent",
                  }}>
                    <span>{r.suddenDeath ? "◆ " : ""}{r.attacker === 1 ? "▸" : "◂"} R{i + 1}{r.scored ? " — PUNTO" : ""}{r.corruption ? ` — ${r.corruption.name} corrotto` : ""}{r.injury ? ` — ${r.injury.name} infortunato` : ""}</span>
                    <span style={s.ft}>{oR === i ? "−" : "+"}</span>
                  </div>
                  {oR === i && <div style={{ padding: "6px 16px", background: "var(--bg)" }}>
                    {r.log.map((l, j) => <div key={j} style={{ fontSize: 10, marginBottom: 2, color: l.includes("PUNTO") ? "var(--gd)" : l.includes("Intercetto") || l.includes("Difeso") ? "var(--rb)" : l.includes("corrotto") || l.includes("infortunato") ? "var(--gd)" : "var(--txd)" }}>{l}</div>)}
                  </div>}
                </div>
              ))}
            </div>

            <button className="btn-hover" onClick={after} style={s.btnBig(g.matchResult.winner === 1 ? "var(--gd)" : "var(--rb)")}>
              {g.matchResult.winner === 1 ? (g.floor >= 6 ? "COMPLETA" : `PIANO ${g.floor + 1}`) : "FINE"}
            </button>
          </div>
        </>}

      </div>
    </div>
  );
}

