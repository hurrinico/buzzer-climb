// Asset paths & per-floor configuration
// Extracted from App.jsx during Fase 0 refactor

export const IMAGES = {
  logo: "/BuzzerClimbLogo.png",
  home: "/home_bg.png",
  floor1: "/floor1_bg.png",
  floor2: "/floor2_bg.png",
  floor3: "/floor3_bg.png",
  floor4: "/floor4_bg.png",
  floor5: "/floor5_bg.png",
  floor6: "/floor6_bg.png",
  bg: "/floor1_bg.png",
  vega: "/vega.png",
  drava: "/drava.png",
};

export const FLOOR_BG = {
  1: IMAGES.floor1,
  2: IMAGES.floor2,
  3: IMAGES.floor3,
  4: IMAGES.floor4,
  5: IMAGES.floor5,
  6: IMAGES.floor6,
};

export const COURT_BG = {
  1: "/court1.png",
  2: "/court2.png",
  3: "/court3.png",
  4: "/court4.png",
  5: "/court5.png",
  6: "/court6.png",
};

// ============================================================
// WORK HARD — SFIDE PER PIANO
// ============================================================
export const WH_NPCS = [
  {
    id: "whn1",
    name: "Bot-1",
    quote: "Protocollo di addestramento attivato.",
    desc: "Androide da palestra. Prevedibile, ma utile.",
    die: 4,
    img: "/Bot1.png",
    floor: 1,
  },
  {
    id: "whn2",
    name: "Knuckle",
    quote: "Nessuno mi ha mai fermato in strada.",
    desc: "Orco veterano di campetti illegali. Ruvido.",
    die: 4,
    img: "/Knuckle.png",
    floor: 2,
  },
  {
    id: "whn3",
    name: "Tzik",
    quote: "*clicca le mandibole* Muoviti.",
    desc: "Insettide con riflessi istantanei. Velocissimo.",
    die: 6,
    img: "/tzik.png",
    floor: 3,
  },
  {
    id: "whn4",
    name: "Kess",
    quote: "Ogni mossa che fai l'ho già vista.",
    desc: "Felide di alto rango. Tecnica sopraffina.",
    die: 6,
    img: "/kess.png",
    floor: 4,
  },
  {
    id: "whn5",
    name: "Crag",
    quote: "Non sento il dolore. Tu sì.",
    desc: "Golem antico. Lento ma immovibile come la pietra.",
    die: 8,
    img: "/crag.png",
    floor: 5,
  },
  {
    id: "whn6",
    name: "Null",
    quote: "Ho già visto la tua prossima mossa.",
    desc: "Phantom d'élite. Anticipa ogni azione prima che accada.",
    die: 8,
    img: "/null.png",
    floor: 6,
  },
];

export const CROUPIER = {
  name: "Zax-7",
  quote: "La probabilità è crudele con gli stolti.",
  desc: "Croupier cyborg con occhi di cristallo. Gestisce il tavolo del rischio nell'arena sotterranea.",
  img: "/Zax-7.png",
};
export const BRAVACCIO = {
  name: "Il Toro",
  quote: "Nessuno mi ha mai battuto al dado. Nessuno.",
  desc: "Sbruffone monumentale. Muscoli, catene d'oro, ego cosmico.",
  img: "/bravaccio.png",
};
export const DIE_TIERS = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"];

// Particle data generata una volta sola a livello modulo (posizioni fisse per sessione)
export const _pData = (() => {
  const d = {};
  for (let f = 1; f <= 6; f++) {
    d[f] = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      bottom: Math.random() * 65,
      size: 2 + Math.random() * 7,
      dur: 5 + Math.random() * 10,
      delay: -(Math.random() * 12),
      drift: (Math.random() - 0.5) * 60,
    }));
  }
  return d;
})();

export const FLOOR_PARTICLE = {
  1: { type: "embers", colors: ["#FFB347", "#FF8C00", "#FFD700", "#FF6600"] },
  2: { type: "steam", colors: ["rgba(255,200,160,0.7)", "rgba(255,140,80,0.5)", "rgba(255,255,220,0.4)"] },
  3: { type: "spores", colors: ["#40E0D0", "#00FF7F", "#7FFFAA", "#20B2AA"] },
  4: { type: "dust", colors: ["#DA70D6", "#BA55D3", "#FF69B4", "#FFD700"] },
  5: { type: "dust", colors: ["#FFD700", "#FFF8DC", "#DAA520", "#FFFACD"] },
  6: { type: "stars", colors: ["#FFFFFF", "#B0C4FF", "#FFD700", "#E0E0FF"] },
};
