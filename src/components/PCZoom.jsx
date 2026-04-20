// Expanded player card for zoom panel
import { RACES, RARITIES } from "../data/constants";
import { s } from "../styles/inline";

export default function PCZoom({ p }) {
  const rc = RACES[p.race];
  const ra = RARITIES[p.rarity];
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 20, color: "#d8d8e8" }}>
          {rc.emoji} {p.name}
        </div>
        <div
          style={{
            fontSize: 10,
            color: ra.color,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginTop: 4,
          }}
        >
          {ra.name}
        </div>
      </div>
      <div style={{ fontSize: 13, color: rc.color, marginBottom: 12 }}>{rc.name}</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <div
          style={{
            padding: "7px 16px",
            background: "rgba(196,91,91,0.12)",
            border: "1px solid rgba(196,91,91,0.4)",
            borderRadius: 4,
            color: "var(--rb)",
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          ATK {RARITIES[p.atkDie].label}
        </div>
        <div
          style={{
            padding: "7px 16px",
            background: "rgba(58,90,139,0.12)",
            border: "1px solid rgba(58,90,139,0.4)",
            borderRadius: 4,
            color: "var(--bl)",
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          DEF {RARITIES[p.defDie].label}
        </div>
        <div style={{ padding: "7px 10px", color: "var(--txd)", fontSize: 12, alignSelf: "center" }}>
          Lealtà {p.loyalty}
        </div>
      </div>
      <div style={{ fontSize: 12, color: "var(--tx)", lineHeight: 1.8, marginBottom: p.equippedGear?.length ? 12 : 0 }}>
        ◈ {p.trait1}
        <br />◈ {p.trait2}
      </div>
      {p.equippedGear?.length > 0 && (
        <div style={{ borderTop: "1px solid var(--bd)", paddingTop: 10, marginTop: 2 }}>
          <span style={{ ...s.lbl, marginBottom: 6 }}>Gear equipaggiato</span>
          {p.equippedGear.map((gr, i) => (
            <div key={i} style={{ fontSize: 11, color: "#7B9EC4", marginBottom: 3 }}>
              ⚙ {gr.name} — {gr.desc}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
