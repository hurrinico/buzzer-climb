import { RACES, RARITIES, FLOOR_RARITY, SHOP_RARITY } from "../data/constants";
import { HUMAN_PLAYERS, HUMAN_ATK, HUMAN_DEF } from "../data/humans";
import { CLAN_DATA } from "../data/clans";

// ============================================================
// RARITY PICKERS
// ============================================================
export const pickRarity = (floor) => {
  const w = FLOOR_RARITY[floor] || FLOOR_RARITY[1];
  const tot = Object.values(w).reduce((a, b) => a + b, 0);
  let r = Math.random() * tot;
  for (const [k, v] of Object.entries(w)) {
    r -= v;
    if (r <= 0) return k;
  }
  return "COMMON";
};

export const pickShopRarity = (floor) => {
  const w = SHOP_RARITY[floor] || SHOP_RARITY[1];
  const tot = Object.values(w).reduce((a, b) => a + b, 0);
  let r = Math.random() * tot;
  for (const [k, v] of Object.entries(w)) {
    r -= v;
    if (r <= 0) return k;
  }
  return "COMMON";
};

// ============================================================
// BOSS & SHOP v2 — CLAN-BASED
// ============================================================
export function initRun() {
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
  const hc = HUMAN_PLAYERS.filter((p) => p.rarity === "COMMON");
  const sp = hc
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .map((p) => ({ ...p, equippedGear: [] }));

  // Starting strategies: common human
  const aS = HUMAN_ATK.filter((s) => s.rarity === "COMMON")
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);
  while (aS.length < 5) aS.push({ ...HUMAN_ATK[0], id: HUMAN_ATK[0].id + "_" + aS.length });
  const dS = HUMAN_DEF.filter((s) => s.rarity === "COMMON")
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);
  while (dS.length < 5) dS.push({ ...HUMAN_DEF[0], id: HUMAN_DEF[0].id + "_" + dS.length });

  const shops = {
    gym: genShop("gym", 1, activeClans),
    gear: genShop("gear", 1, activeClans),
    strategies: genShop("strategies", 1, activeClans),
  };
  const clanNames = activeClans.map((c) => RACES[c].emoji + " " + RACES[c].name).join(", ");

  return {
    floor: 1,
    gold: 3,
    phase: "explore",
    roster: sp,
    field: sp.slice(0, 3),
    bench: sp.slice(3, 5),
    atkStrategies: aS,
    defStrategies: dS,
    shops,
    shopType: null,
    boss: null,
    matchResult: null,
    activeClans,
    bossOrder,
    whDone: { easy: false, hard: false, rtd: false },
    log: [`La torre ti attende, Coach Vega.`, `Clan attivi: ${clanNames}`],
  };
}

export function genBoss(floor, gameState) {
  const bossInfo = gameState.bossOrder[floor - 1];
  const clan = CLAN_DATA[bossInfo.clan];
  const clanRace = bossInfo.clan;

  // Pick players from clan pool based on floor rarity
  const pool = [...clan.players];
  const pickPlayer = () => {
    const r = pickRarity(floor);
    const candidates = pool.filter((p) => p.rarity === r);
    const pick = candidates.length
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : pool[Math.floor(Math.random() * pool.length)];
    pool.splice(pool.indexOf(pick), 1);
    return { ...pick, equippedGear: [] };
  };
  const field = [pickPlayer(), pickPlayer(), pickPlayer()];
  const bench = [pickPlayer(), pickPlayer()];

  // Pick strategies — signature always in slot 0
  const sigId = bossInfo.signatureStrat;
  const sigAtk = clan.atkStrategies.find((s) => s.id === sigId);
  const sigDef = clan.defStrategies.find((s) => s.id === sigId);

  const pickStrats = (stratPool, count, exclude) => {
    const available = stratPool.filter((s) => s.id !== exclude);
    const picked = [];
    for (let i = 0; i < count; i++) {
      const r = pickRarity(floor);
      const candidates = available.filter((s) => s.rarity === r && !picked.find((p) => p.id === s.id));
      const s = candidates.length
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : available.filter((s2) => !picked.find((p) => p.id === s2.id))[0];
      if (s) picked.push(s);
    }
    // Fill with commons if needed
    while (picked.length < count) {
      const fill = stratPool.find((s) => !picked.find((p) => p.id === s.id) && s.rarity === "COMMON") || stratPool[0];
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
    defStrats = sigDef
      ? [sigDef, ...pickStrats(clan.defStrategies, 4, sigId)]
      : pickStrats(clan.defStrategies, 5, null);
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
    field,
    bench,
    atkStrategies: atkStrats.slice(0, 5),
    defStrategies: defStrats.slice(0, 5),
  };
}

export function genShop(type, floor, activeClans) {
  const n = 3 + Math.min(floor, 3);
  const items = [];

  if (type === "gym") {
    // Pool: human players + all active clan players
    const pool = [...HUMAN_PLAYERS];
    for (const ck of activeClans) pool.push(...CLAN_DATA[ck].players);
    const shuffled = pool.sort(() => Math.random() - 0.5);
    for (let i = 0; i < n && i < shuffled.length; i++) {
      const r = pickShopRarity(floor);
      const m =
        shuffled.find((p) => p.rarity === r && !items.find((x) => x.id === p.id)) ||
        shuffled.find((p) => !items.find((x) => x.id === p.id));
      if (m && !items.find((x) => x.id === m.id)) items.push({ ...m, equippedGear: [], price: RARITIES[m.rarity].buy });
    }
  } else if (type === "gear") {
    const pool = [];
    for (const ck of activeClans) pool.push(...CLAN_DATA[ck].gear);
    const shuffled = pool.sort(() => Math.random() - 0.5);
    for (let i = 0; i < n && i < shuffled.length; i++) {
      const r = pickShopRarity(floor);
      const m =
        shuffled.find((g) => g.rarity === r && !items.find((x) => x.id === g.id)) ||
        shuffled.find((g) => !items.find((x) => x.id === g.id));
      if (m && !items.find((x) => x.id === m.id)) items.push({ ...m, price: RARITIES[m.rarity].buy });
    }
  } else {
    // Strategies: human + all active clans
    const allAtk = [...HUMAN_ATK];
    const allDef = [...HUMAN_DEF];
    for (const ck of activeClans) {
      allAtk.push(...CLAN_DATA[ck].atkStrategies);
      allDef.push(...CLAN_DATA[ck].defStrategies);
    }
    const all = [
      ...allAtk.map((s) => ({ ...s, stratType: "atk" })),
      ...allDef.map((s) => ({ ...s, stratType: "def" })),
    ].sort(() => Math.random() - 0.5);
    // Filter out boss signature strats from shop
    const filtered = all.filter((s) => !s.id.includes("_sig"));
    for (let i = 0; i < n && i < filtered.length; i++) {
      const r = pickShopRarity(floor);
      const m =
        filtered.find((s) => s.rarity === r && !items.find((x) => x.id === s.id)) ||
        filtered.find((s) => !items.find((x) => x.id === s.id));
      if (m && !items.find((x) => x.id === m.id)) items.push({ ...m, price: RARITIES[m.rarity].buy });
    }
  }
  return items;
}
