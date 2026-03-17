# NEAT tanítás – eredmények és továbblépések

## 1. Cél és áttekintés

Ebben a dokumentumban a **NEAT (NeuroEvolution of Augmenting Topologies)** alapú Snake-stratégia tanítását és kiértékelését írjuk le.

Célok:

- ugyanarra a `SnakeEnv` környezetre építeni, mint a DQN és PPO esetén,
- a `state_to_observation` 12 dimenziós jellemzőit használni bemenetként,
- NEAT-tel evolválni egy kis, feedforward hálót, amely a 4 akció (Up, Right, Down, Left) közül választ,
- a legjobb egyedet menteni, és `NEATStrategy`-n keresztül használni a webes kliensben,
- eredmények összehasonlítása: **heurisztikák vs. DQN vs. PPO vs. NEAT**.

---

## 2. Megvalósítás

### 2.1 Környezet és megfigyelés

- **Fájl:** `ai_service/src/env/snake_env.py`
- Megfigyelés: `state_to_observation(state)` – **12 dimenziós** jellemző vektor (`OBSERVATION_DIM = 12`):
  - [0–3]: veszély jelzők (fal/test 1–2 lépésen belül Up/Right/Down/Left),
  - [4–7]: fal-távolság mind a 4 irányban,
  - [8–10]: étel relatív pozíciója és Manhattan-távolság,
  - [11]: kígyóhossz / (rows * cols).
- Akciók: `ACTION_NAMES = ["Up", "Right", "Down", "Left"]`, összesen 4.

### 2.2 NEAT tanító script – train_neat.py

- **Fájl:** `ai_service/training/train_neat.py`
- Fő elemek:
  - `make_env(rows, cols)` – enyhén ételorientált rewarddal ellátott `SnakeEnv` NEAT-hez:
    - `reward_food=1.0`, `reward_survival=0.01`, `reward_starvation=-0.5`, `max_steps_per_episode=2000`.
  - `eval_genome(genome, config, rows, cols, episodes=5)`:
    - Létrehoz egy feedforward hálót: `neat.nn.FeedForwardNetwork.create(genome, config)`.
    - Több epizódot futtat:
      - bemenet: 12 dimenziós `state_to_observation(state)`,
      - kimenet: 4 neuron, `argmax` → akció index (Up/Right/Down/Left),
      - fitnesz: összesített reward/epizód + `score * 10`.
  - `eval_genomes(genomes, config, rows, cols)` – NEAT API által elvárt függvény; minden genomhoz beállítja a `genome.fitness` értéket.
  - Konfiguráció:
    - `neat_config_snake.ini` automatikus generálása, ha nem létezik (input=12, output=4, teljesen kapcsolt kezdőháló, alap NEAT paraméterek).
  - Tanítás:
    - `pop = neat.Population(config)`, reporterek (`StdOutReporter`, `StatisticsReporter`),
    - `winner = pop.run(eval_genomes, n=generations)`.
  - Mentés és globális best kezelés:
    - `models/neat_snake_best.pkl` – tartalmazza a `winner` genomot és a használt `config_path`.
    - `models/neat_snake_best_meta.json` (pickle formátum) – `{"best_fitness": ...}`:
      - új futás végén kiolvassa a korábbi `best_fitness` értéket,
      - csak akkor írja felül a `neat_snake_best.pkl`-t és a meta fájlt, ha az aktuális `winner.fitness` **nagyobb**, mint a korábbi best,
      - így egy gyengébb NEAT futás **nem írhatja felül** a korábban elért legjobb modellt (ugyanaz az elv, mint a PPO `best_meta` kezelésénél).

### 2.3 NEAT alapú stratégia – NEATStrategy

- **Fájl:** `ai_service/src/strategies/neat_strategy.py`
- **Osztály:** `NEATStrategy(Strategy)`:
  - Betölti a `models/neat_snake_best.pkl` fájlt, benne:
    - `genome` (legjobb egyed),
    - `config_path` (NEAT config útvonala).
  - A betöltés után létrehoz egy feedforward hálót:
    - `net = neat.nn.FeedForwardNetwork.create(genome, config)`.
  - `next_move(state)`:
    - `obs = state_to_observation(state)`,
    - `out = net.activate(obs)` → 4 kimeneti érték,
    - tiltja a 180°-os fordulatot (aktuális iránnyal ellentétes akció kap nagyon negatív score-t),
    - `argmax` az érvényes akciók között,
    - visszaadja az `ACTION_NAMES[action_idx]` irányt.
  - Ha nincs modell, vagy hiba történik: **Greedy fallback**.

### 2.4 Stratégia regisztráció

- **Fájl:** `ai_service/src/strategies/__init__.py`
- Import:
  - `from .neat_strategy import NEATStrategy`
- Export:
  - `__all__` kiegészítve: `"NEATStrategy"`.
- STRATEGIES mapping:
  - `"neuroevolution": NEATStrategy` – a webes konfigurációban a `neuroevolution` kulcs már a valódi NEAT stratégia lesz (nem a placeholder).

### 2.5 Függőségek

- **Fájl:** `ai_service/requirements.txt`
- Hozzáadva:

```txt
neat-python>=0.92
```

---

## 3. Futtatási parancsok

### 3.1 NEAT tanítás (alap beállítás)

Az **ai_service** mappából, venv aktiválva:

```bash
python training/train_neat.py --rows 20 --cols 20 --generations 50
```

- 20×20 rács.
- 50 generáció NEAT tanítás.
- A tanítás közben a `StdOutReporter` kiírja a generációk közbeni fitneszeket.
- A végén a legjobb genom mentésre kerül: `models/neat_snake_best.pkl`.

Log fájlba (pl. szakdolgozathoz):

```bash
python training/train_neat.py --rows 20 --cols 20 --generations 50 > ..\docs\neat_results.txt
```

### 3.2 Konfigurációs paraméterek

- `--rows`, `--cols` – rács mérete (alap: 20×20).
- `--generations` – generációk száma (alap: 50).
- `--config` – NEAT config fájl útvonala (alap: `training/neat_config_snake.ini`, automatikusan generálva, ha hiányzik).
- `--model-dir` – modellek könyvtára (alap: `models`).

---

## 4. Eredmények és értelmezés

### 4.1 Tanítási eredmény – 50 generáció, 20×20

Parancs:

```bash
python training/train_neat.py --rows 20 --cols 20 --generations 50 > ..\docs\neat_results.txt
```

Tanítás végén (log vége):

```
Winner fitness this run: 37.10 (previous best: -inf)
Saved new best NEAT genome to models\neat_snake_best.pkl (best_fitness=37.10)
```

- A futás **50 generációig** tartott, a legjobb genom fitness-e **37.10** lett.
- A fitnesz definíció: epizódonkénti összjutalom + `score * 10`, így a 37.10-es érték azt jelenti, hogy a háló már **szerez ételt** (nem csak túlél), de a pontos átlagos score/steps értékeket külön eval mutatja meg.
- A `neat_snake_best.pkl` és a `neat_snake_best_meta.json` (best_fitness) alapján a script **globális bestet** tart fenn: későbbi, gyengébb futások nem írják felül ezt a modellt.

### 4.2 Eval eredmények (eval_neat.py)

Kiértékelés (50 epizód, 20×20), a `models/neat_snake_best.pkl` modellre:

```bash
python training/eval_neat.py --rows 20 --cols 20 --episodes 50
```

Konkrét futás (50 epizód, 20×20):

```text
Eval NEAT (50 episodes): mean_reward=101.66, mean_score=9.48, mean_steps=4659.0
```

Értelmezés:

- **mean_score = 9.48** – a NEAT stratégia átlagosan ~9.5 ételt szerez epizódonként.
  - Összehasonlítás:
    - DQN: ~48 pont (mean100, jóval erősebb játék),
    - PPO: ~0.7–1.6 (gyenge ételfókusz),
    - NEAT: ~9.5 – érezhetően jobb, mint a PPO, de jelentősen elmarad a DQN-től.
- **mean_steps = 4659.0** – az epizódok nagyon hosszúak (max 5000 lépésig futnak); a háló képes sokáig életben maradni, miközben közben ételt is gyűjt.
- **mean_reward = 101.66** – a reward shaping (survival + food + score*10) kombinációjából adódik; a pontos összehasonlításhoz a score a legbeszédesebb.

Összkép: a NEAT modell „középutas” teljesítményt ér el:
- jobb, mint a PPO (nehezen tanítható policy-gradiens módszer ebben a beállításban),
- de nem közelíti meg a DQN szintjét.

---

## 5. Összefoglaló

- A NEAT megközelítés ugyanarra a `SnakeEnv`/`state_to_observation` párosra épül, mint a DQN/PPO.
- A `train_neat.py` script evolvál egy kis feedforward hálót, a legjobb genomot `neat_snake_best.pkl` formájában menti.
- A `NEATStrategy` betölti a legjobb hálót, és inference során ugyanúgy akciót választ, mint a DQN/PPO stratégiák.
- A szakdolgozatban a NEAT eredményei közvetlenül összehasonlíthatók a DQN/PPO és a heurisztikus stratégiákkal, bemutatva az RL és neuroevolution közti különbségeket (tanítási stabilitás, hangolási igény, elért score).

