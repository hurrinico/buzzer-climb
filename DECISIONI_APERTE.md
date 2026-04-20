# Decisioni aperte — Buzzer Climb

> Tutte le scelte che servono per lavorare in modo coerente senza tornare indietro. Formato: per ogni decisione ci sono opzioni, una raccomandazione, e uno spazio `RISPOSTA:` vuoto da compilare.

Rispondi anche solo con il numero dell'opzione (es. `D1.2: opzione B`). Dove non hai un'opinione, lascia `RISPOSTA: usa la raccomandazione`.

---

## BLOCCO A — Trasversali (rispondere subito, influenzano tutto)

### D-A.1 — Target finale del gioco
- (a) Progetto hobby pubblico, free, sul web (itch.io / dominio personale)
- (b) Portfolio tecnico per cercare lavoro
- (c) Prodotto con monetizzazione futura (Steam / mobile store)
- (d) Solo per te e amici, non serve deploy pubblico

> Impatta: scelte licenza asset, hosting, analytics, bilanciamento tempo.

**RISPOSTA: C**

### D-A.2 — Mobile
- (a) Desktop only per ora (come dichiarato in ROADMAP)
- (b) Desktop + responsive per tablet 1024+
- (c) Anche mobile (richiede ripensare UI)

> Raccomandazione: **(a)**. Fare mobile bene è un progetto a sé.

**RISPOSTA: A**

### D-A.3 — Lingua
- (a) Solo italiano (attuale)
- (b) Italiano + inglese, preparare i18n da subito
- (c) Inglese solo

> Raccomandazione: **(a)** per ora. Preparare i18n dopo aver stabilizzato i testi.

**RISPOSTA: A**

### D-A.4 — Identità dei 2 clan placeholder (Cristallini, Ombre)
Serve decidere PRIMA di generare gli asset AI — altrimenti i 32 player di quei due clan andranno rifatti.

- (a) Decido subito: dammi spunti concreti per la definizione
- (b) Lascia Cristallini e Ombre come placeholder, genero solo 3 clan su 5 (Orchi/Insettidi/Felidi)
- (c) Li rimpiazzo con due clan nuovi (quali?)

> Raccomandazione: **(a)** oppure **(b)**. Non generare asset di un clan senza identità.

**RISPOSTA: A**

---

## BLOCCO B — Fase 0 (Refactor)

### D-B.1 — Struttura cartelle proposta
Ti va bene questa?
```
src/{data, engine, generation, components, screens, styles}
```
Oppure preferisci accorpare (`lib/` per data+engine+generation)?

**RISPOSTA: Ok soluzione proposta**

### D-B.2 — State management dopo il refactor
- (a) useState + prop drilling (attuale) — nessun cambio
- (b) Context API per stato run
- (c) Zustand (libreria leggera)

> Raccomandazione: **(a)** — finché il prop drilling non duole, non serve una libreria.

**RISPOSTA: A**

### D-B.3 — Linting / formatting
- (a) Non introdurre nulla ora
- (b) Aggiungere ESLint + Prettier con config standard

> Raccomandazione: **(b)** — 10 minuti di setup, evita code review future dolorose.

**RISPOSTA: B**

---

## BLOCCO C — Fase 1 (CardFrame)

### D-C.1 — Orientamento carta player
- (a) Verticale 2:3 (trading card classica, stile Balatro/Hearthstone)
- (b) Orizzontale 3:2 (stile scheda giocatore sportivo)
- (c) Quadrata 1:1 (stile moderno tipo FIFA)

> Raccomandazione: **(a)**. Matcha l'estetica trading card e permette portrait verticali.

**RISPOSTA: C**

### D-C.2 — Posizione delle sbarre di rarità
- (a) Davanti all'immagine come "gabbia" (coerente con lore torre di Drava)
- (b) Sotto l'immagine (sottotitolo visivo, meno invasivo)
- (c) Come cornice laterale (barre verticali ai lati)
- (d) Sopra il nome (sottolineatura del titolo)

> Raccomandazione: **(a)** se vogliamo carattere forte, **(b)** se la leggibilità dell'immagine è prioritaria. Propendo per (a) dato che hai insistito sulle "sbarre dietro le quali ci sono le immagini".

**RISPOSTA: A**

### D-C.3 — Palette rarità (validare i colori proposti)
Proposta:
- Common → grigio neutro #6b6b6b
- Uncommon → oro spento #c9a961
- Rare → blu acciaio #4a7ab8
- Epic → viola #8b5cf6
- Legendary → rosso/oro sfumato, animato

Opzioni:
- (a) Vanno bene così
- (b) Voglio palette diversa (descrivi)
- (c) Voglio vedere mockup prima di decidere

**RISPOSTA: A**

### D-C.4 — Informazioni sulla faccia carta player
Quali dati mostrare davanti (prima del flip/hover)?
- (a) Minimal: Nome + Razza + rarità → tutto il resto su hover/click
- (b) Standard: Nome + Razza + ATK + DEF + dado + traits
- (c) Completo: anche slot gear equipaggiati

> Raccomandazione: **(b)** per la schermata team, **(c)** solo quando il giocatore è in campo, **(a)** nello shop.

**RISPOSTA: **(b)** per la schermata team, **(c)** solo quando il giocatore è in campo, **(a)** nello shop**

### D-C.5 — Animazioni carta
- (a) Zero animazioni (statico)
- (b) Solo hover (scale leggero + glow)
- (c) Hover + rarità animata per Rare/Legendary (glow pulsante)
- (d) Tutto il set incluse micro-anim su equip/swap

> Raccomandazione: **(c)** — premia le carte rare senza sovraccaricare.

**RISPOSTA: C**

---

## BLOCCO D — Fase 2 (Asset AI)

### D-D.1 — Tool di generazione
- (a) Midjourney (~30€/mese, coerenza molto alta, cloud)
- (b) DALL-E 3 via ChatGPT Plus (già forse pagato)
- (c) Flux.1 / Stable Diffusion locale (gratis ma setup + hardware)
- (d) Leonardo.ai (free tier generoso, buona per character design)

> Raccomandazione: **(a)** se puoi permettertelo (un mese basta), altrimenti **(d)**.

**RISPOSTA: d**

### D-D.2 — Stile immagine
- (a) Pittorico digitale noir (riferimenti Blade Runner 2049)
- (b) Anime/manga (riferimenti Cowboy Bebop, Trigun)
- (c) Pixel art alta risoluzione (riferimenti Hades 2D, Eastward)
- (d) Semi-realistico tipo trading card (riferimenti Magic)

> Raccomandazione: **(a)** o **(b)**. Entrambi coerenti con i riferimenti della ROADMAP. (a) è più "adulto", (b) più "iconico".

**RISPOSTA: C**

### D-D.3 — Framing player
- (a) Bust shot 3/4 (spalle in su, classico card game)
- (b) Full body in posa dinamica (action shot)
- (c) Ritratto frontale stretto (volto in evidenza)

> Raccomandazione: **(a)**. Bilancia impatto volto + abbigliamento + gear futuri.

**RISPOSTA: a**

### D-D.4 — Background immagini
- (a) Trasparente (PNG alpha) — sfondo viene dalla carta
- (b) Ambientale generico (strada noir, palestra)
- (c) Clan-specifico (orchi su sfondo rossastro, felidi su tetti, ecc)

> Raccomandazione: **(a)** per player (max riuso), **(c)** per boss (più scenografici).

**RISPOSTA: a**

### D-D.5 — Ordine di generazione
- (a) Prima 10 umani → validare stile → 12 boss → poi altri player
- (b) Prima 12 boss → validare stile → 10 umani → poi altri player
- (c) Una razza completa alla volta (tutti umani + tutti orchi + ...)

> Raccomandazione: **(a)**. Umani per validare stile (il tuo team, ci stai a lungo). Poi boss perché sono pochi e scenografici.

**RISPOSTA: a**

---

## BLOCCO E — Fase 3 (Layout)

### D-E.1 — Floor Hub come scena illustrata
- (a) Scena completa (corridoio/anticamera disegnato, hotspot diegetici)
- (b) Layout semi-astratto (sfondo atmosferico + pulsanti stilizzati posizionati)
- (c) Mantieni layout attuale (due colonne), migliora solo stile

> Raccomandazione: **(b)**. (a) è bellissimo ma è un progetto da solo (1+ settimana di design). (b) dà il 70% dell'effetto con il 20% del tempo.

**RISPOSTA: B**

### D-E.2 — Hotspot: quali e dove?
Proposta: Poster Gym • Tavolo Coach • Manichino Negozio • Sagoma Boss per Prematch • Libro Log/storico.

- (a) Va bene questa mappa
- (b) Voglio un set diverso (quale?)
- (c) Solo 3 hotspot principali, il resto in menu

**RISPOSTA: A**

### D-E.3 — Drava in scena
- (a) Presente come figura fissa su palco VIP nel Floor Hub
- (b) Presente solo con dialog box che appare ogni tanto
- (c) Non mostrarla ancora, rinviare a Fase 5 (lore)

> Raccomandazione: **(b)** ora, **(a)** quando avrai il suo portrait.

**RISPOSTA: B**

### D-E.4 — Transizione noir → arena (dalla ROADMAP)
- (a) Implementare in Fase 3 insieme al Prematch
- (b) Rinviarla a una Fase 4.5 dedicata
- (c) Rinviarla alla Fase 4 della ROADMAP originale (visualizzazione partita)

> Raccomandazione: **(c)**. È un effetto grosso, merita attenzione quando toccherai la vista partita.

**RISPOSTA: C**

### D-E.5 — Home screen
- (a) Mantieni layout attuale, aggiungi micro-animazioni
- (b) Redesign totale con asset nuovi
- (c) Minor tweak (bottoni più belli)

> Raccomandazione: **(a)**. Funziona già bene.

**RISPOSTA: C**

---

## BLOCCO F — Fase 4 (Supabase)

### D-F.1 — Schema DB (valida proposta)
Proposta: tabelle `profiles`, `runs`, `clan_reputation`. Player/strategy/gear/boss restano in codice.
- (a) Ok così
- (b) Voglio anche una tabella `matches` per lo storico partita-per-partita
- (c) Voglio tutto in DB (anche carte) per bilanciamento live

> Raccomandazione: **(a)**. (b) ha senso più avanti. (c) è overengineering.

**RISPOSTA: A**

### D-F.2 — Display name utente
- (a) Auto da Google (`full_name`)
- (b) L'utente sceglie al primo login
- (c) L'utente sceglie + può cambiarlo dopo

> Raccomandazione: **(c)**. Minimo friction iniziale (auto), ma cambiabile.

**RISPOSTA: C**

### D-F.3 — Login obbligatorio o opzionale
- (a) Opzionale: si gioca anche senza, dati in localStorage, login sincronizza
- (b) Obbligatorio per giocare
- (c) Obbligatorio per leaderboard, opzionale per giocare

> Raccomandazione: **(a)** o **(c)**. Mai **(b)** — alza la barriera troppo.

**RISPOSTA: C**

### D-F.4 — Leaderboard
- (a) Globale pubblica (top 50 all-time)
- (b) Globale pubblica + weekly reset
- (c) Solo personale (le tue run)
- (d) Niente leaderboard per ora

> Raccomandazione: **(a)** come default, **(b)** più avanti se hai traction.

**RISPOSTA: A**

### D-F.5 — Run replay (seed + meta)
Salvare il seed RNG e il roster completo per permettere "rivedi la run" in futuro?
- (a) Sì, salva seed e meta jsonb da subito (zero costo)
- (b) No, aggiungiamo quando implementeremo il replay

> Raccomandazione: **(a)**. Costa nulla ora, è oro quando vorrai features avanzate.

**RISPOSTA: A**

### D-F.6 — Clan reputation: ora o dopo?
La tabella è nel piano, ma la feature tifo è Fase 3 della ROADMAP originale.
- (a) Crea la tabella ora, popolala quando implementerai tifo
- (b) Rimanda la tabella a quando serve

> Raccomandazione: **(a)**. Evita una migrazione futura.

**RISPOSTA: A**

---

## BLOCCO G — Fase 5 (Polish)

### D-G.1 — Analytics (tracciare come viene giocato)
- (a) Nessuna analytics
- (b) Plausible / Umami (privacy-friendly, niente cookie)
- (c) PostHog (più potente, funnel e cohort)
- (d) Decidi dopo il primo pubblico

> Raccomandazione: **(d)** se l'hai risposto "hobby" in D-A.1, altrimenti **(b)**.

**RISPOSTA: d**

### D-G.2 — Audio
- (a) Sound design base con Tone.js (già in dipendenze) in Fase 5
- (b) Rinvia tutto l'audio a una Fase dedicata successiva
- (c) Cerca artista/libreria royalty-free e aggiungi traccia ambient

> Raccomandazione: **(b)**. L'audio merita attenzione dedicata, non gli ultimi due giorni di polish.

**RISPOSTA: b**

---

## Come rispondere (più rapido per te)

Puoi rispondermi con un blocco di testo tipo:

```
A.1: c
A.2: a
A.3: a
A.4: b
B.1: ok come proposto
B.2: raccomandazione
C.1: a
...
```

Oppure rispondi solo ai blocchi che ti interessano subito (es. A + B per iniziare a lavorare), e rinvia il resto.

---

## Decisioni già prese (per riferimento)

- Backend → Supabase
- Asset → AI generate
- Priorità → Estetica prima
- Refactor → Sì, leggero prima di toccare la UI
