# Benchmark eredmények – részletes kiértékelés

## 1. Kiindulási adatok és mérési protokoll

A kiértékelés az alábbi futásokon alapul:

```bash
python benchmarks/run_strategy_benchmark.py --runs 500 --strategies greedy,hamilton,max_safety,astar,bfs,follow_tail,lookahead,lookahead_3,lookahead_5,minimax
python benchmarks/run_strategy_benchmark.py --runs 200 --strategies dqn,ppo,neuroevolution
```

Közös benchmark beállítások:

- Pályaméret: `20x20`
- `max_steps`: 5000
- Starvation limit: 400 lépés étel nélkül
- Fix seed-sorozat (`seed_base=42`)

Adatforrás:

- `benchmarks/results/strategy_benchmark_*.json`
- `benchmarks/results/strategy_benchmark_summary.json` (utolsó futás összegzése)

---

## 2. Deszkriptív elemzés

## 2.1 Heurisztikák (500 futás/stratégia)

| Stratégia | score_mean | score_median | steps_mean | reached_first_food (%) |
|---|---:|---:|---:|---:|
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

Fő megfigyelések:

- **LookAhead** a legerősebb heurisztika (kimagasló score, 100% first_food).
- **A\***, **FollowTail**, **BFS** stabil felső-közép mezőny.
- **Hamilton** erős, de pontszámban elmarad a legjobb lookahead/alapú módszerektől.
- **Greedy / MaxSafety / LookAhead_5** gyakorlatilag „starvation domináns”, nagyon alacsony score.

## 2.2 Tanuló módszerek (200 futás/stratégia)

| Stratégia | score_mean | score_median | steps_mean | reached_first_food (%) |
|---|---:|---:|---:|---:|
| neuroevolution (NEAT) | 7.38 | 5 | 1027.16 | 90.5 |
| ppo | 2.08 | 2 | 384.67 | 66.0 |
| dqn | 0.17 | 0 | 403.36 | 12.5 |

Fő megfigyelések:

- **NEAT** a tanuló módszerek között a legerősebb a jelenlegi benchmarkon.
- **PPO** mérsékelt teljesítményt ad (eszik, de kevés pontot ér el).
- **DQN** ebben a konkrét benchmark setupban gyenge (szinte tisztán starvation profil).

---

## 3. Összehasonlítás: hatékonyság vs robusztusság

## 3.1 Hatékonyság (score)

- Top stratégia: **lookahead** (92.75).
- Heurisztikák általában jelentősen jobbak, mint a mostani tanuló modellek.
- Tanuló módszerek közül **NEAT > PPO > DQN**.

## 3.2 Robusztusság (median, first_food, death profile)

- Magas first_food% + magas median score = robusztus stratégia.
- A* / BFS / FollowTail / Hamilton / LookAhead ebben erősek.
- DQN és Greedy/MaxSafety: alacsony first_food + sok starvation => nem robusztus ételkeresés.

## 3.3 Halálok profil röviden

- **Greedy / MaxSafety / DQN**: gyakorlatilag csak `starvation`.
- **PPO / NEAT**: domináns starvation, de már van `self`/`wall` is (aktívabb mozgás).
- **A*/BFS/FollowTail/Hamilton**: főként `self` és `wall`, starvation gyakorlatilag nincs.

Szakmai értelmezés:

- A starvation domináns profil nem feltétlen „jó túlélés”, inkább azt jelzi, hogy a stratégia nem hatékonyan konvertálja a lépéseket pontszerzésre.
- A magasabb `self` arány gyakran együtt jár agresszívebb ételkereséssel (nagyobb kockázatért több pont).

---

## 4. Módszertani megjegyzések és korlátok

Fontos korlát: a heurisztikák 500 runnal, a tanuló módszerek 200 runnal lettek mérve.

Ez **nem teszi érvénytelenné** az eredményt, de összehasonlításnál jelezni kell:

- A különböző runs szám miatt a bizonytalanság eltérő lehet.
- Erős publikációs verzióhoz érdemes legalább egy közös kontroll futást is készíteni (pl. minden stratégia 200 runnal).

Javasolt záró ellenőrzés:

```bash
python benchmarks/run_strategy_benchmark.py --runs 200 --strategies greedy,hamilton,max_safety,astar,bfs,follow_tail,lookahead,lookahead_3,lookahead_5,minimax,dqn,ppo,neuroevolution
```

---

## 5. Javasolt grafikonok (publikációra alkalmas készlet)

Készített script:

- `benchmarks/generate_benchmark_plots.py`

Futtatás:

```bash
python benchmarks/generate_benchmark_plots.py
```

Kimenet:

- `benchmarks/results/plots/score_mean_bar.png`
- `benchmarks/results/plots/score_distribution_boxplot.png`
- `benchmarks/results/plots/death_distribution_stacked.png`
- `benchmarks/results/plots/score_vs_steps_scatter.png`

Mit mutatnak:

- **score_mean_bar**: gyors rangsor.
- **boxplot**: stabilitás, szórás, outlier érzékenység.
- **death stacked**: viselkedésprofil (`wall/self/starvation/max_steps`).
- **scatter (score vs steps)**: túlélés és pontszerzés trade-off.

---

## 6. Következtetések (jelen projektállapot)

1. A benchmark alapján a legerősebb stratégiák jelenleg heurisztikusak (különösen `lookahead`, `astar`, `follow_tail`, `bfs`, `hamilton`).
2. A tanuló módszerek közül a **NEAT** adta a legjobb kompromisszumot, de még nem éri el a top heurisztikákat.
3. A jelenlegi **PPO** és főleg **DQN** modell benchmarkon alulteljesít (erős starvation jelleg).
4. Tudományos szempontból ez értékes eredmény: jól mutatja, hogy azonos környezetben a módszertani paradigma (kézzel tervezett heurisztika vs RL vs neuroevolution) erősen befolyásolja a végeredményt.

---

## 7. Következő lépés a webes statisztika oldal felé

A mostani JSON output (`strategy_benchmark_*.json`) már jó API-forrás a későbbi statisztika oldalhoz.

Javasolt architektúra:

- Backend endpoint (pl. FastAPI):
  - `/api/benchmark/summary` -> `strategy_benchmark_summary.json`
  - `/api/benchmark/strategy/{name}` -> `strategy_benchmark_<name>.json`
- Frontend:
  - score bar chart,
  - death stacked chart,
  - strategy selector + boxplot.

Így a szakdolgozati ábrák és a webes dashboard ugyanarra az adatforrásra épülhetnek.

