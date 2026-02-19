# Szakdolgozat dokumentáció

Ez a fájl a szakdolgozat írása és a projektdokumentáció készítése során gyűjtött jegyzetek, döntések és a **megvalósítás naplója** (amit eddig csináltunk és később automatikusan bővül).

---

## Dokumentum célja

- Tervezési és megvalósítási döntések rögzítése.
- **Megvalósítási napló:** lépésről lépésre, mi készült el és mi a terv.
- Mérési eredmények és benchmark összefoglalók helye.
- Szakdolgozati fejezetek vázlata (bevezetés, elmélet, megvalósítás, mérés, konklúzió).

---

## Kapcsolódó dokumentumok

- [György_Ákos_Szakdolgozat_Specifikáció.md](György_Ákos_Szakdolgozat_Specifikáció.md) – hivatalos specifikáció és követelmények.
- [ai_docs/snake_mi_szakdolgozat_terv_711c4121.plan.md](ai_docs/snake_mi_szakdolgozat_terv_711c4121.plan.md) – fejlesztési terv és fájlstruktúra.

---

## Szakdolgozati fejezetek (vázlat)

1. **Bevezetés** – cél, motiváció, fő eredmények.
2. **Elméleti háttér** – Snake játék, útkeresés (BFS, A*), Hamilton-kör, RL alapok (opcionális).
3. **Követelmények és tervezés** – FK/NFK, rendszerarchitektúra, modulok.
4. **Megvalósítás** – technológiai stack, játéklogika, MI réteg, frontend/backend.
5. **Mérés és értékelés** – benchmark módszer, eredmények, összehasonlítás.
6. **Összegzés és továbbfejlesztési lehetőségek.**

---

## Megvalósítási napló

*A projekt lépései kronologikus sorrendben. Új bejegyzések a napló aljához kerülnek.*

### 1. Dokumentáció és specifikáció

- **docs mappa létrehozva.** A specifikáció a Word (.docx) helyett olvasható Markdown formátumban készült.
- **György_Ákos_Szakdolgozat_Specifikáció.md** (a `docs/` mappában): teljes specifikáció formázva (címek, listák, kódblokkok, FK/NFK, 7.x fejezetek). A gyökérben lévő ugyannevű fájl erre hivatkozik.
- **szakdolgozat_dokumentacio.md** (ez a fájl): szakdolgozat vázlat, kapcsolódó docok, jegyzetek és a megvalósítási napló.

### 2. Projekt mappastruktúra (monorepo)

A terv alapján létrejöttek az alábbi mappák és alapfájlok:

| Mappa / fájl | Tartalom |
|--------------|----------|
| **docs/** | Specifikáció, szakdolgozat dokumentáció, ai_docs (terv). |
| **frontend/** | React + TypeScript + Vite alkalmazás, játéklogika, UI (lásd alább). |
| **backend/** | Node.js + Express + SQLite váz: `package.json`, `src/`, `src/db/migrations/`, `data/`. |
| **ai_service/** | Python AI szolgáltatás váz: `requirements.txt` (FastAPI, uvicorn), `src/`. |
| **benchmarks/** | Mérési kampány helye: `results/`, `plots/` (üres, később scriptek és grafikonok). |

### 3. Frontend – alapok és játéklogika

- **Vite + React + TypeScript** projekt: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `config.json.example`.
- **Core (játéklogika, spec 7.5.1–7.5.3):**
  - **types.ts** – `Direction`, `GridCell`, `Pos`, `GameStateSnapshot`, `GamePhase`, `Action`, `Strategy` interfész, `GameConfig`.
  - **rng.ts** – seed-elhető PRNG (Mulberry32) a reprodukálhatósághoz (NFK5).
  - **board.ts** – N×M rács, `isInBounds`, `getEmptyCells` (étel helyhez).
  - **snake.ts** – kezdő 3 szegmens, középen, jobbra (spec 7.2); `getNextHead`, `isOpposite`, `moveSnake` (növekedés/farok).
  - **food.ts** – `placeFood` (rács + üres cellák), `placeFoodSeeded` (seed-del, játékban használt).
  - **collision.ts** – `hitWall`, `hitSelf`, `hitFood`.
  - **score.ts** – 1 pont/étel, nehézségi szorzó (FK6).
  - **game.ts** – állapotgép: `INIT` → `RUNNING` → `PAUSED` → `GAME_OVER`; `createGame`, `setDirection`, `startGame`, `pauseGame`, `resumeGame`, `tick`, `getSnapshot`.
- **I/O réteg:** `io/config.ts` (localStorage config betöltés/mentés), `io/storage.ts` (eredmények listája), `api.ts` (REST váz a backend felé).
- **Hooks:** `useGameLoop.ts` – `tick` hívása `tickMs` időközönként, ha a fázis `RUNNING`.

### 4. Frontend – megjelenítés és felület

- **View:** `view/GameCanvas.tsx` (HTML5 Canvas: rács, kígyó fej/test, étel), `view/HUD.tsx` (pont, hossz, lépésszám, sebesség, státusz).
- **UI:** `ui/MainMenu.tsx` (Játékos mód, MI mód, Beállítások, Eredmények), `ui/Settings.tsx` (rácsméret, tick_ms, seed), `ui/Results.tsx` (mentett eredmények listája).
- **App.tsx** – képernyőváltás (menü / beállítások / eredmények / játék); billentyűzet: nyilak vagy WASD, P = szünet, R = új játék; játék végén eredmény mentése és Főmenü / Új játék gombok.
- **main.tsx** – React belépési pont.
- **ai/Strategy.ts** – helykitöltő stratégia (étel felé lép), később BFS/A* vagy Hamilton (spec 7.6).

### 5. Javítások

- **tsconfig.json** – a `noFallthroughCasesInSwitch` JSON-ban értéket kapott: `"noFallthroughCasesInSwitch": true` (build hiba elhárítva).

### 6. Design és light/dark mód

- **Téma rendszer:** CSS változók `[data-theme="dark"]` és `[data-theme="light"]` alatt (háttér, felület, szöveg, accent, stb.). A téma a `document.documentElement` `data-theme` attribútumával vált, localStorage-ban tárolva (`snake_theme`).
- **ThemeContext:** React context a téma állapothoz, `ThemeProvider`, `useTheme()`, `toggleTheme()`. A `main.tsx` a gyökérben `ThemeProvider`-rel csomagolja az alkalmazást.
- **Header:** minden képernyőn megjelenő fejléc („Snake – MI” cím + téma váltó gomb: Világos / Sötét).
- **Globális stílusok (`theme.css`):** alaphelyzet, kártyák (`.card`), gombok (`.btn`, `.btn-secondary`, `.btn-block`), űrlapok (`.form-group`, input fókusz gyűrű), HUD, eredménylista, üres állapot, game over szöveg. Átmenetek a háttér/szín váltásnál.
- **Komponensek:** MainMenu, Settings, Results a `.card` és `.btn` osztályokkal; HUD a `.hud` osztállyal; GameCanvas a téma alapján más színeket használ (sötét/világos háttér, rács, kígyó, étel). A játéktér canvas árnyékkal és kerekített sarkokkal.
- **Elérhetőség:** téma gomb `aria-label`, fókusz stílusok az inputokon.

### 7. ai_service (Python AI modul) – spec 3, 7.5.2, 7.6.1

- **FastAPI** alkalmazás: WebSocket (`/ws`) a valós idejű játékállapot fogadására; válasz: `{"action": "Up"|"Right"|"Down"|"Left"}`. REST: `GET /health`, `GET /strategies`, `POST /next` (egy állapothoz egy lépés, teszteléshez).
- **Állapot:** a frontend `GameStateSnapshot` formátuma (snake, direction, food, rows, cols, seed, tick, score); `state.py` – `GameState`, `parse_state()`, irányok és delta.
- **Stratégia interfész:** `Strategy.next_move(state) -> Direction` (spec 7.18). Implementációk: `strategies/astar.py` – A* az ételig Manhattan-heurisztikával; ha nincs biztonságos útvonal, fallback: legbiztonságosabb lokális lépés (flood fill szabadságfok) vagy farok-követés (spec 7.6.1).
- **Futtatás:** `ai_service` mappából: `uvicorn src.main:app --reload --host 0.0.0.0 --port 8000`. Környezeti változók: `AI_STRATEGY`, `AI_SAFETY`. README a mappában.

### 8. Későbbi bővítések (terv)

- Backend: Express szerver, auth, pontszámok SQLite-ban, REST API.
- Frontend: MI mód WebSocket-kapcsolat az ai_service `/ws` végponthoz.
- ai_service: Hamilton-kör stratégia (7.6.2); opcionális RL (DQN/PPO, Stable-Baselines3).
- Benchmark scriptek és mérési eredmények dokumentálása (7.11, 7.15).
- Egységtesztek a core és ai_service modulokra (NFK3, ≥70% lefedettség).
- CI (pl. GitHub Actions): lint, tesztek.

*Az itt felsorolt „Későbbi bővítések” és a napló további része a fejlesztés előrehaladásával automatikusan bővülhet.*

---

## Jegyzetek és döntések

- **Monorepo:** egy repository (frontend, backend, ai_service, benchmarks), egyszerűbb verziókezelés és terv követés.
- **Játéklogika független a UI-tól:** a `core/` modulok tiszta függvények/objektumok, később egységtesztelhetők és a Python AI szimulátor is ugyanazokat a szabályokat használhatja.
- **Stratégia interfész:** `nextMove(state) => Action` – minden MI (A*, Hamilton, RL) ugyanazt az API-t implementálja (spec 7.18).
- **Konfiguráció és seed:** `config.json` / localStorage, fix seed opció a reprodukálható futásokhoz (NFK5).
- **Design:** light/dark téma CSS változókkal és React ThemeContext-tel; egységes kártya, gomb, űrlap és HUD stílusok a `theme.css`-ben.
