# Benchmark – MI stratégiák mérése (spec 7.11, 7.15)

Fix seed-del N futás, metrikák: átlag/medián pont és lépésszám, halálok megoszlása, „első étel” elérési arány.

## Futtatás

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
