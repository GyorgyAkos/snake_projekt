#!/usr/bin/env python3
"""
Egységes benchmark: tetszőleges stratégia (heurisztikák + DQN + PPO + NEAT) mérése.

N futás fix seed-sorozattal, metrikák:
- score_mean, score_median
- steps_mean, steps_median
- death_counts (wall/self/max_steps)
- reached_first_food (%)

Futtatás (projekt gyökeréből):
  python benchmarks/run_strategy_benchmark.py --runs 200 --strategies astar,hamilton,greedy,dqn,ppo,neuroevolution
"""
import json
import random
import sys
from pathlib import Path
from typing import Iterable

# ai_service csomag eléréséhez (src szülője)
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from ai_service.src.state import GameState, DELTA, OPPOSITE  # type: ignore[import]
from ai_service.src.strategies import STRATEGIES  # type: ignore[import]

Direction = str  # "Up" | "Right" | "Down" | "Left"


def create_initial_state(rows: int, cols: int, seed: int) -> GameState:
    """Kezdő állapot: kígyó középen 3 hosszal, jobbra; étel üres cellában."""
    rng = random.Random(seed)
    cy, cx = rows // 2, cols // 2
    snake = [(cx, cy), (cx - 1, cy), (cx - 2, cy)]
    body_set = set(snake)
    empty = [(c, r) for r in range(rows) for c in range(cols) if (c, r) not in body_set]
    if not empty:
        food = None
    else:
        food = empty[rng.randint(0, len(empty) - 1)]
    return GameState(
        snake=snake,
        direction="Right",
        food=food,
        rows=rows,
        cols=cols,
        seed=seed,
        tick=0,
        score=0,
    )


def place_food(state: GameState, rng: random.Random) -> tuple[int, int] | None:
    body_set = set(state.snake)
    empty = [(c, r) for r in range(state.rows) for c in range(state.cols) if (c, r) not in body_set]
    if not empty:
        return None
    return empty[rng.randint(0, len(empty) - 1)]


def step(state: GameState, direction: Direction, rng: random.Random) -> tuple[GameState, bool, str]:
    """
    Egy tick: irány alapján lépés. Vissza: (új állapot, game_over, halál_oka).
    halál_oka: "" ha még fut, "wall" | "self" ha vége.
    """
    head = state.head
    dx, dy = DELTA.get(direction, (1, 0))
    nx, ny = head[0] + dx, head[1] + dy
    if not state.in_bounds(nx, ny):
        return state, True, "wall"
    next_head = (nx, ny)
    body_no_tail = set(state.snake[:-1])
    if next_head in body_no_tail:
        return state, True, "self"
    ate = state.food and next_head == state.food
    if ate:
        new_snake = [next_head] + state.snake
        new_food = place_food(
            GameState(
                snake=new_snake,
                direction=direction,
                food=None,
                rows=state.rows,
                cols=state.cols,
            ),
            rng,
        )
        new_state = GameState(
            snake=new_snake,
            direction=direction,
            food=new_food,
            rows=state.rows,
            cols=state.cols,
            seed=state.seed,
            tick=state.tick + 1,
            score=state.score + 1,
        )
    else:
        new_snake = [next_head] + state.snake[:-1]
        new_state = GameState(
            snake=new_snake,
            direction=direction,
            food=state.food,
            rows=state.rows,
            cols=state.cols,
            seed=state.seed,
            tick=state.tick + 1,
            score=state.score,
        )
    return new_state, False, ""


def run_one_game(
    strategy_key: str,
    rows: int,
    cols: int,
    seed: int,
    max_steps: int,
) -> dict:
    """Egy játék lefuttatása bármely STRATEGIES kulcsra. Vissza: score, steps, death_reason."""
    if strategy_key not in STRATEGIES:
        raise ValueError(f"Unknown strategy key: {strategy_key}")
    StrategyCtor = STRATEGIES[strategy_key]
    strategy = StrategyCtor()  # class vagy lambda → mindkettő callable
    rng = random.Random(seed)
    state = create_initial_state(rows, cols, seed)
    steps = 0
    death = ""
    last_score = state.score
    steps_since_food = 0
    # 20x20 pályán 400 lépés érdemi „éhezési” limitnek elég
    starvation_limit = 400
    while steps < max_steps:
        direction = strategy.next_move(state)
        if direction == OPPOSITE.get(state.direction):
            direction = state.direction
        state, game_over, death = step(state, direction, rng)
        steps += 1
        # Starvation detektálása: ha sok lépésen át nem nő a score,
        # befejezzük a futást, hogy a "körbe-körbe" stratégiák ne tartsák fel a benchmarkot.
        if state.score > last_score:
            last_score = state.score
            steps_since_food = 0
        else:
            steps_since_food += 1
        if steps_since_food >= starvation_limit:
            death = "starvation"
            game_over = True
        if game_over:
            break
    return {
        "score": state.score,
        "steps": steps,
        "death": death or "max_steps",
        "seed": seed,
    }


def parse_strategies(arg: str | None) -> list[str]:
    if not arg:
        # Alapértelmezett készlet: fő heurisztikák + 3 tanuló módszer
        return [
            "greedy",
            "max_safety",
            "hamilton",
            "astar",
            "dqn",
            "ppo",
            "neuroevolution",
        ]
    parts = [s.strip() for s in arg.split(",") if s.strip()]
    return parts


def benchmark_strategies(
    strategy_keys: Iterable[str],
    runs: int,
    rows: int,
    cols: int,
    max_steps: int,
    seed_base: int,
    out_dir: Path,
) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    all_results: dict[str, dict] = {}
    for name in strategy_keys:
        if name not in STRATEGIES:
            print(f"Skipping unknown strategy key: {name}")
            continue
        print(f"Running benchmark for strategy '{name}' with {runs} runs...")
        runs_list = []
        for i in range(runs):
            seed = seed_base + i
            r = run_one_game(name, rows, cols, seed, max_steps)
            runs_list.append(r)
        scores = [r["score"] for r in runs_list]
        steps_list = [r["steps"] for r in runs_list]
        deaths: dict[str, int] = {}
        for r in runs_list:
            d = r["death"]
            deaths[d] = deaths.get(d, 0) + 1
        summary = {
            "strategy": name,
            "runs": runs,
            "rows": rows,
            "cols": cols,
            "max_steps": max_steps,
            "seed_base": seed_base,
            "score_mean": sum(scores) / len(scores) if scores else 0,
            "score_median": sorted(scores)[len(scores) // 2] if scores else 0,
            "steps_mean": sum(steps_list) / len(steps_list) if steps_list else 0,
            "steps_median": sorted(steps_list)[len(steps_list) // 2] if steps_list else 0,
            "death_counts": deaths,
            "reached_first_food": sum(1 for s in scores if s >= 1) / len(scores) * 100 if scores else 0,
        }
        all_results[name] = {"summary": summary, "runs": runs_list}
        out_file = out_dir / f"strategy_benchmark_{name}.json"
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump({"summary": summary, "runs": runs_list}, f, indent=2, ensure_ascii=False)
        print(
            f"{name}: score mean={summary['score_mean']:.2f}, "
            f"median={summary['score_median']}, "
            f"steps mean={summary['steps_mean']:.1f}, "
            f"first_food%={summary['reached_first_food']:.1f}%"
        )
    summary_file = out_dir / "strategy_benchmark_summary.json"
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump({k: v["summary"] for k, v in all_results.items()}, f, indent=2, ensure_ascii=False)
    print(f"Summary written to {summary_file}")


def main() -> int:
    import argparse

    p = argparse.ArgumentParser(description="Snake strategy benchmark (heuristics + RL/NEAT)")
    p.add_argument("--runs", type=int, default=200, help="Futások száma stratégiánként")
    p.add_argument("--rows", type=int, default=20)
    p.add_argument("--cols", type=int, default=20)
    p.add_argument("--max-steps", type=int, default=5000)
    p.add_argument(
        "--strategies",
        type=str,
        default=None,
        help="Vesszővel elválasztott STRATEGIES kulcsok (pl. 'greedy,hamilton,dqn,ppo,neuroevolution'). "
        "Ha nincs megadva, egy alapértelmezett készlet fut (greedy, max_safety, hamilton, astar, dqn, ppo, neuroevolution).",
    )
    p.add_argument("--seed-base", type=int, default=42)
    p.add_argument("--out-dir", type=Path, default=ROOT / "benchmarks" / "results")
    args = p.parse_args()

    strategy_keys = parse_strategies(args.strategies)
    benchmark_strategies(
        strategy_keys=strategy_keys,
        runs=args.runs,
        rows=args.rows,
        cols=args.cols,
        max_steps=args.max_steps,
        seed_base=args.seed_base,
        out_dir=args.out_dir,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())

