import { RACES, RARITIES } from "../../data/constants";
import { triggerZoom } from "../../lib/zoom";

export default function PC({ p, mini, onClick, selected }) {
  const rc = RACES[p.race];
  const ra = RARITIES[p.rarity];
  const s = {
    card: (c) => ({
      background: "var(--cd)",
      border: `1px solid ${c || "var(--bd)"}`,
      borderRadius: 6,
      padding: 12,
      transition: "all .25s",
    }),
    rd: { color: "var(--rb)" },
    dm: { color: "var(--txd)" },
  };
  return (
    <div
      onClick={onClick}
      className="btn-hover"
      onMouseEnter={() => triggerZoom("player", p)}
      onMouseLeave={() => triggerZoom(null)}
      style={{
        ...s.card(selected ? "var(--gd)" : ra.color + "55"),
        minWidth: mini ? 140 : 200,
        maxWidth: mini ? 180 : 280,
        cursor: onClick ? "pointer" : "default",
        boxShadow: selected ? "0 0 12px var(--gd)33" : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontWeight: 700, fontSize: mini ? 11 : 14, color: "#d0d0d8" }}>
          {rc.emoji} {p.name}
        </span>
        <span style={{ fontSize: 9, color: ra.color, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
          {ra.name}
        </span>
      </div>
      <div style={{ fontSize: 10, color: rc.color, marginBottom: 2 }}>{rc.name}</div>
      <div style={{ fontSize: 10, color: "var(--txf)" }}>
        {p.trait1} · {p.trait2}
      </div>
      <div style={{ display: "flex", gap: 10, fontSize: 11, marginTop: 5 }}>
        <span style={s.rd}>ATK {RARITIES[p.atkDie].label}</span>
        <span style={{ color: "var(--bl)" }}>DEF {RARITIES[p.defDie].label}</span>
        <span style={s.dm}>L{p.loyalty}</span>
      </div>
      {p.equippedGear?.length > 0 && (
        <div style={{ marginTop: 5, display: "flex", gap: 3, flexWrap: "wrap" }}>
          {p.equippedGear.map((g, i) => (
            <span
              key={i}
              style={{
                fontSize: 9,
                background: "var(--bl)22",
                border: "1px solid var(--bl)33",
                borderRadius: 3,
                padding: "1px 6px",
                color: "#7B9EC4",
              }}
            >
              {g.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
