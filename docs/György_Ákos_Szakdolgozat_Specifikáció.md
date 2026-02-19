# Mesterséges intelligencia alkalmazása számítógépes játékok optimalizálásához

## Tartalomjegyzék

- Bevezetés és ötlet bemutatása
- Tervezett technológiák és architektúra
- AI környezet és tanulási logika
- Felhasználói interakció és biztonság
- Projekt felépítése és várható eredmények
- Következő lépések
- Részletezés

---

## 1. Bevezetés és ötlet bemutatása

### 1.1. A dolgozat célja

A dolgozat célja egy olyan webes alkalmazás fejlesztése, amelyben a klasszikus Snake játék többféle irányítási módban próbálható ki:

- emberi játékos által,
- betanított mesterséges intelligenciával (reinforcement learning, RL).

A rendszer lehetőséget ad a különböző irányítási módok teljesítményének összehasonlítására a játékosok pontszáma alapján. A weboldal a felhasználói élmény mellett kutatási célokat is szolgál: megvizsgálható, hogy melyik algoritmus milyen hatékonysággal képes irányítani a kígyót.

### 1.2. A projekt fő eredményei

- játszható, platformfüggetlen (asztali vagy böngészős) Snake játék,
- legalább egy determinisztikus, útvonaltervezésen alapuló MI (A*/BFS/Hamilton-alap),
- opcionális kiterjesztés: megerősítéses tanulás (RL, Q-learning vagy Deep Q-Network) összehasonlító értékeléssel,
- mérési és kiértékelési jelentés (teljesítmény, pontszám, túlélési idő, stabilitás).

### 1.3. Háttér és motiváció

A Snake egyszerű szabályai ellenére jó terep algoritmikus problémákra (rácsos útkeresés, ütközés-kerülés, dinamikus akadályok kezelése), valamint MI stratégiák összevetésére. A szakdolgozat célja egy reprodukálható kísérleti keretrendszer és összehasonlítható eredmények biztosítása.

---

## 2. Projektterjedelem (Scope)

**Benne:**

- Klasszikus Snake mechanikák rács-alapú játéktérrel.
- Egyjátékos kézi irányítás és MI által irányított mód.
- Legalább 1 pálya-/térméret-változat és több nehézségi szint.
- Eredmény- és statisztika-mentés lokálisan.
- Konfigurálható sebesség és MI paraméterek.

**Kívül:**

- Online többjátékos mód.
- Mobil natív portok (ha webes/asztali készül).
- Haladó grafika/3D; a fókusz a játékmeneten és MI-n van.

---

## 3. Tervezett technológiák és architektúra

### Frontend (kliensoldal)

- **Technológiák:** TypeScript, React, HTML, CSS, JavaScript (Phaser.js vagy p5.js játéklogikához)
- **Fő funkciók:**
  - A Snake játék futtatása böngészőben.
  - Emberi és AI vezérlés váltása.
  - Paraméterező felület az AI beállításaihoz (tanulási ráta, gamma, neuronháló mérete, aktivációs függvény).

### Backend (szerveroldal)

- **Technológiák:** Node.js + Express a felhasználói adatok és pontszámok tárolására (SQLite adatbázissal).
- **AI modul:** Python + FastAPI vagy Flask.
  - Az AI a szerveren fut, és WebSocketen keresztül kapja a játékállapotot valós időben.
  - Reinforcement Learning algoritmusok megvalósítása:
    - **Deep Q-Learning (DQN)** – neurális hálóval becsült Q-értékek.
    - **Policy Gradient (pl. PPO)** – közvetlen politikatanulás, stabilabb nagy állapottérben.
    - **Genetikus algoritmus** – egyszerű, szemléletes megközelítés alternatív összehasonlításként.

### 3.1. AI környezet és tanulási logika

**Állapottér és jutalmazás:**

- **Állapot:** A játék teljes rácsa (0 = üres, 1 = fal, 2 = kígyó, 3 = étel).
- **Jutalom:** Étel elfogyasztása pozitív pont, halál negatív pont, minden lépés kis negatív értékkel büntetve a hatékonyság növelésére.

**Keretkönyvtárak:**

- PyTorch vagy TensorFlow a neurális háló tanításához.
- Stable-Baselines3 a PPO és DQN algoritmusok egyszerű implementálásához.

---

## 4. Felhasználói interakció és biztonság

A webalkalmazásban lesz:

- Regisztráció és bejelentkezés, biztonságos jelszókezeléssel.
- Pontszámok eltárolása adatbázisban.
- AI paraméterek testreszabása interaktív csúszkákkal és legördülő menükkel.
- Valamint maga a játék.

---

## 5. Projekt felépítése és várható eredmények

**Rendszer felépítése:**

- **Frontend:** játék és felhasználói kezelőfelület.
- **Backend:** két réteg – Node.js (felhasználók és pontszámok) + Python (AI).
- **Adatkapcsolat:** REST API a beállításokhoz, WebSocket a játékállapot valós idejű továbbításához.

**Várható eredmények:**

- A különböző irányítási módok teljesítményének objektív összehasonlítása.
- Bemutatható, hogyan tanul a mesterséges intelligencia próbálkozásokon keresztül (trial and error).
- A projekt demonstrálja, hogyan integrálható a reinforcement learning egy modern webes játékba.

---

## 6. Következő lépések

1. Weboldal elkészítése React + TypeScript-ben.
2. Játéklogika elkészítése JavaScript-ben emberi vezérléssel.
3. Adattovábbítás és alap backend kiépítése (Express + SQLite).
4. RL algoritmus implementálása Pythonban.
5. Frontend–backend összekötése WebSocketen keresztül.
6. Felhasználói kezelőfelület és AI paraméterezés integrálása.
7. Tesztelés, teljesítménymérés és dokumentálás.

---

## 7. Részletezés

### 7.1. Követelmények

#### 7.1.1. Funkcionális követelmények (FK)

- **FK1** – Játéktér: N×M rács, alapértelmezés: 20×20.
- **FK2** – Kígyó mozgás: A kígyó lépésenként egy cellát mozog az aktuális irányba; nem fordulhat 180°-ot azonnal.
- **FK3** – Étel generálás: Mindig legfeljebb 1 aktív étel; új étel üres cellába kerül.
- **FK4** – Ütközések: Fal- vagy önütközés azonnali vereség.
- **FK5** – Növekedés: Ételfelvétel után a kígyó hossza +1.
- **FK6** – Pontozás: Alap: 1 pont/étel; magasabb nehézségen szorzó.
- **FK7** – Üzemmódok: "Játékos" (billentyű/érintés) és "MI" mód választható a főmenüben.
- **FK8** – MI interfész: Start/stop, sebesség, lépésszám-limit, stratégia-választó.
- **FK9** – Statisztikák: játszmánként: pont, túlélési idő/lépésszám, átlagos lépés/étel, halál oka.
- **FK10** – Mentés/betöltés: beállítások és legjobb eredmények helyi tárolása.

#### 7.1.2. Nem-funkcionális követelmények (NFK)

- **NFK1** – Teljesítmény: 60 FPS cél; MI döntés < 10 ms/lépés 20×20-as rácson.
- **NFK2** – Hordozhatóság: Windows/macOS/Linux vagy modern böngészők (Chrome/Firefox/Edge).
- **NFK3** – Kódminőség: Egységtesztek a magmodulokra (≥70% lefedettség). Lint/CI bevezetése.
- **NFK4** – Használhatóság: Vezérlés késleltetése < 100 ms; vizuális visszajelzések.
- **NFK5** – Reprodukálhatóság: Fix seed opció a véletlenszerűséghez.

### 7.2. Játékmenet és szabályok

- **Kezdőhossz:** 3 szegmens; kezdőpozíció: pálya közép; kezdőirány: jobbra.
- **Lépésidő (tick):** alap 120 ms; nehézséggel csökken.
- **Tiltott mozdulat:** azonnali ellentétes irány.
- **Pausa:** megállítja a játékórát és az MI-t.

### 7.3. Felhasználói felület

- **Főmenü:** Játék indítása (Játékos/MI), Beállítások, Eredmények, Kilépés.
- **HUD:** Pontszám, hossz, sebesség, MI státusz, lépésszám.
- **Beállítások:** rácsméret, sebesség, MI stratégia és paraméterek, seed.
- **Vizualizáció:** rácsrajzolás, kígyó feje kiemelve, étel kontrasztos színnel.

### 7.4. Vezérlés

- **Billentyűzet:** nyilak / WASD; P = szünet; R = újraindítás.
- **Érintés (ha web):** swipe gesztusok; képernyő gombok opció.
- **MI mód:** manuális input tiltva, csak megjelenítés.

### 7.5. Rendszer- és szoftverarchitektúra

#### 7.5.1. Rétegek

- **Core (játéklogika):** rács, kígyó, étel, ütközés, pontozás.
- **MI réteg:** stratégia interfész + konkrét algoritmusok.
- **Megjelenítés:** Canvas/Surface rajzolás, HUD.
- **I/O réteg:** eseménykezelés, konfiguráció, mentés.

#### 7.5.2. Modulok és interfészek

- **Game (állapotgép):** INIT → RUNNING → PAUSED → GAME_OVER.
- **Board** (N×M), **Snake** (deque test-szegmensek), **Food** (pozíció), **RNG**.
- **CollisionService**, **ScoreService**, **Serializer**.
- **AIController** (stratégia-választó): `next_move(state) -> Action`.
- **HeuristicPathfinder** (BFS/A*), **HamiltonianDriver**, **RLAgent** (opcionális).

#### 7.5.3. Adatszerkezetek

- **Kígyó:** `deque<(x,y)>` – fej az elején.
- **Rács:** 2D tömb vagy bitset az üres/foglalt állapothoz.
- **Irány:** enum {Up, Right, Down, Left}.
- **Állapot-snapshot:** (kígyó pozíciólista, irány, étel pozíció, seed, tick).

### 7.6. Algoritmusok (MI)

#### 7.6.1. Heurisztikus/útkereső megközelítések (kötelező)

- **BFS / A*:** útvonal a fej és az étel között; akadályok: falak + saját test.
  - Heurisztika: Manhattan-távolság.
  - Biztonsági lépés: ha útvonal nincs, fallback: farok-követés vagy legbiztonságosabb lokális lépés (maximális szabadságfok / flood fill).
- **Farok-követés:** étel után a kígyó farka felé tartás a csapdák elkerülésére.

#### 7.6.2. Hamilton-kör alapú stratégia (ajánlott)

- Előre generált Hamilton-kör a rácson; a kígyó a kör mentén halad, az ételt „levágásokkal” gyorsítja. Nagy stabilitás, de hosszabb útvonalak.

#### 7.6.3. Megerősítéses tanulás (opcionális kiterjesztés)

- Q-learning / DQN diszkrét állapot-reprezentációval (lokális nézet vagy távolság-jellemzők).
- Jutalom: +1 ételért, -1 halálért, kis negatív lépés-költség (élénkítés).
- Tréning: szimulátorban, fix seed-ekkel; értékelés: átlagpont 1000 epizódban.

### 7.7. Játékciklus és állapotkezelés

1. Input olvasása (vagy MI döntés `next_move`).
2. Irány frissítése (ellentétes tiltása).
3. Fej új pozíció számítása; ütközésellenőrzés.
4. Ha étel → növekedés + pont; új étel generálása; különben farok lép.
5. Képkocka kirajzolása; tick időzítése.

### 7.8. Teljesítmény és erőforrás-követelmények

- **Cél:** stabil 60 FPS; MI döntési idő medián < 5 ms (20×20).
- **Memória:** < 200 MB.
- **CPU:** 1 mag elegendő; skálázás nagyobb rácsokhoz opcionális.

### 7.9. Technológiai stack (választható út)

- **Asztali:** Python + Pygame vagy C++/SFML.
- **Web:** TypeScript + HTML5 Canvas (Vite), opcionálisan React UI a menükhöz.
- Keresztplatform build-szkriptek; CI (GitHub Actions).

### 7.10. Konfiguráció és perzisztencia

- **config.json:** rácsméret, sebesség, seed, MI-stratégia, vizuális beállítások.
- **Eredmények:** scores.json vagy böngésző localStorage.
- **Logolás:** debug/INFO szint; MI döntések opcionális trace fájlba.

### 7.11. Tesztelés és értékelés

- **Egységtesztek:** ütközés, mozgás, étel-generálás, útkereső helyesség.
- **Integrációs tesztek:** játékciklus időzítés, input-kezelés.
- **MI benchmark:** 100–1000 futás különböző magokkal (seed), metrikák:
  - Átlag/medián pontszám és túlélési lépések.
  - Ételig tartó átlagos lépésszám.
  - Halálokok megoszlása.
- **Abláció:** biztonsági lépés nélkül vs. biztonsági lépéssel; Hamilton vs. A*.
- **Vizualizáció:** grafikonok a tanulási görbékről (ha RL), pontszám-eloszlás.

### 7.12. Kockázatok és mitigáció

- **Csapdába esés A*-nál:** Hamilton- vagy farok-követés fallback.
- **Állapottér robbanás (RL):** diszkrétített jellemzők, kisebb rács, reward shaping.
- **Teljesítmény gondok:** egyszerű adatszerkezetek, előallokáció, profilozás.

### 7.13. Ütemterv (példa, 12 hét)

- **1–2. hét:** Követelmények véglegesítése, technológia választás, skeleton.
- **3–4. hét:** Core játékmotor, ütközések, UI alapok.
- **5–6. hét:** Heurisztikus MI (BFS/A*), tesztek.
- **7–8. hét:** Hamilton-stratégia + benchmark keret.
- **9–10. hét (opcionális):** RL agent + tréning.
- **11. hét:** Mérési kampány, grafikonok, elemzés.
- **12. hét:** Dokumentáció, finomhangolás, védésre kész demo.

### 7.14. Átadandók (Deliverables)

- Forráskód + build-szkriptek, rövid README.
- Futó bináris/webes build.
- Tesztcsomag és futtatási jegyzőkönyv.
- Szakdolgozati dokumentum: tervezés, megvalósítás, mérési eredmények, konklúzió.
- Rövid demo videó (opcionális).

### 7.15. Elfogadási kritériumok

- A játék hibamentesen fut és szabályhelyes.
- MI mód legalább 100 egymás utáni futásból ≥95%-ban eléri az első ételt 20×20-as rácson.
- Dokumentált benchmark eredmények és összehasonlítás legalább két MI-stratégia között.

### 7.16. Fogalomtár

- **Tick:** játékciklus-időegység.
- **Hamilton-kör:** csúcsokat egyszer érintő zárt út egy gráfban; itt: rács.
- **Flood fill szabadságfok:** elérhető üres cellák száma egy lokális lépés után.

### 7.18. Mellékletek

**Pszedukód és példák (részlet):**

```text
function next_move(state):
  path = A*_to_food(state)
  if path exists and safe_after(path[1], state):
    return direction_to(path[1])
  else:
    return safest_local_step(state)  // flood fill + farok-heurisztika
```

**API-vázlat:**

```typescript
interface Strategy {
  Action next_move(State s);
}
```

**Konfiguráció-minta (config.json):**

```json
{
  "grid": { "rows": 20, "cols": 20 },
  "tick_ms": 120,
  "seed": 42,
  "ai": { "strategy": "astar", "safety": true }
}
```
