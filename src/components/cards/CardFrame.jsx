// CardFrame — carta quadrata unificata (player/strategy/gear/boss)
// Fase 1b · vedi PIANO_OPERATIVO.md T-1b.2→T-1b.8
import { RACES, RARITIES } from "../../data/constants";

// Token rarità allineati a styles/variables.css
const RARITY_COLORS = {
  COMMON: "#6b6b6b",
  UNCOMMON: "#c9a961",
  RARE: "#4a7ab8",
  EPIC: "#8b5cf6",
  LEGENDARY_A: "#e0b84a",
  LEGENDARY_B: "#b83a3a",
};

// Numero di "sbarre-gabbia" per rarità
const BARS = { COMMON: 1, UNCOMMON: 2, RARE: 3, EPIC: 4, LEGENDARY: 5 };

function getRarityColor(rarity) {
  if (rarity === "LEGENDARY") return RARITY_COLORS.LEGENDARY_A;
  return RARITY_COLORS[rarity] || RARITY_COLORS.COMMON;
}

function BarsOverlay({ rarity }) {
  const count = BARS[rarity] || 1;
  const isLegendary = rarity === "LEGENDARY";
  const color = getRarityColor(rarity);
  const shimmerClass = isLegendary ? "cf-bar-legendary" : rarity === "EPIC" ? "cf-bar-epic" : "";

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 6,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "0 12px",
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={shimmerClass}
          style={{
            height: 2,
            background: isLegendary
              ? `linear-gradient(90deg, ${RARITY_COLORS.LEGENDARY_A}, ${RARITY_COLORS.LEGENDARY_B})`
              : color,
            boxShadow: rarity === "RARE" || rarity === "EPIC" || isLegendary ? `0 0 6px ${color}` : "none",
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  );
}

function Portrait({ image, rc, type, stratType, rarity, size }) {
  const color = getRarityColor(rarity);
  const isLegendary = rarity === "LEGENDARY";
  const glyph =
    rc?.emoji ||
    (type === "strategy" ? (stratType === "atk" ? "▸" : "◂") : type === "gear" ? "⚙" : "◇");

  return (
    <div
      style={{
        height: Math.round(size * 0.7),
        position: "relative",
        background: isLegendary
          ? `linear-gradient(135deg, ${RARITY_COLORS.LEGENDARY_A}22, ${RARITY_COLORS.LEGENDARY_B}22)`
          : `linear-gradient(135deg, ${color}28, transparent 70%)`,
        overflow: "hidden",
        borderBottom: `1px solid ${color}44`,
      }}
    >
      {image ? (
        <img
          src={image}
          alt=""
          className="cf-portrait"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: Math.round(size * 0.38),
            opacity: 0.4,
            filter: `drop-shadow(0 0 12px ${color}55)`,
          }}
        >
          {glyph}
        </div>
      )}
      <BarsOverlay rarity={rarity} />
    </div>
  );
}

function RarityLabel({ rarity }) {
  const color = getRarityColor(rarity);
  const label = RARITIES[rarity]?.name || rarity;
  return (
    <div
      style={{
        position: "absolute",
        top: 6,
        right: 8,
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: 1.4,
        textTransform: "uppercase",
        color,
        textShadow: "0 1px 2px rgba(0,0,0,0.85)",
        pointerEvents: "none",
      }}
    >
      {label}
    </div>
  );
}

function SignatureBadge() {
  return (
    <div
      style={{
        position: "absolute",
        top: 8,
        left: 8,
        padding: "2px 7px",
        background: "linear-gradient(135deg, var(--rarity-legendary-a), var(--rarity-legendary-b))",
        color: "#1a1008",
        fontSize: 8,
        fontWeight: 900,
        letterSpacing: 1.5,
        transform: "rotate(-4deg)",
        borderRadius: 2,
        boxShadow: "0 1px 4px rgba(0,0,0,0.6)",
        pointerEvents: "none",
      }}
    >
      ★ FIRMA
    </div>
  );
}

function TypeIcon({ type, stratType }) {
  if (type !== "strategy") return null;
  const color = stratType === "atk" ? "var(--rb)" : "var(--bl)";
  return (
    <div
      style={{
        position: "absolute",
        top: 4,
        left: 10,
        fontSize: 18,
        color,
        filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.8))",
        pointerEvents: "none",
      }}
    >
      {stratType === "atk" ? "▸" : "◂"}
    </div>
  );
}

function InfoBar({ type, title, race, traits, stats, equipped, desc, quote, subtitle, size }) {
  const rc = race ? RACES[race] : null;
  const isBoss = type === "boss";
  return (
    <div
      style={{
        height: size - Math.round(size * 0.7),
        padding: isBoss ? "10px 12px" : "8px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        background: "var(--cd)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontSize: isBoss ? 16 : 13,
          fontWeight: 700,
          color: "#d8c9ad",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          lineHeight: 1.15,
        }}
      >
        {title}
      </div>

      {(type === "player" || type === "player-field" || type === "player-shop") && (
        <>
          <div style={{ fontSize: 9, color: rc?.color || "var(--txd)", lineHeight: 1.2 }}>
            {rc ? `${rc.emoji} ${rc.name}` : subtitle}
          </div>
          {type !== "player-shop" && traits && (
            <div
              style={{
                fontSize: 9,
                color: "var(--txf)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {traits.join(" · ")}
            </div>
          )}
          {type !== "player-shop" && stats && (
            <div style={{ display: "flex", gap: 8, fontSize: 10, marginTop: "auto" }}>
              {stats.map((st, i) => (
                <span key={i} style={{ color: st.color || "var(--tx)", fontWeight: 700 }}>
                  {st.label} {st.value}
                </span>
              ))}
            </div>
          )}
          {type === "player-field" && equipped && equipped.length > 0 && (
            <div
              style={{
                fontSize: 8,
                color: "#7B9EC4",
                marginTop: 3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              ⚙ {equipped.map((g) => g.name).join(" + ")}
            </div>
          )}
        </>
      )}

      {type === "strategy" && (
        <>
          {rc && (
            <div style={{ fontSize: 9, color: rc.color, lineHeight: 1.2 }}>
              {rc.emoji} {rc.name}
            </div>
          )}
          {desc && (
            <div
              style={{
                fontSize: 9,
                color: "var(--txd)",
                lineHeight: 1.35,
                marginTop: 3,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {desc}
            </div>
          )}
        </>
      )}

      {type === "gear" && (
        <div
          style={{
            fontSize: 10,
            color: "var(--txd)",
            lineHeight: 1.4,
            marginTop: 3,
          }}
        >
          {desc}
        </div>
      )}

      {type === "boss" && (
        <>
          {(subtitle || rc) && (
            <div style={{ fontSize: 10, color: rc?.color || "var(--gd)", lineHeight: 1.2 }}>
              {subtitle || (rc && `${rc.emoji} ${rc.name}`)}
            </div>
          )}
          {quote && (
            <div
              style={{
                fontSize: 9,
                color: "var(--txd)",
                fontStyle: "italic",
                lineHeight: 1.35,
                marginTop: 4,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              &ldquo;{quote}&rdquo;
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function CardFrame({
  rarity = "COMMON",
  type = "player",
  image,
  title,
  subtitle,
  race,
  stats,
  traits,
  equipped,
  desc,
  quote,
  stratType,
  signature,
  onClick,
  selected,
  size,
  onMouseEnter,
  onMouseLeave,
}) {
  const rc = race ? RACES[race] : null;
  const rarityColor = getRarityColor(rarity);
  const cardSize = size || (type === "boss" ? 320 : 240);
  const borderColor = selected ? "var(--gd)" : rarityColor;

  return (
    <div
      className={`card-frame rarity-${rarity.toLowerCase()}${onClick ? " clickable" : ""}${selected ? " selected" : ""}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        width: cardSize,
        height: cardSize,
        position: "relative",
        background: "var(--cd)",
        border: `2px solid ${borderColor}`,
        borderRadius: 4,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        boxShadow: selected ? "0 0 16px var(--gd)88" : `0 0 8px ${rarityColor}44`,
        fontFamily: "'Space Mono',monospace",
        flexShrink: 0,
      }}
    >
      <Portrait image={image} rc={rc} type={type} stratType={stratType} rarity={rarity} size={cardSize} />
      <RarityLabel rarity={rarity} />
      {signature && <SignatureBadge />}
      <TypeIcon type={type} stratType={stratType} />
      <InfoBar
        type={type}
        title={title}
        race={race}
        traits={traits}
        stats={stats}
        equipped={equipped}
        desc={desc}
        quote={quote}
        subtitle={subtitle}
        size={cardSize}
      />
    </div>
  );
}
