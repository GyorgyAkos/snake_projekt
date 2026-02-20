#!/usr/bin/env python3
"""
Benchmark: N futás fix seed-del, A* és Hamilton stratégiák (spec 7.11, 7.15).
Metrikák: átlag/medián pont, túlélési lépésszám, halálok megoszlása.
"""
import json
import random
import sys
from pathlib import Path

# ai_service csomag eléréséhez (src szülője)
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from ai_service.src.state import GameState, DELTA, OPPOSITE
from ai_service.src.strategies import AStarStrategy, HamiltonianStrategy

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


def step(
    state: GameState, direction: Direction, rng: random.Random
) -> tuple[GameState, bool, str]:
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
    strategy_name: str,
    rows: int,
    cols: int,
    seed: int,
    max_steps: int,
) -> dict:
    """Egy játék lefuttatása. Vissza: score, steps, death_reason."""
    if strategy_name == "hamilton":
        strategy = HamiltonianStrategy()
    else:
        strategy = AStarStrategy(safety=True)
    rng = random.Random(seed)
    state = create_initial_state(rows, cols, seed)
    steps = 0
    death = ""
    while steps < max_steps:
        direction = strategy.next_move(state)
        if direction == OPPOSITE.get(state.direction):
            direction = state.direction
        state, game_over, death = step(state, direction, rng)
        steps += 1
        if game_over:
            break
    return {
        "score": state.score,
        "steps": steps,
        "death": death or "max_steps",
        "seed": seed,
    }


def main():
    import argparse
    p = argparse.ArgumentParser(description="Snake MI benchmark")
    p.add_argument("--runs", type=int, default=100, help="Futások száma")
    p.add_argument("--rows", type=int, default=20)
    p.add_argument("--cols", type=int, default=20)
    p.add_argument("--max-steps", type=int, default=5000)
    p.add_argument("--strategy", choices=["astar", "hamilton", "both"], default="both")
    p.add_argument("--seed-base", type=int, default=42)
    p.add_argument("--out-dir", type=Path, default=ROOT / "benchmarks" / "results")
    args = p.parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)
    strategies = ["astar", "hamilton"] if args.strategy == "both" else [args.strategy]
    all_results = {}
    for name in strategies:
        runs = []
        for i in range(args.runs):
            seed = args.seed_base + i
            r = run_one_game(name, args.rows, args.cols, seed, args.max_steps)
            runs.append(r)
        scores = [r["score"] for r in runs]
        steps_list = [r["steps"] for r in runs]
        deaths = {}
        for r in runs:
            d = r["death"]
            deaths[d] = deaths.get(d, 0) + 1
        summary = {
            "strategy": name,
            "runs": args.runs,
            "rows": args.rows,
            "cols": args.cols,
            "max_steps": args.max_steps,
            "seed_base": args.seed_base,
            "score_mean": sum(scores) / len(scores) if scores else 0,
            "score_median": sorted(scores)[len(scores) // 2] if scores else 0,
            "steps_mean": sum(steps_list) / len(steps_list) if steps_list else 0,
            "steps_median": sorted(steps_list)[len(steps_list) // 2] if steps_list else 0,
            "death_counts": deaths,
            "reached_first_food": sum(1 for s in scores if s >= 1) / len(scores) * 100 if scores else 0,
        }
        all_results[name] = {"summary": summary, "runs": runs}
        out_file = args.out_dir / f"benchmark_{name}.json"
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump({"summary": summary, "runs": runs}, f, indent=2, ensure_ascii=False)
        print(f"{name}: score mean={summary['score_mean']:.1f} median={summary['score_median']}, first_food%={summary['reached_first_food']:.1f}%")
    summary_file = args.out_dir / "benchmark_summary.json"
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump({k: v["summary"] for k, v in all_results.items()}, f, indent=2, ensure_ascii=False)
    print(f"Summary written to {summary_file}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
