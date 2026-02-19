---
name: Snake MI szakdolgozat terv
overview: "A György Ákos specifikációja alapján terv a webes Snake + MI szakdolgozat projekthez: fejlesztési módszerek és ajánlott fájlstruktúra (frontend React/TS, backend Node + Python AI)."
todos: []
isProject: false
---

# Snake + MI szakdolgozat – fejlesztési módszerek és fájlstruktúra

A [György_Ákos_Szakdolgozat_Specifikáció.md](György_Ákos_Szakdolgozat_Specifikáció.md) alapján összeállított terv.

---

## 1. Hatékony fejlesztési módszerek

### 1.1 Lépésenkénti építés (a spec 6. „Következő lépések” szerint)

- **Először** játéklogika és megjelenítés (emberi irányítás), **majd** backend és adatbázis, **végül** MI réteg és WebSocket. Így minden fázis tesztelhető önállóan.
- A spec 7.13 ütemterve (12 hét) jól használható: 1–2. hét skeleton + tech választás, 3–4. core + UI, 5–6. heurisztikus MI + tesztek, 7–8. Hamilton + benchmark, 9–10. RL (opcionális), 11. mérés, 12. dokumentáció.

### 1.2 Moduláris architektúra (spec 7.5)

- **Core** (játéklogika) független a megjelenítéstől és a MI-től: így egységtesztelhető, és később a Python AI szimulátor is ugyanazt a „szabályokat” használja.
- **Stratégia interfész** (`next_move(state) -> Action`): minden MI (A*, BFS, Hamilton, RL) ugyanazt az API-t implementálja; könnyű új stratégiát hozzáadni és összehasonlítani.
- **Állapotgép** (INIT → RUNNING → PAUSED → GAME_OVER): egyértelmű állapotátmenetek, kevesebb bug.

### 1.3 Tesztelés és minőség (FK/NFK alapján)

- **Egységtesztek** a magra: ütközés, mozgás, étel-generálás, útkereső (BFS/A*) helyessége; cél ≥70% lefedettség (NFK3).
- **MI benchmark** korán: 100–1000 futás fix seed-del; metrikák: átlag/medián pont, túlélési lépés, halálok (spec 7.11). Így objektívan mérhető az „AI mód ≥95%-ban eléri az első ételt” (7.15).
- **Lint + CI** (pl. GitHub Actions): minden commitnál tesztek + formázás, reprodukálható build (NFK5).

### 1.4 Konfiguráció és reprodukálhatóság

- **config.json** (rács, tick_ms, seed, ai.strategy, ai.safety) és fix seed opció minden MI futtatáshoz (NFK5, 7.10).
- **Eredmények** lokálisan (scores.json / localStorage) és opcionálisan Node backend + SQLite (spec 2. „Eredmény- és statisztika-mentés”).

### 1.5 Kockázatcsökkentés (spec 7.12)

- *A csapdába esés: Hamilton vagy farok-követés fallback (biztonsági lépés) – ezt érdemes előre tervezni az A* mellett.
- **RL állapottér**: diszkrét jellemzők, kisebb rács (pl. 10×10) a tréninghez, reward shaping (7.6.3).
- **Teljesítmény**: egyszerű adatszerkezetek (deque kígyóhoz, 2D tömb/bitset), cél MI döntés <10 ms (NFK1).

---

## 2. Javasolt fájlstruktúra

A spec szerint: **Frontend** (React + TS + játék), **Backend Node** (felhasználók, pontszámok), **Backend Python** (AI, WebSocket). Egy **monorepo** ajánlott (egy repo, több mappa), hogy verzió és ág együtt legyen.

```
snake_projekt/
├── docs/                          # Szakdolgozat és spec
│   ├── György_Ákos_Szakdolgozat_Specifikáció.md
│   └── tervezet_szakdolgozat/     # Word/LaTeX anyagok (opcionális)
│
├── frontend/                      # React + TypeScript + játék
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── public/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── core/                  # Játéklogika (spec 7.5.1–7.5.3)
│   │   │   ├── game.ts            # Állapotgép, tick
│   │   │   ├── board.ts           # N×M rács
│   │   │   ├── snake.ts           # deque, irány, mozgás
│   │   │   ├── food.ts
│   │   │   ├── collision.ts
│   │   │   ├── score.ts
│   │   │   ├── types.ts           # Direction, State, Action, GridCell
│   │   │   └── rng.ts             # seed-elhető RNG
│   │   ├── ai/                    # MI réteg (kliens oldali heurisztika)
│   │   │   ├── Strategy.ts        # interface next_move(state) -> Action
│   │   │   ├── HeuristicPathfinder.ts  # BFS / A*
│   │   │   ├── HamiltonianDriver.ts
│   │   │   └── safety.ts          # flood fill, farok-követés fallback
│   │   ├── view/                  # Megjelenítés (Canvas/Phaser/p5)
│   │   │   ├── GameCanvas.tsx
│   │   │   ├── HUD.tsx
│   │   │   └── renderer.ts
│   │   ├── ui/                    # React UI
│   │   │   ├── MainMenu.tsx       # Játékos / MI, Beállítások, Eredmények
│   │   │   ├── Settings.tsx       # rácsméret, sebesség, MI paraméterek, seed
│   │   │   ├── Results.tsx
│   │   │   └── GameControls.tsx
│   │   ├── io/                    # I/O, konfig, mentés (spec 7.5.1)
│   │   │   ├── config.ts          # config.json betöltés
│   │   │   ├── storage.ts         # localStorage / scores
│   │   │   └── api.ts             # REST hívások a Node backendre
│   │   ├── hooks/
│   │   │   └── useGameLoop.ts
│   │   └── tests/
│   │       ├── core/
│   │       └── ai/
│   └── config.json.example
│
├── backend/                       # Node.js + Express + SQLite
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── auth.ts            # regisztráció, login (spec 4)
│   │   │   ├── scores.ts
│   │   │   └── config.ts
│   │   ├── db/
│   │   │   ├── sqlite.ts
│   │   │   └── migrations/
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   └── tests/
│   └── data/                      # SQLite fájl (gitignore)
│
├── ai-service/                    # Python: FastAPI + RL/heurisztika (opcionális)
│   ├── requirements.txt           # fastapi, uvicorn, torch/sb3, numpy
│   ├── pyproject.toml             # opcionális
│   ├── src/
│   │   ├── main.py                # FastAPI app, WebSocket endpoint
│   │   ├── env/
│   │   │   └── snake_env.py       # Gym-style env: state, reward, step
│   │   ├── agents/
│   │   │   ├── dqn.py
│   │   │   ├── ppo.py             # Stable-Baselines3
│   │   │   └── genetic.py
│   │   ├── inference.py           # next_move(state) -> action (WebSockethez)
│   │   └── tests/
│   └── config.json.example
│
├── benchmarks/                    # MI mérési kampány (spec 7.11)
│   ├── run_benchmark.ts           # vagy .py: 100–1000 futás, seed-ek
│   ├── results/                   # JSON/CSV eredmények (gitignore vagy minta)
│   └── plots/                     # tanulási görbe, pontszám eloszlás
│
├── .github/
│   └── workflows/
│       └── ci.yml                 # lint, unit tests (frontend + backend)
│
├── config.json.example            # globális minta (grid, tick_ms, seed, ai)
├── .gitignore
└── README.md                      # build, futtatás, teszt, benchmark
```

### Rövid indoklás

- **frontend/src/core**: A spec 7.5.2 moduljai (Board, Snake, Food, Collision, Score); tiszta függvények/objektumok, könnyű tesztelni.
- **frontend/src/ai**: Heurisztikus stratégiák (A*, BFS, Hamilton) a kliensen – alacsony késleltetés (NFK1). RL opcionálisan a **ai-service** Pythonban, WebSocketen kapja az állapotot.
- **backend**: Auth + pontszámok (SQLite), REST; WebSocket lehet itt is vagy az **ai-service**-ben a játék→AI adat továbbítására.
- **ai-service**: Csak akkor kell teljesen kiépíteni, ha RL/Stable-Baselines3 a tervben van; kezdetben a frontend A*/Hamilton is elég az elfogadási kritériumokhoz.
- **benchmarks/**: A 7.11 és 7.15 miatt érdemes külön mappában scripteket és eredményeket tartani.

---

## 3. Összefoglaló – mi a legfontosabb

1. **Követni a spec lépéseit**: először játék + emberi mód, majd backend + mentés, végül MI (heurisztika kötelező, RL opcionális).
2. **Core és MI réteg szétválasztása**: tiszta `State` és `next_move(State)` interfész, egységtesztek a magra, benchmark a stratégiákra.
3. **Konfig és seed**: minden futtatás reprodukálható; config.json egy helyen (vagy frontend + ai-service másolata).
4. **Fájlstruktúra**: monorepo, `frontend/` (core, ai, view, ui, io), `backend/` (Node + SQLite), `ai-service/` (Python, opcionális), `benchmarks/` a méréshez.
5. **CI és dokumentáció**: lint + tesztek a 12. héten könnyebbé teszi a dokumentálást és a deliverable-ök átadását (7.14).

Ha szeretnéd, a következő lépésben lehet részletezni pl. csak a **frontend core + ai** modulok API-ját (függvény szignatúrák, példa state) vagy a **benchmark** futtatási és kiértékelési lépéseit.