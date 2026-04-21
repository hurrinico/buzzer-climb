// CardFrame visual demo — accessibile a ?demo=cards
// Serve per validare la nuova carta prima di rimpiazzare PC/SC/GearCard in App.jsx
import { useState } from "react";
import CardFrame from "./CardFrame";

const RARITIES = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"];

const sampleStats = {
  COMMON: [
    { label: "ATK", value: "d4", color: "var(--rb)" },
    { label: "DEF", value: "d4", color: "var(--bl)" },
    { label: "L", value: 8, color: "var(--txd)" },
  ],
  UNCOMMON: [
    { label: "ATK", value: "d6", color: "var(--rb)" },
    { label: "DEF", value: "d4", color: "var(--bl)" },
    { label: "L", value: 7, color: "var(--txd)" },
  ],
  RARE: [
    { label: "ATK", value: "d8", color: "var(--rb)" },
    { label: "DEF", value: "d8", color: "var(--bl)" },
    { label: "L", value: 9, color: "var(--txd)" },
  ],
  EPIC: [
    { label: "ATK", value: "d10", color: "var(--rb)" },
    { label: "DEF", value: "d8", color: "var(--bl)" },
    { label: "L", value: 9, color: "var(--txd)" },
  ],
  LEGENDARY: [
    { label: "ATK", value: "d10", color: "var(--rb)" },
    { label: "DEF", value: "d12", color: "var(--bl)" },
    { label: "L", value: 10, color: "var(--txd)" },
  ],
};

const sampleNames = {
  COMMON: "Indice",
  UNCOMMON: "Marginalia",
  RARE: "Vulgata",
  EPIC: "Codex Minor",
  LEGENDARY: "Sigillo",
};

const Section = ({ title, children }) => (
  <section style={{ marginBottom: 48 }}>
    <h2
      style={{
        fontFamily: "'Orbitron',sans-serif",
        fontSize: 14,
        letterSpacing: 3,
        textTransform: "uppercase",
        color: "var(--gd)",
        marginBottom: 16,
        borderBottom: "1px solid var(--bd)",
        paddingBottom: 6,
      }}
    >
      {title}
    </h2>
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>{children}</div>
  </section>
);

export default function CardFrameDemo() {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div
      style={{
        padding: 40,
        background: "#0a0705",
        minHeight: "100vh",
        color: "#d4c5a9",
        fontFamily: "'Space Mono',monospace",
        overflow: "auto",
      }}
    >
      <header style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: "'Orbitron',sans-serif",
            fontSize: 28,
            letterSpacing: 4,
            color: "var(--gd)",
            textShadow: "0 0 16px var(--gd)55",
          }}
        >
          CardFrame · Demo
        </h1>
        <p style={{ color: "var(--txd)", fontSize: 11, marginTop: 6 }}>
          Fase 1b · 5 rarità × 6 varianti. Ritorna all&apos;app: <a href="/" style={{ color: "var(--gd)" }}>/</a>
        </p>
      </header>

      <Section title="Player · tutte le rarità (ATK/DEF/L/traits)">
        {RARITIES.map((r) => (
          <CardFrame
            key={r}
            type="player"
            rarity={r}
            race="GOLEM"
            title={sampleNames[r]}
            traits={["Difensore", "Corazzato"]}
            stats={sampleStats[r]}
          />
        ))}
      </Section>

      <Section title="Player-field · con gear equipaggiato">
        {["UNCOMMON", "RARE", "LEGENDARY"].map((r) => (
          <CardFrame
            key={r}
            type="player-field"
            rarity={r}
            race="GOLEM"
            title={sampleNames[r]}
            traits={["Leader", "Corazzato"]}
            stats={sampleStats[r]}
            equipped={[{ name: "Lama Palinsesto" }, { name: "Armatura d'Archivio" }]}
          />
        ))}
      </Section>

      <Section title="Player-shop · minimale (portrait + nome + rarità)">
        {RARITIES.map((r) => (
          <CardFrame key={r} type="player-shop" rarity={r} race="PHANTOM" title="Glitch" />
        ))}
      </Section>

      <Section title="Player · click + selected state">
        {["COMMON", "RARE", "LEGENDARY"].map((r) => (
          <CardFrame
            key={r}
            type="player"
            rarity={r}
            race="ORC"
            title={`Click ${r}`}
            traits={["Aggressore", "Implacabile"]}
            stats={sampleStats[r]}
            onClick={() => setSelectedId(selectedId === r ? null : r)}
            selected={selectedId === r}
          />
        ))}
      </Section>

      <Section title="Strategy · ATK (rosso) vs DEF (blu)">
        <CardFrame
          type="strategy"
          rarity="COMMON"
          race="GOLEM"
          title="Glossa Rapida"
          stratType="atk"
          desc="0 pass. Base +2, +1/Archivista campo"
        />
        <CardFrame
          type="strategy"
          rarity="UNCOMMON"
          race="GOLEM"
          title="Citazione Incrociata"
          stratType="atk"
          signature
          desc="FIRMA. 0 pass. +1 dado ATK. Base +3, +2/Arch."
        />
        <CardFrame
          type="strategy"
          rarity="RARE"
          race="GOLEM"
          title="Scisma"
          stratType="atk"
          desc="CORRUZIONE. 2d6+sinergia vs Lealtà×2"
        />
        <CardFrame
          type="strategy"
          rarity="COMMON"
          race="PHANTOM"
          title="Statica Difensiva"
          stratType="def"
          desc="Base +0, +1/F-Cat. campo"
        />
        <CardFrame
          type="strategy"
          rarity="LEGENDARY"
          race="PHANTOM"
          title="Blackout Totale"
          stratType="def"
          desc="+3 intercetto. Base +2, +3/F-Cat."
        />
      </Section>

      <Section title="Gear">
        {RARITIES.map((r) => (
          <CardFrame key={r} type="gear" rarity={r} title="Lama Palinsesto" desc="+3 ATK" />
        ))}
      </Section>

      <Section title="Boss · 320×320 con quote">
        <CardFrame
          type="boss"
          rarity="RARE"
          race="GOLEM"
          title="Codex"
          quote="Ho 14.000 anni di partite perse dentro. Non ne perderò altre."
        />
        <CardFrame
          type="boss"
          rarity="EPIC"
          race="GOLEM"
          title="Palinsesto"
          quote="Drava mi ha scritto. Poi cancellato. Poi riscritto come suo avversario."
        />
        <CardFrame
          type="boss"
          rarity="LEGENDARY"
          race="PHANTOM"
          title="Rumore di Fondo"
          quote="Siamo la ragione per cui ogni stadio ha un'eco. Non è acustica. Siamo noi che applaudiamo i nostri canestri."
        />
      </Section>

      <Section title="Tutte le razze · player COMMON">
        {["HUMAN", "ORC", "INSECTOID", "FELINE", "GOLEM", "PHANTOM"].map((race) => (
          <CardFrame
            key={race}
            type="player"
            rarity="COMMON"
            race={race}
            title="Sample"
            traits={["Trait", "Trait"]}
            stats={sampleStats.COMMON}
          />
        ))}
      </Section>
    </div>
  );
}
