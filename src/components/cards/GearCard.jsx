import { RARITIES } from "../../data/constants";
import { triggerZoom } from "../../lib/zoom";

export default function GearCard({ g: gear }) {
  const ra = RARITIES[gear.rarity];
  const s = {
    card: (c) => ({
      background: "var(--cd)",
      border: `1px solid ${c || "var(--bd)"}`,
      borderRadius: 6,
      padding: 12,
      transition: "all .25s",
    }),
  };
  return (
    <div
      onMouseEnter={() => triggerZoom("gear", gear)}
      onMouseLeave={() => triggerZoom(null)}
      style={{ ...s.card(ra.color + "44"), minWidth: 160 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: ra.color }}>{gear.name}</span>
        <span style={{ fontSize: 9, color: ra.color, letterSpacing: 1, textTransform: "uppercase" }}>{ra.name}</span>
      </div>
      <div style={{ fontSize: 11, color: "var(--txd)" }}>{gear.desc}</div>
    </div>
  );
}
