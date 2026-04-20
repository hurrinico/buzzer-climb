import { RARITIES } from "../data/constants";

// ============================================================
// ENGINE (balanced v0.2)
// ============================================================
export const roll = (s) => Math.floor(Math.random() * s) + 1;
export const die = (p, t) => RARITIES[t === "atk" ? p.atkDie : p.defDie].die;
export const syn = (f, b, st) =>
  st.bonusBase +
  f.filter((p) => p.race === st.race).length * st.bonusRace +
  Math.floor(b.filter((p) => p.race === st.race).length * st.bonusRace * 0.5);
export const dsyn = (f, b, st) => st.bonusBase + f.filter((p) => p.race === st.race).length * st.bonusRace;
export const gearB = (p) => {
  const g = p.equippedGear || [];
  let af = 0,
    df = 0,
    ad = 0,
    dd = 0;
  for (const x of g) {
    if (x.effect === "atkFlat") af += x.value;
    if (x.effect === "defFlat") df += x.value;
    if (x.effect === "atkDice") ad += x.value;
    if (x.effect === "defDice") dd += x.value;
    if (x.effect === "atkDicePlus") {
      ad += 1;
      af += 2;
    }
  }
  return { af, df, ad, dd };
};

export function simRound(aT, dT, aS, dS) {
  const log = [];
  const as = syn(aT.field, aT.bench, aS);
  const ds = dsyn(dT.field, dT.bench, dS);
  log.push(`${aS.name} [+${as}] vs ${dS.name} [+${ds}]`);
  if (aS.mechanic === "corruption") {
    const t = [...dT.field].sort((a, b) => a.loyalty - b.loyalty)[0];
    const pw = roll(6) + roll(6) + as;
    const rs = t.loyalty * 2;
    log.push(`Corruzione: ${t.name} (L${t.loyalty}) — ${pw} vs ${rs}`);
    if (pw > rs) {
      log.push(`${t.name} corrotto`);
      return { scored: false, log, corruption: t };
    }
    log.push(`${t.name} resiste`);
    return { scored: false, log };
  }
  const pc = Math.min(aS.passCount || 0, aT.field.length - 1);
  let pb = 0;
  const pbn = aS.passBonus || 0;
  if (dS.mechanic === "blitz") {
    const br = roll(die(dT.field[0], "def"));
    const ar = roll(die(aT.field[0], "atk"));
    log.push(`Blitz: ${dT.field[0].name}(${br}) vs ${aT.field[0].name}(${ar})`);
    if (br > ar) {
      log.push(`Rubata`);
      return { scored: false, log };
    }
    log.push(`Blitz fallito`);
  }
  const bf = dS.mechanic === "blitz";
  let inter = false;
  for (let i = 0; i < pc; i++) {
    const ps = aT.field[i];
    const rv = aT.field[i + 1];
    const mk = dT.field[Math.min(i + 1, dT.field.length - 1)];
    const gb = gearB(ps);
    const pr = roll(die(ps, "atk")) + as + gb.af;
    let ib = 0;
    if (dS.mechanic === "deny") ib += 2;
    if (dS.mechanic === "deny_first" && i === 0) ib += 3;
    if (dS.mechanic === "press") ib += 2;
    const ir = roll(die(mk, "def")) + ib;
    log.push(`${ps.name}(${pr}) → ${rv.name} vs ${mk.name}(${ir})`);
    if (ir >= pr) {
      log.push(`Intercetto`);
      inter = true;
      break;
    }
    log.push(`Pass completato`);
    pb += pbn;
  }
  if (inter) return { scored: false, log };
  const si = Math.min(pc, aT.field.length - 1);
  const sh = aT.field[si];
  const df = dT.field[Math.min(si, dT.field.length - 1)];
  const sg = gearB(sh);
  const dg = gearB(df);
  let adc = 1 + sg.ad + (aS.extraDice || 0);
  let afl = as + pb + sg.af;
  let ddc = 1 + dg.dd;
  let dfl = ds + dg.df;
  if (dS.mechanic === "wall" && pc > 0) dfl += 2;
  if (dS.mechanic === "wall" && pc === 0) dfl -= 1;
  if (dS.mechanic === "double_team") ddc += 1;
  if (dS.mechanic === "trap" && pc >= 2) dfl += 3;
  if (dS.mechanic === "trap" && pc === 0) dfl -= 1;
  if (dS.mechanic === "ambush" && pc === 0) dfl += 2;
  if (dS.mechanic === "ambush" && pc > 0) dfl -= 1;
  if (bf) dfl -= 1;
  dfl = Math.max(0, dfl);
  let at = afl;
  const ar = [];
  for (let i = 0; i < adc; i++) {
    const r = roll(die(sh, "atk"));
    ar.push(r);
    at += r;
  }
  let dt = dfl;
  const dr = [];
  for (let i = 0; i < ddc; i++) {
    const r = roll(die(df, "def"));
    dr.push(r);
    dt += r;
  }
  log.push(`${sh.name}: ${adc}d${die(sh, "atk")}[${ar}]+${afl} = ${at}`);
  log.push(`${df.name}: ${ddc}d${die(df, "def")}[${dr}]+${dfl} = ${dt}`);
  let scored = at > dt;
  if (scored) log.push(`CANESTRO (+2)`);
  else {
    const m = dt - at;
    log.push(`Difeso (+${m})`);
    if (dS.mechanic === "physical" && m >= 8) {
      log.push(`${sh.name} infortunato`);
      return { scored: false, log, injury: sh };
    }
  }
  if (scored && dS.mechanic === "help") {
    const hr = roll(4) + ds;
    log.push(`Help: ${hr} vs ${at}`);
    if (hr >= at) {
      log.push(`Help salva`);
      return { scored: false, log };
    }
  }
  return { scored, log };
}

export function simMatch(t1, t2) {
  const rounds = [];
  let s1 = 0,
    s2 = 0;
  for (let i = 0; i < 5; i++) {
    const r1 = simRound(t1, t2, t1.atkStrategies[i], t2.defStrategies[i]);
    if (r1.scored) s1 += 2;
    rounds.push({ attacker: 1, ...r1 });
    if (s1 >= 10) break;
    const r2 = simRound(t2, t1, t2.atkStrategies[i], t1.defStrategies[i]);
    if (r2.scored) s2 += 2;
    rounds.push({ attacker: 2, ...r2 });
    if (s2 >= 10) break;
  }
  let sd = false;
  if (s1 === s2) {
    sd = true;
    const r = simRound(t1, t2, t1.atkStrategies[0], t2.defStrategies[0]);
    if (r.scored) s1 += 2;
    rounds.push({ attacker: 1, suddenDeath: true, ...r });
    if (s1 === s2) {
      const r2 = simRound(t2, t1, t2.atkStrategies[0], t1.defStrategies[0]);
      if (r2.scored) s2 += 2;
      rounds.push({ attacker: 2, suddenDeath: true, ...r2 });
    }
  }
  let ge = 0;
  for (const r of rounds) {
    if (r.attacker === 1 && r.scored) ge++;
    if (r.attacker === 2 && !r.scored && !r.corruption) ge++;
  }
  return { score1: s1, score2: s2, rounds, suddenDeath: sd, winner: s1 > s2 ? 1 : s2 > s1 ? 2 : 0, goldEarned: ge };
}
