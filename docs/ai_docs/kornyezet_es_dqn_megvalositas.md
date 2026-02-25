# Snake környezet és DQN megvalósítás – részletek

Ez a dokumentum a **rl_es_neuroevolution_tanitas_terv.md** első két részének (1. Snake környezet, 2. DQN) megvalósítását írja le: milyen fájlok készültek, hogyan működnek, és mire kell figyelni.

---

## Rács méret: 20×20 (alapértelmezett)

**Igen:** a környezet és a DQN tanítás alapértelmezetten **20×20** rácson fut, ugyanúgy, mint a játékban.

- **Frontend (játék):** a mentett konfig alapértelmezett rács mérete `grid: { rows: 20, cols: 20 }` (pl. `frontend/src/io/config.ts`).
- **SnakeEnv:** konstruktor alapértelmezettje `rows=20`, `cols=20`.
- **train_dqn.py:** parancssori argumentumok alapértelmezettje `--rows 20`, `--cols 20`.

Ha más méretet használsz a játékban (pl. Beállításokban 15×15), a tanított DQN modell továbbra is 20×20-es tanításra lett betanítva, kivéve ha explicit `--rows` / `--cols`-t adtál a tanításnál. A megfigyelés (observation) mindig a **konkrét** `state.rows` és `state.cols` alapján készül, tehát inference-nél (AI szolgáltatás) a frontend által küldött rács méretét használja a modell; a 12 dimenziós jellemzők (fal távolság, étel relatív, stb.) normalizáltak, így eltérő méretű pályán is működhet, de a legjobb eredmény a tanítási méretre (20×20) várható.

---

## 1. Snake környezet (Gym-szerű)

### 1.1 Fájlok és hely

| Fájl | Cél |
|------|-----|
| `ai_service/src/env/__init__.py` | Export: `SnakeEnv`, `state_to_observation`, `OBSERVATION_DIM`, `ACTION_NAMES` |
| `ai_service/src/env/snake_env.py` | Környezet logika, megfigyelés, reset, step |

A környezet a meglévő **`src/state.py`**-t használja: `GameState`, `simulate_step`, `DELTA`, irányok.

### 1.2 Interfész

- **`reset(seed=None)`**  
  - Vissza: `(observation, info)`.  
  - Kezdőállapot: 3 cellás kígyó (középen, vízszintesen), irány Jobbra, egy étel véletlen üres cellán (seed alapján reprodukálható).  
  - `info`: pl. `{"score": 0, "tick": 0}`.

- **`step(action: int)`**  
  - `action`: 0 = Up, 1 = Right, 2 = Down, 3 = Left.  
  - Vissza: `(observation, reward, done, info)`.  
  - A környezet **nem** tiltja az ellentétes irányt (180°); a halálos lépésnél `done=True`, negatív reward.

- **`observation_space`**  
  - `{"shape": (12,), "dtype": "float32"}` (jellemző alapú vektor).

- **`action_space`**  
  - `{"n": 4, "names": ["Up", "Right", "Down", "Left"]}`.

### 1.3 Megfigyelés (observation) – 12 float, jellemző alapú

A **`state_to_observation(state: GameState)`** ugyanazt a reprezentációt adja, amit a környezet használ, és amit a DQN inference is (stratégia `next_move`).

| Index | Tartalom | Megjegyzés |
|-------|----------|------------|
| 0–3   | Veszély (Up, Right, Down, Left) | 1.0 ha fal vagy kígyótest **1–2 lépésen** belül, különben 0.0 |
| 4–7   | Fal távolság (4 irány) | Lépések a falig, normalizálva: `min(dist, max(rows,cols)) / max(rows,cols)` → [0, 1] |
| 8, 9  | Étel relatív | `(food.x - head.x)/cols`, `(food.y - head.y)/rows`; nincs étel → 0, 0 |
| 10    | Étel Manhattan távolság | `manhattan / (rows+cols)`; nincs étel → 1.0 |
| 11    | Kígyó hossz | `len(snake) / (rows*cols)` |

Konstans: **`OBSERVATION_DIM = 12`**. A DQN háló bemenete és a konfig fájl `obs_dim` mezője erre épül.

### 1.4 Jutalom (reward)

| Esemény | Jutalom (alapértelmezett) |
|---------|---------------------------|
| Ételt evett | +1.0 |
| Halál (fal vagy önütközés) | -10.0 |
| Lépés közelebb az ételhez (Manhattan) | +0.01 |
| Lépés távolabb az ételtől | -0.01 |
| Egyéb lépés | 0.0 |

A konstruktorban opcionálisan átadható: `reward_food`, `reward_death`, `reward_step_toward`, `reward_step_away`.

### 1.5 Ételfeldolgozás

- A **state.py** `simulate_step` étel evéskor `food=None`-t ad vissza.  
- A **környezet** ilyenkor **új ételt spawnol**: véletlen üres cella (`_random_empty_cell`), a környezet saját `Random` generatorával (seed → reprodukálhatóság).

### 1.6 Tesztelés

- **Futtatás:** az **ai_service** mappából, a `src` package-ként legyen elérhető (pl. a projekt gyökérből vagy `PYTHONPATH`-tal):  
  `python -m src.env.snake_env`
- A script 100 véletlen lépést hajt végre, majd reset; ellenőrzi, hogy a megfigyelés 12 elemű, és halál esetén `done=True` és negatív reward.

---

## 2. DQN megvalósítás

### 2.1 Fájlok és hely

| Fájl | Cél |
|------|-----|
| `ai_service/training/train_dqn.py` | DQN tanítás: replay buffer, policy/target háló, epsilon-greedy, mentés |
| `ai_service/src/strategies/dqn.py` | DQN stratégia: modell betöltés, `next_move` (state → obs → Q → argmax → Direction), fallback |
| `ai_service/models/` | Mentett modell: `dqn_snake.pt`, `dqn_snake_config.json` (a mappa `.gitkeep`-pel létezik; a nagy fájlok .gitignore-ban) |

### 2.2 Tanítási script (train_dqn.py)

- **Függőség:** PyTorch, numpy. A script a saját `sys.path`-ját állítja, hogy az **ai_service** mappából futtatva az `env` és a környezet importálható legyen.
- **Háló:** `DQN(obs_dim=12, n_actions=4, hidden=(128, 128))` – MLP: 12 → 128 → ReLU → 128 → ReLU → 4 (Q értékek).
- **Algoritmus:** DQN, replay buffer (kapacitás 50 000), target network (minden 200 lépésben másolva), epsilon-greedy (epsilon 1.0-ról 0.05-re lineárisan csökken az epizódok során).
- **Hiperparaméterek (kezdés):** batch_size=64, gamma=0.99, lr=1e-3, target_update_every=200, save_every=500.
- **Környezet:** `SnakeEnv(rows=args.rows, cols=args.cols)` – alapértelmezett **20×20**.
- **Mentés:**
  - **Legjobb modell:** ha az utolsó 100 epizód átlagos rewarda jobb, mint az eddigi legjobb → `models/dqn_snake.pt` + `models/dqn_snake_config.json`.
  - **Checkpoint:** `save_every` epizódonként is ment (ugyanaz a fájlnév).
- **Konfig fájl** (`dqn_snake_config.json`): `obs_dim`, `n_actions`, `hidden` (pl. `[128, 128]`) – az inference ebből építi újra a hálót.

**Futtatás (ai_service mappából):**

```bash
pip install -r requirements.txt
python training/train_dqn.py --episodes 3000
```

Opcionális argumentumok: `--rows 20`, `--cols 20`, `--seed 42`, `--model-dir models`.

### 2.3 Inference – DQN stratégia (dqn.py)

- **Betöltés:** indításkor vagy első `next_move` előtt. Keresi a modellt a **models** mappában (vagy a **DQN_MODEL_DIR** környezeti változóban megadott könyvtárban): `dqn_snake.pt` + `dqn_snake_config.json`. A háló szerkezetét a config alapján építi (ugyanaz a 12 → 128 → 128 → 4), majd betölti a `state_dict`-et.
- **PyTorch:** opcionális függőség; ha nincs torch, vagy nincs meg a két fájl, a stratégia **Greedy (biztonság első)** fallbacket használ.
- **next_move(state: GameState):**
  1. `state_to_observation(state)` → 12 elemű lista (ugyanaz a konverzió, mint a környezetben és a tanításnál).
  2. Tensorré alakítás, `model(x)`, `argmax` a 4 Q érték közül → akció index 0..3.
  3. `ACTION_NAMES[action]` → `"Up"` | `"Right"` | `"Down"` | `"Left"` (Direction).

### 2.4 Stratégia regisztráció

- A **`src/strategies/__init__.py`** a **DQNStrategy**-t a **dqn** modulból importálja (nem a rl_stubs-ból). A **rl_stubs** csak a PPO és a Neuroevolution placeholder marad.
- A **dqn** stratégia a frontend/WebSocket szempontjából ugyanúgy elérhető, mint korábban (pl. `strategy=dqn`).

---

## 3. Egyéb érintett fájlok

- **requirements.txt:** `torch>=2.0.0`, `numpy>=1.24.0` (DQN tanítás és inference).
- **.gitignore (ai_service):** `models/*.pt`, `models/*.pth`, `models/*.zip`, `models/*.pkl`, `__pycache__/`, `*.pyc` – a betanított modellek nem kerülnek verziókövetésbe.
- **models/.gitkeep:** a `models` mappa létezik, hogy a mentés mindig találjon könyvtárat.
- **README.md (ai_service):** rövid szekció a RL környezetről és a DQN tanításról (környezet, parancs, fallback, teszt).

---

## 4. Összefoglaló

- A **környezet** és a **DQN tanítás** alapértelmezetten **20×20** rácson fut, illeszkedve a játék alapértelmezett rácsához.
- A megfigyelés **jellemző alapú**, 12 dimenziós; a jutalom az ételre, halálra és az étel felé/tőle távolodásra épül.
- A tanítás **train_dqn.py**-val futtatható; a mentett modell és config a **dqn** stratégia által betöltődik, ha elérhető, különben Greedy fallback.
- A PPO és a Neuroevolution a terv szerint később, külön commitokban implementálhatók; a környezet és a 12 dimenziós observation már közös alapot ad nekik.
