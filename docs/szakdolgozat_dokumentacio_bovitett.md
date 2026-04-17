# Snake játék és mesterséges intelligencia – integrált szakdolgozati dokumentáció

A hivatalos specifikáció teljes szövege továbbra is: `docs/György_Ákos_Szakdolgozat_Specifikáció.md` – itt csak a **végrehajtott** architektúra és funkciók szerepelnek.

---

## Tartalomjegyzék

1. [Absztrakt](#1-absztrakt)  
2. [Bevezetés](#2-bevezetés)  
3. [Rendszer áttekintése és célok](#3-rendszer-áttekintése-és-célok)  
4. [Technológiai stack és architektúra](#4-technológiai-stack-és-architektúra)  
5. [Játéklogika és állapot](#5-játéklogika-és-állapot)  
6. [Backend: hitelesítés és eredmények](#6-backend-hitelesítés-és-eredmények)  
7. [AI szolgáltatás és stratégiák](#7-ai-szolgáltatás-és-stratégiák)  
8. [Tanuló környezet és algoritmusok](#8-tanuló-környezet-és-algoritmusok)  
9. [Benchmark: protokoll és eszközök](#9-benchmark-protokoll-és-eszközök)  
10. [Mérési eredmények és értelmezés](#10-mérési-eredmények-és-értelmezés)  
11. [Webes alkalmazás: funkcionalitások](#11-webes-alkalmazás-funkcionalitások)  
12. [Statisztika és adatvizualizáció](#12-statisztika-és-adatvizualizáció)  
13. [Korlátok és következtetések](#13-korlátok-és-következtetések)  
14. [Irodalomjegyzék](#14-irodalomjegyzék)  

---

## 1. Absztrakt

A szakdolgozat egy **Snake** játékot és több **mesterséges intelligencia alapú irányítási** megközelítést integráló **monorepo** alkalmazást mutat be. A rendszer három fő komponensből áll: **React + TypeScript** frontend (Canvas alapú játéktér), **Node.js + Express + SQLite** backend (felhasználók, JWT alapú bejelentkezés, pontszámok), valamint **Python FastAPI** AI szolgáltatás **WebSocketen** keresztüli valós idejű döntéshozatallal. A MI réteg **heurisztikus stratégiákat** (A*, BFS, Hamilton-jellegű bejárások, előretekintés, minimax, biztonságvezérelt módszerek) és **tanuló** megoldásokat (**DQN**, **PPO**, **NEAT**) egyesít egy közös interfészen. Az összehasonlíthatóság érdekében **egységes benchmark** futtató méri az átlagos és medián pontszámot, a lépésszámot, a halálok megoszlását és az első étel elérésének arányát; az eredmények **JSON** formában tárolódnak, és a frontend **Statisztika** oldalon, valamint **generált grafikonokon** is megjeleníthetők. A mérések egy konkrét futássorozat alapján azt mutatják, hogy a vizsgált **heurisztikák** (különösen az 1 lépéses előretekintés) ebben a környezetben **jelentősen felülmúlják** a dokumentált **tanuló** modelleket; utóbbiak teljesítménye erősen függ a jutalomfüggvénytől, a tanítási időtől és a megfigyelés reprezentációjától.

**Kulcsszavak:** Snake játék, útkeresés, erősítéses tanulás, DQN, PPO, neuroevolució, NEAT, FastAPI, React, benchmark.

---

## 2. Bevezetés

A Snake klasszikus, rácsalapú játék: a kígyó ételt gyűjt, nő, és elkerüli a falat és önmaga ütközését. Egyszerű szabályai mellett jól vizsgálhatók **determinisztikus** (szabály- és keresésalapú) és **tanuló** stratégiák. A projekt célja egy **reprodukálható** keretrendszer, amelyben ugyanazon pályán és protokoll mellett mérhető a teljesítmény, és amely **weben** is játszható, felhasználói fiókkal és eredménytárolással.

A bevezető motiváció összhangban áll a `docs/György_Ákos_Szakdolgozat_Specifikáció.md` általános célkitűzésével (játék + MI + összehasonlítás), a **tényleges megvalósítás** azonban a specifikáció korai „tervezett” technológiai listájától eltér: a játéktér **natív Canvas** és **TypeScript játéklogika**, nem Phaser/p5.js.

---

## 3. Rendszer áttekintése és célok

### 3.1 Fő eredmények (megvalósítva)

- Játszható Snake **böngészőben**, **játékos** és **MI** módban.
- **Többféle** MI stratégia egy **közös API** mögött (`next_move` jellegű döntés a játékállapotból).
- **Regisztráció / bejelentkezés**, **profil**, **pontszámok** tárolása SQLite-ban.
- **Egységes benchmark** több stratégiára; **statisztika** oldal a böngészőben; **PNG grafikonok** generálhatók.
- **Világos / sötét téma**, konfigurálható rácsméret és játéksebesség.

### 3.2 Monorepo felépítés

| Mappa | Szerep |
|--------|--------|
| `frontend/` | React, Vite, TypeScript; UI, játéklogika, auth kliens |
| `backend/` | Express, JWT, bcrypt, SQLite |
| `ai_service/` | FastAPI, WebSocket, stratégiák, `SnakeEnv`, tanító szkriptek |
| `benchmarks/` | `run_strategy_benchmark.py`, `generate_benchmark_plots.py`, `results/` |
| `docs/` | Specifikáció, szakdolgozati anyagok |

**Indítás (fejlesztés):** a gyökérből `npm run dev:all` párhuzamosan indítja a frontendet (tipikusan **5173**), a backendet (**3000**) és az AI szolgáltatást (**8000**). Részletek: gyökér `README.md`.

---

## 4. Technológiai stack és architektúra

### 4.1 Adatfolyam (MI mód)

1. A frontend tick-enként előállítja a játék pillanatképét.  
2. **WebSocket** üzenetben elküldi az `ai_service` `/ws` végpontra (opcionális `strategy` mező).  
3. A szerver a kiválasztott stratégiával kiszámolja a következő **irányt** (`Up` / `Right` / `Down` / `Left`).  
4. A kliens alkalmazza az irányt, és frissíti a Canvas megjelenítést.

Ha a WebSocket nem elérhető, a kliens **helyi fallback** stratégiát használ (egyszerűsített viselkedés).

### 4.2 REST API-k (összefoglalva)

- **Backend (Node):** `/api/auth/register`, `/api/auth/login`, `/api/profile/me`, `/api/scores` – lásd `backend/README.md`.  
- **AI szolgáltatás:** `/health`, `/strategies`, `POST /next`, WebSocket `/ws`, továbbá benchmark: **`GET /benchmark/summaries`**, **`GET /benchmark/plots/{filename}`** – a statisztika oldal ezeket használja.

---

## 5. Játéklogika és állapot

A játék **tiszta TypeScript** modulokban van (`frontend/src/core/`): rács, kígyó, étel, ütközés, állapotgép (`INIT`, `RUNNING`, `PAUSED`, `GAME_OVER`). A **seed** opcionális, **Mulberry32** PRNG támogatja a reprodukálhatóságot. A Python oldal a frontendhez illeszkedő állapotot `parse_state`-tel dolgozza fel (`ai_service/src/state.py`).

---

## 6. Backend: hitelesítés és eredmények

A backend **SQLite** adatbázist használ (`users`, `scores`). Jelszó: **bcrypt**; munkamenet: **JWT** (Bearer token). A pontszám rögzítésekor tárolódik a mód (`player` / `ai`) és az **`ai_strategy`** azonosító (tetszőleges stratégia név, hogy a bővítés ne sérülje a sémát). Részletes végpontlista: `backend/README.md`.

---

## 7. AI szolgáltatás és stratégiák

### 7.1 Heurisztikus és szabályalapú stratégiák (implementált)

A `ai_service/src/strategies/` modulokban megvalósult stratégiák közé tartoznak többek között: **A\***, **BFS**, **Hamilton** (spirál), **Hamilton zigzag**, **Hamilton rövid ciklusok**, **Greedy**, **farok-követés**, **1 / 3 / 5 lépéses előretekintés**, **minimax** rövid horizonton, **maximal safety**. Ezek ugyanarra a **GameState** reprezentációra építenek; részletes algoritmusleírás a forráskódban és a korábbi részletes stratégia-szövegekben (a frontend **Statisztika** oldal stratégia panelje összefoglalót ad).

### 7.2 Tanuló stratégiák (implementált)

- **DQN:** PyTorch alapú Q-háló, tanítás: `ai_service/training/train_dqn.py`, inferencia: `dqn.py`.  
- **PPO:** Stable-Baselines3 jellegű tanítás és mentett modell, inferencia: `ppo.py`.  
- **NEAT:** `training/train_neat.py`, inferencia: `neat_strategy.py`.

Ha a várt modellfájl hiányzik, a rendszer **fallback** viselkedésre válthat (biztonságos heurisztika); a benchmark értelmezésekor fontos rögzíteni, **melyik** modell volt betöltve.

---

## 8. Tanuló környezet és algoritmusok

### 8.1 SnakeEnv

A `ai_service/src/env/snake_env.py` **Gym-szerű** interfészt biztosít: `reset`, `step`, **12 dimenziós** `state_to_observation` jellemzővektor (veszély jelzők, fal távolságok, étel relatív pozíció és Manhattan, normalizált hossz). Jutalom: étel, halál, opcionálisan lépésenkénti „közelebb / távolabb az ételtől” jutalom; a környezet támogatja a **max lépés / éhezés** jellegű leállítást a tanítás és a benchmark összhangjához. Részletes táblázat: `docs/ai_docs/kornyezet_es_dqn_megvalositas.md`.

### 8.2 DQN, PPO, NEAT (fogalmi összefoglaló)

- **DQN:** Q-értékek becslése neurális hálóval, célváltozó és **replay buffer**, **target háló** a stabilitásért; ε-greedy felfedezés tanítás közben.  
- **PPO:** **Politika** (akcióeloszlás) közvetlen tanítása; **klipelt** frissítés; gyakran **value** háló a várható jutalom becslésére.  
- **NEAT:** Populációban **evolvált** neurális háló (súlyok, feedforward topológia a projektben); fitness a környezetben mért jutalom és / vagy pontszám alapján.

A laikus magyarázat és a módszerek összehasonlítása: `docs/ai_docs/snake_mi_osszefoglalo_es_tanulasok.md` (a „csak placeholder” állításokat a **jelen dokumentum** a fenti implementációval helyesbíti: a stratégiák **kódja és tanító pipeline-ja** megvan; a benchmarkbeli teljesítmény a **konkrét** betanított súlyoktól függ).

---

## 9. Benchmark: protokoll és eszközök

### 9.1 Egységes futtató

A **`benchmarks/run_strategy_benchmark.py`** ugyanarra a játékállapot-reprezentációra építve futtatja a `STRATEGIES` regiszterben lévő stratégiákat. Kimenet: **`benchmarks/results/strategy_benchmark_<azonosító>.json`** (futásonkénti adatok + összefoglaló), valamint opcionális **`strategy_benchmark_summary.json`**.

### 9.2 Tipikus beállítások (a dokumentált mérésekhez)

- Pálya: **20×20**  
- **max_steps:** 5000 (játék lépéslimit)  
- **Éhezés / stagnálás:** hosszú ideig növekvő pontszám nélküli leállás (a részletes kiértékelés **400 lépés** étel nélküli feltételt említ)  
- **seed_base:** 42 (fix kezdőmag-sorozat eleje)  
- **Futások:** a heurisztikákra gyakran **500**, a tanuló stratégiákra **200** futás (összehasonlításkor ezt a különbséget érdemes explicit módon említeni)

### 9.3 Metrikák

- **score_mean / score_median** – teljesítmény  
- **steps_mean / steps_median** – játék hossza  
- **reached_first_food (%)** – hány futásban történt legalább egy evés  
- **death_counts** – `wall`, `self`, `starvation`, `max_steps` stb.

### 9.4 Vizualizáció

A **`benchmarks/generate_benchmark_plots.py`** oszlopdiagramot, boxplotot, halálmegoszlást és szórásdiagramot készít a `benchmarks/results/plots/` mappába.

### 9.5 Régi, szűkebb benchmark

A **`benchmarks/run_benchmark.py`** elsősorban **A\*** és **Hamilton** összevetésére készült; a szakdolgozat **fő** összehasonlításához a **`run_strategy_benchmark.py`** az irányadó. Részletek: `benchmarks/README.md`.

---

## 10. Mérési eredmények és értelmezés

Az alábbi táblázatok a **`docs/ai_docs/benchmark_eredmenyek_reszletes_kiertekeles.md`** által közölt **egy konkrét mérési kampány** összefoglalóiból származnak (a gépen tárolt JSON az autoritatív forrás; újrafuttatáskor a számok változhatnak).

### 10.1 Heurisztikák (500 futás / stratégia, kivélasztott csoport)

| Stratégia | Átlag pont | Medián | Átlag lépés | Első étel (%) |
|-----------|------------:|-------:|------------:|---------------:|
| lookahead | 92.75 | 92 | 2460.71 | 100.0 |
| astar | 77.20 | 77 | 1297.47 | 100.0 |
| follow_tail | 77.20 | 77 | 1297.47 | 100.0 |
| bfs | 74.40 | 76 | 1245.71 | 100.0 |
| hamilton | 57.01 | 57 | 851.08 | 100.0 |
| lookahead_3 | 10.93 | 10 | 180.68 | 100.0 |
| minimax | 4.41 | 3 | 446.56 | 80.6 |
| lookahead_5 | 0.30 | 0 | 403.73 | 15.2 |
| greedy | 0.20 | 0 | 404.62 | 15.0 |
| max_safety | 0.20 | 0 | 404.62 | 15.0 |

**Értelmezés (röviden):** Az **1 lépéses előretekintés** kiemelkedő átlagpontot ad. Az **A\***, **farok-követés** és **BFS** erős középmezőny. A **Hamilton** jó túlélést mutat, de az adott protokollban alacsonyabb átlagpontot. A **greedy**, **max_safety**, a **5 lépéses lookahead** és részben a **minimax** ebben a mérésben **éhezés-domináns**, alacsony ponttal – tipikusan túl óvatos vagy rosszul skálázódó lokális döntés.

### 10.2 Tanuló stratégiák (200 futás / stratégia)

| Stratégia | Átlag pont | Medián | Átlag lépés | Első étel (%) |
|-----------|------------:|-------:|------------:|---------------:|
| neuroevolution (NEAT) | 7.38 | 5 | 1027.16 | 90.5 |
| ppo | 2.08 | 2 | 384.67 | 66.0 |
| dqn | 0.17 | 0 | 403.36 | 12.5 |

**Értelmezés (röviden):** A **NEAT** vezet a tanulók között, de messze elmarad a legerősebb heurisztikáktól. A **PPO** mérsékelt evést mutat. A **DQN** ebben a beállításban **gyakorlatilag nem tanult működő ételgyűjtést** (magas éhezés-arány). Összességében: **heurisztika vs. tanuló** összevetésben a mért tanuló modellek **nem versenyeznek** a legjobb szabályalapú megoldásokkal – ez **nem** a módszerek elméleti határát jelenti, hanem a **konkrét** jutalom, állapot és tanítási költség eredményét.

### 10.3 Halálprofilok (szöveges összefoglaló)

- **Greedy / max_safety / DQN (e mérésben):** domináns **`starvation`**.  
- **PPO / NEAT:** **`starvation`** mellett már jelentős **`self` / `wall`** is – aktívabb, kockázatosabb mozgás.  
- **A\*, BFS, follow_tail, Hamilton, lookahead:** főleg **`wall`** és **`self`**, kevés **éhezés** – a kígyó aktívan mozog és eszik.

---

## 11. Webes alkalmazás: funkcionalitások

### 11.1 Navigáció és képernyők

Az alkalmazás egy **SPA**: főmenü, beállítások, játék, eredmények, **statisztika**, bejelentkezés / regisztráció, profil. A **Header** mindenhol: auth műveletek és **világos / sötét** téma.

### 11.2 Játékos mód

Billentyűzet: **nyilak / WASD**, **P** szünet, **R** új játék, **Enter** indítás INIT állapotból. Beállítható: **rács 10–40**, **tick ms 50–500**, **seed**.

### 11.3 MI mód

Ugyanaz a játék UI; a döntés **WebSocketen** jön az AI szolgáltatástól. A HUD jelzi: **backend** kapcsolat és stratégia neve, vagy **helyi** fallback.

### 11.4 Eredmények és profil

**GAME_OVER** után lokális mentés; bejelentkezve **POST /api/scores**. **Eredmények** lista: backendről vagy localStorage-ból. **Profil:** felhasználónév / jelszó módosítás, saját eredmények.

*Megjegyzés:* Az aktuális `App.tsx` induláskor törölheti a **lokális** eredménylistát (`clearScores`) – ha éles használatra készül a kliens, ezt érdemes felülvizsgálni.

---

## 12. Statisztika és adatvizualizáció

A **Statisztika** oldal (`frontend/src/ui/Statistics.tsx`) a **`/benchmark/summaries`** JSON-ból tölti a táblázatot, és megjeleníti a **`/benchmark/plots/`** PNG fájlokat. Funkciók: **szűrés** (mind / egyik sem / csak heurisztikák / csak neurális), **rendezés** oszlop szerint, **részletes stratégia panel** (működés + tipikus benchmark-magyarázat + aktuális sor metrikái), **lightbox** a grafikonok nagyításához.

A mérési fejezet **szakmai szerkezetére** és további elemzési ötletekre (IQR, fair comparison, modellverzió rögzítése): `docs/ai_docs/szakdolgozat_statisztika_es_elemzes_struktura.md` – itt csak a **már implementált** funkciók és a **közzétett** számok szerepelnek, a jövőbeli statisztikai bővítések nem részei ennek a dokumentumnak.

---

## 13. Korlátok és következtetések

1. **Heurisztikák** adott pályán és protokollban **erős baseline-t** adnak; a **tanuló** modellek ugyanebben a keretben **gyengébben** szerepeltek – a különbség nagy része **tanítási** és **jutalom** kérdés.  
2. A benchmark **runs** számának eltérése (500 vs 200) **bizonytalanságot** ad az összehasonlításban; szakdolgozatban érdemes **azonos N**-mel is futtatni egy kontrollt.  
3. A **tanuló** rész **számítási költsége** és **hangolási igénye** magasabb, mint a determinisztikus heurisztikáké.  
4. A rendszer **moduláris**: új stratégia regisztrálása és benchmarkolása jól skálázódik.

---

## 14. Irodalomjegyzék

1. **Sutton, R. S. – Barto, A. G.:** *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press, 2018.  
2. **Mnih, V. et al.:** *Human-level control through deep reinforcement learning.* Nature 518, 529–533 (2015). (DQN.)  
3. **Schulman, J. et al.:** *Proximal Policy Optimization Algorithms.* arXiv:1707.06347 (2017).  
4. **Stanley, K. O. – Miikkulainen, R.:** *Evolving Neural Networks through Augmenting Topologies.* Evolutionary Computation 10(2), 99–127 (2002). (NEAT.)  
5. **Hart, P. E. – Nilsson, N. J. – Raphael, B.:** *A Formal Basis for the Heuristic Determination of Minimum Cost Paths.* IEEE Trans. Systems Science and Cybernetics, 4(2), 100–107 (1968).  
6. **Russell, S. – Norvig, P.:** *Artificial Intelligence: A Modern Approach* (4th ed.). Pearson, 2020. (Általános MI, keresés, játékok.)

---

*Dokumentum vége. Forrásjelölés: a tartalom a projekt aktuális kódjából és a felsorolt (nem kizárólag terv jellegű) `docs/` és `docs/ai_docs/` Markdown fájlok szintéziséből készült.*
