import * as Tone from "tone";

// ============================================================
// AUDIO v2 — GOTHIC NEON ARENA (Tone.js)
// 90 BPM · La Frigio · Gotico + neon sci-fi
// ============================================================
let _audioOk = false;
let _masterVerb = null; // shared reverb — usato anche dagli SFX
let _intensityFilter = null; // filtro dinamico per piano

// Chiamare quando il giocatore sale di piano — apre il filtro gradualmente
export const setAudioIntensity = (floor) => {
  if (!_intensityFilter) return;
  const freq = { 1: 600, 2: 850, 3: 1100, 4: 1400, 5: 1800, 6: 2600 };
  _intensityFilter.frequency.rampTo(freq[floor] || 800, 2.5);
};

const _setupBg = async () => {
  Tone.getTransport().bpm.value = 90;

  // ── Master bus: Filter(dinamico) → Reverb(0.4) → Out ──
  _masterVerb = new Tone.Reverb({ decay: 6, wet: 0.4 }).toDestination();
  await _masterVerb.ready;
  _intensityFilter = new Tone.Filter({ frequency: 600, type: "lowpass", rolloff: -12 }).connect(_masterVerb);

  // ─────────────────────────────────────────────────────
  // 1. BASE RITMICA
  // ─────────────────────────────────────────────────────

  // Kick — MembraneSynth morbido, battito cardiaco profondo
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.09,
    octaves: 7,
    volume: -8,
    envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.15 },
  }).connect(_intensityFilter);
  const kickPart = new Tone.Part(
    (time, vel) => {
      kick.triggerAttackRelease("C1", "8n", time, vel);
    },
    [
      { time: "0:0:0", vel: 1 },
      { time: "0:2:0", vel: 0.4 },
      { time: "1:0:0", vel: 1 },
      { time: "1:2:0", vel: 0.4 },
    ]
  );
  kickPart.loop = true;
  kickPart.loopEnd = "2m";
  kickPart.start(0);

  // Hi-hat metallico — catene e ingranaggi gotici, pattern irregolare
  const hatHPF = new Tone.Filter({ frequency: 5000, type: "highpass" }).connect(_intensityFilter);
  const hat = new Tone.MetalSynth({
    frequency: 300,
    harmonicity: 5.1,
    modulationIndex: 16,
    resonance: 3200,
    octaves: 1.2,
    volume: -26,
    envelope: { attack: 0.001, decay: 0.06, release: 0.01 },
  }).connect(hatHPF);
  const hatPart = new Tone.Part(
    (time) => {
      hat.triggerAttackRelease("32n", time);
    },
    [
      { time: "0:0:2" },
      { time: "0:1:1" },
      { time: "0:1:3" },
      { time: "0:2:2" },
      { time: "0:3:0" },
      { time: "0:3:2" },
      { time: "1:0:2" },
      { time: "1:1:1" },
      { time: "1:1:3" },
      { time: "1:2:2" },
      { time: "1:2:3" },
      { time: "1:3:2" },
    ]
  );
  hatPart.loop = true;
  hatPart.loopEnd = "2m";
  hatPart.start("+0.05");

  // ─────────────────────────────────────────────────────
  // 2. ARPEGGIATORE — cristallino, ipnotico
  //    Square4 + PingPongDelay → rimbalza nelle arene verticali
  // ─────────────────────────────────────────────────────
  const arpDelay = new Tone.PingPongDelay({ delayTime: "16n", feedback: 0.28, wet: 0.5 }).connect(_intensityFilter);
  const arpSynth = new Tone.Synth({
    oscillator: { type: "square4" },
    volume: -22,
    envelope: { attack: 0.004, decay: 0.15, sustain: 0.05, release: 0.4 },
    filterEnvelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.5, baseFrequency: 1200, octaves: 2 },
  }).connect(arpDelay);
  // La Frigio: A Bb C D E F G — pattern ipnotico a 16ne
  const arpSeq = new Tone.Sequence(
    (time, note) => {
      if (note) arpSynth.triggerAttackRelease(note, "16n", time);
    },
    ["A5", "E5", "C5", "A4", "G5", "F5", "C5", "E5", "A5", "D5", "Bb4", "E5", "F5", "C5", "G4", null],
    "16n"
  );
  arpSeq.loop = true;
  arpSeq.start(0);

  // ─────────────────────────────────────────────────────
  // 3. CHOIR PAD — grandiosità di una cattedrale verticale
  //    PolySynth sawtooth, attack lento, accordi Am / F / G / Em
  // ─────────────────────────────────────────────────────
  const choir = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    volume: -19,
    envelope: { attack: 1.2, decay: 2, sustain: 0.65, release: 5 },
  }).connect(_intensityFilter);
  const chordPart = new Tone.Part(
    (t, v) => {
      choir.triggerAttackRelease(v.notes, v.dur, t);
    },
    [
      { time: "0:0:0", notes: ["A2", "E3", "A3", "C4"], dur: "4m" },
      { time: "4:0:0", notes: ["F2", "C3", "F3", "A3"], dur: "4m" },
      { time: "8:0:0", notes: ["G2", "D3", "G3", "Bb3"], dur: "4m" },
      { time: "12:0:0", notes: ["E2", "B2", "E3", "G3"], dur: "4m" },
    ]
  );
  chordPart.loop = true;
  chordPart.loopEnd = "16m";
  chordPart.start(0);

  Tone.getTransport().start();
};

export const initAudio = async () => {
  if (_audioOk) return;
  try {
    await Tone.start();
    _audioOk = true;
    await _setupBg();
  } catch (e) {
    /* silently fail */
  }
};

// ─── SFX — in La minore, coerenti con il nuovo tema ───

export const sfxEnterRun = () => {
  if (!_audioOk) return;
  const dest = _masterVerb || Tone.getDestination();
  const delay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.3, wet: 0.35 }).connect(dest);
  const s = new Tone.Synth({
    oscillator: { type: "sine" },
    volume: -16,
    envelope: { attack: 0.4, decay: 0.6, sustain: 0.5, release: 3.5 },
  }).connect(delay);
  s.triggerAttackRelease("A2", "4n");
  setTimeout(() => s.triggerAttackRelease("E3", "2n"), 500);
  setTimeout(() => s.triggerAttackRelease("A3", "2n"), 1100);
  setTimeout(() => {
    s.dispose();
    delay.dispose();
  }, 7000);
};

export const sfxMatchStart = () => {
  if (!_audioOk) return;
  const dest = _masterVerb || Tone.getDestination();
  const s = new Tone.Synth({
    oscillator: { type: "square" },
    volume: -18,
    envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.1 },
  }).connect(dest);
  // Buzzer — tre colpi rapidi su A2
  s.triggerAttackRelease("A2", "16n");
  setTimeout(() => s.triggerAttackRelease("A2", "16n"), 160);
  setTimeout(() => s.triggerAttackRelease("E3", "8n"), 340);
  setTimeout(() => {
    s.dispose();
  }, 2500);
};

export const sfxVictory = () => {
  if (!_audioOk || !_masterVerb) return;
  const s = new Tone.PolySynth(Tone.Synth, {
    volume: -15,
    envelope: { attack: 0.05, decay: 0.3, sustain: 0.5, release: 3 },
  }).connect(_masterVerb);
  // Arpeggio ascendente Am — maestoso, non trionfante
  [
    ["A3", "C4", "E4"],
    ["C4", "E4", "A4"],
    ["E4", "A4", "C5"],
    ["A4", "C5", "E5"],
  ].forEach((c, i) => setTimeout(() => s.triggerAttackRelease(c, "4n"), i * 300));
  setTimeout(() => {
    s.dispose();
  }, 7000);
};

export const sfxDefeat = () => {
  if (!_audioOk || !_masterVerb) return;
  const s = new Tone.PolySynth(Tone.Synth, {
    volume: -15,
    envelope: { attack: 0.2, decay: 0.8, sustain: 0.3, release: 5 },
  }).connect(_masterVerb);
  // Discesa in La Frigio — lenta, pesante, inevitabile
  [
    ["A3", "E4", "A4"],
    ["G3", "D4", "G4"],
    ["F3", "C4", "F4"],
    ["E3", "Bb3", "E4"],
    ["A2", "E3", "A3"],
  ].forEach((c, i) => setTimeout(() => s.triggerAttackRelease(c, "2n"), i * 700));
  setTimeout(() => {
    s.dispose();
  }, 14000);
};
