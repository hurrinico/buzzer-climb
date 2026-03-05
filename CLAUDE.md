# Buzzer Climb

Roguelike basketball deckbuilding game. Noir sci-fi ambientazione.

## Architettura
- Single-file React app: `src/App.jsx`
- Vite dev server
- No backend, no database, tutto client-side

## Struttura App.jsx
- Righe 1-370: CLAN_DATA con 5 clan alieni + giocatori umani
- Righe 370-540: initRun, genBoss, genShop (generazione procedurale)
- Righe 540-610: simRound, simMatch (engine partita con dadi)
- Righe 610-700: IMAGES, CSS, stili
- Righe 700-fine: UI React (screens: home, explore, team, strategy, shops, prematch, result, victory, gameover)

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
- Razze: HUMAN, ORC, INSECTOID, FELINE, GOLEM (placeholder Cristallini), PHANTOM (placeholder Ombre)
- Stile CSS: noir palette, font Orbitron + Space Mono, colori gold/red/blue

## Prossimi step
- [ ] Definire i 2 clan placeholder (Cristallini e Ombre) con identità forte
- [ ] Sistema eventi random tra i piani
- [ ] Animazioni partita (non solo risultato testuale)
- [ ] Sprite personaggi
- [ ] Sistema guardaroba (cosmetici meta-progression)
- [ ] Salvataggio progressi meta
- [ ] Sound design con Tone.js
