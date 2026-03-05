# BUZZER CLIMB — Roadmap & Game Design Document

> Ultimo aggiornamento: Marzo 2026

---

## 1. PITCH

**Inizio anni 2000. Drava**, imprenditrice cosmica, conquista pianeta dopo pianeta sfidando i campioni locali a basket 3v3 — non per odio, ma per spettacolo. Ogni mondo caduto alimenta il suo business: il **Buzzer Climb**. Quando arriva sulla Terra e vince, **Coach Vega** si immola: diventa il protagonista eterno del torneo nella torre di Drava. Ogni piano è un campo presidiato da un campione caduto. A ogni piano superato, il buzzer suona. I tifosi urlano. Drava incassa. Vega ricomincia.

**Genere:** Roguelike Basketball Deckbuilding
**Target:** Desktop (1920×1080), poi mobile
**Stack attuale:** React + Vite (prototipo funzionante)

---

## 2. NAMING (COMPLETO)

| Elemento | Nome | Note |
|----------|------|------|
| Il gioco / torneo | **Buzzer Climb** | È sia il titolo del gioco che il nome dello show nella lore |
| Il protagonista | **Coach Vega** | Ex allenatore terrestre, si è sacrificato per salvare la Terra |
| La villain | **Drava** | Imprenditrice cosmica, proprietaria del Buzzer Climb |

---

## 3. LORE

### La Storia
Drava viaggia di pianeta in pianeta con un formato: sfidare la civiltà locale a basket 3v3. Se vince, il pianeta entra nel suo impero dell'intrattenimento. Nessuno ha mai vinto.

Quando arriva sulla Terra e vince, Coach Vega fa un patto: si offre come partecipante eterno del Buzzer Climb, un torneo a 6 livelli che si ripete all'infinito nella torre di Drava. In cambio, la Terra è risparmiata. Drava accetta: un coach umano che si immola all'infinito è spettacolo puro.

**Il loop roguelike È la lore.** Ogni run è una nuova ripetizione del sacrificio di Vega. Non ricorda le run precedenti, ma il giocatore reale sì — e migliora.

### Drava (La Villain)
- Imprenditrice cosmica, proprietaria e promoter del Buzzer Climb
- Motivazione: il Buzzer Climb è il suo business empire. I tifosi pagano, scommettono, comprano merchandise
- Ha accettato il patto con Vega perché l'underdog eterno è la storia perfetta per gli ascolti
- Personalità: carismatica, elegante, teatrale. Tratta Vega come un proprietario NBA tratta la sua star — cortesia e disprezzo. Non è crudele per sadismo, è crudele per profitto, il che è peggio
- Non gioca mai direttamente — guarda dall'alto, commenta, intrattiene
- Estetica: aristocratica aliena, sempre impeccabile, mix tra CEO, proprietaria NBA e imperatrice romana al Colosseo
- **Possibile twist finale:** se Vega diventa troppo popolare, Drava scende in campo al piano 6 per difendere il suo brand

### Coach Vega (Il Protagonista)
- Ex allenatore terrestre che si è sacrificato per salvare la Terra
- Non gioca — dirige dalla panchina (coerente con la meccanica)
- Intrappolato in un ciclo eterno che non ricorda
- Riferimenti: Rick Deckard (Blade Runner), Spike Spiegel (Cowboy Bebop)

### I Boss (Campioni Caduti)
- Ogni boss è il campione di un pianeta conquistato, ora costretto a giocare per Drava
- Non sono "cattivi" — sono vittime come Vega, ma dall'altra parte del campo
- Ogni boss ha la sua razza dominante e una strategia firma personale

### I Mercenari
- Scarti, sopravvissuti, ribelli dei pianeti conquistati
- Il giocatore parte con mercenari Umani e recluta le altre razze avanzando
- Nelle gym dei piani trovi mercenari "rimasti" dai vari pianeti — quelli che Drava ha scartato

---

## 4. MECCANICHE IMPLEMENTATE

### 4.1 — Sistema Clan

**5 clan totali:**

| Clan | Razza | Emoji | Playstyle | Stato |
|------|-------|-------|-----------|-------|
| ORC | Orchi | 💀 | Forza bruta, 0 passaggi, corruzione | ✅ Completo |
| INSECTOID | Insettidi | 🐛 | Passaggi multipli, sinergia di squadra, telepatia | ✅ Completo |
| FELINE | Felidi | 🐱 | Velocità, furtività, contrattacco, agguato | ✅ Completo |
| GOLEM | Cristallini | 💎 | Difesa impenetrabile, muri, assorbimento | ⚠️ Placeholder (meccanica ok, identità da definire) |
| PHANTOM | Ombre | 👻 | Evasione, corruzione mentale, furtività | ⚠️ Placeholder (meccanica ok, identità da definire) |

**Regola run:** a ogni run vengono estratti **3 clan** random su 5. I loro 6 boss (2 per clan) vengono mischiati e assegnati ai 6 piani in ordine casuale.

**Set per clan:**
- 2 boss con strategia firma ciascuno (UNCOMMON, sempre presente)
- 16 giocatori: 5 Common + 5 Uncommon + 5 Rare + 1 Legendary
- ~12 strategie ATK: 3C + 2 firma (U) + 3U + 3R + 1L
- ~8 strategie DEF: 2C + 3U + 2R + 1L
- 7 gear: 2C + 2U + 2R + 1L

**Umani (pool giocatore):**
- 10 giocatori: 5C + 2U + 2R + 1L
- 5 strategie ATK: 2C + 2U + 1R
- 5 strategie DEF: 2C + 2U + 1R
- Non hanno boss (sono il clan del giocatore)

### 4.2 — Scaling Rarità

**Boss deck (più difficile salendo):**

| Piano | Common | Uncommon | Rare | Legendary |
|-------|--------|----------|------|-----------|
| 1 | 100% | 0% | 0% | — |
| 2 | 70% | 25% | 5% | — |
| 3 | 50% | 35% | 15% | — |
| 4 | 30% | 40% | 30% | — |
| 5 | 15% | 30% | 40% | 15% |
| 6 | 5% | 20% | 40% | 35% |

**Shop drop rate (≈1 piano avanti):**

| Piano | Common | Uncommon | Rare | Legendary |
|-------|--------|----------|------|-----------|
| 1 | 65% | 28% | 7% | — |
| 2 | 45% | 35% | 18% | 2% |
| 3 | 28% | 38% | 28% | 6% |
| 4 | 15% | 33% | 38% | 14% |
| 5 | 8% | 22% | 42% | 28% |
| 6 | 3% | 15% | 40% | 42% |

### 4.3 — Match Engine

Partita 3v3 a turni con 5 round + sudden death:
- Ogni round: ATK gioca strategia, DEF risponde con strategia difensiva
- I passaggi possono essere intercettati (dice roll vs dice roll)
- Il tiro finale è attaccante vs difensore, con bonus sinergia razza e gear
- **Meccaniche speciali:** corruzione (ruba giocatori avversari), infortunio (margine ≥8), help defense (secondo tentativo), blitz (rubata pre-azione), wall, trap, deny, ambush
- Oro guadagnato in base a punti segnati e difese riuscite

**Sistema dadi per rarità:**

| Rarità | Dado | Costo | Vendita |
|--------|------|-------|---------|
| Common | d4 | 3◆ | 1◆ |
| Uncommon | d6 | 5◆ | 2◆ |
| Rare | d8 | 8◆ | 4◆ |
| Epic | d10 | 12◆ | 6◆ |
| Legendary | d12 | 18◆ | 9◆ |

### 4.4 — Sinergia Razza

Le strategie danno bonus extra per ogni giocatore dello stesso clan in campo/panchina. Questo incentiva roster "puri" (tanti dello stesso clan) vs roster "ibridi" (migliori giocatori individuali ma meno sinergia). Trade-off fondamentale del deckbuilding.

### 4.5 — Trait System

Ogni giocatore ha 2 trait: Leader, Tiratore Scelto, Velocista, Difensore, Acrobata, Implacabile, Astuto, Berserk, Corazzato, Furtivo, Uomo Di Squadra, Telepate, Solitario. Attualmente flavor text — pensati per espansione futura con effetti meccanici.

### 4.6 — Gear System

Gear equipaggiabili ai giocatori. Slot massimi dipendono dalla rarità del giocatore (Common: 2, Rare: 3, Legendary: 4). Effetti: bonus flat ATK/DEF, dadi extra, immunità corruzione, infortunio su difesa.

### 4.7 — Shop System

3 negozi per piano, persistenti nel piano:
- **Gym** — Giocatori (pool umani + clan attivi della run)
- **Negozio Vestiti** — Gear (pool dai clan attivi)
- **Coach Training** — Strategie ATK/DEF (pool umani + clan attivi, senza firme boss)

Le strategie firma dei boss non appaiono mai nello shop.

---

## 5. DIREZIONE ARTISTICA

### Due Mondi — Dualità Visiva

**🌑 Fuori dalla partita — NOIR SCI-FI** (il mondo di Vega)
- Corridoi bui, negozi loschi, mercenari nell'ombra
- Palette: nero profondo, grigi freddi, blu notte, accenti oro spento e rosso scuro
- Neon minimali stile Blade Runner sobrio
- Font: Orbitron (titoli) + Space Mono (corpo)
- Audio: jazz notturno, lo-fi ambient, piano solo
- Riferimenti: Cowboy Bebop, Sin City, Blade Runner 2049, Transistor

**☀️ Durante la partita — LO SHOW DI DRAVA** (da implementare)
- Arena luminosa, colori saturi, tifosi, riflettori
- Colori dei clan vibranti, effetti luce dinamici
- Font display bold sportivo
- Audio: elettronica/hip-hop, beat pesanti, folla che reagisce
- Riferimenti: NBA Street, Lethal League, Jet Set Radio

**La transizione** tra noir e show è il cuore emotivo: porta dell'arena che si apre, luce che inonda, folla che cresce da zero. Vega passa dalla penombra ai riflettori. Ogni volta. All'infinito.

### Stato Attuale Visivo
- ✅ Palette noir implementata (CSS variables)
- ✅ Font Orbitron + Space Mono
- ✅ Grain overlay, animazioni fade-in
- ✅ 6 sfondi per piano (generati AI, stile noir)
- ✅ Logo neon "Buzzer Climb" (home screen background)
- ❌ Vista partita (solo risultati testuali)
- ❌ Animazioni partita
- ❌ Transizione noir/show

---

## 6. UI/UX — LAYOUT DESKTOP (IMPLEMENTATO)

### Flusso Schermate

```
HOME SCREEN ──→ FLOOR HUB ──→ PREMATCH ──→ RESULT
(logo bg,           │                         │
 clan run,          ├→ IL MIO TEAM            ├→ VITTORIA
 inizia run)        │    └→ STRATEGIE         └→ SCONFITTA/GAMEOVER
                    └→ SHOPS
                       (Gym / Negozio / Coach)
```

**Home Screen:** Logo Buzzer Climb come sfondo fullscreen. Clan della run visibili. Pulsante "Guardaroba" (placeholder) e "Inizia Run".

**Floor Hub:** Due colonne — sinistra preview boss (nome, clan, quote), destra azioni (Il Mio Team, Shops, Log).

**Il Mio Team:** Campo (3 giocatori) con riordino e swap. Panchina. Vendita. Pulsante "Strategie" in alto a destra.

**Strategie:** Due colonne (ATK/DEF) con riordino, prime 5 attive. Le carte firma boss mostrano ★ FIRMA.

**Shops:** Tab per Gym/Negozio/Coach. Griglia carte con pulsante compra.

**Prematch:** Split screen — sinistra team avversario, destra il tuo con swap last-minute. Pulsante GIOCA.

**Result:** Tabellone centrato, dettaglio round espandibile, pulsante avanzamento.

---

## 7. META-PROGRESSIONE (DESIGN — NON IMPLEMENTATA)

### Principio
Roguelike puro: perdi tutto nella run. Ma esiste una **lobby** tra le run con progressione permanente **puramente cosmetica**.

### Oro Lobby
- Alla fine di ogni run (vittoria o sconfitta) guadagni oro lobby dal punteggio run
- Punteggio = risultato base + efficienza economica + punti tifo

### Guardaroba (6 slot indumenti permanenti)

| Slot | Esempi |
|------|--------|
| 🎩 Cappello | Elmetto Orchesco, Corona Insettide |
| 👕 Maglia | Canotta Felide, Maglia Formale Umana |
| 🧥 Giacca | Mantello di Spine (Orco), Tuta Alveare (Insettide) |
| 👖 Pantaloni | Pantaloni Corazzati, Leggings Felidi |
| 👟 Scarpa | Stivali da Guerra, Sandali Leggeri |
| 💍 Accessorio | Collana d'Osso, Bracciale Antenna |

Ogni indumento ha un'**affiliazione clan** che influenza il sistema tifo.

### Sistema Tifo (Design)
- Ogni boss ha tifosi del suo clan
- Vittoria → guadagni punti tifo per quel clan
- Sconfitta → perdi punti tifo
- L'abbigliamento di Vega mostra affiliazione: se indossi gear Orchesco e batti un boss Orco, i tifosi impazziscono (bonus enorme). Se perdi, ti odiano doppiamente.
- I clan hanno relazioni tra loro (alleanze e rivalità) — da bilanciare

**Regola chiave:** gli indumenti non danno bonus meccanici in partita. Vinci perché giochi meglio, non perché hai indumenti migliori.

---

## 8. ARCHITETTURA TECNICA

### Stato Attuale
- **Single-file React:** `src/App.jsx` (~90KB, 1170 righe)
- **Vite** dev server con hot reload
- **Zero backend:** tutto client-side, stato in React useState
- **Immagini:** 8 PNG in `public/` (2.8MB totali), versione artifact con JPEG base64 compresse (~230KB)

### Struttura App.jsx

| Sezione | Contenuto |
|---------|-----------|
| DATABASE v2 (righe 1-370) | RACES, RARITIES, FLOOR_RARITY, SHOP_RARITY, HUMAN_PLAYERS, HUMAN_ATK/DEF, CLAN_DATA (5 clan completi) |
| BOSS & SHOP (370-540) | initRun(), genBoss(), genShop(), pickRarity(), pickShopRarity() |
| ENGINE (540-610) | roll(), die(), syn(), dsyn(), gearB(), simRound(), simMatch() |
| IMAGES + CSS (610-700) | Asset paths, CSS variables, animazioni, stili |
| COMPONENTS (700-740) | PC (PlayerCard), SC (StrategyCard), GearCard |
| MAIN (740-fine) | App component, state management, tutti gli screen |

### ID Pattern

| Razza | Giocatori | ATK strat | DEF strat | Gear |
|-------|-----------|-----------|-----------|------|
| Umani | h1–h10 | ha1–ha5 | hd1–hd5 | — |
| Orchi | o1–o16 | oa1–oa10 | od1–od8 | og1–og7 |
| Insettidi | i1–i16 | ia1–ia10 | id1–id8 | ig1–ig7 |
| Felidi | f1–f16 | fa1–fa10 | fd1–fd8 | fg1–fg7 |
| Cristallini | g1–g16 | ga1–ga10 | gd1–gd8 | gg1–gg7 |
| Ombre | ph1–ph16 | pa1–pa10 | pd1–pd8 | pg1–pg7 |
| Firme boss | — | *_sig1, *_sig2 | — | — |

---

## 9. ROADMAP

### ✅ Fase 1 — Core Loop (COMPLETATA)
- [x] Match engine con dadi, passaggi, intercetti, tiro
- [x] Meccaniche speciali (corruzione, infortunio, help, blitz, wall, trap, deny, ambush)
- [x] Roster management (campo 3 + panchina, swap, riordino)
- [x] Gear system con equip/slot per rarità
- [x] Strategia deck (5 ATK + 5 DEF attive, riordino, aggiunta, rimozione)
- [x] 3 shop per piano (gym, gear, coach training)
- [x] Economia oro (guadagno in partita, spesa negli shop, vendita giocatori)
- [x] Sistema clan: 5 clan, 3 per run, boss con strategia firma
- [x] Scaling rarità boss + shop separati
- [x] Partenza umana (5 common) + reclutamento alieni
- [x] Layout desktop 1920×1080 con schermate separate
- [x] Stile noir implementato (palette, font, grain, sfondi per piano)
- [x] Home screen con logo come sfondo

### 🔲 Fase 2 — Contenuto & Bilanciamento
- [ ] Definire i 2 clan placeholder con identità forte (Cristallini → ?, Ombre → ?)
- [ ] Bilanciare dadi/sinergia/economia con playtest
- [ ] Sistema eventi random tra i piani (30% chance: guadagna oro, trova gear, guarisci infortunio)
- [ ] Aggiungere più gear universali (non legati a clan)
- [ ] Boss gear: i boss equipaggiano gear dai piani più alti (già parzialmente implementato dal piano 3)
- [ ] Ampliare pool umano (più uncommmon/rare/legendary)

### 🔲 Fase 3 — Sistema Tifo & Lobby
- [ ] Sistema punti tifo per clan (guadagno/perdita per vittoria/sconfitta)
- [ ] Tabella relazioni tra clan (alleanze/rivalità)
- [ ] Lobby: schermata tra run con guardaroba
- [ ] 6 slot indumenti (cappello, maglia, giacca, pantaloni, scarpa, accessorio)
- [ ] Affiliazione clan per indumento → impatto su punti tifo
- [ ] Punteggio run: risultato + efficienza + tifo → oro lobby
- [ ] Negozio lobby per acquistare indumenti permanenti
- [ ] Salvataggio progressi meta (localStorage o backend)

### 🔲 Fase 4 — Visualizzazione Partita
- [ ] Prototipo vista isometrica del campo
- [ ] Animazioni giocatori (passaggio, tiro, schiacciata, intercetto)
- [ ] Transizione noir → show (apertura arena, luci, folla)
- [ ] Tifosi sulle tribune come massa di colore
- [ ] Drava nel palco VIP
- [ ] Rallenty cinematografico sui momenti chiave
- [ ] Sound design: effetti con Tone.js (buzzer, fischio, crowd)

### 🔲 Fase 5 — Lore & Narrative
- [ ] Dialoghi boss pre-partita (ogni boss ha la sua storia)
- [ ] Dialoghi Drava (commenta le partite, provoca Vega)
- [ ] Dialoghi Vega (cambiano con i piani, possibile evoluzione tra run)
- [ ] Eventi narrativi nelle stanze
- [ ] Sprite personaggi per il roster
- [ ] Artwork per i boss (portraits)

### 🔲 Fase 6 — Polish & Lancio
- [ ] Adattamento UI per mobile/tablet
- [ ] Leaderboard (punteggio run)
- [ ] Sfide speciali / modificatori di run
- [ ] Tutorial/onboarding
- [ ] Separare App.jsx in moduli (data, engine, components, screens)
- [ ] Build di produzione e deploy

---

## 10. REFERENCE BOARD

| Elemento | Riferimento |
|----------|-------------|
| Corridoi / Esplorazione | Blade Runner 2049, Cowboy Bebop, Transistor |
| Negozi / Stanze | Papers Please, Slay the Spire |
| Arena / Partita | NBA Street, Lethal League, Jet Set Radio |
| Character design | Into the Breach, Hades |
| Drava | GLaDOS (tono), Miranda Priestly (eleganza fredda) |
| Coach Vega | Rick Deckard, Spike Spiegel |
| Carte / UI | Balatro (leggibilità), Slay the Spire (chiarezza) |
| Loop roguelike | Balatro, Slay the Spire, Hades (lore nel loop) |

---

## 11. NOTE

Il gioco ha un'identità unica: un roguelike deckbuilder di basket 3v3 con un worldbuilding che giustifica meccanicamente il loop. Il protagonista intrappolato in un ciclo eterno *è* il giocatore che ripete le run. I tifosi e gli indumenti aggiungono un meta-game senza rompere il roguelike puro. Le combinazioni di 3 clan su 5 garantiscono che nessuna run sia uguale (10 combinazioni possibili).

**Il rischio principale è la complessità.** Il core loop (prepara → simula → risultato) deve restare stretto e soddisfacente. Ogni layer aggiuntivo (tifo, lobby, animazioni) deve amplificare il divertimento, non diluirlo.
