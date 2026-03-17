# Benchmark – MI stratégiák mérése (spec 7.11, 7.15)

Fix seed-del N futás, metrikák: átlag/medián pont és lépésszám, halálok megoszlása, „első étel” elérési arány.

## Futtatás (heurisztikák – régi benchmark)

A projekt gyökeréből (`snake_projekt`):

```bash
python benchmarks/run_benchmark.py --runs 100 --strategy both
```

Paraméterek:

- `--runs 100` – futások száma (alap: 100)
- `--rows 20`, `--cols 20` – rács méret
- `--max-steps 5000` – lépéslimit egy játékban
- `--strategy astar | hamilton | both` – melyik stratégiát futtassa (alap: both)
- `--seed-base 42` – első seed
- `--out-dir benchmarks/results` – kimenet mappája

## Kimenet

- `benchmarks/results/benchmark_astar.json` – A* futások és összesítő
- `benchmarks/results/benchmark_hamilton.json` – Hamilton futások és összesítő
- `benchmarks/results/benchmark_summary.json` – csak az összesítők (összehasonlításhoz)

Összesítő mezők: `score_mean`, `score_median`, `steps_mean`, `steps_median`, `death_counts`, `reached_first_food` (%).

---

## Egységes benchmark – heurisztikák + DQN + PPO + NEAT

Az `ai_service/src/strategies/__init__.py` `STRATEGIES` mappingjében szereplő legtöbb stratégia (pl. `greedy`, `max_safety`, `hamilton`, `astar`, `dqn`, `ppo`, `neuroevolution`) ugyanarra a `GameState` reprezentációra épül. A `run_strategy_benchmark.py` script ezekre ad **egységes statisztikát**.

### Futtatás

A projekt gyökeréből (`snake_projekt`):

```bash
python benchmarks/run_strategy_benchmark.py --runs 200
```

Alapértelmezett stratégiák:

- `greedy`
- `max_safety`
- `hamilton`
- `astar`
- `dqn`
- `ppo`
- `neuroevolution` (NEAT)

Saját lista megadása:

```bash
python benchmarks/run_strategy_benchmark.py --runs 500 --strategies greedy,hamilton,dqn,ppo,neuroevolution
```

Paraméterek:

- `--runs` – futások száma stratégiánként (pl. 100–1000).
- `--rows`, `--cols` – rács mérete (alap: 20×20).
- `--max-steps` – lépéslimit egy játékban (alap: 5000).
- `--strategies` – vesszővel elválasztott STRATEGIES kulcsok (pl. `greedy,hamilton,dqn,ppo,neuroevolution`).
- `--seed-base` – első seed (alap: 42).
- `--out-dir` – kimeneti mappa (alap: `benchmarks/results`).

### Kimenet

- `benchmarks/results/strategy_benchmark_<strategy>.json` – futásonkénti adatok + összefoglaló minden stratégiára.
- `benchmarks/results/strategy_benchmark_summary.json` – csak az összefoglalók, könnyen behúzható a szakdolgozati táblázatokhoz / diagramokhoz.

Összesítő mezők stratégiánként:

- `score_mean`, `score_median`
- `steps_mean`, `steps_median`
- `death_counts` – halálok száma típusa szerint (`wall`, `self`, `max_steps`)
- `reached_first_food` – hány százalékban evett legalább egyszer (>=1 pont).

Ezek segítségével a szakdolgozatban egy egységes táblázatban / grafikonon összehasonlítható:

- heurisztikus stratégiák (A*, Hamilton, Greedy, MaxSafety, stb.),
- RL alapú stratégiák (DQN, PPO),
- neuroevolution (NEAT).
