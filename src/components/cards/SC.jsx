import { RACES, RARITIES } from "../../data/constants";
import { triggerZoom } from "../../lib/zoom";

export default function SC({ st, tp, mini, extra }) {
  const rc = RACES[st.race];
  const cor = st.mechanic === "corruption";
  const ac = cor ? "var(--rd)" : tp === "atk" ? "var(--rb)" : "var(--bl)";
  const isSig = st.desc?.startsWith("FIRMA");
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
      onMouseEnter={() => triggerZoom("strat", st, tp)}
      onMouseLeave={() => triggerZoom(null)}
      style={{ ...s.card(ac + "55"), minWidth: mini ? 130 : 200, maxWidth: mini ? 180 : 300, position: "relative" }}
    >
      {isSig && (
        <div style={{ position: "absolute", top: 4, right: 6, fontSize: 8, color: "var(--gd)", letterSpacing: 1 }}>
          ★ FIRMA
        </div>
      )}
      <div style={{ fontWeight: 700, fontSize: mini ? 10 : 13, color: cor ? "var(--rb)" : "#c0c0c8" }}>
        {cor ? "◆" : tp === "atk" ? "▸" : "◂"} {st.name}
      </div>
      <div style={{ fontSize: 9, color: rc?.color || "var(--txd)" }}>
        {rc?.emoji} {rc?.name}{" "}
        <span style={{ color: RARITIES[st.rarity]?.color || "var(--txd)", marginLeft: 6 }}>
          {RARITIES[st.rarity]?.name || ""}
        </span>
      </div>
      <div style={{ fontSize: 9, color: "var(--txd)", marginTop: 3, lineHeight: 1.5 }}>{st.desc}</div>
      {extra}
    </div>
  );
}
