// ============================================================
// GAME CONSTANTS
// ============================================================
export const RACES = {
  HUMAN: { name: "Umani", emoji: "👤", color: "#7B9EC4" },
  ORC: { name: "Orchi", emoji: "💀", color: "#C45B5B" },
  INSECTOID: { name: "Insettidi", emoji: "🐛", color: "#5BC47B" },
  FELINE: { name: "Felidi", emoji: "🐱", color: "#C4A85B" },
  GOLEM: { name: "Cristallini", emoji: "💎", color: "#7BB8C4" },
  PHANTOM: { name: "Ombre", emoji: "👻", color: "#A07BC4" },
};

export const RARITIES = {
  COMMON: { name: "Comune", die: 4, color: "#5a5a68", label: "d4", buy: 3, sell: 1 },
  UNCOMMON: { name: "Non Comune", die: 6, color: "#7B9EC4", label: "d6", buy: 5, sell: 2 },
  RARE: { name: "Rara", die: 8, color: "#9B7BC4", label: "d8", buy: 8, sell: 4 },
  EPIC: { name: "Epica", die: 10, color: "#C4A85B", label: "d10", buy: 12, sell: 6 },
  LEGENDARY: { name: "Leggendaria", die: 12, color: "#C45B5B", label: "d12", buy: 18, sell: 9 },
};

// Floor rarity weights
export const FLOOR_RARITY = {
  1: { COMMON: 100, UNCOMMON: 0, RARE: 0, LEGENDARY: 0 },
  2: { COMMON: 70, UNCOMMON: 25, RARE: 5, LEGENDARY: 0 },
  3: { COMMON: 50, UNCOMMON: 35, RARE: 15, LEGENDARY: 0 },
  4: { COMMON: 30, UNCOMMON: 40, RARE: 30, LEGENDARY: 0 },
  5: { COMMON: 15, UNCOMMON: 30, RARE: 40, LEGENDARY: 15 },
  6: { COMMON: 5, UNCOMMON: 20, RARE: 40, LEGENDARY: 35 },
};

// Shop drops: ~1 piano avanti rispetto ai boss
export const SHOP_RARITY = {
  1: { COMMON: 65, UNCOMMON: 28, RARE: 7, LEGENDARY: 0 },
  2: { COMMON: 45, UNCOMMON: 35, RARE: 18, LEGENDARY: 2 },
  3: { COMMON: 28, UNCOMMON: 38, RARE: 28, LEGENDARY: 6 },
  4: { COMMON: 15, UNCOMMON: 33, RARE: 38, LEGENDARY: 14 },
  5: { COMMON: 8, UNCOMMON: 22, RARE: 42, LEGENDARY: 28 },
  6: { COMMON: 3, UNCOMMON: 15, RARE: 40, LEGENDARY: 42 },
};
