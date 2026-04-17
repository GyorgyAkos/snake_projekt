# Szakdolgozat dokumentáció

Ez a fájl a szakdolgozat írása és a projektdokumentáció készítése során gyűjtött jegyzetek, döntések és a **megvalósítás naplója** (amit eddig készült és később bővül). Az elavult részeket a naplóban közvetlenül frissítjük; külön „javítások” szekció nincs.

---

## Tartalomjegyzék

1. [Dokumentum célja](#dokumentum-célja)
2. [Kapcsolódó dokumentumok](#kapcsolódó-dokumentumok)
3. [Szakdolgozati fejezetek (vázlat)](#szakdolgozati-fejezetek-vázlat)
4. [Megvalósítási napló](#megvalósítási-napló)
   - 4.1. [Dokumentáció és specifikáció](#41-dokumentáció-és-specifikáció)
   - 4.2. [Projekt mappastruktúra (monorepo)](#42-projekt-mappastruktúra-monorepo)
   - 4.3. [Frontend – technológiák, alapok, játéklogika](#43-frontend--technológiák-alapok-játéklogika)
   - 4.4. [Frontend – megjelenítés és felület](#44-frontend--megjelenítés-és-felület)
   - 4.5. [Design és light/dark mód](#45-design-és-lightdark-mód)
   - 4.6. [ai_service – Python AI modul](#46-ai_service--python-ai-modul)
   - 4.7. [Stratégiaválasztó és benchmark](#47-stratégiaválasztó-és-benchmark)
   - 4.8. [Backend és auth](#48-backend-és-auth)
   - 4.9. [Későbbi bővítések (terv)](#49-későbbi-bővítések-terv)
   - 4.10. [Új AI stratégiák (docs/ai_docs alapján)](#410-új-ai-stratégiák-docsai_docs-alapján)
5. [Funkcionalitások (alkalmazás)](#funkcionalitások-alkalmazás)
6. [Jegyzetek és döntések](#jegyzetek-és-döntések)

---

## Dokumentum célja

- Tervezési és megvalósítási döntések rögzítése.
- **Megvalósítási napló:** lépésről lépésre, mi készült el és mi a terv; fontosabb részeknél technológia, módszer, fájlstruktúra, rövid kódrészletek.
- Mérési eredmények és benchmark összefoglalók helye.
- Szakdolgozati fejezetek vázlata (bevezetés, elmélet, megvalósítás, mérés, konklúzió).

---

## Kapcsolódó dokumentumok

- [README.md](../README.md) (gyökér) – rövid projektleírás, követelmények, telepítés, futtatás (köztük `npm run dev:all`), linkek.
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

## Funkcionalitások (alkalmazás)

Ez a fejezet a **webes frontend** szempontjából foglalja össze, mit tud a felhasználó az alkalmazásban: mely képernyők érhetők el, milyen adatokkal dolgoznak, és hogyan kapcsolódnak a **backend** (Node, auth, pontszámok) és az **ai_service** (WebSocket, stratégiák, benchmark kiszolgálás) komponensekhez. A megvalósítás részletei (fájlok, napló) a [Megvalósítási napló](#megvalósítási-napló) szakaszban találhatók.

### Áttekintés és navigáció

Az alkalmazás egyoldalas (SPA) felület: a [`App.tsx`](../frontend/src/App.tsx) egy `screen` állapot szerint vált a képernyők között. **Közös elem** a [`Header`](../frontend/src/ui/Header.tsx): minden ilyen nézetben megjelenik az alkalmazás címe („Snake – MI”), a **bejelentkezési állapottól függő auth gombok**, valamint a **téma váltó** (világos / sötét). A főmenüből érhető el a játék indítása (játékos vagy MI módban), a beállítások, az eredmények és a statisztika; a fejlécből a bejelentkezés / regisztráció / profil / kijelentkezés és a téma.

### Főmenü

A [`MainMenu`](../frontend/src/ui/MainMenu.tsx) a belépési pont:

- **Játék mód választó:** rádiógombokkal **Játékos** vagy **MI**. Ez csak azt határozza meg, hogy a „Játék indítása” melyik módot indítja el a **jelenleg betöltött** `GameConfig` alapján (a részletes rács / tick / seed / stratégia a Beállításokban állítható).
- **Játék indítása:** meghívja az `onStartGame(config, mode)`-ot: elmenti a konfigurációt, létrehoz egy új játékállapotot (seed a configból vagy aktuális idő), és átvált a **játék** képernyőre.
- **Beállítások:** a beállítások képernyő.
- **Eredmények:** ha van JWT token, a backendről lekéri a pontlistát (`fetchScores`), majd megjeleníti az eredményeket; ha nincs bejelentkezve, a **böngészőben lokálisan** tárolt eredményeket tölti be.
- **Statisztika:** a benchmark összefoglaló oldal (lásd lentebb).
- **Profil:** csak **bejelentkezett** felhasználónak jelenik meg; a fejlécből is elérhető.

### Bejelentkezés és regisztráció

- **Bejelentkezés** ([`LoginForm`](../frontend/src/ui/LoginForm.tsx)): felhasználónév vagy email + jelszó. Sikeres válasz esetén a [`AuthContext`](../frontend/src/AuthContext.tsx) `setAuth(token, user)` menti a JWT-t és a felhasználói objektumot a **localStorage**-ba (`snake_token`, `snake_user`), majd a menüre navigál.
- **Regisztráció** ([`RegisterForm`](../frontend/src/ui/RegisterForm.tsx)): email, felhasználónév, jelszó, jelszó megerősítése; validáció és duplikáció kezelése a backend válasza szerint. Siker után szintén token + user kerül tárolásra, és menüre lépés.

Mindkét űrlapon van **Vissza** a főmenüre. A tényleges HTTP hívások a [`api.ts`](../frontend/src/api.ts)-ben vannak (`login`, `register`), alap URL: `VITE_API_URL` vagy `http://localhost:3000`.

### Kijelentkezés

A fejléc **Kijelentkezés** gombja az `AuthContext.logout()`-ot hívja: törli a token és user kulcsokat a localStorage-ból, és nullázza az állapotot. Ez nem törli a lokális játék-konfigurációt; a következő játék végi pontszám már nem kerül automatikusan a szerverre, amíg újra be nem jelentkezik.

### Light / dark mód

A [`ThemeContext`](../frontend/src/ThemeContext.tsx) és a [`theme.css`](../frontend/src/theme.css) `[data-theme="dark"]` / `[data-theme="light"]` változói határozzák meg a színeket. A fejléc gombja **váltogatja** a témát; a választás perzisztálva van (localStorage, pl. `snake_theme`). A **Canvas** rajzolás a [`GameCanvas`](../frontend/src/view/GameCanvas.tsx)-ben téma szerinti fix színpalettát használ, mert a 2D Canvas nem örökli automatikusan a CSS változókat.

### Beállítások ablak

A [`Settings`](../frontend/src/ui/Settings.tsx) két fület kínál:

1. **Játékos** ([`PlayerSettings`](../frontend/src/ui/PlayerSettings.tsx)): pálya **sor / oszlop** (10–40), **tick időköz** ms-ban (50–500, a kígyó sebessége), opcionális **seed** (üres = véletlen). **Játék indítása** menti a konfigot (`saveConfig` → localStorage) és játékos módban indít.
2. **MI** ([`AISettings`](../frontend/src/ui/AISettings.tsx)): ugyanazok a pálya / tick / seed mezők, plusz **MI stratégia** legördülő: az [`AI_STRATEGIES`](../frontend/src/ai/strategies.ts) lista minden bejegyzése (név + rövid leírás a választás alatt). A kiválasztott stratégia azonosítója a `config.ai.strategy` mezőbe kerül; mentéskor ez is a localStorage konfig része.

A lap alján **Vissza a főmenübe** zárja a beállításokat. A konfiguráció betöltése az alkalmazás indulásakor [`loadConfig`](../frontend/src/io/config.ts)-gal történik.

### Játék képernyő – játékos mód

- **HUD** ([`HUD`](../frontend/src/view/HUD.tsx)): élő **pont**, **kígyó hossz**, **lépésszám**, **tick/s**, **státusz** (Készül / Fut / Szünet / Vége).
- **Canvas:** a pálya, kígyó és étel megjelenítése.
- **Billentyűzet:** **nyilak** és **WASD** állítja az irányt (futó vagy INIT fázisban); **P** szünet / folytatás; **R** új játék **ugyanabban** a módban; **Enter** INIT állapotból indítja a játékot.
- **Játékciklus:** [`useGameLoop`](../frontend/src/hooks/useGameLoop.ts) – fix intervallumos `tick` hívások.

### Játék képernyő – MI mód

Ugyan a HUD és a Canvas, de:

- **MI vezérlés:** [`useAIGameLoop`](../frontend/src/hooks/useAIGameLoop.ts) minden tick után **WebSocketen** (`VITE_AI_WS_URL` vagy alapértelmezett `ws://localhost:8000/ws`) elküldi a játék pillanatképét az **ai_service**-nek, és a válasz **irány** (`action`) alapján lépteti a kígyót. Ha nincs kapcsolat, **helyi fallback** stratégia fut ([`placeholderStrategy`](../frontend/src/ai/Strategy.ts) – egyszerű étel felé logika).
- A HUD **„MI: backend (&lt;stratégia neve&gt;)”** vagy **„MI: helyi”** szöveget mutatja, jelezve a WebSocket állapotát. A szervernek küldött üzenet tartalmazza a választott **strategy** azonosítót, hogy a megfelelő Python stratégia fusson.

### Játék vége és pontszám mentés

`GAME_OVER` esetén a rendszer:

1. **Lokálisan** ment egy bejegyzést ([`saveScore`](../frontend/src/io/storage.ts)): pont, tick, hossz, időbélyeg, mód (játékos / MI), MI esetén az **aiStrategy** azonosító.
2. Ha van **JWT**, meghívja a [`submitScore`](../frontend/src/api.ts)-t (POST `/api/scores`), hogy a pont a **felhasználóhoz kötött** listába kerüljön.

*Megjegyzés:* az aktuális [`App.tsx`](../frontend/src/App.tsx) egy `useEffect`-ben **ürítheti** a lokális eredménylistát induláskor (`clearScores`) – fejlesztői / teszt viselkedés; éles használatnál érdemes ezt szándék szerint állítani, különben a vendég mód eredményei nem maradnak meg oldalfrissítésig.

### Eredmények oldal

A [`Results`](../frontend/src/ui/Results.tsx) a főmenü **Eredmények** gombjáról nyílik:

- Bejelentkezve: a **backendről** frissített lista (max. megjelenített sorok száma a komponensben korlátozva), minden sorban pont, lépés, hossz, **Játékos** vagy **MI (stratégia megjelenített neve)** és időpont.
- Névtelenül: **localStorage** alapú lista (ha nincs törölve).
- **Felhasználónév** megjelenik, ha van auth kontextus.

### Statisztika oldal

A [`Statistics`](../frontend/src/ui/Statistics.tsx) a **benchmark** eredmények böngészős megjelenítése:

- Adat: `GET` az AI szolgáltatás **`/benchmark/summaries`** végpontról (`VITE_AI_HTTP_URL`); képek: **`/benchmark/plots/...`**.
- Szöveges magyarázatok (metodika, heurisztika vs. tanult ügynökök), **táblázat** (szűrhető: Mind / Egyik sem / Csak heurisztikák / Csak neurális hálók), **oszlop szerinti rendezés**, **sorra kattintva részletes** leírás ([`strategyBenchmarkDetail.ts`](../frontend/src/ai/strategyBenchmarkDetail.ts) + aktuális sor metrikái), **beágyazott PNG grafikonok**.

Részletes leírás a naplóban: [4.4 – Statisztika oldal](#statisztika-oldal-benchmark-a-böngészőben).

### Profil oldal

A [`Profile`](../frontend/src/ui/Profile.tsx) csak bejelentkezett felhasználónak érhető el:

- **Felhasználónév módosítása:** űrlap → [`updateUsername`](../frontend/src/api.ts) → `loadUser()` a friss adatokért.
- **Jelszó módosítás:** jelenlegi + új + megerősítés; minimum hossz és egyezés ellenőrzése kliensen; [`updatePassword`](../frontend/src/api.ts).
- **Saját eredmények listája:** `fetchScores()` – ugyanaz a típus, mint az eredményeknél, de a profil kontextusában.

**Vissza** a főmenüre.

### Összefoglaló: adat és szolgáltatások

| Funkció | Elsődleges tárolás / forrás |
|--------|------------------------------|
| Téma | localStorage (`ThemeContext`) |
| Játék konfig | localStorage ([`io/config.ts`](../frontend/src/io/config.ts)) |
| Eredmények (vendég) | localStorage ([`io/storage.ts`](../frontend/src/io/storage.ts)) |
| Auth | JWT + user JSON localStorage; API: backend :3000 |
| MI lépés játék közben | WebSocket → ai_service :8000 |
| Statisztika táblázat / grafikon | HTTP → ai_service benchmark végpontok; fájlok: `benchmarks/results/` |

---

## Megvalósítási napló

*A projekt lépései kronologikus sorrendben. Új bejegyzések a napló aljához kerülnek; elavult részek itt kerülnek frissítésre.*

### 4.1. Dokumentáció és specifikáció

- **docs/** mappa: a specifikáció a Word (.docx) helyett olvasható Markdown formátumban.
- **György_Ákos_Szakdolgozat_Specifikáció.md**: teljes spec formázva (címek, listák, kódblokkok, FK/NFK, 7.x fejezetek). A gyökérben lévő ugyannevű fájl erre hivatkozik.
- **szakdolgozat_dokumentacio.md** (ez a fájl): cél, kapcsolódó docok, szakdolgozat vázlat, napló, jegyzetek.

---

### 4.2. Projekt mappastruktúra (monorepo)

Egy repository, több alkomponens:

| Mappa / fájl | Tartalom |
|--------------|----------|
| **docs/** | Specifikáció, szakdolgozat dokumentáció, ai_docs (terv). |
| **frontend/** | React + TypeScript + Vite, játéklogika, UI, auth (lásd 4.3–4.5). |
| **backend/** | Node.js + Express + SQLite, auth, profil, pontszámok (4.8). |
| **ai_service/** | Python FastAPI, WebSocket, A* és Hamilton stratégiák (4.6). |
| **benchmarks/** | `run_benchmark.py`, `results/`, `plots/`, README (4.7). |
| **package.json** (gyökér) | `npm run dev`, `npm run dev:backend`, `npm run dev:ai`, **`npm run dev:all`** (mind a három egyszerre). |
| **README.md** (gyökér) | Rövid leírás, követelmények, telepítés, futtatás (köztük `dev:all`), linkek a docs-ra. |

**Egyszerre indítás (dev:all):** A gyökérből egy parancs mindhárom szolgáltatást elindítja: `npm run dev:all`. A gyökérben a `concurrently` (devDependency) futtatja párhuzamosan a frontend, backend és ai_service dev scriptjeit; a konzolban a logok színezett prefixekkel (`[frontend]`, `[backend]`, `[ai]`) különülnek el. Ehhez az **ai_service** mappába egy minimális **package.json** került egyetlen `dev` scripttel: `python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000`, így a gyökérből az `npm run dev --prefix ai_service` (ill. `npm run dev:ai`) ugyanúgy indítja az AI szolgáltatást. A gyökér **README.md** tartalmazza a szükséges információt: követelmények, telepítés, futtatás (köztük `dev:all`), portok, linkek a dokumentációra.

---

### 4.3. Frontend – technológiák, alapok, játéklogika

**Technológiák:** Vite 5, React 18, TypeScript 5.6, HTML5 Canvas a játéktérhez. A játéklogika tiszta TypeScript modulokban van (spec 7.5.1), független a Reacttól, így egységtesztelhető és ugyanaz a state formátum használható az MI réteghez (snapshot).

**Fájlstruktúra (fontosabb részek):**

```
frontend/
├── index.html
├── package.json, vite.config.ts, tsconfig.json
├── config.json.example
├── public/
└── src/
    ├── main.tsx              # React belépés, ThemeProvider, AuthProvider
    ├── App.tsx               # Képernyőváltás, játékciklus, auth/profil/eredmény
    ├── theme.css             # Globális és téma CSS változók
    ├── api.ts                # REST hívások (auth, profil, scores), token; benchmark: fetchBenchmarkSummaries, benchmarkPlotUrl (AI szolgáltatás)
    ├── ThemeContext.tsx      # Light/dark téma
    ├── AuthContext.tsx       # Bejelentkezés állapot (token, user, setAuth, logout)
    ├── core/                 # Játéklogika (spec 7.5.1–7.5.3)
    │   ├── types.ts          # Direction, Pos, GameStateSnapshot, GamePhase, Strategy, GameConfig
    │   ├── rng.ts            # Seed-elhető PRNG (Mulberry32)
    │   ├── board.ts          # N×M rács, isInBounds, getEmptyCells
    │   ├── snake.ts          # Kezdő 3 szegmens, getNextHead, isOpposite, moveSnake
    │   ├── food.ts           # placeFood, placeFoodSeeded
    │   ├── collision.ts      # hitWall, hitSelf, hitFood
    │   ├── score.ts          # 1 pont/étel
    │   ├── game.ts           # Állapotgép, createGame, setDirection, startGame, pauseGame, tick, getSnapshot
    │   └── index.ts
    ├── ai/
    │   ├── Strategy.ts       # Helyi placeholder stratégia (étel felé)
    │   ├── strategies.ts     # AI_STRATEGIES lista (id, name, description), getStrategyName(), getStrategyById()
    │   └── strategyBenchmarkDetail.ts  # Statisztika oldal: részletes működés + tipikus benchmark-magyarázat stratégiánként
    ├── io/
    │   ├── config.ts         # localStorage config (loadConfig, saveConfig)
    │   └── storage.ts        # Eredmények listája (StoredScore, loadScores, saveScore)
    ├── hooks/
    │   ├── useGameLoop.ts    # Játékos mód: setInterval tick
    │   ├── useAIGameLoop.ts  # MI mód: async tick, WebSocket vagy helyi stratégia
    │   └── useAIWebSocket.ts # WebSocket ai_service felé, getAction(state, strategy?)
    ├── view/
    │   ├── GameCanvas.tsx    # Canvas: rács, kígyó, étel (téma szerinti színek)
    │   └── HUD.tsx           # Pont, hossz, lépés, sebesség, státusz, MI (backend/helyi + stratégia)
    └── ui/
        ├── Header.tsx        # Cím, Bejelentkezés/Regisztráció vagy Profil/Kijelentkezés, téma
        ├── MainMenu.tsx      # Játékos/MI, Beállítások, Eredmények, Statisztika, Profil (ha bejelentkezve)
        ├── Settings.tsx      # Rácsméret, tick_ms, seed, MI stratégia (A* / Hamilton)
        ├── Results.tsx       # Eredmények lista (Játékos / MI (A*) / MI (Hamilton))
        ├── Statistics.tsx    # Benchmark összefoglaló táblázat, szűrés, rendezés, stratégia részletek, generált grafikonok
        ├── LoginForm.tsx     # usernameOrEmail + jelszó
        ├── RegisterForm.tsx  # email, username, jelszó, jelszó ismétlés
        └── Profile.tsx       # Felhasználónév/jelszó módosítás, saját eredmények (backendről)
```

**Adatszerkezetek és állapotgép (spec 7.5.2–7.5.3):** A `core/types.ts` definiálja a `GameStateSnapshot`-ot (snake, direction, food, rows, cols, seed, tick, score), a `GamePhase`-t (INIT → RUNNING → PAUSED → GAME_OVER) és a `Strategy` interfészt. A `game.ts` kezeli a ticket: irány frissítése (ellentétes tiltva), fej mozgatása, ütközés, étel/növekedés, getSnapshot az MI és mentéshez.

Példa a típusokra és a stratégia interfészre ([frontend/src/core/types.ts](frontend/src/core/types.ts)):

```typescript
/** Játék állapotgép (spec 7.5.2). */
export type GamePhase = 'INIT' | 'RUNNING' | 'PAUSED' | 'GAME_OVER'

/** Stratégia interfész (spec 7.18). */
export interface Strategy {
  nextMove(state: GameStateSnapshot): Action
}
```

Példa a játék létrehozására és irány kezelésére ([frontend/src/core/game.ts](frontend/src/core/game.ts)):

```typescript
export function createGame(config: Partial<GameConfig> | null): GameState {
  const rows = config?.grid?.rows ?? DEFAULT_ROWS
  const cols = config?.grid?.cols ?? DEFAULT_COLS
  const tickMs = config?.tick_ms ?? DEFAULT_TICK_MS
  const seed = config?.seed ?? Date.now()
  setSeed(seed)
  const { body, direction } = createSnake(rows, cols)
  const food = placeFoodSeeded(rows, cols, body, next)
  return { phase: 'INIT', rows, cols, snakeBody: body, direction, food, score: 0, tick: 0, seed, tickMs }
}

export function setDirection(state: GameState, newDir: Direction): GameState {
  if (state.phase !== 'RUNNING' && state.phase !== 'INIT') return state
  if (isOpposite(state.direction, newDir)) return state
  return { ...state, direction: newDir }
}
```

**I/O:** A konfig (rácsméret, tick_ms, seed, ai.strategy) és az eredmények (score, tick, length, mode, aiStrategy) a böngésző localStorage-ban is tárolódnak; bejelentkezés után a pontszámok a backendre is kerülnek (api.ts: submitScore).

---

### 4.4. Frontend – megjelenítés és felület

- **GameCanvas:** HTML5 Canvas; a rács, a kígyó (fej kiemelve) és az étel téma szerinti színekkel (sötét/világos háttér, grid line, snake/snakeHead, food). A canvas mérete a `rows`/`cols` és a cellaméret alapján számolt.
- **HUD:** Pont, hossz, lépésszám, sebesség (tick/s), státusz (Készül, Fut, Szünet, Vége), MI módban „MI: backend (&lt;stratégia neve&gt;)” vagy „MI: helyi”.
- **MainMenu, Settings, Results:** Kártya stílus (theme.css `.card`), gombok (`.btn`, `.btn-secondary`). **Beállítások:** külön „MI stratégia (backend)” szekció: több stratégia választható (heurisztikák és DQN / PPO / NEAT), mindegyiknél rövid leírás. Eredményeknél minden sorban látszik, hogy **Játékos** vagy **MI (&lt;stratégia neve&gt;)** (modeLabel a `StoredScore.mode` és `aiStrategy` alapján; `getStrategyName()` a frontend `ai/strategies.ts`-ből).
- **App.tsx:** Képernyők: menu, settings, results, **statistics**, game, login, register, profile. Billentyűzet: nyilak/WASD, P = szünet, R = új játék. Játék vége: lokális mentés (mode + aiStrategy); ha van token, backendre is küldés (submitScoreApi).

#### Statisztika oldal (benchmark a böngészőben)

- **Elérés:** Főmenü → **Statisztika**.
- **Adatforrás:** Az `ai_service` FastAPI végpontjai olvassák a repó `benchmarks/results/strategy_benchmark_*.json` fájlok összefoglalóit (`GET /benchmark/summaries`), és kiszolgálják a `benchmarks/results/plots/*.png` képeket (`GET /benchmark/plots/{filename}`). A frontend alapértelmezett bázis URL-je: `VITE_AI_HTTP_URL` vagy `http://localhost:8000` (lásd `api.ts`: `fetchBenchmarkSummaries`, `benchmarkPlotUrl`).
- **Tartalom:** Bevezető szövegek (metodika, heurisztika vs. tanult ügynökök); **összefoglaló táblázat** (futások, átlag/medián pont, lépés, első étel %, halál okok %-ban). A halál oszlopokban a hiányzó JSON kulcs **0%**-nak számít (nincs ilyen lezárás).
- **Szűrés:** Lenyíló blokk „Stratégiák szűrése”: jelölőnégyzetek stratégiánként, gyors gombok **Mind**, **Egyik sem**, **Csak heurisztikák** (minden stratégia kivéve `dqn`, `ppo`, `neuroevolution`), **Csak neurális hálók** (csak ezek a három azonosító, ha szerepelnek a betöltött eredményekben).
- **Rendezés:** Oszlopfejlécek gombok: első kattintás új oszlopnál (számoknál alapból csökkenő, stratégia névnél növekvő), ismételt kattintás vált növekvő ↔ csökkenő.
- **Részletek:** Táblázatsorra kattintva (vagy fókusz + Enter/Space) megnyílik egy panel: rövid leírás a `strategies.ts`-ből, részletes „működési logika” és „tipikus eredmény” a `strategyBenchmarkDetail.ts`-ből, valamint az adott sor JSON-ból származó számok (pálya, mag, halál okok darabszámban). Újra ugyanarra a sorra kattintva bezárul; „Részletek bezárása” gomb.
- **Grafikonok:** A `benchmarks/generate_benchmark_plots.py` által generált PNG-k beágyazva (cím: „Grafikonok generált PNG-k”).
- **Stílus:** A `theme.css` `.stats-*` osztályai (szűrő, táblázat, kattintható sor, részletek panel, grafikon rács).

---

### 4.5. Design és light/dark mód

**Módszer:** CSS változók a `[data-theme="dark"]` és `[data-theme="light"]` szelektorok alatt; a téma a `document.documentElement.setAttribute('data-theme', theme)` és a localStorage (`snake_theme`) segítségével vált. React context (ThemeProvider, useTheme) tárolja a téma állapotot és a toggleTheme függvényt.

**Technológiák:** Egyetlen globális `theme.css` (változók, alaphelyzet, kártya, gomb, űrlap, HUD, eredménylista). A Canvas színei témafüggőek a komponensben (COLORS.dark / COLORS.light), mert a Canvas 2D nem használhat CSS változókat közvetlenül.

Példa a téma változóira és a context használatára ([frontend/src/theme.css](frontend/src/theme.css), [frontend/src/ThemeContext.tsx](frontend/src/ThemeContext.tsx)):

```css
[data-theme="dark"] {
  --bg: #0f1419;
  --surface: #2d3748;
  --text: #e2e8f0;
  --accent: #48bb78;
  /* ... */
}
[data-theme="light"] {
  --bg: #f7fafc;
  --surface: #ffffff;
  --text: #2d3748;
  /* ... */
}
```

```typescript
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])
  const toggleTheme = useCallback(() => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark')), [])
  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>
}
```

**Header:** A téma váltó mellett: nem bejelentkezve „Bejelentkezés” és „Regisztráció”; bejelentkezve felhasználónév, „Profil”, „Kijelentkezés”.

---

### 4.6. ai_service – Python AI modul

**Technológiák:** Python 3.10+, FastAPI, uvicorn. Nincs PyTorch/TensorFlow a heurisztikus stratégiákhoz; csak a standard könyvtár és a saját modulok.

**Fájlstruktúra:**

```
ai_service/
├── requirements.txt    # fastapi, uvicorn
├── README.md
├── __init__.py
└── src/
    ├── __init__.py
    ├── main.py         # FastAPI app, CORS, /health, /strategies, /ws, POST /next; benchmark: GET /benchmark/summaries, GET /benchmark/plots/{filename}
    ├── state.py        # GameState, parse_state, DELTA, OPPOSITE, DIRECTIONS
    └── strategies/
        ├── __init__.py   # STRATEGIES: astar, hamilton, bfs, greedy, follow_tail, hamilton_zigzag, lookahead, minimax, max_safety, lookahead_3, lookahead_5, hamilton_short_cycles, dqn, ppo, neuroevolution
        ├── base.py       # Strategy absztrakt: next_move(state) -> Direction
        ├── astar.py      # A* Manhattan, flood fill fallback, farok-követés
        ├── hamilton.py   # Spirál kör, next_on_cycle, étel felé A* levágás
        ├── bfs.py        # BFS az ételig, ugyanaz a fallback mint A*
        ├── greedy.py     # Greedy „biztonság első”: mindig legbiztonságosabb lépés (flood fill)
        ├── follow_tail.py       # Ételig A*, különben farok felé
        ├── hamilton_zigzag.py   # Hamilton zigzag (sávos) kör, étel felé A* levágás
        ├── lookahead.py   # 1 lépés előretekintés: max flood fill, döntetlenben étel felé
        ├── minimax.py    # Minimax rövid horizont (1–2 lépés), értékelés: szabadságfok + étel távolság
        ├── max_safety.py  # Maximal safety: csak olyan lépés, ahol marad út fej–farok között
        ├── lookahead_n.py # N lépés előretekintés (N=3,5), greedy aláírányokkal szimulálva
        ├── hamilton_short_cycles.py  # 2×2 blokkok, kis körök, étel felé blokk váltás
        └── rl_stubs.py   # DQN, PPO, Neuroevolution placeholderek (Greedy fallback)
```

**Állapot és stratégia:** A frontend `GameStateSnapshot` formátumát a `state.parse_state(data)` alakítja `GameState`-re (snake, direction, food, rows, cols). A `state.simulate_step(state, direction)` egy lépést szimulál (minimax, lookahead_n használja). A WebSocket üzenetben opcionális `strategy`: `astar`, `hamilton`, `bfs`, `greedy`, `follow_tail`, `hamilton_zigzag`, `lookahead`, `minimax`, `max_safety`, `lookahead_3`, `lookahead_5`, `hamilton_short_cycles`, `dqn`, `ppo`, `neuroevolution`; ha megvan, a szerver ezt a stratégiát használja a válaszhoz.

**A* (spec 7.6.1):** Manhattan heurisztika, A* útvonal a fej és az étel között (akadály: kígyó teste, farok nélkül). Ha nincs biztonságos út, fallback: farok-követés (A* a farkig) vagy legbiztonságosabb lokális lépés (flood fill szabadságfok).

Példa az A* útvonalkeresés és irány számítás ([ai_service/src/strategies/astar.py](ai_service/src/strategies/astar.py)):

```python
def astar_path(start, goal, obstacles, rows, cols) -> list[tuple[int, int]] | None:
    # ...
    while open_set:
        _, g, current = heapq.heappop(open_set)
        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            path.reverse()
            return path
        for n in neighbors(current):
            tent_g = g + 1
            if n not in g_score or tent_g < g_score[n]:
                came_from[n] = current
                g_score[n] = tent_g
                h = manhattan(n, goal)
                heapq.heappush(open_set, (tent_g + h, tent_g, n))
    return None
```

**Hamilton (spec 7.6.2):** Előre generált spirál (külső perem befelé) a rácson; cache-elt. A kígyó a `next_on_cycle(cycle, head)` szerinti következő cella felé lép; ha van étel és biztonságos odamenni, A* „levágás” az ételig.

Példa a spirál építésére ([ai_service/src/strategies/hamilton.py](ai_service/src/strategies/hamilton.py)):

```python
def _build_spiral_cycle(rows: int, cols: int) -> list[tuple[int, int]]:
    out: list[tuple[int, int]] = []
    r0, r1 = 0, rows - 1
    c0, c1 = 0, cols - 1
    while r0 <= r1 and c0 <= c1:
        for c in range(c0, c1 + 1):
            out.append((c, r0))
        r0 += 1
        # jobb oszlop, alsó sor, bal oszlop... (spirál)
        # ...
    return out
```

**Futtatás:** `python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000` (ai_service mappából).

**Benchmark adat a frontend statisztika oldalhoz:** A `main.py` a repó gyökeréhez képest a `benchmarks/results/` mappából összegyűjti a `strategy_benchmark_*.json` fájlok összefoglalóit (kivéve a `strategy_benchmark_summary.json` nevűt, ha az más szerkezetű), és PNG-eket szolgál ki a `benchmarks/results/plots/` alól. Ehhez az AI szolgáltatásnak ugyanarról a gépről / klónozott repóból kell futnia, ahol a benchmark már lefutott.

---

### 4.7. Stratégiaválasztó és benchmark

- **Beállítások (frontend):** „MI stratégia (backend)” szekció: 14 stratégia választható (A*, Hamilton spirál, BFS, Greedy, Farok-követés, Hamilton zigzag, Előretekintés 1 lépés, Minimax rövid horizont, Hamilton rövid ciklusok, Maximal safety, Előretekintés 3/5 lépés, DQN/PPO/Neuroevolution placeholder), mindegyiknél rövid, átlagfelhasználónak értelmezhető leírás. Az érték a `config.ai.strategy`-ben (localStorage) tárolódik; MI módban a WebSocket payload tartalmazza a `strategy` mezőt.
- **HUD:** MI módban: „MI: backend (&lt;stratégia neve&gt;)” vagy „MI: helyi” ha nincs kapcsolat.
- **Benchmark:** `benchmarks/run_strategy_benchmark.py` (és kapcsolódóan `generate_benchmark_plots.py`) – stratégiánként JSON a `benchmarks/results/strategy_benchmark_<id>.json` alá, összefoglaló metrikák: score_mean/median, steps_mean/median, death_counts, reached_first_food (%). A frontend **Statisztika** oldal ezeket az `ai_service` `/benchmark/summaries` végpontján keresztül tölti be. Régebbi, egyszerűbb script: `benchmarks/run_benchmark.py` (A* / Hamilton) – a dokumentációban említett fájlnevek ettől eltérhetnek; a szakdolgozatban az aktuális futtató a `run_strategy_benchmark.py`.

---

### 4.8. Backend és auth

**Technológiák:** Node.js, Express 4, TypeScript (tsx/dev, tsc/build), better-sqlite3, bcrypt (jelszó hash 10 kör), jsonwebtoken (JWT, 7 nap), cors. A backend a 3000 porton fut; a frontend alapértelmezetten a `http://localhost:3000` címet hívja (vagy `VITE_API_URL`).

**Fájlstruktúra:**

```
backend/
├── package.json, tsconfig.json
├── README.md, .gitignore
├── data/                 # SQLite: snake.db (gitignore)
└── src/
    ├── index.ts          # Express app, CORS, express.json(), route mount, listen
    ├── db/
    │   └── sqlite.ts     # getDb(), initSchema (users, scores), getDatabase()
    ├── middleware/
    │   └── auth.ts       # JWT verify, authMiddleware, signToken, JwtPayload
    ├── routes/
    │   ├── auth.ts       # POST /register, POST /login (bcrypt, token)
    │   ├── profile.ts    # GET /me, PATCH /me (username), PATCH /me/password
    │   └── scores.ts     # GET / (user scores), POST / (score, tick, length, mode, ai_strategy)
    └── ...
```

**Adatbázis:** SQLite fájl a `backend/data/snake.db`; a séma a `sqlite.ts`-ben történő futtatáskor jön létre. Táblák: `users` (id, email UNIQUE, username UNIQUE, password_hash, created_at), `scores` (id, user_id FK, score, tick, length, mode CHECK ('player'|'ai'), ai_strategy TEXT NULL – tetszőleges stratégia azonosító, created_at). Schema_version tábla és migráció (2): régi sémából ai_strategy CHECK eltávolítva, hogy minden új stratégiát tárolni lehessen. Indexek: scores(user_id), scores(created_at DESC).

Példa a sémára és az auth middleware-re ([backend/src/db/sqlite.ts](backend/src/db/sqlite.ts), [backend/src/middleware/auth.ts](backend/src/middleware/auth.ts)):

```typescript
// sqlite.ts – initSchema
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS scores (
  ...
  mode TEXT NOT NULL CHECK (mode IN ('player', 'ai')),
  ai_strategy TEXT NULL  /* tetszőleges stratégia id (astar, hamilton, bfs, greedy, follow_tail, hamilton_zigzag, lookahead); schema_version 2 migráció */
  ...
);
```

```typescript
// auth.ts
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Hiányzó vagy érvénytelen token' })
    return
  }
  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload
    ;(req as Request & { user: JwtPayload }).user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Érvénytelen vagy lejárt token' })
  }
}
```

**Regisztráció:** Email (regex ellenőrzés), felhasználónév (3–32 karakter, csak betű/szám/kötőjel/aláhúzás), jelszó min. 6 karakter, jelszó ismétlés egyezés. Dupla email vagy username esetén 400. Jelszó: `bcrypt.hashSync(password, 10)`; válasz: `{ token, user }`.

**Bejelentkezés:** Body: `usernameOrEmail` + `password`. Keresés email vagy username alapján; `bcrypt.compareSync`; válasz: `{ token, user }`.

**Profil:** GET /api/profile/me (Bearer): user adatok. PATCH /api/profile/me: új username (validáció, egyediség). PATCH /api/profile/me/password: currentPassword, newPassword, newPasswordConfirm (jelenlegi ellenőrzés bcrypt-pel, majd hash és update).

**Eredmények:** GET /api/scores (Bearer): a bejelentkezett user összes scoreja (score, tick, length, mode, ai_strategy, created_at). POST /api/scores (Bearer): body score, tick, length, mode, ai_strategy (tetszőleges stratégia azonosító, pl. astar, hamilton, bfs, greedy, follow_tail, hamilton_zigzag, lookahead); a user_id a JWT-ből kerül be. A tárolt eredmények mindegyikénél látszik, milyen stratégiával lett elérve (ai_strategy mező; a frontend getStrategyName() alapján jeleníti meg).

**Frontend:** AuthContext (token, user, setAuth, logout, loadUser); token és user localStorage-ban (snake_token, snake_user). LoginForm, RegisterForm, Profile (felhasználónév/jelszó változtatás, saját eredmények listája – minden sorban Játékos / MI (A*) / MI (Hamilton)). Eredmények menü: lokális lista, ugyanígy címkézve. Játék vége: lokális mentés + ha token, akkor submitScoreApi(score, tick, length, mode, aiStrategy).

---

### 4.9. Későbbi bővítések (terv)

- Egységtesztek a frontend core és az ai_service modulokra (NFK3, ≥70% lefedettség).
- CI (pl. GitHub Actions): lint, tesztek.
- Opcionális RL (DQN/PPO, pl. Stable-Baselines3) az ai_service-ben; tanulási görbék és mérési kampány dokumentálása.

### 4.10. Új AI stratégiák (docs/ai_docs alapján)

A docs/ai_docs-ban felsorolt, korábban még nem megvalósított stratégiák bekerültek az ai_service-be és a frontend választóba:

- **Minimax (rövid horizont):** 1–2 lépés előre, állapot értékelés (szabadságfok, étel távolság), maximin választás (`minimax.py`, `state.simulate_step`).
- **Hamilton rövid ciklusok:** 2×2 blokkok, minden blokkban 4 cellás kör; étel felé A* levágás, különben blokk ciklus (`hamilton_short_cycles.py`).
- **Maximal safety:** Csak olyan lépés, ami után van út fej–farok között; köztük max flood fill (`max_safety.py`).
- **Look-ahead N lépés (N=3, 5):** N lépés szimulálása greedy aláírányokkal, legjobb kezdő irány (`lookahead_n.py`, `lookahead_3`, `lookahead_5`).
- **DQN, PPO, NEAT:** A projektben külön tanító szkriptek és stratégia osztályok (`dqn.py`, `ppo.py`, `neat_strategy.py` stb.) illeszkednek a `STRATEGIES` regiszterbe; a frontend listában a nevek **DQN**, **PPO**, **NEAT** (nem placeholder). A `rl_stubs.py` továbbra is a repóban lehet korábbi fallbackhez; a benchmark a betanított / mentett modellel fut, ha elérhető.

A backend STRATEGIES map és a frontend AI_STRATEGIES lista bővítve; a tárolt eredményeknél továbbra minden stratégiával elérhető az ai_strategy mező.

*A napló további bejegyzései és az elavult részek frissítései itt, a megvalósítási naplóban történnek; külön „javítások” szekció nincs.*

---

## Jegyzetek és döntések

- **Monorepo:** egy repository (frontend, backend, ai_service, benchmarks), egyszerűbb verziókezelés és terv követés.
- **Játéklogika független a UI-tól:** a `core/` modulok tiszta függvények/objektumok; egységtesztelhetők, és a Python benchmark/ai ugyanazt a state formátumot használja.
- **Stratégia interfész:** `nextMove(state) => Action` – minden MI (A*, Hamilton, esetleg RL) ugyanazt az API-t implementálja (spec 7.18).
- **Konfiguráció és seed:** localStorage (config, eredmények); fix seed opció a reprodukálható futásokhoz (NFK5).
- **Design:** light/dark téma CSS változókkal és React ThemeContext-tel; egységes kártya, gomb, űrlap, HUD a `theme.css`-ben.
- **Auth:** JWT Bearer token; jelszó bcrypt; regisztrációhoz email + username + jelszó + ismétlés; bejelentkezéshez felhasználónév vagy email + jelszó. Eredményeknél mindig tároljuk a módot (player/ai) és az AI típust (astar/hamilton).
