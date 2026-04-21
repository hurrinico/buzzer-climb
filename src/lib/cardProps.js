// Mapper helpers: entità di gioco → props per <CardFrame />
// Centralizza triggerZoom + normalizza shape dati (Fase 1b T-1b.9)
import { RARITIES } from "../data/constants";
import { triggerZoom } from "./zoom";

export function playerToCardProps(p, opts = {}) {
  const { type = "player", size, onClick, selected } = opts;
  const traits = [p.trait1, p.trait2].filter(Boolean);
  return {
    type,
    rarity: p.rarity,
    race: p.race,
    title: p.name,
    traits,
    stats: [
      { label: "ATK", value: RARITIES[p.atkDie]?.label || p.atkDie, color: "var(--rb)" },
      { label: "DEF", value: RARITIES[p.defDie]?.label || p.defDie, color: "var(--bl)" },
      { label: "L", value: p.loyalty, color: "var(--txd)" },
    ],
    equipped: p.equippedGear || [],
    size,
    onClick,
    selected,
    onMouseEnter: () => triggerZoom("player", p),
    onMouseLeave: () => triggerZoom(null),
  };
}

export function strategyToCardProps(st, tp, opts = {}) {
  const { size } = opts;
  const isSig = typeof st.desc === "string" && st.desc.startsWith("FIRMA");
  const desc = isSig ? st.desc.replace(/^FIRMA[.\s]*/, "") : st.desc;
  return {
    type: "strategy",
    rarity: st.rarity,
    race: st.race,
    title: st.name,
    desc,
    stratType: tp,
    signature: isSig,
    size,
    onMouseEnter: () => triggerZoom("strat", st, tp),
    onMouseLeave: () => triggerZoom(null),
  };
}

export function gearToCardProps(g, opts = {}) {
  const { size } = opts;
  return {
    type: "gear",
    rarity: g.rarity,
    title: g.name,
    desc: g.desc,
    size,
    onMouseEnter: () => triggerZoom("gear", g),
    onMouseLeave: () => triggerZoom(null),
  };
}
