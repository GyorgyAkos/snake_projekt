# Projekt folytatása és AI stratégiák

Ez a dokumentum két témakört foglal össze: (1) a projekt további megvalósítási lépései és érdemes bővítései, (2) további AI stratégiák és algoritmusok, amikkel a rendszer kiegészíthető.

---

## 1. Projekt folytatása – mit érdemes bővíteni?

### 1.1 Minőség és spec követelmények (NFK)

- **Egységtesztek (NFK3, ≥70% lefedettség)**
  - **frontend/core:** pl. `game.ts` (createGame, setDirection, startGame, tick, getSnapshot), `collision.ts`, `snake.ts`, `board.ts`, `food.ts` – Jest vagy Vitest.
  - **ai_service:** pl. `state.parse_state`, A* útvonal, Hamilton `next_on_cycle` – pytest.
  - Cél: a játéklogika és az AI döntések tesztelték legyenek, a szakdolgozatban lefedettségi számokkal.

- **CI (opcionális, de erős plusz)**
  - GitHub Actions: lint (frontend/backend), tesztek, esetleg frontend build.
  - Egy egyszerű workflow már jól mutat a dokumentációban és a spec teljesítésénél.

### 1.2 Mérés és szakdolgozat

- **Benchmark kiértékelés**
  - A `benchmarks/results/` már van; érdemes:
    - rövid összefoglaló a `docs/`-ban (táblázat / grafikon vázlat: A* vs Hamilton, score/steps/death rate),
    - fix seed(ek) és rácsméret dokumentálása,
    - következtetés: melyik stratégia mikor jobb (pl. kis/nagy pálya).

- **Reprodukálhatóság (NFK5)**
  - Seed és konfig (rács, tick) már van; érdemes egy rövid szakasz a dokumentációban: „Mérési környezet” (Python/Node verziók, hogyan futtatod a benchmarkot, egy példa parancs).

### 1.3 Felhasználói élmény és robusztusság

- **Hibakezelés**
  - Backend/API hiba esetén: pl. „Nem sikerült betölteni az eredményeket” + újrapróbálás, vagy legalább nem csendes fail.
  - WebSocket (AI) leesés: már van „MI: helyi” fallback; opcionálisan rövid üzenet: „AI kapcsolat megszakadt, helyi stratégia”.

- **Bejelentkezés élmény**
  - Token lejárat: 401-nél automatikus kijelentkeztetés és pl. „A munkamenet lejárt, jelentkezz be újra.”
  - Opcionális: „Emlékezz rám” (hosszabb élettartamú token) – csak ha a spec/biztonsági követelmények engedik.

### 1.4 Későbbi / opcionális bővítések

- **Reinforcement Learning (RL)**
  - Ha a spec/tervben szerepel: pl. DQN vagy PPO (pl. Stable-Baselines3), külön stratégia az ai_service-ben, ugyanaz a WebSocket/`next` API.
  - Tanulási görbék, rövid mérés (score vs episode), összehasonlítás A* / Hamilton / RL – erős szakdolgozat fejezet.

- **További játék / AI opciók**
  - Nehézségi szint (pl. gyorsabb tick, nagyobb rács).
  - Akadályok a pályán (spec szerint, ha van).
  - Új heurisztikus stratégia (pl. „közeleg a farok” szabály) – könnyű összehasonlítási pont.

### 1.5 Dokumentáció és leadás

- **README(k)**
  - Gyökér README már jó; érdemes frissíteni, ha új indítási mód (pl. Docker) vagy tesztek futtatása bekerül.
  - `docs/szakdolgozat_dokumentacio.md`: minden nagyobb lépést (tesztek, CI, benchmark összefoglaló, RL ha van) röviden bejegyezni a naplóba.

- **Szakdolgozat szöveg**
  - Bevezetés, elmélet, követelmények, megvalósítás, mérés (benchmark + tesztek), konklúzió – a dokumentáció és a kód kommentjei alapján könnyebb a fejezetek megírása.

### 1.6 Prioritás (rövid terv)

| Sorrend | Tevékenység | Miért |
|--------|-------------|-------|
| 1 | Egységtesztek (core + ai_service) | NFK, megbízhatóság, szakdolgozat mérési fejezet |
| 2 | Benchmark eredmények összefoglalása a docs-ban | Szakdolgozat „Mérés” fejezet |
| 3 | API/WebSocket hibakezelés + token lejárat kezelése | Robusztusság, professzionálisabb élmény |
| 4 | CI (lint + tesztek) | Automatikus minőség, jól mutat a leadáskor |
| 5 | RL vagy további stratégiák | Ha a spec/terv és az időd engedi |

---

## 2. További AI stratégiák és algoritmusok

A Snake játékhoz illeszkedő, a projektet jól kiegészítő AI megközelítések, stratégiák és algoritmusok.

### 2.1 Heurisztikus / klasszikus stratégiák

- **BFS (szélességi keresés) az ételig**
  - A* helyett egyszerűbb: mindig a legrövidebb lépésszámú út az ételig. Nincs heurisztika, könnyű implementálni és összehasonlítani az A*-val (időigény, minőség).

- **Greedy „közeleg a farok”**
  - Ha nincs biztonságos út az ételig, ne az étel felé menj, hanem oda, ahol a legtöbb szabad cella van (pl. flood fill), vagy ahol a farok közeleg – egyszerű szabályok, jól mérhető.

- **„Follow the tail” / farok-követés**
  - Már használod fallback-ként az A*-ban; önálló stratégiaként is lehet: ha az étel túl kockázatos, menj a farok felé biztonságos útvonalon (pl. BFS a farkig).

- **Minimax / alpha–beta (rövid horizont)**
  - 1–2 lépésre előre: értékeld a lépéseket (étel közel, fal távol, önütközés elkerülés), válaszd a legjobbat. Lassabb, de érdekes összehasonlítás a greedy megközelítésekkel.

### 2.2 Gráf / kör alapú (Hamilton-hoz hasonló)

- **Más Hamilton-körök**
  - A spirál helyett más kitöltési sorrend (pl. „sávok”, zigzag). Ugyanaz a „kör + levágás az ételig” ötlet, más ciklus – jó a Hamilton-változatok összehasonlítására.

- **Rövid ciklusok (több kis kör)**
  - A pályát több kisebb körre bontod; a kígyó egy körből a másikba vált. Bonyolultabb, de érdekes alternatíva az egyetlen nagy Hamilton-körhöz képest.

### 2.3 Keresés és tervezés

- **Rövid távú „safety check”**
  - Minden lépésnél: van-e még út a fej és a farok között (pl. flood fill vagy BFS)? Ha nincs, keress másik lépést. Ezt már használod az A* fallback-jében; külön stratégiaként „maximal safety” néven is lehet.

- **Look-ahead (N lépés)**
  - Szimuláld az N lépést mind a 3–4 irányból; válaszd azt, ahol nem hal meg a kígyó és az étel közelebb van. N=3–5 már jól mérhető (idő vs. minőség).

### 2.4 Machine learning / RL

- **Q-learning vagy DQN**
  - Állapot: pl. relatív irány az ételre, fal/kígyó közel, stb. Akció: Up/Down/Left/Right. Jutalom: étel +1, halál -10. Klasszikus RL, sok irodalom, jól dokumentálható.

- **Policy gradient (PPO, A2C)**
  - Pl. Stable-Baselines3: ugyanaz a state/action/jutalom, más algoritmus. Összehasonlítás DQN-nel: konvergencia, végpontos score.

- **Neuroevolution (pl. NEAT)**
  - Egyszerű neurális háló, evolúció a súlyokra. Kevesebb RL háttér kell, érdekes „evolúciós” fejezet a szakdolgozathoz.

### 2.5 Összehasonlítás és szakdolgozat

| Stratégia | Nehézség | Ötlet | Szakdolgozatban |
|-----------|----------|-------|-----------------|
| BFS az ételig | Könnyű | A* vs BFS (idő, minőség) | Rövid fejezet, táblázat |
| Greedy / flood fill | Könnyű | „Biztonság első” stratégia | Heurisztikák összehasonlítása |
| Más Hamilton-kör | Közepes | Spirál vs zigzag/sáv | Gráf-alapú stratégiák fejezet |
| Look-ahead N lépés | Közepes | Keresési mélység hatása | Idő/minőség trade-off |
| DQN / Q-learning | Magas | RL vs heurisztika | RL fejezet, tanulási görbék |
| PPO (SB3) | Magas | RL algoritmusok összehasonlítása | Mélyebb RL rész |

### 2.6 Ajánlás a projekthez

- **Gyors bővítés, erős összehasonlítás:**  
  **BFS az ételig** (A*-nál egyszerűbb) + **egy másik Hamilton-kör** (pl. zigzag). Így 4 stratégia van (A*, Hamilton spirál, BFS, Hamilton zigzag), és tudsz táblázatot/grafikonokat csinálni (score, lépésszám, futási idő).

- **Ha van idő és RL cél:**  
  **DQN vagy PPO** (pl. Stable-Baselines3), ugyanaz a WebSocket/`next` API. Tanulási görbék + összehasonlítás az A* és Hamiltonnal – ez már erős „MI” szakdolgozat.

- **Középút:**  
  **Look-ahead 3–5 lépés** (greedy értékeléssel) + **„safety first”** (flood fill alapú döntés). Mindkettő könnyen mérhető és jól illeszkedik a meglévő A* / Hamilton kódhoz.
