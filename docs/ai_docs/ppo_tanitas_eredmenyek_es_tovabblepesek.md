# PPO tanítás – eredmények és továbblépések

## 1. Cél és áttekintés

Ez a dokumentum a **PPO (Proximal Policy Optimization)** stratégia tanítását és kiértékelését írja le a Snake környezeten, a **Stable-Baselines3** könyvtár segítségével. A cél:

- ugyanarra a `SnakeEnv` környezetre építkezni, mint a DQN-nél,
- PPO-val betanított modellt használni a `ppo` stratégiában (`PPOStrategy`),
- a legjobb PPO modellből **globális best** modellt tartani fenn (csak jobb modell írhatja felül),
- a szakdolgozatban összehasonlítható eredményeket kapni (DQN vs PPO).

Futtatás (ai_service mappából):

```bash
python training/train_ppo.py --rows 20 --cols 20 --total-timesteps 200000 --eval-episodes 50
```

Ez:
- 20×20 pályán,
- 200 000 időlépésig tanítja a PPO modellt,
- a végén 50 determinisztikus eval epizódot futtat,
- elmenti a **legjobb** modellt: `models/ppo_snake_best.zip` és kompatibilitásként `models/ppo_snake.zip`.

---

## 2. Megvalósítás (röviden)

### 2.1 Környezet wrapper (SnakeGymEnv)

- **Fájl:** `ai_service/training/train_ppo.py`
- **Osztály:** `SnakeGymEnv(gym.Env)` – egy vékony wrapper a meglévő `SnakeEnv` köré.
- Gym / SB3 kompatibilis metódusok:
  - `reset(seed=...)` → `(obs, info)` – `SnakeEnv.reset` meghívása.
  - `step(action)` → `(obs, reward, terminated, truncated, info)` – `SnakeEnv.step` meghívása.
- `observation_space`: `Box(shape=(OBSERVATION_DIM,), dtype=float32)`.
- `action_space`: `Discrete(4)` (Up, Right, Down, Left).

### 2.2 PPO tanítás (train_ppo.py)

- **Fájl:** `ai_service/training/train_ppo.py`
- **Script fő pontjai:**
  - **Függőségek:** `stable-baselines3`, `gym`, `numpy`.
  - `SnakeGymEnv` → `DummyVecEnv` (SB3-nek vektoros env kell).
  - Modell: `PPO("MlpPolicy", vec_env, verbose=1, seed=...)`.
  - Tanítás: `model.learn(total_timesteps=TOTAL_TIMESTEPS)`.
  - Mentés:
    - **Utolsó modell:** `models/ppo_snake_last.zip`.
    - **Eval után, ha jobb mint a korábbi best:** `models/ppo_snake_best.zip` + kompatibilis `models/ppo_snake.zip`.

### 2.3 Globális best / backup (PPO)

- **Backup induláskor:**
  - Fájl: `backup_existing_ppo_models(model_dir)`.
  - Menti a korábbi PPO fájlokat (ppo_snake*.zip, ppo_snake_best_meta.json) egy időbélyeges könyvtárba:  
    `models/backups_ppo/YYYYMMDD_HHMMSS/`.
- **Globális best meta:**
  - Fájl: `models/ppo_snake_best_meta.json`.
  - Tartalmazza: `{"best_mean_reward": ...}` – az eddig elért legjobb eval_mean_reward.
  - Új futáskor a script betölti, és **csak akkor** írja felül a best modelleket, ha az új eval_mean_reward **nagyobb**, mint az eddigi.
- **Mentett modellek:**
  - `ppo_snake_best.zip` – globális legjobb PPO modell.
  - `ppo_snake.zip` – kompatibilis best modell (ezt tölti a `PPOStrategy`).
  - `ppo_snake_last.zip` – utolsó futás PPO modellje (nem feltétlenül a legjobb).

### 2.4 Valódi PPOStrategy

- **Fájl:** `ai_service/src/strategies/ppo.py`
- **PPOStrategy:**
  - Megpróbálja betölteni a `ppo_snake_best.zip` (vagy `ppo_snake.zip`) modellt.
  - Ha nincs modell vagy nincs telepítve a stable-baselines3 → **Greedy fallback**.
  - `next_move(state)`:
    - `state_to_observation(state)` → numpy vektor.
    - `model.predict(obs, deterministic=True)` → akció index.
    - Érvénytelen index esetén az aktuális irányra vagy Greedy fallbackre tér át.
    - Az **ellentétes irányt (180°)** tiltja: ha az akció az ellenkező irány lenne, Greedy fallbacket választ.

---

## 3. Futtatási parancsok

### 3.1 Ételorientált PPO tanítás (ajánlott)

Az **ai_service** mappából, venv aktiválva. Alapértelmezetten ételorientált preset van (4.4, 4.5), **célravezető finomhangolással** (4.6):

```bash
python training/train_ppo.py --rows 20 --cols 20 --total-timesteps 800000 --eval-episodes 10
```

Kimenet fájlba (pl. szakdolgozathoz):

```bash
python training/train_ppo.py --rows 20 --cols 20 --total-timesteps 800000 --eval-episodes 10 > ..\docs\ppo_food_results.txt
```

- **800 000** total timesteps (alap); végén 10 eval epizód. Ha jobb a korábbi best → menti `ppo_snake_best.zip` és `ppo_snake.zip`.
- Eval kikapcsolva: `--eval-episodes 0`.
- Régi viselkedés: `--no-food-preset`.

### 3.2 Konfigurálható paraméterek

- `--rows`, `--cols` – rács méret (alap: 20×20).
- `--seed` – random seed (alap: 42).
- `--total-timesteps` – tanítási lépésszám (alap: **800 000**).
- `--model-dir` – modellek könyvtára (alap: `models`).
- `--eval-episodes` – eval epizódok száma (alap: 10; 0 esetén nincs eval/best mentés).
- `--no-food-preset` – régi reward (survival-heavy, nincs max lépés/epizód).

### 3.3 Eval csak (tanítás nélkül) – eval_ppo.py

Ha már van mentett `ppo_snake_last.zip`, kiértékelheted anélkül, hogy újra tanítanál:

```bash
python training/eval_ppo.py --episodes 10
python training/eval_ppo.py --episodes 10 --save-best
```

- `--model` – modellfájl (alap: `models/ppo_snake_last.zip`).
- `--episodes` – hány epizódot futtasson (alap: 10).
- `--save-best` – ha az eval mean_reward jobb, mint a meta fájlban, menti `ppo_snake.zip` és `ppo_snake_best.zip` néven, így a web ezt használja.

---

## 4. Eredmények és értelmezés (kitöltendő futtatás után)

Ide kerülnek a konkrét futtatások számai (hasonlóan a DQN dokumentumhoz).

### 4.1 Első PPO futtatás – 20×20, 200 704 timesteps

Parancs (venv-ben, `ai_service` mappából):

```bash
python training/train_ppo.py --rows 20 --cols 20 --total-timesteps 200000 --eval-episodes 0 > ..\docs\ppo_results.txt
```

#### 4.1.1 SB3 tréning log (time/ és train/ blokkok)

Példa utolsó iteráció (részlet a `docs/ppo_results.txt` végéről, 98. iteráció, ~200k timesteps):

- **time/** csoport:
  - `fps`: ~636–638 – másodpercenkénti lépésszám (sebesség, itt csak teljesítménymutató).
  - `iterations`: 95–98 – hány PPO update ciklus futott (minden iteráció egy batch rollout + tanulás).
  - `time_elapsed`: ~305–314 – másodpercben eltelt idő.
  - `total_timesteps`: 194 560 → 200 704 – eddig összesen ennyi környezeti lépés (time step) futott le.

- **train/** csoport:
  - `approx_kl`: ~0.005–0.01 – az új és régi politika közötti **KL divergencia** becslése; kicsi érték (0.01 alatt) azt jelzi, hogy a frissítés nem „rántotta túl” a politikát, stabil tartományban marad.
  - `clip_fraction`: ~0.08–0.10 – a PPO klippelő mechanizmus által „levágott” frakció; ~0.1 körüli érték elfogadható (nem túl agresszív, de használja a klippet).
  - `clip_range`: 0.2 – a PPO klippelési intervalluma (fix hiperparaméter).
  - `entropy_loss`: kb. -1.36 → -0.76 – a politika **entrópiája**: nagyobb abszolút érték = több véletlenség; ahogy csökken (pl. -1.3 → -0.7), a politika egyre „biztosabb” a választott akciókban (kevesebb random).
  - `explained_variance`: -0.0… → -4.8 – a **value háló magyarázott varianciája**; 1-hez közel jó, 0 körül/negatív gyenge. Itt végig 0 körül vagy negatív, ami arra utal, hogy a value háló még nem tanulta jól a jövőbeni jutalmakat (instabil vagy nehezen tanulható reward).
  - `learning_rate`: 0.0003 – tanulási ráta (fix SB3 beállítás).
  - `loss`: ~0.9 → 0.0 körüli – az SB3 által riportált összveszteség (policy + value + regularizáció); önmagában nem könnyű értelmezni, a trend fontosabb, mint az abszolút érték.
  - `n_updates`: 10 → 970 – hány gradient update történt a tréning során.
  - `policy_gradient_loss`: negatív, kis abszolút érték (~-0.02 → -0.006) – a policy gradiens komponens; kismértékű módosításokat jelez minden iterációnál.
  - `value_loss`: fokozatosan csökkenő, kis értékek (~15 → 2.5e-05) – a value háló vesztesége; a kis érték önmagában nem garancia a jó „explained_variance”-re (lásd fent), de jelzi, hogy a háló jól illeszti a jelenlegi targeteket.

#### 4.1.2 Következtetés az első futásból

- A tréning **technikai szempontból stabilan lefutott** (nincs divergens KL vagy hatalmas loss), a PPO lépései kis, kontrollált módosításokat végeznek (approx_kl ~0.01, clip_fraction ~0.1).
- Az `explained_variance` végig 0 körül / negatív – ez arra utal, hogy a value háló **nem tanulta meg jól előrejelezni a visszatérő jutalmakat**. Ez gyakori, ha a reward zajos, a környezet nehéz vagy a timesteps viszonylag kevés.
- Mivel ebben a futásban **nem futott eval** (`--eval-episodes 0`), csak annyit mondhatunk, hogy **a PPO tréning lefutott**, de nem tudjuk, milyen jól játszik ténylegesen (score / túlélési lépések szempontjából).

---

### 4.2 Értékelés: lefutott PPO futás (ppo_results.txt)

**Futás összefoglalója:**

- **Tanítás:** 200 704 timesteps (~98 iteráció), ~276 s (~4,6 perc), fps ~725.
- **Utolsó iteráció metrikái:** approx_kl ~0.01, clip_fraction ~0.1, entropy_loss ~-0.76, explained_variance ~-4.85, value_loss ~2.5e-05.
- **Eval:** nem futott (`--eval-episodes 0`), ezért **nincs mean_reward / mean_score / mean_steps** a logban.
- **Mentés:** `models/ppo_snake_last.zip` – ez a legfrissebb PPO modell. A web `PPOStrategy` a `ppo_snake.zip` (vagy `ppo_snake_best.zip`) fájlt használja; jelenleg **nincs ilyen**, mert eval nem futott, tehát a PPO stratégiánál Greedy fallback lehet aktív.

**Összehasonlítás DQN-nel (irányadó):** A DQN dokumentum szerint a legjobb DQN mean100 score ~47.95. A PPO játékbeli teljesítményét csak eval futtatásával lehet mérni.

#### 4.2.1 Eval eredmény: eval_ppo.py, 10 epizód (max 2000 lépés/epizód)

```
Eval PPO (10 episodes): mean_reward=40.00, mean_score=0.00, mean_steps=2000.0
```

- **mean_steps=2000.0** – mind a 10 epizód a **max lépésszámnál** (2000) ért véget; egyik sem halt meg időben.
- **mean_score=0.00** – egyetlen epizódban sem evett ételt a kígyó (0 pont).
- **mean_reward=40.00** – a túlélési jutalom (survival bonus) összege; 2000 lépés × kis pozitív reward/lépés ≈ 40.

**Következtetés:** A modell **túlélésre** tanult: nem ütközik gyorsan, ezért mindig eléri a 2000 lépést. **Ételre nem megy** (vagy nem mer közeledni), ezért score 0. Ez összhangban azzal, hogy a tréningben az `explained_variance` gyenge volt: a value háló nem jól jósolja a hosszú távú jutalmat (étel megszerzése), így a politika inkább a rövid távú túlélési jutalomra optimalizál. Továbblépésként érdemes több timestep, erősebb étel-jutalom vagy curriculum, vagy az eredményt szakdolgozatban így rögzíteni (PPO: túlélő, de nem pontszerző vs. DQN ~48 pont).

#### 4.2.2 Ételorientált PPO – eval eredmények (food preset, 400k timesteps)

Tanítás után (train_ppo.py, ételorientált preset, 400 000 timesteps), eval a mentett modellen:

**10 epizód (train végén mentett best):**
```
Eval PPO: mean_reward=11.39, mean_score=1.20, mean_steps=1802.0
  -> saved best PPO model to models\ppo_snake_best.zip (best_mean_reward 11.39)
```

**50 epizód (eval_ppo.py, ugyanaz a modell):**
```
Eval PPO (50 episodes): mean_reward=35.71, mean_score=1.62, mean_steps=1764.6
```

- **mean_score=1.20 → 1.62** – az ételorientált preset működik: a kígyó eszik (átlag ~1.2–1.6 étel/epizód). A 50 epizódos mérés kissé jobb, stabilabb becslés.
- **mean_steps ~1765–1802** – az epizódok átlagosan a max (2000) előtt érnek véget (halál vagy limit), nincs végtelen túlélés.
- **Összehasonlítás:** DQN best mean100 score ~47.95; PPO ételorientált első futás ~1.6. A különbség nagy – a PPO még kezdeti szinten van, további finomhangolással javítható (lásd 4.5).

#### 4.2.3 Túl agresszív preset – visszalépés mérsékelt beállításra

Egy későbbi, **agresszívebben büntető és erősebben exploráló** preset (reward_food=15, reward_starvation=-1, max_steps=2500, ent_coef=0.02) eredménye:

```
Eval PPO: mean_reward=2.97, mean_score=0.30, mean_steps=2250.0
```

- **mean_score=0.30** – az előző ~1.6-hoz képest lényegesen rosszabb, a modell ritkán szerez ételt.
- **mean_steps=2250** – az epizódok többsége a 2500 lépéses limit közelében ér véget, miközben kevés ételt vesz fel.

**Következtetés:** A túl erős starvation büntetés + magasabb ételjutalom és entropia együtt ebben a konfigurációban **nem hozott jobb játékot**, sőt, rontotta a mean_score-t. Ezért a végső, ajánlott beállítás egy **mérsékelten ételorientált preset** (reward_food=10, reward_starvation=-0.5, max_steps=2000, ent_coef=0.01), amely az első ételfókuszú futás (~1.6 score) viselkedéséhez áll közel, de hosszabb tanítással (800k timesteps) párosul.

#### 4.2.4 Végső, mérsékelt preset – 800k timesteps

Az utolsó, mérsékelt preset (reward_food=10, reward_starvation=-0.5, max_steps=2000, ent_coef=0.01, 800k timesteps) eredménye:

```
Eval PPO: mean_reward=7.19, mean_score=0.70, mean_steps=2000.0
```

- **mean_score=0.70** – jobb, mint a túl agresszív preset (0.30), de elmarad az első, 400k-s food-preset ~1.6 score-jától. A modell már eszik, de nem következetesen.
- **mean_steps=2000.0** – az epizódok a 2000-es lépéshatárnál érnek véget (max_steps_per_episode), a survival + starvation kombináció egyensúlyt tart: sokat él, de az ételkeresés nem totális prioritás.
- **Értelmezés:** A PPO érzékeny a reward shapingre és a hiperparaméterekre; a DQN-hez (~48 pont) képest a PPO-nál többször szükséges finomhangolás. A szakdolgozat szempontjából ez jól mutatja, hogy ugyanarra a környezetre és célra különböző RL algoritmusok **különböző mértékben igényelnek kézi hangolást**, és hogy a PPO-val elért eredmény jelen konfigurációban inkább „proof-of-concept”, nem pedig DQN-szintű játék.

---

### 4.3 Teendők (következő lépések)

1. **Eval futtatása a mentett modellre (tanítás nélkül)**  
   Az `eval_ppo.py` script betölti a `ppo_snake_last.zip`-et, N epizódot futtat, kiírja az átlag reward/score/steps-et. Opcionálisan menti best-ként (`ppo_snake.zip`), ha jobb a korábbinál.

   ```bash
   # ai_service, venv aktiválva
   python training/eval_ppo.py --episodes 10
   python training/eval_ppo.py --episodes 10 --save-best
   ```

   Így kapunk konkrét **mean_score / mean_steps** számokat a szakdolgozathoz, és a web PPO stratégiája is a legutóbbi modellt használja (ha `--save-best`-et futtatod és jobb az eredmény).

2. **Web PPO használata azonnal (eval nélkül)**  
   Ha nem akarsz evalt futtatni, másold a last modellt a kompatibilis névre, hogy a web ezt használja:

   ```bash
   copy models\ppo_snake_last.zip models\ppo_snake.zip
   ```

3. **További tanítás / finomhangolás (opcionális)**  
   - Több timestep (pl. 400k) és/vagy rövidebb eval a végén (pl. `--eval-episodes 10`), hogy ne álljon meg sokáig.
   - Reward shaping / curriculum (pl. docs alapján) – a későbbi fejlesztési tervben.

4. **NEAT / más stratégiák**  
   Ha a PPO eredményekkel kész vagy, a terv szerint következhet a neuroevolution (NEAT) vagy további összehasonlítások.

---

## 4.4 Javaslatok: ételorientált PPO (minél több étel cél)

A túlélő, 0 pontot szerző PPO eredmény után az alábbi módosítások célravezetőek, hogy a modell **minél több ételt vegyen fel** (score növelése).

### 4.4.1 Reward shaping

- **Erősebb ételjutalom:** `reward_food` jelentősen nagyobb (pl. 10 vagy 20), hogy az étel megszerzése egyértelműen jobb legyen, mint a „biztonságos” körbe járás.
- **Gyengébb vagy nulla túlélési jutalom:** `reward_survival` csökkentése (pl. 0 vagy 0.01), hogy a „csak élek sokáig étel nélkül” stratégia ne legyen versenyképes.
- **Starvation büntetés (opcionális):** Ha sok lépésig nem eszik (pl. epizódon belül eléri a max lépésszámot étel nélkül), kis negatív reward vagy korai epizód vége – így a körbe-körbe járás kevésbé kifizetődő.

### 4.4.2 Időlimit / max lépésszám tréningben

- **Max lépés epizódonként:** Tréningben is legyen felső határ (pl. 2000–3000 lépés/epizód). Így az epizódok véget érnek, nem ragad be a végtelen túlélés; az agens gyakrabban tapasztalja a halált és az étel megszerzését.
- **Starvation:** Ha a max lépésnél ér véget az epizód (nem halt meg, de nem evett X lépés óta), opcionálisan kis büntetés vagy semleges befejezés.

### 4.4.3 Több tréning (timesteps)

- 200k lépés kevés lehet a bonyolultabb rewardhoz; érdemes **400k–500k** (vagy több) `total_timesteps` futtatása.

### 4.4.4 Hyperparaméter (exploráció)

- **Entropy coefficient** növelése (SB3 PPO-nál `ent_coef`) növeli az explorációt, csökkenti a túl korai beragadást a „biztonságos” túlélő lokális optimumba.

---

A fenti beállítások a `train_ppo.py` és a `SnakeEnv` alapértelmezett/paraméterein keresztül megvalósítva vannak (ételorientált preset); a konkrét futtatási parancs a 4.3 és a 3.1 szakaszban, illetve alább „Ételorientált PPO tanítás” címmel szerepel.

---

## 4.5 Javaslatok: jobb futtató eredmény elérése (magasabb mean_score)

A jelenlegi ételorientált PPO mean_score ~1.6; a DQN ~48. Az alábbi lépésekkel növelhető a PPO teljesítménye (magasabb, stabilabb score).

### 4.5.1 Több tanítási lépés (timesteps)

- **Jelenleg:** 400k timesteps. Próbáld **800k–1M** (vagy 1.5M) lépést: `--total-timesteps 800000` vagy `1000000`.
- A hosszabb tréning több étel-szerzési és halálhelyzetet mutat be, a value háló jobban megtanulja a hosszú távú jutalmat.

### 4.5.2 Reward finomhangolás

- **Étel jutalom:** Ha a modell még mindig óvatos, növeld a `reward_food` értékét (pl. 15 vagy 20) a `FOOD_PRESET`-ben a `train_ppo.py`-ban.
- **Step toward/away:** Esetleg erősebb irányítás az étel felé: `reward_step_toward` 0.08–0.1, `reward_step_away` -0.08–-0.1 (ne legyen túl nagy, különben zajossá válik).
- **Starvation:** Ha sok epizód a 2000 lépésnél ér véget étel nélkül, erősítsd a `reward_starvation` büntetést (pl. -1 vagy -2), hogy kevésbé kifizetődő legyen a „csak keringek” stratégia.

### 4.5.3 Max lépés/epizód és pályaméret

- **Max lépés:** 2000 helyett próbáld **2500–3000**-et (több esély az étel megszerzésére egy epizódban). A `FOOD_PRESET`-ben `max_steps_per_episode`: 2500 vagy 3000.
- **Kisebb pálya (curriculum):** Először taníts **kisebb rácsra** (pl. 12×12 vagy 15×15), ahol gyorsabban találkozik étellel és halállal; majd finomhangolás 20×20-n. Ehhez külön futás kell (pl. `--rows 12 --cols 12`), vagy később átállás 20×20-ra.

### 4.5.4 PPO hiperparaméterek (SB3)

- **Entropy coefficient (`ent_coef`):** Alap 0.01; növelés (pl. 0.02–0.05) több explorációt ad, csökkenti a korai beragadást. A `train_ppo.py`-ban a `PPO(..., ent_coef=0.02)` megadásával.
- **Learning rate:** Ha a tréning instabil, csökkentsd (pl. 1e-4); ha túl lassan tanul, emeld (pl. 5e-4). SB3 alap 3e-4.
- **Batch size / n_steps:** A PPO alapértelmezetten 2048 lépésre roll outol. Nagyobb `n_steps` (pl. 4096) stabilabb, de lassabb egy iteráció.

### 4.5.5 Eval és mérés

- **Több eval epizód:** A 50 epizód jó becslést ad; szakdolgozathoz érdemes **100 epizód** is futtatni az összehasonlításhoz (pl. `eval_ppo.py --episodes 100`).
- **Több futás:** Futtass 2–3 független tanítást különböző seed-del (`--seed 42`, `--seed 123`, `--seed 456`), és az átlagos mean_score-ot hasonlítsd a DQN-nel.

### 4.5.6 Összefoglaló (prioritás)

1. **Több timesteps** (800k–1M) – legegyszerűbb, gyakran nagy javulás.
2. **Erősebb étel reward** vagy **starvation büntetés** – ha még mindig kevés ételt eszik.
3. **Entropy növelése** – ha túl óvatos, nem mer az étel felé menni.
4. **Max lépés 2500–3000** – több lehetőség ételre epizódonként.
5. **Curriculum (kisebb pálya először)** – opcionális, ha időd engedi.

---

## 4.6 Alkalmazott célravezető finomhangolás (train_ppo.py)

A 4.5 javaslatai alapján az alábbi beállítások kerültek be az ételorientált tanításba (alapértelmezett, ha nem használod a `--no-food-preset` kapcsolót). Cél: magasabb mean_score elérése (közelebb a DQN ~48-hoz).

| Beállítás | Régi érték | Új érték | Indoklás |
|-----------|------------|----------|----------|
| **reward_food** | 10 | **15** | Erősebb ösztönzés az étel megszerzésére. |
| **reward_starvation** | -0.5 | **-1.0** | Erősebb büntetés, ha a max lépésnél ér véget az epizód étel nélkül; kevésbé kifizetődő a „csak keringek” stratégia. |
| **max_steps_per_episode** | 2000 | **2500** | Több lépés epizódonként → több esély ételre és halálhelyzetre. |
| **total_timesteps (alap)** | 400 000 | **800 000** | Több tanulási lépés → jobb value előrejelzés és politika. |
| **PPO ent_coef** | (SB3 alap 0.01) | **0.02** | Több exploráció; csökkenti a túl korai beragadást a túlélő lokális optimumba. |

**Fájlok:** `ai_service/training/train_ppo.py` – `FOOD_PRESET`, `PPO_ENT_COEF`, `PPO(..., ent_coef=...)`, valamint az alapértelmezett `--total-timesteps 800000`.

**Futtatás:** ugyanaz a parancs, a timesteps alapértelmezetten 800k (explicit megadás opcionális):

```bash
python training/train_ppo.py --rows 20 --cols 20 --eval-episodes 10
```

---

## 5. Összefoglaló

- A PPO tanítás a **SnakeEnv**-re épül, SB3 `PPO("MlpPolicy", ...)`-t használ.
- A script globálisan védi a **legjobb PPO modellt** (csak jobb eval eredmény írhatja felül, backup minden futás előtt).
- A `PPOStrategy` a `ppo_snake_best.zip`/`ppo_snake.zip` betöltésével végzi az inference-t; ha nincs modell, **Greedy fallback**.
- A szakdolgozatban a DQN dokumentumhoz hasonlóan itt is rögzíthetők a tanítási / eval eredmények, és összehasonlítható a DQN / PPO / NEAT teljesítmény.

