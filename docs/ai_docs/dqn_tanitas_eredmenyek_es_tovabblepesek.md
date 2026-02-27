# DQN tanítás – eredmények és továbblépések

## Tanítás futtatása (ajánlott parancs)

Az **ai_service** mappából futtasd (curriculum: először 12×12, majd 20×20; Double DQN és erősebb reward beépítve):

```bash
python training/train_dqn.py --curriculum
```

Alternatíva, csak 20×20-on, 25 000 epizód: `python training/train_dqn.py --episodes 25000`. Részletek: **5. Futtatási parancs** szekció.

Megjegyzés: a script most már **külön menti a legjobb** modellt (`models/dqn_snake_best.pt`) és a **legutolsó** modellt (`models/dqn_snake_last.pt`), így egy rosszabb későbbi checkpoint **nem írja felül** a legjobbat.

---

## 1. Korábbi futtatások (referencia)

### 1.1 3000 epizód

| Paraméter | Érték |
|-----------|--------|
| Parancs | `python training/train_dqn.py --episodes 3000` |
| Rács | 20×20 |
| Epsilon | 1.0 → 0.05 (lineáris) |
| **Legjobb mean100** | **-9.83** |
| Következtetés | Gyakorlatilag nem tanult; majdnem minden epizód -10 (halál). |

### 1.2 15 000 epizód

| Paraméter | Érték |
|-----------|--------|
| Parancs | `python training/train_dqn.py --episodes 15000` |
| Rács | 20×20 |
| **Legjobb mean100** | **-9.38** |
| Következtetés | Nem lett jobb; továbbra is közel -10, enyhe javulás (mean100 -9.50 … -9.63). Több epizód önmagában nem oldotta meg a konvergenciát. |

### 1.3 15 000 epizód (invalid mask + túlélési bónusz + shaping + lassabb epsilon)

| Paraméter | Érték |
|-----------|--------|
| Parancs | `python training/train_dqn.py --episodes 15000` |
| Rács | 20×20 |
| **Legjobb mean100** | **-6.31** (tanítás során elért maximum) |
| Végén (ep 14500–14999) | mean100 -9.17 … -9.36, epizód reward -7.8 … -9.8 |
| Következtetés | A módosítások hatnak: a legjobb -6.31 egyértelmű javulás a -10-hez képest. A tanítás végén viszont a teljesítmény **visszaesett** (regresszió); a mentett legjobb modell a -6.31-hez tartozó checkpoint. |

### 1.4 Curriculum futtatás (--curriculum, 12×12 → 20×20, Double DQN, erősebb reward)

| Fázis | Paraméterek | Eredmény (legjobb mean100) | Megjegyzés |
|-------|-------------|----------------------------|------------|
| **Stage 1** (12×12) | `python training/train_dqn.py --curriculum` (első fázis: 12×12, 10 000 epizód) | **-4.54** | Jelentős javulás a korábbi -10 körüli értékekhez képest; a kis pályán már „megtanult alapvetően” szinten van. |
| **Stage 2** (20×20) | Ugyanazon parancs második fázisa: betöltött modell, 20×20, 15 000 epizód, Double DQN, lr=5e-4 | **23.55** (logolt) / **47.95** (futás végi `Best mean100`) | A logban ep 14000-nél „saved … best mean100 23.55”, a futás végén pedig `Done. Best mean100 reward: 47.95` jelent meg. Ez azt jelenti, hogy a tanítás során volt egy még jobb szakasz is; a „saved” üzenet nem minden javulásnál jelenik meg (csak bizonyos epizódokon ír ki extra sort). |

---

## 2. Alkalmazott módszerek a hatékonyság növelésére

A 15k epizódos eredmények alapján a következő módosításokat alkalmaztuk a **környezeten** és a **tanítási cikluson**, hogy erősebb tanulási jelet kapjon a DQN.

### 2.1 Érvénytelen akció kizárása (invalid action masking)

- **Probléma:** Ha a kígyó Jobbra megy és a modell Balra (ellentétes irány) választ, az egy lépésben halált okoz. A replay buffer tele kerül ilyen „önkéntes” halálokkal, a háló nehezen tanul belőle.
- **Megoldás:**
  - **Környezet:** `SnakeEnv.current_direction_index()` – visszaadja az aktuális irány indexét (0–3). `opposite_action_index(i)` – az ellentétes irány indexe.
  - **Tanítás:** Minden lépésnél kiszámoljuk az **invalid** akciót (ellentétes irány). Véletlen lépésnél (epsilon-greedy) csak a **három érvényes** irány közül választunk. Hálóból választásnál a Q kimenetben az invalid indexet **-1e9**-re állítjuk, így az argmax soha nem azt választja.
  - **Inference (dqn.py):** A stratégia `next_move`-ban ugyanezt a maszkolást alkalmazzuk: a jelenlegi irány alapján kizárjuk az ellentétes irányt, majd a maradék három közül választunk.
- **Hatás:** Az agens nem léphet szándékosan 180°-ot; kevesebb az azonnali halál, több értelmes átmenet a bufferben.

### 2.2 Túlélési bónusz (reward_survival)

- **Probléma:** Csak halál (-10) és étel (+1) esetén volt erős jel; a „sima” túlélő lépések 0 rewardot kaptak. Így a háló kevés pozitív példát látott.
- **Megoldás:** A környezetben minden **nem halálos** lépés után **+0.01** (alapértelmezett `reward_survival`). Így minél tovább él a kígyó, annál nagyobb a lépésenkénti pozitív összeg.
- **Fájl:** `src/env/snake_env.py` – `SnakeEnv.__init__`: `reward_survival=0.01`, `step()`: nem halálos lépésnél `reward += self.reward_survival`.
- **Hatás:** A túlélés önmagában is jutalmazott; a mean reward növekedhet akkor is, ha még kevés ételt eszik az agens.

### 2.3 Erősebb reward shaping (étel felé/tőle)

- **Probléma:** A „közelebb az ételhez” (+0.01) és „távolabb” (-0.01) jelek gyengék voltak.
- **Megoldás:** Alapértelmezett értékek megduplázva: **reward_step_toward = 0.02**, **reward_step_away = -0.02**.
- **Fájl:** `src/env/snake_env.py` – `SnakeEnv.__init__`.
- **Hatás:** Erősebb jel az étel irányába haladásért, gyorsabb tanulás az étel felé történő mozgásra.

### 2.4 Lassabb epsilon csökkenés

- **Probléma:** Az epsilon túl gyorsan ért 0.05-re; a háló hamar „csak saját döntését” használta, kevés exploration maradt a későbbi epizódokban.
- **Megoldás:** Az epsilon a **epizódok első 80%-ában** csökken 1.0-ról 0.05-re (`epsilon_decay_fraction=0.8`). Az utolsó 20%-ban 0.05 marad.
- **Fájl:** `training/train_dqn.py` – `progress = min(1.0, episode / (epsilon_decay_fraction * episodes))`, majd `epsilon = max(epsilon_end, epsilon_start - (epsilon_start - epsilon_end) * progress)`.
- **Hatás:** Több epizódban marad a véletlen kísérletezés, több különböző állapot–akció pár kerül a bufferbe.

### 2.5 Double DQN (stabilabb Q becslés)

- **Probléma:** A klasszikus DQN a következő állapot Q értékét a **target háló** max értékével becsüli, ami túlbecsülheti a Q-t és instabillá teheti a tanulást.
- **Megoldás:** **Double DQN:** a **policy háló** választja a következő állapot legjobb akcióját (argmax), a **target háló** pedig csak ennek az akciónak a Q értékét adja. Így csökken a túlbecslés, a konvergencia stabilabb.
- **Fájl:** `training/train_dqn.py` – `use_double_dqn=True` (alapértelmezett); TD cél: `next_q = target_net(no).gather(1, policy_net(no).argmax(1, keepdim=True)).squeeze(1)`.
- **Hatás:** Gyakran jobb és stabilabb tanulási görbe, kevesebb regresszió a végén.

### 2.6 Curriculum learning (először kis pálya, majd 20×20)

- **Probléma:** A 20×20 állapottér nagy; a tanulás lassan indul. Kis pályán gyorsabban konvergál a háló.
- **Megoldás:** **Két fázis:** (1) **1. fázis:** 12×12 rácson 10 000 epizód, mentés. (2) **2. fázis:** a mentett modell betöltése, 20×20 rácson további 15 000 epizód, kisebb learning rate (5e-4) finomhangoláshoz. A megfigyelés mindkét pályán 12 dimenziós (jellemző alapú), ezért ugyanaz a háló használható.
- **Fájl:** `training/train_dqn.py` – `--curriculum` kapcsoló; `main()` két `train()` hívás: először 12×12, 10k ep, majd `load_path`-pal 20×20, 15k ep, lr=5e-4.
- **Hatás:** Gyorsabb konvergencia; a kis pályán megtanult viselkedés átültethető a nagyra, majd finomhangolás 20×20-on.

### 2.7 Erősebb jutalmak (túlélés + shaping)

- **Változás:** Alapértelmezett `reward_survival` **0.01 → 0.02**; `reward_step_toward` / `reward_step_away` **0.02/-0.02 → 0.03/-0.03**.
- **Fájl:** `src/env/snake_env.py` – `SnakeEnv.__init__`.
- **Hatás:** Erősebb pozitív jel a túlélésért és az étel felé haladásért; a mean reward gyorsabban nőhet.

---

## 3. Összefoglaló – módosított fájlok

| Fájl | Változás |
|------|----------|
| `src/env/snake_env.py` | reward_survival 0.02, reward_step_toward/away 0.03/-0.03, current_direction_index(), opposite_action_index(), túlélési bónusz |
| `src/env/__init__.py` | Export: opposite_action_index |
| `training/train_dqn.py` | Invalid action maszkolás, epsilon_decay_fraction=0.8, **Double DQN** (use_double_dqn=True), **Curriculum** (--curriculum: 12×12 10k ep, majd 20×20 15k ep load-dal), load_path, alapértelmezett 25k ep |
| `src/strategies/dqn.py` | Inference: ellentétes irány kizárása |

---

## 4. Célok és értékelés: optimális végeredmény, mikor tanult jól?

### 4.1 Elméleti maximum (20×20)

- A rács **20×20 = 400** cella. A kígyó **3** cellával indul, minden megevett ételnél **+1** a hossza.
- **Maximalizálandó pontszám (megevett étel):** 400 − 3 = **397**.
- **Ideális / optimális végeredmény:** a játék azért ér véget, mert **nincs több üres hely** – a kígyó kitölti az egész pályát. Ezt nevezzük **tökéletes játéknak** (score = 397).

### 4.2 Mikor mondhatjuk, hogy „megtanult”, „jól”, „nagyon jól”?

| Szint | Mit jelent gyakorlatban | Példa metrika (irányadó) |
|-------|-------------------------|---------------------------|
| **Nem tanult** | Gyakran azonnal vagy hamar meghal | mean100 ≈ -10, mean score ≈ 0–1 |
| **Megtanult alapvetően** | Túlél, néha eszik, nem öngyilkos lépések | mean100 > -5, mean score pl. 3–10, epizódonként sok lépés |
| **Jól játszik** | Több ételt eszik, kevesebb hülye halál | mean100 > 0, mean score pl. 15–40, stabilan magasabb lépésszám |
| **Nagyon jól** | Sokáig él, sok étel, ritkán bukik el | mean100 pl. 1–3+, mean score 50–150+, epizódok hosszúak |
| **Kivételesen jól** | Gyakran nagy pontszám, pálya nagy része tele | mean score 150–300+, időnként 300+ (közel a max 397-hez) |
| **Tökéletes játék** | Egész 20×20 kitöltve, 397 pont | Egy epizódban score = 397; extrém ritka, még erős heurisztikánál is nehéz következetesen elérni |

### 4.3 Mikor lehet kijelenteni, hogy „jól megtanult”?

- **Statisztikailag:** Mean reward (pl. mean100) **tartósan pozitív** (pl. > 0, vagy 1–2 felett). **Mean score** (átlag megevett étel) pl. **> 10–20** („jól”), **> 50** („nagyon jól”). Epizódonkénti **átlagos lépésszám** magas.
- **Szemrevételezés:** MI módban a kígyó nem megy szándékosan falba/testbe, az étel felé tart, sokáig él → **jól megtanult**.
- **„Nagyon jól”:** Folyamatosan magas pontszám (pl. mean score 50+), mean reward tisztán pozitív, a játékban látványosan hosszú, rendezett játékok.
- **„Egész 20×20 tele, nincs több hely”:** Ez a **legjobb lehetséges végeredmény** (397 pont). Nem elvárás a DQN-nél; ha egyszer-egyszer előfordul vagy közel megy (pl. 300+ pont), az már kivételes eredmény.

**Összegezve:** A **kedvező végeredmény** = mean100 pozitív, mean score legalább 10–20, sok lépés/epizód. A **jól megtanult** = ezek tartósan teljesülnek és a játékban is jól viselkedik. A **legjobb/optimális eset** = egész 20×20 kitöltve (397 pont) – ez a cél, de nem feltétel a „jól megtanult” kijelentéshez; a fenti metrikák a mérce.

---

## 5. Futtatási parancs – mit és hogyan futtass

### 5.1 Ajánlott: curriculum (jobb eredmény, egy parancs)

Az **ai_service** mappából (ahol a `training/` mappa van):

```bash
python training/train_dqn.py --curriculum
```

- **1. fázis:** 12×12 pálya, 10 000 epizód, mentés `models/dqn_snake.pt`.
- **2. fázis:** Betölti a mentett modellt, 20×20 pálya, 15 000 epizód, kisebb lr (5e-4). Összesen 25 000 epizód, Double DQN + erősebb reward alapértelmezetten be van kapcsolva.

### 5.2 Alternatíva: csak 20×20, több epizód

Ha nem curriculumot, hanem egyenesen 20×20-on akarsz tanítani (több epizód):

```bash
python training/train_dqn.py --episodes 25000
```

Alapértelmezett rács 20×20, 25 000 epizód. Opcionális: `--rows 20 --cols 20` (ez az alapértelmezett).

### 5.3 Opcionális argumentumok

- `--episodes N` – epizódok száma (curriculum nélkül; alapértelmezett 25000).
- `--rows R --cols C` – rács méret (curriculum nélkül).
- `--seed N` – random seed (alapértelmezett 42).
- `--model-dir KONYVTAR` – mentési mappa (alapértelmezett `models`).

### 5.4 Várakozás

- **Curriculum:** Az 1. fázisban (12×12) a mean100 gyorsabban nőhet; a 2. fázisban (20×20) a betöltött modell miatt kezdetben már értelmesebb viselkedés várható, a mean100 célja 0 közelébe vagy fölé.
- **Egyenes 20×20:** A mean100 fokozatosan nő (kezdetben negatív, később 0 vagy pozitív). Double DQN és erősebb reward miatt stabilabb görbe várható.

---

## 6. Továbblépések (opcionális)

- **Tanulási görbe naplózása:** Epizód reward és mean100 kiírása fájlba (pl. CSV) vagy TensorBoard; így grafikonon is követhető a javulás.
- **Double DQN / Dueling DQN:** Stabilitás és konvergencia javítására.
- **Értékelés:** Fix seed(ek) mellett N futás átlag pontszám és túlélési lépés; összehasonlítás A* / Greedy stratégiával.

---

## 7. Értékelés a legutóbbi 15k futtatásról (best mean100 -6.31)

### 7.1 Összefoglaló

- **Legjobb mean100: -6.31** – Ez azt jelenti, hogy a tanítás egy szakaszában a 100 epizódos átlag jelentősen jobb lett a kezdeti -10-nél: a kígyó több lépést megélt és/vagy több ételt evett. A mentett modell (`models/dqn_snake.pt`) erre a legjobb pillanatra került mentésre.
- **Végén visszaesés:** Az ep 14500–14999 közötti mean100 -9.17 … -9.36. A DQN ilyen **regressziója** gyakori (pl. „catastrophic forgetting”, vagy az epsilon=0.05 miatt még mindig sok rossz lépés kerül a bufferbe és rombolja a politikát). Fontos: a **játékban a mentett legjobb modellt** használjuk, nem az utolsó epizódét – tehát a -6.31-hez tartozó viselkedés az, amit a DQN stratégia mutat.
- **Hol tart most?** A 4.2 szekció táblázata szerint **„megtanult alapvetően”** szint: mean100 > -5 (a -6.31 még negatív, de közel van), túlél és néha eszik. **„Jól”** (mean100 > 0, mean score 15–40) és **„nagyon jól”** (mean score 50+) **még nincs meg**.

### 7.2 Mit kell tenni, hogy legalább nagyon jól vagy kivételesen jól játsszon?

| Cél | Javasolt lépések |
|-----|-------------------|
| **Nagyon jól** (mean score 50+, mean100 pozitív) | (1) Több epizód (25k–50k) ugyanazzal a DQN-nel, vagy (2) **Double DQN / Dueling DQN** (stabilabb), vagy (3) **Curriculum:** először 12×12 vagy 10×10 pályán tanítás, majd 20×20-ra finomhangolás – kisebb állapottér, gyorsabb konvergencia. |
| **Kivételesen jól** (mean score 150–300+) | Ugyanezek + **Prioritized Experience Replay (PER)**, vagy **PPO** (policy gradient) ugyanazzal a környezettel – sok feladaton gyorsabban és stabilabban tanul. Hosszú tanítás (50k+ epizód vagy sok lépés). |
| **Tökéletes** (397 pont, egész pálya tele) | Elméletileg **megvalósítható**, de gyakorlatban **nagyon nehéz**. Lehetséges utak: (1) **Imitation learning:** először A* vagy Hamilton kimeneteire tanítani a hálót, majd RL-lel finomhangolni; (2) nagyon hosszú tanítás + PER + nagyobb háló; (3) dedikált heurisztika (A*, Hamilton) erre a célra gyakran megbízhatóbb, a DQN inkább „jól / nagyon jól” szintre realistikus. |

### 7.3 Megvalósítható-e egyáltalán?

- **Nagyon jól / kivételesen jól:** **Igen.** A megfelelő módszerekkel (több epizód, jobb algoritmus, curriculum, esetleg imitation) elérhető, hogy a mean score 50, 100 vagy 200+ legyen.
- **Tökéletes (397 pont):** **Igen, de** extrém erőfeszítéssel és/vagy imitation/heurisztika keverékével. Tiszta DQN-nel, csak hosszú tanítással is előfordulhat ritkán, de nem várható következetesen.

---

## 8. Kevesebb epizóddal (pl. 5000) lehet-e jól játszó modell?

### 8.1 Csökkenthető-e a futásszám 15000-ről 5000-re?

- **Röviden:** 5000 epizóddal a **jelenlegi (vanilla) DQN-nel** valószínűleg **nem** érnéd el a „nagyon jól” szintet; a tapasztalat szerint 15k-nál is csak -6.31 volt a legjobb mean100, és a tanulás lassan indul.
- **Ha muszáj kevesebb az idő:** Az epizódszám **csökkenthető**, ha **nem a futásszámot** csökkentjük, hanem **gyorsabb konvergenciát** teremtünk – így kevesebb epizód kell a jó eredményhez.

### 8.2 Hogyan lehet kevesebb epizóddal nagyon jól / kivételesen jól?

| Módszer | Ötlet | Várható hatás |
|---------|--------|----------------|
| **Curriculum learning** | Először **kisebb pálya** (pl. 10×10, 12×12) – kevesebb állapot, gyorsabb tanulás. Aztán a modellt **átültetni** 20×20-ra (ugyanaz a háló, más rács), vagy tovább tanítani 20×20-on. | Kevesebb epizód (pl. 5k–10k) a kis pályán már „jól” szintet adhat; a 20×20-ra való áttérés további epizódokat igényel, de összesen kevesebb, mint 15k csak 20×20-on. |
| **Imitation / pretraining** | Sok állapotra lefuttatod az **A*** vagy **Hamilton** stratégiát, és a hálót **supervised** módon tanítod ezekre a (state, action) párokra. Utána **RL finomhangolás** (DQN) csak 3k–10k epizóddal. | Kevesebb RL epizód; a „nagyon jól” gyorsabban elérhető, mert a kezdőpolitika már értelmes. |
| **PPO (vagy A2C)** | A **PPO** sok feladaton **gyorsabban** konvergál, mint a DQN (policy gradient, kevesebb instabilitás). Ugyanaz a Snake környezet; 20k–50k **lépés** (nem feltétlenül 50k epizód) már lehet elég. | Egy 5k–15k **epizód** PPO-val lehet többet ér, mint 15k DQN – de az epizód = sok lépés, szóval a futási idő hasonló lehet; a **konvergencia** gyakran jobb. |
| **Hiperparaméterek** | Nagyobb batch (pl. 128), kisebb learning rate (5e-4), **Prioritized Replay** – fontos átmenetekre fókuszál. | Némileg gyorsabb konvergencia, kevesebb epizód a célhoz. |

### 8.3 Javaslat

- **Ha a futási idő a fő gond:** Futtasd a tanítást **háttérben** (pl. 20k–30k epizód), vagy próbáld ki a **curriculumot:** 5k–8k epizód 12×12-on, majd 5k–10k 20×20-on a már tanult modellből.
- **Ha a szakdolgozatban „nagyon jól” kell:** Érdemes **PPO**-t is implementálni (a tervben már van), és összehasonlítani: ugyanannyi idő alatt a DQN vs PPO melyik ér el jobb mean score-t. A PPO gyakran kevesebb epizóddal is jobban teljesít.
- **Röviden:** **Kevesebb epizóddal is megvalósítható** a nagyon jól / kivételesen jól játék, ha **curriculum**, **imitation** vagy **PPO** (és/vagy PER) bekerül – nem feltétlenül 5k vanilla DQN-nel, de 5k–10k „okosabb” módszerrel már reális a cél.

---

*Utolsó frissítés: curriculum (--curriculum) futtatás kiértékelése (Stage 1: best mean100 -4.54, Stage 2: best mean100 21.07), Double DQN + erősebb reward; célok (nagyon jól / kivételesen jól / tökéletes); megvalósíthatóság; kevesebb epizóddal való tanítás (curriculum, imitation, PPO); javaslatok.*

## 9. Mit jelentenek a `reward` és a `mean100` értékek?

- **`reward` (epizód reward):** az adott epizódban (egy teljes játék reset→halál) összegzett jutalom. Nálunk ez tartalmazza:
  - **étel**: +1 (és ehhez még hozzáadódik a túlélési bónusz lépésenként),
  - **túlélés**: lépésenként +0.02,
  - **étel felé/tőle**: +0.03 / -0.03,
  - **halál**: -10.
  Emiatt a reward **nem azonos** a pontszámmal (score), hanem egy „tanítási jel”.

- **`mean100`:** az **utolsó 100 epizód rewardjának átlaga**. Ez simítja az ingadozást, és jobban mutatja a trendet. Ha a mean100 tartósan nő és pozitív, a tanulás általában működik.

Tipp: a script most már tud **külön eval** futtatást is (`--eval-episodes`), ahol determinisztikusan kiírja az átlag **score**-t és **lépésszámot** is, nem csak rewardot.
