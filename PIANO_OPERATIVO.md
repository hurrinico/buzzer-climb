# BUZZER CLIMB — Piano Operativo (v2, post-decisioni)

> Piano concreto per uscire dalla fase di stallo, aggiornato con tutte le scelte del file `DECISIONI_APERTE.md`. Ogni task è pensata per essere chiusa in ≤ 1 giornata. Ogni fase ha un "Done when" misurabile.

---

## Scelte baseline consolidate

**Stack & strategia:** Supabase (auth + DB) • Estetica prima del backend • Refactor leggero prima della UI nuova • Prodotto con monetizzazione futura → attenzione a licenze asset e deploy.

**Scope:** Desktop only 1920×1080 • Solo italiano • No analytics finché non c'è pubblico • Audio rinviato a fase dedicata.

**Estetica:** **Pixel art alta risoluzione** (riferimenti Hades 2D, Eastward) • Palette noir (colori rarità proposti validati) • **Carta QUADRATA 1:1** (stile FIFA/Marvel Snap) • Sbarre rarità come "gabbia" davanti all'immagine • Bust shot 3/4 • PNG trasparenti per player • Animazioni: hover + pulse per Rare/Legendary.

**Asset:** Leonardo.ai come generatore • Ordine: 10 umani → 12 boss → altre razze.

**Gameplay:** Transizione noir/arena rinviata a Fase 4 roadmap originale • Identità dei 5 clan definita (Fase 1a chiusa: Archivisti al piano 4-5, Fuori-Catalogo al piano 2-3).

**Layout:** Floor Hub semi-astratto con hotspot (Poster Gym / Tavolo Coach / Manichino Negozio / Sagoma Boss / Libro Log) • Drava solo via dialog box • Home screen: minor tweak (bottoni).

**Backend:** Schema 3 tabelle (`profiles`, `runs`, `clan_reputation`) • Display name auto da Google + cambiabile • Login obbligatorio per leaderboard, opzionale per giocare • Salva seed + meta jsonb da subito • Leaderboard globale top 50 all-time.

---

## Quadro temporale aggiornato

| Fase | Focus | Durata | Output concreto | Stato |
|------|-------|--------|-----------------|-------|
| 0 | Refactor + ESLint | 1 g | `App.jsx` 1966→958 righe, lint configurato, build verde | ✅ Fatto (20 apr 2026) |
| 1a | Identità Archivisti & Fuori-Catalogo | 0.5 g | Schede clan definitive | ✅ Fatto (21 apr 2026) |
| 1b | CardFrame 1:1 pixel art + rarità | 2 g | Componente carta riutilizzabile | ⏳ |
| 2 | Asset AI pixel art | 3 g | 10 umani + 12 boss renderizzati | ⏳ |
| 3 | Layout hotspot + Prematch versus | 2 g | Floor Hub e Prematch rifatti | ⏳ |
| 4 | Supabase auth + run history | 2 g | Login Google + leaderboard | ⏳ |
| 5 | Polish + playtest | 1 g | Build pronta da mostrare | ⏳ |

**Totale ≈ 11.5 giornate effettive** (~5-6 settimane a ritmo part-time).

---

# FASE 0 — Refactor leggero + linting ✅ COMPLETATA

**Obiettivo:** `App.jsx` navigabile, ESLint e Prettier attivi, nessun cambiamento funzionale.

**Branch:** `main` (il refactor è stato applicato direttamente su main in sessione live)

### Task list

- [x] **T-0.1** Branch creato (lavoro svolto su `main` — conservato storico commit)
- [x] **T-0.2** Struttura cartelle: `src/{data,engine,generation,components,styles,lib}` (no `screens/` — vedi T-0.13)
- [x] **T-0.3** Estratto `RACES`, `RARITIES`, `FLOOR_RARITY`, `SHOP_RARITY` → `src/data/constants.js` (39 righe)
- [x] **T-0.4** Estratti `HUMAN_PLAYERS`, `HUMAN_ATK`, `HUMAN_DEF` → `src/data/humans.js` (31 righe)
- [x] **T-0.5** Estratto `CLAN_DATA` → `src/data/clans.js` (301 righe)
- [x] **T-0.6** Verifica data layer ok, build ok
- [x] **T-0.7** Engine estratto (`roll`, `die`, `syn`, `dsyn`, `gearB`, `simRound`, `simMatch`) → `src/engine/match.js` (83 righe)
- [x] **T-0.8** Generazione estratta (`initRun`, `genBoss`, `genShop`, `pickRarity`, `pickShopRarity`) → `src/generation/run.js` (170 righe)
- [x] **T-0.9** Verifica engine ok
- [x] **T-0.10** `PC`, `SC`, `GearCard` → `src/components/cards/` (un file ciascuno)
- [x] **T-0.11** CSS globale → `src/styles/noir.css` (font, `:root`, keyframes, classi) + import in `main.jsx`. Styles inline in `src/styles/inline.js` (export `s`).
- [x] **T-0.12** Estratti inoltre: `src/data/assets.js` (IMAGES, FLOOR_BG, COURT_BG, WH_NPCS, CROUPIER, BRAVACCIO, DIE_TIERS, particle data), `src/components/Particles.jsx`, `src/components/PCZoom.jsx`, `src/lib/zoom.js` (registry condiviso `setZoomCallback`/`triggerZoom` — fix bug multi-istanza callback)
- [x] **T-0.13** `App.jsx` da 1966 → **958 righe** (target originale <200 non raggiungibile per vincolo B.2=A "no Context API": estrarre le schermate richiederebbe prop drilling inaccettabile. Da riprendere in futuro con state container).
- [x] **T-0.14** Build finale verde: `vite build` → 1002 moduli, 505 KB, ✓ built in 2.39s
- [x] **T-0.15** `npm install -D eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh prettier` ✅
- [x] **T-0.16** Creati `.eslintrc.cjs` (react + hooks + refresh, `no-unescaped-entities: off` per dialoghi italiani) + `.prettierrc` + `.prettierignore`. Script npm aggiunti: `lint`, `lint:fix`, `format`, `format:check`
- [x] **T-0.17** Fix bug emersi dal lint: `roll`, `gearB` mancavano dagli import di `App.jsx` (era un bug reale del refactor, non rumore). Import inutilizzati rimossi.
- [ ] **T-0.18** Merge branch — N/A (lavoro svolto direttamente su main). Resta solo: `rm -f .git/index.lock && git add -A && git commit -m "refactor(fase-0): modularize App.jsx into data/engine/components/styles"`

### Struttura finale dopo Fase 0

```
src/
├── App.jsx (958 righe: tutte le schermate inline + state root)
├── main.jsx
├── data/
│   ├── constants.js     (RACES, RARITIES, FLOOR_RARITY, SHOP_RARITY)
│   ├── humans.js        (HUMAN_PLAYERS, HUMAN_ATK, HUMAN_DEF)
│   ├── clans.js         (CLAN_DATA — 5 clan)
│   └── assets.js        (IMAGES, FLOOR_BG, COURT_BG, WH_NPCS, CROUPIER, BRAVACCIO, DIE_TIERS, _pData, FLOOR_PARTICLE)
├── engine/
│   └── match.js         (roll, die, syn, dsyn, gearB, simRound, simMatch)
├── generation/
│   └── run.js           (initRun, genBoss, genShop, pickRarity, pickShopRarity)
├── lib/
│   ├── audio.js         (Tone.js — initAudio, setAudioIntensity, sfx*)
│   └── zoom.js          (setZoomCallback, triggerZoom — registry condiviso)
├── styles/
│   ├── noir.css         (font, :root, keyframes, classi globali)
│   └── inline.js        (export s — style factory)
└── components/
    ├── Particles.jsx
    ├── PCZoom.jsx
    └── cards/
        ├── PC.jsx
        ├── SC.jsx
        └── GearCard.jsx
```

**Debito tecnico residuo (da affrontare in una futura "Fase 0b" se serve):**
- `App.jsx` resta monolitico (958 righe) — target <200 richiede state container (Context/Zustand). Da valutare dopo Fase 3 quando le schermate saranno riscritte.
- `oR` state in `App.jsx` è dichiarato ma mai letto (solo `setOR` viene chiamato in due cleanup). Silenziato con `_oR` + eslint-disable. Da indagare: era forse per un modal "open result" mai implementato?

**Done when:** ✅ build verde, lint configurato, architettura modulare pronta per Fase 1.

---

# FASE 1a — Identità dei 2 clan placeholder ✅ COMPLETATA

**Obiettivo originale:** definire identità meccanica + estetica + narrativa forte per i due clan prima di generare asset.

**Esito brainstorm (21 apr 2026, skill `product-management:brainstorm`):**

### Lore comune
- **La Torre** è l'arbitrato federale: le civiltà giocano a basket per il diritto di esistere nei registri federali.
- **Drava** (Cristallina, piano 6 boss) è l'Archivista Federale: decide chi esiste e chi no.
- **Vega** (giocatore-protagonista) scala per ragione **ideologica pura**: vuole abolire il sistema archiviazione-come-genocidio, non riparare un torto personale.
- **Tono:** 60/40 Blade Runner / Kafka.

### 💠 ARCHIVISTI (ex-Cristallini) — piani 4-5

- **Bandiera:** "Siamo l'indice di ciò che la Torre vuole dimenticare. Ogni canestro è una citazione."
- **Chi sono:** fazione di Cristallini **eretici in scisma con Drava** (sua stessa specie). Hanno rubato i dati delle civiltà che Drava voleva cancellare e li hanno incisi sui propri corpi-cristallo. Ogni Archivista *contiene* letteralmente una civiltà morta. Giocano a basket perché il movimento rilascia frammenti di memoria.
- **5 trait chiave:** corpi di cristallo polimorfo-archivio; memoria esterna (sinergia alta tra famiglie di cristalli); adattamento difensivo (imparano lo shot dopo 2 possessi); fragili al 1° colpo, durissimi al 2°; anti-spettacolo (divise grezze, niente sponsor).
- **Boss piano 4 — Codex** · *"Ho 14.000 anni di partite perse dentro. Non ne perderò altre."* · Signature `ga_sig1` Citazione Incrociata.
- **Boss piano 5 — Palinsesto** · *"Drava mi ha scritto. Poi cancellato. Poi riscritto come suo avversario."* · Signature `ga_sig2` Revisione.

### 📡 FUORI-CATALOGO (ex-Ombre) — piani 2-3

- **Bandiera:** "Drava ci ha cancellati. Il gioco ci ricorda. Vincere contro di noi significa nominarci."
- **Chi sono:** civiltà **deregistrate totalmente** da Drava. Non dovrebbero esistere. Sopravvivono solo come **echi di gameplay** perché il basket era uno dei loro riti e la Torre non può cancellare il gioco senza cancellare sé stessa. Non hanno corpi stabili, solo pattern (pick&roll, uscite dai blocchi, schemi). La loro corruzione è **contagio di pattern**: dopo troppi round inizi a giocare come loro.
- **5 trait chiave:** corpi-pattern instabili; corruzione come contagio di schemi (non etica); divise senza nome, solo ruoli funzionali (#TIRATORE, #ROLLER); tiri come statica televisiva/replay di partite mai trasmesse; "sconfiggerli" significa ricordarli, quindi un loro pattern resta sempre nel tuo mazzo a fine piano.
- **Boss piano 2 — Segnale** · *"Ero un'ala piccola. Adesso sono solo un movimento."* · Signature `pa_sig1` Phase-Through.
- **Boss piano 3 — Rumore di Fondo** · *"Siamo la ragione per cui ogni stadio ha un'eco."* · Signature `pa_sig2` Contagio (corruzione).

### Task list (completata)

- [x] **T-1a.1** Rinomina GOLEM→Archivisti in `CLAN_DATA` (bosses + 16 player + 12 atk + 8 def + 7 gear)
- [x] **T-1a.2** Rinomina PHANTOM→Fuori-Catalogo in `CLAN_DATA` (stesso scope)
- [x] **T-1a.3** Aggiornati `RACES.GOLEM` (Archivisti/💠) e `RACES.PHANTOM` (Fuori-Catalogo/📡) in `constants.js`
- [x] **T-1a.4** Lint pulito + build verde (505 kB bundle, 4.13s)
- [x] **T-1a.5** `CLAUDE.md` aggiornato con lore definitiva + architettura modulare post-Fase-0

### Note per fasi future
- **ID engine (GOLEM/PHANTOM) mantenuti** per non rompere logica di gioco. Solo display names e contenuti sono cambiati.
- **Drava sarà implementata come boss unico di piano 6** in fase successiva — lore: Cristallina ortodossa opposta agli Archivisti eretici. Il suo render non userà `RACES.GOLEM.name` ma avrà identità propria.
- Le descrizioni strategie ora referenziano `Archivista campo` e `F-Cat. campo` (abbreviato per spazio UI).
- Boss signature mantengono meccaniche esistenti. **Meccaniche tematiche nuove** ("Citazione Incrociata replica lo shot subito", "Contagio ruba un pattern al tuo mazzo") sono **debito tematico** da implementare in fase gameplay-rework.

**Done:** `CLAN_DATA` ha 5 clan con identità pari livello, pronti per essere illustrati.

---

# FASE 1b — CardFrame 1:1 pixel art

**Obiettivo:** un singolo componente `<CardFrame>` che gestisce tutte le rarità, tutti i tipi (player/strategy/gear/boss), in formato quadrato.

**Branch:** `feat/cardframe`

### Task list

- [ ] **T-1b.1** Creare `src/styles/variables.css` con i 5 colori rarità:
  ```css
  --rarity-common: #6b6b6b;
  --rarity-uncommon: #c9a961;
  --rarity-rare: #4a7ab8;
  --rarity-epic: #8b5cf6;
  --rarity-legendary-a: #e0b84a;
  --rarity-legendary-b: #b83a3a;
  ```
- [ ] **T-1b.2** Creare `src/components/cards/CardFrame.jsx` con API:
  ```jsx
  <CardFrame rarity type image title subtitle stats traits equipped onClick selected />
  ```
- [ ] **T-1b.3** Layout interno quadrato (es. 240×240 px):
  - Area portrait (superiore 70%) con immagine + overlay sbarre
  - Barra info (inferiore 30%) con nome, razza, stats compatti
- [ ] **T-1b.4** Implementare "sbarre gabbia" sopra l'immagine:
  - Common: 1 sbarra orizzontale sottile in basso
  - Uncommon: 2 sbarre
  - Rare: 3 sbarre con glow
  - Epic: 4 sbarre viola
  - Legendary: 5 sbarre con gradient oro/rosso
- [ ] **T-1b.5** Applicare `image-rendering: pixelated` a tutti i portrait (CRITICO per pixel art)
- [ ] **T-1b.6** Animazioni (CSS keyframes, no libreria):
  - Hover: `transform: scale(1.03)` + box-shadow più forte (0.15s)
  - Rare: `pulse-blue` 2s infinito sul glow
  - Legendary: `pulse-gold` 1.5s + particelle CSS sottili
- [ ] **T-1b.7** Varianti `type`:
  - `player` — portrait + nome + ATK/DEF/dado/traits (standard)
  - `player-field` — come sopra + slot gear equipaggiati (completo)
  - `player-shop` — minimal: portrait + nome + rarità
  - `strategy` — icona grande + sfondo pattern clan + descrizione breve
  - `boss` — 320×320 px, quote sotto, badge clan
- [ ] **T-1b.8** Badge "★ FIRMA" diagonale dorato per strategie firma boss
- [ ] **T-1b.9** Sostituire i vecchi `PC`, `SC`, `GearCard` con `CardFrame` in tutte le schermate
- [ ] **T-1b.10** Verifica visiva: 5 rarità × 4 varianti = 20 combinazioni tutte renderizzate correttamente
- [ ] **T-1b.11** Merge `feat/cardframe` → main

**Done when:** hover su una carta Legendary → brillìo dorato + pulse, hover su Common → semplice scale. Tutte le schermate del gioco funzionano identiche ma con CardFrame.

---

# FASE 2 — Asset AI pixel art (Leonardo.ai)

**Obiettivo:** 22 immagini coerenti (10 umani + 12 boss) pronte per il gioco. Lo stile lo validiamo sui primi 5 umani prima di scalare.

### Preparazione

- [ ] **T-2.1** Creare account Leonardo.ai (free tier 150 token/giorno basta per inizio)
- [ ] **T-2.2** Studiare i modelli Leonardo con preset pixel art (es. "PixelArt v3", "Retro Pixel"). Identificare quello più coerente con riferimenti Hades 2D / Eastward
- [ ] **T-2.3** Creare il **prompt master**. Proposta base:
  ```
  pixel art portrait, bust shot 3/4, noir sci-fi basketball player,
  moody cinematic lighting, blade runner color palette (dark blue,
  warm gold accents), streetwear basketball attire, detailed face,
  transparent background, high quality pixel art, Hades game inspired,
  Eastward inspired, 256x256 resolution, sharp pixels, no blur
  ```
- [ ] **T-2.4** Negative prompt standard: `blurry, smooth, 3d render, photograph, low quality, antialiased, text, watermark`

### Pilot: 5 umani common

- [ ] **T-2.5** Generare 5 varianti per ogni H1-H5 (25 immagini totali), scegliere la migliore
- [ ] **T-2.6** Rimuovere background (Leonardo ha tool integrato, altrimenti remove.bg)
- [ ] **T-2.7** Affiancare i 5 portrait → verifica coerenza stile
- [ ] **T-2.8** **Decision gate:** se lo stile non è coerente → itero sul prompt master. Se coerente → vado avanti.

### Umani restanti (H6-H10)

- [ ] **T-2.9** Generare H6-H7 (Uncommon), H8-H9 (Rare), H10 (Legendary) — le rarità più alte con dettagli extra nel prompt ("heroic pose", "detailed gear", "dramatic lighting")
- [ ] **T-2.10** Rimuovere background e salvare come `public/players/h1.png` ... `h10.png`
- [ ] **T-2.11** Aggiornare `src/data/humans.js` aggiungendo campo `image: '/players/h1.png'` a ogni player

### Boss (12 immagini)

- [ ] **T-2.12** Adattare il prompt master per boss: framing leggermente più largo, posa dominante, background clan-specifico (non trasparente per boss), dettagli iconici del clan
- [ ] **T-2.13** Generare 2 boss per clan (6 clan totali contando Umani che però non hanno boss → 5 clan × 2 boss = 10, ma ROADMAP dice 2+2+2+2+2+2=12 controllo nel codice. Se sono 10, correggi)
- [ ] **T-2.14** Verificare sguardo dei boss verso destra (coerenza layout versus)
- [ ] **T-2.15** Salvare come `public/bosses/{clan}_{n}.png` (es. `orc_1.png`)
- [ ] **T-2.16** Aggiornare `src/data/clans.js` con i path immagine boss

### Opzionale in questa fase (o Fase 6)

- [ ] **T-2.17** Generare i restanti player alieni (64 immagini: 16×4 clan, esclusi Umani). Oppure rinviare alla Fase 6 per non bloccare il resto.

**Done when:** hover su un player o un boss nelle carte → compare un portrait pixel art coerente e bello da vedere.

**Note licenza (importante dato A.1=C monetizzazione futura):** Leonardo.ai ha piani Commercial (Apprentice+) che danno diritti commerciali sugli output. **Se vuoi pubblicare su Steam, usa almeno il piano Apprentice (10€/mese).** Il free tier è solo per uso personale/non-commerciale.

---

# FASE 3 — Layout hotspot + Prematch versus

**Obiettivo:** trasformare Floor Hub e Prematch nelle schermate più "sexy" del gioco.

**Branch:** `feat/layout-hotspot`

### 3a — Floor Hub semi-astratto

- [ ] **T-3a.1** Scegliere uno degli sfondi esistenti (`public/floor_*`) come base, oppure generarne uno nuovo con Leonardo ("noir sci-fi corridor with shop signs, pixel art")
- [ ] **T-3a.2** Disegnare i 5 hotspot come elementi assoluti sopra il background:
  - Poster Gym (in alto a sinistra)
  - Tavolo Coach (centro sinistra)
  - Manichino Negozio (centro destra)
  - Sagoma Boss (grande, in fondo, con porta chiusa che si illumina)
  - Libro Log (in basso a destra, piccolo)
- [ ] **T-3a.3** Ogni hotspot è un `<button>` con aria-label, background-image pixel art, hover = glow colorato
- [ ] **T-3a.4** Piccoli elementi informativi non interattivi: piano corrente in stile insegna neon, oro giocatore, conteggio roster
- [ ] **T-3a.5** Posizionare Drava come dialog box che appare 2-3 volte tra un piano e l'altro (trigger: entrata piano, apertura shop, vittoria boss)
  - Box in basso a destra, stile "radio comms"
  - Testo con typewriter effect
  - 2-3 frasi fisse per ora (testi definitivi in fase lore)

### 3b — Prematch versus screen

- [ ] **T-3b.1** Nuovo layout split-verticale centrato sul "VS":
  ```
  ┌─────────────────────────────────────────┐
  │ lato boss (background clan color)  │ lato vega (noir) │
  │ portrait boss grande                │ portrait coach   │
  │ nome + clan + quote                 │ "Coach Vega"     │
  │ 3 carte roster avversario           │ 3 carte roster tuo│
  │ 5 carte strategie (mini)            │ 5 strategie      │
  │                  [ GIOCA ]                             │
  └─────────────────────────────────────────┘
  ```
- [ ] **T-3b.2** Swap last-minute lato Vega: click su carta campo ↔ carta panchina
- [ ] **T-3b.3** Lato boss: le carte sono mostrate ma non interagibili, con filter `sepia` o tint clan
- [ ] **T-3b.4** Animazione di entrata: lati scivolano da fuori schermo verso il centro, VS appare con flash
- [ ] **T-3b.5** Bottone "GIOCA" grande, centrato in basso, stile insegna neon rossa

### 3c — Home screen minor tweak

- [ ] **T-3c.1** Bottoni Home in stile insegna neon (glow pulsante quando hoverati)
- [ ] **T-3c.2** Clan della run mostrati come 3 mini-badge invece che in testo
- [ ] **T-3c.3** Nessun'altra modifica

**Done when:** dai Floor Hub al Prematch senza leggere testo capisci cosa sta succedendo. Gli hotspot sono visibili e cliccabili.

---

# FASE 4 — Supabase (auth + run history + leaderboard)

**Obiettivo:** profili utente, storico run salvato, leaderboard globale funzionante.

**Branch:** `feat/supabase`

### 4a — Setup progetto

- [ ] **T-4a.1** Creare progetto Supabase (free tier)
- [ ] **T-4a.2** Abilitare Google OAuth nel progetto Supabase: richiede creazione OAuth Client in Google Cloud Console, whitelist redirect URL di Supabase
- [ ] **T-4a.3** Salvare `SUPABASE_URL` e `SUPABASE_ANON_KEY` in `.env.local` (aggiungere a `.gitignore`)
- [ ] **T-4a.4** `npm install @supabase/supabase-js`
- [ ] **T-4a.5** Creare `src/lib/supabase.js` con client inizializzato

### 4b — Schema DB + RLS

- [ ] **T-4b.1** Eseguire SQL nel SQL editor Supabase (copia dal piano originale):
  ```sql
  create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text not null,
    created_at timestamptz default now(),
    highest_floor int default 0,
    best_score int default 0
  );
  create table runs (...);
  create table clan_reputation (...);
  ```
- [ ] **T-4b.2** Trigger `on auth.user created → insert profile` con display_name = `full_name` da metadata Google
- [ ] **T-4b.3** RLS policies (CRITICO — test con 2 account):
  - `profiles`: SELECT proprio profilo + profili per leaderboard (solo campi pubblici via view); UPDATE solo proprio
  - `runs`: SELECT solo proprie run + leaderboard via view; INSERT solo con user_id = auth.uid()
  - `clan_reputation`: SELECT/UPDATE solo proprio
- [ ] **T-4b.4** Creare view `leaderboard_public` con solo `display_name`, `best_score`, `highest_floor` (no email, no id)

### 4c — Integrazione client

- [ ] **T-4c.1** `src/lib/supabase.js` wrapper con `signInWithGoogle()`, `signOut()`, `getSession()`
- [ ] **T-4c.2** `src/lib/runs.js` con `saveRun(runData)`, `getMyRuns()`, `getLeaderboard()`
- [ ] **T-4c.3** `saveRun` popola: `outcome`, `final_floor`, `score`, `clans_picked`, `seed`, `meta` (roster + strategie + gear finali JSON); poi update `profiles.highest_floor` e `best_score` solo se migliora
- [ ] **T-4c.4** Quando la run termina (vittoria o gameover) → chiamare `saveRun` se loggato, altrimenti localStorage
- [ ] **T-4c.5** Al login se ci sono run in localStorage → sync al cloud (una tantum) e svuotare local
- [ ] **T-4c.6** Implementare seed RNG deterministico da salvare (sostituire `Math.random()` con seedrandom o simile)

### 4d — UI autenticazione

- [ ] **T-4d.1** Bottone "Accedi con Google" in Home screen, sobrio, in basso
- [ ] **T-4d.2** Se loggato: mostra avatar Google + display_name
- [ ] **T-4d.3** Schermata "Profilo" accessibile dal Home:
  - Display name (modificabile — update `profiles`)
  - Stats principali (highest_floor, best_score, n° run totali)
  - Lista "Le mie run" (paginata, 20 per volta)
- [ ] **T-4d.4** Schermata "Leaderboard" accessibile dal Home:
  - Top 50 da `leaderboard_public`
  - Evidenzia la tua posizione
  - Se non loggato: bottone "Accedi per apparire in classifica"

**Done when:** logout → login → rivedo le mie 3 run di prova. Apro in incognito, login con altro account → leaderboard mostra entrambi ma nessuno può modificare run dell'altro.

---

# FASE 5 — Polish + playtest

**Obiettivo:** portare il gioco da "prototipo aggiornato" a "build presentabile".

- [ ] **T-5.1** Playtest completo: 3 run fino alla vittoria (o gameover). Annotare ogni friction point in `FRICTION_LOG.md`
- [ ] **T-5.2** Fix dei 5 bug/friction più gravi scoperti nel playtest
- [ ] **T-5.3** Audit accessibility base:
  - Tutti i bottoni con focus visible
  - Aria-label sui bottoni-hotspot
  - Verifica contrasti WCAG AA sui testi (tool: Chrome DevTools Lighthouse)
- [ ] **T-5.4** Performance: lazy load `<img loading="lazy">` su tutte le carte; verificare `npm run build` produce bundle < 500KB JS gzipped
- [ ] **T-5.5** Aggiungere meta-tag Open Graph + favicon + title corretto in `index.html`
- [ ] **T-5.6** Test su 1920×1080 + 1366×768 (Chrome DevTools responsive)
- [ ] **T-5.7** Aggiornare `ROADMAP.md` con le fasi completate (✅)
- [ ] **T-5.8** Aggiornare `CLAUDE.md` se la struttura del codice è cambiata (righe → moduli)
- [ ] **T-5.9** 3 screenshot salvati in `docs/screenshots/` per futuro uso marketing
- [ ] **T-5.10** Deploy preview su Vercel/Netlify (5 min di setup), condividere link con 2-3 persone per feedback esterno

**Done when:** hai una build pubblica, hai raccolto feedback da almeno 2 persone esterne, hai la sensazione che il gioco "sia un gioco" e non un prototipo.

---

# Come procedere operativamente

**Stato attuale (21 apr 2026):** Fase 0 ✅ + Fase 1a ✅ — architettura modulare + identità dei 5 clan chiusa (Archivisti piano 4-5, Fuori-Catalogo piano 2-3, Drava boss piano 6). Build verde, lint pulito.

**Prossima azione:**
1. Commit Fase 0 + Fase 1a: `git add -A && git commit -m "feat(fase-1a): rinomina GOLEM→Archivisti, PHANTOM→Fuori-Catalogo + lore definitiva"`
2. Decidere se partire con **Fase 1b** (CardFrame 1:1 pixel art) o se prima vuoi dare un giro manuale al gioco per verificare che i nuovi nomi/quote girino correttamente in tutte le schermate.

**Cadenza suggerita:** apri `PIANO_OPERATIVO.md` ogni sessione di lavoro, spunta le task chiuse con `[x]`, non passare alla fase successiva finché la precedente non è 100%.

**Quando si sente lo stallo tornare:** non fare due cose insieme. Scegli LA prossima `[ ]` task e chiudila. Se una task sembra troppo grossa, splittala in 3 sub-task prima di iniziare.

**Quando serve un nuovo brainstorm:** posso fare sparring via skill `product-management:brainstorm`. Basta chiedere.
