import { useState, useRef, useEffect, useMemo } from "react";

// Imports: Data layer
import { RACES, RARITIES } from "./data/constants";

// Imports: Generation & Engine
import { initRun, genBoss, genShop } from "./generation/run";
import { roll, gearB, simMatch } from "./engine/match";

// Imports: Audio
import { initAudio, setAudioIntensity, sfxEnterRun, sfxMatchStart, sfxVictory, sfxDefeat } from "./lib/audio";

// Imports: Assets & Styles
import { IMAGES, FLOOR_BG, COURT_BG, WH_NPCS, CROUPIER, BRAVACCIO, DIE_TIERS } from "./data/assets";
import { s } from "./styles/inline";

// Imports: Components
import CardFrame from "./components/cards/CardFrame";
import { playerToCardProps, strategyToCardProps, gearToCardProps } from "./lib/cardProps";
import Particles from "./components/Particles";
import PCZoom from "./components/PCZoom";

// Imports: Zoom callback registry
import { setZoomCallback } from "./lib/zoom";

// ============================================================
// MAIN — DESKTOP LAYOUT
// ============================================================
export default function App() {
  const [g, setG] = useState(() => ({ ...initRun(), phase: "home" }));
  const [_oR, setOR] = useState(null);
  const [gT, setGT] = useState(null);
  const [subView, setSubView] = useState(null); // "team" | "strategy" | "shops" | null
  const [shopTab, setShopTab] = useState("gym");
  const [zoom, setZoom] = useState(null); // { kind, data, extra }
  const [crawlDone, setCrawlDone] = useState(false);
  const [crawlIdx, setCrawlIdx] = useState(0);
  const [wh1vs1, setWh1vs1] = useState({ player: null, stat: null, diff: null, result: null });
  const [whRtd, setWhRtd] = useState({ result: null });
  setZoomCallback((kind, data, extra) => setZoom(kind ? { kind, data, extra } : null));

  const crawlLines = useMemo(() => {
    if (!g.matchResult) return [];
    const bossName = g.boss?.label || "Boss";
    const lines = [];
    let rNum = 0;
    for (const r of g.matchResult.rounds) {
      if (!r.suddenDeath && r.attacker === 1) {
        rNum++;
        lines.push({ t: "round", v: `─── ROUND ${rNum} ───` });
      }
      if (r.suddenDeath && r.attacker === 1) lines.push({ t: "round", v: "━━ SUDDEN DEATH ━━" });
      lines.push({
        t: r.attacker === 1 ? "player" : "boss",
        v: r.attacker === 1 ? "▸ Coach Vega attacca" : `◂ ${bossName} attacca`,
      });
      for (const l of r.log) {
        const col = l.includes("PUNTO")
          ? "score"
          : l.includes("Intercetto") || l.includes("Difeso") || l.includes("Rubata")
            ? "def"
            : l.includes("corrotto") || l.includes("infortunato")
              ? "special"
              : "log";
        lines.push({ t: col, v: l });
      }
      if (r.scored)
        lines.push({
          t: r.attacker === 1 ? "score" : "score-boss",
          v: r.attacker === 1 ? "PUNTO PER VEGA!" : `PUNTO PER ${bossName.toUpperCase()}!`,
        });
      if (r.corruption) lines.push({ t: "special", v: `${r.corruption.name} e' corrotto!` });
      if (r.injury) lines.push({ t: "special", v: `${r.injury.name} e' infortunato!` });
      lines.push({ t: "spacer", v: "" });
    }
    return lines;
  }, [g.matchResult, g.boss]);

  useEffect(() => {
    if (crawlDone && g.matchResult) {
      g.matchResult.winner === 1 ? sfxVictory() : sfxDefeat();
    }
  }, [crawlDone]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (g.phase !== "result" || crawlDone || crawlLines.length === 0) return;
    if (crawlIdx >= crawlLines.length) {
      setCrawlDone(true);
      return;
    }
    const durations = {
      round: 1400,
      player: 800,
      boss: 800,
      score: 1700,
      "score-boss": 1700,
      def: 800,
      special: 1400,
      log: 700,
      spacer: 180,
    };
    const delay = durations[crawlLines[crawlIdx].t] ?? 700;
    const t = setTimeout(() => setCrawlIdx((i) => i + 1), delay);
    return () => clearTimeout(t);
  }, [crawlIdx, crawlDone, g.phase, crawlLines]);
  const up = (c) => setG((p) => ({ ...p, ...c }));
  const log = (m) => setG((p) => ({ ...p, log: [...p.log.slice(-40), m] }));

  // ─── DRAG & DROP ───
  const dragRef = useRef({ type: null, idx: null });
  const [dragOver, setDragOver] = useState({ type: null, idx: null });

  const onDragStart = (type, idx) => (e) => {
    dragRef.current = { type, idx };
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragEnd = () => {
    dragRef.current = { type: null, idx: null };
    setDragOver({ type: null, idx: null });
  };
  const onDragOver = (type, idx) => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const ft = dragRef.current.type;
    const ok =
      (ft === type && type !== "bench") || (ft === "bench" && type === "field") || (ft === "field" && type === "bench");
    if (ok) setDragOver({ type, idx });
  };
  const onDrop = (type, toIdx) => (e) => {
    e.preventDefault();
    const { type: ft, idx: fi } = dragRef.current;
    dragRef.current = { type: null, idx: null };
    setDragOver({ type: null, idx: null });
    if (fi == null) return;
    // Same-type reorder
    if (ft === type && fi !== toIdx) {
      if (type === "field") {
        const a = [...g.field];
        const [m] = a.splice(fi, 1);
        a.splice(toIdx, 0, m);
        up({ field: a });
      } else if (type === "atk") {
        const a = [...g.atkStrategies];
        const [m] = a.splice(fi, 1);
        a.splice(toIdx, 0, m);
        up({ atkStrategies: a });
      } else if (type === "def") {
        const a = [...g.defStrategies];
        const [m] = a.splice(fi, 1);
        a.splice(toIdx, 0, m);
        up({ defStrategies: a });
      }
    }
    // Bench player → field slot (swap positions)
    else if (ft === "bench" && type === "field") {
      const bp = g.bench[fi];
      if (!bp) return;
      const nf = [...g.field];
      nf[toIdx] = bp;
      up({ field: nf, bench: g.roster.filter((r) => !nf.find((f) => f.id === r.id)) });
    }
    // Field player → bench zone (move to bench)
    else if (ft === "field" && type === "bench") {
      if (g.field.length <= 1) return;
      const nf = g.field.filter((_, i) => i !== fi);
      up({ field: nf, bench: g.roster.filter((r) => !nf.find((f) => f.id === r.id)) });
    }
  };
  const isDragging = (type, idx) => dragRef.current.type === type && dragRef.current.idx === idx;
  const isDragOver = (type, idx) => dragOver.type === type && dragOver.idx === idx;

  const enterShop = (tp) => {
    setShopTab(tp);
    setSubView("shops");
  };
  const buyPlayer = (it) => {
    if (g.gold < it.price || g.roster.length >= 8) return;
    const np = { ...it, equippedGear: [] };
    const nr = [...g.roster, np];
    log(`+ ${it.name} [-${it.price}◆]`);
    const ns = { ...g.shops, gym: g.shops.gym.filter((i) => i.id !== it.id) };
    up({
      gold: g.gold - it.price,
      roster: nr,
      bench: nr.filter((r) => !g.field.find((f) => f.id === r.id)),
      shops: ns,
    });
  };
  const buyGear = (it) => {
    if (g.gold < it.price) return;
    setGT({ gear: it });
    log(`+ ${it.name} [-${it.price}◆]`);
    const ns = { ...g.shops, gear: g.shops.gear.filter((i) => i.id !== it.id) };
    up({ gold: g.gold - it.price, shops: ns });
  };
  const equipTo = (pi) => {
    if (!gT) return;
    const mx = { COMMON: 2, UNCOMMON: 2, RARE: 3, EPIC: 3, LEGENDARY: 4 };
    const p = g.roster[pi];
    if ((p.equippedGear?.length || 0) >= mx[p.rarity]) return;
    const nr = [...g.roster];
    nr[pi] = { ...p, equippedGear: [...(p.equippedGear || []), gT.gear] };
    const nf = g.field.map((x) => nr.find((r) => r.id === x.id) || x);
    const nb = g.bench.map((x) => nr.find((r) => r.id === x.id) || x);
    log(`${gT.gear.name} → ${p.name}`);
    up({ roster: nr, field: nf, bench: nb });
    setGT(null);
  };
  const buySt = (it) => {
    if (g.gold < it.price) return;
    log(`+ ${it.name} [-${it.price}◆]`);
    const ns = { ...g.shops, strategies: g.shops.strategies.filter((i) => i.id !== it.id) };
    if (it.stratType === "atk") {
      up({ gold: g.gold - it.price, shops: ns, atkStrategies: [...g.atkStrategies, it] });
    } else {
      up({ gold: g.gold - it.price, shops: ns, defStrategies: [...g.defStrategies, it] });
    }
  };
  const removeStrat = (type, i) => {
    const arr = type === "atk" ? [...g.atkStrategies] : [...g.defStrategies];
    if (arr.length <= 5) return;
    arr.splice(i, 1);
    up(type === "atk" ? { atkStrategies: arr } : { defStrategies: arr });
  };
  const sellP = (pi) => {
    const p = g.roster[pi];
    if (g.roster.length <= 3) return;
    const sp = RARITIES[p.rarity].sell;
    const nr = g.roster.filter((_, i) => i !== pi);
    let nf = g.field.filter((f) => f.id !== p.id);
    if (nf.length < 3) {
      const av = nr.find((r) => !nf.find((f) => f.id === r.id));
      if (av) nf.push(av);
    }
    nf = nf.slice(0, 3);
    log(`- ${p.name} [+${sp}◆]`);
    up({ roster: nr, field: nf, bench: nr.filter((r) => !nf.find((f) => f.id === r.id)), gold: g.gold + sp });
  };
  const toField = (pid) => {
    const p = g.roster.find((r) => r.id === pid);
    if (!p || g.field.length >= 3 || g.field.find((f) => f.id === p.id)) return;
    const nf = [...g.field, p];
    up({ field: nf.slice(0, 3), bench: g.roster.filter((r) => !nf.slice(0, 3).find((f) => f.id === r.id)) });
  };
  const toBench = (fi) => {
    if (g.field.length <= 1) return;
    const nf = g.field.filter((_, i) => i !== fi);
    up({ field: nf, bench: g.roster.filter((r) => !nf.find((f) => f.id === r.id)) });
  };
  const startBoss = () => {
    if (g.boss) {
      setSubView(null);
      up({ phase: "prematch" });
    } else {
      const boss = genBoss(g.floor, g);
      setSubView(null);
      up({ phase: "prematch", boss });
      log(`— ${boss.label} (${RACES[boss.clan]?.emoji || ""})`);
    }
  };
  const returnToTeam = () => {
    up({ phase: "explore" });
    setSubView("team");
  };
  const play = () => {
    const r = simMatch(
      {
        field: g.field,
        bench: g.bench,
        atkStrategies: g.atkStrategies.slice(0, 5),
        defStrategies: g.defStrategies.slice(0, 5),
      },
      g.boss
    );
    sfxMatchStart();
    up({ phase: "result", matchResult: r });
    setCrawlDone(false);
    setCrawlIdx(0);
    setOR(null);
    log(r.winner === 1 ? `Vittoria ${r.score1}-${r.score2} [+${r.goldEarned}◆]` : `Sconfitta ${r.score1}-${r.score2}`);
  };
  const after = () => {
    const r = g.matchResult;
    if (r.winner === 1) {
      const ng = g.gold + r.goldEarned;
      const nf = g.floor + 1;
      if (g.floor >= 6) up({ phase: "victory", gold: ng });
      else {
        const ns = {
          gym: genShop("gym", nf, g.activeClans),
          gear: genShop("gear", nf, g.activeClans),
          strategies: genShop("strategies", nf, g.activeClans),
        };
        up({
          phase: "explore",
          floor: nf,
          gold: ng,
          matchResult: null,
          boss: null,
          shops: ns,
          whDone: { easy: false, hard: false, rtd: false },
        });
        setSubView(null);
        log(`▲ Piano ${nf}`);
        setAudioIntensity(nf);
      }
    } else up({ phase: "gameover" });
  };
  const newRun = () => {
    setG({ ...initRun(), phase: "home" });
    setOR(null);
    setGT(null);
    setSubView(null);
  };
  const startRun = () => {
    initAudio().then(() => {
      sfxEnterRun();
      setAudioIntensity(1);
    });
    up({ phase: "explore" });
    setSubView(null);
  };

  const bgSrc =
    g.phase === "prematch" || g.phase === "result"
      ? COURT_BG[g.floor] || IMAGES.bg
      : g.phase === "home"
        ? IMAGES.home
        : FLOOR_BG[g.floor] || IMAGES.bg;

  // ─── RENDER ───
  return (
    <div style={s.viewport}>
      <div style={s.bgImg(bgSrc)} />
      <div style={s.overlay} />
      <div style={s.grain} />
      {g.phase !== "home" && g.phase !== "gameover" && g.phase !== "victory" && <Particles floor={g.floor} />}

      <div style={s.content}>
        {/* ═══════════ HOME SCREEN ═══════════ */}
        {g.phase === "home" && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, transparent 0%, transparent 35%, rgba(8,5,3,0.5) 55%, rgba(8,5,3,0.88) 75%, rgba(8,5,3,0.97) 100%)",
              }}
            />
            {/* Vega — bottom left */}
            <img
              src={IMAGES.vega}
              alt="Coach Vega"
              style={{
                position: "absolute",
                bottom: 0,
                left: "6%",
                height: "72%",
                objectFit: "contain",
                zIndex: 2,
                pointerEvents: "none",
                filter: "drop-shadow(0 0 24px rgba(201,168,76,0.25))",
              }}
            />

            {/* Content over background */}
            <div
              style={{
                position: "relative",
                zIndex: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingBottom: 80,
              }}
            >
              {/* Clan badges */}
              <div className="fi" style={{ marginBottom: 36, animationDelay: ".15s" }}>
                <div
                  style={{
                    ...s.orb(9),
                    color: "var(--txd)",
                    letterSpacing: 4,
                    textTransform: "uppercase",
                    textAlign: "center",
                    marginBottom: 12,
                    textShadow: "0 2px 6px rgba(0,0,0,0.9)",
                  }}
                >
                  Clan di questa run
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
                  {g.activeClans?.map((c, i) => (
                    <div
                      key={c}
                      className="fiL"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 20px",
                        border: `1px solid ${RACES[c]?.color}55`,
                        borderRadius: 8,
                        background: `linear-gradient(135deg, ${RACES[c]?.color}18 0%, rgba(6,6,12,0.7) 100%)`,
                        backdropFilter: "blur(8px)",
                        animationDelay: `${i * 0.1}s`,
                      }}
                    >
                      <span style={{ fontSize: 28 }}>{RACES[c]?.emoji}</span>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          color: RACES[c]?.color,
                          textShadow: `0 0 12px ${RACES[c]?.color}44`,
                        }}
                      >
                        {RACES[c]?.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div
                className="fi"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                  animationDelay: ".3s",
                }}
              >
                <button
                  className="btn-hover"
                  style={{ ...s.btn(0, "var(--bl)"), opacity: 0.4, pointerEvents: "none", backdropFilter: "blur(4px)" }}
                >
                  Guardaroba — Prossimamente
                </button>
                <button
                  className="btn-hover"
                  onClick={startRun}
                  style={{
                    ...s.btnBig("var(--gd)"),
                    backdropFilter: "blur(4px)",
                    boxShadow: "0 0 40px rgba(201,168,76,0.15)",
                  }}
                >
                  Inizia Run
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ GAMEOVER ═══════════ */}
        {g.phase === "gameover" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <div
              className="fi"
              style={{
                ...s.panel,
                padding: "60px 80px",
                textAlign: "center",
                maxWidth: 600,
                ...s.panelGlow("var(--rb)"),
              }}
            >
              <div style={{ ...s.orb(36), color: "var(--rb)", marginBottom: 12 }}>SCONFITTA</div>
              <div style={{ ...s.dm, marginBottom: 8, fontSize: 14 }}>Eliminato al Piano {g.floor}</div>
              <div style={{ ...s.ft, fontSize: 12, fontStyle: "italic", marginBottom: 36, lineHeight: 1.6 }}>
                "Il buzzer suona. Le luci si spengono.
                <br />
                Vega torna nell'ombra."
              </div>
              <button className="btn-hover" onClick={newRun} style={s.btnBig("var(--rb)")}>
                Nuova Run
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ VICTORY ═══════════ */}
        {g.phase === "victory" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <div
              className="fi"
              style={{
                ...s.panel,
                padding: "60px 80px",
                textAlign: "center",
                maxWidth: 600,
                ...s.panelGlow("var(--gd)"),
              }}
            >
              <div style={{ ...s.orb(36), color: "var(--gd)", marginBottom: 12, animation: "glow 2s infinite" }}>
                VITTORIA
              </div>
              <div style={{ ...s.dm, marginBottom: 8, fontSize: 14 }}>La torre è conquistata.</div>
              <div style={{ ...s.ft, fontSize: 12, fontStyle: "italic", marginBottom: 36, lineHeight: 1.6 }}>
                "Drava applaude lentamente. Il pubblico urla.
                <br />
                Ma domani... il Buzzer Climb ricomincia."
              </div>
              <button className="btn-hover" onClick={newRun} style={s.btnBig("var(--gd)")}>
                Ricomincia
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ FLOOR EXPLORE ═══════════ */}
        {g.phase === "explore" && (
          <>
            {/* Header bar */}
            <div style={s.hdr}>
              <img src={IMAGES.logo} alt="Buzzer Climb" style={{ height: 36, objectFit: "contain" }} />
              <div style={{ flex: 1 }} />
              <span style={{ ...s.orb(12), color: "var(--gd)" }}>◆ {g.gold}</span>
              <span style={{ ...s.orb(11), color: "var(--txd)" }}>Piano {g.floor}/6</span>
              <div style={{ borderLeft: "1px solid var(--bd)", height: 20, margin: "0 8px" }} />
              {g.activeClans?.map((c) => (
                <span key={c} title={RACES[c]?.name} style={{ fontSize: 18, opacity: 0.7 }}>
                  {RACES[c]?.emoji}
                </span>
              ))}
            </div>

            {/* Main content area */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px 40px",
                overflow: "hidden",
              }}
            >
              {/* ── No subview: Floor Hub ── */}
              {!subView && (
                <div
                  className="fi"
                  style={{ display: "flex", gap: 30, alignItems: "stretch", maxWidth: 1200, width: "100%" }}
                >
                  {/* Left: Boss preview */}
                  <div
                    className="fiL"
                    style={{
                      ...s.panel,
                      ...s.panelGlow("var(--rb)"),
                      flex: 1,
                      padding: 30,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div style={s.lbl}>Prossimo avversario</div>
                    <div style={{ ...s.orb(20), color: "var(--rb)", marginBottom: 6 }}>
                      {g.bossOrder?.[g.floor - 1]?.name}
                    </div>
                    <div
                      style={{ fontSize: 14, color: RACES[g.bossOrder?.[g.floor - 1]?.clan]?.color, marginBottom: 4 }}
                    >
                      {RACES[g.bossOrder?.[g.floor - 1]?.clan]?.emoji} {RACES[g.bossOrder?.[g.floor - 1]?.clan]?.name}
                    </div>
                    <div style={{ ...s.ft, fontSize: 12, fontStyle: "italic", marginBottom: 20, lineHeight: 1.5 }}>
                      "{g.bossOrder?.[g.floor - 1]?.quote}"
                    </div>
                    <div style={{ ...s.ft, fontSize: 11, marginBottom: 30 }}>{g.bossOrder?.[g.floor - 1]?.desc}</div>
                    <div style={{ flex: 1 }} />
                    <button className="btn-hover" onClick={startBoss} style={s.btnBig("var(--rb)")}>
                      {g.boss ? "Torna alla Partita" : "Affronta il Boss"}
                    </button>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, maxWidth: 400 }}>
                    <button
                      className="btn-hover fiR"
                      onClick={() => setSubView("team")}
                      style={{
                        ...s.panel,
                        padding: "24px 30px",
                        border: "1px solid var(--gn)44",
                        cursor: "pointer",
                        textAlign: "left",
                        background: "linear-gradient(135deg, rgba(58,139,90,0.08) 0%, transparent 100%)",
                      }}
                    >
                      <div style={{ ...s.orb(14), color: "var(--gn)", marginBottom: 6 }}>Il Mio Team</div>
                      <div style={{ fontSize: 11, color: "var(--txd)" }}>
                        Campo: {g.field.map((p) => p.name).join(", ")}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--txf)", marginTop: 2 }}>
                        Panchina: {g.bench.length > 0 ? g.bench.map((p) => p.name).join(", ") : "—"}
                      </div>
                    </button>

                    <button
                      className="btn-hover fiR"
                      onClick={() => enterShop("gym")}
                      style={{
                        ...s.panel,
                        padding: "20px 30px",
                        border: "1px solid var(--gd)33",
                        cursor: "pointer",
                        textAlign: "left",
                        background: "linear-gradient(135deg, rgba(201,168,76,0.06) 0%, transparent 100%)",
                        animationDelay: ".1s",
                      }}
                    >
                      <div style={{ ...s.orb(12), color: "var(--gd)", marginBottom: 4 }}>Shops</div>
                      <div style={{ fontSize: 10, color: "var(--txd)" }}>Locker Room · Shop · Coach Staff</div>
                    </button>

                    <button
                      className="btn-hover fiR"
                      onClick={() => {
                        setWh1vs1({ player: null, stat: null, diff: null, result: null });
                        setWhRtd({ result: null });
                        setSubView("workhard");
                      }}
                      style={{
                        ...s.panel,
                        padding: "20px 30px",
                        border: "1px solid var(--rd)55",
                        cursor: "pointer",
                        textAlign: "left",
                        background: "linear-gradient(135deg, rgba(139,58,58,0.1) 0%, transparent 100%)",
                        animationDelay: ".15s",
                      }}
                    >
                      <div style={{ ...s.orb(12), color: "var(--rb)", marginBottom: 4 }}>The Pit</div>
                      <div style={{ fontSize: 10, color: "var(--txd)" }}>1vs1 Training · Roll the Dice</div>
                      <div style={{ fontSize: 9, color: "var(--txf)", marginTop: 3 }}>
                        {[g.whDone?.easy && "Easy ✓", g.whDone?.hard && "Hard ✓", g.whDone?.rtd && "Dado ✓"]
                          .filter(Boolean)
                          .join("  ") || "3 sfide disponibili"}
                      </div>
                    </button>

                    {/* Log */}
                    <div
                      className="fiR"
                      style={{
                        ...s.panel,
                        padding: 16,
                        flex: 1,
                        overflow: "hidden",
                        animationDelay: ".2s",
                        borderColor: "var(--bd)",
                        minHeight: 80,
                      }}
                    >
                      <div style={s.lbl}>Log</div>
                      <div style={{ maxHeight: 120, overflowY: "auto" }}>
                        {g.log.slice(-8).map((l, i) => (
                          <div key={i} style={{ fontSize: 10, color: "var(--txf)", marginBottom: 2 }}>
                            {l}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── GEAR EQUIP PROMPT (globale, visibile in qualsiasi subview) ── */}
              {gT && (
                <div
                  style={{
                    ...s.panel,
                    padding: 14,
                    marginBottom: 10,
                    borderColor: "var(--bl)",
                    width: "100%",
                    maxWidth: 1200,
                  }}
                >
                  <span style={{ ...s.lbl, color: "var(--bl)" }}>Equipaggia {gT.gear.name} — scegli giocatore:</span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    {g.roster.map((p, i) => (
                      <button key={p.id} className="btn-hover" onClick={() => equipTo(i)} style={s.btn(0, "var(--bl)")}>
                        {p.name} ({p.equippedGear?.length || 0}g)
                      </button>
                    ))}
                    <button className="btn-hover" onClick={() => setGT(null)} style={s.btn(0)}>
                      ✕ Scarta
                    </button>
                  </div>
                </div>
              )}

              {/* ── TEAM subview ── */}
              {subView === "team" && (
                <div
                  className="fi"
                  style={{
                    display: "flex",
                    gap: 24,
                    width: "100%",
                    maxWidth: 1400,
                    maxHeight: "calc(100vh - 100px)",
                    overflow: "hidden",
                  }}
                >
                  {/* Left: Field & Bench */}
                  <div
                    style={{
                      flex: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      overflowY: "auto",
                      padding: "0 4px 4px 0",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ ...s.orb(16), color: "var(--gn)" }}>Il Mio Team</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn-hover"
                          onClick={() => setSubView("strategy")}
                          style={s.hdrBtn(false, "var(--pp)")}
                        >
                          Strategie
                        </button>
                        <button className="btn-hover" onClick={() => setSubView(null)} style={s.btn(0)}>
                          ← Piano
                        </button>
                      </div>
                    </div>

                    <div style={s.lbl}>Campo (3)</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {g.field.map((p, i) => (
                        <div
                          key={p.id}
                          draggable
                          onDragStart={onDragStart("field", i)}
                          onDragEnd={onDragEnd}
                          onDragOver={onDragOver("field", i)}
                          onDrop={onDrop("field", i)}
                          className={`fi drag-row${isDragging("field", i) ? " is-dragging" : ""}${isDragOver("field", i) && !isDragging("field", i) ? " drag-over" : ""}`}
                          style={{ display: "flex", alignItems: "center", gap: 10, animationDelay: `${i * 0.06}s` }}
                        >
                          <span className="drag-handle">⠿</span>
                          <span style={{ ...s.ft, ...s.orb(12), minWidth: 24 }}>#{i + 1}</span>
                          <div style={{ flex: 1 }}>
                            <CardFrame {...playerToCardProps(p, { type: "player-field" })} />
                          </div>
                          <button
                            className="btn-hover"
                            onClick={() => toBench(i)}
                            disabled={g.field.length <= 1}
                            style={
                              g.field.length <= 1
                                ? { ...s.dis, padding: "4px 10px" }
                                : { ...s.btn(0, "var(--rb)"), padding: "4px 10px" }
                            }
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div style={s.lbl}>Panchina ({g.bench.length}) — trascina in campo o clicca</div>
                    <div
                      onDragOver={onDragOver("bench", -1)}
                      onDrop={onDrop("bench", -1)}
                      onDragLeave={() => setDragOver({ type: null, idx: null })}
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        padding: 8,
                        borderRadius: 6,
                        minHeight: 60,
                        transition: "all .2s",
                        border: `1px dashed ${isDragOver("bench", -1) ? "var(--gn)" : "transparent"}`,
                        background: isDragOver("bench", -1) ? "rgba(58,139,90,0.06)" : "transparent",
                      }}
                    >
                      {g.bench.map((p, bi) => (
                        <div key={p.id} draggable onDragStart={onDragStart("bench", bi)} onDragEnd={onDragEnd}>
                          <CardFrame {...playerToCardProps(p, { size: 180, onClick: () => toField(p.id) })} />
                        </div>
                      ))}
                      {g.bench.length === 0 && <span style={{ ...s.ft, alignSelf: "center" }}>Vuota</span>}
                    </div>

                    {/* Sell section */}
                    <div style={{ marginTop: 8 }}>
                      <div style={s.lbl}>Vendi</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {g.roster.map((p, i) => (
                          <button
                            key={p.id}
                            className="btn-hover"
                            onClick={() => sellP(i)}
                            disabled={g.roster.length <= 3}
                            style={
                              g.roster.length <= 3
                                ? { ...s.dis, fontSize: 10, padding: "4px 10px" }
                                : { ...s.btn(0, "var(--gd)"), fontSize: 10, padding: "4px 10px" }
                            }
                          >
                            {p.name} +{RARITIES[p.rarity].sell}◆
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STRATEGY subview ── */}
              {subView === "strategy" && (
                <div
                  className="fi"
                  style={{
                    width: "100%",
                    maxWidth: 1400,
                    maxHeight: "calc(100vh - 100px)",
                    overflow: "auto",
                    padding: "0 4px 4px 0",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}
                  >
                    <div style={{ ...s.orb(16), color: "var(--pp)" }}>Strategie</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn-hover" onClick={() => setSubView("team")} style={s.btn(0)}>
                        ← Team
                      </button>
                      <button className="btn-hover" onClick={() => setSubView(null)} style={s.btn(0)}>
                        ← Piano
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 24 }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ ...s.lbl, color: "var(--rb)" }}>
                        Attacco ({g.atkStrategies.length}) — prime 5 attive
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {g.atkStrategies.map((st, i) => (
                          <div
                            key={st.id + "ea" + i}
                            draggable
                            onDragStart={onDragStart("atk", i)}
                            onDragEnd={onDragEnd}
                            onDragOver={onDragOver("atk", i)}
                            onDrop={onDrop("atk", i)}
                            className={`fi drag-row${isDragging("atk", i) ? " is-dragging" : ""}${isDragOver("atk", i) && !isDragging("atk", i) ? " drag-over" : ""}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              opacity: isDragging("atk", i) ? 0.3 : i >= 5 ? 0.4 : 1,
                              animationDelay: `${i * 0.04}s`,
                            }}
                          >
                            <span className="drag-handle" style={{ fontSize: 13 }}>
                              ⠿
                            </span>
                            <span style={{ ...s.ft, ...s.orb(10), minWidth: 18 }}>{i < 5 ? `${i + 1}` : "·"}</span>
                            <div style={{ flex: 1 }}>
                              <CardFrame {...strategyToCardProps(st, "atk")} />
                            </div>
                            {g.atkStrategies.length > 5 && (
                              <button
                                className="btn-hover"
                                onClick={() => removeStrat("atk", i)}
                                style={{ ...s.btn(0, "var(--rb)"), padding: "2px 8px", fontSize: 9 }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ ...s.lbl, color: "var(--bl)" }}>
                        Difesa ({g.defStrategies.length}) — prime 5 attive
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {g.defStrategies.map((st, i) => (
                          <div
                            key={st.id + "ed" + i}
                            draggable
                            onDragStart={onDragStart("def", i)}
                            onDragEnd={onDragEnd}
                            onDragOver={onDragOver("def", i)}
                            onDrop={onDrop("def", i)}
                            className={`fi drag-row${isDragging("def", i) ? " is-dragging" : ""}${isDragOver("def", i) && !isDragging("def", i) ? " drag-over" : ""}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              opacity: isDragging("def", i) ? 0.3 : i >= 5 ? 0.4 : 1,
                              animationDelay: `${i * 0.04}s`,
                            }}
                          >
                            <span className="drag-handle" style={{ fontSize: 13 }}>
                              ⠿
                            </span>
                            <span style={{ ...s.ft, ...s.orb(10), minWidth: 18 }}>{i < 5 ? `${i + 1}` : "·"}</span>
                            <div style={{ flex: 1 }}>
                              <CardFrame {...strategyToCardProps(st, "def")} />
                            </div>
                            {g.defStrategies.length > 5 && (
                              <button
                                className="btn-hover"
                                onClick={() => removeStrat("def", i)}
                                style={{ ...s.btn(0, "var(--bl)"), padding: "2px 8px", fontSize: 9 }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── SHOPS subview ── */}
              {subView === "shops" && (
                <div
                  className="fi"
                  style={{
                    width: "100%",
                    maxWidth: 1200,
                    maxHeight: "calc(100vh - 100px)",
                    overflow: "auto",
                    padding: "0 4px 4px 0",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}
                  >
                    <div
                      style={{
                        ...s.orb(16),
                        color: shopTab === "gym" ? "var(--gn)" : shopTab === "gear" ? "var(--bl)" : "var(--pp)",
                      }}
                    >
                      {shopTab === "gym" ? "Locker Room — Giocatori" : shopTab === "gear" ? "Shop" : "Coach Staff"}
                    </div>
                    <button className="btn-hover" onClick={() => setSubView(null)} style={s.btn(0)}>
                      ← Piano
                    </button>
                  </div>

                  {/* Shop tabs */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                    <button
                      className="btn-hover"
                      onClick={() => setShopTab("gym")}
                      style={s.hdrBtn(shopTab === "gym", "var(--gn)")}
                    >
                      Locker Room
                    </button>
                    <button
                      className="btn-hover"
                      onClick={() => setShopTab("gear")}
                      style={s.hdrBtn(shopTab === "gear", "var(--bl)")}
                    >
                      Shop
                    </button>
                    <button
                      className="btn-hover"
                      onClick={() => setShopTab("strategies")}
                      style={s.hdrBtn(shopTab === "strategies", "var(--pp)")}
                    >
                      Coach Staff
                    </button>
                  </div>

                  {/* Shop items grid */}
                  <div
                    style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}
                  >
                    {(g.shops?.[shopTab] || []).map((it, i) => (
                      <div
                        key={it.id + i}
                        className="fi"
                        style={{
                          ...s.panel,
                          padding: 16,
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          animationDelay: `${i * 0.05}s`,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          {shopTab === "gym" ? (
                            <CardFrame {...playerToCardProps(it, { type: "player-shop" })} />
                          ) : shopTab === "gear" ? (
                            <CardFrame {...gearToCardProps(it)} />
                          ) : (
                            <CardFrame {...strategyToCardProps(it, it.stratType)} />
                          )}
                        </div>
                        <button
                          className="btn-hover"
                          onClick={() =>
                            shopTab === "gym" ? buyPlayer(it) : shopTab === "gear" ? buyGear(it) : buySt(it)
                          }
                          disabled={g.gold < it.price}
                          style={g.gold < it.price ? { ...s.dis, width: "100%" } : { ...s.btn(1), width: "100%" }}
                        >
                          Compra — {it.price}◆
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── WORK HARD HUB ── */}
              {subView === "workhard" &&
                (() => {
                  const npc = WH_NPCS[g.floor - 1];
                  return (
                    <div
                      className="fi"
                      style={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        gap: 20,
                        width: "100%",
                        maxWidth: 900,
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundImage: "url('/ThePit.png')",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          opacity: 0.15,
                          borderRadius: 8,
                          pointerEvents: "none",
                        }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ ...s.orb(18), color: "var(--rb)" }}>The Pit</div>
                        <button className="btn-hover" onClick={() => setSubView(null)} style={s.btn(0)}>
                          ← Piano
                        </button>
                      </div>
                      <div style={{ display: "flex", gap: 20 }}>
                        {/* 1vs1 card */}
                        <div
                          style={{
                            ...s.panel,
                            flex: 1,
                            padding: 28,
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                            borderColor: "var(--rd)55",
                          }}
                        >
                          <div style={{ ...s.orb(14), color: "var(--rb)" }}>1vs1 Training</div>
                          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 4 }}>
                            <img
                              src={npc.img}
                              alt={npc.name}
                              style={{ height: 90, objectFit: "contain", filter: "drop-shadow(0 2px 8px #00000088)" }}
                            />
                            <div>
                              <div style={{ ...s.dm, fontSize: 15 }}>{npc.name}</div>
                              <div style={{ fontSize: 11, color: "var(--txf)", fontStyle: "italic", marginBottom: 4 }}>
                                "{npc.quote}"
                              </div>
                              <div style={{ fontSize: 11, color: "var(--txd)" }}>{npc.desc}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 10, color: "var(--txd)", lineHeight: 1.8 }}>
                            <span style={{ color: "var(--gn)" }}>EASY</span> — Sfida 1d{npc.die}. Vinci:{" "}
                            <span style={{ color: "var(--gd)" }}>+1 ATK o DEF flat</span>
                            {g.whDone?.easy ? (
                              <span style={{ color: "var(--txf)", marginLeft: 8 }}>✓ completata</span>
                            ) : (
                              ""
                            )}
                            <br />
                            <span style={{ color: "var(--rb)" }}>HARD</span> — Sfida 1d{npc.die}+2. Vinci:{" "}
                            <span style={{ color: "var(--gd)" }}>upgrade dado</span>
                            {g.whDone?.hard ? (
                              <span style={{ color: "var(--txf)", marginLeft: 8 }}>✓ completata</span>
                            ) : (
                              ""
                            )}
                          </div>
                          <button
                            className="btn-hover"
                            onClick={() => setSubView("1vs1")}
                            style={{ ...s.btnBig("var(--rb)"), marginTop: "auto" }}
                          >
                            Allenati
                          </button>
                        </div>

                        {/* Roll the Dice card */}
                        <div
                          style={{
                            ...s.panel,
                            flex: 1,
                            padding: 28,
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                            borderColor: "var(--pp)55",
                          }}
                        >
                          <div style={{ ...s.orb(14), color: "var(--pp)" }}>Roll the Dice</div>
                          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 4 }}>
                            <img
                              src={CROUPIER.img}
                              alt={CROUPIER.name}
                              style={{ height: 90, objectFit: "contain", filter: "drop-shadow(0 2px 8px #00000088)" }}
                            />
                            <div>
                              <div style={{ ...s.dm, fontSize: 15 }}>{CROUPIER.name}</div>
                              <div style={{ fontSize: 11, color: "var(--txf)", fontStyle: "italic", marginBottom: 4 }}>
                                "{CROUPIER.quote}"
                              </div>
                              <div style={{ fontSize: 11, color: "var(--txd)" }}>{CROUPIER.desc}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 10, color: "var(--txd)", lineHeight: 1.8 }}>
                            Entrambi lanciate un <span style={{ color: "var(--gd)" }}>d20</span>.<br />
                            <span style={{ color: "var(--gn)" }}>Vinci</span>: guadagni (differenza × 3)◆
                            <br />
                            <span style={{ color: "var(--rb)" }}>Perdi</span>: i tuoi crediti si dimezzano
                            {g.whDone?.rtd ? (
                              <span style={{ color: "var(--txf)", display: "block", marginTop: 4 }}>✓ completata</span>
                            ) : (
                              ""
                            )}
                          </div>
                          <button
                            className="btn-hover"
                            onClick={() => setSubView("rtd")}
                            disabled={g.whDone?.rtd}
                            style={{
                              ...s.btnBig(g.whDone?.rtd ? undefined : "var(--pp)"),
                              marginTop: "auto",
                              ...(g.whDone?.rtd ? s.dis : {}),
                            }}
                          >
                            Al Tavolo
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              {/* ── 1vs1 SCREEN ── */}
              {subView === "1vs1" &&
                (() => {
                  const npc = WH_NPCS[g.floor - 1];

                  const runChallenge = (diff) => {
                    const p = wh1vs1.player;
                    const st = wh1vs1.stat;
                    if (!p || !st) return;
                    const gb = gearB(p);
                    const playerDie = RARITIES[st === "atk" ? p.atkDie : p.defDie].die;
                    const playerFlat = st === "atk" ? gb.af : gb.df;
                    const playerExtra = st === "atk" ? gb.ad : gb.dd;
                    const playerRoll =
                      Array.from({ length: 1 + playerExtra }, () => roll(playerDie)).reduce((a, b) => a + b, 0) +
                      playerFlat;
                    const npcBonus = diff === "hard" ? 2 : 0;
                    const npcRoll = roll(npc.die) + npcBonus;
                    const won = playerRoll > npcRoll;

                    // Apply reward
                    if (won) {
                      const newRoster = g.roster.map((r) => {
                        if (r.id !== p.id) return r;
                        if (diff === "easy") {
                          const gear = {
                            id: `wh_e_${Date.now()}`,
                            name: st === "atk" ? "Allenamento Offensivo" : "Allenamento Difensivo",
                            effect: st === "atk" ? "atkFlat" : "defFlat",
                            value: 1,
                            rarity: "COMMON",
                            desc: `+1 ${st === "atk" ? "ATK" : "DEF"}`,
                          };
                          return { ...r, equippedGear: [...(r.equippedGear || []), gear] };
                        } else {
                          const dieKey = st === "atk" ? "atkDie" : "defDie";
                          const curTier = DIE_TIERS.indexOf(r[dieKey]);
                          const newTier = DIE_TIERS[Math.min(curTier + 1, DIE_TIERS.length - 1)];
                          return { ...r, [dieKey]: newTier };
                        }
                      });
                      up({
                        roster: newRoster,
                        field: g.field.map((f) => newRoster.find((r) => r.id === f.id) || f),
                        bench: g.bench.map((b) => newRoster.find((r) => r.id === b.id) || b),
                        whDone: { ...g.whDone, [diff]: true },
                      });
                    } else {
                      up({ whDone: { ...g.whDone, [diff]: true } });
                    }
                    setWh1vs1((prev) => ({ ...prev, diff, result: { playerRoll, npcRoll, npcBonus, won, diff } }));
                    log(
                      won
                        ? `The Pit: ${p.name} batte ${npc.name} (${diff}) [${playerRoll} vs ${npcRoll}]`
                        : `The Pit: ${p.name} perde vs ${npc.name} (${diff}) [${playerRoll} vs ${npcRoll}]`
                    );
                  };

                  const bothDone = g.whDone?.easy && g.whDone?.hard;

                  return (
                    <div
                      className="fi"
                      style={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        gap: 18,
                        width: "100%",
                        maxWidth: 900,
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundImage: "url('/ThePit.png')",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          opacity: 0.15,
                          borderRadius: 8,
                          pointerEvents: "none",
                        }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <img
                            src={npc.img}
                            alt={npc.name}
                            style={{ height: 52, objectFit: "contain", filter: "drop-shadow(0 2px 8px #00000088)" }}
                          />
                          <div style={{ ...s.orb(16), color: "var(--rb)" }}>1vs1 — {npc.name}</div>
                        </div>
                        <button
                          className="btn-hover"
                          onClick={() => {
                            setWh1vs1({ player: null, stat: null, diff: null, result: null });
                            setSubView("workhard");
                          }}
                          style={s.btn(0)}
                        >
                          ← The Pit
                        </button>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--txf)", fontStyle: "italic" }}>
                        "{npc.quote}" — {npc.desc}
                      </div>

                      {/* Result */}
                      {wh1vs1.result && (
                        <div
                          className="fi"
                          style={{
                            ...s.panel,
                            padding: 20,
                            borderColor: wh1vs1.result.won ? "var(--gn)" : "var(--rd)",
                            ...s.panelGlow(wh1vs1.result.won ? "var(--gn)" : "var(--rd)"),
                          }}
                        >
                          <div
                            style={{
                              ...s.orb(18),
                              color: wh1vs1.result.won ? "var(--gn)" : "var(--rb)",
                              marginBottom: 8,
                            }}
                          >
                            {wh1vs1.result.won ? "VINTO!" : "SCONFITTO"}
                          </div>
                          <div
                            style={{
                              fontFamily: "'Space Mono',monospace",
                              fontSize: 13,
                              color: "var(--tx)",
                              marginBottom: 6,
                            }}
                          >
                            {wh1vs1.player?.name}:{" "}
                            <span style={{ color: "var(--gd)" }}>{wh1vs1.result.playerRoll}</span>
                            {"  vs  "}
                            {npc.name}: <span style={{ color: "var(--rb)" }}>{wh1vs1.result.npcRoll}</span>
                            {wh1vs1.result.npcBonus > 0 && (
                              <span style={{ color: "var(--txf)", fontSize: 10 }}>
                                {" "}
                                (+{wh1vs1.result.npcBonus} bonus)
                              </span>
                            )}
                          </div>
                          {wh1vs1.result.won && (
                            <div style={{ fontSize: 12, color: "var(--gd)" }}>
                              {wh1vs1.result.diff === "easy"
                                ? `+1 ${wh1vs1.stat === "atk" ? "ATK" : "DEF"} flat assegnato a ${wh1vs1.player?.name}`
                                : `Dado ${wh1vs1.stat === "atk" ? "ATK" : "DEF"} di ${wh1vs1.player?.name} potenziato!`}
                            </div>
                          )}
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 20 }}>
                        {/* Selezione giocatore */}
                        <div style={{ flex: 1 }}>
                          <div style={s.lbl}>Scegli il tuo giocatore</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                            {g.field.map((p) => {
                              const gb = gearB(p);
                              const selected = wh1vs1.player?.id === p.id;
                              return (
                                <div
                                  key={p.id}
                                  onClick={() =>
                                    !wh1vs1.result && setWh1vs1((prev) => ({ ...prev, player: p, result: null }))
                                  }
                                  style={{
                                    ...s.panel,
                                    padding: "10px 14px",
                                    cursor: wh1vs1.result ? "default" : "pointer",
                                    borderColor: selected ? "var(--gd)" : "var(--bd)",
                                    boxShadow: selected ? "0 0 10px var(--gd)55" : "none",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                  }}
                                >
                                  <div style={{ flex: 1 }}>
                                    <div
                                      style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "var(--tx)" }}
                                    >
                                      {p.name}
                                    </div>
                                    <div style={{ fontSize: 10, color: "var(--txd)" }}>
                                      ATK {RARITIES[p.atkDie].label}
                                      {gb.af ? `+${gb.af}` : ""} · DEF {RARITIES[p.defDie].label}
                                      {gb.df ? `+${gb.df}` : ""}
                                    </div>
                                  </div>
                                  {selected && <span style={{ color: "var(--gd)", fontSize: 14 }}>✓</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Selezione stat */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 180 }}>
                          <div>
                            <div style={s.lbl}>Caratteristica</div>
                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                              {["atk", "def"].map((st) => (
                                <button
                                  key={st}
                                  className="btn-hover"
                                  onClick={() =>
                                    !wh1vs1.result && setWh1vs1((prev) => ({ ...prev, stat: st, result: null }))
                                  }
                                  style={{
                                    ...s.hdrBtn(wh1vs1.stat === st, st === "atk" ? "var(--rb)" : "var(--bl)"),
                                    flex: 1,
                                    pointerEvents: wh1vs1.result ? "none" : "auto",
                                  }}
                                >
                                  {st.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div style={s.lbl}>Difficoltà</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                              <button
                                className="btn-hover"
                                onClick={() => {
                                  if (!wh1vs1.result && wh1vs1.player && wh1vs1.stat && !g.whDone?.easy)
                                    runChallenge("easy");
                                }}
                                disabled={!wh1vs1.player || !wh1vs1.stat || !!wh1vs1.result || g.whDone?.easy}
                                style={{
                                  ...(!wh1vs1.player || !wh1vs1.stat || !!wh1vs1.result || g.whDone?.easy
                                    ? s.dis
                                    : s.btn(1, "var(--gn)")),
                                  padding: "8px 12px",
                                }}
                              >
                                {g.whDone?.easy ? "Easy ✓" : `EASY — 1d${npc.die}`}
                              </button>
                              <button
                                className="btn-hover"
                                onClick={() => {
                                  if (!wh1vs1.result && wh1vs1.player && wh1vs1.stat && !g.whDone?.hard)
                                    runChallenge("hard");
                                }}
                                disabled={!wh1vs1.player || !wh1vs1.stat || !!wh1vs1.result || g.whDone?.hard}
                                style={{
                                  ...(!wh1vs1.player || !wh1vs1.stat || !!wh1vs1.result || g.whDone?.hard
                                    ? s.dis
                                    : s.btn(1, "var(--rb)")),
                                  padding: "8px 12px",
                                }}
                              >
                                {g.whDone?.hard ? "Hard ✓" : `HARD — 1d${npc.die}+2`}
                              </button>
                            </div>
                          </div>

                          {wh1vs1.result && !bothDone && (
                            <button
                              className="btn-hover"
                              onClick={() => setWh1vs1({ player: null, stat: null, diff: null, result: null })}
                              style={s.btn(0, "var(--gd)")}
                            >
                              Sfida di nuovo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

              {/* ── ROLL THE DICE SCREEN ── */}
              {subView === "rtd" &&
                (() => {
                  const runRtd = () => {
                    const playerRoll = roll(20);
                    const npcRoll = roll(20);
                    let goldDelta = 0;
                    if (playerRoll > npcRoll) goldDelta = (playerRoll - npcRoll) * 3;
                    else if (playerRoll < npcRoll) goldDelta = -Math.floor(g.gold / 2);
                    up({ gold: Math.max(0, g.gold + goldDelta), whDone: { ...g.whDone, rtd: true } });
                    setWhRtd({ result: { playerRoll, npcRoll, goldDelta } });
                    log(
                      goldDelta > 0
                        ? `Zax-7: ${playerRoll} vs ${npcRoll} — +${goldDelta}◆`
                        : goldDelta < 0
                          ? `Zax-7: ${playerRoll} vs ${npcRoll} — crediti dimezzati (${goldDelta}◆)`
                          : `Zax-7: ${playerRoll} vs ${npcRoll} — pareggio`
                    );
                  };

                  return (
                    <div
                      className="fi"
                      style={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 24,
                        width: "100%",
                        maxWidth: 820,
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundImage: "url('/RollTheDice.png')",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          opacity: 0.18,
                          borderRadius: 8,
                          pointerEvents: "none",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <div style={{ ...s.orb(16), color: "var(--pp)" }}>Roll the Dice</div>
                        <button
                          className="btn-hover"
                          onClick={() => {
                            setWhRtd({ result: null });
                            setSubView("workhard");
                          }}
                          style={s.btn(0)}
                        >
                          ← The Pit
                        </button>
                      </div>

                      <div style={{ display: "flex", gap: 24, alignItems: "flex-end", width: "100%" }}>
                        {/* Vega */}
                        <div
                          style={{
                            ...s.panel,
                            flex: 1,
                            padding: "16px 20px",
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <img
                            src={IMAGES.vega}
                            alt="Vega"
                            style={{ height: 120, objectFit: "contain", filter: "drop-shadow(0 2px 12px #00000099)" }}
                          />
                          <div style={{ ...s.orb(12), color: "var(--gd)", marginTop: 8 }}>Coach Vega</div>
                          {whRtd.result && (
                            <div
                              style={{
                                fontSize: 44,
                                fontFamily: "'Orbitron',sans-serif",
                                fontWeight: 900,
                                color: whRtd.result.playerRoll > whRtd.result.npcRoll ? "var(--gd)" : "var(--txd)",
                                marginTop: 4,
                              }}
                            >
                              {whRtd.result.playerRoll}
                            </div>
                          )}
                        </div>

                        {/* Centro: Zax-7 croupier + dado + bottone */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 8,
                            minWidth: 140,
                          }}
                        >
                          <img
                            src={CROUPIER.img}
                            alt={CROUPIER.name}
                            style={{ height: 80, objectFit: "contain", filter: "drop-shadow(0 2px 10px #7B5BA088)" }}
                          />
                          <div
                            style={{
                              fontSize: 10,
                              color: "var(--pp)",
                              fontFamily: "'Orbitron',sans-serif",
                              letterSpacing: 1,
                            }}
                          >
                            {CROUPIER.name}
                          </div>
                          <div style={{ fontSize: 28 }}>🎲</div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "var(--txf)",
                              fontFamily: "'Orbitron',sans-serif",
                              letterSpacing: 2,
                            }}
                          >
                            d20
                          </div>
                          {!whRtd.result && !g.whDone?.rtd && (
                            <button className="btn-hover" onClick={runRtd} style={s.btnBig("var(--pp)")}>
                              Lancia!
                            </button>
                          )}
                        </div>

                        {/* Bravaccio */}
                        <div
                          style={{
                            ...s.panel,
                            flex: 1,
                            padding: "16px 20px",
                            textAlign: "center",
                            borderColor: "var(--rb)55",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <img
                            src={BRAVACCIO.img}
                            alt={BRAVACCIO.name}
                            style={{ height: 120, objectFit: "contain", filter: "drop-shadow(0 2px 12px #00000099)" }}
                          />
                          <div style={{ ...s.orb(12), color: "var(--rb)", marginTop: 8 }}>{BRAVACCIO.name}</div>
                          {whRtd.result && (
                            <div
                              style={{
                                fontSize: 44,
                                fontFamily: "'Orbitron',sans-serif",
                                fontWeight: 900,
                                color: whRtd.result.npcRoll > whRtd.result.playerRoll ? "var(--rb)" : "var(--txd)",
                                marginTop: 4,
                              }}
                            >
                              {whRtd.result.npcRoll}
                            </div>
                          )}
                        </div>
                      </div>

                      {whRtd.result && (
                        <div
                          className="fi"
                          style={{
                            ...s.panel,
                            padding: 24,
                            textAlign: "center",
                            width: "100%",
                            borderColor:
                              whRtd.result.goldDelta > 0
                                ? "var(--gn)"
                                : whRtd.result.goldDelta < 0
                                  ? "var(--rd)"
                                  : "var(--bd)",
                            ...s.panelGlow(
                              whRtd.result.goldDelta > 0
                                ? "var(--gn)"
                                : whRtd.result.goldDelta < 0
                                  ? "var(--rd)"
                                  : "var(--bd)"
                            ),
                          }}
                        >
                          <div
                            style={{
                              ...s.orb(20),
                              color:
                                whRtd.result.goldDelta > 0
                                  ? "var(--gd)"
                                  : whRtd.result.goldDelta < 0
                                    ? "var(--rb)"
                                    : "var(--txd)",
                              marginBottom: 6,
                            }}
                          >
                            {whRtd.result.goldDelta > 0
                              ? `+${whRtd.result.goldDelta}◆`
                              : whRtd.result.goldDelta < 0
                                ? `${whRtd.result.goldDelta}◆`
                                : "Pareggio"}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--txd)" }}>
                            {whRtd.result.goldDelta > 0
                              ? "Vega sorride. Zax-7 non batte ciglio."
                              : whRtd.result.goldDelta < 0
                                ? 'Zax-7: "Come previsto." — crediti dimezzati.'
                                : "Un pareggio. Nessuno guadagna, nessuno perde."}
                          </div>
                        </div>
                      )}

                      {g.whDone?.rtd && !whRtd.result && (
                        <div style={{ fontSize: 12, color: "var(--txf)", fontStyle: "italic" }}>
                          Sfida già completata questo piano.
                        </div>
                      )}
                    </div>
                  );
                })()}
            </div>
          </>
        )}

        {/* ═══════════ PREMATCH ═══════════ */}
        {g.phase === "prematch" && (
          <>
            <div style={s.hdr}>
              <img src={IMAGES.logo} alt="" style={{ height: 36, objectFit: "contain" }} />
              <div style={{ flex: 1 }} />
              <span style={{ ...s.orb(12), color: "var(--gd)" }}>◆ {g.gold}</span>
              <span style={{ ...s.orb(11), color: "var(--txd)" }}>Piano {g.floor}/6</span>
            </div>

            {/* Drava — spettatrice in alto a destra */}
            <img
              src={IMAGES.drava}
              alt="Drava"
              style={{
                position: "absolute",
                bottom: 0,
                right: "2%",
                height: "60%",
                objectFit: "contain",
                zIndex: 1,
                pointerEvents: "none",
                opacity: 0.85,
                filter: "drop-shadow(0 0 32px rgba(138,43,226,0.35))",
              }}
            />

            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px 40px",
                overflow: "hidden",
              }}
            >
              <div
                className="fi"
                style={{ display: "flex", gap: 32, alignItems: "flex-start", maxWidth: 1100, width: "100%" }}
              >
                {/* Boss info + roster */}
                <div
                  className="fiL"
                  style={{
                    flex: 1,
                    ...s.panel,
                    ...s.panelGlow("var(--rb)"),
                    padding: 30,
                    overflowY: "auto",
                    maxHeight: "calc(100vh - 180px)",
                  }}
                >
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ ...s.lbl, color: "var(--rb)" }}>Avversario — Piano {g.floor}</div>
                    <div style={{ ...s.orb(22), color: "var(--rb)", marginBottom: 6 }}>{g.boss.label}</div>
                    <div style={{ fontSize: 13, color: RACES[g.boss.clan]?.color, marginBottom: 8 }}>
                      {RACES[g.boss.clan]?.emoji} {RACES[g.boss.clan]?.name}
                    </div>
                    <div style={{ fontSize: 12, fontStyle: "italic", color: "var(--txd)", lineHeight: 1.6 }}>
                      "{g.boss.quote}"
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--bd)", paddingTop: 20, marginBottom: 16 }}>
                    <div style={s.lbl}>Giocatori in campo</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {g.boss.field.map((p) => (
                        <CardFrame key={p.id} {...playerToCardProps(p, { size: 180 })} />
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={s.lbl}>Panchina</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {g.boss.bench.map((p) => (
                        <CardFrame key={p.id} {...playerToCardProps(p, { size: 180 })} />
                      ))}
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--bd)", paddingTop: 16 }}>
                    <div style={s.lbl}>Strategie</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {g.boss.atkStrategies.slice(0, 5).map((st, i) => (
                        <CardFrame key={st.id + i} {...strategyToCardProps(st, "atk", { size: 180 })} />
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                      {g.boss.defStrategies.slice(0, 5).map((st, i) => (
                        <CardFrame key={st.id + i} {...strategyToCardProps(st, "def", { size: 180 })} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Azioni */}
                <div
                  className="fiR"
                  style={{ display: "flex", flexDirection: "column", gap: 16, width: 280, flexShrink: 0 }}
                >
                  <div style={{ ...s.panel, padding: 20, borderColor: "var(--gd)33" }}>
                    <div style={{ ...s.lbl, marginBottom: 10 }}>Il tuo campo</div>
                    {g.field.map((p, i) => (
                      <div
                        key={p.id}
                        style={{
                          fontSize: 12,
                          color: "var(--tx)",
                          marginBottom: 6,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ ...s.ft, ...s.orb(10), minWidth: 18 }}>#{i + 1}</span>
                        <span style={{ color: RARITIES[p.rarity].color }}>◈</span> {p.name}
                        <span style={{ ...s.ft, fontSize: 10, marginLeft: "auto" }}>{RACES[p.race].emoji}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className="btn-hover"
                    onClick={returnToTeam}
                    style={{ ...s.btn(0, "var(--bl)"), padding: "14px 20px", textAlign: "center", fontSize: 13 }}
                  >
                    ← Il Mio Team
                  </button>

                  <button
                    className="btn-hover"
                    onClick={play}
                    disabled={g.field.length < 3}
                    style={g.field.length < 3 ? { ...s.dis } : { ...s.btnBig("var(--gd)") }}
                  >
                    GIOCA
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══════════ RESULT ═══════════ */}
        {g.phase === "result" &&
          g.matchResult &&
          (() => {
            const bossName = g.boss?.label || "Boss";
            const colMap = {
              round: "var(--txd)",
              player: "var(--gd)",
              boss: "var(--rb)",
              score: "var(--gd)",
              "score-boss": "var(--rb)",
              def: "#5B8BC4",
              special: "#C4A85B",
              log: "var(--txd)",
              spacer: "transparent",
            };

            return (
              <>
                {/* ── POP-UP CARDS ── */}
                {!crawlDone &&
                  (() => {
                    // Punteggio parziale: conta le card score/score-boss già mostrate
                    const seen = crawlLines.slice(0, crawlIdx + 1);
                    const partialScore1 = seen.filter((l) => l.t === "score").length * 2;
                    const partialScore2 = seen.filter((l) => l.t === "score-boss").length * 2;
                    // Turno corrente: quanti header "round" sono già passati
                    const totalRounds = crawlLines.filter((l) => l.t === "round").length || 1;
                    const currentRound = seen.filter((l) => l.t === "round").length;
                    // Orologio simulato: ogni turno = ~2:30 di partita, countdown da 10:00 per quarto
                    const progress = crawlLines.length > 0 ? crawlIdx / crawlLines.length : 0;
                    const totalSecs = totalRounds * 150; // 2:30 per turno
                    const elapsedSecs = Math.floor(progress * totalSecs);
                    const mm = String(Math.floor(elapsedSecs / 60)).padStart(2, "0");
                    const ss = String(elapsedSecs % 60).padStart(2, "0");

                    const card = crawlLines[crawlIdx];
                    const showCard = card && card.t !== "spacer";
                    const isRound = showCard && card.t === "round";
                    const isScore = showCard && (card.t === "score" || card.t === "score-boss");
                    const isSpecial = showCard && card.t === "special";
                    const color = showCard ? colMap[card.t] || "var(--txd)" : "var(--txd)";
                    const borderColor = isScore ? color : isRound ? "var(--bd)" : isSpecial ? "#C4A85B44" : "var(--bd)";

                    return (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 50,
                          pointerEvents: "none",
                        }}
                      >
                        {/* ── TABELLONE ── */}
                        <div
                          style={{
                            position: "absolute",
                            top: 16,
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            alignItems: "center",
                            gap: 0,
                            background: "rgba(8,5,3,0.88)",
                            border: "1px solid var(--bd)",
                            borderRadius: 6,
                            overflow: "hidden",
                            minWidth: 480,
                          }}
                        >
                          {/* Vega */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              padding: "8px 24px",
                              borderRight: "1px solid var(--bd)",
                              minWidth: 140,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 9,
                                letterSpacing: 3,
                                color: "var(--gdd)",
                                fontFamily: "'Orbitron',sans-serif",
                                marginBottom: 2,
                              }}
                            >
                              COACH VEGA
                            </div>
                            <div
                              style={{
                                fontSize: 36,
                                fontFamily: "'Orbitron',sans-serif",
                                fontWeight: 900,
                                color: partialScore1 > partialScore2 ? "var(--gd)" : "var(--tx)",
                                lineHeight: 1,
                              }}
                            >
                              {partialScore1}
                            </div>
                          </div>
                          {/* Centro: clock + turno */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              padding: "8px 20px",
                              minWidth: 120,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 22,
                                fontFamily: "'Space Mono',monospace",
                                fontWeight: 700,
                                color: "var(--tx)",
                                letterSpacing: 2,
                                lineHeight: 1,
                              }}
                            >
                              {mm}:{ss}
                            </div>
                            <div
                              style={{
                                fontSize: 9,
                                letterSpacing: 2,
                                color: "var(--txf)",
                                fontFamily: "'Orbitron',sans-serif",
                                marginTop: 4,
                              }}
                            >
                              TURNO {currentRound}/{totalRounds}
                            </div>
                          </div>
                          {/* Boss */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              padding: "8px 24px",
                              borderLeft: "1px solid var(--bd)",
                              minWidth: 140,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 9,
                                letterSpacing: 3,
                                color: "#8B3A3A",
                                fontFamily: "'Orbitron',sans-serif",
                                marginBottom: 2,
                                maxWidth: 130,
                                textAlign: "center",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {bossName.toUpperCase()}
                            </div>
                            <div
                              style={{
                                fontSize: 36,
                                fontFamily: "'Orbitron',sans-serif",
                                fontWeight: 900,
                                color: partialScore2 > partialScore1 ? "var(--rb)" : "var(--tx)",
                                lineHeight: 1,
                              }}
                            >
                              {partialScore2}
                            </div>
                          </div>
                        </div>

                        {/* progress bar sotto il tabellone */}
                        <div
                          style={{
                            position: "absolute",
                            top: 100,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 480,
                            height: 2,
                            background: "var(--bd)",
                            borderRadius: 1,
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${Math.round(progress * 100)}%`,
                              background: "var(--gd)",
                              borderRadius: 1,
                              transition: "width .3s linear",
                            }}
                          />
                        </div>

                        {/* card azione */}
                        {showCard && (
                          <div
                            key={crawlIdx}
                            style={{
                              animation: "popIn .22s cubic-bezier(.22,1,.36,1) both",
                              background: isScore ? `${color}18` : "rgba(10,7,5,0.82)",
                              border: `1px solid ${borderColor}`,
                              borderRadius: 6,
                              padding: isScore ? "28px 60px" : isRound ? "14px 48px" : "16px 40px",
                              maxWidth: 640,
                              textAlign: "center",
                              boxShadow: isScore ? `0 0 40px ${color}55` : "0 4px 24px #00000088",
                              marginTop: 60,
                            }}
                          >
                            <div
                              style={{
                                fontFamily: isRound || isScore ? "'Orbitron',sans-serif" : "'Space Mono',monospace",
                                fontSize: isScore ? 26 : isRound ? 18 : isSpecial ? 17 : 15,
                                fontWeight: isRound || isScore ? 700 : 400,
                                color,
                                letterSpacing: isRound ? 4 : isScore ? 5 : 0.5,
                                textTransform: isRound || isScore ? "uppercase" : "none",
                                lineHeight: 1.4,
                              }}
                            >
                              {card.v}
                            </div>
                          </div>
                        )}

                        <button
                          className="btn-hover"
                          onClick={() => setCrawlDone(true)}
                          style={{
                            pointerEvents: "all",
                            position: "absolute",
                            bottom: 24,
                            right: 32,
                            ...s.btn(0, "var(--txd)"),
                            fontSize: 11,
                            zIndex: 10,
                          }}
                        >
                          Salta →
                        </button>
                      </div>
                    );
                  })()}

                {/* ── RESULT PANEL (dopo cards) ── */}
                {crawlDone && (
                  <>
                    <div style={s.hdr}>
                      <img src={IMAGES.logo} alt="" style={{ height: 36, objectFit: "contain" }} />
                      <div style={{ flex: 1 }} />
                      <span style={{ ...s.orb(12), color: "var(--gd)" }}>◆ {g.gold}</span>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px 40px",
                      }}
                    >
                      <div
                        className="fi"
                        style={{
                          ...s.panel,
                          ...s.panelGlow(g.matchResult.winner === 1 ? "var(--gd)" : "var(--rb)"),
                          display: "flex",
                          alignItems: "center",
                          gap: 48,
                          padding: "36px 80px",
                          marginBottom: 24,
                        }}
                      >
                        <div style={{ textAlign: "center" }}>
                          <div style={{ ...s.lbl, color: "var(--gd)" }}>Coach Vega</div>
                          <div style={{ ...s.orb(64), color: g.matchResult.winner === 1 ? "var(--gd)" : "var(--txf)" }}>
                            {g.matchResult.score1}
                          </div>
                        </div>
                        <div style={{ ...s.ft, ...s.orb(28) }}>—</div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ ...s.lbl, color: "var(--rb)" }}>{bossName}</div>
                          <div style={{ ...s.orb(64), color: g.matchResult.winner === 2 ? "var(--rb)" : "var(--txf)" }}>
                            {g.matchResult.score2}
                          </div>
                        </div>
                      </div>
                      {g.matchResult.suddenDeath && (
                        <div style={{ ...s.gd, ...s.orb(11), letterSpacing: 4, marginBottom: 10 }}>SUDDEN DEATH</div>
                      )}
                      <div
                        className="fi"
                        style={{
                          ...s.orb(22),
                          letterSpacing: 5,
                          marginBottom: 10,
                          color: g.matchResult.winner === 1 ? "var(--gd)" : "var(--rb)",
                        }}
                      >
                        {g.matchResult.winner === 1 ? "VITTORIA" : "SCONFITTA"}
                      </div>
                      {g.matchResult.winner === 1 && (
                        <div style={{ ...s.gd, fontSize: 14, marginBottom: 28 }}>+{g.matchResult.goldEarned}◆</div>
                      )}
                      <button
                        className="btn-hover"
                        onClick={after}
                        style={s.btnBig(g.matchResult.winner === 1 ? "var(--gd)" : "var(--rb)")}
                      >
                        {g.matchResult.winner === 1 ? (g.floor >= 6 ? "COMPLETA" : `PIANO ${g.floor + 1}`) : "FINE"}
                      </button>
                    </div>
                  </>
                )}
              </>
            );
          })()}
      </div>

      {/* ═══════════ ZOOM PANEL ═══════════ */}
      {zoom && (
        <div
          className="fi"
          style={{ position: "fixed", bottom: 24, right: 24, zIndex: 600, width: 320, pointerEvents: "none" }}
        >
          <div
            style={{
              ...s.panel,
              ...(zoom.kind === "player"
                ? s.panelGlow(RARITIES[zoom.data.rarity]?.color || "var(--gd)")
                : s.panelGlow("var(--gd)")),
              padding: 20,
            }}
          >
            {zoom.kind === "player" && <PCZoom p={zoom.data} />}
            {zoom.kind === "strat" && <CardFrame {...strategyToCardProps(zoom.data, zoom.extra)} />}
            {zoom.kind === "gear" && <CardFrame {...gearToCardProps(zoom.data)} />}
          </div>
        </div>
      )}
    </div>
  );
}
