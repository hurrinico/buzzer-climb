# Buzzer Climb

Roguelike basketball deckbuilding game. Noir sci-fi ambientazione.

## Architettura
- React + Vite, single-page, tutto client-side. No backend, no database.
- Modularizzata in Fase 0:
  - `src/data/` — constants, assets, clans, humans
  - `src/engine/` — match.js (simRound, simMatch, roll, gearB)
  - `src/generation/` — run.js (initRun, genBoss, genShop)
  - `src/components/` — cards/PC, cards/SC, cards/GearCard, Particles, PCZoom, screens
  - `src/styles/` — inline.js (oggetto `s`) + global.css
  - `src/lib/` — audio.js (Tone.js), zoom.js (callback registry)
  - `src/App.jsx` — solo glue + stato top-level (~950 righe, target futuro <200)

## Game Design
- 5 clan totali, 3 random per run, 2 boss per clan = 6 boss per 6 piani
- Ogni boss ha una strategia "firma" (UNCOMMON) sempre presente
- Scaling rarità boss: 100% common al piano 1 → 35% legendary al piano 6
- Shop drop rate leggermente più generoso dei boss (tabella SHOP_RARITY)
- Il giocatore parte con 5 umani comuni e strategie comuni
- Layout desktop 1920x1080
- Flusso: Home → Floor Hub → (Team / Strategy / Shops) → Prematch → Result → next floor

## Convenzioni
- Tutti i testi di gioco sono in italiano
- ID pattern: h1-h10 (umani), o1-o16 (orchi), i1-i16 (insettidi), f1-f16 (felidi), g1-g16 (golem), ph1-ph16 (phantom)
- Strategie firma hanno ID con "_sig": oa_sig1, fa_sig2, etc.
- Razze: HUMAN, ORC, INSECTOID, FELINE, GOLEM (Archivisti — Cristallini eretici), PHANTOM (Fuori-Catalogo — civiltà cancellate che sopravvivono come pattern)
- Stile CSS: noir palette, font Orbitron + Space Mono, colori gold/red/blue

## Lore
- La Torre è l'arbitrato federale: le civiltà giocano a basket per il diritto di esistere nei registri.
- Drava (Cristallina, piano 6) è l'Archivista Federale: decide chi esiste e chi no.
- Archivisti = fazione di Cristallini eretici in scisma con Drava. I loro corpi-cristallo contengono le civiltà che Drava ha cancellato. Piani 4-5.
- Fuori-Catalogo = civiltà deregistrate che sopravvivono solo come schemi di gioco (il basket era uno dei loro riti). Non hanno corpi stabili, solo pattern. Piani 2-3.
- Tono: 60/40 Blade Runner / Kafka.

## Prossimi step
- [ ] Sistema eventi random tra i piani
- [ ] Animazioni partita (non solo risultato testuale)
- [ ] Sprite personaggi
- [ ] Sistema guardaroba (cosmetici meta-progression)
- [ ] Salvataggio progressi meta
- [ ] Sound design con Tone.js
