# DQN, PPO és Neuroevolution tanítások – megvalósítási terv

Ez a dokumentum a docs/ai_docs-ban felsorolt RL és neuroevolution stratégiák **tanításának** és **valódi megvalósításának** lépéseit írja le. A jelenlegi placeholder stratégiák (Greedy fallback) helyett betanított modellek kerülnek betöltésre és inference-re az ai_service-ben.

---

## 1. Áttekintés és sorrend

| Stratégia        | Keretrendszer / könyvtár   | Nehézség | Ajánlott sorrend |
|------------------|----------------------------|----------|-------------------|
| **Környezet**    | Saját (Gym-szerű API)      | Közepes  | 1. (közös alap)   |
| **DQN**          | PyTorch vagy TensorFlow    | Magas    | 2.                |
| **PPO / A2C**    | Stable-Baselines3          | Magas    | 3.                |
| **Neuroevolution** | NEAT (neat-python)       | Közepes  | 4.                |

A **Snake környezet** (step, reset, state, action, reward) egyszer készül el, és mindhárom megközelítés ezt használja. A tanítások külön scriptekben (pl. `train_dqn.py`, `train_ppo.py`, `train_neat.py`) futnak; a betanított modellek fájlokba kerülnek, az ai_service pedig betöltés után ezekkel válaszol.

---

## 2. Közös alap: Snake környezet (Gym-szerű)

### 2.1 Cél

- Egy **állapot–akció–jutalom** interfész, amit a meglévő `state.py` és `simulate_step` kihasznál.
- **Reset:** fix vagy random seed, üres pálya, 3 cellás kígyó, egy étel.
- **Step(action):** irány (0=Up, 1=Right, 2=Down, 3=Left), szimuláció egy lépés, vissza: (observation, reward, done, info).

### 2.2 Állapot reprezentáció (observation)

A RL/NEAT számára **fix méretű, numerikus** vektor kell. Javaslat:

- **Rács alapú (egyszerű):** `rows * cols` vagy kisebb rács, cella értékek: üres=0, kígyó=1, fej=2, étel=3. Lapos vektor (pl. 20×20 → 400 elem).
- **Jellemző alapú (kompakt):** relatív irány az ételre (bal/jobb/egyenes, távolság), fal távolság 4 irányban, „veszély” 4 irányban (kígyótest vagy fal 1–2 lépésen belül). Pl. 8–12 szám → kisebb háló, gyorsabb tanulás.

Kezdetben érdemes a **jellemző alapú** reprezentációval indulni (kevesebb input, gyorsabb konvergencia), opcionálisan később CNN + rács.

### 2.3 Akció és jutalom

- **Akció:** diszkrét 4: Up, Right, Down, Left. A jelenlegi iránynál az ellentétes irány tiltott (vagy a környezet automatikusan szűri).
- **Jutalom (javaslat):**
  - Ételt evett: **+1** (vagy +10 skálázva).
  - Halál (fal vagy önütközés): **-10** (vagy -1, de jól elkülönüljön).
  - Lépés étel felé közelebb: **+0.01** (opcionális, gyorsabb tanulás).
  - Lépés ételtől távolabb: **-0.01** (opcionális).
  - Egyéb lépés: **0**.

### 2.4 Fájlok és hely

- **Új mappa:** `ai_service/src/env/` vagy `ai_service/training/`.
- **Fájl:** `snake_env.py` (vagy `env/snake_env.py`):
  - `SnakeEnv` osztály: `reset(seed=None)`, `step(action)`, `observation_space`, `action_space`.
  - Belsőleg használja a meglévő `GameState` és `simulate_step` (state.py)-t; a környezet csak a játék logikát hívja és az observation/reward/done-t adja vissza.

### 2.5 Tesztelés

- Rövid script: 100 random lépés, reset, ellenőrzés, hogy a done és reward értelmes (pl. halál esetén done=True, reward negatív).

---

## 3. DQN megvalósítás

### 3.1 Függőségek

- **PyTorch** (vagy TensorFlow/Keras): `pip install torch` (és esetleg `tensorboard`).
- Opcionális: **Gym** (`gym` vagy `gymnasium`) csak akkor kell, ha a környezetünket Gym-ként akarjuk regisztrálni; a Stable-Baselines3-nál hasznos. Egyébként elég a saját `SnakeEnv` a közös `step`/`reset` interfésszel.

### 3.2 Háló és algoritmus

- **Input:** observation dimenzió (pl. 12 ha jellemző alapú).
- **Output:** 4 neuron (Q értékek: Up, Right, Down, Left); `argmax` = választott irány.
- **Algoritmus:** DQN (replay buffer, target network, epsilon-greedy). Epsilon: 1.0 → 0.05 (vagy 0.1) lineárisan csökken az epizódok során.
- **Hiperparaméterek (kezdés):** batch_size=64, gamma=0.99, lr=1e-3, buffer_size=50_000, target update minden 100–500 lépésben.

### 3.3 Tanítási script

- **Fájl:** `ai_service/training/train_dqn.py` (vagy `scripts/train_dqn.py`).
- Ciklus: reset → step(epsilon-greedy action) → store transition → sample batch → gradient step → periódikus target update.
- **Mentés:** minden N epizód vagy ha átlagos reward rekord: `torch.save(model.state_dict(), "models/dqn_snake.pt")` (vagy `.pth`). Konfig (observation dim, hidden sizes) külön json-ban vagy a fájlnévben, hogy a betöltés tudja a struktúrát.

### 3.4 Inference az ai_service-ben

- **Fájl:** `ai_service/src/strategies/dqn.py` (a jelenlegi `rl_stubs.py` DQN részét kicserélni vagy egy „valódi” modulra bővíteni).
- Betöltés indításkor vagy első kéréskor: `model.load_state_dict(torch.load(path))`, `model.eval()`.
- `next_move(state)`: state → observation vektor (ugyanaz a konverzió, mint a tanításnál) → `model(obs)`, `argmax` → Direction.
- Ha a modell fájl nincs (pl. még nem tanították): fallback marad a Greedy stratégia.

### 3.5 Mérés és dokumentáció

- Tanítási görbe: epizód reward (átlag 10–100 epizódra), optional: loss. Logolás: konzol vagy TensorBoard.
- A dokumentációban: rövid leírás (állapot, jutalom, háló), egy példa tanítási parancs, egy grafikon vázlat (reward vs epizód).

---

## 4. PPO / A2C (Stable-Baselines3)

### 4.1 Függőségek

- **Stable-Baselines3:** `pip install stable-baselines3`
- **Gym kompatibilitás:** SB3 Gym (vagy Gymnasium) env-et vár: `reset()` → (obs, info), `step(action)` → (obs, reward, terminated, truncated, info). A saját `SnakeEnv`-et e formátumra kell hozni (terminated=done, truncated=False ha nincs időlimit, vagy időlimit esetén truncated=True).

### 4.2 Környezet regisztrálás

- Ha `gym` vagy `gymnasium` van: `register(id="SnakeEnv-v0", entry_point="...SnakeEnv")`, majd `gym.make("SnakeEnv-v0")`.
- Vagy közvetlenül: `model = PPO("MlpPolicy", SnakeEnv(), ...)` a saját `SnakeEnv` példánnyal, ha az implementálja a szükséges metódusokat (observation_space, action_space, reset, step).

### 4.3 Tanítás

- **Fájl:** `ai_service/training/train_ppo.py`.
- `PPO("MlpPolicy", env, verbose=1, ...)` – MlpPolicy elegenő kezdéshez (MLP az observation felett).
- `model.learn(total_timesteps=100_000)` (vagy 500k–1M a jobb eredményért).
- **Mentés:** `model.save("models/ppo_snake")` → .zip fájl (SB3 saját formátum).

### 4.4 Inference az ai_service-ben

- **Fájl:** `ai_service/src/strategies/ppo.py` (a stub helyett valódi implementáció).
- `from stable_baselines3 import PPO; model = PPO.load("models/ppo_snake.zip")`.
- `next_move(state)`: state → observation → `model.predict(obs, deterministic=True)[0]` → akció index 0..3 → Direction.
- Ha a .zip nincs: Greedy fallback.

### 4.5 Opcionális

- A2C ugyanígy, csak `from stable_baselines3 import A2C` és A2C tanítás/mentés/betöltés. A terv és a doksi külön említheti a PPO-t és az A2C-t.

---

## 5. Neuroevolution (NEAT)

### 5.1 Függőségek

- **neat-python:** `pip install neat-python`
- Nincs PyTorch/TF; a NEAT saját rétegeket és súlyokat evolvál.

### 5.2 Konfiguráció

- **Fájl:** `ai_service/training/neat_config.txt` (NEAT példa konfig).
- Input neuronok: observation dim (pl. 12).
- Output: 4 (Up, Right, Down, Left); softmax vagy argmax a legnagyobb kimenetre.
- Populáció: 50–100, generációk: 50–200.

### 5.3 Fitness

- Egy egyed = egy háló (genome → phenotype). Egy epizód: reset → step(action) a háló kimenete szerint, amíg done. **Fitness = összesített reward** (pl. score*1 + lépésszám*0.01, vagy egyszerűen score + lépésszám bónusz, hogy ne álljon meg).
- Minden egyedre 1–3 futás (különböző seed), átlag fitness.

### 5.4 Tanítási script

- **Fájl:** `ai_service/training/train_neat.py`.
- NEAT `Population(config)`, `population.run(fitness_fn, generations)`.
- A fitness függvény: adott genome-példányhoz futtat egy (vagy több) epizódot a SnakeEnv-vel, a választott akciót a genome háló adja; visszaadja az átlagos rewardot/fitnesset.
- **Mentés:** a nyerő genome-ot és a hálót (súlyok, topológia) menteni kell. A neat-python képes pickle-elni a legjobb genome-ot; vagy a „winner” genome-ot és a konfigot elmentjük, inference-nél ezt töltjük be és phenotype-et készítünk belőle.

### 5.5 Inference az ai_service-ben

- **Fájl:** `ai_service/src/strategies/neuroevolution.py` (stub helyett valódi).
- Betöltés: konfig + winner genome (pl. pickle), `neat.nn.FeedForwardNetwork.create(genome, config)`.
- `next_move(state)`: state → observation → `net.activate(obs)` → 4 kimenet, argmax → Direction.
- Ha nincs mentett genome: Greedy fallback.

---

## 6. Fájlstruktúra javaslat

```
ai_service/
├── requirements.txt          # + torch, stable-baselines3, neat-python, gym (ahol kell)
├── src/
│   ├── state.py              # már létezik, simulate_step
│   ├── env/
│   │   ├── __init__.py
│   │   └── snake_env.py      # SnakeEnv: reset, step, observation_space, action_space
│   └── strategies/
│       ├── dqn.py            # DQNStrategy: load model, state→obs→action (vagy rl_stubs bővítése)
│       ├── ppo.py            # PPOStrategy: SB3 load, predict
│       ├── neuroevolution.py # NEATStrategy: load genome+config, FeedForwardNetwork
│       └── rl_stubs.py       # marad placeholder, vagy csak fallback import
├── training/
│   ├── train_dqn.py
│   ├── train_ppo.py
│   ├── train_neat.py
│   └── neat_config.txt
└── models/                   # .gitignore-ban, nem verziózzuk a nagy fájlokat
    ├── dqn_snake.pt
    ├── ppo_snake.zip
    └── neat_winner.pkl       # vagy winner + config
```

---

## 7. Lépéssorrend (implementációs sorrend)

1. **Snake környezet** – `env/snake_env.py`: observation (jellemző alapú), reward, done, step/reset. Teszt: random agent 100 lépés.
2. **DQN** – háló (PyTorch), replay buffer, epsilon-greedy, train_dqn.py, mentés. Majd ai_service DQNStrategy: betöltés + state→obs→action.
3. **PPO** – SnakeEnv SB3-kompatibilissé tétele, train_ppo.py, model.save. Majd PPOStrategy: load, predict.
4. **NEAT** – neat_config.txt, fitness függvény (env + genome), train_neat.py, winner mentés. Majd NEATStrategy: load genome, create net, activate.

---

## 8. Szakdolgozat és mérés

- **Tanulási görbék:** epizód reward (átlag) vs lépés/epizód mindhárom megközelítéshez; rövid táblázat (végső átlag score, max score, konvergencia sebesség).
- **Összehasonlítás:** A* és Hamilton (heurisztika) vs DQN / PPO / NEAT (betanított) – fix seed(ek), N futás, átlag és szórás.
- **Reprodukálhatóság:** seed dokumentálása, Python/csomag verziók (requirements.txt), parancsok a dokumentációban (pl. `python training/train_dqn.py --episodes 5000`).

---

## 9. Összefoglaló

| Tevékenység            | Fájl / hely            | Kimenet / cél                    |
|------------------------|------------------------|----------------------------------|
| Snake env              | `src/env/snake_env.py` | step, reset, obs, reward, done   |
| DQN tanítás            | `training/train_dqn.py`| `models/dqn_snake.pt`            |
| DQN inference          | `src/strategies/dqn.py`| next_move betanított modellel    |
| PPO tanítás            | `training/train_ppo.py`| `models/ppo_snake.zip`           |
| PPO inference          | `src/strategies/ppo.py`| next_move SB3 modellel           |
| NEAT tanítás           | `training/train_neat.py` + config | `models/neat_winner.pkl` |
| NEAT inference         | `src/strategies/neuroevolution.py` | next_move NEAT hálóval   |

A terv szerint először a környezet és egy stratégia (pl. DQN) érdemes teljes körűen megcsinálni; utána a PPO és a NEAT ugyanazt az env-et használva gyorsabban implementálható.
